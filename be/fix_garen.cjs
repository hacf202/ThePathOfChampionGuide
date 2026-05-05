
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const uriMatch = env.match(/MONGODB_URI=["']?(.+?)["']?(\s|$)/);
if (!uriMatch) {
    console.error('Could not find MONGODB_URI in .env');
    process.exit(1);
}
const uri = uriMatch[1];

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('guidePoc');
        const res = await db.collection('guidePocChampionList').updateOne(
            { championID: 'C011' },
            { $set: { cardCode: '01DE012' } }
        );
        console.log('Update Result:', res);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
        process.exit(0);
    }
}
run();
