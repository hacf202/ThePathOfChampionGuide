
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const uriMatch = env.match(/MONGODB_URI=["']?(.+?)["']?(\s|$)/);
const uri = uriMatch[1];

async function run() {
    const backupPath = path.resolve(__dirname, 'uploadData/mongo_backup_2026-05-02T13-40-55/guidePocChampionList.json');
    if (!fs.existsSync(backupPath)) {
        console.error('Backup file not found at:', backupPath);
        process.exit(1);
    }

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('guidePoc');
        const collection = db.collection('guidePocChampionList');
        
        console.log(`Starting migration for ${backupData.length} champions...`);
        
        let updatedCount = 0;
        for (const backupItem of backupData) {
            if (backupItem.cardCode) {
                // Try matching by name (trimmed)
                const result = await collection.updateMany(
                    { name: backupItem.name.trim() },
                    { $set: { cardCode: backupItem.cardCode } }
                );
                updatedCount += result.modifiedCount;
                if (result.modifiedCount > 0) {
                    console.log(`Updated ${backupItem.name}: ${backupItem.cardCode}`);
                }
            }
        }
        
        console.log(`Finished. Total documents updated: ${updatedCount}`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
        process.exit(0);
    }
}
run();
