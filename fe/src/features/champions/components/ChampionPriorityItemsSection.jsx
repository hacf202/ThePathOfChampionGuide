import React, { useState, useMemo } from "react";
import {
	Flame,
	Sparkles,
	Zap,
	Shield,
	Compass,
	Award,
	Star,
	ChevronRight,
} from "lucide-react";
import MarkupRenderer from "@/components/common/MarkupRenderer";

const ChampionPriorityItemsSection = ({
	champion,
	defaultItemsFull = [],
	adventurePowersFull = [],
	runesFull = [],
	tUI,
	tDynamic,
}) => {
	const isSpiritBlossom = useMemo(() => {
		return (champion?.regions || []).some((r) =>
			/spirit\s*blossom|hoa\s*linh/i.test(r) ||
			r.toLowerCase().replace(/[^a-z]/g, "").includes("spiritblossom")
		);
	}, [champion]);

	const [activeCategory, setActiveCategory] = useState("ITEMS");
	const [selectedItemId, setSelectedItemId] = useState("");

	// Chuẩn hóa danh sách các vật phẩm/sức mạnh/ngọc ưu tiên
	const allPriorityEntities = useMemo(() => {
		const items = (defaultItemsFull || []).map((it, idx) => ({
			id: `item-${it.itemCode || idx}`,
			code: it.itemCode,
			category: "ITEMS",
			typeLabel: "VẬT PHẨM (ITEM)",
			name: tDynamic(it, "name") || it.name,
			rarity: (it.rarity || "RARE").toUpperCase(),
			icon: it.image || it.assetAbsolutePath || "/images/placeholder.png",
			description: tDynamic(it, "description") || tDynamic(it, "descriptionRaw") || "",
			priorityReason: "Gia tăng sát thương cơ bản và hiệu ứng chiến đấu khi gắn vào các lá bài chủ lực.",
			raw: it,
		}));

		const powers = (adventurePowersFull || []).map((pw, idx) => ({
			id: `power-${pw.powerCode || idx}`,
			code: pw.powerCode,
			category: "POWERS",
			typeLabel: "SỨC MẠNH (POWER)",
			name: tDynamic(pw, "name") || pw.name,
			rarity: (pw.rarity || "EPIC").toUpperCase(),
			icon: pw.image || pw.assetAbsolutePath || "/images/placeholder.png",
			description: tDynamic(pw, "description") || tDynamic(pw, "descriptionRaw") || "",
			priorityReason: "Tương tác liên hoàn với cơ chế của tướng, tạo chuỗi combo mạnh mẽ từ đầu trận.",
			raw: pw,
		}));

		const runes = (runesFull || []).map((rn, idx) => ({
			id: `rune-${rn.runeCode || idx}`,
			code: rn.runeCode,
			category: "RUNES",
			typeLabel: "CỔ NGỮ (RUNE)",
			name: tDynamic(rn, "name") || rn.name,
			rarity: (rn.rarity || "COMMON").toUpperCase(),
			icon: rn.image || rn.assetAbsolutePath || "/images/placeholder.png",
			description: tDynamic(rn, "description") || tDynamic(rn, "descriptionRaw") || "",
			priorityReason: "Bổ trợ các chỉ số nền tảng và tài nguyên trong suốt chặng đường phiêu lưu.",
			raw: rn,
		}));

		return isSpiritBlossom ? [...items, ...powers, ...runes] : [...items, ...powers];
	}, [defaultItemsFull, adventurePowersFull, runesFull, isSpiritBlossom, tDynamic]);

	// Danh sách theo category đang chọn
	const filteredEntities = useMemo(() => {
		const res = allPriorityEntities.filter((e) => e.category === activeCategory);
		return res.length > 0 ? res : allPriorityEntities;
	}, [activeCategory, allPriorityEntities]);

	// Chọn mục đầu tiên khi chuyển category
	const selectedEntity = useMemo(() => {
		return (
			filteredEntities.find((e) => e.id === selectedItemId) ||
			filteredEntities[0] ||
			null
		);
	}, [filteredEntities, selectedItemId]);

	if (allPriorityEntities.length === 0) return null;

	const getRarityBadge = (rarity) => {
		if (rarity === "EPIC") {
			return "border-purple-500/50 text-purple-600 dark:text-purple-300 bg-purple-500/15";
		}
		if (rarity === "RARE") {
			return "tactical-badge-cyan";
		}
		if (rarity === "LEGENDARY") {
			return "tactical-badge-lime";
		}
		return "border-emerald-500/50 text-emerald-700 dark:text-emerald-300 bg-emerald-500/15";
	};

	return (
		<section id="priority-items" className="py-20 border-b tactical-section bg-halftone">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
					<div>
						<div className="tactical-accent-cyan font-bold uppercase tracking-widest text-xs sm:text-sm">
							{tUI("championDetail.tactical.priorityItemsSub") || "ĐỀ XUẤT LỰA CHỌN KHI ĐI MAP // TĂNG TỶ LỆ VƯỢT ẢI"}
						</div>
						<h2 className="font-display text-5xl sm:text-6xl uppercase italic tactical-text-main mt-1">
							{tUI("championDetail.tactical.priorityItemsTitle") || "VẬT PHẨM & SỨC MẠNH ƯU TIÊN"}
						</h2>
					</div>
					<span className="font-mono-tech text-xs tactical-accent-lime tactical-box border px-3.5 py-2 clip-chamfer-sm">
						{filteredEntities.length} REVIEWS // DRAFT POOL
					</span>
				</div>

				{/* Category Tabs Filter */}
				<div className="flex flex-wrap gap-2 mb-8 border-b tactical-section pb-4">
					{[
						{ key: "ITEMS", label: `${tUI("championDetail.tactical.tabItems") || "Vật Phẩm"} (${allPriorityEntities.filter((e) => e.category === "ITEMS").length})` },
						{ key: "POWERS", label: `${tUI("championDetail.tactical.tabPowers") || "Sức Mạnh"} (${allPriorityEntities.filter((e) => e.category === "POWERS").length})` },
						...(isSpiritBlossom ? [{ key: "RUNES", label: `${tUI("championDetail.tactical.tabRunes") || "Cổ Ngữ"} (${allPriorityEntities.filter((e) => e.category === "RUNES").length})` }] : []),
					].map((tab) => {
						const isActive = activeCategory === tab.key;
						return (
							<button
								key={tab.key}
								type="button"
								onClick={() => setActiveCategory(tab.key)}
								className={`font-display uppercase tracking-wider px-5 py-2 text-sm sm:text-base clip-chamfer-sm transition border ${
									isActive
										? "tactical-tab-active border-[var(--tactical-tab-active-bg)] shadow-[var(--tactical-btn-primary-shadow)]"
										: "tactical-tab-inactive hover:border-[var(--tactical-accent-lime)]"
								}`}
							>
								{tab.label}
							</button>
						);
					})}
				</div>

				{/* 12-Column Layout: Left (7-8 cols Grid) & Right (4-5 cols Inspector) */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Left Grid */}
					<div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						{filteredEntities.map((entity) => {
							const isSelected = selectedEntity && selectedEntity.id === entity.id;
							return (
								<div
									key={entity.id}
									onClick={() => setSelectedItemId(entity.id)}
									className={`cursor-pointer p-4 border-l-4 transition flex flex-col gap-2 clip-chamfer-sm border tactical-card ${
										isSelected
											? "!border-l-[var(--tactical-accent-lime)] shadow-[0_0_20px_rgba(34,197,94,0.12)] ring-1 ring-[var(--tactical-accent-lime)]/50"
											: "border-l-transparent hover:!border-l-gray-400"
									}`}
								>
									<div className="flex items-center space-x-4">
										{/* Entity Icon */}
										<div className="w-12 h-12 rounded-lg tactical-box border flex items-center justify-center p-1 shrink-0 overflow-hidden">
											<img
												src={entity.icon}
												alt={entity.name}
												className="w-full h-full object-contain"
											/>
										</div>

										<div className="min-w-0 flex-1">
											<div className="flex items-center justify-between gap-1">
												<div
													className={`font-display text-lg uppercase tracking-wide truncate ${
														isSelected ? "tactical-accent-lime" : "tactical-text-main"
													}`}
												>
													{entity.name}
												</div>
												<span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border shrink-0 ${getRarityBadge(entity.rarity)}`}>
													{entity.rarity}
												</span>
											</div>

											<div className="text-xs tactical-accent-cyan font-mono-tech mt-0.5">
												{entity.typeLabel}
											</div>

											<div className="text-xs tactical-text-sub line-clamp-1 mt-1 leading-relaxed">
												<MarkupRenderer text={entity.description} />
											</div>
										</div>
									</div>

									{/* Inline Mobile Inspector: hiển thị trực tiếp chi tiết bên dưới ô chọn mà không phải cuộn */}
									{isSelected && (
										<div className="block lg:hidden mt-2 pt-3 border-t tactical-section space-y-2.5 animate-fadeIn">
											<div className="tactical-text-main text-xs leading-relaxed tactical-box p-3 border-l-4 border-[var(--tactical-accent-cyan)] border">
												<MarkupRenderer text={entity.description} />
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>

					{/* Right Inspector Sticky Column (Chỉ hiển thị trên Desktop >= lg) */}
					<div className="hidden lg:flex lg:col-span-4 lg:sticky lg:top-24 tactical-panel border-2 p-6 clip-chamfer flex-col items-center text-center shadow-2xl">
						<div className="text-xs font-mono-tech uppercase tracking-widest tactical-accent-lime mb-3">
							// {tUI("championDetail.tactical.itemInspectorTitle") || "THÔNG SỐ VẬT PHẨM / SỨC MẠNH"}
						</div>

						{selectedEntity ? (
							<div className="w-full space-y-4">
								<div className="w-24 h-24 mx-auto tactical-box border-2 border-[var(--tactical-accent-lime)]/60 rounded-xl p-2 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.15)]">
									<img
										src={selectedEntity.icon}
										alt={selectedEntity.name}
										className="w-full h-full object-contain"
									/>
								</div>

								<div>
									<span className={`text-[10px] font-mono-tech font-bold uppercase px-2 py-0.5 border ${getRarityBadge(selectedEntity.rarity)}`}>
										{selectedEntity.rarity} // {selectedEntity.typeLabel}
									</span>
									<h3 className="font-display text-2xl uppercase italic tactical-text-main mt-2">
										{selectedEntity.name}
									</h3>
								</div>

								<div className="tactical-text-sub text-xs sm:text-sm leading-relaxed tactical-box p-4 border-l-4 border-[var(--tactical-accent-cyan)] text-left border">
									<MarkupRenderer text={selectedEntity.description} />
								</div>
							</div>
						) : (
							<div className="tactical-text-dim font-mono-tech text-xs py-10">
								Chọn một vật phẩm hoặc sức mạnh bên trái để xem chi tiết.
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default ChampionPriorityItemsSection;
