// src/middleware/authenticate.js
import { supabase } from "../config/supabase.js";

export const authenticateToken = async (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ error: "Authorization header is missing" });
	}
	const token = authHeader.split(" ")[1];
	if (!token || token === "null" || token === "undefined") {
		return res.status(401).json({ error: "Token is missing or invalid" });
	}

	try {
		const { data, error } = await supabase.auth.getUser(token);
		
		if (error || !data.user) {
			console.error("Token verification error:", error?.message);
			return res.status(403).json({ error: "Invalid or expired token" });
		}
		
		req.user = data.user;
		// Gắn sub để tương thích ngược với code cũ dùng req.user.sub
		req.user.sub = data.user.id; 
		next();
	} catch (error) {
		console.error("Token verification error:", error.message);
		return res.status(403).json({ error: "Invalid or expired token" });
	}
};

// alias cho code cũ đỡ bị lỗi nếu còn import ở đâu đó
export const authenticateCognitoToken = authenticateToken;
