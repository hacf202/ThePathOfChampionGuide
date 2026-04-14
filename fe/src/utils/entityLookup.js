import axios from "axios";
import globalsEn from "../assets/data/globals-en_us.json";
import globalsVi from "../assets/data/globals-vi_vn.json";

/**
 * entityLookup - Bộ não tra cứu toàn bộ dữ liệu Wiki LoR
 * Cơ chế: Nạp động từ Backend và lưu vào Cache RAM.
 */

const dataStore = {
	en: {
		keywords: globalsEn.keywords || [],
		vocabTerms: globalsEn.vocabTerms || [],
		champions: [],
		relics: [],
		powers: [],
		items: [],
		runes: [],
		cards: [],
	},
	vi: {
		keywords: globalsVi.keywords || [],
		vocabTerms: globalsVi.vocabTerms || [],
		champions: [],
		relics: [],
		powers: [],
		items: [],
		runes: [],
		cards: [],
	},
};
const investigatedIds = new Set(); // Chứa chuỗi dạng "type:id" hoặc "type:name" đã được tra cứu (kể cả thất bại)
let preloadPromise = null;

export const checkCache = (id, type, lang = "vi") => {
    // 1. Kiểm tra trong Negative Cache (đã tra cứu rồi bài trừ lặp lại)
    if (investigatedIds.has(`${type}:${id}`)) return true;

    const cur = lang === "en" ? "en" : "vi";
    const db = dataStore[cur];
    const typeMap = {
        c: "champions", champion: "champions",
        r: "relics", relic: "relics",
        p: "powers", power: "powers",
        i: "items", item: "items",
        rune: "runes",
        cd: "cards", card: "cards"
    };
    
    const storeType = typeMap[type] || type;
    if (!db[storeType]) return false;

    const idFieldMap = {
        champions: "championID",
        relics: "relicCode",
        powers: "powerCode",
        items: "itemCode",
        runes: "runeCode",
        cards: "cardCode"
    };
    const idField = idFieldMap[storeType];
    
    const found = db[storeType].some(item => 
        (idField && item[idField] === id) || 
        item.championID === id || item.name === id
    );

    // Nếu tìm thấy, đánh dấu luôn để lần sau check âm tính nhanh hơn
    if (found) investigatedIds.add(`${type}:${id}`);
    
    return found;
};

/**
 * Đánh dấu các ID đã được tra cứu nhưng không tìm thấy (Negative Cache)
 */
export const markInvestigated = (id, type) => {
    investigatedIds.add(`${type}:${id}`);
};

/**
 * Nạp dữ liệu mới vào cache
 */
export const initEntities = async (incomingData = [], type = "cards") => {
	if (!incomingData || incomingData.length === 0) return;

    const typeMap = {
        c: "champions", champion: "champions",
        r: "relics", relic: "relics",
        p: "powers", power: "powers",
        i: "items", item: "items",
        rune: "runes",
        cd: "cards", card: "cards"
    };
    const storeType = typeMap[type] || type;

    const idFieldMap = {
        champions: "championID",
        relics: "relicCode",
        powers: "powerCode",
        items: "itemCode",
        runes: "runeCode",
        cards: "cardCode"
    };
    const idField = idFieldMap[storeType] || "id";

    const merge = (existing, incoming, idKey) => {
        const map = new Map(existing.map(c => [c[idKey], c]));
        incoming.forEach(c => map.set(c[idKey], c));
        return Array.from(map.values());
    };

    // Đánh dấu tất cả dữ liệu nạp vào là đã investigated (thành công)
    incomingData.forEach(item => {
        const id = item[idField] || item.championID || item.name;
        if (id) investigatedIds.add(`${type}:${id}`);
    });

    // Card data usually contains both languages or we treat them as same
    dataStore.en[storeType] = merge(dataStore.en[storeType] || [], incomingData, idField);
    dataStore.vi[storeType] = merge(dataStore.vi[storeType] || [], incomingData, idField);
};

/**
 * Nạp toàn bộ dữ liệu cần thiết - Đảm bảo Singleton (Chỉ chạy 1 lần duy nhất)
 */
