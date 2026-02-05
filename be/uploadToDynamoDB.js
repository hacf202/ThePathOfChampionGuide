// be/uploadRelicsToDynamoDB.js

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import {
	DynamoDBClient,
	BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

dotenv.config();

// --- CẤU HÌNH ---
// THAY ĐỔI 1: Cập nhật tên bảng đích
const DYNAMODB_TABLE_NAME = "guidePocRelics";
const AWS_REGION = process.env.AWS_REGION;

// --- KHỞI TẠO DYNAMODB CLIENT ---
const dynamoDbClient = new DynamoDBClient({ region: AWS_REGION });

// --- HÀM CHÍNH ĐỂ THỰC THI VIỆC TẢI DỮ LIỆU ---
async function uploadRelicsData() {
	console.log("Bắt đầu quá trình tải dữ liệu RELICS lên DynamoDB...");

	try {
		// 1. Đọc và phân tích tệp JSON chứa dữ liệu relics
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		// THAY ĐỔI 2: Trỏ đến tệp dữ liệu relics-vi_vn.json
		// Hãy chắc chắn rằng bạn có tệp `relics-vi_vn.json` ở đúng đường dẫn này.
		const relicsFilePath = path.join(__dirname, "relics1-vi_vn.json");

		console.log(`Đang đọc dữ liệu từ: ${relicsFilePath}`);
		const fileContent = await fs.readFile(relicsFilePath, "utf8");
		const relicsData = JSON.parse(fileContent);

		if (!Array.isArray(relicsData) || relicsData.length === 0) {
			console.log("Không có dữ liệu trong tệp để tải lên.");
			return;
		}

		console.log(`Đã tìm thấy ${relicsData.length} relics để xử lý.`);

		// 2. Chuẩn bị dữ liệu cho BatchWriteItem
		// Sử dụng 'relicCode' làm khóa chính (giả sử cấu trúc JSON tương tự; điều chỉnh nếu cần)
		const putRequests = relicsData.map(relic => {
			const marshalledItem = marshall(relic);
			return {
				PutRequest: {
					Item: marshalledItem,
				},
			};
		});

		// 3. Chia thành các lô nhỏ (chunks) gồm 25 mục
		const chunks = [];
		for (let i = 0; i < putRequests.length; i = i + 25) {
			chunks.push(putRequests.slice(i, i + 25));
		}

		console.log(`Dữ liệu được chia thành ${chunks.length} lô để xử lý.`);

		// 4. Gửi từng lô lên DynamoDB
		for (let index = 0; index < chunks.length; index++) {
			const chunk = chunks[index];
			const command = new BatchWriteItemCommand({
				RequestItems: {
					[DYNAMODB_TABLE_NAME]: chunk,
				},
			});

			await dynamoDbClient.send(command);
			console.log(`Đã tải thành công lô ${index + 1}/${chunks.length}.`);
		}

		console.log("======================================================");
		console.log(
			"🎉 Hoàn tất! Toàn bộ dữ liệu RELICS đã được tải lên DynamoDB thành công.",
		);
		console.log("======================================================");
	} catch (error) {
		console.error("❌ Đã xảy ra lỗi trong quá trình tải dữ liệu:", error);
	}
}

// Chạy hàm chính
uploadRelicsData();
