// src/middleware/requireAdmin.js

export const requireAdmin = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ error: "Token verification required" });
	}

	const groups = req.user["cognito:groups"] || [];
	if (!groups.includes("admin")) {
		return res
			.status(403)
			.json({ error: "Truy cập bị từ chối: Yêu cầu quyền admin" });
	}
	next();
};
