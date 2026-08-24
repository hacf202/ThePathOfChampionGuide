import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB_NAME || "poc_guide";
const COLLECTION_NAME = "guidePocBuilds";

async function main() {
	console.log(`Kết nối tới MongoDB: ${MONGODB_URI}`);
	const client = new MongoClient(MONGODB_URI);

	try {
		await client.connect();
		const db = client.db(DB_NAME);
		const collection = db.collection(COLLECTION_NAME);

		// 1. Kiểm tra documents cần migrate
		const stringDocs = await collection.find({ display: { $type: "string" } }).toArray();
		console.log(`Tìm thấy ${stringDocs.length} documents có trường 'display' là chuỗi (string) cần migrate.`);

		if (stringDocs.length === 0) {
			console.log("Không có dữ liệu cần migrate. Hoàn thành!");
			return;
		}

		// 2. Backup bộ sưu tập (chỉ backup các doc bị ảnh hưởng để an toàn, hoặc toàn bộ)
		const backupDir = path.join(__dirname, '../uploadData', `mongo_backup_display_migration_${new Date().toISOString().replace(/[:.]/g, '-')}`);
		if (!fs.existsSync(backupDir)) {
			fs.mkdirSync(backupDir, { recursive: true });
		}
		
		const allDocs = await collection.find({}).toArray();
		const backupFile = path.join(backupDir, `${COLLECTION_NAME}.json`);
		fs.writeFileSync(backupFile, JSON.stringify(allDocs, null, 2));
		console.log(`✅ Đã backup ${allDocs.length} documents vào: ${backupFile}`);

		// 3. Thực thi Migration
		console.log("Đang tiến hành chuyển đổi kiểu dữ liệu 'display' (string -> boolean)...");
		
		const resultTrue = await collection.updateMany(
			{ display: "true" },
			{ $set: { display: true } }
		);
		console.log(`- Đã cập nhật ${resultTrue.modifiedCount} documents từ "true" sang true.`);

		const resultFalse = await collection.updateMany(
			{ display: "false" },
			{ $set: { display: false } }
		);
		console.log(`- Đã cập nhật ${resultFalse.modifiedCount} documents từ "false" sang false.`);

		// Cập nhật các case display là "1" hoặc "0" nếu có
		const resultOtherTrue = await collection.updateMany(
			{ display: "1" },
			{ $set: { display: true } }
		);
		if (resultOtherTrue.modifiedCount > 0) console.log(`- Đã cập nhật ${resultOtherTrue.modifiedCount} documents từ "1" sang true.`);

		const resultOtherFalse = await collection.updateMany(
			{ display: "0" },
			{ $set: { display: false } }
		);
		if (resultOtherFalse.modifiedCount > 0) console.log(`- Đã cập nhật ${resultOtherFalse.modifiedCount} documents từ "0" sang false.`);

		// 4. Verify lại
		const remaining = await collection.countDocuments({ display: { $type: "string" } });
		if (remaining === 0) {
			console.log("✅ Migration thành công toàn bộ! Không còn trường 'display' dạng string.");
		} else {
			console.log(`⚠️ CẢNH BÁO: Còn lại ${remaining} documents có 'display' dạng string chưa được xử lý!`);
		}

	} catch (error) {
		console.error("Lỗi trong quá trình migration:", error);
	} finally {
		await client.close();
		console.log("Đã đóng kết nối MongoDB.");
	}
}

main();
