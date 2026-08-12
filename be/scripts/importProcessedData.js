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

if (!MONGODB_URI || !MONGODB_DB_NAME) {
    console.error("Vui lòng cấu hình MONGODB_URI và MONGODB_DB_NAME trong file .env");
    process.exit(1);
}

const PROCESSED_DIR = path.join(__dirname, "../uploadData/processed_temp");

const COLLECTIONS = [
    { name: "guidePocPowers", idKey: "powerCode" },
    { name: "guidePocRelics", idKey: "relicCode" },
    { name: "guidePocItems", idKey: "itemCode" },
    { name: "guidePocCardList", idKey: "cardCode" }
];

async function main() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(MONGODB_DB_NAME);

        for (const col of COLLECTIONS) {
            const filePath = path.join(PROCESSED_DIR, `${col.name}.json`);
            if (!fs.existsSync(filePath)) {
                console.log(`Bỏ qua ${col.name} vì không tìm thấy file.`);
                continue;
            }

            console.log(`Đang xử lý ${col.name}...`);
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            
            const operations = data.map(item => {
                const idVal = item[col.idKey];
                const { _id, ...updateData } = item;
                
                return {
                    replaceOne: {
                        filter: { [col.idKey]: idVal },
                        replacement: updateData,
                        upsert: true
                    }
                };
            });

            const collection = db.collection(col.name);
            const result = await collection.bulkWrite(operations, { ordered: false });
            
            console.log(`✅ [${col.name}] Cập nhật thành công: Inserted ${result.upsertedCount}, Modified ${result.modifiedCount}`);
        }
        
    } catch (e) {
        console.error("Lỗi cập nhật CSDL:", e);
    } finally {
        await client.close();
        console.log("Đóng kết nối CSDL.");
    }
}

main();
