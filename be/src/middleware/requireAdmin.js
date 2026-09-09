// src/middleware/requireAdmin.js

export const requireAdmin = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ error: "Token verification required" });
	}

	// CHỈ đọc từ app_metadata — do server/service role ghi, user không tự ghi được.
	// KHÔNG đọc user_metadata vì user có thể tự cập nhật qua Supabase client SDK.
	const groups = req.user.app_metadata?.groups || [];
	if (!groups.includes("admin")) {
		return res
			.status(403)
			.json({ error: "Truy cập bị từ chối: Yêu cầu quyền admin" });
	}
	next();
};