export const preloadAllEntities = () => {
    if (preloadPromise) return preloadPromise;

    preloadPromise = (async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            // Gọi song song các API cốt lõi
            const [cardsRes, champRes, relicRes, powerRes, itemRes, runeRes] = await Promise.all([
                axios.get(`${apiUrl}/api/cards`, { params: { limit: -1 } }),
                axios.get(`${apiUrl}/api/champions`, { params: { limit: -1 } }),
                axios.get(`${apiUrl}/api/relics`, { params: { limit: -1 } }),
                axios.get(`${apiUrl}/api/powers`, { params: { limit: -1 } }),
                axios.get(`${apiUrl}/api/items`, { params: { limit: -1 } }),
                axios.get(`${apiUrl}/api/runes`, { params: { limit: -1 } })
            ]);

            if (cardsRes.data?.items) initEntities(cardsRes.data.items, "cards");
            if (champRes.data?.items) initEntities(champRes.data.items, "champions");
            if (relicRes.data?.items) initEntities(relicRes.data.items, "relics");
            if (powerRes.data?.items) initEntities(powerRes.data.items, "powers");
            if (itemRes.data?.items) initEntities(itemRes.data.items, "items");
            if (runeRes.data?.items) initEntities(runeRes.data.items, "runes");

            return true;
        } catch (error) {
            console.error("Entity Preload Error:", error);
            preloadPromise = null; // Cho phép thử lại nếu lỗi
            return false;
        }
    })();

    return preloadPromise;
};

/**
 * Reset toàn bộ entity cache (client-side).
 * Gọi sau khi admin tạo/sửa/xóa bất kỳ entity nào để Markup
 * lấy dữ liệu mới trong lần preload tiếp theo.
 * @param {string} [type] - Nếu truyền vào ('cards','champions',...), chỉ xóa type đó.
 *                          Nếu không truyền, xóa toàn bộ cache.
 */
export const invalidateEntityCache = (type = null) => {
    if (type) {
        const storeType = { c:"champions",r:"relics",p:"powers",i:"items",rune:"runes",cd:"cards",cards:"cards",champions:"champions" }[type] || type;
        dataStore.vi[storeType] = [];
        dataStore.en[storeType] = [];
        console.log(`[EntityCache] Invalidated: ${storeType}`);
    } else {
        // Xóa toàn bộ
        ["champions","relics","powers","items","runes","cards"].forEach(t => {
            dataStore.vi[t] = [];
            dataStore.en[t] = [];
        });
        console.log("[EntityCache] Full cache invalidated");
    }
    // Reset singleton để lần preload tiếp theo sẽ fetch lại từ server
    preloadPromise = null;
};

const normalize = str => (str || "").normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Tra cứu thông tin thực thể dựa trên ID hoặc Tên
 */
