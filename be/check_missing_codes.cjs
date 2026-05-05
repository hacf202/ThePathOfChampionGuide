
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const uriMatch = env.match(/MONGODB_URI=["']?(.+?)["']?(\s|$)/);
const uri = uriMatch[1];

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('guidePoc');
        const items = await db.collection('guidePocChampionList').find({}).toArray();
        const missing = items.filter(i => !i.cardCode);
        console.log(`Total: ${items.length}`);
        console.log(`Missing: ${missing.length}`);
        console.log(`Names: ${missing.map(m => m.name).join(', ')}`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
        process.exit(0);
    }
}
run();
