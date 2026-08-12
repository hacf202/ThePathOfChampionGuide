const { MongoClient } = require('mongodb');
require('dotenv').config({path: './.env'});
require('node:dns').setServers(['8.8.8.8', '8.8.4.4']);

const COLLECTIONS = [
  { name: 'guidePocChampionList', keys: ['championID'] },
  { name: 'guidePocPowers', keys: ['powerCode'] },
  { name: 'guidePocRelics', keys: ['relicCode'] },
  { name: 'guidePocItems', keys: ['itemCode'] },
  { name: 'guidePocRunes', keys: ['runeCode'] },
  { name: 'guidePocBosses', keys: ['bossID'] },
  { name: 'guidePocAdventureMap', keys: ['adventureID'] },
  { name: 'guidePocBonusStar', keys: ['bonusStarID'] },
  { name: 'guidePocChampionConstellation', keys: ['constellationID'] },
  { name: 'guidePocGuideList', keys: ['slug'] },
  { name: 'guidePocCardList', keys: ['cardCode'] },
  { name: 'guidePocBuilds', keys: ['id'] },
  { name: 'guidePocFavoriteBuilds', keys: ['id', 'user_sub'] },
  { name: 'guidePocComments', keys: ['buildId', 'id'] },
  { name: 'guidePocPlayStyleRating', keys: ['championID', 'userSub'] },
  { name: 'guidePocAuditLogs', keys: ['logId'] }
];

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME);

  console.log("Đang kiểm tra các bảng bị trùng lặp...");
  let hasDuplicate = false;

  for (const col of COLLECTIONS) {
    const collection = db.collection(col.name);
    
    const groupKeys = {};
    col.keys.forEach(k => groupKeys[k] = '$' + k);
    
    const duplicates = await collection.aggregate([
      { $group: { _id: groupKeys, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 }, "_id": { $ne: null } } }
    ]).toArray();
    
    // Check if there are any keys where the ID is actually missing/null but grouped
    const nulls = duplicates.filter(d => {
        return Object.values(d._id).some(v => v === null || v === undefined);
    });

    if (duplicates.length > 0) {
      console.log(`❌ Bảng ${col.name} có ${duplicates.length} nhóm trùng lặp khóa chính.`);
      hasDuplicate = true;
    } else {
        console.log(`✅ Bảng ${col.name} sạch (không trùng).`);
    }
  }

  if (!hasDuplicate) {
    console.log("Không phát hiện lỗi trùng lặp nào.");
  }
  
  await client.close();
}

main();
