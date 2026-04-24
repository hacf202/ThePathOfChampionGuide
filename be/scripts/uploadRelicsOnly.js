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
			console.warn(`⚠️ Lô ${currentBatchIndex}: Còn ${Object.values(result.UnprocessedItems)[0].length} items chưa xong. Thử lại lần ${retries}...`);
			params.RequestItems = result.UnprocessedItems;
			await sleep(waitTime);
		} catch (error) {
			console.error(`❌ Lỗi tại lô ${currentBatchIndex}:`, error.message);
			throw error;
		}
	}
}

async function uploadTable(tableName, filePath) {
	console.log(`\n🚀 Uploading [${tableName}] from ${filePath}`);
	const items = JSON.parse(fs.readFileSync(filePath, "utf-8"));
	console.log(`📝 Total items: ${items.length}`);

	const BATCH_SIZE = 25;
	const batches = [];
	for (let i = 0; i < items.length; i += BATCH_SIZE) {
		batches.push(items.slice(i, i + BATCH_SIZE));
	}

	for (let i = 0; i < batches.length; i++) {
		const batchParams = {
			RequestItems: {
				[tableName]: batches[i].map(item => ({ PutRequest: { Item: item } })),
			},
		};
		await processBatchWithRetries(batchParams, i + 1, batches.length);
		if (i < batches.length - 1) await sleep(500);
	}
	console.log(`\n✨ Finished uploading ${tableName}!`);
}

const TABLE_NAME = "guidePocRelics";
const FILE_PATH = path.join(__dirname, "../uploadData/backup_2026-04-24T01-31-12/RelicsData.json");

uploadTable(TABLE_NAME, FILE_PATH).catch(err => {
	console.error("💀 Upload failed:", err.message);
	process.exit(1);
});