export const getEntityData = (value, type, lang = "vi") => {
	const searchKey = normalize(value);
	const cur = lang === "en" ? "en" : "vi";
	const db = dataStore[cur];

	// Ưu tiên nguồn đúng ngôn ngữ trước, fallback sang ngôn ngữ còn lại
	const primarySources = cur === "en"
		? [...(globalsEn.keywords || []), ...(globalsEn.vocabTerms || [])]
		: [...(globalsVi.keywords || []), ...(globalsVi.vocabTerms || [])];
	const fallbackSources = cur === "en"
		? [...(globalsVi.keywords || []), ...(globalsVi.vocabTerms || [])]
		: [...(globalsEn.keywords || []), ...(globalsEn.vocabTerms || [])];
	const allSources = [...primarySources, ...fallbackSources];

	switch (type) {
		case "k": 
		case "keyword": {
			// Tìm trong primary (đúng ngôn ngữ) trước
			const found = primarySources.find(item => 
				normalize(item.name) === searchKey || 
				normalize(item.nameRef) === searchKey
			) || fallbackSources.find(item => 
				normalize(item.name) === searchKey || 
				normalize(item.nameRef) === searchKey
			);
			
			if (found) return {
				name: found.name,
				description: found.description,
				nameRef: found.nameRef,
				icon: found.icon,
				type: "keyword"
			};
			break;
		}

		case "c": 
		case "champion": {
			const found = db.cards.find(c => 
				normalize(c.name) === searchKey || 
				normalize(c.cardCode) === searchKey || 
				normalize(c.translations?.en?.cardName) === searchKey
			) ||
			db.champions.find(c => 
				normalize(c.championID) === searchKey || 
				normalize(c.name) === searchKey || 
				normalize(c.translations?.en?.name) === searchKey
			);
			if (found) {
				const trans = cur === "en" ? found.translations?.en : null;
				return {
					id: found.championID || found.cardCode,
					name: trans?.name || trans?.cardName || found.name || found.cardName,
					description: trans?.description || found.description,
					icon: found.assets?.[0]?.avatar || found.gameAbsolutePath,
					fullImage: found.assets?.[0]?.gameAbsolutePath || found.gameAbsolutePath,
					type: "champion"
				};
			}
			break;
		}

		case "r": 
		case "relic": {
			const found = db.relics.find(r => 
				normalize(r.relicCode) === searchKey || 
				normalize(r.name) === searchKey || 
				normalize(r.translations?.en?.name) === searchKey
			);
			if (found) {
				const trans = cur === "en" ? found.translations?.en : null;
				return {
					id: found.relicCode,
					name: trans?.name || found.name,
					description: trans?.description || found.description,
					rarity: trans?.rarity || found.rarity,
					icon: found.assetAbsolutePath,
					fullImage: found.assetAbsolutePath,
					type: "relic"
				};
			}
			break;
		}

		case "p": 
		case "power": {
			const found = db.powers.find(p => 
				normalize(p.powerCode) === searchKey || 
				normalize(p.name) === searchKey || 
				normalize(p.translations?.en?.name) === searchKey
			);
			if (found) {
				const trans = cur === "en" ? found.translations?.en : null;
				return {
					id: found.powerCode,
					name: trans?.name || found.name,
					description: trans?.description || found.description,
					rarity: trans?.rarity || found.rarity,
					icon: found.assetAbsolutePath,
					fullImage: found.assetAbsolutePath,
					type: "power"
				};
			}
			break;
		}
		
		case "i": { // Item
			const foundItem = db.items.find(i => 
				normalize(i.itemCode) === searchKey || 
				normalize(i.name) === searchKey || 
				normalize(i.translations?.en?.name) === searchKey
			);
			if (foundItem) return {
				id: foundItem.itemCode,
				name: (cur === "en" ? foundItem.translations?.en?.name : null) || foundItem.name,
				description: (cur === "en" ? foundItem.translations?.en?.description : null) || foundItem.description,
				icon: foundItem.assetAbsolutePath,
				type: "item"
			};
			break;
		}

		case "cd": 
		case "card": { // Card Markup
			const found = db.cards.find(c => 
				normalize(c.cardCode) === searchKey || 
				normalize(c.cardName) === searchKey || 
				normalize(c.translations?.en?.cardName) === searchKey
			);
			if (found) {
				const trans = cur === "en" ? found.translations?.en : null;
				return {
					id: found.cardCode,
					name: trans?.cardName || found.cardName,
					description: trans?.description || found.description,
					descriptionRaw: trans?.descriptionRaw || found.descriptionRaw,
					icon: found.gameAbsolutePath,
					fullImage: found.gameAbsolutePath,
					type: "card"
				};
			}
			break;
		}
	}

	return null;
};

/**
 * Lấy toàn bộ danh sách thực thể để phục vụ việc tìm kiếm trong Admin
 */
export const getAllEntities = (type, lang = "vi") => {
	const cur = lang === "en" ? "en" : "vi";
	const db = dataStore[cur];

	switch (type) {
		case "c": return db.champions.map(c => ({ 
			id: c.championID, 
			name: (cur === "en" ? c.translations?.en?.name : null) || c.name, 
			nameEn: c.translations?.en?.name || "" 
		}));
		case "r": return db.relics.map(r => ({ 
			id: r.relicCode, 
			name: (cur === "en" ? r.translations?.en?.name : null) || r.name, 
			nameEn: r.translations?.en?.name || "" 
		}));
		case "p": return db.powers.map(p => ({ 
			id: p.powerCode, 
			name: (cur === "en" ? p.translations?.en?.name : null) || p.name, 
			nameEn: p.translations?.en?.name || "" 
		}));
		case "i": return db.items.map(i => ({ 
			id: i.itemCode, 
			name: (cur === "en" ? i.translations?.en?.name : null) || i.name, 
			nameEn: i.translations?.en?.name || "" 
		}));
		case "k": return [...db.keywords, ...db.vocabTerms].map(k => ({ 
			id: k.nameRef, 
			name: k.name, 
			nameEn: k.nameRef || "" 
		}));
		case "rune": return db.runes.map(r => ({ 
			id: r.runeCode, 
			name: (cur === "en" ? r.translations?.en?.name : null) || r.name, 
			nameEn: r.translations?.en?.name || "" 
		}));
		case "cd": return db.cards.map(c => ({ 
			id: c.cardCode, 
			name: (cur === "en" ? c.translations?.en?.cardName : null) || c.cardName, 
			nameEn: c.translations?.en?.cardName || "" 
		}));
		default: return [];
	}
};
