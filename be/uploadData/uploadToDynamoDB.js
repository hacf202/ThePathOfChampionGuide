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

// 1. Cấu hình môi trường
dotenv.config({ path: path.join(__dirname, "../.env") });

// Khởi tạo Client với cấu hình retry mặc định của SDK
const client = new DynamoDBClient({
	region: process.env.AWS_REGION || "us-east-1",
	maxAttempts: 10, // SDK sẽ tự động thử lại khi gặp lỗi mạng hoặc throttle nhẹ
});

const docClient = DynamoDBDocumentClient.from(client, {
	marshallOptions: {
		removeUndefinedValues: true, // Tự động loại bỏ các field undefined để tránh lỗi DynamoDB
		convertEmptyValues: true,
	},
});

// Hàm tiện ích để tạm dừng (Exponential Backoff)
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Hàm thực hiện ghi một lô (batch) dữ liệu và xử lý các item chưa được ghi (UnprocessedItems)
 * @param {Object} batchParams - Tham số cho BatchWriteCommand
 */
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

			// Kiểm tra xem có item nào bị từ chối do Throttle không
			const unprocessed =
				result.UnprocessedItems &&
				Object.keys(result.UnprocessedItems).length > 0;

			if (!unprocessed) {
				console.log(`✅ Lô ${currentBatchIndex}/${totalBatches}: Thành công.`);
				return; // Hoàn thành lô này
			}

			// Nếu có UnprocessedItems, chuẩn bị để thử lại chỉ với các item đó
			if (retries >= MAX_RETRIES) {
				throw new Error(
					`Lô ${currentBatchIndex} thất bại sau ${MAX_RETRIES} lần thử lại do vượt quá băng thông.`,
				);
			}

			retries++;
			const waitTime = Math.pow(2, retries) * 500; // Exponential Backoff: 1s, 2s, 4s...
			console.warn(
				`⚠️ Lô ${currentBatchIndex}: Còn ${Object.values(result.UnprocessedItems)[0].length} items chưa xong. Thử lại lần ${retries} sau ${waitTime}ms...`,
			);

			params.RequestItems = result.UnprocessedItems;
			await sleep(waitTime);
		} catch (error) {
			// Xử lý lỗi hệ thống hoặc lỗi phân quyền
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

/**
 * Hàm chính thực hiện đọc file và tải lên
 * @param {string} tableName - Tên bảng DynamoDB
 * @param {string} filePath - Đường dẫn tới file JSON
 */
async function runUploader(tableName, filePath) {
	try {
		console.log(
			`\n🚀 Khởi động tiến trình tải dữ liệu lên bảng: [${tableName}]`,
		);

		// 2. Kiểm tra và đọc file
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

		// 3. Chia nhỏ dữ liệu (DynamoDB giới hạn tối đa 25 items mỗi lần BatchWrite)
		const BATCH_SIZE = 25;
		const batches = [];
		for (let i = 0; i < items.length; i += BATCH_SIZE) {
			batches.push(items.slice(i, i + BATCH_SIZE));
		}

		console.log(
			`📦 Chia thành ${batches.length} lô (mỗi lô ~${BATCH_SIZE} items).`,
		);
		console.log("-----------------------------------------------------------");

		// 4. Duyệt qua từng lô để gửi lên Cloud
		for (let i = 0; i < batches.length; i++) {
			const currentItems = batches[i];

			// Format sang cấu hình DynamoDB PutRequest
			const putRequests = currentItems.map(item => ({
				PutRequest: { Item: item },
			}));

			const batchParams = {
				RequestItems: {
					[tableName]: putRequests,
				},
			};

			// Gửi lô hiện tại
			await processBatchWithRetries(batchParams, i + 1, batches.length);

			// Nghỉ ngắn giữa các lô để ổn định WCU (Write Capacity Units)
			if (i < batches.length - 1) {
				await sleep(500);
			}
		}

		console.log(
			"\n✨ HOÀN THÀNH: Tất cả dữ liệu đã nằm an toàn trên DynamoDB!",
		);
	} catch (error) {
		console.error("\n💀 TIẾN TRÌNH THẤT BẠI:");
		console.error(error.message);
		process.exit(1);
	}
}

// ── Tự động tìm thư mục backup mới nhất ────────────────────────────────────
function getLatestBackupDir() {
	const uploadDataDir = __dirname;
	const entries = fs.readdirSync(uploadDataDir, { withFileTypes: true });
	const backupDirs = entries
		.filter(e => e.isDirectory() && e.name.startsWith("backup_"))
		.map(e => e.name)
		.sort() // ISO timestamp sort → cuối cùng là mới nhất
		.reverse();

	if (backupDirs.length === 0) {
		throw new Error(
			"Không tìm thấy thư mục backup nào. Hãy chạy backupAllTables.js trước.",
		);
	}

	const latest = backupDirs[0];
	console.log(`📁 Sử dụng backup: ${latest}`);
	return path.join(uploadDataDir, latest);
}

// --- THỰC THI ---
const BACKUP_DIR = getLatestBackupDir();

const CONFIGS = [
	{ table: "guidePocPowers",                file: path.join(BACKUP_DIR, "PowersData.json") },
	{ table: "guidePocItems",                 file: path.join(BACKUP_DIR, "ItemsData.json") },
	{ table: "guidePocRelics",                file: path.join(BACKUP_DIR, "RelicsData.json") },
	{ table: "guidePocRunes",                 file: path.join(BACKUP_DIR, "RunesData.json") },
	{ table: "guidePocChampionList",          file: path.join(BACKUP_DIR, "guidePocChampionList.json") },
	{ table: "guidePocBonusStar",             file: path.join(BACKUP_DIR, "guidePocBonusStar.json") },
	{ table: "guidePocChampionConstellation", file: path.join(BACKUP_DIR, "guidePocChampionConstellation.json") },
	{ table: "guidePocCardList",              file: path.join(BACKUP_DIR, "cardList.json") },
	{ table: "guidePocBosses",                file: path.join(BACKUP_DIR, "guidePocBosses.json") },
	{ table: "guidePocAdventureMap",          file: path.join(BACKUP_DIR, "guidePocAdventureMap.json") },
	{ table: "guidePocGuideList",             file: path.join(BACKUP_DIR, "guidePocGuideList.json") },
];

async function main() {
	for (const config of CONFIGS) {
		try {
			await runUploader(config.table, config.file);
			console.log(`\n✅ Finished uploading ${config.table}.`);
			if (config !== CONFIGS[CONFIGS.length - 1]) {
				console.log(`\nWaiting 2 seconds before next table...\n`);
				await sleep(2000);
			}
		} catch (error) {
			console.error(`❌ Failed to upload ${config.table}:`, error.message);
			// Continue with other tables even if one fails
		}
	}
	console.log("\n🏁 All specified uploads completed.");
}

main();

