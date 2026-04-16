// --- Assets chuẩn từ icon.json ---
export const ASSETS = {
	bronze: "https://images.pocguide.top/icon/Bronze_Vault.webp",
	silver: "https://images.pocguide.top/icon/Silver_Vault.webp",
	gold: "https://images.pocguide.top/icon/Gold_Vault.webp",
	platinum: "https://images.pocguide.top/icon/Platinum_Vault.webp",
	diamond: "https://images.pocguide.top/icon/Diamond_Vault.webp",
	champ_frag: "https://images.pocguide.top/icon/Wild_Fragment.webp",
	wild_frag: "https://images.pocguide.top/icon/Wild_Fragment.webp",
	stardust:
		"https://images.pocguide.top/icon/200px-PoC_Stardust.webp",
	cosmic_blessing:
		"https://images.pocguide.top/icon/Greater_Cosmic_Blessing.webp",
	star_crystal: "https://images.pocguide.top/icon/Star_Crystal.webp",
	gemstone: "https://images.pocguide.top/icon/Gemstone.webp",
	runic_vessel: "https://images.pocguide.top/icon/PoC_Spirit_Blossom_Runic_Vessel.webp",
	spirit_blossom_chest: "https://images.pocguide.top/icon/PoC_Spirit_Blossom_Runic_Vessel.webp",
	superior_spirit_blossom_chest: "https://images.pocguide.top/icon/Superior_Spirit_Blossom_Chest.webp",
	nova_shard: "https://images.pocguide.top/icon/novaShardIcon.webp",
	nova_crystal: "https://images.pocguide.top/icon/Nova_Crystal_icon.webp",
	rune_shards: "https://images.pocguide.top/icon/20px-PoC_Rune_Shard_icon.webp",
	silver_star_vessel: "https://images.pocguide.top/icon/Silver_Star_Vessel_Poc.webp",
	gold_star_vessel: "https://images.pocguide.top/icon/Gold_Star_Vessel_Poc.webp",
	nova_crystal_vessel: "https://images.pocguide.top/icon/Nova_Crystal_Vessel_Poc.webp",
	glory_coin: "https://images.pocguide.top/icon/Glory_coin_icon.webp",
	noxus: "https://images.pocguide.top/icon/Noxus_LoR_Region.webp",
	demacia: "https://images.pocguide.top/icon/Demacia_LoR_Region.webp",
	runeterra: "https://images.pocguide.top/icon/Runeterra_LoR_Region.webp",
	bilgewater: "https://images.pocguide.top/icon/Bilgewater_LoR_Region.webp",
	bandle_city: "https://images.pocguide.top/icon/Bandle_City_LoR_Region.webp",
	shadow_isles: "https://images.pocguide.top/icon/Shadow_Isles_LoR_Region.webp",
	shurima: "https://images.pocguide.top/icon/Shurima_LoR_Region.webp",
	targon: "https://images.pocguide.top/icon/Targon_LoR_Region.webp",
	freljord: "https://images.pocguide.top/icon/Freljord_LoR_Region.webp",
	piltover_zaun: "https://images.pocguide.top/icon/Piltover_Zaun_LoR_Region.webp",
	ionia: "https://images.pocguide.top/icon/Ionia_LoR_Region.webp",
	spirit_blossom: "https://images.pocguide.top/icon/Spirit_Blossom_LoR_Region.webp",
};

