import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../hooks/useTranslation";
import { getRarityKey, getTypeKey, getRegionKey } from "../utils/i18nHelpers";
import { ASSETS, VAULT_CONFIG } from "../components/simulator/vaultConfig";
import VaultProbabilityInfo from "../components/simulator/VaultProbabilityInfo";
import { X, History, Trash2, LayoutGrid, RotateCcw, Sparkles, Trophy, ChevronRight, Zap, Gift, Info } from "lucide-react";
import PageTitle from "../components/common/pageTitle";
import Button from "../components/common/button";
import axios from "axios";

const REGIONS = [
	{ id: "noxus", name: "Noxus", image: ASSETS.noxus },
	{ id: "demacia", name: "Demacia", image: ASSETS.demacia },
	{ id: "ionia", name: "Ionia", image: ASSETS.ionia },
	{ id: "freljord", name: "Freljord", image: ASSETS.freljord },
	{ id: "bilgewater", name: "Bilgewater", image: ASSETS.bilgewater },
	{ id: "shadow_isles", name: "Shadow Isles", image: ASSETS.shadow_isles },
	{ id: "shurima", name: "Shurima", image: ASSETS.shurima },
	{ id: "targon", name: "Targon", image: ASSETS.targon },
	{ id: "bandle_city", name: "Bandle City", image: ASSETS.bandle_city },
	{ id: "piltover_zaun", name: "Piltover & Zaun", image: ASSETS.piltover_zaun },
	{ id: "runeterra", name: "Runeterra", image: ASSETS.runeterra },
];

const SPIRIT_BLOSSOM_REGION = {
	id: "spirit_blossom",
	name: "Hoa Linh Lục Địa",
	image: ASSETS.spirit_blossom,
};

