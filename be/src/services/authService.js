// src/services/authService.js
import {
	ForgotPasswordCommand,
	ConfirmForgotPasswordCommand,
	AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../config/cognito.js";

const COGNITO_APP_CLIENT_ID = process.env.COGNITO_APP_CLIENT_ID;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

export const authService = {
	forgotPassword: async (username, email) => {
		// Verify if user exists and email matches
		const getUserCmd = new AdminGetUserCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: username,
		});
		const { UserAttributes } = await cognitoClient.send(getUserCmd);
		const userEmail = UserAttributes.find(a => a.Name === "email")?.Value;

		if (email && userEmail && userEmail.toLowerCase() !== email.toLowerCase()) {
			const error = new Error("Tài khoản hoặc email không chính xác");
			error.statusCode = 400;
			throw error;
		}

		const command = new ForgotPasswordCommand({
			ClientId: COGNITO_APP_CLIENT_ID,
			Username: username,
		});
		await cognitoClient.send(command);
		return { message: "Mã đặt lại mật khẩu đã được gửi đến email" };
	},

	confirmPasswordReset: async (username, code, newPassword) => {
		const command = new ConfirmForgotPasswordCommand({
			ClientId: COGNITO_APP_CLIENT_ID,
			Username: username,
			ConfirmationCode: code,
			Password: newPassword,
		});
		await cognitoClient.send(command);
		return { message: "Đặt lại mật khẩu thành công" };
	},
};
