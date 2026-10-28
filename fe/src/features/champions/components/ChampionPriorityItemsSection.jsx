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
	language = "vi",
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
			typeLabel: tUI("championDetail.tactical.itemTypeItem") || "VẬT PHẨM (ITEM)",
			name: tDynamic(it, "name") || it.name,
			rarity: (it.rarity || "RARE").toUpperCase(),
			icon: it.image || it.assetAbsolutePath || "/images/placeholder.png",
			description: tDynamic(it, "description") || tDynamic(it, "descriptionRaw") || "",
			priorityReason: tUI("championDetail.tactical.itemPriorityReasonItem") || "Gia tăng sát thương cơ bản và hiệu ứng chiến đấu khi gắn vào các lá bài chủ lực.",
			raw: it,
		}));

		const powers = (adventurePowersFull || []).map((pw, idx) => ({
			id: `power-${pw.powerCode || idx}`,
			code: pw.powerCode,
			category: "POWERS",
			typeLabel: tUI("championDetail.tactical.itemTypePower") || "SỨC MẠNH (POWER)",
			name: tDynamic(pw, "name") || pw.name,
			rarity: (pw.rarity || "EPIC").toUpperCase(),
			icon: pw.image || pw.assetAbsolutePath || "/images/placeholder.png",
			description: tDynamic(pw, "description") || tDynamic(pw, "descriptionRaw") || "",
			priorityReason: tUI("championDetail.tactical.itemPriorityReasonPower") || "Tương tác liên hoàn với cơ chế của tướng, tạo chuỗi combo mạnh mẽ từ đầu trận.",
			raw: pw,
		}));

		const runes = (runesFull || []).map((rn, idx) => ({
			id: `rune-${rn.runeCode || idx}`,
			code: rn.runeCode,
			category: "RUNES",
			typeLabel: tUI("championDetail.tactical.itemTypeRune") || "CỔ NGỮ (RUNE)",
			name: tDynamic(rn, "name") || rn.name,
			rarity: (rn.rarity || "COMMON").toUpperCase(),
			icon: rn.image || rn.assetAbsolutePath || "/images/placeholder.png",
			description: tDynamic(rn, "description") || tDynamic(rn, "descriptionRaw") || "",
			priorityReason: tUI("championDetail.tactical.itemPriorityReasonRune") || "Bổ trợ các chỉ số nền tảng và tài nguyên trong suốt chặng đường phiêu lưu.",
			raw: rn,
		}));

		return isSpiritBlossom ? [...items, ...powers, ...runes] : [...items, ...powers];
	}, [defaultItemsFull, adventurePowersFull, runesFull, isSpiritBlossom, tDynamic, tUI]);

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
		<section id="priority-items" className="py-12 sm:py-20 border-b tactical-section bg-halftone">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header: Sạch sẽ, không subheader thừa */}
				<div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2">
					<h2 className="font-display text-3xl sm:text-4xl lg:text-5xl uppercase italic tactical-text-main">
						{tUI("championDetail.tactical.priorityItemsTitle") || "Vật Phẩm & Sức Mạnh Ưu Tiên"}
					</h2>
					<div className="text-xs tactical-text-sub font-mono-tech">
						{filteredEntities.length} {tUI("championDetail.tactical.itemsCount") || "lựa chọn khuyên dùng"}
					</div>
				</div>

				{/* Category Tabs Filter (Tối ưu cuộn ngang mobile) */}
				<div className="flex items-center gap-2 mb-6 sm:mb-8 border-b tactical-section pb-4 overflow-x-auto no-scrollbar">
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
								className={`font-display uppercase tracking-wider px-4 sm:px-5 py-2 text-xs sm:text-sm clip-chamfer-sm transition border shrink-0 ${
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

				{/* Full-width Responsive Priority Grid (3 cols on desktop) */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
					{filteredEntities.map((entity) => (
						<div
							key={entity.id}
							className="p-4 border transition-all clip-chamfer-sm tactical-card hover:border-[var(--tactical-accent-cyan)]/70 hover:shadow-md flex flex-col justify-between"
						>
							<div>
								<div className="flex items-start justify-between gap-3 mb-2.5">
									<div className="flex items-center space-x-3 min-w-0">
										<div className="w-11 h-11 rounded tactical-box border flex items-center justify-center p-1 shrink-0 overflow-hidden">
											<img
												src={entity.icon}
												alt={entity.name}
												className="w-full h-full object-contain"
											/>
										</div>

										<div className="min-w-0">
											<h4 className="font-display text-base uppercase italic tracking-wide tactical-text-main truncate" title={entity.name}>
												{entity.name}
											</h4>
											<div className="text-[11px] tactical-accent-cyan font-mono-tech">
												{entity.typeLabel}
											</div>
										</div>
									</div>

									<span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border shrink-0 clip-chamfer-sm ${getRarityBadge(entity.rarity)}`}>
										{entity.rarity}
									</span>
								</div>

								<div className="text-xs tactical-text-sub line-clamp-3 leading-relaxed mt-2 pt-2 border-t border-inherit">
									<MarkupRenderer text={entity.description} />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default ChampionPriorityItemsSection;
