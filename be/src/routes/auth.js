// src/routes/auth.js
import express from "express";
import { z } from "zod";
import { authService } from "../services/authService.js";
import { supabase } from "../config/supabase.js";
import { getDb } from "../config/mongo.js";

const router = express.Router();

// Validation Schemas
const registerSchema = z.object({
	email: z.string().email("Email is invalid"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

const forgotPasswordSchema = z.object({
	email: z.string().email("Email is invalid"),
});

const confirmPasswordSchema = z.object({
	email: z.string().email("Email is invalid"),
	code: z.string().min(6, "OTP code is invalid"),
	newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
	try {
		const { email, password, name } = registerSchema.parse(req.body);

		const db = getDb();
		const usersCol = db.collection("guidePocUsers");

		// Kiểm tra trùng lặp Username
		const requestedName = name || email.split("@")[0];
		const existingUser = await usersCol.findOne({ name: requestedName });
		if (existingUser) {
			return res.status(400).json({ error: "Tên tài khoản này đã có người sử dụng. Vui lòng chọn tên khác." });
		}

		const { data, error } = await supabase.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: { name: requestedName }
		});

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		// Sync sang MongoDB
		if (data.user) {
			const db = getDb();
			const usersCol = db.collection("guidePocUsers");
			await usersCol.updateOne(
				{ _id: data.user.id },
				{
					$set: {
						email: data.user.email,
						name: name || email.split("@")[0],
						createdAt: new Date(),
					}
				},
				{ upsert: true }
			);
		}

		res.status(201).json({ message: "Đăng ký thành công", user: data.user });
	} catch (error) {
		next(error);
	}
});

const loginSchema = z.object({
	email: z.string().min(1, "Tài khoản hoặc email không được để trống"),
	password: z.string().min(1, "Mật khẩu không được để trống"),
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
	try {
		const { email: identifier, password } = loginSchema.parse(req.body);

		let targetEmail = identifier;

		// Nếu không có dấu @ -> Có thể là Username -> Tìm email trong MongoDB
		if (!identifier.includes("@")) {
			const db = getDb();
			const userRecord = await db.collection("guidePocUsers").findOne({ name: identifier });
			if (userRecord && userRecord.email) {
				targetEmail = userRecord.email;
			} else {
				return res.status(401).json({ error: "Tên tài khoản không tồn tại." });
			}
		}

		const { data, error } = await supabase.auth.signInWithPassword({
			email: targetEmail,
			password,
		});

		if (error) {
			return res.status(401).json({ error: error.message });
		}

		res.json({
			message: "Đăng nhập thành công",
			token: data.session.access_token,
			user: data.user
		});
	} catch (error) {
		next(error);
	}
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res, next) => {
	try {
		const { email } = forgotPasswordSchema.parse(req.body);
		const result = await authService.forgotPassword(email);
		res.json(result);
	} catch (error) {
		next(error);
	}
});

// POST /api/auth/confirm-password-reset
router.post("/confirm-password-reset", async (req, res, next) => {
	try {
		const { email, code, newPassword } = confirmPasswordSchema.parse(req.body);
		const result = await authService.confirmPasswordReset(email, code, newPassword);
		res.json(result);
	} catch (error) {
		next(error);
	}
});

export default router;
