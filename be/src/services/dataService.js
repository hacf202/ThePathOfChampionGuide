// be/src/services/dataService.js
/**
 * DataService - Tầng dịch vụ trung tâm cho việc nạp và cache dữ liệu.
 *
 * Mục đích:
 *   - Gom toàn bộ các hàm getCached*() vào một nơi duy nhất.
 *   - Loại bỏ import chéo giữa các route files (vd: bosses.js import từ powers.js).
 *   - Cung cấp hàm batchFetchByIds() dùng chung cho tất cả các module.
 *
 * Cách dùng:
 *   import { getCachedPowers, getCachedChampions } from "../services/dataService.js";
 */

import { unmarshall } from "@aws-sdk/util-dynamodb";
import { BatchGetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

import cacheManager from "../utils/cacheManager.js";
import { CACHE_KEYS } from "../utils/cacheKeys.js";
import { scanAll } from "../utils/dynamoUtils.js";
import client from "../config/db.js";

// --- Cache Instances ---
const powerCache    = cacheManager.getOrCreateCache("powers",    { stdTTL: 86400, checkperiod: 60 });
const relicCache    = cacheManager.getOrCreateCache("relics",    { stdTTL: 86400, checkperiod: 60 });
const itemCache     = cacheManager.getOrCreateCache("items",     { stdTTL: 86400, checkperiod: 60 });
const runeCache     = cacheManager.getOrCreateCache("runes",     { stdTTL: 86400, checkperiod: 60 });
const championCache = cacheManager.getOrCreateCache("champions", { stdTTL: 1800,  checkperiod: 60 });
const bossCache     = cacheManager.getOrCreateCache("bosses",    { stdTTL: 86400, checkperiod: 60 });
const adventureCache = cacheManager.getOrCreateCache("adventures", { stdTTL: 86400, checkperiod: 60 });
const cardCache      = cacheManager.getOrCreateCache("cards",      { stdTTL: 86400, checkperiod: 60 });

// --- Table Names ---
const TABLES = {
	POWERS:     "guidePocPowers",
	RELICS:     "guidePocRelics",
	ITEMS:      "guidePocItems",
	RUNES:      "guidePocRunes",
	CHAMPIONS:  "guidePocChampionList",
	BOSSES:     "guidePocBosses",
	ADVENTURES: "guidePocAdventureMap",
	CARDS:      "guidePocCardList",
};

// ─────────────────────────────────────────────────────────────
// GENERIC HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Nạp toàn bộ dữ liệu từ một bảng DynamoDB vào cache (Generic).
 * @private
 */
async function loadAll(cache, cacheKey, tableName, sortField = "name") {
	let data = await cache.get(cacheKey);
	if (!data) {
		const rawItems = await scanAll(client, { TableName: tableName });
		data = rawItems.map(item => unmarshall(item));
		data.sort((a, b) => (a[sortField] || "").localeCompare(b[sortField] || ""));
		await cache.set(cacheKey, data);
	}
	return data;
}

/**
 * Tải hàng loạt dữ liệu từ DynamoDB theo danh sách IDs (BatchGet).
 * Hỗ trợ paging (tối đa 100 items/lần theo giới hạn AWS).
 *
 * @param {string} tableName - Tên bảng DynamoDB
 * @param {string} keyName   - Tên khoá chính (partition key)
 * @param {string[]} ids     - Danh sách ID cần lấy
 * @returns {Promise<Object[]>}
 */
export async function batchFetchByIds(tableName, keyName, ids) {
	if (!ids || ids.length === 0) return [];
	try {
		const distinctIds = [...new Set(ids.filter(Boolean).map(id => String(id).trim()))];
		if (distinctIds.length === 0) return [];

		const results = [];
		for (let i = 0; i < distinctIds.length; i += 100) {
			const chunk = distinctIds.slice(i, i + 100);
			const keys = chunk.map(id => marshall({ [keyName]: id }));
			const response = await client.send(new BatchGetItemCommand({
				RequestItems: { [tableName]: { Keys: keys } }
			}));
			if (response.Responses?.[tableName]) {
				results.push(...response.Responses[tableName].map(item => unmarshall(item)));
			}
		}
		return results;
	} catch (e) {
		console.error(`[DataService] BatchFetch lỗi [${tableName}]:`, e);
		return [];
	}
}

// ─────────────────────────────────────────────────────────────
// PUBLIC CACHE GETTERS
// ─────────────────────────────────────────────────────────────

/** Lấy toàn bộ Sức mạnh (Powers) từ RAM hoặc DynamoDB */
export async function getCachedPowers() {
	return loadAll(powerCache, CACHE_KEYS.POWERS.ALL, TABLES.POWERS);
}

/** Lấy toàn bộ Cổ vật (Relics) từ RAM hoặc DynamoDB */
export async function getCachedRelics() {
	return loadAll(relicCache, CACHE_KEYS.RELICS.ALL, TABLES.RELICS);
}

/** Lấy toàn bộ Vật phẩm (Items) từ RAM hoặc DynamoDB */
export async function getCachedItems() {
	return loadAll(itemCache, CACHE_KEYS.ITEMS.ALL, TABLES.ITEMS);
}

/** Lấy toàn bộ Ngọc (Runes) từ RAM hoặc DynamoDB */
export async function getCachedRunes() {
	return loadAll(runeCache, CACHE_KEYS.RUNES.ALL, TABLES.RUNES);
}

/** Lấy toàn bộ Tướng (Champions) từ RAM hoặc DynamoDB */
export async function getCachedChampions() {
	return loadAll(championCache, CACHE_KEYS.CHAMPIONS.ALL, TABLES.CHAMPIONS);
}

/** Lấy toàn bộ Boss từ RAM hoặc DynamoDB */
export async function getCachedBosses() {
	return loadAll(bossCache, CACHE_KEYS.BOSSES.ALL, TABLES.BOSSES, "bossName");
}

/** Lấy toàn bộ Adventures (Bản đồ) từ RAM hoặc DynamoDB */
export async function getCachedAdventures() {
	return loadAll(adventureCache, CACHE_KEYS.ADVENTURES.ALL, TABLES.ADVENTURES, "difficulty");
}

/** Lấy toàn bộ Cards (Lá bài) từ RAM hoặc DynamoDB */
export async function getCachedCards() {
	return loadAll(cardCache, CACHE_KEYS.CARDS.ALL, TABLES.CARDS, "cardName");
}

// ─────────────────────────────────────────────────────────────
// CACHE INVALIDATION HELPERS
// ─────────────────────────────────────────────────────────────

/** Xóa cache của Powers khi dữ liệu thay đổi */
export async function invalidatePowerCache(powerCode) {
	await powerCache.del(CACHE_KEYS.POWERS.ALL);
	if (powerCode) await powerCache.del(CACHE_KEYS.POWERS.DETAIL(powerCode));
}

/** Xóa cache của Relics khi dữ liệu thay đổi */
export async function invalidateRelicCache(relicCode) {
	await relicCache.del(CACHE_KEYS.RELICS.ALL);
	if (relicCode) await relicCache.del(CACHE_KEYS.RELICS.DETAIL(relicCode));
}

/** Xóa cache của Items khi dữ liệu thay đổi */
export async function invalidateItemCache(itemCode) {
	await itemCache.del(CACHE_KEYS.ITEMS.ALL);
	if (itemCode) await itemCache.del(CACHE_KEYS.ITEMS.DETAIL(itemCode));
}

/** Xóa cache của Runes khi dữ liệu thay đổi */
export async function invalidateRuneCache(runeCode) {
	await runeCache.del(CACHE_KEYS.RUNES.ALL);
	if (runeCode) await runeCache.del(CACHE_KEYS.RUNES.DETAIL(runeCode));
}

/** Xóa cache của Champions khi dữ liệu thay đổi */
export async function invalidateChampionCache(championID) {
	await championCache.del(CACHE_KEYS.CHAMPIONS.ALL);
	if (championID) await championCache.del(CACHE_KEYS.CHAMPIONS.DETAIL(championID));
}

/** Xóa toàn bộ cache của Bosses khi dữ liệu thay đổi */
export async function invalidateBossCache() {
	await bossCache.flushAll();
}

/** Xóa cache của Adventures khi dữ liệu thay đổi */
export async function invalidateAdventureCache() {
	await adventureCache.flushAll();
}

/** Xóa cache của Cards khi dữ liệu thay đổi */
export async function invalidateCardCache(cardCode) {
	await cardCache.del(CACHE_KEYS.CARDS.ALL);
	if (cardCode) await cardCache.del(CACHE_KEYS.CARDS.DETAIL(cardCode));
}

// ─────────────────────────────────────────────────────────────
// RESOLVE HELPERS (Boss Powers, Champion Data, etc.)
// ─────────────────────────────────────────────────────────────

/**
 * Gộp dữ liệu Power đầy đủ vào từng Boss (bằng cách tra cứu powerMap).
 * @param {Object|Object[]} bosses - Một boss hoặc mảng boss
 * @returns {Promise<Object|Object[]>}
 */
export async function resolveBossPowers(bosses) {
	if (!bosses) return bosses;
	const isArray = Array.isArray(bosses);
	const items = isArray ? bosses : [bosses];

	try {
		const allPowers = await getCachedPowers();
		const powerMap = Object.fromEntries(allPowers.map(p => [p.powerCode, p]));

		items.forEach(boss => {
			let powerIds = boss.power || boss.powerIds || [];
			if (typeof powerIds === "string") powerIds = [powerIds];
			boss.resolvedPowers = powerIds.map(id => powerMap[id]).filter(Boolean);
		});
	} catch (error) {
		console.error("[DataService] Lỗi khi resolve boss powers:", error);
	}

	return isArray ? items : items[0];
}
