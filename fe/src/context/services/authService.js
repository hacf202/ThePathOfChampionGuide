// src/services/authService.js
import { backendApiRequest } from "./apiHelper.js";

// --- Các hàm gọi tới Backend của bạn ---

export const signUp = (email, password, username, displayName) => {
	return backendApiRequest("/api/auth/register", "POST", {
		email,
		password,
		username,
		name: displayName
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

export const resetPassword = (newPassword, token) => {
	return backendApiRequest("/api/auth/reset-password-link", "POST", {
		newPassword
	}, token);
};

export const refreshSession = (refreshToken) => {
	return backendApiRequest("/api/auth/refresh", "POST", {
		refreshToken
	});
};
