// src/routes/auth.js
import express from "express";
import { z } from "zod";
import { authService } from "../services/authService.js";

const router = express.Router();

// Validation Schemas
const forgotPasswordSchema = z.object({
	username: z.string().min(1, "Username is required"),
	email: z.string().email("Email is invalid").optional(),
});

const confirmPasswordSchema = z.object({
	username: z.string().min(1, "Username is required"),
	code: z.string().length(6, "OTP code must be 6 digits"),
	newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res, next) => {
	try {
		const { username, email } = forgotPasswordSchema.parse(req.body);
		const result = await authService.forgotPassword(username, email);
		res.json(result);
	} catch (error) {
		if (error.name === "UserNotFoundException") {
			return res
				.status(404)
				.json({ error: "Tài khoản hoặc email không chính xác" });
		}
		next(error);
	}
});

// POST /api/auth/confirm-password-reset
router.post("/confirm-password-reset", async (req, res, next) => {
	try {
		const { username, code, newPassword } = confirmPasswordSchema.parse(req.body);
		const result = await authService.confirmPasswordReset(username, code, newPassword);
		res.json(result);
	} catch (error) {
		next(error);
	}
});

export default router;
