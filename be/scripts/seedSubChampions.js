import 'dotenv/config';
import { connectToMongoDB, getDb } from '../src/config/mongo.js';
import fs from 'fs';
import path from 'path';

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        await connectToMongoDB();
        const db = getDb();
        const collection = db.collection('guidePocSubChampions');

        const filePath = path.join(process.cwd(), 'uploadData', 'mongo_backup_2026-05-02T13-40-55', 'guidePocSubChampions.json');
        console.log("Reading data from:", filePath);
        const rawData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawData);

        console.log(`Found ${data.length} records. Cleaning collection...`);
        await collection.deleteMany({});

        console.log("Inserting data...");
        // Bỏ qua các object trống nếu có
        const validData = data.filter(d => d.cardCode || d.name);
        
        // MongoDB insertMany có giới hạn, nên chia nhỏ nếu quá lớn
        const chunkSize = 500;
        for (let i = 0; i < validData.length; i += chunkSize) {
            const chunk = validData.slice(i, i + chunkSize);
            await collection.insertMany(chunk);
            console.log(`Inserted ${i + chunk.length}/${validData.length}`);
        }

        console.log("✅ Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed();
