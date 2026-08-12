const { MongoClient } = require('mongodb');
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

  console.log("=== BẮT ĐẦU CHẠY NHÁP (DRY-RUN) ===");
  let totalToDelete = 0;

  for (const col of COLLECTIONS) {
    const collection = db.collection(col.name);
    
    const groupKeys = {};
    col.keys.forEach(k => groupKeys[k] = '$' + k);
    
    const duplicates = await collection.aggregate([
      { $group: { _id: groupKeys, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 }, "_id": { $ne: null } } }
    ]).toArray();
    
    if (duplicates.length === 0) continue;

    console.log(`\n🔍 Đang phân tích [${col.name}] - Có ${duplicates.length} nhóm trùng lặp`);
    let collectionDeleteCount = 0;

    for (const dup of duplicates) {
      // Bỏ qua nếu có field null
      if (Object.values(dup._id).some(v => v === null || v === undefined)) continue;

      const query = {};
      col.keys.forEach(k => query[k] = dup._id[k]);

      // Tìm tất cả các bản ghi trùng lặp này, sort theo field ưu tiên
      const records = await collection.find(query)
                                      .sort({ [col.sortKey]: col.sortDir })
                                      .toArray();
      
      if (records.length > 1) {
        // Bản ghi tốt nhất giữ lại ở index 0
        const bestRecord = records[0];
        // Các bản ghi còn lại sẽ bị xóa
        const recordsToDelete = records.slice(1);
        collectionDeleteCount += recordsToDelete.length;

        // In log mẫu 1 cái để xem logic
        if (col.name === 'guidePocBuilds' && totalToDelete === 0) {
           console.log(`  [MẪU LOG] Trùng id: ${query.id}`);
           console.log(`    -> GIỮ LẠI: views=${bestRecord.views || 0}, like=${bestRecord.like || 0}`);
           console.log(`    -> SẼ XÓA : ${recordsToDelete.length} bản ghi (views=${recordsToDelete[0].views || 0})`);
        }
      }
    }
    
    console.log(`=> Sẽ xóa tổng cộng ${collectionDeleteCount} bản ghi thừa khỏi ${col.name}.`);
    totalToDelete += collectionDeleteCount;
  }

  console.log(`\n=== TỔNG KẾT DRY-RUN ===`);
  console.log(`Tổng số bản ghi sẽ bị xóa trên toàn DB: ${totalToDelete}`);
  console.log(`Không có dữ liệu nào bị xóa thực sự trong lần chạy này.`);
  
  await client.close();
}

main();
