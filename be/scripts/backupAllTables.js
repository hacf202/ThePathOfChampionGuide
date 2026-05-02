// be/scripts/backupAllTables.js
// Script tải toàn bộ dữ liệu từ tất cả collection MongoDB về thư mục backup local
//
// Chạy: node be/scripts/backupAllTables.js
// Hoặc: node be/scripts/backupAllTables.js --collection guidePocChampionList  (backup 1 bảng)
//        node be/scripts/backupAllTables.js --out ./my-backup                   (chỉ định thư mục)

import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import dns from "node:dns";

// Fix lỗi DNS của nhà mạng Việt Nam khi connect MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Env ──────────────────────────────────────────────────────────────────────
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URI || !MONGODB_DB_NAME) {
    console.error("Vui lòng cấu hình MONGODB_URI và MONGODB_DB_NAME trong file .env");
    process.exit(1);
}

// ── Tất cả collection cần backup ──────────────────────────────────────────────
// sortKey: field dùng để sắp xếp kết quả (giúp diff dễ đọc hơn)
const ALL_COLLECTIONS = [
    { name: "guidePocChampionList",           file: "guidePocChampionList.json",           sortKey: "championID" },
    { name: "guidePocChampionConstellation",  file: "guidePocChampionConstellation.json",  sortKey: "constellationID" },
    { name: "guidePocPowers",                 file: "guidePocPowers.json",                 sortKey: "powerCode" },
    { name: "guidePocRelics",                 file: "guidePocRelics.json",                 sortKey: "relicCode" },
    { name: "guidePocItems",                  file: "guidePocItems.json",                  sortKey: "itemCode" },
    { name: "guidePocRunes",                  file: "guidePocRunes.json",                  sortKey: "runeCode" },
    { name: "guidePocBonusStar",              file: "guidePocBonusStar.json",              sortKey: "bonusStarID" },
    { name: "guidePocCardList",               file: "guidePocCardList.json",               sortKey: "cardCode" },
    { name: "guidePocBosses",                 file: "guidePocBosses.json",                 sortKey: "bossID" },
    { name: "guidePocAdventureMap",           file: "guidePocAdventureMap.json",           sortKey: "adventureID" },
    { name: "guidePocGuideList",              file: "guidePocGuideList.json",              sortKey: "slug" },
    { name: "guidePocFavoriteBuilds",         file: "guidePocFavoriteBuilds.json",         sortKey: null },
    { name: "guidePocPlayStyleRating",        file: "guidePocPlayStyleRating.json",        sortKey: "championID" },
    { name: "guidePocAuditLogs",              file: "guidePocAuditLogs.json",              sortKey: "timestamp" },
];

/**
 * Backup một collection
 */
async function backupCollection(db, config, outputDir) {
    const { name, file, sortKey } = config;
    const filePath = path.join(outputDir, file);

    console.log(`\n🔽 [${name}]`);

    try {
        let query = db.collection(name).find({});
        
        if (sortKey) {
            query = query.sort({ [sortKey]: 1 });
        }

        const items = await query.toArray();

        // Xóa trường _id của MongoDB để file backup sạch sẽ (tùy chọn)
        const cleanedItems = items.map(item => {
            const { _id, ...rest } = item;
            return rest;
        });

        fs.writeFileSync(filePath, JSON.stringify(cleanedItems, null, 2), "utf-8");

        const sizeKB = (fs.statSync(filePath).size / 1024).toFixed(1);
        console.log(`  ✅ ${cleanedItems.length} bản ghi → ${file} (${sizeKB} KB)`);
        return { collection: name, count: cleanedItems.length, success: true };
    } catch (err) {
        console.log(`  ❌ Lỗi: ${err.message}`);
        return { collection: name, count: 0, success: false, error: err.message };
    }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    // Parse CLI args
    const args = process.argv.slice(2);
    const collectionArg = args.find((_, i) => args[i - 1] === "--collection");
    const outArg = args.find((_, i) => args[i - 1] === "--out");

    // Xác định thư mục output (Giờ VN)
    const timestamp = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const defaultOutDir = path.join(__dirname, `../uploadData/mongo_backup_${timestamp}`);
    const outputDir = outArg ? path.resolve(outArg) : defaultOutDir;

    // Xác định danh sách cần backup
    const targets = collectionArg
        ? ALL_COLLECTIONS.filter((t) => t.name === collectionArg)
        : ALL_COLLECTIONS;

    if (targets.length === 0) {
        console.error(`❌ Không tìm thấy collection: "${collectionArg}"`);
        process.exit(1);
    }

    fs.mkdirSync(outputDir, { recursive: true });

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db(MONGODB_DB_NAME);

        console.log("╔══════════════════════════════════════════════════════╗");
        console.log("║         🍃  MongoDB Full Backup Script               ║");
        console.log("╚══════════════════════════════════════════════════════╝");
        console.log(`📁 Thư mục backup: ${outputDir}`);
        console.log(`📋 Số lượng: ${targets.length} collections`);
        console.log("──────────────────────────────────────────────────────");

        const startTime = Date.now();
        const results = [];

        for (let i = 0; i < targets.length; i++) {
            console.log(`[${i + 1}/${targets.length}]`);
            const result = await backupCollection(db, targets[i], outputDir);
            results.push(result);
        }

        const manifest = {
            backupDate: new Date().toISOString(),
            dbName: MONGODB_DB_NAME,
            results,
            totalItems: results.reduce((s, r) => s + r.count, 0),
            duration: ((Date.now() - startTime) / 1000).toFixed(1) + "s",
        };

        fs.writeFileSync(path.join(outputDir, "_manifest.json"), JSON.stringify(manifest, null, 2));

        console.log("\n✅ Hoàn thành backup MongoDB!");
        console.log(`📍 Vị trí: ${outputDir}`);
    } finally {
        await client.close();
    }
}

main().catch((err) => {
    console.error("💀 Script thất bại:", err);
    process.exit(1);
});
