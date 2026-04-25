import express from "express";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import kv from "../utils/redis.js";

const router = express.Router();

/**
 * @route   GET /api/admin/analytics/stats
 * @desc    Lấy thông tin thống kê người dùng và lượt xem
 * @access  Private (Admin only)
 */
router.get("/stats", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		if (!kv) {
			return res.status(200).json({ 
				onlineUsers: 0,
				totalViews: 0,
				topPages: [],
				message: "Redis không hoạt động" 
			});
		}

		const now = Date.now();
		const fiveMinutesAgo = now - (5 * 60 * 1000);
		
		const pipeline = kv.pipeline();

		// 1. Dọn dẹp người dùng đã offline (quá 5 phút không hoạt động)
		pipeline.zremrangebyscore("poc:analytics:active_users", 0, fiveMinutesAgo);
		
		// 2. Lấy số lượng người dùng online hiện tại
		pipeline.zcard("poc:analytics:active_users");
		
		// 3. Lấy toàn bộ số liệu lượt xem
		pipeline.hgetall("poc:analytics:views");

		const results = await pipeline.exec();
		
		const onlineUsers = results[1][1] || 0;
		const viewsData = results[2][1] || {};
		
		// Xử lý dữ liệu views
		const totalViews = parseInt(viewsData.total || 0);
		delete viewsData.total; // Xóa key total để lấy các path còn lại
		
		// Sắp xếp các trang phổ biến nhất
		const topPages = Object.entries(viewsData)
			.map(([path, count]) => ({ path, count: parseInt(count) }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10); // Lấy top 10

		res.status(200).json({
			onlineUsers,
			totalViews,
			topPages,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error("[Analytics] Error fetching stats:", error);
		res.status(500).json({ error: error.message });
	}
});

export default router;
