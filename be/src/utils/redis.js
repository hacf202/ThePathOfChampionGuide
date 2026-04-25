import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL;

let kv = null;

if (REDIS_URL) {
	try {
		kv = new Redis(REDIS_URL, {
			// Tối ưu cho serverless: giảm số lượng retry và timeout để tránh treo function
			maxRetriesPerRequest: 1,
			connectTimeout: 10000,
		});

		kv.on("connect", () => console.log("[Redis] Connected to Redis instance via REDIS_URL."));
		kv.on("error", (err) => {
			if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
				console.error("[Redis] Connection failed. Using memory fallback.");
			} else {
				console.error("[Redis] Error:", err.message);
			}
		});
	} catch (error) {
		console.error("[Redis] Failed to initialize Redis client:", error);
	}
} else {
	console.log("[Redis] No REDIS_URL found. Falling back to memory cache.");
}

export default kv;
