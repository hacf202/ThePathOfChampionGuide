import { MongoClient, ServerApiVersion } from 'mongodb';
import dns from 'dns';

// Ép Node.js sử dụng Google DNS để tránh lỗi querySrv ECONNREFUSED của các nhà mạng
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

// Khởi tạo client bên ngoài để tận dụng cơ chế module caching của Node.js
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Tối ưu cho Serverless (Vercel):
  maxPoolSize: 10,                 // Giới hạn số kết nối cho mỗi instance
  serverSelectionTimeoutMS: 5000, 
  socketTimeoutMS: 45000,
});

let db = null;
let connectionPromise = null; // Dùng promise để tránh việc gọi connect nhiều lần cùng lúc

export async function connectToMongoDB() {
  // 1. Nếu đã có kết nối và db, trả về ngay
  if (db) return db;

  // 2. Nếu đang trong quá trình kết nối, chờ promise đó xong để tránh race condition
  if (!connectionPromise) {
    connectionPromise = client.connect().then(() => {
      const dbName = process.env.MONGODB_DB_NAME || "guidePoc";
      db = client.db(dbName);
      console.log("✅ MongoDB Connected & Cached");
      return db;
    }).catch(err => {
      connectionPromise = null; // Reset nếu lỗi để lần sau có thể thử lại
      console.error("❌ MongoDB connection error:", err);
      throw err;
    });
  }

  return connectionPromise;
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToMongoDB first.");
  }
  return db;
}

export default client;
