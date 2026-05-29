export const REGION_OPTIONS = [
	{ value: "Demacia", label: "Demacia" },
	{ value: "Noxus", label: "Noxus" },
	{ value: "Freljord", label: "Freljord" },
	{ value: "Piltover & Zaun", label: "Piltover & Zaun" },
	{ value: "Ionia", label: "Ionia" },
	{ value: "Shurima", label: "Shurima" },
	{ value: "Targon", label: "Targon" },
	{ value: "Quần Đảo Bóng Đêm", label: "Quần Đảo Bóng Đêm" },
	{ value: "Thành Phố Bandle", label: "Thành Phố Bandle" },
	{ value: "Bilgewater", label: "Bilgewater" },
	{ value: "Runeterra", label: "Runeterra" },
	{ value: "Hoa Linh Lục Địa", label: "Hoa Linh Lục Địa" },
	{ value: "ALL", label: "ALL" }
];

export const REGIONAL_REWARD_BASES = [
	"Thùng Tinh Tú Bạc",
	"Thùng Tinh Tú Vàng",
	"Thùng Tinh Tú Bạch Kim",
	"Thùng Đá Quý Lớn",
	"Pha Lê Sao Băng",
	"Mảnh Sao Băng",
	"Đá Quý",
	"Pha Lê Tinh Tú"
];

export const getRegionalRewardInfo = (fullName) => {
	if (!fullName) return { base: "", region: "" };
	for (const base of REGIONAL_REWARD_BASES) {
		if (fullName.startsWith(base)) {
			const region = fullName.slice(base.length).trim();
			return { base, region };
		}
	}
	return { base: "", region: "" };
};

export const COMMON_REWARDS = [
	{ value: "Điểm Huyền Thoại", label: "✨ Điểm Huyền Thoại" },
	{ value: "Bụi Tinh Tú", label: "🌟 Bụi Tinh Tú" },
	{ value: "Mảnh Ghép Bí Ẩn", label: "🃏 Mảnh Ghép Bí Ẩn" },
	{ value: "Mảnh Tướng", label: "🧩 Mảnh Tướng" },
	{ value: "Đá Quý", label: "💎 Đá Quý" },
	{ value: "Xu Vinh Danh", label: "🏅 Xu Vinh Danh" },
	
	// Kho Báu
	{ value: "Kho Báu Đồng", label: "📦 Kho Báu Đồng" },
	{ value: "Kho Báu Bạc", label: "📦 Kho Báu Bạc" },
	{ value: "Kho Báu Vàng", label: "📦 Kho Báu Vàng" },
	{ value: "Kho Báu Bạch Kim", label: "📦 Kho Báu Bạch Kim" },
	{ value: "Kho Báu Kim Cương", label: "📦 Kho Báu Kim Cương" },
	
	// Hòm Thần Tích
	{ value: "Hòm Thần Tích Đồng", label: "👑 Hòm Thần Tích Đồng" },
	{ value: "Hòm Thần Tích Bạc", label: "👑 Hòm Thần Tích Bạc" },
	{ value: "Hòm Thần Tích Vàng", label: "👑 Hòm Thần Tích Vàng" },

	// Thùng Tinh Tú & Thùng Đá Quý
	{ value: "Thùng Tinh Tú Bạc", label: "🌌 Thùng Tinh Tú Bạc" },
	{ value: "Thùng Tinh Tú Vàng", label: "🌌 Thùng Tinh Tú Vàng" },
	{ value: "Thùng Tinh Tú Bạch Kim", label: "🌌 Thùng Tinh Tú Bạch Kim" },
	{ value: "Thùng Đá Quý Lớn", label: "🌌 Thùng Đá Quý Lớn" },

	// Pha Lê Sao Băng & Pha Lê Tinh Tú & Mảnh Sao Băng
	{ value: "Pha Lê Sao Băng", label: "🔮 Pha Lê Sao Băng" },
	{ value: "Pha Lê Tinh Tú", label: "🔮 Pha Lê Tinh Tú" },
	{ value: "Mảnh Sao Băng", label: "☄️ Mảnh Sao Băng" },
];

export const getItemInfo = (type, id, cachedData) => {
	let list = [];
	if (type === "champion") list = cachedData.champions || [];
	if (type === "boss") list = cachedData.bosses || [];
	if (type === "item") list = cachedData.items || [];
	if (type === "relic") list = cachedData.relics || [];
	if (type === "power") list = cachedData.powers || [];
	if (type === "rune") list = cachedData.runes || [];
	if (type === "bonusStar") list = cachedData.bonusStars || [];
	if (type === "card") list = cachedData.cards || [];

	return list.find(item => {
		const uniqueId =
			item.championID ||
			item.bossID ||
			item.powerCode ||
			item.relicCode ||
			item.itemCode ||
			item.runeCode ||
			item.cardCode ||
			item.bonusStarID ||
			item.id ||
			item._id;
		return uniqueId === id;
	}) || {};
};