const VaultSimulator = () => {
	const { t, tUI } = useTranslation();

	const VAULT_GROUPS = [
		{
			id: "cosmic",
			titleKey: "vaultSimulator.groupCosmic",
			vaults: ["bronze", "silver", "gold", "platinum", "diamond"],
		},
		{
			id: "spirit",
			titleKey: "vaultSimulator.groupSpirit",
			vaults: ["spirit_blossom_chest", "superior_spirit_blossom_chest"],
		},
		{
			id: "vessel",
			titleKey: "vaultSimulator.groupVessel",
			vaults: ["silver_star_vessel", "gold_star_vessel", "nova_crystal_vessel"],
		},
		{
			id: "runic",
			titleKey: "vaultSimulator.groupRunic",
			vaults: ["runic_vessel"],
		},
	];

	const LootItem = ({ item, isSmall = false }) => {
		const getDisplayName = () => {
			if (item.refType === "champion") {
				const champ = allChampions.find(c => c.championID === item.refId);
				if (champ) return `${tUI("vaultSimulator.loot.champFrag")} ${t(champ, "name") || champ.name}`;
			} else if (item.refType === "relic") {
				const rel = allRelics.find(r => r.relicCode === item.refId);
				if (rel) return t(rel, "name") || rel.name;
			} else if (item.refType === "rune") {
				const rune = allRunes.find(r => r.runeCode === item.refId);
				if (rune) return t(rune, "name") || rune.name;
			} else if (item.nameKey) {
				return tUI(item.nameKey);
			}
			return item.name;
		};

		const getDisplayType = () => {
			if (item.refType === "relic" || item.refType === "static_relic") return tUI("vaultSimulator.loot.relic");
			if (item.refType === "rune") return tUI("vaultSimulator.loot.rune");
			return item.type;
		};

		const displayName = getDisplayName();
		const displayType = getDisplayType();

		return (
			<div className='flex flex-col items-center group w-full' title={displayName}>
				<div
					className={`relative ${isSmall ? "w-20 h-20 sm:w-28 sm:h-28 rounded-2xl p-2" : "w-full sm:w-48 h-40 sm:h-48 rounded-3xl p-4 sm:p-6"} flex items-center justify-center bg-surface-bg border border-border mb-2 sm:mb-4 shadow-xl group-hover:shadow-primary-500/10 group-hover:-translate-y-1 transition-all duration-500 overflow-hidden`}
				>
					<img
						src={item.icon}
						alt={displayName}
						className={`w-full h-full object-contain relative z-10 filter group-hover:rotate-6 transition-transform duration-700 ${item.isChamp ? "rounded-xl border-2 border-primary-500/20" : ""}`}
					/>
					{item.region && (
						<div className={`${isSmall ? "w-6 h-6 p-0.5" : "w-8 h-8 sm:w-12 sm:h-12 p-1"} absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-surface-bg/80 backdrop-blur-sm rounded-lg border border-border shadow-lg z-20 group-hover:scale-110 transition-transform`}>
							<img
								src={item.region.image}
								alt={item.region.name}
								className='w-full h-full object-contain'
								title={item.region.name}
							/>
						</div>
					)}
					{item.amount && (
						<div className={`${isSmall ? "text-[10px] sm:text-xs px-1.5 py-0.5" : "text-sm sm:text-xl px-2 sm:px-4 py-0.5 sm:py-1"} absolute bottom-1 left-1 sm:bottom-4 sm:left-4 bg-primary-600 font-black text-white rounded-lg shadow-xl border border-white/20 transform group-hover:scale-110 transition-transform z-20`}>
							x{item.amount}
						</div>
					)}
				</div>
				{!isSmall && (
					<h4
						className={`text-sm sm:text-xl font-black uppercase italic text-center max-w-[160px] sm:max-w-[200px] leading-tight mb-1 ${item.color || "text-text-primary"} drop-shadow-sm`}
					>
						{displayName}
					</h4>
				)}
				{!isSmall && (item.rarityKey || displayType) && (
					<span className='px-2 sm:px-4 py-0.5 sm:py-1 rounded-full bg-input-bg text-[8px] sm:text-[10px] uppercase tracking-widest font-black border border-border text-text-secondary shadow-sm'>
						{tUI(item.rarityKey) || displayType}
					</span>
				)}
			</div>
		);
	};

	const [selectedVault, setSelectedVault] = useState(null);
	const [isOpening, setIsOpening] = useState(false);
	const [loot, setLoot] = useState(null);
	const [allRelics, setAllRelics] = useState([]);
	const [allChampions, setAllChampions] = useState([]);
	const [spiritBlossomChampions, setSpiritBlossomChampions] = useState([]);
	const [allRunes, setAllRunes] = useState([]);
	const [selectedRegion, setSelectedRegion] = useState(null);
	const [openAmount, setOpenAmount] = useState(1);
	const [history, setHistory] = useState(() => {
		const saved = localStorage.getItem("vault_sim_history");
		return saved ? JSON.parse(saved) : {};
	});
	const [showConfigModal, setShowConfigModal] = useState(false);
	const [showProbModal, setShowProbModal] = useState(false);

	useEffect(() => {
		localStorage.setItem("vault_sim_history", JSON.stringify(history));
	}, [history]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const API_BASE = import.meta.env.VITE_API_URL || "";
				const [relicsRes, champsRes, runesRes] = await Promise.all([
					axios.get(`${API_BASE}/api/relics?limit=-1`),
					axios.get(`${API_BASE}/api/champions?limit=-1`),
					axios.get(`${API_BASE}/api/runes?limit=-1`),
				]);
				const rawRelics = relicsRes.data?.items || relicsRes.data || [];
				const rawChamps = champsRes.data?.items || champsRes.data || [];
				const rawRunes = runesRes.data?.items || runesRes.data || [];

				console.log("Raw API Data:", { rawChamps, rawRelics, rawRunes });

				// Lọc Cổ vật: Chấp nhận cả 'general' hoặc 'chung'
				const filteredRelics = Array.isArray(rawRelics)
					? rawRelics.filter(r => {
							const typeKey = getTypeKey(r.type);
							const rarityKey = getRarityKey(r.rarity);
							return (
								typeKey === "general" &&
								(rarityKey === "common" || rarityKey === "rare")
							);
						})
					: [];

				// Lọc Tướng
				const filteredChamps = [];
				const sbChamps = [];

				if (Array.isArray(rawChamps)) {
					rawChamps.forEach(c => {
						const regions = Array.isArray(c.regions)
							? c.regions
							: [c.region || ""];
						const isSpiritBlossom = regions.some(
							r => getRegionKey(r) === "spiritblossom",
						);

						if (isSpiritBlossom) {
							sbChamps.push(c);
						} else if (c.championID !== "C666" && c.championID !== "C043") {
							filteredChamps.push(c);
						}
					});
				}

				console.log(
					`Simulator Filtered: ${filteredChamps.length} Champions, ${filteredRelics.length} Relics`,
				);

				setAllRunes(rawRunes);
				setAllRelics(filteredRelics);
				setAllChampions(
					filteredChamps.length > 0
						? filteredChamps
						: [{ name: "Champion", championID: "NONE" }],
				);
				setSpiritBlossomChampions(
					sbChamps.length > 0
						? sbChamps
						: [{ name: "Spirit Blossom Champion", championID: "NONE" }],
				);
			} catch (err) {
				console.error("Lỗi fetch data simulator:", err);
			}
		};
		fetchData();
	}, []);

	const weightedRoll = options => {
		const totalWeight = options.reduce((acc, opt) => acc + opt.chance, 0);
		let random = Math.random() * totalWeight;
		for (let opt of options) {
			if (random < opt.chance) return opt;
			random -= opt.chance;
		}
		return options[0];
	};

	const generateLoot = (vaultType, regionOverride = null) => {
		const config = VAULT_CONFIG[vaultType];
		const results = [];

		const isSBVault =
			vaultType === "spirit_blossom_chest" ||
			vaultType === "superior_spirit_blossom_chest";

		// Helper lấy region ngẫu nhiên (trừ SB)
		const getRandomStandardRegion = () => {
			return REGIONS[Math.floor(Math.random() * REGIONS.length)];
		};

		// Helper xác định region cho tài nguyên
		const getResourceRegion = () => {
			if (isSBVault) return SPIRIT_BLOSSOM_REGION;
			if (regionOverride) return regionOverride;
			return getRandomStandardRegion();
		};

		const processOption = (roll, idx = 0) => {
			if (roll.type === "champion_fragments") {
				const pool = isSBVault ? spiritBlossomChampions : allChampions;

				const randomChamp = pool[Math.floor(Math.random() * pool.length)];
				results.push({
					id: `champ_frag_${randomChamp?.championID}`,
					refId: randomChamp?.championID,
					refType: "champion",
					name: t(randomChamp, "name") || randomChamp?.name || "???",
					amount: roll.amount,
					icon: randomChamp?.assets?.[0]?.avatar || ASSETS.champ_frag,
					isChamp: true,
					color: "text-blue-600",
				});
			} else if (roll.type === "wild_fragments") {
				results.push({
					id: "wild_frag",
					nameKey: "vaultSimulator.loot.wild_frags",
					name: tUI("vaultSimulator.loot.wild_frags"),
					amount: roll.amount,
					icon: ASSETS.wild_frag,
					color: "text-orange-600",
				});
			} else if (roll.type === "star_crystal") {
				const region = getResourceRegion();
				results.push({
					id: "star_crystal",
					nameKey: "vaultSimulator.loot.star_crystal",
					name: tUI("vaultSimulator.loot.star_crystal"),
					amount: roll.amount,
					icon: ASSETS.star_crystal,
					region: region,
					color: "text-orange-500",
				});
			} else if (roll.type === "nova_shard") {
				const region = getResourceRegion();
				results.push({
					id: "nova_shard",
					nameKey: "vaultSimulator.loot.nova_shard",
					name: tUI("vaultSimulator.loot.nova_shard"),
					amount: roll.amount,
					icon: ASSETS.nova_shard,
					region: region,
					color: "text-blue-400",
				});
			} else if (roll.type === "nova_crystal") {
				const region = getResourceRegion();
				results.push({
					id: "nova_crystal",
					nameKey: "vaultSimulator.loot.nova_crystal",
					name: tUI("vaultSimulator.loot.nova_crystal"),
					amount: roll.amount,
					icon: ASSETS.nova_crystal,
					region: region,
					color: "text-blue-600",
				});
			} else if (roll.type === "stardust") {
				results.push({
					id: "stardust",
					nameKey: "vaultSimulator.loot.stardust",
					name: tUI("vaultSimulator.loot.stardust"),
					amount: roll.amount,
					icon: ASSETS.stardust,
					color: "text-purple-400",
				});
			} else if (roll.type === "gemstone") {
				const region = getResourceRegion();
				results.push({
					id: "gemstone",
					nameKey: "vaultSimulator.loot.gemstone",
					name: tUI("vaultSimulator.loot.gemstone"),
					amount: roll.amount,
					icon: ASSETS.gemstone,
					region: region,
					color: "text-purple-600",
				});
			} else if (roll.type === "rune_shards") {
				results.push({
					id: "rune_shards",
					nameKey: "vaultSimulator.loot.rune_shards",
					name: tUI("vaultSimulator.loot.rune_shards"),
					amount: roll.amount,
					icon: ASSETS.rune_shards,
					color: "text-pink-600",
				});
			} else if (roll.type === "legendary_rune") {
				const rarityPool = allRunes.filter(r => r.rarity === "Huyền Thoại");
				const randomRune =
					rarityPool[Math.floor(Math.random() * rarityPool.length)];
				if (randomRune) {
					results.push({
						id: `rune_${randomRune.runeCode}`,
						refId: randomRune.runeCode,
						refType: "rune",
						name: t(randomRune, "name") || randomRune.name,
						type: tUI("vaultSimulator.loot.rune"),
						rarityKey: `shared.rarity.legendary`,
						icon: randomRune.assetAbsolutePath || randomRune.imageUrl || ASSETS.legendary_rune,
						color: "text-orange-600",
					});
				}
			}
		};

		if (config.bundles) {
			// Logic cho rương Hoa Linh mới
			config.bundles.forEach((bundle, bIdx) => {
				const roll = weightedRoll(bundle.options);
				processOption(roll, bIdx);
			});

			// Bonus bundle
			if (config.bonusBundle) {
				const bonusRoll = weightedRoll(config.bonusBundle.options);
				if (bonusRoll.type !== "none") {
					processOption(bonusRoll, 99);
				}
			}
		} else {
			// Logic cũ cho các rương tiêu chuẩn
			let fragmentRelicChance = 0;
			config.drops.forEach(drop => {
				if (drop.type === "champion_fragments") {
					const roll = weightedRoll(drop.rolls);
					fragmentRelicChance = roll.relicChance || 0;

					roll.items.forEach((amount, rIdx) => {
						const randomChamp =
							allChampions[Math.floor(Math.random() * allChampions.length)];
						results.push({
							id: `champ_frag_${Math.random()}_${rIdx}`,
							name: t(randomChamp, "name") || randomChamp?.name || "???",
							amount: amount,
							icon: randomChamp?.assets?.[0]?.avatar || ASSETS.champ_frag,
							isChamp: true,
							color: "text-blue-600",
						});
					});
				} else if (drop.type === "wild_fragments") {
					const roll = weightedRoll(drop.rolls);
					roll.items.forEach(amount => {
						results.push({
							id: "wild_frag",
							nameKey: "vaultSimulator.loot.wild_frags",
							name: tUI("vaultSimulator.loot.wild_frags"),
							amount: amount,
							icon: ASSETS.wild_frag,
							color: "text-orange-600",
						});
					});
				} else if (drop.type === "relic") {
					if (Math.random() * 100 < fragmentRelicChance) {
						const rarityPool = allRelics.filter(r => r.rarity === drop.rarity);
						const randomRelic =
							rarityPool[Math.floor(Math.random() * rarityPool.length)];
						if (randomRelic) {
							const key = getRarityKey(randomRelic.rarity);
							results.push({
								id: `relic_${randomRelic.relicCode}`,
								refId: randomRelic.relicCode,
								refType: "relic",
								name: t(randomRelic, "name") || randomRelic.name,
								type: tUI("vaultSimulator.loot.relic"),
								rarityKey: `shared.rarity.${key}`,
								icon: randomRelic.assetAbsolutePath,
								color: key === "common" ? "text-green-600" : "text-blue-600",
							});
						}
					}
				} else if (drop.type === "relic_slot") {
					const roll = weightedRoll(drop.options);
					if (roll.type === "cosmic_bless") {
						results.push({
							id: "cosmic_blessing",
							nameKey: "vaultSimulator.loot.cosmic_blessing",
							refType: "static_relic",
							name: tUI("vaultSimulator.loot.cosmic_blessing"),
							type: tUI("vaultSimulator.loot.relic"),
							rarityKey: "shared.rarity.common",
							icon: ASSETS.cosmic_blessing,
							color: "text-blue-600",
						});
					} else {
						const rarityPool = allRelics.filter(r => r.rarity === "Hiếm");
						const randomRelic =
							rarityPool[Math.floor(Math.random() * rarityPool.length)];
						if (randomRelic) {
							results.push({
								id: `relic_${randomRelic.relicCode}`,
								refId: randomRelic.relicCode,
								refType: "relic",
								name: t(randomRelic, "name") || randomRelic.name,
								type: tUI("vaultSimulator.loot.relic"),
								rarityKey: "shared.rarity.rare",
								icon: randomRelic.assetAbsolutePath,
								color: "text-blue-600",
							});
						}
					}
				} else if (drop.type === "bonus") {
					const roll = weightedRoll(drop.options);
					if (roll.type === "star_crystal") {
						const region = getResourceRegion();
						results.push({
							id: `star_crystal_${region?.id}`,
							nameKey: "vaultSimulator.loot.star_crystal",
							name: tUI("vaultSimulator.loot.star_crystal"),
							amount: roll.amount,
							icon: ASSETS.star_crystal,
							region: region,
							color: "text-orange-500",
						});
					} else if (roll.type === "gemstone") {
						const region = getResourceRegion();
						results.push({
							id: `gemstone_${region?.id}`,
							nameKey: "vaultSimulator.loot.gemstone",
							name: tUI("vaultSimulator.loot.gemstone"),
							amount: roll.amount,
							icon: ASSETS.gemstone,
							region: region,
							color: "text-purple-600",
						});
					}
				} else if (drop.type === "rune_shards") {
					results.push({
						id: "rune_shards",
						nameKey: "vaultSimulator.loot.rune_shards",
						name: tUI("vaultSimulator.loot.rune_shards"),
						amount: drop.amount,
						icon: ASSETS.rune_shards,
						color: "text-pink-600",
					});
				} else if (drop.type === "rune") {
					const roll = weightedRoll(drop.rolls);
					const rarityPool = allRunes.filter(r => r.rarity === roll.rarity);
					const randomRune =
						rarityPool[Math.floor(Math.random() * rarityPool.length)];
					if (randomRune) {
						const key = getRarityKey(randomRune.rarity);
						results.push({
							id: `rune_${randomRune.runeCode}`,
							refId: randomRune.runeCode,
							refType: "rune",
							name: t(randomRune, "name") || randomRune.name,
							type: tUI("vaultSimulator.loot.rune"),
							rarityKey: `shared.rarity.${key}`,
							icon: randomRune.assetAbsolutePath || randomRune.imageUrl || ASSETS.legendary_rune,
							color:
								key === "common"
									? "text-green-600"
									: key === "rare"
										? "text-blue-600"
										: "text-orange-600",
						});
					}
				}
			});
		}

		return results;
	};

	const handleOpen = async (vaultType, amount = 1) => {
		setShowConfigModal(false);
		setIsOpening(true);
		setLoot(null);

		// Animation delay
		setTimeout(() => {
			const batchLoot = [];
			const newHistory = { ...history };

			for (let i = 0; i < amount; i++) {
				const singleLoot = generateLoot(vaultType, selectedRegion);
				
				singleLoot.forEach(item => {
					// Thêm vào batch hiện tại
					batchLoot.push(item);

					// Cập nhật lịch sử tích lũy (dùng id + region để group không bị lỗi khi đổi ngôn ngữ)
					const historyKey = `${item.id}_${item.region?.id || "no_region"}`;
					if (newHistory[historyKey]) {
						newHistory[historyKey].amount += (item.amount || 1);
					} else {
						newHistory[historyKey] = { 
							...item, 
							amount: item.amount || 1
						};
					}
				});
			}

			// Gộp các item giống nhau trong batchLoot
			const aggregatedBatch = [];
			const batchMap = {};
			
			batchLoot.forEach(item => {
				const key = `${item.id}_${item.region?.id || "no_region"}`;
				if (batchMap[key]) {
					batchMap[key].amount += (item.amount || 1);
				} else {
					batchMap[key] = { ...item, amount: item.amount || 1, batchKey: key };
					aggregatedBatch.push(batchMap[key]);
				}
			});

			setLoot(aggregatedBatch);
			setHistory(newHistory);
			setIsOpening(false);
		}, 1500);
	};

	const clearHistory = () => {
		setHistory({});
		localStorage.removeItem("vault_sim_history");
	};

	return (
		<div className='min-h-screen bg-page-bg text-text-primary selection:bg-primary-500 overflow-x-hidden font-primary relative'>
			<PageTitle
				title={
					tUI("vaultSimulator.titleMain") +
					" " +
					tUI("vaultSimulator.titleSub") +
					" " +
					tUI("vaultSimulator.loot.simulator")
				}
				description={tUI("vaultSimulator.description")}
			/>

			{/* Ambient Background Elements */}
			<div className='absolute inset-0 z-0 pointer-events-none'>
				<div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40' />
				<div className='absolute -top-24 -left-24 w-96 h-96 bg-primary-500/5 blur-[120px] rounded-full' />
				<div className='absolute top-1/2 -right-24 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full' />
			</div>

			<div className='max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-4 lg:px-8 relative z-10'>
				{/* Header */}
				<header className='mb-6 sm:mb-10 text-center relative'>

					<h1 className='text-4xl md:text-7xl font-black mb-3 sm:mb-4 leading-tight tracking-tighter uppercase max-w-4xl mx-auto'>
						<span className='text-text-primary'>
							{tUI("vaultSimulator.titleMain")}{" "}
						</span>
						<span className='text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400'>
							{tUI("vaultSimulator.titleSub")}
						</span>
					</h1>
					<p className='text-text-secondary text-xl max-w-2xl mx-auto font-secondary leading-relaxed'>
						{tUI("vaultSimulator.description")}
					</p>
				</header>

				{/* Main Content Area: Grid or Results */}
				{!isOpening && !loot && (
					<>
						{/* Selection Grid */}
						<div className='space-y-10 sm:space-y-16 mb-16'>
							{VAULT_GROUPS.map((group, groupIdx) => (
								<section key={group.id} className='space-y-4 sm:space-y-6'>
									{/* Group Header */}
									<div className='flex items-center gap-4 sm:gap-6'>
										<div className='flex-none text-text-primary'>
											<h2 className='text-2xl sm:text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3 sm:gap-4'>
												<LayoutGrid className='w-6 h-6 sm:w-8 sm:h-8 text-primary-500' />
												{tUI(group.titleKey)}
											</h2>
										</div>
										<div className='h-[2px] flex-1 bg-gradient-to-r from-border via-border/50 to-transparent' />
									</div>

									{/* Group Grid */}
									<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6'>
										{group.vaults.map((key, idx) => {
											const config = VAULT_CONFIG[key];
											if (!config) return null;
											return (
												<motion.div
													key={key}
													initial={{ opacity: 0, y: 30 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ delay: (groupIdx * 0.2) + (idx * 0.1) }}
													whileHover={{ y: -10, scale: 1.02 }}
													whileTap={{ scale: 0.95 }}
													onClick={() => {
														setSelectedVault(key);
														setSelectedRegion(null);
														setOpenAmount(1);
														setShowConfigModal(true);
													}}
													className={`group cursor-pointer relative flex flex-col items-center p-4 sm:p-6 rounded-3xl transition-all duration-500 overflow-hidden ${config.bg} backdrop-blur-sm border border-border shadow-md hover:shadow-xl`}
												>
													{/* Specific Info Button */}
													<div 
														onClick={(e) => {
															e.stopPropagation();
															setSelectedVault(key);
															setShowProbModal(true);
														}}
														className='absolute top-3 right-3 sm:top-4 sm:right-4 p-2 z-10 text-primary-600 bg-surface-bg/30 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-surface-bg hover:scale-110 shadow-sm border border-transparent hover:border-border'
														title={tUI("vaultSimulator.probInfo")}
													>
														<Info className='w-5 h-5 sm:w-6 sm:h-6' />
													</div>
													
													<div className='relative w-24 h-24 sm:w-36 sm:h-36 mb-3 sm:mb-4 transition-transform group-hover:scale-110 duration-500 shrink-0'>
														<img
															src={ASSETS[key]}
															alt={key}
															className='w-full h-full object-contain filter group-hover:drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)] transition-all'
														/>
													</div>
													<span
														className={`text-lg sm:text-2xl font-black uppercase italic tracking-wider ${config.color} group-hover:scale-110 transition-transform leading-tight text-center`}
													>
														{tUI(config.nameKey)}
													</span>
												</motion.div>
											);
										})}
									</div>
								</section>
							))}
						</div>

						{/* History Section */}
						{Object.keys(history).length > 0 && (
							<section className='mb-32 animate-in fade-in slide-in-from-bottom-5 duration-700'>
								<div className='flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 sm:mb-16'>
									<div className='flex items-center gap-6'>
										<div className='p-4 bg-primary-500/10 rounded-3xl shadow-lg border border-primary-500/20'>
											<History className='w-8 h-8 sm:w-10 sm:h-10 text-primary-500' />
										</div>
										<div>
											<h2 className='text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-text-primary'>
												{tUI("vaultSimulator.historyTitle")}
											</h2>
											<p className='text-text-secondary text-sm sm:text-lg font-bold uppercase tracking-widest mt-1'>
												{tUI("vaultSimulator.totalGains")}
											</p>
										</div>
									</div>
									<Button
										variant='secondary'
										onClick={clearHistory}
										className='px-8 py-4 rounded-2xl font-black text-sm sm:text-base border-red-500/20 hover:bg-red-500/5 hover:text-red-500 transition-all duration-300'
										iconLeft={<Trash2 className='w-5 h-5' />}
									>
										{tUI("vaultSimulator.clearHistory")}
									</Button>
								</div>

								<div className='bg-surface-bg/50 backdrop-blur-md rounded-[40px] border border-border p-8 sm:p-12 shadow-2xl relative overflow-hidden'>
									<div className='absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-blue-500/5 opacity-50' />
									<div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 sm:gap-10 relative z-10'>
										{Object.values(history).map((item, idx) => (
											<LootItem key={`${item.id}-${idx}`} item={item} isSmall />
										))}
									</div>
								</div>
							</section>
						)}
					</>
				)}

				{/* Selection Modal */}
				<AnimatePresence>
					{showConfigModal && (
						<div 
							onClick={() => setShowConfigModal(false)}
							className='fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/30 overflow-y-auto custom-scrollbar'
						>
							<motion.div
								onClick={(e) => e.stopPropagation()}
								initial={{ opacity: 0, scale: 0.9, y: 20 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.9, y: 20 }}
								className='relative w-full max-w-xl bg-[var(--color-modal-bg)] rounded-2xl sm:rounded-3xl border border-border shadow-xl p-2 sm:p-4 my-auto overflow-hidden'
							>
								{/* Decor */}
								<div className='absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 blur-[80px] rounded-full' />
								
								{/* Close */}
								<button 
									onClick={() => setShowConfigModal(false)}
									className='absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-xl hover:bg-input-bg text-text-secondary hover:text-text-primary transition-all duration-300 z-20'
								>
									<X className='w-5 h-5 sm:w-6 sm:h-6' />
								</button>

								<div className='flex flex-col items-center text-center relative z-10'>
									<div className='w-16 h-16 sm:w-24 sm:h-24 mb-2 animate-float'>
										<img
											src={ASSETS[selectedVault]}
											alt=''
											className='w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)]'
										/>
									</div>
									<h2 className={`text-xl sm:text-2xl font-black uppercase italic tracking-tighter mb-3 sm:mb-4 ${VAULT_CONFIG[selectedVault]?.color}`}>
										{tUI(VAULT_CONFIG[selectedVault]?.nameKey)}
									</h2>

									{/* Config Grid */}
									<div className='w-full space-y-3 sm:space-y-4 text-left'>
										{/* Quantity */}
										<div className='space-y-2'>
											<label className='text-[10px] sm:text-xs font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-3'>
												<span className='w-2 h-2 bg-primary-500 rounded-full' />
												{tUI("vaultSimulator.openAmount")}
											</label>
											<div className='flex flex-wrap gap-2 mb-2'>
												{[1, 10, 50, 100].map(amt => (
													<button
														key={amt}
														onClick={() => setOpenAmount(amt)}
														className={`flex-1 min-w-[50px] py-2 sm:py-3 rounded-xl font-black text-sm sm:text-base transition-all duration-300 border-2 ${
															openAmount === amt 
																? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20 scale-105"
																: "bg-input-bg border-border text-text-secondary hover:border-primary-500/50 hover:bg-surface-bg"
														}`}
													>
														{amt}
													</button>
												))}
											</div>
											{/* Input tùy chỉnh */}
											<div className='relative'>
												<input
													type='number'
													min='1'
													max='500'
													value={openAmount}
													onChange={(e) => {
														const val = parseInt(e.target.value);
														setOpenAmount(isNaN(val) ? 1 : Math.max(1, Math.min(500, val)));
													}}
													className='w-full bg-input-bg border-2 border-border focus:border-primary-500 rounded-xl py-3 px-4 font-black text-base text-text-primary outline-none transition-all'
													placeholder={tUI("vaultSimulator.enterAmount")}
												/>
												<div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none'>
													<LayoutGrid className='w-5 h-5 text-text-secondary' />
												</div>
											</div>
										</div>

										{/* Region Selection (only for Star Vessels) */}
										{["silver_star_vessel", "gold_star_vessel", "nova_crystal_vessel"].includes(selectedVault) && (
											<div className='space-y-2'>
												<label className='text-[10px] sm:text-xs font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-3'>
													<span className='w-2 h-2 bg-primary-500 rounded-full' />
													{tUI("vaultSimulator.selectRegion")}
												</label>
												<div className='flex flex-wrap gap-2 p-2 bg-input-bg/50 rounded-2xl border border-border'>
													<button
														onClick={() => setSelectedRegion(null)}
														className={`p-1 rounded-lg border-2 transition-all duration-300 ${
															selectedRegion === null
																? "bg-primary-500/20 border-primary-500 scale-105 shadow-lg shadow-primary-500/10"
																: "bg-surface-bg border-border hover:border-primary-500/50"
														}`}
													>
														<div className='w-8 h-8 flex items-center justify-center text-xs font-black text-primary-500'>
															?
														</div>
													</button>
													{REGIONS.map(r => (
														<button
															key={r.id}
															onClick={() => setSelectedRegion(r)}
															className={`p-1 rounded-lg border-2 transition-all duration-300 ${
																selectedRegion?.id === r.id
																	? "bg-primary-500/20 border-primary-500 scale-105 shadow-lg shadow-primary-500/10"
																	: "bg-surface-bg border-border hover:border-primary-500/50"
															}`}
															title={r.name}
														>
															<img
																src={r.image}
																alt={r.name}
																className='w-8 h-8 object-contain'
															/>
														</button>
													))}
												</div>
											</div>
										)}
									</div>

									<Button
										variant='primary'
										onClick={() => handleOpen(selectedVault, openAmount)}
										className='w-full mt-6 py-4 text-lg rounded-2xl font-black italic uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(var(--primary-500-rgb),0.3)] hover:scale-[1.02] transform transition-all duration-300'
										iconRight={<Sparkles className='w-5 h-5' />}
									>
										{tUI("vaultSimulator.startSim")}
									</Button>
								</div>
							</motion.div>
						</div>
					)}
				</AnimatePresence>

				{/* Opening Animation */}
				{isOpening && (
					<div className='flex flex-col items-center justify-center py-24'>
						<motion.div
							animate={{
								scale: [1, 1.25, 1],
								rotate: [0, -8, 8, -8, 0],
								filter: [
									"brightness(1) blur(0px)",
									"brightness(1.5) blur(1px)",
									"brightness(1) blur(0px)",
								],
							}}
							transition={{ repeat: Infinity, duration: 0.6 }}
							className='relative w-64 h-64'
						>
							<img
								src={ASSETS[selectedVault]}
								alt=''
								className='w-full h-full object-contain filter drop-shadow-[0_0_50px_rgba(59,130,246,0.2)]'
							/>
							<div className='absolute inset-0 bg-primary-500/10 blur-[120px] animate-pulse rounded-full' />
						</motion.div>
						<motion.h2
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className='text-3xl font-black mt-12 uppercase italic tracking-widest animate-pulse text-primary-600'
						>
							{tUI("vaultSimulator.opening", {
								vault: tUI(VAULT_CONFIG[selectedVault]?.nameKey),
							})}
						</motion.h2>
					</div>
				)}

				<AnimatePresence>
					{loot && !isOpening && (
						<motion.div
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 50 }}
							className='w-full min-h-[60vh] flex flex-col mb-32'
						>
							{/* Results Header */}
							<div className='mb-12 flex flex-col sm:flex-row items-center justify-between gap-8'>
								<div className='flex items-center gap-6'>
									<div className='p-5 bg-primary-600 shadow-[0_0_30px_rgba(var(--primary-600-rgb),0.3)] rounded-[2rem]'>
										<Sparkles className='w-10 h-10 text-white animate-pulse' />
									</div>
									<div className='text-left'>
										<h3 className='text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-text-primary leading-none'>
											{tUI("vaultSimulator.lootResults")}
										</h3>
										<p className='text-text-secondary text-lg sm:text-xl font-bold uppercase tracking-[0.2em] mt-3'>
											{openAmount}x {tUI(VAULT_CONFIG[selectedVault]?.nameKey)}
										</p>
									</div>
								</div>
							</div>

							{/* Loot Grid */}
							<div className='bg-surface-bg/40 backdrop-blur-md rounded-[3rem] border border-border p-8 sm:p-16 shadow-2xl relative overflow-hidden'>
								<div className='absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-blue-500/5' />
								<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 sm:gap-16 relative z-10 justify-items-center'>
									{loot.map((item, idx) => (
										<motion.div
											key={`${item.id}-${idx}`}
											initial={{ opacity: 0, scale: 0.8, y: 30 }}
											animate={{ opacity: 1, scale: 1, y: 0 }}
											transition={{
												delay: Math.min(idx * 0.05, 1.5),
												type: "spring",
												stiffness: 100,
												damping: 15,
											}}
											className='w-full'
										>
											<LootItem item={item} />
										</motion.div>
									))}
								</div>
							</div>

							{/* Actions (Below Display) */}
							<div className='mt-12 flex flex-wrap justify-center gap-6'>
								<Button
									variant='primary'
									onClick={() => handleOpen(selectedVault, openAmount)}
									className='px-12 py-5 rounded-[2rem] text-xl font-black italic shadow-xl hover:scale-[1.02]'
									iconLeft={<RotateCcw className='w-6 h-6' />}
								>
									{tUI("vaultSimulator.openAgain")}
								</Button>
								<Button
									variant='secondary'
									onClick={() => setLoot(null)}
									className='px-12 py-5 rounded-[2rem] text-xl font-black italic border-2'
									iconLeft={<ChevronRight className='w-6 h-6 rotate-180' />}
								>
									{tUI("vaultSimulator.back")}
								</Button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Probability Modal */}
				<AnimatePresence>
					{showProbModal && (
						<div 
							onClick={() => setShowProbModal(false)}
							className='fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/30 overflow-y-auto custom-scrollbar'
						>
							<motion.div
								onClick={(e) => e.stopPropagation()}
								initial={{ opacity: 0, scale: 0.95, y: 10 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 10 }}
								className='relative w-full max-w-3xl bg-[var(--color-modal-bg)] rounded-2xl border border-border shadow-xl p-2 sm:p-4 my-auto flex flex-col max-h-[90vh]'
							>
								<div className='overflow-y-auto max-h-[80vh] custom-scrollbar'>
									<VaultProbabilityInfo 
										vaultKey={selectedVault} 
										onClose={() => setShowProbModal(false)}
									/>
								</div>
							</motion.div>
						</div>
					)}
				</AnimatePresence>

			</div>
		</div>
	);
};

export default VaultSimulator;
