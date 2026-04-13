// be/scripts/backupAllTables.js
// Script tải toàn bộ dữ liệu từ tất cả bảng DynamoDB về thư mục backup local
//
// Chạy: node be/scripts/backupAllTables.js
// Hoặc:  node be/scripts/backupAllTables.js --table guidePocChampionList  (backup 1 bảng)
//        node be/scripts/backupAllTables.js --out ./my-backup              (chỉ định thư mục)

import { DynamoDBClient, ScanCommand, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Env ──────────────────────────────────────────────────────────────────────
dotenv.config({ path: path.join(__dirname, "../.env") });

// ── DynamoDB Client ───────────────────────────────────────────────────────────
const client = new DynamoDBClient({
	region: process.env.AWS_REGION || "us-east-1",
	maxAttempts: 8,
});

// ── Tất cả bảng cần backup ────────────────────────────────────────────────────
// sortKey: field dùng để sắp xếp kết quả (giúp diff dễ đọc hơn)
const ALL_TABLES = [
	{ name: "guidePocChampionList",           file: "guidePocChampionList.json",           sortKey: "championID" },
	{ name: "guidePocChampionConstellation",  file: "guidePocChampionConstellation.json",  sortKey: "constellationID" },
	{ name: "guidePocPowers",                 file: "PowersData.json",                     sortKey: "powerCode" },
	{ name: "guidePocRelics",                 file: "RelicsData.json",                     sortKey: "relicCode" },
	{ name: "guidePocItems",                  file: "ItemsData.json",                      sortKey: "itemCode" },
	{ name: "guidePocRunes",                  file: "RunesData.json",                      sortKey: "runeCode" },
	{ name: "guidePocBonusStar",              file: "guidePocBonusStar.json",              sortKey: "bonusStarID" },
	{ name: "guidePocCardList",               file: "cardList.json",                       sortKey: "cardCode" },
	{ name: "guidePocBosses",                 file: "guidePocBosses.json",                 sortKey: "bossID" },
	{ name: "guidePocAdventureMap",           file: "guidePocAdventureMap.json",           sortKey: "adventureID" },
	{ name: "guidePocGuideList",              file: "guidePocGuideList.json",              sortKey: "slug" },
	{ name: "guidePocFavoriteBuilds",         file: "guidePocFavoriteBuilds.json",         sortKey: null },
	{ name: "guidePocPlayStyleRating",        file: "guidePocPlayStyleRating.json",        sortKey: "championID" },
	{ name: "guidePocAuditLogs",              file: "guidePocAuditLogs.json",              sortKey: "timestamp" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Scan toàn bộ một bảng DynamoDB (tự động phân trang)
 * @param {string} tableName
 * @returns {Promise<Object[]>} mảng item đã unmarshall
 */
async function scanTable(tableName) {
	const items = [];
	let lastKey = undefined;
	let page = 0;

	do {
		page++;
		const cmd = new ScanCommand({
			TableName: tableName,
			...(lastKey && { ExclusiveStartKey: lastKey }),
		});

		const res = await client.send(cmd);
		const batch = (res.Items || []).map((item) => unmarshall(item));
		items.push(...batch);

		process.stdout.write(
			`\r  📄 Trang ${page}: ${items.length} bản ghi...    `
		);

		lastKey = res.LastEvaluatedKey;

		// Ngủ nhẹ giữa các trang để tránh throttle
		if (lastKey) await sleep(200);
	} while (lastKey);

	return items;
}

/**
 * Backup một bảng
 */
async function backupTable(tableConfig, outputDir) {
	const { name, file, sortKey } = tableConfig;
	const filePath = path.join(outputDir, file);

	console.log(`\n🔽 [${name}]`);

	try {
		let items = await scanTable(name);

		// Sắp xếp nếu có sortKey → diff dễ đọc hơn
		if (sortKey) {
			items.sort((a, b) => {
				const va = String(a[sortKey] ?? "");
				const vb = String(b[sortKey] ?? "");
				return va.localeCompare(vb);
			});
		}

		fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");

		const sizeKB = (fs.statSync(filePath).size / 1024).toFixed(1);
		console.log(`\n  ✅ ${items.length} bản ghi → ${file} (${sizeKB} KB)`);
		return { table: name, count: items.length, success: true };
	} catch (err) {
		console.log(`\n  ❌ Lỗi: ${err.message}`);
		return { table: name, count: 0, success: false, error: err.message };
	}
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
	// Parse CLI args
	const args = process.argv.slice(2);
	const tableArg = args.find((_, i) => args[i - 1] === "--table");
	const outArg = args.find((_, i) => args[i - 1] === "--out");

	// Xác định thư mục output (Sử dụng giờ VN GMT+7)
	const timestamp = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().replace(/[:.]/g, "-").slice(0, 19);
	const defaultOutDir = path.join(__dirname, `../uploadData/backup_${timestamp}`);
	const outputDir = outArg ? path.resolve(outArg) : defaultOutDir;

	// Xác định danh sách bảng cần backup
	const tablesToBackup = tableArg
		? ALL_TABLES.filter((t) => t.name === tableArg)
		: ALL_TABLES;

	if (tablesToBackup.length === 0) {
		console.error(`❌ Không tìm thấy bảng: "${tableArg}"`);
		console.log("Các bảng hợp lệ:");
		ALL_TABLES.forEach((t) => console.log(`  - ${t.name}`));
		process.exit(1);
	}

	// Tạo thư mục output
	fs.mkdirSync(outputDir, { recursive: true });

	console.log("╔══════════════════════════════════════════════════════╗");
	console.log("║       🗄️  DynamoDB Full Backup Script                ║");
	console.log("╚══════════════════════════════════════════════════════╝");
	console.log(`📁 Thư mục backup: ${outputDir}`);
	console.log(`📋 Số bảng cần backup: ${tablesToBackup.length}`);
	console.log(`⏰ Bắt đầu: ${new Date().toLocaleString("vi-VN")}`);
	console.log("──────────────────────────────────────────────────────");

	const startTime = Date.now();
	const results = [];

	for (let i = 0; i < tablesToBackup.length; i++) {
		const tableConfig = tablesToBackup[i];
		console.log(`\n[${i + 1}/${tablesToBackup.length}]`);
		const result = await backupTable(tableConfig, outputDir);
		results.push(result);

		// Nghỉ giữa các bảng
		if (i < tablesToBackup.length - 1) await sleep(500);
	}

	// ── Tạo file manifest ─────────────────────────────────────────────────────
	const manifest = {
		backupDate: new Date().toISOString(),
		region: process.env.AWS_REGION || "us-east-1",
		tables: results.map((r) => ({
			table: r.table,
			count: r.count,
			success: r.success,
			...(r.error && { error: r.error }),
		})),
		totalItems: results.reduce((s, r) => s + r.count, 0),
		durationSeconds: ((Date.now() - startTime) / 1000).toFixed(1),
	};

	fs.writeFileSync(
		path.join(outputDir, "_manifest.json"),
		JSON.stringify(manifest, null, 2),
		"utf-8"
	);

	// ── Tóm tắt ──────────────────────────────────────────────────────────────
	const succeeded = results.filter((r) => r.success).length;
	const failed = results.filter((r) => !r.success);

	console.log("\n╔══════════════════════════════════════════════════════╗");
	console.log("║                    📊 KẾT QUẢ                       ║");
	console.log("╚══════════════════════════════════════════════════════╝");
	console.log(`✅ Thành công : ${succeeded}/${tablesToBackup.length} bảng`);
	console.log(`📦 Tổng bản ghi: ${manifest.totalItems.toLocaleString()}`);
	console.log(`⏱️  Thời gian   : ${manifest.durationSeconds}s`);
	console.log(`📁 Lưu tại     : ${outputDir}`);

	if (failed.length > 0) {
		console.log(`\n⚠️  Bảng thất bại:`);
		failed.forEach((r) => console.log(`   - ${r.table}: ${r.error}`));
	}

	console.log("\n🏁 Hoàn thành backup!");
}

main().catch((err) => {
	console.error("💀 Script thất bại:", err.message);
	process.exit(1);
});
