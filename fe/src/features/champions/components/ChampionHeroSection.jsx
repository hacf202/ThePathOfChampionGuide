import React, { useState, useMemo } from "react";
import {
	Activity,
	ChevronRight,
	Film,
	Star,
	Sparkles,
	Swords,
	Shield,
	Zap,
} from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import MarkupRenderer from "@/components/common/MarkupRenderer";
import iconRegions from "@/assets/data/icon.json";
import { getRegionKey } from "@/utils/i18nHelpers";

const REGION_PALETTES = {
	piltoverzaun: { accent: "#D2FF28", secondary: "#00F5D4" },
	noxus: { accent: "#FF4655", secondary: "#FFAA00" },
	ionia: { accent: "#FF75D8", secondary: "#00F5D4" },
	demacia: { accent: "#FFD700", secondary: "#4DA8DA" },
	shadowisles: { accent: "#00F5D4", secondary: "#10B981" },
	freljord: { accent: "#38BDF8", secondary: "#818CF8" },
	bilgewater: { accent: "#F59E0B", secondary: "#EF4444" },
	shurima: { accent: "#FBBF24", secondary: "#F97316" },
	targon: { accent: "#A855F7", secondary: "#38BDF8" },
	bandlecity: { accent: "#A3E635", secondary: "#F472B6" },
	runeterra: { accent: "#FCD34D", secondary: "#60A5FA" },
};

