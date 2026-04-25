// be/src/routes/resources.js
import express from "express";
import fs from "fs/promises";
import path from "path";
import cacheManager from "../utils/cacheManager.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const resourceCache = cacheManager.getOrCreateCache("resources", { stdTTL: 86400, checkperiod: 60 });
const DATA_PATH = path.join(__dirname, "../../data/resources.json");

/**
 * Hàm lấy toàn bộ Tài nguyên từ file JSON hoặc RAM.
 */
export async function getCachedResources() {
	const CACHE_KEY = "all_resources_data";
	let cachedData = await resourceCache.get(CACHE_KEY);

	if (!cachedData) {
		try {
			const rawData = await fs.readFile(DATA_PATH, "utf8");
			cachedData = JSON.parse(rawData);
			// Sắp xếp mặc định A-Z theo tên Vietnamese
			cachedData.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
			await resourceCache.set(CACHE_KEY, cachedData);
		} catch (error) {
			console.error("Lỗi khi đọc file resources.json:", error);
			return [];
		}
	}
	return cachedData;
}

/**
 * @route   GET /api/resources
 * @desc    Lấy danh sách tài nguyên (Phục vụ SEO và Listing)
 */
router.get("/", async (req, res) => {
	try {
		const allResources = await getCachedResources();
		res.json(allResources);
	} catch (error) {
		res.status(500).json({ error: "Không thể lấy danh sách tài nguyên." });
	}
});

/**
 * @route   GET /api/resources/:id
 * @desc    Lấy chi tiết một tài nguyên
 */
router.get("/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const allResources = await getCachedResources();
		const resource = allResources.find(r => r.id === id);
		if (!resource) {
			return res.status(404).json({ error: "Không tìm thấy tài nguyên." });
		}
		res.json(resource);
	} catch (error) {
		res.status(500).json({ error: "Lỗi hệ thống." });
	}
});

export default router;
