// be/src/utils/cacheKeys.js
/**
 * Tập trung toàn bộ Cache Keys vào một file duy nhất.
 * Mục đích: Tránh lỗi typo, dễ bảo trì, nhất quán giữa các routes.
 *
 * Cách dùng:
 *   import { CACHE_KEYS } from "../utils/cacheKeys.js";
 *   cache.get(CACHE_KEYS.POWERS.ALL)
 *   cache.del(CACHE_KEYS.POWERS.DETAIL("P01001"))
 */
export const CACHE_KEYS = {
	POWERS: {
		ALL: "all_powers_data",
		DETAIL: (id) => `power_detail_${id}`,
	},
	RELICS: {
		ALL: "all_relics_data",
		DETAIL: (id) => `relic_detail_${id}`,
	},
	ITEMS: {
		ALL: "all_items_data",
		DETAIL: (id) => `item_detail_${id}`,
	},
	CHAMPIONS: {
		ALL: "all_champions_list",
		DETAIL: (id) => `champion_detail_${id}`,
	},
	BOSSES: {
		ALL: "all_bosses_list_v2",
	},
	RUNES: {
		ALL: "all_runes_data",
		DETAIL: (id) => `rune_detail_${id}`,
	},
	ADVENTURES: {
		ALL: "all_adventures_list",
		DETAIL: (id) => `adventure_detail_${id}`,
	},
	CARDS: {
		ALL: "all_cards_data",
		DETAIL: (id) => `card_detail_${id}`,
	},
};
