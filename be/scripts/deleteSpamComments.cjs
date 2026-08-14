const { MongoClient } = require('mongodb');
require('dotenv').config({path: './.env'});
require('node:dns').setServers(['8.8.8.8', '8.8.4.4']);

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME);

  console.log("=== ĐANG TÌM VÀ XÓA BÌNH LUẬN RÁC (XSS SPAM) ===");
  
  const collection = db.collection('guidePocComments');
  
  // Regex tìm các chuỗi phổ biến trong tấn công XSS
  const spamRegex = /<script|<img|onerror=|alert\(|javascript:/i;

  const filter = {
    content: { $regex: spamRegex }
  };

  const spamComments = await collection.find(filter).toArray();
  
  if (spamComments.length > 0) {
    console.log(`Tìm thấy ${spamComments.length} bình luận rác có chứa mã XSS:`);
    spamComments.forEach((c, index) => {
        console.log(`[${index + 1}] ID: ${c._id} | Tác giả: ${c.authorName} | Nội dung: ${c.content}`);
    });

    const result = await collection.deleteMany(filter);
    console.log(`\n=> Đã xóa thành công ${result.deletedCount} bình luận rác khỏi hệ thống!`);
  } else {
    console.log("Tuyệt vời! Không tìm thấy bất kỳ bình luận rác nào.");
  }

  await client.close();
}

main();
