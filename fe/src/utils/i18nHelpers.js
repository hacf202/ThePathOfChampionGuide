// fe/src/utils/i18nHelpers.js

/**
 * Maps a raw rarity string (usually in Vietnamese from the database)
 * to a stable ASCII key for i18n.
 */
export const getRarityKey = (rawRarity) => {
	if (!rawRarity) return "unknown";
	
	const normalized = String(rawRarity).toLowerCase().trim();
	
	const mapping = {
		"thường": "common",
		"hiếm": "rare",
		"sử thi": "epic",
		"huyền thoại": "legendary",
		"đặc biệt": "special",
		"dacbiet": "special",
		"common": "common",
		"rare": "rare",
		"epic": "epic",
		"legendary": "legendary",
		"special": "special"
	};
	
	return mapping[normalized] || normalized;
};

/**
 * Maps a raw type string (usually in Vietnamese from the database)
 * to a stable ASCII key for i18n.
 */
export const getTypeKey = (rawType) => {
	if (!rawType) return "unknown";
	
	const normalized = String(rawType).toLowerCase().trim();
	
	const mapping = {
		"trấn": "signature",
		"tiêu thụ": "consumable",
		"chung": "general",
		"signature": "signature",
		"consumable": "consumable",
		"general": "general"
	};
	
	return mapping[normalized] || normalized;
};

/**
 * Maps a raw region string (usually in Vietnamese from the database)
 * to a stable ASCII key for i18n.
 */
export const getRegionKey = (rawRegion) => {
	if (!rawRegion) return "unknown";
	
	const normalized = String(rawRegion).toLowerCase().trim();
	
	const mapping = {
		"hoa linh lục địa": "spiritblossom",
		"thành phố bandle": "bandlecity",
		"quần đảo bóng đêm": "shadowisles",
		"spiritblossom": "spiritblossom",
		"bandlecity": "bandlecity",
		"shadowisles": "shadowisles"
	};
	
	return mapping[normalized] || normalized;
};
