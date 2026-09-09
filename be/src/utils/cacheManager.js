import NodeCache from "node-cache";
import kv from "./redis.js";
import { gzip, gunzip } from "zlib";
import util from "util";

const gzipAsync = util.promisify(gzip);
const gunzipAsync = util.promisify(gunzip);

/**
 * cacheRegistry - Lưu trữ tất cả các instance cache đã được tạo để quản lý tập trung.
 * Đối với Redis, chúng ta dùng prefix key để phân biệt các namespace.
 * @type {Map<string, NodeCache>}
 */
const cacheRegistry = new Map();

/**
 * Lớp Wrapper để bọc NodeCache hoặc Redis, cung cấp interface async đồng nhất.
 */
class AsyncCache {
	constructor(name, options) {
		this.name = name;
		this.options = options;
		// useClones: false rất quan trọng để không block Node.js Event Loop khi clone JSON 2MB
		this.localCache = new NodeCache({ ...options, useClones: false });
		// Kiểm tra Redis động
		Object.defineProperty(this, 'useRedis', { get: () => !!kv });
		// Chống Cache Stampede (Dogpile Effect)
		this.pendingPromises = new Map();
	}

	/**
	 * Tạo prefix cho key trong Redis để tránh xung đột namespace
	 */
	_getRedisKey(key) {
		return `poc:${this.name}:${key}`;
	}

	async get(key) {
		// 1. Kiểm tra L1 (Local Cache - RAM) trước tiên, độ trễ 0ms
		const localVal = this.localCache.get(key);
		if (localVal !== undefined) {
			return localVal;
		}

		// 2. Nếu có request khác đang tải key này, đợi ké (Chống Stampede)
		if (this.pendingPromises.has(key)) {
			return this.pendingPromises.get(key);
		}

		// 3. Nếu L1 không có, tiến hành lấy từ L2 (Redis)
		const fetchPromise = (async () => {
			if (this.useRedis) {
				try {
					const val = await kv.getBuffer(this._getRedisKey(key));
					if (val) {
						let parsedResult;
						try {
							// Thử giải nén (với dữ liệu mới) bất đồng bộ để không block event loop
							const decompressedBuf = await gunzipAsync(val);
							const decompressed = decompressedBuf.toString("utf-8");
							parsedResult = JSON.parse(decompressed);
						} catch (e) {
							// Nếu lỗi giải nén, fallback về dữ liệu cũ (chưa nén)
							const strVal = val.toString("utf-8");
							try {
								parsedResult = JSON.parse(strVal);
							} catch (e2) {
								parsedResult = strVal;
							}
						}
						
						// Lưu lại vào L1 (Local Cache) để sử dụng cho lần sau
						this.localCache.set(key, parsedResult, this.options.stdTTL);
						return parsedResult;
					}
				} catch (error) {
					console.error(`[Cache:${this.name}] Redis GET error:`, error);
				}
			}
			return null;
		})();

		this.pendingPromises.set(key, fetchPromise);
		try {
			const result = await fetchPromise;
			return result;
		} finally {
			this.pendingPromises.delete(key);
		}
	}

	async set(key, value, ttl) {
		const finalTTL = ttl || this.options.stdTTL;
		if (this.useRedis) {
			try {
				const stringVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
				// Nén bất đồng bộ để tối ưu hiệu suất Node.js event loop
				const compressedVal = await gzipAsync(stringVal);
				await kv.set(this._getRedisKey(key), compressedVal, "EX", finalTTL);
			} catch (error) {
				console.error(`[Cache:${this.name}] Redis SET error:`, error.message);
                if (error.message.includes("OOM")) {
                    console.error(`[Cache:${this.name}] Lỗi tràn bộ nhớ Redis! Dữ liệu sẽ chỉ được lưu trên Local Cache.`);
                }
			}
		}
		return this.localCache.set(key, value, finalTTL);
	}

	async del(key) {
		if (this.useRedis) {
			try {
				await kv.del(this._getRedisKey(key));
			} catch (error) {
				console.error(`[Cache:${this.name}] Redis DEL error:`, error);
			}
		}
		return this.localCache.del(key);
	}

	async flushAll() {
		if (this.useRedis) {
			try {
				const pattern = `${this._getRedisKey("")}*`;
				let cursor = "0";
				do {
					const [nextCursor, keys] = await kv.scan(cursor, "MATCH", pattern, "COUNT", 100);
					cursor = nextCursor;
					if (keys.length > 0) {
						await kv.del(...keys);
					}
				} while (cursor !== "0");
				console.log(`[Cache:${this.name}] Redis cache flushed for pattern: ${pattern}`);
			} catch (error) {
				console.error(`[Cache:${this.name}] Redis FLUSH error:`, error);
			}
		}
		return this.localCache.flushAll();
	}

	getStats() {
		return {
			...this.localCache.getStats(),
			type: this.useRedis ? "Redis + Local" : "Local only",
			name: this.name
		};
	}

	keys() {
		return this.localCache.keys();
	}

	/**
	 * Đếm số key trên Redis cho namespace này
	 */
	async countRedisKeys() {
		if (!this.useRedis) return this.localCache.keys().length;
		try {
			const pattern = `${this._getRedisKey("")}*`;
			let cursor = "0";
			let count = 0;
			do {
				const [nextCursor, keys] = await kv.scan(cursor, "MATCH", pattern, "COUNT", 100);
				cursor = nextCursor;
				count += keys.length;
			} while (cursor !== "0");
			return count;
		} catch (error) {
			console.error(`[Cache:${this.name}] Redis COUNT error:`, error);
			return this.localCache.keys().length;
		}
	}
}

/**
 * Lấy hoặc tạo mới một instance cache và đăng ký nó vào hệ thống quản lý.
 * @param {string} name - Tên định danh cho cache (ví dụ: 'cards', 'champions')
 * @param {Object} options - Cấu hình cho NodeCache (mặc định TTL 30 phút)
 * @returns {AsyncCache}
 */
export const getOrCreateCache = (name, options = { stdTTL: 1800, checkperiod: 60 }) => {
	if (cacheRegistry.has(name)) {
		return cacheRegistry.get(name);
	}
	
	const cache = new AsyncCache(name, options);
	cacheRegistry.set(name, cache);
	
	console.log(`[CacheManager] Registered AsyncCache: "${name}" | Redis: ${cache.useRedis}`);
	
	return cache;
};

/**
 * Xóa sạch toàn bộ dữ liệu trong tất cả các cache đã đăng ký.
 */
export const flushAllCaches = async () => {
	const flushedNames = [];
	for (const [name, cache] of cacheRegistry.entries()) {
		await cache.flushAll();
		flushedNames.push(name);
	}
	return flushedNames;
};

/**
 * Xóa sạch dữ liệu của một cache cụ thể.
 */
export const flushCache = async (name) => {
	if (cacheRegistry.has(name)) {
		const cache = cacheRegistry.get(name);
		await cache.flushAll();
		return true;
	}
	return false;
};

/**
 * Lấy danh sách tên các cache đang hoạt động.
 */
export const getStats = async () => {
	const stats = [];
	for (const [name, cache] of cacheRegistry.entries()) {
		const keyCount = await cache.countRedisKeys();
		stats.push({
			name,
			keys: keyCount,
			stats: cache.getStats()
		});
	}
	return stats;
};

const cacheManager = {
	getOrCreateCache,
	flushAllCaches,
	flushCache,
	getStats
};

export default cacheManager;
