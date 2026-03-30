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
	});
};
