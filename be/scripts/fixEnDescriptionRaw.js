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

const stripMarkup = (text) => {
	if (!text) return "";
	let result = text.replace(/\[([a-z]+):([^\]|]+)\|([^\]|]+)(?:\|[^\]]*)?\]/gi, (match, type, id, label) => {
        return label || id;
    });
	result = result.replace(/\[([a-z]+):([^\]|]+)\]/gi, "$2");
	return result;
};

const backupFile = `d:/ThePathOfChampionGuide/be/uploadData/mongo_backup_2026-08-14T12-27-35/guidePocBonusStar.json`;

async function main() {
    console.log("Reading backup file:", backupFile);
    const data = JSON.parse(fs.readFileSync(backupFile, "utf-8"));
    let modifiedCount = 0;

    // Modify array
    data.forEach(item => {
        if (item.translations && item.translations.en && item.translations.en.description) {
            const raw = stripMarkup(item.translations.en.description);
            if (item.translations.en.descriptionRaw !== raw) {
                item.translations.en.descriptionRaw = raw;
                modifiedCount++;
            }
        }
    });

    console.log(`Modified ${modifiedCount} items in memory. Saving back to file...`);
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), "utf-8");

    console.log("Connecting to MongoDB...");
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    const col = db.collection("guidePocBonusStar");

    console.log("Updating database...");
    let dbModified = 0;
    const operations = [];
    for (const item of data) {
        if (item.translations && item.translations.en && item.translations.en.descriptionRaw) {
            operations.push({
                updateOne: {
                    filter: { bonusStarID: item.bonusStarID },
                    update: { $set: { "translations.en.descriptionRaw": item.translations.en.descriptionRaw } }
                }
            });
        }
    }
    
    if (operations.length > 0) {
        const res = await col.bulkWrite(operations);
        dbModified = res.modifiedCount;
    }
    
    console.log(`Successfully updated ${dbModified} records in DB.`);
    await client.close();
}

main().catch(console.error);
