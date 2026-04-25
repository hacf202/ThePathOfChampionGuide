import NodeCache from "node-cache";
import kv from "./redis.js";

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
		this.localCache = new NodeCache(options);
		this.useRedis = !!kv;
	}

	/**
	 * Tạo prefix cho key trong Redis để tránh xung đột namespace
	 */
	_getRedisKey(key) {
		return `poc:${this.name}:${key}`;
	}

	async get(key) {
		if (this.useRedis) {
			try {
				const val = await kv.get(this._getRedisKey(key));
				if (val) {
					try {
						return JSON.parse(val);
					} catch (e) {
						return val; // Nếu không parse được thì trả về string
					}
				}
				return null;
			} catch (error) {
				console.error(`[Cache:${this.name}] Redis GET error:`, error);
			}
		}
		return this.localCache.get(key);
	}

	async set(key, value, ttl) {
		const finalTTL = ttl || this.options.stdTTL;
		if (this.useRedis) {
			try {
				const stringVal = typeof value === 'object' ? JSON.stringify(value) : value;
				await kv.set(this._getRedisKey(key), stringVal, "EX", finalTTL);
			} catch (error) {
				console.error(`[Cache:${this.name}] Redis SET error:`, error);
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
				// Lưu ý: Vercel KV không có flushAll cho từng namespace dễ dàng, 
				// chúng ta phải scan keys hoặc xóa thủ công nếu cần.
				// Ở đây tạm thời flush cục bộ và log cảnh báo.
				console.warn(`[Cache:${this.name}] flushAll called. Global Redis flush is not scoped to namespace.`);
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
		stats.push({
			name,
			keys: cache.keys().length,
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
