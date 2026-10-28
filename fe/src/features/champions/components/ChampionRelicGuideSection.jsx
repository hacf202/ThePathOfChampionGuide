import React, { useState, useMemo, useEffect } from "react";
import {
	Film,
	Play,
	Compass,
	Terminal,
	Shield,
	Crosshair,
	Radio,
	VideoOff,
	Cpu,
	Sparkles,
	BookOpen,
} from "lucide-react";
import MarkupRenderer from "@/components/common/MarkupRenderer";

// Helper chuẩn hóa text thường cho combo steps, loại bỏ all-caps và tiền tố trùng lặp
const formatComboText = (text) => {
	if (!text) return "";
	let cleaned = text.replace(/^(step|bước)\s*\d+\s*[:.-]\s*/i, "").trim();
	if (cleaned === cleaned.toUpperCase() && cleaned.length > 5) {
		cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
	}
	return cleaned;
};

const ChampionRelicGuideSection = ({
	champion,
	relicSetsToRender = [],
	tUI,
	tDynamic,
	language = "vi",
}) => {
	const [activeRelicTabIdx, setActiveRelicTabIdx] = useState(0);
	const [selectedRelicSlotIdx, setSelectedRelicSlotIdx] = useState(0);
	const [activeVideoTimestamp, setActiveVideoTimestamp] = useState(0);

	// Chuẩn hóa danh sách các Bộ Cổ Vật (hỗ trợ cả định dạng mới và cũ)
	const normalizedBuilds = useMemo(() => {
		if (!champion) return [];

		const rawSets = relicSetsToRender.length > 0 ? relicSetsToRender : [];

		if (rawSets.length === 0) return [];

		return rawSets.map((setObj, idx) => {
			const setNum = idx + 1;
			const isFirst = idx === 0;
			const isSecond = idx === 1;

			// Trích xuất video link từ setObj hoặc champion.videoLink
			const videoUrl = setObj.video || champion.videoLink || "";
			let youtubeId = "";
			if (videoUrl.includes("embed/")) {
				youtubeId = videoUrl.split("embed/")[1]?.split("?")[0] || "";
			} else if (videoUrl.includes("v=")) {
				youtubeId = videoUrl.split("v=")[1]?.split("&")[0] || "";
			} else if (videoUrl.includes("youtu.be/")) {
				youtubeId = videoUrl.split("youtu.be/")[1]?.split("?")[0] || "";
			}

			// Format 3 relic slots
			const slots = (setObj.relics || []).slice(0, 3).map((r, sIdx) => ({
				name: tDynamic(r, "name") || `Cổ vật ${sIdx + 1}`,
				rarity: (r.rarity || (sIdx === 0 ? "EPIC" : "RARE")).toUpperCase(),
				image: r.image || "",
				icon: r.image ? (
					<img src={r.image} alt="" className="w-full h-full object-contain" />
				) : (
					"💎"
				),
				effect: tDynamic(r, "description") || tDynamic(r, "descriptionRaw") || "Cung cấp sức mạnh tăng cường đặc biệt cho tướng.",
				synergyNote: `Tương tác mạnh mẽ cùng nội tại của ${tDynamic(champion, "name")}, tối ưu hóa nhịp độ thi triển bài quân.`,
			}));

			const customStars = setObj.recommendedStars;
			const starReq = customStars ? (Number(customStars) === 6 ? "6★ MAX" : `${customStars}★`) : (isFirst ? "6★ MAX" : "3★+");
			
			const customTitle = tDynamic(setObj, "title") || setObj.title;
			const label = customTitle
				? customTitle
				: (isFirst
					? `SET 01 // BIS ENDGAME 6.5★`
					: isSecond
					? `SET 02 // SPEEDRUN AGGRO`
					: `SET 0${setNum} // TACTICAL BALANCED`);

			// 1. Combo steps: Ưu tiên bộ cụ thể -> mặc định chung của tướng -> fallback mẫu 3 bước
			const rawComboSteps = (setObj.comboSteps && setObj.comboSteps.length > 0)
				? setObj.comboSteps
				: (champion.comboSteps && champion.comboSteps.length > 0)
				? champion.comboSteps
				: null;

			const comboSteps = rawComboSteps
				? rawComboSteps.map((c, cIdx) => ({
					step: c.step || cIdx + 1,
					phase: tDynamic(c, "phase") || c.phase || `Bước ${cIdx + 1}`,
					action: tDynamic(c, "action") || c.action || "",
				}))
				: language === "en"
				? [
					{
						step: 1,
						phase: "Turn 1: Setup & Board Control",
						action: `Deploy low-cost units to establish board presence. Conserve spell mana for crucial interaction.`,
					},
					{
						step: 2,
						phase: `Turn 2-3: Summon ${tDynamic(champion, "name")}`,
						action: `Clear primary enemy threats and drop ${tDynamic(champion, "name")} onto the board to trigger relic passives.`,
					},
					{
						step: 3,
						phase: "Turn 4+: Nexus Decimation",
						action: `Execute maximum combo damage utilizing cascaded relic synergies to close out the encounter.`,
					},
				]
				: [
					{
						step: 1,
						phase: "Vòng 1: Khởi động & Kiểm soát",
						action: `Triển khai bài quân rẻ để thiết lập áp lực bàn đấu. Tránh tiêu tốn năng lượng dự trữ vào các phép chưa cần thiết.`,
					},
					{
						step: 2,
						phase: `Vòng 2-3: Triệu hồi ${tDynamic(champion, "name")}`,
						action: `Hạ gục bài quân chủ lực của địch và đưa ${tDynamic(champion, "name")} ra sân để kích hoạt hiệu ứng từ Cổ vật 1 & 2.`,
					},
					{
						step: 3,
						phase: "Vòng 4+: Kết liễu Nhà Chính",
						action: `Dồn sát thương tổng lực thông qua chuỗi hiệu ứng kích hoạt từ các Cổ vật để kết thúc trận đấu.`,
					},
				];

			// 2. Pro tips: Ưu tiên bộ cụ thể -> mặc định chung của tướng
			const rawProTips = (setObj.proTips && setObj.proTips.length > 0)
				? setObj.proTips
				: (champion.proTips && champion.proTips.length > 0)
				? champion.proTips
				: [];

			const proTips = rawProTips
				.map((tip) => typeof tip === "string" ? tip : tDynamic(tip, "tip") || tip.tip || "")
				.filter(Boolean);

			return {
				id: `build-${setNum}`,
				label,
				starReq,
				difficulty: isFirst ? "CHUYÊN GIA // EXPERT" : "TIÊU CHUẨN // STANDARD",
				summary: setObj.description || `Lối lên trang bị chuẩn cho ${tDynamic(champion, "name")} nhằm tối ưu hóa sát thương phủ đầu và kiểm soát bàn cờ.`,
				slots,
				playGuide: {
					comboSteps,
					proTips,
				},
				videoShowcase: youtubeId
					? {
							youtubeId,
					  }
					: null,
			};
		});
	}, [champion, relicSetsToRender, tDynamic, language]);

	// Reset slot khi đổi tab build
	useEffect(() => {
		setSelectedRelicSlotIdx(0);
		setActiveVideoTimestamp(0);
	}, [activeRelicTabIdx]);

	if (normalizedBuilds.length === 0) return null;

	const currentBuild = normalizedBuilds[activeRelicTabIdx] || normalizedBuilds[0];
	const activeVideo = currentBuild.videoShowcase;

	return (
		<section id="relic-builds" className="py-12 sm:py-20 border-b tactical-section bg-hazard-stripes relative">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header: Sạch sẽ, không subheader rườm rà */}
				<div className="mb-6 sm:mb-8">
					<h2 className="font-display text-3xl sm:text-4xl lg:text-5xl uppercase italic tactical-text-main">
						{tUI("championDetail.tactical.relicsTitle") || "Bộ Cổ Vật & Chiến Thuật Vận Hành"}
					</h2>
				</div>

				{/* Build Selector Tabs with embedded relic icons */}
				<div className="mb-8">
					<div id="relic-build-tabs" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{normalizedBuilds.map((build, idx) => {
							const isSelected = activeRelicTabIdx === idx;
							const hasVideo = Boolean(build.videoShowcase);

							return (
								<button
									key={build.id}
									type="button"
									onClick={() => {
										setActiveRelicTabIdx(idx);
										if (window.innerWidth < 1024) {
											const detailEl = document.getElementById("relic-build-detail");
											if (detailEl) {
												detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
											}
										}
									}}
									className={`text-left p-3.5 sm:p-4 border-l-4 transition-all clip-chamfer-sm flex flex-col justify-between gap-2.5 border tactical-card ${
										isSelected
											? "!border-l-[var(--tactical-accent-lime)] shadow-md ring-1 ring-[var(--tactical-accent-lime)]/40"
											: "border-l-transparent hover:!border-l-gray-400"
									}`}
								>
									{/* Top Meta: Stars & Video badge */}
									<div className="flex items-center justify-between gap-2 w-full">
										<span
											className={`text-[10px] font-mono-tech font-extrabold uppercase px-2 py-0.5 clip-chamfer-sm ${
												isSelected
													? "tactical-tab-active"
													: "tactical-box tactical-text-sub border"
											}`}
										>
											{build.starReq}
										</span>

										{hasVideo ? (
											<span className="inline-flex items-center gap-1 text-[10px] font-mono-tech font-bold uppercase px-2 py-0.5 tactical-badge-cyan clip-chamfer-sm">
												<Play className="w-2.5 h-2.5 fill-current" />
												<span>{tUI("championDetail.tactical.videoReadyBadge") || "Có Video"}</span>
											</span>
										) : (
											<span className="inline-flex items-center gap-1 text-[10px] font-mono-tech uppercase px-2 py-0.5 tactical-box tactical-text-dim border clip-chamfer-sm">
												<BookOpen className="w-2.5 h-2.5" />
												<span>{tUI("championDetail.tactical.noVideoBadge") || "Chiến Thuật"}</span>
											</span>
										)}
									</div>

									{/* Build Title */}
									<div
										className={`font-display text-base sm:text-lg uppercase italic tracking-wide truncate ${
											isSelected ? "tactical-accent-lime" : "tactical-text-main"
										}`}
										title={build.label}
									>
										{build.label}
									</div>

									{/* Relic Icons Preview (3 icon Cổ Vật nằm ngay trong Tab card) */}
									<div className="flex items-center gap-1.5 pt-2 border-t border-inherit/40 w-full">
										{build.slots.map((s, sIdx) => (
											<div
												key={sIdx}
												className="w-7 h-7 sm:w-8 sm:h-8 rounded tactical-box border flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-sm"
												title={s.name}
											>
												{s.icon}
											</div>
										))}
									</div>
								</button>
							);
						})}
					</div>
				</div>

				{/* MAIN 12-COLUMN SPLIT: Left (7 Cols) & Right (5 Cols Sticky Video) */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* LEFT COLUMN (7 Cols): Relic Slots + Combo + Pro Tips */}
					<div id="relic-build-detail" className="lg:col-span-7 space-y-6">
						{/* Loadout Summary Banner */}
						<div className="tactical-panel border p-5 sm:p-6 clip-chamfer shadow-md">
							<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
								<div className="flex items-center space-x-2">
									<span className="px-2.5 py-0.5 tactical-tab-active font-display uppercase text-xs tracking-wider clip-chamfer-sm">
										{tUI("championDetail.tactical.loadoutOverview") || "Chi Tiết Bộ Trang Bị"}
									</span>
									<span className="text-xs font-mono-tech tactical-accent-cyan font-bold">
										{currentBuild.difficulty}
									</span>
								</div>
							</div>

							<h3 className="font-display text-2xl sm:text-3xl uppercase italic tactical-text-main mt-1">
								{currentBuild.label}
							</h3>
							<div className="tactical-text-sub text-sm leading-relaxed mt-2 border-l-4 border-[var(--tactical-accent-cyan)] pl-3">
								<MarkupRenderer text={currentBuild.summary} />
							</div>

							{/* 3 Relic Slots (Trực quan, đầy đủ thông tin) */}
							<div className="mt-6">
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
									{currentBuild.slots.map((slot, i) => {
										const rarityBadge =
											slot.rarity === "EPIC"
												? "border-purple-500/50 text-purple-600 dark:text-purple-300 bg-purple-500/15"
												: slot.rarity === "RARE"
												? "tactical-badge-cyan"
												: "border-emerald-500/50 text-emerald-700 dark:text-emerald-300 bg-emerald-500/15";

										return (
											<div
												key={i}
												className="p-3.5 border transition-all clip-chamfer-sm relative tactical-card hover:border-[var(--tactical-accent-lime)]/50"
											>
												<div className="flex items-center justify-between mb-2">
													<span className="font-mono-tech text-[10px] tactical-text-dim font-bold uppercase">
														{tUI("championDetail.tactical.slotLabel") || (language === "en" ? "SLOT" : "Ô")} 0{i + 1}
													</span>
													<span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border clip-chamfer-sm ${rarityBadge}`}>
														{slot.rarity}
													</span>
												</div>

												<div className="flex items-center space-x-2.5 my-1.5">
													<div className="w-9 h-9 rounded tactical-box border flex items-center justify-center shrink-0">
														{slot.icon}
													</div>
													<h4 className="font-display text-base uppercase italic leading-tight truncate tactical-accent-lime" title={slot.name}>
														{slot.name}
													</h4>
												</div>

												<div className="text-xs tactical-text-sub mt-2 leading-relaxed">
													<MarkupRenderer text={slot.effect} />
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>

						{/* Turn-by-Turn Combo: Viết bằng TEXT THƯỜNG, phân cấp rõ ràng */}
						<div className="tactical-card border p-4 sm:p-5 clip-chamfer-sm space-y-4">
							<div className="flex items-center justify-between">
								<h4 className="font-display text-xl sm:text-2xl uppercase italic tactical-accent-lime flex items-center gap-2">
									<Terminal className="w-5 h-5" />
									<span>{tUI("championDetail.tactical.comboTitle") || "Vận Hành Combo Từng Vòng Đấu"}</span>
								</h4>
							</div>

							<div className="space-y-3">
								{currentBuild.playGuide.comboSteps.map((cStep, idx) => {
									const phaseText = formatComboText(cStep.phase);
									const actionText = formatComboText(cStep.action);

									return (
										<div
											key={idx}
											className="p-3.5 sm:p-4 border-l-4 transition-all clip-chamfer-sm border tactical-box !border-l-[var(--tactical-accent-lime)] flex items-start gap-3"
										>
											<span className="text-xs font-mono-tech font-bold px-2 py-0.5 tactical-tab-active shrink-0 clip-chamfer-sm mt-0.5">
												{tUI("championDetail.tactical.stepLabel") || "Bước"} {cStep.step || idx + 1}
											</span>
											<div className="space-y-1 min-w-0 flex-1">
												{phaseText && (
													<p className="text-sm sm:text-base font-medium normal-case leading-snug tactical-text-main">
														{phaseText}
													</p>
												)}
												{actionText && actionText !== phaseText && (
													<p className="text-xs sm:text-sm tactical-text-sub normal-case leading-relaxed">
														{actionText}
													</p>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Pro Synergy Tips (Chỉ hiển thị khi có mẹo) */}
						{currentBuild.playGuide.proTips && currentBuild.playGuide.proTips.length > 0 && (
							<div className="tactical-card border p-4 sm:p-5 clip-chamfer-sm space-y-3">
								<h4 className="font-display text-xl sm:text-2xl uppercase italic tactical-text-main flex items-center gap-2">
									<Shield className="w-5 h-5 tactical-accent-lime" />
									<span>{tUI("championDetail.tactical.proTipsTitle") || "Mẹo Chuyên Sâu & Khắc Chế"}</span>
								</h4>
								<div className="space-y-2">
									{currentBuild.playGuide.proTips.map((tip, idx) => (
										<div
											key={idx}
											className="tactical-box border p-3 flex items-start space-x-2.5 clip-chamfer-sm"
										>
											<span className="tactical-accent-lime font-mono-tech font-bold text-xs mt-0.5">
												•
											</span>
											<p className="text-xs sm:text-sm tactical-text-sub normal-case leading-relaxed">
												{tip}
											</p>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* RIGHT COLUMN (5 Cols, Sticky): VIDEO SHOWCASE MONITOR */}
					<div className="lg:col-span-5 lg:sticky lg:top-24">
						<div className="tactical-panel border-2 clip-chamfer overflow-hidden shadow-2xl">
							{/* Top Telemetry Header */}
							<div className="tactical-box px-5 py-3.5 border-b border-inherit flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Radio
										className={`w-4 h-4 ${activeVideo ? "tactical-accent-lime animate-pulse" : "tactical-text-dim"}`}
									/>
									<span className="text-xs font-bold uppercase tracking-widest tactical-accent-lime">
										{tUI("championDetail.tactical.videoMonitorHeader") || "VIDEO THỰC CHIẾN SHOWCASE"}
									</span>
								</div>
								<span className="text-[11px] font-mono-tech tactical-accent-cyan font-bold">
									{activeVideo ? "ONLINE" : "STANDBY MODE"}
								</span>
							</div>

							{activeVideo ? (
								<div>
									{/* Embedded YouTube Player with start parameter */}
									<div className="relative aspect-video w-full bg-black border-b border-inherit">
										<iframe
											key={`${activeVideo.youtubeId}-${activeVideoTimestamp}`}
											src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?start=${activeVideoTimestamp}&rel=0`}
											title={currentBuild.label}
											className="w-full h-full"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowFullScreen
										/>
									</div>

									{/* Video Chapters List */}
									<div className="p-5 sm:p-6 space-y-4">
										<div>
											<div className="text-[10px] font-mono-tech uppercase tactical-text-dim">
												ATTACHED TO: {currentBuild.label}
											</div>
											<h4 className="font-display text-2xl uppercase italic tactical-text-main mt-0.5">
												{tDynamic(champion, "name")} Combat Showcase
											</h4>
										</div>

										{/* Equipped Relic Pills */}
										<div className="flex flex-wrap gap-1.5 pt-1">
											{currentBuild.slots.map((s, idx) => (
												<span
													key={idx}
													className="text-[10px] font-mono-tech tactical-box border px-2.5 py-1 tactical-text-sub flex items-center gap-1"
												>
													<span>{s.icon}</span>
													<span>{s.name}</span>
												</span>
											))}
										</div>
									</div>
								</div>
							) : (
								/* Standby mode if no video */
								<div className="p-4 sm:p-6 space-y-4">
									<div className="relative h-36 sm:h-44 tactical-box border clip-chamfer-sm overflow-hidden flex flex-col items-center justify-center text-center p-4">
										<div className="w-10 h-10 rounded-full tactical-card border border-[var(--tactical-accent-lime)]/60 flex items-center justify-center mx-auto tactical-accent-lime mb-1.5">
											<VideoOff className="w-5 h-5" />
										</div>
										<div className="font-display text-lg sm:text-xl uppercase italic tactical-text-main">
											{tUI("championDetail.tactical.noVideoTitle") || "Hướng Dẫn Chiến Thuật"}
										</div>
										<p className="text-xs tactical-text-sub mt-1 max-w-xs">
											{tUI("championDetail.tactical.noVideoDesc") || (language === "en" ? "This loadout operates in text telemetry mode. Follow the turn-by-turn combo guide on the left." : "Bộ trang bị này hiện sử dụng hướng dẫn văn bản và combo chi tiết.")}
										</p>
									</div>

									{/* Quick Loadout Summary gọn gàng, icon chuẩn kích thước */}
									<div className="tactical-box border p-4 space-y-3 clip-chamfer-sm">
										<div className="text-xs font-bold uppercase tracking-wider tactical-accent-lime flex items-center justify-between">
											<span>{tUI("championDetail.tactical.relicListTitle") || "Cổ Vật Trong Bộ"}</span>
											<span className="font-mono-tech text-[10px] tactical-text-dim">3/3 SLOTS</span>
										</div>
										{currentBuild.slots.map((s, idx) => (
											<div key={idx} className="flex items-center justify-between gap-3 border-b tactical-section pb-2 last:border-b-0 last:pb-0">
												<div className="flex items-center gap-2.5 min-w-0">
													<div className="w-8 h-8 rounded border tactical-box flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
														{s.icon}
													</div>
													<span className="text-xs font-medium tactical-text-main truncate" title={s.name}>
														{s.name}
													</span>
												</div>
												<span className="text-[10px] font-mono-tech font-bold uppercase px-1.5 py-0.5 border clip-chamfer-sm shrink-0 tactical-accent-lime">
													{s.rarity}
												</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ChampionRelicGuideSection;
