// src/middleware/requireAdmin.js

export const requireAdmin = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ error: "Token verification required" });
	}

	// Supabase custom claims (metadata) hoặc tương thích Cognito
	const groups = req.user.app_metadata?.groups || req.user.user_metadata?.groups || req.user["cognito:groups"] || [];
	if (!groups.includes("admin")) {
		return res
			.status(403)
			.json({ error: "Truy cập bị từ chối: Yêu cầu quyền admin" });
	}
	next();
};
