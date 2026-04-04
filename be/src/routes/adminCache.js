import express from "express";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import cacheManager from "../utils/cacheManager.js";

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
		const success = cacheManager.flushCache(name);
		
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
router.get("/stats", authenticateCognitoToken, requireAdmin, (req, res) => {
	try {
		const stats = cacheManager.getStats();
		res.status(200).json(stats);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
