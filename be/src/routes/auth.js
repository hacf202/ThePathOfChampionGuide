// src/routes/auth.js
import express from "express";
import {
	ForgotPasswordCommand,
	ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../config/cognito.js";

const router = express.Router();
const COGNITO_APP_CLIENT_ID = process.env.COGNITO_APP_CLIENT_ID;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

// POST /api/auth/forgot-password (HỖ TRỢ EMAIL - BẢO MẬT + UX)
router.post("/forgot-password", async (req, res) => {
	const { username, email } = req.body;
	if (!username) {
		return res.status(400).json({ error: "Username is required" });
	}

	try {
		// Kiểm tra user tồn tại + email khớp
		const getUserCmd = new AdminGetUserCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: username,
		});
		const { UserAttributes } = await cognitoClient.send(getUserCmd);
		const userEmail = UserAttributes.find(a => a.Name === "email")?.Value;

		if (email && userEmail && userEmail.toLowerCase() !== email.toLowerCase()) {
			return res
				.status(400)
				.json({ error: "Tài khoản hoặc email không chính xác" });
		}

		const command = new ForgotPasswordCommand({
			ClientId: COGNITO_APP_CLIENT_ID,
			Username: username,
		});
		await cognitoClient.send(command);
		res.json({ message: "Mã đặt lại mật khẩu đã được gửi đến email" });
	} catch (error) {
		if (error.name === "UserNotFoundException") {
			return res
				.status(404)
				.json({ error: "Tài khoản hoặc email không chính xác" });
		}
		console.error("Forgot password error:", error);
		res.status(500).json({ error: "Không thể xử lý yêu cầu" });
	}
});

// POST /api/auth/confirm-password-reset
router.post("/confirm-password-reset", async (req, res) => {
	const { username, code, newPassword } = req.body;
	if (!username || !code || !newPassword) {
		return res.status(400).json({ error: "Thiếu thông tin cần thiết" });
	}

	try {
		const command = new ConfirmForgotPasswordCommand({
			ClientId: COGNITO_APP_CLIENT_ID,
			Username: username,
			ConfirmationCode: code,
			Password: newPassword,
		});
		await cognitoClient.send(command);
		res.json({ message: "Đặt lại mật khẩu thành công" });
	} catch (error) {
		console.error("Confirm reset error:", error);
		res
			.status(400)
			.json({ error: error.message || "Mã OTP không hợp lệ hoặc đã hết hạn" });
	}
});

export default router;
