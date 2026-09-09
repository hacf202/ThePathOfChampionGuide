import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import dns from "node:dns";

dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

const BACKUP_FOLDER = process.argv[2];

if (!BACKUP_FOLDER) {
    console.error("Vui lòng truyền đường dẫn thư mục backup. VD: node restoreBackup.js ../uploadData/mongo_backup_xxx");
    process.exit(1);
}

const ALL_COLLECTIONS = [
    { name: "guidePocChampionList",           file: "guidePocChampionList.json" },
    { name: "guidePocChampionConstellation",  file: "guidePocChampionConstellation.json" },
    { name: "guidePocPowers",                 file: "guidePocPowers.json" },
    { name: "guidePocRelics",                 file: "guidePocRelics.json" },
    { name: "guidePocItems",                  file: "guidePocItems.json" },
    { name: "guidePocRunes",                  file: "guidePocRunes.json" },
    { name: "guidePocBonusStar",              file: "guidePocBonusStar.json" },
    { name: "guidePocCardList",               file: "guidePocCardList.json" },
    { name: "guidePocBosses",                 file: "guidePocBosses.json" },
    { name: "guidePocAdventureMap",           file: "guidePocAdventureMap.json" },
    { name: "guidePocGuideList",              file: "guidePocGuideList.json" },
    { name: "guidePocFavoriteBuilds",         file: "guidePocFavoriteBuilds.json" },
    { name: "guidePocPlayStyleRating",        file: "guidePocPlayStyleRating.json" },
    { name: "guidePocAuditLogs",              file: "guidePocAuditLogs.json" },
    { name: "guidePocBuilds",                 file: "guidePocBuilds.json" },
    { name: "guidePocComments",               file: "guidePocComments.json" },
    { name: "guidePocSubChampions",           file: "guidePocSubChampions.json" }
];

async function restoreData() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(MONGODB_DB_NAME);
        
        console.log(`Bắt đầu khôi phục dữ liệu từ: ${BACKUP_FOLDER}`);

        for (const collInfo of ALL_COLLECTIONS) {
            const filePath = path.join(BACKUP_FOLDER, collInfo.file);
            if (!fs.existsSync(filePath)) {
                console.log(`⚠️ Bỏ qua [${collInfo.name}] - Không tìm thấy file ${collInfo.file}`);
                continue;
            }
            
            console.log(`Đang khôi phục [${collInfo.name}]...`);
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            const collection = db.collection(collInfo.name);
            
            // Xóa sạch dữ liệu cũ
            await collection.deleteMany({});
            
            // Chèn dữ liệu mới
            if (data.length > 0) {
                await collection.insertMany(data);
            }
            
            console.log(`✅ [${collInfo.name}] Khôi phục thành công ${data.length} bản ghi.`);
        }
        console.log("🎉 Hoàn tất khôi phục cơ sở dữ liệu!");
    } catch (e) {
        console.error("Lỗi khôi phục:", e);
    } finally {
        await client.close();
    }
}

restoreData();
