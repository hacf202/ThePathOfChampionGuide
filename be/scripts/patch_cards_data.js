
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'guidePoc';

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
}

const BACKUP_FILE = path.resolve(process.cwd(), 'uploadData/mongo_backup_2026-05-02T13-40-55/guidePocCardList.json');

async function run() {
    console.log('Starting patch script...');
    
    if (!fs.existsSync(BACKUP_FILE)) {
        console.error('Backup file not found:', BACKUP_FILE);
        return;
    }

    const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
    console.log(`Loaded ${backupData.length} cards from backup.`);

    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(MONGODB_DB_NAME);
        const collection = db.collection('guidePocCardList');

        let updatedCount = 0;
        let skippedCount = 0;

        for (const card of backupData) {
            // We only care about keywords and subtypes
            if ((card.keywords && card.keywords.length > 0) || (card.subtypes && card.subtypes.length > 0)) {
                const updateDoc = {
                    $set: {
                        keywords: card.keywords || [],
                        subtypes: card.subtypes || [],
                        'translations.en.keywords': card.translations?.en?.keywords || []
                    }
                };

                const result = await collection.updateOne(
                    { cardCode: card.cardCode },
                    updateDoc
                );

                if (result.modifiedCount > 0) {
                    updatedCount++;
                } else {
                    skippedCount++;
                }
            }
        }

        console.log(`Finished patching. Updated: ${updatedCount}, Skipped/No Change: ${skippedCount}`);

    } catch (error) {
        console.error('Error during patch:', error);
    } finally {
        await client.close();
    }
}

run();
