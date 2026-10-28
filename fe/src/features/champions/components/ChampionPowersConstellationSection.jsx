import React, { useState, useMemo, useEffect } from "react";
import {
	Eye,
	Compass,
	Sparkles,
	Zap,
	Star,
	Layers,
	Shield,
	ChevronRight,
	ChevronDown,
	ChevronUp,
	Lock,
	CheckCircle2,
	Info,
} from "lucide-react";
import MarkupRenderer from "@/components/common/MarkupRenderer";
import SafeImage from "@/components/common/SafeImage";
import ConstellationMap from "@/features/champions/components/constellationMap";

const ICONS = {
	firstRelic: "https://images.pocguide.top/icon/25px-PoC_Common_Relic_icon.webp",
	rareRelic: "https://images.pocguide.top/icon/25px-PoC_Rare_Relic_icon.webp",
	legendary: "https://images.pocguide.top/icon/Champion_rarity.webp",
	epic: "https://images.pocguide.top/icon/Epic_rarity.webp",
	rare: "https://images.pocguide.top/icon/Rare_rarity.webp",
	common: "https://images.pocguide.top/icon/Common_rarity.webp",
	health: "https://images.pocguide.top/icon/20px-PoC_Health_icon.webp",
	regen: "https://images.pocguide.top/icon/20px-PoC_Regen_icon.webp",
	gold: "https://images.pocguide.top/icon/20px-PoC_Gold_Coin_icon.webp",
	revive: "https://images.pocguide.top/icon/20px-PoC_Revive_icon.webp",
	reroll: "https://images.pocguide.top/icon/20px-PoC_Reroll_icon.webp",
};

const DEFAULT_MILESTONE_LEVELS = [8, 13, 19, 25, 30];

// Hàm lấy dữ liệu 50 cấp độ chuẩn
function getLevelProgressData(tUI, upgrades = []) {
	const levelProps = [
		{ level: 1, exp: 0, health: 20, desc: tUI("championLevelRewards.rewards.firstRelicUnlocked") || "Mở khóa ô Cổ Vật Thường 1", icon: ICONS.firstRelic },
		{ level: 2, exp: 50, health: 25 },
		{ level: 3, exp: 100 },
		{ level: 4, exp: 150, health: 30 },
		{ level: 5, exp: 200, desc: tUI("championLevelRewards.rewards.supportCommonItem") || "Vật Phẩm Thường cho Tướng Phụ", icon: ICONS.common },
		{ level: 6, exp: 300, desc: tUI("championLevelRewards.rewards.findRare5") || "+5% Cơ Hội Nhận Đồ Hiếm", icon: ICONS.rare },
		{ level: 7, exp: 450, desc: tUI("championLevelRewards.rewards.reviveToken") || "+1 Token Hồi Sinh", icon: ICONS.revive },
		{ level: 8, exp: 500, desc: tUI("championLevelRewards.rewards.firstRelicRare") || "Nâng cấp Ô Cổ Vật 1 lên Hiếm", icon: ICONS.rareRelic },
		{ level: 9, exp: 560 },
		{ level: 10, exp: 670, regen: 2, desc: tUI("championLevelRewards.rewards.findLegendary1") || "+1% Nhận Đồ Huyền Thoại", icon: ICONS.legendary },
		{ level: 11, exp: 800, desc: tUI("championLevelRewards.rewards.supportRareItem") || "Vật Phẩm Hiếm cho Tướng Phụ", icon: ICONS.rare },
		{ level: 12, exp: 930 },
		{ level: 13, exp: 1070, desc: tUI("championLevelRewards.rewards.secondRelicUnlocked") || "Mở khóa ô Cổ Vật 2", icon: ICONS.firstRelic },
		{ level: 14, exp: 1210, desc: tUI("championLevelRewards.rewards.firstCombatCommon") || "Đồ Thường ở Trận Đầu", icon: ICONS.common },
		{ level: 15, exp: 1360 },
		{ level: 16, exp: 1520, health: 35 },
		{ level: 17, exp: 1690, desc: tUI("championLevelRewards.rewards.supportCardsCommon") || "Đồ Thường cho Bộ Hỗ Trợ", icon: ICONS.common },
		{ level: 18, exp: 1860, desc: tUI("championLevelRewards.rewards.findLegendary2") || "+2% Nhận Đồ Huyền Thoại", icon: ICONS.legendary },
		{ level: 19, exp: 2040, desc: tUI("championLevelRewards.rewards.secondRelicRare") || "Nâng cấp Ô Cổ Vật 2 lên Hiếm", icon: ICONS.rareRelic },
		{ level: 20, exp: 2220, desc: tUI("championLevelRewards.rewards.drawChampionStart") || "Rút Tướng ở Lượt Đầu (Draw Champion at Game Start)", icon: ICONS.legendary },
		{ level: 21, exp: 2410 },
		{ level: 22, exp: 2610, regen: 4 },
		{ level: 23, exp: 2810, desc: tUI("championLevelRewards.rewards.supportCardsRare") || "Vật Phẩm Hiếm cho Bài Hỗ Trợ", icon: ICONS.rare },
		{ level: 24, exp: 3020 },
		{ level: 25, exp: 3230, desc: tUI("championLevelRewards.rewards.thirdRelicUnlocked") || "Mở khóa ô Cổ Vật 3", icon: ICONS.firstRelic },
		{ level: 26, exp: 3450 },
		{ level: 27, exp: 3670 },
		{ level: 28, exp: 3900, health: 40 },
		{ level: 29, exp: 4140, desc: tUI("championLevelRewards.rewards.supportEpicItem") || "Vật Phẩm Sử Thi cho Tướng Phụ", icon: ICONS.epic },
		{ level: 30, exp: 4370, desc: tUI("championLevelRewards.rewards.thirdRelicRare") || "Nâng cấp Ô Cổ Vật 3 lên Hiếm", icon: ICONS.rareRelic },
	];

	return levelProps.map((item) => {
		const deckUpdates = upgrades.filter((u) => u.unlockLevel === item.level);
		return { ...item, deckUpdates };
	});
}

