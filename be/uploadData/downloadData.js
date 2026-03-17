import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// 1. Cấu hình môi trường
dotenv.config();

// Khởi tạo Client với cấu hình retry mặc định của SDK (Giống file upload)
const client = new DynamoDBClient({
	region: process.env.AWS_REGION || "us-east-1",
	maxAttempts: 10,
});

const docClient = DynamoDBDocumentClient.from(client, {
	marshallOptions: {
		removeUndefinedValues: true,
		convertEmptyValues: true,
	},
});

/**
 * Hàm chính thực hiện quét (Scan) dữ liệu từ DynamoDB và lưu ra file
 * @param {string} tableName - Tên bảng DynamoDB
 * @param {string} filePath - Đường dẫn tới file JSON đầu ra
 */
async function runDownloader(tableName, filePath) {
	try {
		console.log(
			`\n🚀 Khởi động tiến trình tải dữ liệu từ bảng: [${tableName}]`,
		);

		let allItems = [];
		let lastEvaluatedKey = undefined;
		let scanCount = 0;

		// 2. Quét dữ liệu liên tục cho đến khi hết bảng
		do {
			const params = {
				TableName: tableName,
				...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
			};

			const command = new ScanCommand(params);
			const response = await docClient.send(command);

			if (response.Items && response.Items.length > 0) {
				allItems.push(...response.Items);
			}

			lastEvaluatedKey = response.LastEvaluatedKey;
			scanCount++;

			console.log(
				`📦 Đã quét lần ${scanCount}: Lấy được ${response.Items?.length || 0} items. Tổng đang có: ${allItems.length} items.`,
			);
		} while (lastEvaluatedKey);

		console.log(`📝 Tổng số bản ghi lấy được: ${allItems.length}`);
		console.log("-----------------------------------------------------------");

		// 3. Xử lý đường dẫn và ghi file (Giống logic file upload)
		const resolvedPath = path.resolve(filePath);

		const jsonContent = JSON.stringify(allItems, null, 4);
		fs.writeFileSync(resolvedPath, jsonContent, "utf-8");

		console.log(`💾 Đã lưu file thành công tại: ${resolvedPath}`);
		console.log("\n✨ HOÀN THÀNH: Tất cả dữ liệu đã được tải về máy an toàn!");
	} catch (error) {
		console.error("\n💀 TIẾN TRÌNH THẤT BẠI:");
		console.error(error.message);
		process.exit(1);
	}
}

// --- THỰC THI ---
const CONFIG = {
	TABLE: "guidePocPowers", // Tên bảng của bạn
	FILE: "./downloaded_powers.json", // File đầu ra
};

runDownloader(CONFIG.TABLE, CONFIG.FILE);
