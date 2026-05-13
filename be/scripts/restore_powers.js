import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import dns from 'dns';

// Ép Node.js sử dụng Google DNS để tránh lỗi querySrv ECONNREFUSED
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.resolve('d:/ThePathOfChampionGuide/be/.env') });

const filePath = 'd:/ThePathOfChampionGuide/be/uploadData/mongo_backup_2026-05-12T20-32-50/guidePocPowers.json';
const collectionName = 'guidePocPowers';

async function restorePowers() {
    console.log(`Starting restore for ${collectionName}...`);
    
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME);
        const collection = db.collection(collectionName);

        // Read and parse data
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (!Array.isArray(data)) {
            console.error('Data is not an array. Aborting.');
            return;
        }

        console.log(`Read ${data.length} entries from JSON.`);

        // 1. Clear existing collection
        console.log('Clearing existing collection...');
        await collection.deleteMany({});

        // 2. Insert new data
        console.log('Inserting new data...');
        // Insert in batches if the array is very large, but 5000 is fine for one go. 
        // 21k entries might be better in batches.
        const batchSize = 1000;
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            await collection.insertMany(batch);
            console.log(`Inserted ${i + batch.length}/${data.length}...`);
        }

        console.log('✅ Restore completed successfully.');

    } catch (e) {
        console.error('❌ Restore failed:', e.message);
    } finally {
        await client.close();
    }
}

restorePowers();
