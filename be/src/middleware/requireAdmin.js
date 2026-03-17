// src/middleware/requireAdmin.js
import { authenticateCognitoToken } from "./authenticate.js";

export const requireAdmin = async (req, res, next) => {
	// Gọi middleware xác thực token trước
	authenticateCognitoToken(req, res, () => {
		const groups = req.user["cognito:groups"] || [];
		if (!groups.includes("admin")) {
			return res
				.status(403)
				.json({ error: "Truy cập bị từ chối: Yêu cầu quyền admin" });
		}
		next();
	});
};