const ChampionHeroSection = ({
	champion,
	resolvedStartingCards = [],
	tUI,
	tDynamic,
	language = "vi",
	onOpenCarousel,
}) => {
	const [cardLevelView] = useState(1);
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	const primaryRegion = (champion?.regions?.[0] || "runeterra").toLowerCase().replace(/[^a-z]/g, "");
	const palette = REGION_PALETTES[primaryRegion] || { accent: "#D2FF28", secondary: "#00F5D4" };

	// Tìm thẻ bài tướng Lv1 & Lv2 trong resolvedStartingCards hoặc theo champion.cardCode (Ví dụ: 06RU026)
	const championBaseCard = useMemo(() => {
		if (!champion) return null;
		const targetCode = champion.cardCode;
		// 1. Ưu tiên khớp chính xác champion.cardCode (Mã lá bài tướng)
		if (targetCode) {
			const foundByCode = resolvedStartingCards.find((c) => c.cardCode === targetCode);
			if (foundByCode) return foundByCode;
		}
		// 2. Tìm theo type / supertype === "champion"
		const foundBySupertype = resolvedStartingCards.find(
			(c) =>
				(c.supertype?.toLowerCase() === "champion" || c.type?.toLowerCase() === "champion") &&
				!c.cardCode?.endsWith("T1") &&
				!c.cardCode?.endsWith("T2") &&
				!c.cardCode?.endsWith("T3")
		);
		if (foundBySupertype) return foundBySupertype;

		// 3. Fallback: Dùng champion.assets[0].gameAbsolutePath hoặc cardCode
		if (targetCode) {
			return {
				cardCode: targetCode,
				name: tDynamic(champion, "name"),
				gameAbsolutePath: champion.assets?.[0]?.gameAbsolutePath || `https://dd.b.pvp.net/latest/set6cde/vi_vn/img/cards/${targetCode}.png`,
				fullAbsolutePath: champion.assets?.[0]?.fullAbsolutePath,
				cost: champion.cost || 6,
				description: tDynamic(champion, "description") || "",
			};
		}

		return resolvedStartingCards[0] || null;
	}, [champion, resolvedStartingCards, tDynamic]);

	const championAscendedCard = useMemo(() => {
		if (!champion) return null;
		const targetCode = champion.cardCode;
		if (targetCode) {
			// Tìm biến thể Thăng Cấp (T1, T2, T3) cùng mã tướng
			const foundAscended = resolvedStartingCards.find(
				(c) =>
					c.cardCode?.startsWith(targetCode) &&
					c.cardCode !== targetCode &&
					(c.supertype?.toLowerCase() === "champion" ||
						c.type?.toLowerCase() === "champion" ||
						c.cardCode.endsWith("T1") ||
						c.cardCode.endsWith("T3"))
			);
			if (foundAscended) return foundAscended;

			if (champion.assets?.[1]?.gameAbsolutePath) {
				return {
					cardCode: `${targetCode}T1`,
					name: tDynamic(champion, "name"),
					gameAbsolutePath: champion.assets[1].gameAbsolutePath,
					fullAbsolutePath: champion.assets[1].fullAbsolutePath,
					cost: champion.cost || 6,
					description: tDynamic(champion, "description") || "",
				};
			}
		}

		// Fallback kiểm tra referenceCards
		const refCards = champion.startingDeck?.referenceCards || [];
		const refCode = refCards.find((c) => (typeof c === "string" ? c : c.cardCode)?.endsWith("T1"))?.cardCode;
		if (refCode) {
			const foundRef = resolvedStartingCards.find((c) => c.cardCode === refCode);
			if (foundRef) return foundRef;
		}

		return championBaseCard;
	}, [champion, resolvedStartingCards, championBaseCard, tDynamic]);

	const currentCard = cardLevelView === 1 ? championBaseCard : (championAscendedCard || championBaseCard);

	// Thống kê chỉ số Mana
	const cardCost = currentCard?.cost ?? champion?.cost ?? 0;

	// Ảnh Splash & Card Image chuẩn theo Card Code của tướng
	const splashImg =
		(cardLevelView === 1
			? champion?.assets?.[0]?.fullAbsolutePath
			: champion?.assets?.[1]?.fullAbsolutePath || champion?.assets?.[0]?.fullAbsolutePath) ||
		currentCard?.fullAbsolutePath ||
		currentCard?.gameAbsolutePath ||
		champion?.assets?.[0]?.avatar;

	const cardImg =
		(cardLevelView === 1 ? championBaseCard?.gameAbsolutePath : championAscendedCard?.gameAbsolutePath) ||
		currentCard?.gameAbsolutePath ||
		champion?.assets?.[0]?.gameAbsolutePath ||
		(champion?.cardCode ? `https://dd.b.pvp.net/latest/set6cde/vi_vn/img/cards/${champion.cardCode}.png` : null) ||
		champion?.assets?.[0]?.avatar;

	// Chỉ số đánh giá 4 trục từ tác giả/admin (champion.ratings)
	const stats = champion?.ratings || champion?.communityRatings || {
		damage: 7,
		defense: 6,
		synergy: 8,
		difficulty: 6,
	};

	const statKeys = ["damage", "defense", "synergy", "difficulty"];
	const STAT_FALLBACK_LABELS = {
		damage: { vi: "Sát Thương", en: "Damage" },
		defense: { vi: "Phòng Ngự", en: "Defense" },
		synergy: { vi: "Phối Hợp", en: "Synergy" },
		difficulty: { vi: "Độ Khó", en: "Difficulty" },
	};

	if (!champion) return null;

	// Tên hiển thị & Khu vực
	const champName = tDynamic(champion, "name");
	const regionName = (champion.regions || []).map((r) => r.toUpperCase()).join(" / ") || "RUNETERRA";

	return (
		<section
			id="hero"
			className="relative overflow-hidden border-b tactical-section pt-10 pb-20 lg:py-20 bg-halftone bg-hazard-stripes"
		>
			{/* Giant Background Hollow Stroke Text */}
			<div className="absolute -top-6 left-0 right-0 pointer-events-none select-none overflow-hidden">
				<div className="font-display text-[8rem] sm:text-[14rem] lg:text-[18rem] leading-none uppercase italic stroke-giant tracking-tighter whitespace-nowrap">
					{champName} // {regionName}
				</div>
			</div>

			{/* Ambient Neon Glows */}
			<div
				className="absolute top-1/4 right-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20"
				style={{ backgroundColor: palette.accent }}
			/>
			<div
				className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full blur-[130px] pointer-events-none opacity-15"
				style={{ backgroundColor: palette.secondary }}
			/>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
					{/* Left Column (7 cols): Title, Lore Quote, 2x2 Tactical Grid & 6-Axis Matrix */}
					<div className="lg:col-span-7 space-y-6">
						{/* Top Slanted Status Bar */}
						<div className="flex flex-wrap items-center gap-3">
							<div className="inline-flex items-center space-x-2 tactical-card border border-[var(--tactical-accent-cyan)]/50 px-3.5 py-1 clip-chamfer-sm">
								<span className="w-2 h-2 bg-[var(--tactical-accent-cyan)] rounded-full animate-ping" />
								<span className="tactical-accent-cyan font-bold uppercase tracking-widest text-xs">
									{regionName}
								</span>
							</div>

							<div className="inline-flex items-center space-x-1.5 tactical-tab-active px-3 py-1 font-display uppercase text-xs tracking-wider transform -skew-x-12">
								<Star className="w-3.5 h-3.5 fill-current" />
								<span>{tUI("championDetail.tactical.maxConstellation") || "MAX CONSTELLATION"} {champion.maxStar || 6}★</span>
							</div>

							<span className="font-mono-tech text-xs tactical-text-sub tactical-box px-2.5 py-1 border clip-chamfer-sm">
								ID: {champion.championID}
							</span>
						</div>

						{/* Giant Champion Name */}
						<div className="flex items-baseline justify-between">
							<h1
								className="font-display text-6xl sm:text-8xl lg:text-9xl uppercase italic tracking-tight leading-none tactical-text-main"
								style={{
									textShadow: `0 6px 0 ${palette.accent}30`,
								}}
							>
								{champName}
							</h1>
						</div>

						{/* Mobile-only Card & Splash Visualizer (Chỉ hiển thị trên mobile, nằm ngay dưới tên tướng) */}
						<div className="block lg:hidden my-4 relative">
							<div className="relative mx-auto max-w-sm sm:max-w-md">
								<div
									className="absolute -inset-2 opacity-35 clip-chamfer blur-sm transition-colors duration-500"
									style={{
										background: `linear-gradient(135deg, ${palette.accent}, ${palette.secondary}, transparent)`,
									}}
								/>
								<div className="relative tactical-panel border-2 clip-chamfer overflow-hidden group shadow-xl">
									{/* Top Overlay */}
									<div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
										<div className="inline-flex items-center space-x-1 tactical-tab-active px-2.5 py-0.5 font-display uppercase text-[11px] tracking-wider clip-chamfer-sm">
											<span>{tUI("championDetail.tactical.level1Form") || "LEVEL 1 FORM"}</span>
										</div>

										<div className="flex items-center space-x-1.5 tactical-box border px-2 py-0.5 font-mono-tech text-[11px]">
											<span className="text-blue-400 font-bold flex items-center gap-1">
												<Zap className="w-3 h-3 text-blue-400 fill-current" />
												{cardCost} MANA
											</span>
											<span className="tactical-text-dim">|</span>
											<span className="text-amber-400 font-bold flex items-center gap-1">
												<Star className="w-3 h-3 text-amber-400 fill-current" />
												{champion.maxStar || 6}★
											</span>
										</div>
									</div>

									{/* Main Splash Artwork */}
									<div className="relative h-[340px] sm:h-[380px] w-full bg-black overflow-hidden">
										<img
											src={splashImg}
											alt={champName}
											className="w-full h-full object-cover object-center contrast-110"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

										{/* Floating Full LoR Card Preview */}
										{cardImg && (
											<div
												onClick={() => (currentCard || champion.cardCode) && onOpenCarousel && onOpenCarousel(currentCard, currentCard?.cardCode || champion.cardCode)}
												className="absolute bottom-16 right-3 w-24 sm:w-28 drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] cursor-pointer"
												title="Click to view full card"
											>
												<SafeImage
													src={cardImg}
													alt={`${champName} Card`}
													className="w-full h-auto rounded-md shadow-2xl"
												/>
											</div>
										)}
									</div>

									{/* Bottom Callout: Tags */}
									<div className="p-3 tactical-box border-t border-l-4 border-l-[var(--tactical-accent-cyan)]">
										<div className="flex flex-wrap gap-1.5">
											{(() => {
												const dynamicTags = tDynamic(champion, "tags");
												const tagsToRender = (Array.isArray(dynamicTags) && dynamicTags.length > 0)
													? dynamicTags
													: (champion.tags || []);
												return tagsToRender.length > 0 ? (
													tagsToRender.map((tag, tIdx) => (
														<span
															key={tIdx}
															className="px-2 py-0.5 text-[11px] font-mono-tech font-bold uppercase tactical-card border border-[var(--tactical-accent-cyan)]/40 text-[var(--tactical-accent-cyan)] clip-chamfer-sm"
														>
															#{tag}
														</span>
													))
												) : (
													<span className="text-xs tactical-text-sub font-mono-tech">
														#STANDARD #TACTICAL
													</span>
												);
											})()}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Lore & Tactical Quote */}
						<div className="relative tactical-text-main text-sm sm:text-base leading-relaxed border-l-4 border-[var(--tactical-accent-lime)] pl-5 py-2 tactical-card backdrop-blur-sm clip-chamfer-sm">
							<div className={!isDescriptionExpanded ? "line-clamp-4" : ""}>
								<MarkupRenderer text={tDynamic(champion, "description") || tDynamic(champion, "descriptionRaw")} />
							</div>
							{(tDynamic(champion, "description") || "").length > 250 && (
								<button
									type="button"
									onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
									className="tactical-accent-lime text-xs font-mono-tech font-bold uppercase hover:underline mt-2 inline-flex items-center gap-1"
								>
									<span>{isDescriptionExpanded ? tUI("championDetail.showLess") : tUI("championDetail.showMore")}</span>
									<ChevronRight className={`w-3.5 h-3.5 transition-transform ${isDescriptionExpanded ? "-rotate-90" : "rotate-90"}`} />
								</button>
							)}
						</div>

						{/* 2x2 Tactical Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
							{/* Region */}
							<div className="tactical-card border p-4 clip-chamfer-sm hover:border-[var(--tactical-accent-lime)]/70 transition">
								<div className="text-[11px] font-bold uppercase tracking-widest tactical-text-dim">
									{tUI("championDetail.tactical.region") || "Khu Vực"}
								</div>
								<div className="text-base sm:text-lg font-bold tactical-text-main mt-1 flex items-center justify-between">
									<span>{champion.regions?.join(" • ") || "Runeterra"}</span>
									{champion.regions?.[0] && (
										<img
											src={
												iconRegions.find((item) => getRegionKey(item.name) === getRegionKey(champion.regions[0]))
													?.image || "/fallback-image.svg"
											}
											alt={champion.regions[0]}
											className="w-7 h-7 object-contain"
										/>
									)}
								</div>
							</div>

							{/* Play Style / Lối Chơi */}
							<div className="tactical-card border p-4 clip-chamfer-sm hover:border-[var(--tactical-accent-lime)]/70 transition">
								<div className="text-[11px] font-bold uppercase tracking-widest tactical-text-dim">
									{tUI("championDetail.tactical.playStyle", "Lối Chơi")}
								</div>
								<div className="text-base sm:text-lg font-bold tactical-accent-cyan mt-1 flex items-center justify-between">
									<span className="truncate">{tDynamic(champion, "playStyle") || champion.playStyle || "Standard Aggro/Control"}</span>
									<span className="tactical-accent-cyan text-xs font-mono-tech">[02]</span>
								</div>
							</div>

							{/* Tier / Xếp Hạng */}
							<div className="tactical-card border p-4 clip-chamfer-sm hover:border-[var(--tactical-accent-lime)]/70 transition">
								<div className="text-[11px] font-bold uppercase tracking-widest tactical-text-dim">
									{tUI("championDetail.tactical.tier", "Xếp Hạng")}
								</div>
								<div className="text-sm sm:text-base font-semibold tactical-accent-lime mt-1">
									{tDynamic(champion, "tier") || champion.tier || (stats.damage >= 8 ? "S Tier // Sát Thương Đột Biến" : "A Tier // Cân Bằng & Ổn Định")}
								</div>
							</div>

							{/* Optimal Star Level */}
							<div className="tactical-card border p-4 clip-chamfer-sm hover:border-[var(--tactical-accent-lime)]/70 transition">
								<div className="text-[11px] font-bold uppercase tracking-widest tactical-text-dim flex items-center gap-1.5">
									<Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
									<span>{tUI("championDetail.tactical.optimalStars", "Optimal Star Level")}</span>
								</div>
								<div className="text-sm sm:text-base font-bold text-amber-400 mt-1 flex items-center justify-between">
									<span>{tDynamic(champion, "optimalStars") || champion.optimalStars || (champion.maxStar >= 6 ? "3★ - 4★" : "3★")}</span>
									<span className="tactical-accent-cyan text-xs font-mono-tech">[REC]</span>
								</div>
							</div>

							{/* Power Spike */}
							<div className="tactical-card border p-4 clip-chamfer-sm hover:border-[var(--tactical-accent-lime)]/70 transition sm:col-span-2">
								<div className="text-[11px] font-bold uppercase tracking-widest tactical-text-dim flex items-center gap-1.5">
									<Zap className="w-3.5 h-3.5 text-yellow-400 fill-current" />
									<span>{tUI("championDetail.tactical.powerSpike", "Power Spike")}</span>
								</div>
								<div className="text-xs sm:text-sm font-semibold tactical-text-main mt-1 line-clamp-2">
									{tDynamic(champion, "powerSpike") || champion.powerSpike || (champion.counter ? champion.counter : "3★ // Tăng tốc nhịp độ & bùng nổ cơ chế chính")}
								</div>
							</div>
						</div>

						{/* 4-Axis Tactical Playstyle Matrix */}
						<div className="tactical-card border p-4 sm:p-5 clip-chamfer-sm">
							<div className="flex items-center justify-between mb-3">
								<span className="text-xs font-bold uppercase tracking-widest tactical-accent-lime flex items-center gap-2">
									<Activity className="w-4 h-4" />
									{tUI("championDetail.tactical.playstyleRadar") || "Ma Trận Chỉ Số Chiến Thuật"}
								</span>
								<span className="text-[11px] font-mono-tech tactical-accent-cyan">
									// 4-AXIS TELEMETRY
								</span>
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
								{statKeys.map((key) => {
									const val = Number(stats[key]) || 5;
									const defaultLabel = STAT_FALLBACK_LABELS[key]?.[language === "en" ? "en" : "vi"] || key;
									const label = tUI(`championDetail.ratings.${key}`, defaultLabel);
									return (
										<div key={key} className="space-y-1">
											<div className="flex justify-between text-xs">
												<span className="tactical-text-sub font-bold uppercase truncate" title={label}>
													{label}
												</span>
												<span className="font-mono-tech tactical-accent-lime font-bold">{val}/10</span>
											</div>
											<div className="w-full h-2 tactical-box border overflow-hidden">
												<div
													className="h-full transition-all duration-500"
													style={{
														width: `${Math.min(100, Math.max(10, val * 10))}%`,
														background: "var(--tactical-bar-gradient)",
													}}
												/>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Hero CTAs */}
						<div className="pt-2 flex flex-wrap gap-4">
							<a
								href="#relic-builds"
								className="tactical-btn-primary font-display uppercase tracking-wider text-base sm:text-lg px-7 py-3.5 clip-chamfer transition inline-flex items-center space-x-2.5"
							>
								<Film className="w-5 h-5" />
								<span>{tUI("championDetail.tactical.viewRelics") || "Xem Bộ Cổ Vật"}</span>
							</a>
							<a
								href="#powers-constellation"
								className="tactical-card border tactical-text-main font-display uppercase tracking-wider text-base sm:text-lg px-7 py-3.5 clip-chamfer hover:border-[var(--tactical-accent-lime)] hover:text-[var(--tactical-accent-lime)] transition inline-flex items-center space-x-2"
							>
								<span>{tUI("championDetail.tactical.exploreMoves") || "Sức Mạnh & Chòm Sao"}</span>
								<ChevronRight className="w-5 h-5" />
							</a>
						</div>
					</div>

					{/* Right Column (5 cols): Level 1 / Level 2 Card & Splash Visualizer (Chỉ hiển thị trên desktop >= lg) */}
					<div className="hidden lg:block lg:col-span-5 relative">
						<div className="relative mx-auto max-w-md lg:max-w-none">
							{/* Outer glow border */}
							<div
								className="absolute -inset-2.5 opacity-35 clip-chamfer blur-sm transition-colors duration-500"
								style={{
									background: `linear-gradient(135deg, ${palette.accent}, ${palette.secondary}, transparent)`,
								}}
							/>

							<div className="relative tactical-panel border-2 clip-chamfer overflow-hidden group shadow-xl">
								{/* Top Overlay: Champion Card Meta */}
								<div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
									<div className="inline-flex items-center space-x-1.5 tactical-tab-active px-3 py-1 font-display uppercase text-xs tracking-wider clip-chamfer-sm">
										<span>{tUI("championDetail.tactical.level1Form") || "LEVEL 1 FORM"}</span>
									</div>

									<div className="flex items-center space-x-2 tactical-box border px-3 py-1 font-mono-tech text-xs">
										<span className="tactical-accent-cyan font-bold">
											ID: {champion.championID || champion.cardCode}
										</span>
										<span className="tactical-text-dim">|</span>
										<span className="text-blue-400 font-bold flex items-center gap-1">
											<Zap className="w-3 h-3 text-blue-400 fill-current" />
											{cardCost} MANA
										</span>
										<span className="tactical-text-dim">|</span>
										<span className="text-amber-400 font-bold flex items-center gap-1">
											<Star className="w-3 h-3 text-amber-400 fill-current" />
											{champion.maxStar || 6}★
										</span>
									</div>
								</div>

								{/* Main Splash Artwork */}
								<div className="relative h-[460px] w-full bg-black overflow-hidden">
									<img
										src={splashImg}
										alt={champName}
										className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700 contrast-110"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

									{/* Floating Full LoR Card Preview */}
									{cardImg && (
										<div
											onClick={() => (currentCard || champion.cardCode) && onOpenCarousel && onOpenCarousel(currentCard, currentCard?.cardCode || champion.cardCode)}
											className="absolute bottom-20 right-4 w-28 sm:w-32 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] cursor-pointer transform group-hover:-translate-y-2 transition duration-500"
											title="Click to view full card"
										>
											<SafeImage
												src={cardImg}
												alt={`${champName} Card`}
												className="w-full h-auto rounded-md shadow-2xl"
											/>
										</div>
									)}
								</div>

								{/* Bottom Callout: Champion Tags / Nhãn Tướng */}
								<div className="p-4 tactical-box border-t border-l-4 border-l-[var(--tactical-accent-cyan)]">
									<div className="flex items-center justify-between mb-2">
										<span className="text-[11px] uppercase tracking-widest tactical-accent-cyan font-bold flex items-center gap-1.5">
											<Sparkles className="w-3.5 h-3.5" />
											<span>{tUI("championDetail.tactical.tagsHeader", "NHÃN ĐẶC TRƯNG // TAGS")}</span>
										</span>
										<span className="text-[11px] font-mono-tech tactical-accent-lime">
											{champion.championID}
										</span>
									</div>
									<div className="flex flex-wrap gap-2 pt-1">
										{(() => {
											const dynamicTags = tDynamic(champion, "tags");
											const tagsToRender = (Array.isArray(dynamicTags) && dynamicTags.length > 0)
												? dynamicTags
												: (champion.tags || []);
											return tagsToRender.length > 0 ? (
												tagsToRender.map((tag, tIdx) => (
													<span
														key={tIdx}
														className="px-2.5 py-1 text-xs font-mono-tech font-bold uppercase tactical-card border border-[var(--tactical-accent-cyan)]/40 text-[var(--tactical-accent-cyan)] clip-chamfer-sm hover:border-[var(--tactical-accent-lime)] hover:text-[var(--tactical-accent-lime)] transition"
													>
														#{tag}
													</span>
												))
											) : (
												<span className="text-xs tactical-text-sub font-mono-tech">
													#STANDARD #TACTICAL
												</span>
											);
										})()}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ChampionHeroSection;
