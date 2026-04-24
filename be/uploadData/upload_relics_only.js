import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	DynamoDBDocumentClient,
	BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

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

async function processBatchWithRetries(batchParams, currentBatchIndex, totalBatches) {
	let params = { ...batchParams };
	let retries = 0;
	const MAX_RETRIES = 8;

	while (true) {
		try {
			const result = await docClient.send(new BatchWriteCommand(params));
			const unprocessed = result.UnprocessedItems && Object.keys(result.UnprocessedItems).length > 0;

			if (!unprocessed) {
				console.log(`✅ Lô ${currentBatchIndex}/${totalBatches}: Thành công.`);
				return;
			}

			if (retries >= MAX_RETRIES) {
				throw new Error(`Lô ${currentBatchIndex} thất bại sau ${MAX_RETRIES} lần thử lại.`);
			}

			retries++;
			const waitTime = Math.pow(2, retries) * 500;
			console.warn(`⚠️ Lô ${currentBatchIndex}: Còn ${Object.values(result.UnprocessedItems)[0].length} items chưa xong. Thử lại lần ${retries} sau ${waitTime}ms...`);
			params.RequestItems = result.UnprocessedItems;
			await sleep(waitTime);
		} catch (error) {
			if (error.name === "ProvisionedThroughputExceededException") {
				retries++;
				await sleep(Math.pow(2, retries) * 1000);
			} else {
				console.error(`❌ Lỗi nghiêm trọng tại lô ${currentBatchIndex}:`, error.message);
				throw error;
			}
		}
	}
}

async function runUploader(tableName, filePath) {
	console.log(`\n🚀 Khởi động tiến trình tải dữ liệu lên bảng: [${tableName}]`);
	const resolvedPath = path.resolve(filePath);
	const rawData = fs.readFileSync(resolvedPath, "utf-8");
	const items = JSON.parse(rawData);
	console.log(`📝 Tổng số bản ghi cần xử lý: ${items.length}`);

	const BATCH_SIZE = 25;
	const batches = [];
	for (let i = 0; i < items.length; i += BATCH_SIZE) {
		batches.push(items.slice(i, i + BATCH_SIZE));
	}

	for (let i = 0; i < batches.length; i++) {
		const currentItems = batches[i];
		const putRequests = currentItems.map(item => ({ PutRequest: { Item: item } }));
		const batchParams = { RequestItems: { [tableName]: putRequests } };
		await processBatchWithRetries(batchParams, i + 1, batches.length);
		if (i < batches.length - 1) await sleep(500);
	}
	console.log("\n✨ HOÀN THÀNH!");
}

const TABLE_NAME = "guidePocRelics";
const FILE_PATH = path.join(__dirname, "backup_2026-04-24T01-31-12/RelicsData.json");

runUploader(TABLE_NAME, FILE_PATH);
