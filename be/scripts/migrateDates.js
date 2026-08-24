import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB_NAME || "poc_guide";
const COLLECTION_NAME = "guidePocGuideList";

// Helper chuyển "dd-mm-yyyy" sang ISO
function parseDateString(dateStr) {
	if (!dateStr || typeof dateStr !== "string") return null;
	const parts = dateStr.split("-");
	if (parts.length === 3) {
		const [day, month, year] = parts;
		return new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();
	}
	return null;
}

async function main() {
	console.log(`Kết nối tới MongoDB: ${MONGODB_URI}`);
	const client = new MongoClient(MONGODB_URI);

	try {
		await client.connect();
		const db = client.db(DB_NAME);
		const collection = db.collection(COLLECTION_NAME);

		const allDocs = await collection.find({}).toArray();
		console.log(`Tìm thấy ${allDocs.length} guides.`);

		if (allDocs.length === 0) return;

		// Backup
		const backupDir = path.join(__dirname, '../uploadData', `mongo_backup_dates_migration_${new Date().toISOString().replace(/[:.]/g, '-')}`);
		if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
		
		const backupFile = path.join(backupDir, `${COLLECTION_NAME}.json`);
		fs.writeFileSync(backupFile, JSON.stringify(allDocs, null, 2));
		console.log(`✅ Đã backup vào: ${backupFile}`);

		console.log("Đang tiến hành chuyển đổi date string -> ISO Date...");
		
		let updatedCount = 0;
		for (const doc of allDocs) {
			const updates = {};
			
			// Kiểm tra nếu chưa phải ISO 
			if (doc.publishedDate && !doc.publishedDate.includes("T")) {
				const iso = parseDateString(doc.publishedDate);
				if (iso) updates.publishedDate = iso;
			}
			if (doc.updateDate && !doc.updateDate.includes("T")) {
				const iso = parseDateString(doc.updateDate);
				if (iso) updates.updateDate = iso;
			}

			if (Object.keys(updates).length > 0) {
				await collection.updateOne({ _id: doc._id }, { $set: updates });
				updatedCount++;
			}
		}

		console.log(`✅ Đã cập nhật format ngày cho ${updatedCount} guides.`);

	} catch (error) {
		console.error("Lỗi trong quá trình migration:", error);
	} finally {
		await client.close();
		console.log("Đã đóng kết nối MongoDB.");
	}
}

main();
