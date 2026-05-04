import Redis from "ioredis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const REDIS_URL = process.env.REDIS_URL;

async function flushPublicBuilds() {
    if (!REDIS_URL) {
        console.log("No REDIS_URL found in .env");
        return;
    }
    const kv = new Redis(REDIS_URL);
    try {
        const pattern = "poc:public_builds:*";
        console.log(`Scanning for keys matching: ${pattern}`);
        
        let cursor = "0";
        let deletedCount = 0;
        
        do {
            const [nextCursor, keys] = await kv.scan(cursor, "MATCH", pattern, "COUNT", 100);
            cursor = nextCursor;
            
            if (keys.length > 0) {
                await kv.del(...keys);
                deletedCount += keys.length;
                console.log(`Deleted ${keys.length} keys:`, keys);
            }
        } while (cursor !== "0");
        
        console.log(`\n✅ Finished! Total keys deleted: ${deletedCount}`);

    } catch (err) {
        console.error("Error flushing Redis:", err);
    } finally {
        await kv.quit();
    }
}

flushPublicBuilds();
