import express from "express";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import cacheManager from "../utils/cacheManager.js";
import kv from "../utils/redis.js";

const router = express.Router();

/**
 * @route   DELETE /api/admin/cache/clear-all
 * @desc    Xóa toàn bộ cache của server
 * @access  Private (Admin only)
 */
router.delete("/clear-all", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		const flushedCaches = await cacheManager.flushAllCaches();
		
		res.status(200).json({
			message: "Tất cả cache đã được làm sạch thành công",
			count: flushedCaches.length,
			caches: flushedCaches,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error("[AdminCache] Error clearing caches:", error);
		res.status(500).json({
			error: "Lỗi hệ thống khi xóa cache",
			details: error.message
		});
	}
});

/**
 * @route   DELETE /api/admin/cache/clear/:name
 * @desc    Xóa một cache cụ thể theo tên
 * @access  Private (Admin only)
 */
router.delete("/clear/:name", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		const { name } = req.params;
		const success = await cacheManager.flushCache(name);
		
		if (success) {
			res.status(200).json({
				message: `Cache "${name}" đã được làm sạch thành công`,
				name,
				timestamp: new Date().toISOString()
			});
		} else {
			res.status(404).json({
				error: "Không tìm thấy cache mong muốn",
				name
			});
		}
	} catch (error) {
		console.error(`[AdminCache] Error clearing cache "${req.params.name}":`, error);
		res.status(500).json({
			error: "Lỗi hệ thống khi xóa cache",
			details: error.message
		});
	}
});

/**
 * @route   GET /api/admin/cache/stats
 * @desc    Lấy thông tin các cache đang hoạt động
 * @access  Private (Admin only)
 */
router.get("/stats", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		const stats = await cacheManager.getStats();
		res.status(200).json(stats);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

/**
 * @route   GET /api/admin/cache/redis-info
 * @desc    Lấy thông tin chi tiết từ server Redis
 * @access  Private (Admin only)
 */
router.get("/redis-info", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		if (!kv) {
			return res.status(200).json({ 
				connected: false, 
				message: "Redis không được cấu hình hoặc đang sử dụng memory fallback" 
			});
		}

		const info = await kv.info();
		// Phân tích chuỗi info từ Redis thành object
		const lines = info.split("\r\n");
		const infoObj = {};
		lines.forEach(line => {
			if (line && !line.startsWith("#")) {
				const parts = line.split(":");
				if (parts.length === 2) {
					infoObj[parts[0]] = parts[1];
				}
			}
		});

		res.status(200).json({
			connected: true,
			version: infoObj.redis_version,
			uptime: infoObj.uptime_in_seconds,
			memory: infoObj.used_memory_human,
			clients: infoObj.connected_clients,
			raw: infoObj
		});
	} catch (error) {
		console.error("[AdminCache] Error fetching Redis info:", error);
		res.status(500).json({ error: error.message });
	}
});

/**
 * @route   GET /api/admin/cache/redis-keys
 * @desc    Quét danh sách các key trong Redis
 * @access  Private (Admin only)
 */
router.get("/redis-keys", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		if (!kv) {
			return res.status(200).json({ keys: [] });
		}

		const { pattern = "*" } = req.query;
		
		// Sử dụng SCAN thay vì KEYS để tránh treo server nếu data lớn
		let cursor = "0";
		const allKeys = new Set();
		
		// Giới hạn quét tối đa để tránh loop quá lâu trong 1 request
		let iterations = 0;
		do {
			const [nextCursor, keys] = await kv.scan(cursor, "MATCH", pattern, "COUNT", 100);
			cursor = nextCursor;
			keys.forEach(k => allKeys.add(k));
			iterations++;
		} while (cursor !== "0" && iterations < 100);

		res.status(200).json({ 
			keys: Array.from(allKeys).sort(),
			truncated: cursor !== "0"
		});
	} catch (error) {
		console.error("[AdminCache] Error scanning Redis keys:", error);
		res.status(500).json({ error: error.message });
	}
});

/**
 * @route   DELETE /api/admin/cache/redis-key/:key
 * @desc    Xóa một key cụ thể khỏi Redis
 * @access  Private (Admin only)
 */
router.delete("/redis-key/:key", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		if (!kv) {
			return res.status(400).json({ error: "Redis không hoạt động" });
		}

		const { key } = req.params;
		await kv.del(key);
		
		res.status(200).json({ message: `Key "${key}" đã được xóa khỏi Redis` });
	} catch (error) {
		console.error("[AdminCache] Error deleting Redis key:", error);
		res.status(500).json({ error: error.message });
	}
});

export default router;
