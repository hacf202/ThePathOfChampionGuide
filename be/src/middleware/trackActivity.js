import kv from "../utils/redis.js";
import crypto from "crypto";

/**
 * Middleware để theo dõi hoạt động người dùng và lượt xem trang
 */
export const trackActivity = async (req, res, next) => {
	// Không track các yêu cầu admin hoặc static/media để tránh nhiễu số liệu
	if (req.path.startsWith("/api/admin") || req.path.startsWith("/api/checkheal")) {
		return next();
	}

	try {
		if (!kv) return next();

		// 1. Định danh người dùng (User ID nếu đã login, hoặc Hash của IP + UA)
		const userIdentifier = req.user?.sub || 
			crypto.createHash("md5").update(`${req.ip}-${req.headers["user-agent"]}`).digest("hex");

		const now = Date.now();
		const pipeline = kv.pipeline();

		// 2. Cập nhật danh sách người dùng Online (Sử dụng Sorted Set)
		// Thành viên là userIdentifier, score là timestamp hiện tại
		pipeline.zadd("poc:analytics:active_users", now, userIdentifier);
		
		// 3. Tăng số lượt xem trang
		// Chỉ track các route GET (thường là xem trang)
		if (req.method === "GET") {
			// Track tổng lượt xem
			pipeline.hincrby("poc:analytics:views", "total", 1);
			
			// Track chi tiết theo path (rút gọn path nếu cần)
			// Ví dụ: /api/champions/Aatrox -> champions:detail
			let trackPath = req.path.replace("/api/", "");
			if (trackPath) {
				pipeline.hincrby("poc:analytics:views", trackPath, 1);
			}
		}

		// Thực thi pipeline
		await pipeline.exec();

	} catch (error) {
		// Log lỗi nhưng không chặn request của người dùng
		console.error("[TrackActivity] Error:", error);
	}

	next();
};

export default trackActivity;
