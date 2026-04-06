import champions from "../assets/data/poc/guidePocChampionList.json";
import relics from "../assets/data/poc/guidePocRelics.json";
import powers from "../assets/data/poc/guidePocPowers.json";
import items from "../assets/data/poc/guidePocItems.json";
import runes from "../assets/data/poc/guidePocRunes.json";
import globalsEn from "../assets/data/globals-en_us.json";
import globalsVi from "../assets/data/globals-vi_vn.json";

/**
 * entityLookup - Bộ não tra cứu toàn bộ dữ liệu Wiki LoR
 * Hỗ trợ: Keywords, Champions, Relics, Powers, Items, Runes.
 */

const dataStore = {
	en: {
		keywords: globalsEn.keywords || [],
		vocabTerms: globalsEn.vocabTerms || [],
		champions,
		relics,
		powers,
		items,
		runes,
		cards: [], // 🆕
	},
	vi: {
		keywords: globalsVi.keywords || [],
		vocabTerms: globalsVi.vocabTerms || [],
		champions,
		relics,
		powers,
		items,
		runes,
		cards: [], // 🆕
	},
};

/**
 * Khởi tạo dữ liệu động hoặc nạp thêm card vào cache (Ví dụ: từ kết quả resolve của page)
 */
export const initEntities = async (initialCards = []) => {
	if (initialCards && initialCards.length > 0) {
		const merge = (existing, incoming) => {
			const map = new Map(existing.map(c => [c.cardCode, c]));
			incoming.forEach(c => map.set(c.cardCode, c));
			return Array.from(map.values());
		};

		dataStore.en.cards = merge(dataStore.en.cards, initialCards);
		dataStore.vi.cards = merge(dataStore.vi.cards, initialCards);
	}
	
	// Không còn fetch toàn bộ 2300+ cards ở đây nữa để tối ưu tốc độ
};

const normalize = str => (str || "").normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Tra cứu thông tin thực thể dựa trên ID hoặc Tên
 */
export const getEntityData = (value, type, lang = "vi") => {
	const searchKey = normalize(value);
	const cur = lang === "en" ? "en" : "vi";
	const db = dataStore[cur];
	
	const allSources = [
		...(globalsVi.keywords || []),
		...(globalsVi.vocabTerms || []),
		...(globalsEn.keywords || []),
		...(globalsEn.vocabTerms || [])
	];

	switch (type) {
		case "k": 
		case "keyword": {
			const found = allSources.find(item => 
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
			const found = db.cards.find(c => normalize(c.name) === searchKey || normalize(c.cardCode) === searchKey) ||
			              db.champions.find(c => normalize(c.championID) === searchKey || normalize(c.name) === searchKey);
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
			const found = db.relics.find(r => normalize(r.relicCode) === searchKey || normalize(r.name) === searchKey);
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
			const found = db.powers.find(p => normalize(p.powerCode) === searchKey || normalize(p.name) === searchKey);
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
			const foundItem = db.items.find(i => normalize(i.itemCode) === searchKey || normalize(i.name) === searchKey);
			if (foundItem) return {
				id: foundItem.itemCode,
				name: foundItem.name,
				description: foundItem.description,
				icon: foundItem.assetAbsolutePath,
				type: "item"
			};
			break;
		}

		case "cd": 
		case "card": { // 🆕 Card Markup
			const found = db.cards.find(c => normalize(c.cardCode) === searchKey || normalize(c.cardName) === searchKey);
			if (found) {
				const trans = cur === "en" ? found.translations?.en : null;
				return {
					id: found.cardCode,
					name: trans?.cardName || found.cardName,
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
		case "c": return db.champions.map(c => ({ id: c.championID, name: (cur === "en" ? c.translations?.en?.name : null) || c.name }));
		case "r": return db.relics.map(r => ({ id: r.relicCode, name: (cur === "en" ? r.translations?.en?.name : null) || r.name }));
		case "p": return db.powers.map(p => ({ id: p.powerCode, name: (cur === "en" ? p.translations?.en?.name : null) || p.name }));
		case "i": return db.items.map(i => ({ id: i.itemCode, name: i.name }));
		case "k": return [...db.keywords, ...db.vocabTerms].map(k => ({ id: k.nameRef, name: k.name }));
		case "cd": return db.cards.map(c => ({ id: c.cardCode, name: (cur === "en" ? c.translations?.en?.cardName : null) || c.cardName })); // 🆕
		default: return [];
	}
};
