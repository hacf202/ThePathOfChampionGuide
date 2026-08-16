// fe/src/utils/i18nHelpers.js

/**
 * Maps a raw rarity string (usually in Vietnamese from the database)
 * to a stable ASCII key for i18n.
 */
export const getRarityKey = (rawRarity) => {
	if (!rawRarity) return "unknown";
	
	const normalized = String(rawRarity).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
	
	const mapping = {
		"thuong": "common",
		"hiem": "rare",
		"su thi": "epic",
		"huyen thoai": "legendary",
		"dac biet": "special",
		"none": "none",
		"champion": "champion"
	};
	
	return mapping[normalized] || normalized.replace(/[^a-z0-9]/g, '');
};

/**
 * Maps a raw type string (usually in Vietnamese from the database)
 * to a stable ASCII key for i18n.
 */
export const getTypeKey = (rawType) => {
	if (!rawType) return "unknown";
	
	const normalized = String(rawType).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
	
	const mapping = {
		"tran": "signature",
		"tieu thu": "consumable",
		"chung": "general",
		"chien dich": "campaign",
		"arcane power": "arcane",
		"champion level power": "championlevel",
		"debuff power": "debuff",
		"defiance power": "defiance",
		"encounter power": "encounter"
	};
	
	return mapping[normalized] || normalized.replace(/[^a-z0-9]/g, '');
};

/**
 * Maps a raw region string (usually in Vietnamese from the database)
 * to a stable ASCII key for i18n.
 */
export const getRegionKey = (rawRegion) => {
	if (!rawRegion) return "unknown";
	
	const normalized = String(rawRegion).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
	
	const mapping = {
		"hoa linh luc dia": "spiritblossom",
		"thanh pho bandle": "bandlecity",
		"quan dao bong dem": "shadowisles",
		"quanao bong aem": "shadowisles",
		"trung lap": "neutral"
	};
	
	return mapping[normalized] || normalized.replace(/[^a-z0-9]/g, '');
};
