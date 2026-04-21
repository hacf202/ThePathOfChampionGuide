// src/middleware/errorMiddleware.js
import logger from "../utils/logger.js";

// ─────────────────────────────────────────────────────────────
// AppError - Lỗi có cấu trúc với statusCode tùy chỉnh
// Dùng để ném lỗi có ngữ nghĩa từ bất kỳ route nào.
//
// Ví dụ:
//   throw new AppError("Không tìm thấy Boss.", 404);
//   throw new AppError("Tham số không hợp lệ.", 400);
// ─────────────────────────────────────────────────────────────
export class AppError extends Error {
	/**
	 * @param {string} message - Thông điệp lỗi
	 * @param {number} [statusCode=500] - HTTP status code
	 */
	constructor(message, statusCode = 500) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true; // Phân biệt với lỗi hệ thống không mong đợi
		Error.captureStackTrace(this, this.constructor);
	}
}

// ─────────────────────────────────────────────────────────────
// asyncHandler - Bọc route handler bất đồng bộ
// Tự động bắt lỗi và truyền tới middleware errorHandler.
//
// Ví dụ:
//   router.get("/", asyncHandler(async (req, res) => {
//     const data = await someAsyncOperation();
//     res.json(data);
//   }));
// ─────────────────────────────────────────────────────────────
export const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

// ─────────────────────────────────────────────────────────────
// errorHandler - Middleware xử lý lỗi tập trung
// Phải được đăng ký CUỐI CÙNG trong Express app.
// ─────────────────────────────────────────────────────────────
export const errorHandler = (err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || "Internal Server Error";

	// Log chi tiết lỗi
	logger.error(message, {
		stack: process.env.NODE_ENV === "production" ? null : err.stack,
		path: req.path,
		method: req.method,
		statusCode,
	});

	// --- Đảm bảo CORS headers ngay cả khi có lỗi ---
	const origin = req.headers.origin;
	const allowedOrigins = [
		"https://www.pocguide.top",
		"https://pocguide.top",
		"https://guidepoc.vercel.app",
		"http://localhost:5173",
	];
	if (origin && allowedOrigins.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
		res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
		res.setHeader("Access-Control-Allow-Credentials", "true");
	}

	// Xử lý Zod validation errors
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

	// Phản hồi lỗi chuẩn
	res.status(statusCode).json({
		error: message,
		...(process.env.NODE_ENV !== "production" && { debug: err.stack }),
	});
};
