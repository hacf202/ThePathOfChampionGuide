// src/services/authService.js
import { backendApiRequest } from "./apiHelper.js";

// --- Các hàm gọi tới Backend của bạn ---

export const signUp = (email, password, name) => {
	return backendApiRequest("/api/auth/register", "POST", {
		email,
		password,
		name
	});
};

// Đăng nhập
export const initiateAuth = (email, password) => {
	return backendApiRequest("/api/auth/login", "POST", {
		email,
		password,
	});
};

export const forgotPassword = (email) => {
	return backendApiRequest(
		"/api/auth/forgot-password",
		"POST",
		{ email }
	);
};

export const confirmPasswordReset = (email, code, newPassword) => {
	return backendApiRequest("/api/auth/confirm-password-reset", "POST", {
		email,
		code,
		newPassword,
	});
};

export const changeName = (newName, token) => {
	return backendApiRequest(
		"/api/user/change-name",
		"PUT",
		{ name: newName },
		token
	);
};

export const changePassword = (
	oldPassword,
	newPassword,
	accessToken,
	idToken // ← có thể dùng để xác thực thêm
) => {
	return backendApiRequest(
		"/api/user/change-password",
		"POST",
		{
			previousPassword: oldPassword, // ← Tên field đúng
			proposedPassword: newPassword, // ← Tên field đúng
			accessToken, // ← BẮT BUỘC
		},
		idToken // ← gửi ID token trong header Authorization
	);
};

export const getUserNameBySub = sub => {
	return backendApiRequest(`/api/user/info/${sub}`);
};
