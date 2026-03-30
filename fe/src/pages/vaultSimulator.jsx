import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Trophy,
	ChevronRight,
	RotateCcw,
	Sparkles,
	Zap,
	Gift,
	Info,
} from "lucide-react";
import PageTitle from "../components/common/pageTitle";
import { useTranslation } from "../hooks/useTranslation";
import axios from "axios";

// --- Assets chuẩn từ icon.json ---
const ASSETS = {
	bronze: "https://images.pocguide.top/icon/Bronze_Vault.webp",
	silver: "https://images.pocguide.top/icon/Silver_Vault.webp",
	gold: "https://images.pocguide.top/icon/Gold_Vault.webp",
	platinum: "https://images.pocguide.top/icon/Platinum_Vault.webp",
	diamond: "https://images.pocguide.top/icon/Diamond_Vault.webp",
	champFrag: "https://images.pocguide.top/icon/Wild_Fragment.webp",
	wildFrag: "https://images.pocguide.top/icon/Wild_Fragment.webp",
	stardust:
		"https://wpocimg.s3.ap-southeast-2.amazonaws.com/icons/Stardust_icon.png",
	cosmicBlessing:
		"https://images.pocguide.top/icon/Greater_Cosmic_Blessing.webp",
	starCrystal: "https://images.pocguide.top/icon/Star_Crystal.webp",
	gemstone: "https://images.pocguide.top/icon/Gemstone.webp",
};

