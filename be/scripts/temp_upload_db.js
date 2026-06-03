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

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

const backupDir = path.join(__dirname, "../uploadData/mongo_backup_2026-06-03T09-56-25");

const targets = [
    { name: "guidePocPowers", file: "guidePocPowers.json", key: "powerCode" },
    { name: "guidePocRelics", file: "guidePocRelics.json", key: "relicCode" },
    { name: "guidePocItems",  file: "guidePocItems.json",  key: "itemCode" }
];

async function main() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db(MONGODB_DB_NAME);
        
        for (const target of targets) {
            console.log(`Đang xử lý collection: ${target.name}...`);
            const filePath = path.join(backupDir, target.file);
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            
            const collection = db.collection(target.name);
            
            // Dùng bulkWrite để update hoặc insert, giữ nguyên các record không liên quan
            const bulkOps = data.map(item => {
                // Tạo câu lệnh upsert dựa trên unique key
                return {
                    updateOne: {
                        filter: { [target.key]: item[target.key] },
                        update: { $set: item },
                        upsert: true
                    }
                };
            });
            
            const result = await collection.bulkWrite(bulkOps);
            console.log(`✅ ${target.name}: matched ${result.matchedCount}, modified ${result.modifiedCount}, upserted ${result.upsertedCount}`);
        }
        
        console.log("🚀 Hoàn tất đẩy dữ liệu lên Database!");
    } catch (e) {
        console.error("❌ Lỗi:", e);
    } finally {
        await client.close();
    }
}

main();
