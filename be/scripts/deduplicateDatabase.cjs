const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({path: './.env'});
require('node:dns').setServers(['8.8.8.8', '8.8.4.4']);

const COLLECTIONS = [
  { name: 'guidePocGuideList', keys: ['slug'], sortKey: 'updatedAt', sortDir: -1 },
  { name: 'guidePocBuilds', keys: ['id'], sortKey: 'views', sortDir: -1 },
  { name: 'guidePocFavoriteBuilds', keys: ['id', 'user_sub'], sortKey: 'createdAt', sortDir: -1 },
  { name: 'guidePocComments', keys: ['buildId', 'id'], sortKey: 'createdAt', sortDir: -1 },
  { name: 'guidePocPlayStyleRating', keys: ['championID', 'userSub'], sortKey: 'createdAt', sortDir: -1 }
];

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME);

  console.log("=== BẮT ĐẦU XÓA DỮ LIỆU TRÙNG LẶP (DEDUPLICATE) ===");
  let totalDeleted = 0;

  for (const col of COLLECTIONS) {
    const collection = db.collection(col.name);
    
    const groupKeys = {};
    col.keys.forEach(k => groupKeys[k] = '$' + k);
    
    const duplicates = await collection.aggregate([
      { $group: { _id: groupKeys, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 }, "_id": { $ne: null } } }
    ]).toArray();
    
    if (duplicates.length === 0) continue;

    console.log(`\nĐang dọn dẹp [${col.name}] - Có ${duplicates.length} nhóm trùng lặp`);
    let collectionDeleteCount = 0;
    const deleteOperations = [];

    for (const dup of duplicates) {
      if (Object.values(dup._id).some(v => v === null || v === undefined)) continue;

      const query = {};
      col.keys.forEach(k => query[k] = dup._id[k]);

      const records = await collection.find(query)
                                      .sort({ [col.sortKey]: col.sortDir })
                                      .toArray();
      
      if (records.length > 1) {
        // Bản ghi tốt nhất giữ lại ở index 0
        const recordsToDelete = records.slice(1);
        
        for (const record of recordsToDelete) {
          deleteOperations.push({
            deleteOne: {
              filter: { _id: new ObjectId(record._id) }
            }
          });
        }
      }
    }
    
    if (deleteOperations.length > 0) {
      const result = await collection.bulkWrite(deleteOperations, { ordered: false });
      console.log(`=> Đã xóa thành công ${result.deletedCount} bản ghi thừa khỏi ${col.name}.`);
      totalDeleted += result.deletedCount;
    }
  }

  console.log(`\n=== HOÀN TẤT DỌN DẸP ===`);
  console.log(`Tổng số bản ghi rác đã bị xóa vĩnh viễn: ${totalDeleted}`);
  
  await client.close();
}

main();
