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

const args = process.argv.slice(2);
const BASE_DIR = args[0] || "d:/ThePathOfChampionGuide/be/uploadData/mongo_backup_2026-05-08T17-50-19";

async function restoreCollection(client, collectionName, filePath) {
    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection(collectionName);
    
    console.log(`Đang đọc file: ${filePath}`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
    console.log(`Đang xóa dữ liệu cũ của collection ${collectionName}...`);
    await collection.deleteMany({});
    
    console.log(`Đang thêm ${data.length} bản ghi vào collection ${collectionName}...`);
    if (data.length > 0) {
        // Insert in batches of 1000
        const batchSize = 1000;
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            await collection.insertMany(batch);
        }
    }
    console.log(`✅ Khôi phục ${collectionName} thành công!\n`);
}

async function main() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        
        const files = fs.readdirSync(BASE_DIR);
        for (const file of files) {
            if (file.endsWith(".json") && file !== "_manifest.json") {
                const collectionName = file.replace(".json", "");
                const filePath = path.join(BASE_DIR, file);
                await restoreCollection(client, collectionName, filePath);
            }
        }
    } catch (err) {
        console.error("❌ Lỗi trong quá trình khôi phục:", err);
    } finally {
        await client.close();
    }
}

main();
