// be/scripts/confirmUser.js
import { AdminConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../src/config/cognito.js";
import dotenv from "dotenv";

dotenv.config();

const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

async function confirmUser(username) {
	if (!username) {
		console.error("Vui lòng nhập username. Ví dụ: node be/scripts/confirmUser.js <username>");
		process.exit(1);
	}

	try {
		const command = new AdminConfirmSignUpCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: username,
		});

		await cognitoClient.send(command);
		console.log(`✅ Thành công: Tài khoản "${username}" đã được xác nhận thủ công!`);
		console.log("Giờ bạn có thể đăng nhập bình thường trên trang web.");
	} catch (error) {
		console.error("❌ Lỗi khi xác nhận tài khoản:", error.message);
	}
}

// Lấy username từ đối số dòng lệnh
const username = process.argv[2];
confirmUser(username);
