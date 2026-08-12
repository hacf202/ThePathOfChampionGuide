import Redis from "ioredis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const REDIS_URL = process.env.REDIS_URL;

async function flushAll() {
    if (!REDIS_URL) {
        console.log("No REDIS_URL found in .env");
        return;
    }
    const kv = new Redis(REDIS_URL);
    try {
        console.log("Xóa toàn bộ cache Redis...");
        await kv.flushdb();
        console.log("✅ Xóa cache Redis thành công!");
    } catch (err) {
        console.error("Lỗi:", err);
    } finally {
        await kv.quit();
    }
}
flushAll();
