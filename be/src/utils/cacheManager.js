import NodeCache from "node-cache";

/**
 * cacheRegistry - Lưu trữ tất cả các instance cache đã được tạo để quản lý tập trung.
 * @type {Map<string, NodeCache>}
 */
const cacheRegistry = new Map();

/**
 * Lấy hoặc tạo mới một instance cache và đăng ký nó vào hệ thống quản lý.
 * @param {string} name - Tên định danh cho cache (ví dụ: 'cards', 'champions')
 * @param {Object} options - Cấu hình cho NodeCache (mặc định TTL 30 phút)
 * @returns {NodeCache}
 */
export const getOrCreateCache = (name, options = { stdTTL: 1800, checkperiod: 60 }) => {
	if (cacheRegistry.has(name)) {
		return cacheRegistry.get(name);
	}
	
	const cache = new NodeCache(options);
	cacheRegistry.set(name, cache);
	
	console.log(`[CacheManager] Registered cache: "${name}" with TTL ${options.stdTTL}s`);
	
	return cache;
};

/**
 * Xóa sạch toàn bộ dữ liệu trong tất cả các cache đã đăng ký.
 * @returns {Promise<string[]>} Danh sách các cache đã được làm sạch.
 */
export const flushAllCaches = async () => {
	const flushedNames = [];
	
	for (const [name, cache] of cacheRegistry.entries()) {
		cache.flushAll();
		flushedNames.push(name);
		console.log(`[CacheManager] Flushed cache: "${name}"`);
	}
	
	return flushedNames;
};

/**
 * Xóa sạch dữ liệu của một cache cụ thể.
 * @param {string} name - Tên cache cần xóa.
 * @returns {boolean} True nếu xóa thành công, false nếu không tìm thấy cache.
 */
export const flushCache = (name) => {
	if (cacheRegistry.has(name)) {
		const cache = cacheRegistry.get(name);
		cache.flushAll();
		console.log(`[CacheManager] Flushed specific cache: "${name}"`);
		return true;
	}
	return false;
};

/**
 * Lấy danh sách tên các cache đang hoạt động.
 * @returns {string[]}
 */
export const getStats = () => {
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
