// src/services/authService.js
import { supabase } from "../config/supabase.js";

export const authService = {
	forgotPassword: async (email) => {
		const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: (process.env.FRONTEND_URL || 'http://localhost:5173') + "/reset-password",
		});

		if (error) {
			const customError = new Error(error.message || "Tài khoản hoặc email không chính xác");
			customError.statusCode = 400;
			throw customError;
		}

		return { message: "Link đặt lại mật khẩu đã được gửi đến email của bạn" };
	},

	// Supabase thường dùng token từ link email thay vì mã code 6 số như Cognito
	// Tuy nhiên Supabase cũng hỗ trợ OTP code
	confirmPasswordReset: async (email, code, newPassword) => {
		// 1. Xác thực OTP
		const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
			email,
			token: code,
			type: "recovery",
		});

		if (verifyError) {
			const error = new Error("Mã xác nhận không hợp lệ hoặc đã hết hạn");
			error.statusCode = 400;
			throw error;
		}

		// 2. Cập nhật mật khẩu mới
		const { data: updateData, error: updateError } = await supabase.auth.updateUser({
			password: newPassword
		});

		if (updateError) {
			const error = new Error("Không thể đặt lại mật khẩu. Vui lòng thử lại sau.");
			error.statusCode = 400;
			throw error;
		}

		return { message: "Đặt lại mật khẩu thành công" };
	},
};
