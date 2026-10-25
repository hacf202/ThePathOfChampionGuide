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

const ChampionRelicGuideSection = ({
	champion,
	relicSetsToRender = [],
	tUI,
	tDynamic,
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
				icon: r.image ? (
					<img src={r.image} alt="" className="w-8 h-8 object-contain" />
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
	}, [champion, relicSetsToRender, tDynamic]);

	// Reset slot khi đổi tab build
	useEffect(() => {
		setSelectedRelicSlotIdx(0);
		setActiveVideoTimestamp(0);
	}, [activeRelicTabIdx]);

	if (normalizedBuilds.length === 0) return null;

	const currentBuild = normalizedBuilds[activeRelicTabIdx] || normalizedBuilds[0];
	const activeVideo = currentBuild.videoShowcase;

	return (
		<section id="relic-builds" className="py-20 border-b tactical-section bg-hazard-stripes relative">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
					<div>
						<div className="tactical-accent-lime font-bold uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2">
							<Film className="w-4 h-4 tactical-accent-cyan" />
							<span>{tUI("championDetail.tactical.relicsSub") || "BỘ TRANG BỊ TỐI ƯU // ĐỒNG BỘ VIDEO CHI TIẾT"}</span>
						</div>
						<h2 className="font-display text-5xl sm:text-6xl uppercase italic tactical-text-main mt-1">
							{tUI("championDetail.tactical.relicsTitle") || "BỘ CỔ VẬT & CHIẾN THUẬT VẬN HÀNH"}
						</h2>
					</div>
				</div>

				{/* Build Selector Tabs */}
				<div className="mb-8">
					<div className="text-xs font-mono-tech uppercase tracking-wider tactical-text-dim mb-3">
						{tUI("championDetail.tactical.selectBuildPrompt") || "CHỌN BỘ TRANG BỊ ĐỂ XEM HƯỚNG DẪN & VIDEO"}
					</div>
					<div id="relic-build-tabs" className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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
									className={`text-left p-4 border-l-4 transition-all clip-chamfer-sm flex flex-col justify-between gap-2 border tactical-card ${
										isSelected
											? "!border-l-[var(--tactical-accent-lime)] shadow-md ring-1 ring-[var(--tactical-accent-lime)]/40"
											: "border-l-transparent hover:!border-l-gray-400"
									}`}
								>
									<div className="flex items-center justify-between gap-2 w-full">
										<span
											className={`text-[10px] font-mono-tech font-extrabold uppercase px-2 py-0.5 ${
												isSelected
													? "tactical-tab-active"
													: "tactical-box tactical-text-sub border"
											}`}
										>
											{build.starReq}
										</span>

										{hasVideo ? (
											<span className="inline-flex items-center gap-1 text-[10px] font-mono-tech font-bold uppercase px-2 py-0.5 tactical-badge-cyan">
												<Play className="w-2.5 h-2.5 fill-current" />
												<span>{tUI("championDetail.tactical.videoReadyBadge") || "CÓ VIDEO"}</span>
											</span>
										) : (
											<span className="inline-flex items-center gap-1 text-[10px] font-mono-tech uppercase px-2 py-0.5 tactical-box tactical-text-dim border">
												<BookOpen className="w-2.5 h-2.5" />
												<span>{tUI("championDetail.tactical.noVideoBadge") || "HƯỚNG DẪN CHỮ"}</span>
											</span>
										)}
									</div>

									<div
										className={`font-display text-xl sm:text-2xl uppercase italic tracking-wide ${
											isSelected ? "tactical-accent-lime" : "tactical-text-main"
										}`}
									>
										{build.label}
									</div>

									
								</button>
							);
						})}
					</div>
				</div>

				{/* MAIN 12-COLUMN SPLIT: Left (7 Cols) & Right (5 Cols Sticky Video) */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* LEFT COLUMN (7 Cols): Relic Slots + Synergy + Mulligan + Turn-by-Turn Combo + Pro Tips */}
					<div id="relic-build-detail" className="lg:col-span-7 space-y-6">
						{/* Loadout Summary Banner */}
						<div className="tactical-panel border-2 p-5 sm:p-6 clip-chamfer shadow-lg">
							<div className="flex flex-wrap items-center justify-between gap-2 mb-3">
								<div className="flex items-center space-x-2">
									<span className="px-2.5 py-0.5 tactical-tab-active font-display uppercase text-xs tracking-wider">
										{tUI("championDetail.tactical.loadoutOverview") || "TỔNG QUAN BỘ TRANG BỊ"}
									</span>
									<span className="text-xs font-mono-tech tactical-accent-cyan font-bold">
										// {currentBuild.difficulty}
									</span>
								</div>
								<span className="text-xs font-mono-tech tactical-text-dim">
									ID: {currentBuild.id.toUpperCase()}
								</span>
							</div>

							<h3 className="font-display text-3xl uppercase italic tactical-text-main">
								{currentBuild.label}
							</h3>
							<div className="tactical-text-sub text-sm sm:text-base mt-2 leading-relaxed border-l-4 border-[var(--tactical-accent-cyan)] pl-4">
								<MarkupRenderer text={currentBuild.summary} />
							</div>

							{/* 3 Interactive Relic Slots */}
							<div className="mt-6">
								<div className="text-[11px] font-mono-tech uppercase tracking-wider tactical-accent-lime mb-2.5 flex items-center gap-1.5 font-bold">
									<Crosshair className="w-3.5 h-3.5" />
									<span>{tUI("championDetail.tactical.clickRelicPrompt") || "CLICK Ô CỔ VẬT ĐỂ XEM PHÂN TÍCH HIỆU ỨNG"}</span>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
									{currentBuild.slots.map((slot, i) => {
										const isSlotSelected = selectedRelicSlotIdx === i;
										const rarityBadge =
											slot.rarity === "EPIC"
												? "border-purple-500/50 text-purple-600 dark:text-purple-300 bg-purple-500/15"
												: slot.rarity === "RARE"
												? "tactical-badge-cyan"
												: "border-emerald-500/50 text-emerald-700 dark:text-emerald-300 bg-emerald-500/15";

										return (
											<div
												key={i}
												onClick={() => setSelectedRelicSlotIdx(i)}
												className={`cursor-pointer p-4 border-2 transition-all clip-chamfer-sm relative ${
													isSlotSelected
														? "tactical-card !border-[var(--tactical-accent-lime)] shadow-md"
														: "tactical-box border hover:!border-gray-400"
												}`}
											>
												<div className="flex items-center justify-between mb-2">
													<span className="font-mono-tech text-[10px] tactical-text-dim font-bold">
														SLOT 0{i + 1}
													</span>
													<span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border ${rarityBadge}`}>
														{slot.rarity}
													</span>
												</div>

												<div className="flex items-center space-x-2.5 my-1.5">
													<div className="w-9 h-9 rounded tactical-box border flex items-center justify-center shrink-0">
														{slot.icon}
													</div>
													<h4
														className={`font-display text-lg uppercase italic leading-tight truncate ${
															isSlotSelected ? "tactical-accent-lime" : "tactical-text-main"
														}`}
													>
														{slot.name}
													</h4>
												</div>

												<div className="text-xs tactical-text-sub mt-2 line-clamp-3 leading-relaxed">
													<MarkupRenderer text={slot.effect} />
												</div>
											</div>
										);
									})}
								</div>

								
							</div>
						</div>

						{/* Interactive Turn-by-Turn Combo Execution */}
						<div className="tactical-card border p-5 sm:p-6 clip-chamfer-sm">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
								<h4 className="font-display text-2xl uppercase italic tactical-accent-lime flex items-center gap-2">
									<Terminal className="w-5 h-5" />
									<span>{tUI("championDetail.tactical.comboTitle") || "Vận Hành Combo Từng Vòng Đấu"}</span>
								</h4>
								<span className="text-[11px] font-mono-tech tactical-accent-cyan tactical-box px-2.5 py-1 border border-[var(--tactical-accent-cyan)]/40 font-bold">
									// STEP-BY-STEP EXECUTION
								</span>
							</div>

							<div className="space-y-3">
								{currentBuild.playGuide.comboSteps.map((cStep, idx) => (
									<div
										key={idx}
										className="p-4 border-l-4 transition-all clip-chamfer-sm border tactical-box !border-l-[var(--tactical-accent-lime)]"
									>
										<div className="flex items-start space-x-2.5">
											<span className="font-display text-base px-2.5 py-0.5 tactical-tab-active shrink-0">
												{tUI("championDetail.tactical.stepLabel") || "BƯỚC"} {cStep.step}
											</span>
											<span className="font-display text-base sm:text-lg uppercase italic tactical-text-main">
												{cStep.phase}
											</span>
										</div>

										{cStep.action ? (
											<p className="text-xs sm:text-sm tactical-text-sub leading-relaxed pl-1 mt-2">
												{cStep.action}
											</p>
										) : null}
									</div>
								))}
							</div>
						</div>

						{/* Pro Synergy Tips (Chỉ hiển thị khi có mẹo) */}
						{currentBuild.playGuide.proTips && currentBuild.playGuide.proTips.length > 0 && (
							<div className="tactical-card border p-5 sm:p-6 clip-chamfer-sm">
								<h4 className="font-display text-2xl uppercase italic tactical-text-main flex items-center gap-2 mb-3">
									<Shield className="w-5 h-5 tactical-accent-lime" />
									<span>{tUI("championDetail.tactical.proTipsTitle") || "Mẹo Chuyên Sâu & Khắc Chế Boss"}</span>
								</h4>
								<div className="space-y-2.5">
									{currentBuild.playGuide.proTips.map((tip, idx) => (
										<div
											key={idx}
											className="tactical-box border p-3.5 flex items-start space-x-3"
										>
											<span className="tactical-accent-lime font-mono-tech font-bold text-xs mt-0.5">
												[0{idx + 1}]
											</span>
											<p className="text-xs sm:text-sm tactical-text-sub leading-relaxed">
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
								<div className="p-6 space-y-5">
									<div className="relative h-48 tactical-box border clip-chamfer-sm overflow-hidden flex flex-col items-center justify-center text-center p-6">
										<div className="w-12 h-12 rounded-full tactical-card border border-[var(--tactical-accent-lime)]/60 flex items-center justify-center mx-auto tactical-accent-lime mb-2">
											<VideoOff className="w-6 h-6" />
										</div>
										<div className="font-display text-2xl uppercase italic tactical-text-main">
											{tUI("championDetail.tactical.noVideoTitle") || "CHƯA CÓ VIDEO RIÊNG CHO BỘ NÀY"}
										</div>
										<div className="text-[11px] font-mono-tech tactical-accent-cyan mt-1">
											BUILD ID: {currentBuild.id.toUpperCase()} // TEXT TELEMETRY
										</div>
									</div>

									<p className="text-xs sm:text-sm tactical-text-sub leading-relaxed tactical-box p-4 border-l-4 border-[var(--tactical-accent-lime)] border">
										{tUI("championDetail.tactical.noVideoDesc") || "Bộ cổ vật này hiện đang chạy ở chế độ văn bản chiến thuật. Bạn có thể tham khảo combo và mẹo chơi bên trái."}
									</p>

									{/* Quick Loadout Summary */}
									<div className="tactical-box border p-4 space-y-2.5 font-mono-tech text-xs">
										<div className="tactical-text-dim uppercase">ACTIVE RELIC LOADOUT SUMMARY:</div>
										{currentBuild.slots.map((s, idx) => (
											<div key={idx} className="flex items-center justify-between border-b tactical-section pb-1.5">
												<span className="tactical-text-main flex items-center gap-1.5">
													<span>0{idx + 1}.</span> {s.icon} <span>{s.name}</span>
												</span>
												<span className="tactical-accent-lime font-bold">{s.rarity}</span>
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
