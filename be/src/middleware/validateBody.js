import { ZodError } from "zod";

/**
 * Middleware để validate request body sử dụng Zod schema.
 * Nếu dữ liệu không hợp lệ, trả về 400 Bad Request kèm chi tiết lỗi.
 * Nếu hợp lệ, req.body sẽ được thay thế bằng dữ liệu đã được validate (bao gồm cả coercion & default values).
 *
 * @param {import("zod").ZodSchema} schema - Zod schema để validate
 */
export const validateBody = (schema) => (req, res, next) => {
	const result = schema.safeParse(req.body);
	if (!result.success) {
		const messages = result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`);
		return res.status(400).json({ error: "Dữ liệu không hợp lệ.", details: messages });
	}
	req.body = result.data; // Dữ liệu đã được validate & coerce
	next();
};
