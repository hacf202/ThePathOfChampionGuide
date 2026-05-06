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
const CARDS_TABLE = "guidePocCardList";

const BACKUP_FILE = path.join(__dirname, "../uploadData/mongo_backup_2026-05-02T13-40-55/guidePocCardList.json");

async function main() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(MONGODB_DB_NAME);
        const collection = db.collection(CARDS_TABLE);

        console.log("Đọc file backup từ:", BACKUP_FILE);
        const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, "utf-8"));

        console.log(`Bắt đầu xử lý ${backupData.length} lá bài để khôi phục 'keywords' và 'subtypes'...`);

        const bulkOps = [];

        for (const card of backupData) {
            const updateFields = {};
            
            // Lấy lại các thuộc tính quan trọng bị mất
            if (Array.isArray(card.keywords)) updateFields.keywords = card.keywords;
            if (Array.isArray(card.subtypes)) updateFields.subtypes = card.subtypes;
            
            if (card.translations?.en?.keywords) {
                updateFields["translations.en.keywords"] = card.translations.en.keywords;
            }

            if (Object.keys(updateFields).length > 0) {
                bulkOps.push({
                    updateOne: {
                        filter: { cardCode: card.cardCode },
                        update: { $set: updateFields } // Chỉ update (vá) các trường bị thiếu, không làm hỏng dữ liệu mới
                    }
                });
            }
        }

        if (bulkOps.length > 0) {
            console.log(`Đang thực hiện Bulk Write (${bulkOps.length} operations)...`);
            const result = await collection.bulkWrite(bulkOps);
            console.log("\n✅ Cập nhật CSDL thành công!");
            console.log(` - Số lá bài tìm thấy trong DB: ${result.matchedCount}`);
            console.log(` - Số lá bài được sửa đổi (vá dữ liệu): ${result.modifiedCount}`);
        } else {
            console.log("Không có dữ liệu nào để cập nhật.");
        }

    } catch (err) {
        console.error("❌ Lỗi trong quá trình khôi phục:", err);
    } finally {
        await client.close();
    }
}

main();
