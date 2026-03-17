// src/middleware/authenticate.js
import { verifier } from "../config/cognito.js";

export const authenticateCognitoToken = async (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ error: "Authorization header is missing" });
	}
	const token = authHeader.split(" ")[1];
	if (!token || token === "null" || token === "undefined") {
		return res.status(401).json({ error: "Token is missing or invalid" });
	}

	try {
		const payload = await verifier.verify(token);
		req.user = payload;
		next();
	} catch (error) {
		console.error("Token verification error:", error.message);
		return res.status(403).json({ error: "Invalid or expired token" });
	}
};