// --- Config Tỷ lệ (Drop Rates) ---
const VAULT_CONFIG = {
	bronze: {
		id: "bronze",
		nameKey: "vaultSimulator.tier.bronze",
		sourceKey: "vaultSimulator.sources.bronze",
		color: "text-[#b87333]",
		bg: "bg-[#b87333]/15",
		border: "border-[#b87333]/30",
		glow: "from-[#b87333]/30",
		drops: [
			{
				type: "champion_fragments",
				rolls: [
					{ chance: 95, items: [5] },
					{ chance: 5, items: [10] },
				],
			},
		],
	},
	silver: {
		id: "silver",
		nameKey: "vaultSimulator.tier.silver",
		sourceKey: "vaultSimulator.sources.silver",
		color: "text-[#475569]",
		bg: "bg-slate-100",
		border: "border-slate-300",
		glow: "from-slate-400/30",
		drops: [
			{
				type: "champion_fragments",
				rolls: [
					{ chance: 90, items: [10] },
					{ chance: 10, items: [15] },
				],
			},
		],
	},
	gold: {
		id: "gold",
		nameKey: "vaultSimulator.tier.gold",
		sourceKey: "vaultSimulator.sources.gold",
		color: "text-[#d4af37]",
		bg: "bg-[#d4af37]/15",
		border: "border-[#d4af37]/30",
		glow: "from-[#d4af37]/30",
		drops: [
			{
				type: "champion_fragments",
				rolls: [
					{ chance: 90, items: [20], relicChance: 22.22 },
					{ chance: 10, items: [20, 10], relicChance: 100 },
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
		color: "text-[#0d9488]",
		bg: "bg-[#0d9488]/15",
		border: "border-[#0d9488]/30",
		glow: "from-[#0d9488]/30",
		drops: [
			{
				type: "champion_fragments",
				rolls: [
					{ chance: 60, items: [40], relicChance: 22.22 },
					{ chance: 30, items: [20, 20], relicChance: 22.22 },
					{ chance: 10, items: [30, 20], relicChance: 100 },
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
		color: "text-[#7c3aed]",
		bg: "bg-[#7c3aed]/15",
		border: "border-[#7c3aed]/30",
		glow: "from-[#7c3aed]/30",
		drops: [
			{
				type: "champion_fragments",
				rolls: [
					{ chance: 75, items: [40, 40] },
					{ chance: 20, items: [40, 40, 40] },
					{ chance: 5, items: [80, 80, 80] },
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
};

const VaultSimulator = () => {
	const { tUI } = useTranslation();
	const [selectedVault, setSelectedVault] = useState(null);
	const [isOpening, setIsOpening] = useState(false);
	const [loot, setLoot] = useState(null);
	const [allRelics, setAllRelics] = useState([]);
	const [allChampions, setAllChampions] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const API_BASE = import.meta.env.VITE_API_URL || "";
				const [relicsRes, champsRes] = await Promise.all([
					axios.get(`${API_BASE}/api/relics?limit=-1`),
					axios.get(`${API_BASE}/api/champions?limit=-1`),
				]);
				const rawRelics = relicsRes.data?.items || relicsRes.data || [];
				const rawChamps = champsRes.data?.items || champsRes.data || [];

				console.log("Raw API Data:", { rawChamps, rawRelics });

				// Lọc Cổ vật: Chấp nhận cả 'general' hoặc 'chung'
				const filteredRelics = Array.isArray(rawRelics)
					? rawRelics.filter(r => {
							const type = String(r.type || "").toLowerCase();
							const rarity = r.rarity;
							return (
								(type === "general" || type === "chung") &&
								(rarity === "Thường" || rarity === "Hiếm")
							);
						})
					: [];

				// Lọc Tướng: Không lấy vùng "Hoa Linh Lục Địa" và championID "C666"
				const filteredChamps = Array.isArray(rawChamps)
					? rawChamps.filter(c => {
							const regions = Array.isArray(c.regions)
								? c.regions
								: [c.region || ""];
							const isSpiritBlossom = regions.some(
								r => String(r || "").toLowerCase() === "hoa linh lục địa",
							);
							return (
								!isSpiritBlossom &&
								c.championID !== "C666" &&
								c.championID !== "C043"
							);
						})
					: [];

				console.log(
					`Simulator Filtered: ${filteredChamps.length} Champions, ${filteredRelics.length} Relics`,
				);

				setAllRelics(filteredRelics);
				setAllChampions(
					filteredChamps.length > 0
						? filteredChamps
						: [{ name: "Champion", championID: "NONE" }],
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

	const generateLoot = vaultType => {
		const config = VAULT_CONFIG[vaultType];
		const results = [];

		let fragmentRelicChance = 0;

		config.drops.forEach(drop => {
			if (drop.type === "champion_fragments") {
				const roll = weightedRoll(drop.rolls);
				fragmentRelicChance = roll.relicChance || 0; // Lưu tỉ lệ rớt cổ vật từ roll tướng (Gold/Platinum)

				roll.items.forEach((amount, rIdx) => {
					// Chọn tướng ngẫu nhiên từ pool đã lọc
					const randomChamp =
						allChampions[Math.floor(Math.random() * allChampions.length)];
					results.push({
						id: `champ_frag_${Math.random()}_${rIdx}`,
						// Chỉ hiển thị tên tướng để chuyên nghiệp hơn (ví dụ: ASHE)
						name: randomChamp?.name || "???",
						amount: amount,
						// Sử dụng ảnh chân dung tướng làm icon chính
						icon: randomChamp?.assets?.[0]?.avatar || ASSETS.champFrag,
						isChamp: true,
						color: "text-blue-600",
					});
				});
			} else if (drop.type === "wild_fragments") {
				const roll = weightedRoll(drop.rolls);
				roll.items.forEach(amount => {
					results.push({
						id: `wild_frag_${Math.random()}`,
						name: tUI("vaultSimulator.loot.wildFrags"),
						amount: amount,
						icon: ASSETS.wildFrag,
						color: "text-orange-600",
					});
				});
			} else if (drop.type === "relic") {
				// Tỉ lệ rớt cổ vật ở Gold/Platinum phụ thuộc vào roll fragments
				if (Math.random() * 100 < fragmentRelicChance) {
					const rarityPool = allRelics.filter(r => r.rarity === drop.rarity);
					const randomRelic =
						rarityPool[Math.floor(Math.random() * rarityPool.length)];
					if (randomRelic) {
						results.push({
							id: `relic_${randomRelic.relicCode}`,
							name: randomRelic.name,
							type: tUI("vaultSimulator.loot.relic"),
							rarityKey: `relic.rarity.${randomRelic.rarity === "Hiếm" ? "rare" : "common"}`,
							icon: randomRelic.assetAbsolutePath,
							color:
								drop.rarity === "Thường" ? "text-green-600" : "text-blue-600",
						});
					}
				}
			} else if (drop.type === "relic_slot") {
				// Slot rớt 100% của Diamond
				const roll = weightedRoll(drop.options);
				if (roll.type === "cosmic_bless") {
					results.push({
						id: "cosmic_bless",
						name: tUI("vaultSimulator.loot.cosmicBlessing"),
						type: tUI("vaultSimulator.loot.relic"),
						rarityKey: "relic.rarity.common",
						icon: ASSETS.cosmicBlessing,
						color: "text-blue-600",
					});
				} else {
					const rarityPool = allRelics.filter(r => r.rarity === "Hiếm");
					const randomRelic =
						rarityPool[Math.floor(Math.random() * rarityPool.length)];
					if (randomRelic) {
						results.push({
							id: `relic_${randomRelic.relicCode}`,
							name: randomRelic.name,
							type: tUI("vaultSimulator.loot.relic"),
							rarityKey: "relic.rarity.rare",
							icon: randomRelic.assetAbsolutePath,
							color: "text-blue-600",
						});
					}
				}
			} else if (drop.type === "bonus") {
				const roll = weightedRoll(drop.options);
				if (roll.type === "star_crystal") {
					results.push({
						id: "star_crystal",
						name: tUI("vaultSimulator.loot.starCrystal"),
						amount: roll.amount,
						icon: ASSETS.starCrystal,
						color: "text-orange-500",
					});
				} else if (roll.type === "gemstone") {
					results.push({
						id: "gemstone",
						name: tUI("vaultSimulator.loot.gemstone"),
						amount: roll.amount,
						icon: ASSETS.gemstone,
						color: "text-purple-600",
					});
				}
			}
		});

		return results;
	};

	const handleOpen = async vaultType => {
		setSelectedVault(vaultType);
		setIsOpening(true);
		setLoot(null);

		// Animation delay
		setTimeout(() => {
			const finalLoot = generateLoot(vaultType);
			setLoot(finalLoot);
			setIsOpening(false);
		}, 1800);
	};

	return (
		<div className='min-h-screen bg-white text-gray-900 selection:bg-primary-500 overflow-x-hidden font-primary relative'>
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
				<header className='mb-12 sm:mb-20 text-center'>
					<h1 className='text-4xl md:text-7xl font-black mb-6 sm:mb-8 leading-tight tracking-tighter uppercase max-w-4xl mx-auto'>
						<span className='text-gray-900'>
							{tUI("vaultSimulator.titleMain")}{" "}
						</span>
						<span className='text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400'>
							{tUI("vaultSimulator.titleSub")}
						</span>
					</h1>
					<p className='text-gray-500 text-xl max-w-2xl mx-auto font-secondary leading-relaxed'>
						{tUI("vaultSimulator.description")}
					</p>
				</header>

				{/* Selection Grid */}
				{!loot && !isOpening && (
					<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-8 mb-24'>
						{Object.entries(VAULT_CONFIG).map(([key, config], idx) => (
							<motion.button
								key={key}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: idx * 0.1 }}
								whileHover={{ y: -10 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setSelectedVault(key)}
								className={`group relative flex flex-col items-center p-6 sm:p-8 rounded-3xl transition-all duration-500 overflow-hidden ${
									selectedVault === key
										? `bg-white ring-4 ring-primary-500/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] scale-105`
										: `${config.bg} backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-2xl`
								}`}
							>
								{/* Vault Glow Effect */}
								{selectedVault === key && (
									<div
										className={`absolute inset-0 bg-gradient-to-b ${config.glow} animate-pulse`}
									/>
								)}

								<div className='relative w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-6 transition-all shrink-0'>
									<img
										src={ASSETS[key]}
										alt={key}
										className='w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-500'
									/>
								</div>
								<span
									className={`text-lg sm:text-xl font-black uppercase italic tracking-wider ${config.color} group-hover:scale-110 transition-transform leading-none text-center`}
								>
									{tUI("vaultSimulator.vaultLabel")} {tUI(config.nameKey)}
								</span>
								{selectedVault === key && (
									<span
										className='mt-6 px-5 py-2 bg-primary-600 text-white rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest animate-bounce shadow-lg cursor-pointer block z-10 shrink-0'
										onClick={e => {
											e.stopPropagation(); // Ngăn chặn sự kiện click lan lên thẻ cha
											handleOpen(key);
										}}
									>
										{tUI("vaultSimulator.clickToOpen")}
									</span>
								)}
							</motion.button>
						))}
					</div>
				)}

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
								vault:
									tUI("vaultSimulator.vaultLabel") +
									" " +
									tUI(VAULT_CONFIG[selectedVault].nameKey),
							})}
						</motion.h2>
					</div>
				)}

				{/* Loot Results */}
				{loot && (
					<div className='flex flex-col items-center w-full'>
						<div className='grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap justify-center gap-4 sm:gap-10 mb-20 w-full'>
							{loot.map((item, idx) => (
								<motion.div
									key={item.id || `loot-${idx}`}
									initial={{ opacity: 0, scale: 0.8, y: 50 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									transition={{
										delay: idx * 0.15 + 0.3,
										type: "spring",
										stiffness: 100,
										damping: 15,
									}}
									className='flex flex-col items-center group w-full lg:w-auto'
								>
									<div
										className={`relative w-full sm:w-48 h-40 sm:h-48 flex items-center justify-center rounded-3xl bg-white border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6 shadow-2xl group-hover:shadow-primary-500/10 group-hover:-translate-y-2 transition-all duration-500 overflow-hidden`}
									>
										<img
											src={item.icon}
											alt={item.name}
											className={`w-full h-full object-contain relative z-10 filter group-hover:rotate-6 transition-transform duration-700 ${item.isChamp ? "rounded-2xl border-2 sm:border-4 border-primary-500/20" : ""}`}
										/>
										{item.amount && (
											<div className='absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-primary-600 px-3 sm:px-4 py-1 rounded-lg sm:rounded-xl font-black text-xl sm:text-2xl text-white shadow-xl border border-white/20 transform group-hover:scale-110 transition-transform z-20'>
												x{item.amount}
											</div>
										)}
									</div>
									<h4
										className={`text-base sm:text-xl font-black uppercase italic text-center max-w-[160px] sm:max-w-[200px] leading-tight mb-2 ${item.color || "text-gray-900"} drop-shadow-sm`}
									>
										{item.name}
									</h4>
									{(item.rarityKey || item.type) && (
										<span className='px-3 sm:px-4 py-1 rounded-full bg-gray-50 text-[9px] sm:text-[10px] uppercase tracking-widest font-black border border-gray-100 text-gray-500 shadow-sm'>
											{tUI(item.rarityKey) || item.type}
										</span>
									)}
								</motion.div>
							))}
						</div>

						<div className='flex flex-col sm:flex-row gap-6'>
							<button
								onClick={() => handleOpen(selectedVault)}
								className='flex items-center gap-3 px-12 py-5 bg-primary-600 hover:bg-primary-800 text-white rounded-[1.5rem] font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary-600/20'
							>
								<RotateCcw className='w-6 h-6' />{" "}
								{tUI("vaultSimulator.openAgain")}
							</button>
							<button
								onClick={() => {
									setLoot(null);
									setSelectedVault(null);
								}}
								className='flex items-center gap-3 px-12 py-5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-[1.5rem] font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-md'
							>
								{tUI("vaultSimulator.chooseOther")}
							</button>
						</div>
					</div>
				)}

				{/* Probability Info Section */}
				{!isOpening && !loot && (
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8 }}
						className='mt-6 sm:mt-24 p-2 sm:p-4 bg-white border border-gray-100 rounded-3xl shadow-sm relative overflow-hidden'
					>
						<div className='absolute -top-24 -right-24 w-64 h-64 bg-primary-500/[0.03] blur-[100px]' />

						<div className='flex items-center gap-2 sm:gap-5 mb-2 sm:mb-6'>
							<div className='p-3 sm:p-4 bg-primary-500/10 text-primary-600 rounded-2xl sm:rounded-3xl border border-primary-500/10'>
								<Info className='w-6 h-6 sm:w-7 sm:h-7' />
							</div>
							<h2 className='text-3xl sm:text-4xl font-black uppercase italic tracking-tight'>
								{tUI("vaultSimulator.probInfo")}
							</h2>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 text-sm'>
							<div className='space-y-2s bg-gray-50/50 p-2 sm:p-4 rounded-2xl border border-gray-100 hover:border-primary-500/20 transition-all duration-300 shadow-sm'>
								<h3 className='text-xl sm:text-2xl font-black text-[#cd7f32] uppercase italic underline underline-offset-[12px] decoration-2 decoration-[#cd7f32]/50'>
									{tUI("vaultSimulator.probBronzeSilverTitle")}
								</h3>
								<p className='text-gray-600 leading-relaxed font-secondary text-base whitespace-pre-line pt-1'>
									{tUI("vaultSimulator.probBronzeSilverDesc")}
								</p>
								<div className='pt-4 border-t border-gray-200'>
									<h4 className='text-xs font-bold text-primary-600 uppercase tracking-widest mb-3'>
										{tUI("vaultSimulator.sourceTitle")}
									</h4>
									<p className='text-gray-500 text-xs leading-relaxed whitespace-pre-line bg-white rounded-xl'>
										{tUI("vaultSimulator.sources.bronze") +
											"\n\n" +
											tUI("vaultSimulator.sources.silver")}
									</p>
								</div>
							</div>
							<div className='space-y-6 bg-gray-50/50 p-2 sm:p-4 rounded-2xl border border-gray-100 hover:border-primary-500/20 transition-all duration-300 shadow-sm'>
								<h3 className='text-xl sm:text-2xl font-black text-[#ffd700] uppercase italic underline underline-offset-[12px] decoration-2 decoration-[#ffd700]/50'>
									{tUI("vaultSimulator.probGoldPlatinumTitle")}
								</h3>
								<p className='text-gray-600 leading-relaxed font-secondary text-base whitespace-pre-line pt-2'>
									{tUI("vaultSimulator.probGoldPlatinumDesc")}
								</p>
								<div className='pt-4 border-t border-gray-200'>
									<h4 className='text-xs font-bold text-primary-600 uppercase tracking-widest mb-3'>
										{tUI("vaultSimulator.sourceTitle")}
									</h4>
									<p className='text-gray-500 text-xs leading-relaxed whitespace-pre-line bg-white rounded-xl '>
										{tUI("vaultSimulator.sources.gold") +
											"\n\n" +
											tUI("vaultSimulator.sources.platinum")}
									</p>
								</div>
							</div>
							<div className='space-y-6 bg-gray-50/50 p-2 sm:p-4 rounded-2xl border border-gray-100 hover:border-primary-500/20 transition-all duration-300 shadow-sm'>
								<h3 className='text-xl sm:text-2xl font-black text-[#4eb9d1] uppercase italic underline underline-offset-[12px] decoration-2 decoration-[#b9f2ff]/50'>
									{tUI("vaultSimulator.probDiamondTitle")}
								</h3>
								<p className='text-gray-600 leading-relaxed font-secondary text-base whitespace-pre-line pt-2'>
									{tUI("vaultSimulator.probDiamondDesc")}
								</p>
								<div className='pt-4 border-t border-gray-200'>
									<h4 className='text-xs font-bold text-primary-600 uppercase tracking-widest mb-3'>
										{tUI("vaultSimulator.sourceTitle")}
									</h4>
									<p className='text-gray-500 text-xs leading-relaxed whitespace-pre-line bg-white rounded-xl '>
										{tUI("vaultSimulator.sources.diamond")}
									</p>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default VaultSimulator;
