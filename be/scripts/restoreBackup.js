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
    { name: "guidePocBuilds",                 file: "guidePocBuilds.json",                 sortKey: "id" },
    { name: "guidePocComments",               file: "guidePocComments.json",               sortKey: "id" },
    { name: "guidePocSubChampions",           file: "guidePocSubChampions.json",           sortKey: "cardCode" }
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
            
            // Chèn dữ liệu mới bằng bulkWrite
            if (data.length > 0) {
                if (collInfo.sortKey) {
                    const operations = data.map(doc => {
                        const { _id, ...rest } = doc; // Loại bỏ _id cũ nếu có
                        return {
                            replaceOne: {
                                filter: { [collInfo.sortKey]: doc[collInfo.sortKey] },
                                replacement: rest,
                                upsert: true
                            }
                        };
                    });
                    const result = await collection.bulkWrite(operations);
                    console.log(`✅ [${collInfo.name}] Upsert thành công: inserted ${result.upsertedCount}, modified ${result.modifiedCount}.`);
                } else {
                    // Xóa sạch dữ liệu cũ và insert nếu không có primary key
                    await collection.deleteMany({});
                    await collection.insertMany(data);
                    console.log(`✅ [${collInfo.name}] Khôi phục thành công ${data.length} bản ghi.`);
                }
            }
        }
        console.log("🎉 Hoàn tất khôi phục cơ sở dữ liệu!");
    } catch (e) {
        console.error("Lỗi khôi phục:", e);
    } finally {
        await client.close();
    }
}

restoreData();
