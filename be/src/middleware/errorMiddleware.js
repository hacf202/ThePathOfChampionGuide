// src/middleware/errorMiddleware.js
import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || "Internal Server Error";

	// Log error details
	logger.error(message, {
		stack: process.env.NODE_ENV === "production" ? null : err.stack,
		path: req.path,
		method: req.method,
	});

	// --- Unmask CORS on Error ---
	const origin = req.headers.origin;
	const allowedOrigins = [
		"https://www.pocguide.top",
		"https://pocguide.top",
		"https://guidepoc.vercel.app",
		"http://localhost:5173"
	];

	if (origin && allowedOrigins.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
		res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
		res.setHeader("Access-Control-Allow-Credentials", "true");
	}

	// Check if it's a Zod validation error
	if (err.name === "ZodError") {
		const issues = err.issues || err.errors || [];
		return res.status(400).json({
			error: "Validation Error",
			details: issues.map(e => ({
				path: e.path.join("."),
				message: e.message,
			})),
		});
	}

	res.status(statusCode).json({
		error: message,
		// Tạm thời bật stack trace hoặc thông tin chi tiết hơn để debug Vercel
		debug: process.env.NODE_ENV === "production" ? message : err.stack,
	});
};
