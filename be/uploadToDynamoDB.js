import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	DynamoDBDocumentClient,
	BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import fs from "fs";
import dotenv from "dotenv";

// 1. Cấu hình môi trường
dotenv.config();

// Tăng maxAttempts để SDK tự động thử lại nhiều lần hơn khi bị Throttle
const client = new DynamoDBClient({
	region: process.env.AWS_REGION || "us-east-1",
	maxAttempts: 10,
});

const docClient = DynamoDBDocumentClient.from(client);

// Hàm tiện ích để tạm dừng (Sleep)
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const TABLE_NAME = "guidePocRelics";
const FILE_PATH = "./relics1-vi_vn.json";

async function uploadPowersData() {
	try {
		console.log("🚀 Bắt đầu quá trình tải dữ liệu POWERS lên DynamoDB...");

		// 2. Đọc dữ liệu từ file JSON
		if (!fs.existsSync(FILE_PATH)) {
			throw new Error(`Không tìm thấy file tại đường dẫn: ${FILE_PATH}`);
		}
		const rawData = fs.readFileSync(FILE_PATH, "utf-8");
		const powers = JSON.parse(rawData);
		console.log(`📝 Đã tìm thấy ${powers.length} powers để xử lý.`);

		// 3. Chia nhỏ dữ liệu thành các lô (Batch) - DynamoDB giới hạn 25 items/lô
		const BATCH_SIZE = 25;
		const batches = [];
		for (let i = 0; i < powers.length; i += BATCH_SIZE) {
			batches.push(powers.slice(i, i + BATCH_SIZE));
		}
		console.log(`📦 Dữ liệu được chia thành ${batches.length} lô để xử lý.`);

		// 4. Vòng lặp tải dữ liệu với cơ chế kiểm soát tốc độ
		for (let i = 0; i < batches.length; i++) {
			const currentBatch = batches[i];

			// Chuyển đổi dữ liệu sang định dạng PutRequest cho BatchWrite
			const putRequests = currentBatch.map(item => ({
				PutRequest: { Item: item },
			}));

			const params = {
				RequestItems: {
					[TABLE_NAME]: putRequests,
				},
			};

			let success = false;
			let retries = 0;

			while (!success) {
				try {
					await docClient.send(new BatchWriteCommand(params));
					console.log(`✅ Đã tải thành công lô ${i + 1}/${batches.length}.`);
					success = true;

					// --- CƠ CHẾ NGHỈ ĐỂ TRÁNH QUÁ TẢI (WCU) ---
					// Nghỉ 1000ms (1 giây) giữa mỗi lô thành công
					if (i < batches.length - 1) {
						await sleep(1000);
					}
				} catch (error) {
					if (
						error.name === "ProvisionedThroughputExceededException" ||
						error.$metadata?.httpStatusCode === 400
					) {
						retries++;
						const waitTime = retries * 2000; // Tăng dần thời gian chờ (2s, 4s, 6s...)
						console.warn(
							`⚠️ Đang bị bóp băng thông tại lô ${i + 1}. Thử lại lần ${retries} sau ${waitTime}ms...`,
						);
						await sleep(waitTime);

						if (retries > 5)
							throw new Error("Vượt quá số lần thử lại cho phép.");
					} else {
						throw error; // Lỗi khác thì dừng chương trình
					}
				}
			}
		}

		console.log(
			"\n✨ CHÚC MỪNG! Tất cả dữ liệu đã được tải lên DynamoDB thành công.",
		);
	} catch (error) {
		console.error("\n❌ Đã xảy ra lỗi nghiêm trọng:");
		console.error(error);
	}
}

// Chạy hàm chính
uploadPowersData();
