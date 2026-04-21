// src/routes/search.js
/**
 * @route   GET /api/search/index
 * @desc    Trả về Search Index — chỉ gồm id + tên VI + tên EN cho tất cả thực thể
 *          Phục vụ GlobalSearch trên Frontend. Nhẹ, nhanh, có cache riêng.
 *
 * Response format:
 * {
 *   champions: [{ id, nameVi, nameEn }],
 *   relics:    [{ id, nameVi, nameEn }],
 *   powers:    [{ id, nameVi, nameEn }],
 *   items:     [{ id, nameVi, nameEn }],
 *   runes:     [{ id, nameVi, nameEn }],
 *   cards:     [{ id, nameVi, nameEn }],
 *   resources: [{ id, nameVi, nameEn }],
 * }
 */

import express from "express";
import cacheManager from "../utils/cacheManager.js";

// Tận dụng DataService (tránh lấy vòng lặp)
import { 
	getCachedChampions, getCachedRelics, getCachedPowers, 
	getCachedItems, getCachedRunes, getCachedCards,
	getCachedBosses, getCachedAdventures
} from "../services/dataService.js";
import { getCachedResources } from "./resources.js";

const router = express.Router();

// Cache riêng cho search index — TTL 24h
const searchIndexCache = cacheManager.getOrCreateCache("search_index", {
	stdTTL: 86400,
	checkperiod: 120,
});
const CACHE_KEY = "global_search_index";

/**
 * Trim dữ liệu thực thể — chỉ giữ id + tên
 */
function mapBosses(list) {
	return (list || []).map(b => ({
		id:     b.bossID,
		nameVi: b.bossName || "",
		nameEn: b.translations?.en?.bossName || b.translations?.en?.name || "",
	}));
}

function mapAdventures(list) {
	return (list || []).map(a => ({
		id:     a.adventureID,
		nameVi: a.adventureName || "",
		nameEn: a.translations?.en?.adventureName || a.translations?.en?.name || "",
	}));
}

function mapChampions(list) {
	return list.map(c => ({
		id:     c.championID,
		nameVi: c.name || "",
		nameEn: c.translations?.en?.name || "",
	}));
}

function mapRelics(list) {
	return list.map(r => ({
		id:     r.relicCode,
		nameVi: r.name || "",
		nameEn: r.translations?.en?.name || "",
	}));
}

function mapPowers(list) {
	return list.map(p => ({
		id:     p.powerCode,
		nameVi: p.name || "",
		nameEn: p.translations?.en?.name || "",
	}));
}

function mapItems(list) {
	return list.map(i => ({
		id:     i.itemCode,
		nameVi: i.name || "",
		nameEn: i.translations?.en?.name || "",
	}));
}

function mapRunes(list) {
	return list.map(r => ({
		id:     r.runeCode,
		nameVi: r.name || "",
		nameEn: r.translations?.en?.name || "",
	}));
}

function mapCards(list) {
	return list.map(c => ({
		id:     c.cardCode,
		nameVi: c.cardName || c.name || "",
		nameEn: c.translations?.en?.cardName || c.translations?.en?.name || "",
	}));
}

function mapResources(list) {
	return (list || []).map(r => ({
		id:     r.id,
		nameVi: r.name || "",
		nameEn: r.name_en || "",
	}));
}

/**
 * GET /api/search/index
 */
router.get("/index", async (req, res) => {
	try {
		// Trả cache ngay nếu có
		const cached = searchIndexCache.get(CACHE_KEY);
		if (cached) {
			res.set("X-Cache", "HIT");
			return res.json(cached);
		}

		// Lấy song song từ các cache hiện có
		const [champions, relics, powers, items, runes, cards, resourceData, bosses, adventures] = await Promise.all([
			getCachedChampions(),
			getCachedRelics(),
			getCachedPowers(),
			getCachedItems(),
			getCachedRunes(),
			getCachedCards(),
			getCachedResources(),
			getCachedBosses(),
			getCachedAdventures(),
		]);

		const index = {
			champions: mapChampions(champions),
			relics:    mapRelics(relics),
			powers:    mapPowers(powers),
			items:     mapItems(items),
			runes:     mapRunes(runes),
			cards:     mapCards(cards),
			resources: mapResources(resourceData),
			bosses:    mapBosses(bosses),
			adventures: mapAdventures(adventures),
			// Thống kê cho debug
			_meta: {
				total: (champions?.length || 0) + (relics?.length || 0) + (powers?.length || 0) + 
					   (items?.length || 0) + (runes?.length || 0) + (cards?.length || 0) + 
					   (resourceData?.length || 0) + (bosses?.length || 0) + (adventures?.length || 0),
				cachedAt: new Date().toISOString(),
			},
		};

		// Lưu vào cache search index riêng
		searchIndexCache.set(CACHE_KEY, index);

		res.set("X-Cache", "MISS");
		res.json(index);
	} catch (error) {
		console.error("Search Index Error:", error);
		res.status(500).json({ error: "Không thể tạo search index." });
	}
});

/**
 * POST /api/search/invalidate
 */
router.post("/invalidate", (req, res) => {
	searchIndexCache.del(CACHE_KEY);
	res.json({ message: "Search index cache cleared.", key: CACHE_KEY });
});

export default router;
