import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import dns from 'dns';

// Ép Node.js sử dụng Google DNS để tránh lỗi querySrv ECONNREFUSED của các nhà mạng
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

export async function connectToMongoDB() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    // Lưu lại instance của database để dùng sau này
    const dbName = process.env.MONGODB_DB_NAME || "guidePoc";
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToMongoDB first.");
  }
  return db;
}

export default client;
