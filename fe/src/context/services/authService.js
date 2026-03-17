// src/services/authService.js
import { cognitoApiRequest, backendApiRequest } from "./apiHelper.js";

const CLIENT_ID = import.meta.env.VITE_COGNITO_APP_CLIENT_ID;

// --- Các hàm gọi trực tiếp tới Cognito ---

export const signUp = (username, email, password) => {
	return cognitoApiRequest("AWSCognitoIdentityProviderService.SignUp", {
		ClientId: CLIENT_ID,
		Username: username,
		Password: password,
		UserAttributes: [
			{ Name: "email", Value: email },
			{ Name: "name", Value: "Vô Danh" },
		],
	});
};

export const confirmSignUp = (username, code) => {
	return cognitoApiRequest("AWSCognitoIdentityProviderService.ConfirmSignUp", {
		ClientId: CLIENT_ID,
		Username: username,
		ConfirmationCode: code,
	});
};

// Đăng nhập → trả về cả 3 token
export const initiateAuth = (username, password) => {
	return cognitoApiRequest("AWSCognitoIdentityProviderService.InitiateAuth", {
		AuthFlow: "USER_PASSWORD_AUTH",
		ClientId: CLIENT_ID,
		AuthParameters: { USERNAME: username, PASSWORD: password },
	});
};

// Làm mới token bằng RefreshToken
export const refreshToken = refreshToken => {
	return cognitoApiRequest("AWSCognitoIdentityProviderService.InitiateAuth", {
		AuthFlow: "REFRESH_TOKEN_AUTH",
		ClientId: CLIENT_ID,
		AuthParameters: { REFRESH_TOKEN: refreshToken },
	});
};

export const resendConfirmationCode = username => {
	return cognitoApiRequest(
		"AWSCognitoIdentityProviderService.ResendConfirmationCode",
		{
			ClientId: CLIENT_ID,
			Username: username,
		}
	);
};

export const confirmPasswordReset = (username, code, newPassword) => {
	return backendApiRequest("/api/auth/confirm-password-reset", "POST", {
		username,
		code,
		newPassword,
	});
};

// --- Các hàm gọi tới Backend của bạn ---

// src/services/authService.js
export const forgotPassword = (username, email) => {
	return backendApiRequest(
		"/api/auth/forgot-password", // ĐÃ ĐỔI
		"POST",
		{ username, email }
	);
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