// --- Config Tỷ lệ (Drop Rates) ---
export const VAULT_CONFIG = {
	bronze: {
		id: "bronze",
		nameKey: "vaultSimulator.tier.bronze",
		sourceKey: "vaultSimulator.sources.bronze",
		color: "text-[#cd7f32]",
		bg: "bg-[#cd7f32]/10",
		border: "border-[#cd7f32]/30",
		glow: "from-[#cd7f32]/30",
		drops: [
			{
				type: "champion_fragments",
				rolls: [
					{ chance: 95, items: [5], relicChance: 0 },
					{ chance: 5, items: [10], relicChance: 0 },
				],
			},
		],
	},
	silver: {
		id: "silver",
		nameKey: "vaultSimulator.tier.silver",
		sourceKey: "vaultSimulator.sources.silver",
		color: "text-[#c0c0c0]",
		bg: "bg-[#c0c0c0]/10",
		border: "border-[#c0c0c0]/30",
		glow: "from-[#c0c0c0]/30",
		drops: [
			{
				type: "champion_fragments",
				rolls: [
					{ chance: 90, items: [10], relicChance: 0 },
					{ chance: 10, items: [15], relicChance: 0 },
				],
			},
		],
	},
	gold: {
		id: "gold",
		nameKey: "vaultSimulator.tier.gold",
		sourceKey: "vaultSimulator.sources.gold",
		color: "text-[#ffd700]",
		bg: "bg-[#ffd700]/10",
		border: "border-[#ffd700]/30",
		glow: "from-[#ffd700]/30",
		drops: [
			{
				type: "champion_fragments",
				rolls: [
					{ chance: 90, items: [20], relicChance: 0 },
					{ chance: 10, items: [20, 10], relicChance: 30 },
				],
			},
			{
				type: "relic",
				rarity: "Thường",
			},
		],
	},
	platinum: {
		id: "platinum",
		nameKey: "vaultSimulator.tier.platinum",
		sourceKey: "vaultSimulator.sources.platinum",
		color: "text-emerald-400",
		bg: "bg-emerald-400/10",
		border: "border-emerald-400/30",
		glow: "from-emerald-400/30",
		drops: [
			{
				type: "champion_fragments",
				rolls: [
					{ chance: 60, items: [40], relicChance: 0 },
					{ chance: 30, items: [20, 20], relicChance: 0 },
					{ chance: 10, items: [30, 20], relicChance: 30 },
				],
			},
			{
				type: "relic",
				rarity: "Hiếm",
			},
		],
	},
	diamond: {
		id: "diamond",
		nameKey: "vaultSimulator.tier.diamond",
		sourceKey: "vaultSimulator.sources.diamond",
		color: "text-indigo-500",
		bg: "bg-indigo-500/10",
		border: "border-indigo-500/30",
		glow: "from-indigo-500/30",
		drops: [
			{
				type: "champion_fragments",
				rolls: [
					{ chance: 75, items: [40, 40], relicChance: 0 },
					{ chance: 20, items: [40, 40, 40], relicChance: 0 },
					{ chance: 5, items: [80, 80, 80], relicChance: 0 },
				],
			},
			{
				type: "wild_fragments",
				rolls: [
					{ chance: 85, items: [20] },
					{ chance: 14, items: [50] },
					{ chance: 1, items: [100] },
				],
			},
			{
				type: "relic_slot",
				options: [
					{ chance: 65, type: "cosmic_bless" },
					{ chance: 35, type: "rare_relic" },
				],
			},
			{
				type: "bonus",
				options: [
					{ chance: 20, type: "star_crystal", amount: 10 },
					{ chance: 5, type: "gemstone", amount: 150 },
					{ chance: 75, type: "none" },
				],
			},
		],
	},
	runic_vessel: {
		id: "runic_vessel",
		nameKey: "vaultSimulator.tier.runic_vessel",
		sourceKey: "vaultSimulator.sources.runic_vessel",
		color: "text-pink-500",
		bg: "bg-pink-500/10",
		border: "border-pink-500/30",
		glow: "from-pink-500/30",
		drops: [
			{
				type: "rune_shards",
				amount: 4,
			},
			{
				type: "rune",
				rolls: [
					{ chance: 81.28, rarity: "Thường" },
					{ chance: 17.12, rarity: "Hiếm" },
					{ chance: 1.6, rarity: "Huyền Thoại" },
				],
			},
		],
	},
	spirit_blossom_chest: {
		id: "spirit_blossom_chest",
		nameKey: "vaultSimulator.tier.spirit_blossom_chest",
		sourceKey: "vaultSimulator.sources.spirit_blossom_chest",
		color: "text-pink-400",
		bg: "bg-pink-400/10",
		border: "border-pink-400/30",
		glow: "from-pink-400/30",
		bundles: [
			{
				name: "Bundle 1",
				options: [
					{ chance: 57.0, type: "champion_fragments", amount: 20 },
					{ chance: 15.0, type: "champion_fragments", amount: 25 },
					{ chance: 4.5, type: "champion_fragments", amount: 30 },
					{ chance: 3.0, type: "champion_fragments", amount: 40 },
					{ chance: 1.5, type: "champion_fragments", amount: 50 },
					{ chance: 9.0, type: "star_crystal", amount: 1 },
					{ chance: 5.1, type: "star_crystal", amount: 2 },
					{ chance: 3.05, type: "star_crystal", amount: 5 },
					{ chance: 1.0, type: "nova_shard", amount: 5 },
					{ chance: 0.5, type: "nova_shard", amount: 10 },
					{ chance: 0.05, type: "nova_crystal", amount: 1 },
					{ chance: 0.3, type: "legendary_rune" },
				],
			},
		],
		bonusBundle: {
			options: [
				{ chance: 20, type: "none" },
				{ chance: 56, type: "rune_shards", amount: 2  },
				{ chance: 11, type: "star_crystal", amount: 1 },
				{ chance: 5, type: "star_crystal", amount: 2 },
				{ chance: 4.5, type: "gemstone", amount: 5 },
				{ chance: 2, type: "gemstone", amount: 10 },
				{ chance: 1, type: "nova_shard", amount: 5 },
				{ chance: 0.5, type: "nova_shard", amount: 10 },
			],
		},
	},
	superior_spirit_blossom_chest: {
		id: "superior_spirit_blossom_chest",
		nameKey: "vaultSimulator.tier.superior_spirit_blossom_chest",
		sourceKey: "vaultSimulator.sources.superior_spirit_blossom_chest",
		color: "text-purple-500",
		bg: "bg-purple-500/10",
		border: "border-purple-500/30",
		glow: "from-purple-500/30",
		bundles: [
			{
				name: "Bundle 1",
				options: [
					{ chance: 54.0, type: "champion_fragments", amount: 25 },
					{ chance: 15.0, type: "champion_fragments", amount: 30 },
					{ chance: 6.0, type: "champion_fragments", amount: 40 },
					{ chance: 3.0, type: "champion_fragments", amount: 50 },
					{ chance: 1.5, type: "champion_fragments", amount: 65 },
					{ chance: 10.0, type: "star_crystal", amount: 1 },
					{ chance: 5.0, type: "star_crystal", amount: 3 },
					{ chance: 3.05, type: "star_crystal", amount: 6 },
					{ chance: 1.0, type: "nova_shard", amount: 6 },
					{ chance: 0.5, type: "nova_shard", amount: 10 },
					{ chance: 0.05, type: "nova_crystal", amount: 1 },
					{ chance: 0.9, type: "legendary_rune" },
				],
			},
			...[2,3,4].map(i => ({
				name: `Bundle ${i}`,
				options: [
					{ chance: 54.0, type: "champion_fragments", amount: 25 },
					{ chance: 15.0, type: "champion_fragments", amount: 30 },
					{ chance: 6.0, type: "champion_fragments", amount: 40 },
					{ chance: 3.6, type: "champion_fragments", amount: 50 },
					{ chance: 1.8, type: "champion_fragments", amount: 65 },
					{ chance: 10.0, type: "star_crystal", amount: 1 },
					{ chance: 5.0, type: "star_crystal", amount: 3 },
					{ chance: 3.05, type: "star_crystal", amount: 6 },
					{ chance: 1.0, type: "nova_shard", amount: 6 },
					{ chance: 0.5, type: "nova_shard", amount: 10 },
					{ chance: 0.05, type: "nova_crystal", amount: 1 },
				]
			}))
		],
		bonusBundle: {
			options: [
				{ chance: 20, type: "none" },
				{ chance: 56, type: "rune_shards", amount: 10 },
				{ chance: 11, type: "star_crystal", amount: 1 },
				{ chance: 5, type: "star_crystal", amount: 2 },
				{ chance: 4.5, type: "gemstone", amount: 25 },
				{ chance: 2, type: "gemstone", amount: 50 },
				{ chance: 1, type: "nova_shard", amount: 10 },
				{ chance: 0.5, type: "nova_shard", amount: 20 },
			],
		},
	},
	silver_star_vessel: {
		id: "silver_star_vessel",
		nameKey: "vaultSimulator.tier.silver_star_vessel",
		sourceKey: "vaultSimulator.sources.silver_star_vessel",
		color: "text-slate-300",
		bg: "bg-slate-300/10",
		border: "border-slate-300/30",
		glow: "from-slate-300/30",
		bundles: [
			{
				name: "Bundle 1",
				options: [
					{ chance: 85, type: "star_crystal", amount: 5 },
					{ chance: 14, type: "star_crystal", amount: 10 },
					{ chance: 1, type: "star_crystal", amount: 25 },
				],
			},
			{
				name: "Bundle 2",
				options: [
					{ chance: 85, type: "stardust", amount: 75 },
					{ chance: 15, type: "stardust", amount: 250 },
				],
			},
		],
		bonusBundle: {
			options: [
				{ chance: 95, type: "none" },
				{ chance: 5, type: "nova_shard", amount: 20 },
			],
		},
	},
	gold_star_vessel: {
		id: "gold_star_vessel",
		nameKey: "vaultSimulator.tier.gold_star_vessel",
		sourceKey: "vaultSimulator.sources.gold_star_vessel",
		color: "text-amber-400",
		bg: "bg-amber-400/10",
		border: "border-amber-400/30",
		glow: "from-amber-400/30",
		bundles: [
			{
				name: "Bundle 1",
				options: [
					{ chance: 85, type: "star_crystal", amount: 10 },
					{ chance: 14, type: "star_crystal", amount: 20 },
					{ chance: 1, type: "star_crystal", amount: 40 },
				],
			},
			{
				name: "Bundle 2",
				options: [
					{ chance: 80, type: "stardust", amount: 150 },
					{ chance: 20, type: "stardust", amount: 500 },
				],
			},
			{
				name: "Bundle 3",
				options: [
					{ chance: 85, type: "nova_shard", amount: 20 },
					{ chance: 14, type: "nova_shard", amount: 50 },
					{ chance: 1, type: "nova_crystal", amount: 1 },
				],
			},
		],
	},
	nova_crystal_vessel: {
		id: "nova_crystal_vessel",
		nameKey: "vaultSimulator.tier.nova_crystal_vessel",
		sourceKey: "vaultSimulator.sources.nova_crystal_vessel",
		color: "text-cyan-400",
		bg: "bg-cyan-400/10",
		border: "border-cyan-400/30",
		glow: "from-cyan-400/30",
		bundles: [
			{
				name: "Bundle 1",
				options: [
					{ chance: 65, type: "star_crystal", amount: 20 },
					{ chance: 25, type: "star_crystal", amount: 30 },
					{ chance: 10, type: "star_crystal", amount: 40 },
				],
			},
			{
				name: "Bundle 2",
				options: [{ chance: 100, type: "stardust", amount: 500 }],
			},
			{
				name: "Bundle 3",
				options: [{ chance: 100, type: "nova_crystal", amount: 1 }],
			},
			{
				name: "Bundle 4",
				options: [
					{ chance: 99, type: "gemstone", amount: 30 },
					{ chance: 1, type: "gemstone", amount: 250 },
				],
			},
		],
	},
};
