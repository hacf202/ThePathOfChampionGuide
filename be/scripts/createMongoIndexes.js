import dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';
import dns from 'node:dns';

// Fix lỗi DNS của nhà mạng Việt Nam khi connect MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri || !dbName) {
  console.error("Vui lòng cấu hình MONGODB_URI và MONGODB_DB_NAME trong file .env");
  process.exit(1);
}

const client = new MongoClient(uri);

async function createIndexes() {
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`Đã kết nối tới cơ sở dữ liệu: ${dbName}`);

    // ==========================================
    // NHÓM 1: CORE DATA (Dữ liệu tĩnh / Hệ thống)
    // Các trường ID chính được thiết lập là UNIQUE để tránh trùng lặp
    // ==========================================
    console.log("Đang tạo index cho Nhóm 1 (Core Data)...");
    await db.collection("guidePocChampionList").createIndex({ championID: 1 }, { unique: true });
    await db.collection("guidePocPowers").createIndex({ powerCode: 1 }, { unique: true });
    await db.collection("guidePocRelics").createIndex({ relicCode: 1 }, { unique: true });
    await db.collection("guidePocItems").createIndex({ itemCode: 1 }, { unique: true });
    await db.collection("guidePocRunes").createIndex({ runeCode: 1 }, { unique: true });
    await db.collection("guidePocBosses").createIndex({ bossID: 1 }, { unique: true });
    await db.collection("guidePocAdventureMap").createIndex({ adventureID: 1 }, { unique: true });
    await db.collection("guidePocBonusStar").createIndex({ bonusStarID: 1 }, { unique: true });
    await db.collection("guidePocChampionConstellation").createIndex({ constellationID: 1 }, { unique: true });
    await db.collection("guidePocGuideList").createIndex({ slug: 1 }, { unique: true });
    
    // Bảng Cards có thêm index cho các bộ lọc thường dùng
    await db.collection("guidePocCardList").createIndex({ cardCode: 1 }, { unique: true });
    await db.collection("guidePocCardList").createIndex({ type: 1 });
    await db.collection("guidePocCardList").createIndex({ regions: 1 });

    // ==========================================
    // NHÓM 2: USER GENERATED CONTENT (Dữ liệu người dùng)
    // Cần các Composite Index để thay thế cho GSI của DynamoDB
    // ==========================================
    console.log("Đang tạo index cho Nhóm 2 (UGC)...");

    // Bảng Builds
    const buildsCol = db.collection("guidePocBuilds");
    await buildsCol.createIndex({ id: 1 }, { unique: true });
    // Dùng cho API top-by-champion
    await buildsCol.createIndex({ championID: 1, display: 1, views: -1 });
    // Dùng cho API my-builds
    await buildsCol.createIndex({ creator: 1, createdAt: -1 });
    // Dùng cho lấy danh sách public
    await buildsCol.createIndex({ display: 1, createdAt: -1 });

    // Bảng Favorites
    const favCol = db.collection("guidePocFavoriteBuilds");
    // Khóa chính: id của build và user_sub
    await favCol.createIndex({ id: 1, user_sub: 1 }, { unique: true });
    // Để đếm số lượt thích của một build nhanh chóng
    await favCol.createIndex({ id: 1 });
    // Để lấy danh sách yêu thích của user (Sắp xếp mới nhất)
    await favCol.createIndex({ user_sub: 1, createdAt: -1 });

    // Bảng Comments
    const cmtCol = db.collection("guidePocComments");
    // Khóa chính
    await cmtCol.createIndex({ buildId: 1, id: 1 }, { unique: true });
    // Lấy comment của 1 bài build
    await cmtCol.createIndex({ buildId: 1, createdAt: 1 });
    // Lấy danh sách comment mới nhất toàn hệ thống
    await cmtCol.createIndex({ type: 1, createdAt: -1 });

    // Bảng Ratings
    const rateCol = db.collection("guidePocPlayStyleRating");
    // Mỗi user chỉ đánh giá 1 tướng 1 lần
    await rateCol.createIndex({ championID: 1, userSub: 1 }, { unique: true });
    // Lấy tất cả đánh giá của 1 tướng
    await rateCol.createIndex({ championID: 1 });
    // Lấy đánh giá mới nhất (Cho trang chủ hoặc admin)
    await rateCol.createIndex({ reviewType: 1, createdAt: -1 });

    // Bảng AuditLogs
    const logCol = db.collection("guidePocAuditLogs");
    await logCol.createIndex({ logId: 1 }, { unique: true });
    // Phục vụ các bộ lọc Admin
    await logCol.createIndex({ timestamp: -1 });
    await logCol.createIndex({ entityType: 1, timestamp: -1 });
    await logCol.createIndex({ action: 1, timestamp: -1 });
    await logCol.createIndex({ userId: 1, timestamp: -1 });
    await logCol.createIndex({ logType: 1, timestamp: -1 });

    console.log("Đã tạo toàn bộ Indexes thành công! Cơ sở dữ liệu hiện đã được tối ưu hóa tối đa.");

  } catch (err) {
    console.error("Lỗi khi tạo index:", err);
  } finally {
    await client.close();
  }
}

createIndexes();
