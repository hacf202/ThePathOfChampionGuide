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
const TARGET_FILE = args[0];

if (!TARGET_FILE) {
    console.error("Vui lòng cung cấp đường dẫn đến file JSON cần đẩy lên DB");
    process.exit(1);
}

async function restoreCollection(client, collectionName, filePath) {
    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection(collectionName);
    
    console.log(`Đang đọc file: ${filePath}`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
    console.log(`Đang xóa dữ liệu cũ của collection ${collectionName}...`);
    await collection.deleteMany({});
    
    console.log(`Đang thêm ${data.length} bản ghi vào collection ${collectionName}...`);
    if (data.length > 0) {
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
        
        const fileName = path.basename(TARGET_FILE);
        if (!fileName.endsWith(".json")) {
            console.error("❌ File không phải định dạng JSON");
            process.exit(1);
        }
        
        const collectionName = fileName.replace(".json", "");
        await restoreCollection(client, collectionName, TARGET_FILE);
        
    } catch (err) {
        console.error("❌ Lỗi trong quá trình khôi phục:", err);
    } finally {
        await client.close();
    }
}

main();
