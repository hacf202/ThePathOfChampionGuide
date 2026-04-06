import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	DynamoDBDocumentClient,
	BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// 1. Cấu hình môi trường
dotenv.config({ path: "../.env" }); // Trỏ vào file .env ở thư mục be

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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function processBatchWithRetries(
	batchParams,
	currentBatchIndex,
	totalBatches,
) {
	let params = { ...batchParams };
	let retries = 0;
	const MAX_RETRIES = 8;

	while (true) {
		try {
			const result = await docClient.send(new BatchWriteCommand(params));

			const unprocessed =
				result.UnprocessedItems &&
				Object.keys(result.UnprocessedItems).length > 0;

			if (!unprocessed) {
				console.log(`✅ Lô ${currentBatchIndex}/${totalBatches}: Thành công.`);
				return;
			}

			if (retries >= MAX_RETRIES) {
				throw new Error(
					`Lô ${currentBatchIndex} thất bại sau ${MAX_RETRIES} lần thử lại.`,
				);
			}

			retries++;
			const waitTime = Math.pow(2, retries) * 500;
			console.warn(
				`⚠️ Lô ${currentBatchIndex}: Còn ${Object.values(result.UnprocessedItems)[0].length} items chưa xong. Thử lại lần ${retries} sau ${waitTime}ms...`,
			);

			params.RequestItems = result.UnprocessedItems;
			await sleep(waitTime);
		} catch (error) {
			if (error.name === "ProvisionedThroughputExceededException") {
				retries++;
				await sleep(Math.pow(2, retries) * 1000);
			} else {
				console.error(
					`❌ Lỗi nghiêm trọng tại lô ${currentBatchIndex}:`,
					error.message,
				);
				throw error;
			}
		}
	}
}

async function runUploader(tableName, filePath) {
	try {
		console.log(`\n🚀 Khởi động tiến trình tải dữ liệu lên bảng: [${tableName}]`);

		const resolvedPath = path.resolve(filePath);
		if (!fs.existsSync(resolvedPath)) {
			throw new Error(`Không tìm thấy file tại: ${resolvedPath}`);
		}

		const rawData = fs.readFileSync(resolvedPath, "utf-8");
		const items = JSON.parse(rawData);

		if (!Array.isArray(items)) {
			throw new Error("Dữ liệu trong file JSON phải là một Array các Object.");
		}

		console.log(`📝 Tổng số bản ghi cần xử lý: ${items.length}`);

		const BATCH_SIZE = 25;
		const batches = [];
		for (let i = 0; i < items.length; i += BATCH_SIZE) {
			batches.push(items.slice(i, i + BATCH_SIZE));
		}

		console.log(`📦 Chia thành ${batches.length} lô (mỗi lô ~${BATCH_SIZE} items).`);
		console.log("-----------------------------------------------------------");

		for (let i = 0; i < batches.length; i++) {
			const currentItems = batches[i];

			const putRequests = currentItems.map(item => ({
				PutRequest: { Item: item },
			}));

			const batchParams = {
				RequestItems: {
					[tableName]: putRequests,
				},
			};

			await processBatchWithRetries(batchParams, i + 1, batches.length);

			if (i < batches.length - 1) {
				await sleep(200); // Giảm tải cho DB
			}
		}

		console.log("\n✨ HOÀN THÀNH: Tất cả dữ liệu đã nằm an toàn trên DynamoDB!");
	} catch (error) {
		console.error("\n💀 TIẾN TRÌNH THẤT BẠI:");
		console.error(error.message);
		process.exit(1);
	}
}

const CONFIG = {
	TABLE: "guidePocCardList",
	FILE: "./cardList.json",
};

runUploader(CONFIG.TABLE, CONFIG.FILE);