const ChampionPowersConstellationSection = ({
	champion,
	constellationInfo,
	starPowersList = [],
	bonusStarsList = [],
	deckUpgrades = [],
	resolvedStartingCards = [],
	resolvedItems = [],
	tUI,
	tDynamic,
	language = "vi",
	onOpenCarousel,
}) => {
	// 4 Tabs theo chỉ định:
	// 'LEVELS' (Danh sách cấp độ), 'STAR_POWERS' (Ngôi sao sức mạnh), 'BONUS_STARS' (Ngôi sao tăng thưởng), 'STARTING_DECK' (Bộ bài khởi đầu)
	const [activeTab, setActiveTab] = useState("STAR_POWERS");
	const [previewMode, setPreviewMode] = useState("INSPECTOR"); // 'INSPECTOR' | 'STARMAP'
	const [selectedItemId, setSelectedItemId] = useState("");
	const [isLevelExpanded, setIsLevelExpanded] = useState(false);

	const levelData = useMemo(() => getLevelProgressData(tUI, deckUpgrades), [tUI, deckUpgrades]);

	// Danh sách Star Powers từ constellationInfo hoặc resolved powers
	const formattedStarPowers = useMemo(() => {
		return starPowersList.map((node, idx) => ({
			id: node.nodeID || `star-${idx + 1}`,
			category: "STAR_POWERS",
			tierBadge: `${node.starLevel || idx + 1}★`,
			name: node.name || `Star Power ${idx + 1}`,
			badges: [
				idx + 1 === 2 ? "+1 Starting Mana" : idx + 1 === 6 ? "Apex 6★ Power" : `${node.starLevel || idx + 1}★ ${tUI("championDetail.tactical.starPowerBadge") || "Star Power"}`,
			],
			cost: idx === 5 ? "Nova Crystal / Shards" : `${(idx + 1) * 10} Champion Fragments`,
			img: node.image || champion?.assets?.[0]?.avatar,
			description: node.description || "",
			tip: tUI("championDetail.tactical.passiveGameLong") || "Permanently active passive effect throughout the entire game.",
			raw: node,
		}));
	}, [starPowersList, champion, tUI]);

	// Danh sách Bonus Stars
	const formattedBonusStars = useMemo(() => {
		return bonusStarsList.map((node, idx) => ({
			id: node.nodeID || `bonus-${idx}`,
			category: "BONUS_STARS",
			tierBadge: node.nodeType === "bonusStarGem" ? "GEM" : "BONUS",
			name: node.name || `Bonus Star ${idx + 1}`,
			badges: [
				node.nodeType === "bonusStarGem" ? "Gemstone Node" : "Bonus Star Node",
				node.isRecommended ? "Recommended" : "Constellation",
			],
			cost: "Star Crystals / Gemstones",
			img: node.image || "/images/placeholder.png",
			description: node.description || "",
			tip: tUI("championDetail.tactical.bonusStarTip") || "Stat upgrades and constellation enhancement.",
			raw: node,
		}));
	}, [bonusStarsList, tUI]);

	// Danh sách Levels (hiển thị các cấp có nâng cấp quan trọng)
	const formattedLevels = useMemo(() => {
		return levelData
			.filter((l) => l.desc || l.deckUpdates?.length > 0 || l.health || l.regen)
			.map((lvl) => {
				const attachedCards = (lvl.deckUpdates || [])
					.map((u) => `${tDynamic(u.card, "cardName")} + ${tDynamic(u.item, "name")}`)
					.join(" • ");
				const mainDesc = [
					lvl.desc,
					lvl.health ? `Máu Nhà Chính: ${lvl.health} HP` : null,
					lvl.regen ? `Hồi Máu Mỗi Trận: +${lvl.regen}` : null,
					attachedCards ? `Nâng Cấp Bài: ${attachedCards}` : null,
				]
					.filter(Boolean)
					.join(" | ");

				return {
					id: `level-${lvl.level}`,
					levelNum: lvl.level,
					category: "LEVELS",
					tierBadge: `LV ${lvl.level}`,
					name: `Level ${lvl.level}`,
					badges: [`Level ${lvl.level}`, lvl.deckUpdates?.length ? "Deck Upgrade" : "Stat Milestone"],
					cost: `${lvl.exp} EXP`,
					img: champion?.assets?.[0]?.avatar || champion?.gameAbsolutePath || "/images/placeholder.png",
					description: mainDesc,
					tip: `Cần đạt ${lvl.exp} kinh nghiệm tướng để mở khóa cấp độ này.`,
					raw: lvl,
				};
			});
	}, [levelData, tDynamic, champion]);

	// Lọc danh sách Levels: Mặc định chỉ hiện mốc 8, 13, 19, 25, 30; bấm hiển thị thêm để xem toàn bộ
	const displayedLevels = useMemo(() => {
		if (!isLevelExpanded) {
			return formattedLevels.filter((lvl) => DEFAULT_MILESTONE_LEVELS.includes(lvl.levelNum));
		}
		return formattedLevels;
	}, [formattedLevels, isLevelExpanded]);

	// Danh sách Starting Deck
	const formattedDeck = useMemo(() => {
		const base = champion?.startingDeck?.baseCards || [];
		const ref = champion?.startingDeck?.referenceCards || [];
		const all = [
			...base.map((c) => ({ ...c, isRef: false })),
			...ref.map((c) => ({ ...c, isRef: true })),
		];

		return all.map((cData, idx) => {
			const cardObj = resolvedStartingCards.find((c) => c.cardCode === cData.cardCode);
			const attachedItems = (cData.itemCodes || [])
				.map((codeObj) => {
					const codeStr = typeof codeObj === "string" ? codeObj : codeObj.itemCode;
					const found = resolvedItems.find((i) => i.itemCode === codeStr);
					if (!found) return null;
					return {
						...found,
						unlockLevel: typeof codeObj === "object" ? codeObj.unlockLevel : undefined,
					};
				})
				.filter(Boolean);

			const itemNames = attachedItems.map((i) => tDynamic(i, "name")).join(" + ");

			return {
				id: `deck-${cData.cardCode}-${idx}`,
				category: "STARTING_DECK",
				tierBadge: `${cardObj?.cost ?? 0}M`,
				name: cardObj ? tDynamic(cardObj, "cardName") : cData.cardCode,
				badges: [
					cData.isRef ? "Reference Card" : "Base Starting Card",
					cardObj?.type?.toUpperCase() || "UNIT",
				],
				cost: `${cardObj?.cost ?? 0} Mana`,
				img: cardObj?.gameAbsolutePath || champion?.assets?.[0]?.avatar,
				description: cardObj
					? tDynamic(cardObj, "description") || tDynamic(cardObj, "descriptionRaw")
					: "",
				attachedItems,
				attachedItemText: itemNames ? `+ ${itemNames}` : null,
				tip: itemNames
					? `Đã được nâng cấp qua cấp độ tướng với vật phẩm: ${itemNames}`
					: "Lá bài nằm trong bộ bài xuất phát của tướng.",
				cardCode: cData.cardCode,
				cardObj,
			};
		});
	}, [champion, resolvedStartingCards, resolvedItems, tDynamic]);

	// Danh sách hiển thị theo Tab đang chọn
	const currentList = useMemo(() => {
		switch (activeTab) {
			case "LEVELS":
				return displayedLevels;
			case "STAR_POWERS":
				return formattedStarPowers;
			case "BONUS_STARS":
				return formattedBonusStars;
			case "STARTING_DECK":
				return formattedDeck;
			default:
				return formattedStarPowers;
		}
	}, [activeTab, displayedLevels, formattedStarPowers, formattedBonusStars, formattedDeck]);

	// Chọn mục đầu tiên khi chuyển Tab hoặc khi danh sách thay đổi nếu mục cũ không còn
	useEffect(() => {
		if (currentList.length > 0) {
			if (!currentList.some((item) => item.id === selectedItemId)) {
				setSelectedItemId(currentList[0].id);
			}
		}
	}, [activeTab, currentList, selectedItemId]);

	// Mục đang được chọn để Inspect ở cột phải
	const selectedItem = useMemo(() => {
		return currentList.find((item) => item.id === selectedItemId) || currentList[0] || null;
	}, [currentList, selectedItemId]);

	// Render chip nút bấm Tactical
	const renderChip = (inp) => {
		let chipStyle = "bg-[#1A1F2C] text-white border-gray-600";
		if (inp.includes("6★") || inp === "NOVA") {
			chipStyle = "bg-gradient-to-r from-[var(--tactical-accent-lime)] to-[var(--tactical-accent-cyan)] text-white dark:text-black border-transparent font-extrabold shadow-[var(--tactical-btn-primary-shadow)]";
		} else if (inp.includes("4★") || inp.includes("5★")) {
			chipStyle = "tactical-badge-cyan font-bold";
		} else if (inp.includes("★")) {
			chipStyle = "tactical-badge-lime font-bold";
		} else if (inp.includes("LV")) {
			chipStyle = "bg-purple-500 text-white border-purple-300 font-bold";
		} else if (inp.includes("GEM") || inp.includes("BONUS")) {
			chipStyle = "bg-amber-400 text-black border-amber-200 font-bold";
		}

		return (
			<span
				className={`inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-mono-tech tracking-wider uppercase border clip-chamfer-sm ${chipStyle}`}
			>
				{inp}
			</span>
		);
	};

	return (
		<section id="powers-constellation" className="py-12 sm:py-20 border-b tactical-section relative bg-halftone">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header: Sạch sẽ, không subheader thừa */}
				<div className="mb-6 sm:mb-8">
					<h2 className="font-display text-3xl sm:text-4xl lg:text-5xl uppercase italic tracking-tight tactical-text-main">
						{tUI("championDetail.tactical.powersTitle") || "Bảng Sức Mạnh & Chòm Sao"}
					</h2>
				</div>

				{/* 4 Tabs Selector + Inspector / Star Map Toggle (Tối ưu cuộn ngang mượt mà trên mobile) */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 border-b tactical-section pb-4">
					<div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
						{[
							{
								key: "LEVELS",
								label: `${tUI("championDetail.tactical.tabLevels") || "Danh sách cấp độ"} (${
									isLevelExpanded ? formattedLevels.length : DEFAULT_MILESTONE_LEVELS.length
								})`,
							},
							{ key: "STAR_POWERS", label: `${tUI("championDetail.tactical.tabStarPowers") || "Ngôi sao sức mạnh"} (${formattedStarPowers.length})` },
							{ key: "BONUS_STARS", label: `${tUI("championDetail.tactical.tabBonusStars") || "Ngôi sao tăng thưởng"} (${formattedBonusStars.length})` },
							{ key: "STARTING_DECK", label: `${tUI("championDetail.tactical.tabStartingDeck") || "Bộ bài khởi đầu"} (${formattedDeck.length})` },
						].map((tab) => {
							const isActive = activeTab === tab.key;
							return (
								<button
									key={tab.key}
									type="button"
									onClick={() => setActiveTab(tab.key)}
									className={`font-display uppercase tracking-wider px-4 sm:px-5 py-2 text-xs sm:text-sm clip-chamfer-sm transition border shrink-0 whitespace-nowrap ${
										isActive
											? "tactical-tab-active"
											: "tactical-tab-inactive hover:border-[var(--tactical-accent-lime)]"
									}`}
								>
									{tab.label}
								</button>
							);
						})}
					</div>

					{/* Toggle Inspector & Constellation Map */}
					<div className="flex items-center tactical-box border p-1 clip-chamfer-sm shrink-0 self-start sm:self-auto">
						<button
							type="button"
							onClick={() => setPreviewMode("INSPECTOR")}
							className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition clip-chamfer-sm flex items-center gap-1.5 whitespace-nowrap ${
								previewMode === "INSPECTOR" ? "tactical-tab-active" : "tactical-text-dim hover:tactical-text-main"
							}`}
						>
							<Eye className="w-3.5 h-3.5" />
							<span>{tUI("championDetail.tactical.inspectorMode") || "Khảo Sát"}</span>
						</button>
						<button
							type="button"
							onClick={() => setPreviewMode("STARMAP")}
							className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition clip-chamfer-sm flex items-center gap-1.5 whitespace-nowrap ${
								previewMode === "STARMAP" ? "tactical-tab-active" : "tactical-text-dim hover:tactical-text-main"
							}`}
						>
							<Compass className="w-3.5 h-3.5" />
							<span>{tUI("championDetail.tactical.starMapMode") || "Bản Đồ Sao"}</span>
						</button>
					</div>
				</div>

				{/* Chế độ Bản Đồ Sao Toàn Diện (Hiển thị mượt mà trên CẢ MOBILE LẪN DESKTOP) */}
				{previewMode === "STARMAP" ? (
					<div className="tactical-panel border clip-chamfer p-2 sm:p-5 shadow-xl animate-fadeIn">
						<div className="flex items-center justify-between mb-3 px-2">
							<span className="text-xs font-mono-tech tactical-accent-lime font-bold uppercase">
								// {tUI("championDetail.tactical.starMapMode") || "Bản Đồ Chòm Sao"}
							</span>
							<button
								type="button"
								onClick={() => setPreviewMode("INSPECTOR")}
								className="text-xs tactical-accent-cyan hover:underline font-mono-tech"
							>
								{tUI("championDetail.tactical.backToList") || "← Quay lại danh sách"}
							</button>
						</div>
						{constellationInfo?.nodes?.length > 0 ? (
							<ConstellationMap constellationInfo={constellationInfo} />
						) : (
							<div className="p-10 text-center tactical-text-dim font-mono-tech text-xs">
								{tUI("championDetail.tactical.noStarmap") || "Chưa có bản đồ chòm sao cho vị tướng này."}
							</div>
						)}
					</div>
				) : (
					/* 2-Column Tactical Moves Layout */
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
						{/* Left Column (7 cols): List of Ability / Star Power / Milestone Rows */}
						<div className="lg:col-span-7 space-y-3">
						{currentList.map((item) => {
							const isSelected = selectedItem && item.id === selectedItem.id;
							return (
								<div
									key={item.id}
									onClick={() => setSelectedItemId(item.id)}
									className={`cursor-pointer border-l-4 p-4 sm:p-5 transition-all duration-200 flex flex-col gap-3 clip-chamfer-sm tactical-card border ${
										isSelected
											? "!border-l-[var(--tactical-accent-lime)] shadow-md ring-1 ring-[var(--tactical-accent-lime)]/40"
											: "border-l-transparent hover:!border-l-gray-400"
									}`}
								>
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
										<div className="space-y-2 min-w-0 flex-1">
											<div className="flex items-center space-x-2.5">
												<span
													className={`font-display text-xl sm:text-2xl uppercase tracking-wide truncate ${
														isSelected ? "tactical-accent-lime" : "tactical-text-main"
													}`}
												>
													{item.name}
												</span>
											</div>

											<div className="flex flex-wrap gap-1.5">
												{item.badges.map((b, i) => (
													<span
														key={i}
														className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
															b.includes("6★") || b.includes("Apex")
																? "tactical-badge-lime"
																: b.includes("Constellation") || b.includes("Bonus")
																? "tactical-badge-cyan"
																: "tactical-box tactical-text-sub"
														}`}
													>
														{b}
													</span>
												))}
											</div>

											{item.attachedItems && item.attachedItems.length > 0 ? (
												<div className="flex items-center gap-1.5 py-1">
													{item.attachedItems.map((attItem, attIdx) => {
														const attImg = attItem.assetAbsolutePath || attItem.image || "/fallback-image.svg";
														const attName = tDynamic(attItem, "name") || attItem.name;
														return (
															<div
																key={attIdx}
																className="relative group/att w-7 h-7 sm:w-8 sm:h-8 rounded tactical-box border border-[var(--tactical-accent-cyan)]/60 flex items-center justify-center p-0.5 hover:border-[var(--tactical-accent-lime)] transition hover:scale-110 shadow-sm"
																title={attName}
															>
																<SafeImage
																	src={attImg}
																	alt={attName}
																	className="w-full h-full object-contain"
																/>
																{attItem.unlockLevel && (
																	<span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[8px] font-bold px-1 rounded-full leading-none shadow">
																		{attItem.unlockLevel}
																	</span>
																)}
															</div>
														);
													})}
												</div>
											) : item.attachedItemText ? (
												<div className="text-xs tactical-accent-cyan font-mono-tech font-bold">
													<MarkupRenderer text={item.attachedItemText} />
												</div>
											) : null}

											<div className="text-xs tactical-text-sub line-clamp-2 pt-0.5 leading-relaxed">
												<MarkupRenderer text={item.description} />
											</div>
										</div>

										<div className="flex items-center space-x-1 shrink-0 tactical-box px-3 py-2 border clip-chamfer-sm self-start sm:self-center">
											{renderChip(item.tierBadge)}
										</div>
									</div>

									{/* Inline Mobile Detail Inspector (Chỉ hiển thị trên mobile khi mục được chọn để xem ngay lập tức mà không cần cuộn) */}
									{isSelected && (
										<div className="block lg:hidden mt-3 pt-3 border-t tactical-section animate-fadeIn space-y-3">
											{item.category === "STARTING_DECK" && item.img && (
												<div
													onClick={() => {
														if (item.cardObj && onOpenCarousel) {
															onOpenCarousel(item.cardObj, item.cardCode);
														}
													}}
													className="relative w-full bg-black/90 overflow-hidden clip-chamfer-sm flex items-center justify-center p-2 h-64 sm:h-72 cursor-pointer"
													title="Chạm để xem ảnh lá bài đầy đủ"
												>
													<img
														src={item.img}
														alt={item.name}
														className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
													/>
													<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
												</div>
											)}
											<div className="p-3 tactical-box border border-[var(--tactical-accent-lime)]/40 clip-chamfer-sm space-y-2">
												<div className="text-sm font-bold uppercase tracking-wide tactical-accent-lime">
													{item.name}
												</div>
												<div className="text-xs tactical-text-main leading-relaxed">
													<MarkupRenderer text={item.description} />
												</div>
												{item.attachedItems && item.attachedItems.length > 0 ? (
													<div className="pt-1 space-y-1.5">
														<div className="text-[11px] font-bold uppercase tracking-wider tactical-accent-cyan">
															{tUI("championDetail.tactical.attachedItem") || "Vật phẩm nâng cấp"}:
														</div>
														<div className="flex flex-wrap gap-2">
															{item.attachedItems.map((attItem, attIdx) => {
																const attImg = attItem.assetAbsolutePath || attItem.image || "/fallback-image.svg";
																const attName = tDynamic(attItem, "name") || attItem.name;
																return (
																	<div
																		key={attIdx}
																		className="flex items-center gap-1.5 px-2 py-1 bg-black/50 border border-[var(--tactical-accent-cyan)]/40 rounded clip-chamfer-sm"
																		title={attName}
																	>
																		<SafeImage src={attImg} alt={attName} className="w-5 h-5 object-contain" />
																		<span className="text-xs tactical-accent-cyan font-mono-tech font-bold">
																			{attName}
																		</span>
																	</div>
																);
															})}
														</div>
													</div>
												) : item.attachedItemText ? (
													<div className="text-xs tactical-accent-cyan font-mono-tech pt-1">
														<strong>{tUI("championDetail.tactical.attachedItem") || "Vật phẩm nâng cấp"}:</strong>{" "}
														<MarkupRenderer text={item.attachedItemText} />
													</div>
												) : null}
												<div className="pt-2 border-t border-inherit flex items-center justify-between text-[11px] font-mono-tech">
													<span className="tactical-text-dim">
														{tUI("championDetail.tactical.unlockCost") || "Điều kiện mở"}:
													</span>
													<span className="tactical-accent-cyan font-bold">
														{item.cost || "Mặc định"}
													</span>
												</div>
											</div>
										</div>
									)}
								</div>
							);
						})}

						{/* Nút Hiển thị thêm / Thu gọn cho danh sách cấp độ */}
						{activeTab === "LEVELS" && (
							<button
								type="button"
								onClick={() => setIsLevelExpanded((prev) => !prev)}
								className="w-full py-3 px-4 tactical-card hover:border-[var(--tactical-accent-lime)] text-xs font-mono-tech uppercase tracking-widest tactical-accent-lime transition-all flex items-center justify-center gap-2 clip-chamfer-sm mt-3 shadow-md group border"
							>
								{isLevelExpanded ? (
									<>
										<ChevronUp className="w-4 h-4 text-[var(--tactical-accent-lime)] group-hover:-translate-y-0.5 transition-transform" />
										<span>{tUI("championDetail.tactical.collapseLevels") || "Thu gọn (Hiện mốc chính 8, 13, 19, 25, 30)"}</span>
									</>
								) : (
									<>
										<ChevronDown className="w-4 h-4 text-[var(--tactical-accent-lime)] group-hover:translate-y-0.5 transition-transform" />
										<span>{tUI("championDetail.tactical.expandLevels") || `Hiển thị thêm (${formattedLevels.length} cấp độ đầy đủ)`}</span>
									</>
								)}
							</button>
						)}
					</div>

					{/* Right Column (5 cols): Sticky Inspector Monitor OR Interactive Constellation Map (Chỉ hiển thị trên desktop >= lg) */}
					<div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24">
						<div className="tactical-panel border clip-chamfer overflow-hidden shadow-xl">
							<div className="tactical-box px-5 py-3 border-b border-inherit flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<span className="w-2.5 h-2.5 rounded-full bg-[var(--tactical-accent-lime)] animate-pulse" />
									<span className="text-xs font-bold uppercase tracking-wider tactical-accent-lime">
										{tUI("championDetail.tactical.inspectorTitle") || "Chi Tiết Nâng Cấp"}
									</span>
								</div>
								<span className="text-xs font-mono-tech tactical-accent-cyan font-bold">
									{selectedItem?.cost || "ACTIVE"}
								</span>
							</div>

							{previewMode === "INSPECTOR" && (
								<div>
									{/* Inspector Artwork / Card preview */}
									<div className={`relative w-full bg-black overflow-hidden flex items-center justify-center ${
										selectedItem?.category === "STARTING_DECK" ? "h-80 sm:h-96 p-3" : "h-64 sm:h-72"
									}`}>
										{selectedItem?.img && (
											<img
												src={selectedItem.img}
												alt={selectedItem.name}
												className={`w-full h-full transition-all duration-500 ${
													selectedItem?.category === "STARTING_DECK"
														? "object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)]"
														: selectedItem?.category === "LEVELS"
														? "object-cover object-top opacity-75"
														: "object-cover opacity-60 scale-105"
												}`}
											/>
										)}
										<div className="absolute inset-0 bg-gradient-to-tr from-[#090A0F] via-transparent to-[var(--tactical-accent-lime)]/20 pointer-events-none" />

										{selectedItem?.category !== "STARTING_DECK" && (
											<div className="relative z-10 text-center px-6">
												<h4 className="font-display text-3xl sm:text-4xl uppercase italic text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
													{selectedItem?.name || ""}
												</h4>
											</div>
										)}

										<div className="absolute bottom-3 left-4 right-4 flex items-center justify-between tactical-box backdrop-blur px-4 py-2 border-l-4 border-[var(--tactical-accent-lime)] border">
											<span className="text-[11px] font-bold uppercase tracking-widest tactical-text-dim">
												{tUI("championDetail.tactical.nodeTier") || "BẬC"}
											</span>
											<div>{selectedItem && renderChip(selectedItem.tierBadge)}</div>
										</div>
									</div>

									{/* Item Detailed Content */}
									<div className="p-6 space-y-4">
										<div>
											<h3 className="font-display text-2xl sm:text-3xl uppercase italic tactical-text-main">
												{selectedItem?.name}
											</h3>
											<div className="tactical-text-sub text-sm sm:text-base leading-relaxed mt-2">
												<MarkupRenderer text={selectedItem?.description || ""} />
											</div>
										</div>

										{selectedItem?.attachedItems && selectedItem.attachedItems.length > 0 ? (
											<div className="p-3 bg-[var(--tactical-accent-cyan)]/10 border border-[var(--tactical-accent-cyan)]/40 clip-chamfer-sm space-y-2">
												<div className="text-xs uppercase font-bold tracking-wider tactical-accent-cyan">
													{tUI("championDetail.tactical.attachedItem") || "Vật phẩm nâng cấp"}:
												</div>
												<div className="flex flex-col gap-2">
													{selectedItem.attachedItems.map((attItem, attIdx) => {
														const attImg = attItem.assetAbsolutePath || attItem.image || "/fallback-image.svg";
														const attName = tDynamic(attItem, "name") || attItem.name;
														const attDesc = tDynamic(attItem, "description") || attItem.description;
														return (
															<div
																key={attIdx}
																className="flex items-center gap-2.5 p-2 bg-black/50 border border-[var(--tactical-accent-cyan)]/30 rounded clip-chamfer-sm"
															>
																<div className="w-8 h-8 rounded border tactical-box flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
																	<SafeImage src={attImg} alt={attName} className="w-full h-full object-contain" />
																</div>
																<div className="min-w-0">
																	<div className="text-xs font-bold tactical-accent-cyan truncate">
																		{attName}
																	</div>
																	{attDesc && (
																		<div className="text-[11px] tactical-text-sub line-clamp-2 leading-tight">
																			<MarkupRenderer text={attDesc} />
																		</div>
																	)}
																</div>
															</div>
														);
													})}
												</div>
											</div>
										) : selectedItem?.attachedItemText ? (
											<div className="p-3 bg-[var(--tactical-accent-cyan)]/10 border border-[var(--tactical-accent-cyan)]/40 clip-chamfer-sm text-xs font-mono-tech tactical-accent-cyan">
												<strong>{tUI("championDetail.tactical.attachedItem") || "Vật phẩm nâng cấp"}:</strong>{" "}
												<MarkupRenderer text={selectedItem.attachedItemText} />
											</div>
										) : null}

										<div className="pt-3 border-t tactical-section flex items-center justify-between text-xs">
											<span className="tactical-text-dim uppercase font-bold tracking-wider">
												{tUI("championDetail.tactical.unlockCost") || "Điều kiện mở"}:
											</span>
											<span className="font-mono-tech tactical-accent-lime font-bold">
												{selectedItem?.cost || "Mặc định"}
											</span>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
			</div>
		</section>
	);
};

export default ChampionPowersConstellationSection;
