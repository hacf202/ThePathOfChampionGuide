/**
 * restoreToMongo.js
 * Đọc toàn bộ file JSON trong thư mục backup mới nhất
 * và restore (insertMany với drop trước) lên MongoDB Atlas.
 *
 * Cách dùng:
 *   node uploadData/restoreToMongo.js
 *   node uploadData/restoreToMongo.js --backup mongo_backup_2026-05-02T13-40-55
 *   node uploadData/restoreToMongo.js --collection guidePocPowers   (chỉ 1 collection)
 */

import { MongoClient, ServerApiVersion } from "mongodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import dns from "dns";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ép dùng Google DNS (tránh lỗi querySrv ECONNREFUSED)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({ path: path.join(__dirname, "../.env") });

// ─── Tham số CLI ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const backupArg   = args[indexOf(args, "--backup")   + 1];
const collArg     = args[indexOf(args, "--collection") + 1];

function indexOf(arr, val) {
  const i = arr.indexOf(val);
  return i >= 0 ? i : -999; // tránh -1 + 1 = 0 sai
}

// ─── Chọn thư mục backup ────────────────────────────────────────────────────
function getLatestBackupDir() {
  const base = __dirname;
  const dirs = fs.readdirSync(base).filter(f => {
    return f.startsWith("mongo_backup_") &&
      fs.statSync(path.join(base, f)).isDirectory();
  });
  if (!dirs.length) throw new Error("Không tìm thấy thư mục backup nào!");
  dirs.sort(); // ISO date nên sort string là đủ
  return path.join(base, dirs[dirs.length - 1]);
}

const backupDir = backupArg
  ? path.join(__dirname, backupArg)
  : getLatestBackupDir();

console.log(`📂 Thư mục backup: ${backupDir}`);

if (!fs.existsSync(backupDir)) {
  console.error(`❌ Thư mục không tồn tại: ${backupDir}`);
  process.exit(1);
}

// ─── Đọc manifest để biết thứ tự và tên collection ─────────────────────────
const manifestPath = path.join(backupDir, "_manifest.json");
let manifest = null;
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  console.log(`📋 Manifest: DB=${manifest.dbName}, backup=${manifest.backupDate}`);
}

// Xây dựng danh sách { collection, filePath }
function buildRestoreList() {
  const list = [];

  if (manifest?.results) {
    for (const entry of manifest.results) {
      // Tên file = <collection>.json (theo chuẩn sau khi đồng bộ)
      const fileName = entry.file || `${entry.collection}.json`;
      const filePath = path.join(backupDir, fileName);
      if (fs.existsSync(filePath)) {
        list.push({ collection: entry.collection, filePath });
      } else {
        console.warn(`⚠️  Bỏ qua (file không tồn tại): ${fileName}`);
      }
    }
  } else {
    // Fallback: quét tất cả *.json trong thư mục
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith(".json") && f !== "_manifest.json");
    for (const f of files) {
      list.push({ collection: path.basename(f, ".json"), filePath: path.join(backupDir, f) });
    }
  }

  // Lọc theo --collection nếu có
  if (collArg) {
    return list.filter(e => e.collection === collArg);
  }
  return list;
}

const restoreList = buildRestoreList();

if (!restoreList.length) {
  console.error("❌ Không có collection nào để restore.");
  process.exit(1);
}

// ─── Kết nối MongoDB ─────────────────────────────────────────────────────────
const MONGODB_URI    = process.env.MONGODB_URI;
const MONGODB_DB     = process.env.MONGODB_DB_NAME || "guidePoc";
const BATCH_SIZE     = 500;

if (!MONGODB_URI) {
  console.error("❌ Thiếu biến môi trường MONGODB_URI trong file .env");
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

// ─── Hàm restore một collection ─────────────────────────────────────────────
async function restoreCollection(db, collectionName, filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const docs = JSON.parse(raw);

  if (!Array.isArray(docs)) {
    console.warn(`  ⚠️  ${collectionName}: Không phải Array, bỏ qua.`);
    return { skipped: true };
  }

  if (docs.length === 0) {
    console.log(`  ℹ️  ${collectionName}: File rỗng (0 docs), bỏ qua insert.`);
    return { inserted: 0 };
  }

  // Xóa _id để tránh duplicate key khi upsert nhiều lần
  const cleanDocs = docs.map(d => {
    const { _id, ...rest } = d;
    return rest;
  });

  // Drop collection cũ rồi insert mới (restore sạch)
  const coll = db.collection(collectionName);
  await coll.drop().catch(() => {}); // bỏ qua lỗi nếu collection chưa tồn tại

  let inserted = 0;
  for (let i = 0; i < cleanDocs.length; i += BATCH_SIZE) {
    const batch = cleanDocs.slice(i, i + BATCH_SIZE);
    const result = await coll.insertMany(batch, { ordered: false });
    inserted += result.insertedCount;
    process.stdout.write(`\r  ⏳ ${collectionName}: ${inserted}/${cleanDocs.length} docs`);
  }
  process.stdout.write("\n");

  return { inserted };
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Kết nối MongoDB thành công!\n");

    const db = client.db(MONGODB_DB);

    const summary = [];
    for (const { collection, filePath } of restoreList) {
      console.log(`\n🔄 Restore: [${collection}]`);
      try {
        const result = await restoreCollection(db, collection, filePath);
        summary.push({ collection, ...result, success: true });
      } catch (err) {
        console.error(`  ❌ Lỗi: ${err.message}`);
        summary.push({ collection, success: false, error: err.message });
      }
    }

    console.log("\n════════════════════════════════════════");
    console.log("📊 KẾT QUẢ RESTORE:");
    console.log("════════════════════════════════════════");
    for (const r of summary) {
      if (r.skipped)  console.log(`  ⚠️  ${r.collection}: Bỏ qua (không phải array)`);
      else if (!r.success) console.log(`  ❌ ${r.collection}: Thất bại - ${r.error}`);
      else console.log(`  ✅ ${r.collection}: ${r.inserted} docs`);
    }
    console.log("════════════════════════════════════════\n");

  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error("💀 Lỗi nghiêm trọng:", err);
  process.exit(1);
});
