// src/pages/admin/DropDragSidePanel.jsx
import { memo, useMemo, useState } from "react";
import Button from "../../common/button";
import InputField from "../../common/inputField";
import {
	Search,
	Package,
	Gem,
	Zap,
	Shield,
	Star,
	X,
	Info,
	Users,
	Skull,
	CreditCard,
} from "lucide-react";
import { removeAccents } from "../../../utils/vietnameseUtils";
import { useTranslation } from "../../../hooks/useTranslation";

const getUniqueId = item => {
	return (
		item.championID ||
		item.bossID ||
		item._id ||
		item.id ||
		item.bonusStarID ||
		item.powerCode ||
		item.relicCode ||
		item.itemCode ||
		item.runeCode ||
		item.cardCode
	);
};

const DropDragItem = memo(({ item, type, setTooltipData }) => {
	const { tDynamic, tUI } = useTranslation();
	const itemName =
		tDynamic(item, "name") || item.cardName || item.bossName || item.adventureName;
	const itemDesc =
		tDynamic(item, "descriptionRaw") ||
		tDynamic(item, "description") ||
		(type === "card" ? item.cardCode : tUI("admin.dropSidePanel.noDescription"));

	const handleDragStart = e => {
		const uniqueId = getUniqueId(item);
		e.dataTransfer.setData(
			"text/plain",
			JSON.stringify({
				type: type,
				id: uniqueId,
				name: itemName,
			}),
		);
		e.dataTransfer.effectAllowed = "copy";
		setTooltipData(null);
	};

	const handleMouseEnter = e => {
		const rect = e.currentTarget.getBoundingClientRect();
		setTooltipData({
			item,
			type,
			x: rect.left,
			y: rect.top + rect.height / 2,
		});
	};

	const handleMouseLeave = () => {
		setTooltipData(null);
	};

	const imageUrl =
		item.assetAbsolutePath ||
		item.gameAbsolutePath ||
		item.image ||
		item.avatar ||
		item.assets?.[0]?.avatar ||
		item.background;

	return (
		<div
			draggable
			onDragStart={handleDragStart}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className='p-3 bg-surface-hover rounded-xl border border-border hover:bg-surface-hover-active hover:border-primary-500/50 transition-all duration-200 cursor-grab active:cursor-grabbing flex items-center gap-3 group shadow-sm hover:shadow-md'
		>
			{imageUrl ? (
				<img
					src={imageUrl}
					alt={itemName}
					className='w-10 h-10 rounded-lg object-contain bg-white border border-border shrink-0 group-hover:scale-105 transition-transform'
					onError={e => (e.target.style.display = "none")}
				/>
			) : (
				<div className='w-10 h-10 bg-input-bg rounded-lg border border-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
					<span className='text-xs font-bold text-text-secondary'>
						{type.charAt(0).toUpperCase()}
					</span>
				</div>
			)}

			<div className='flex-grow min-w-0'>
				<p className='font-bold text-sm text-text-primary truncate'>
					{itemName}
				</p>
				<p className='text-[10px] text-text-secondary truncate mt-0.5 font-medium'>
					{itemDesc}
				</p>
			</div>

			<div className='opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1.5 bg-primary-500/10 rounded-full'>
				<Info size={16} className='text-primary-500' />
			</div>
		</div>
	);
});

const DropDragSidePanel = memo(({ cachedData }) => {
	const { tUI, tDynamic } = useTranslation();
	const [activeTab, setActiveTab] = useState("item");
	const [searchInput, setSearchInput] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);
	const [tooltipData, setTooltipData] = useState(null);

	const tabs = [
		{ id: "champion", label: "Tướng", icon: <Users size={16} /> },
		{ id: "boss", label: "Boss", icon: <Skull size={16} /> },
		{
			id: "item",
			label: tUI("admin.dropSidePanel.tabs.item"),
			icon: <Package size={16} />,
		},
		{
			id: "relic",
			label: tUI("admin.dropSidePanel.tabs.relic"),
			icon: <Shield size={16} />,
		},
		{
			id: "power",
			label: tUI("admin.dropSidePanel.tabs.power"),
			icon: <Zap size={16} />,
		},
		{
			id: "bonusStar",
			label: tUI("admin.dropSidePanel.tabs.bonusStar"),
			icon: <Star size={16} />,
		},
		{
			id: "rune",
			label: tUI("admin.dropSidePanel.tabs.rune"),
			icon: <Gem size={16} />,
		},
		{ id: "card", label: "Lá Bài", icon: <CreditCard size={16} /> },
	];

	const currentData = useMemo(() => {
		const map = {
			champion: cachedData.champions || [],
			boss: cachedData.bosses || [],
			item: cachedData.items || [],
			relic: cachedData.relics || [],
			power: cachedData.powers || [],
			rune: cachedData.runes || [],
			bonusStar: cachedData.bonusStars || [],
			card: cachedData.cards || [],
		};
		return map[activeTab] || [];
	}, [cachedData, activeTab]);

	const rarityOptions = useMemo(() => {
		const rarities = [
			...new Set(currentData.map(i => i.rarity).filter(Boolean)),
		].sort();
		return rarities.map(r => ({ value: r, label: r }));
	}, [currentData]);

	const typeOptions = useMemo(() => {
		let types = [];
		if (activeTab === "relic") {
			types = [...new Set(currentData.map(i => i.type).filter(Boolean))];
		} else if (activeTab === "power") {
			types = [
				...new Set(currentData.flatMap(i => i.type || []).filter(Boolean)),
			];
		} else if (activeTab === "bonusStar") {
			types = [...new Set(currentData.map(i => i.nodeType).filter(Boolean))];
		} else if (activeTab === "champion") {
			types = [
				...new Set(currentData.flatMap(i => i.regions || []).filter(Boolean)),
			];
		}
		return types.sort().map(t => ({ value: t, label: t }));
	}, [currentData, activeTab]);

	const filteredItems = useMemo(() => {
		let filtered = currentData;

		if (searchInput) {
			const term = removeAccents(searchInput).toLowerCase();
			filtered = filtered.filter(
				i =>
					removeAccents(
						tDynamic(i, "name") || i.bossName || i.adventureName || "",
					)
						.toLowerCase()
						.includes(term) ||
					removeAccents(tDynamic(i, "description") || "")
						.toLowerCase()
						.includes(term) ||
					removeAccents(tDynamic(i, "descriptionRaw") || "")
						.toLowerCase()
						.includes(term),
			);
		}

		if (selectedRarities.length > 0) {
			filtered = filtered.filter(i => selectedRarities.includes(i.rarity));
		}

		if (selectedTypes.length > 0) {
			if (activeTab === "relic") {
				filtered = filtered.filter(i => selectedTypes.includes(i.type));
			} else if (activeTab === "power") {
				filtered = filtered.filter(i =>
					i.type?.some(t => selectedTypes.includes(t)),
				);
			} else if (activeTab === "bonusStar") {
				filtered = filtered.filter(i => selectedTypes.includes(i.nodeType));
			} else if (activeTab === "champion") {
				filtered = filtered.filter(i =>
					i.regions?.some(r => selectedTypes.includes(r)),
				);
			}
		}

		return filtered;
	}, [
		currentData,
		searchInput,
		selectedRarities,
		selectedTypes,
		activeTab,
		tDynamic,
	]);

	const handleReset = () => {
		setSearchInput("");
		setSelectedRarities([]);
		setSelectedTypes([]);
	};

	return (
		<>
			<div className='sticky top-0 h-screen bg-surface-bg border-l border-border flex flex-col'>
				<div className='p-4 border-b border-border'>
					<h3 className='text-lg font-semibold text-text-primary'>
						Kéo thả Tài nguyên
					</h3>
				</div>

				<div className='flex border-b border-border overflow-x-auto custom-scrollbar pb-1'>
					{tabs.map(tab => (
						<button
							key={tab.id}
							onClick={() => {
								setActiveTab(tab.id);
								handleReset();
							}}
							className={`flex flex-col items-center justify-center gap-1 py-3 px-3 text-sm font-medium min-w-[70px] ${
								activeTab === tab.id
									? "text-primary-500 border-b-2 border-primary-500 bg-primary-500/5"
									: "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
							}`}
						>
							{tab.icon}
							<span className='text-[10px]'>{tab.label}</span>
						</button>
					))}
				</div>

				<div className='p-4 space-y-4 border-b border-border bg-surface-bg shadow-sm z-10'>
					<div className='relative'>
						<InputField
							value={searchInput}
							onChange={e => setSearchInput(e.target.value)}
							placeholder={tUI("common.searchPlaceholder")}
							className='pr-8 bg-surface-hover/50 border-transparent focus:border-primary-500'
						/>
						{searchInput ? (
							<button
								onClick={() => setSearchInput("")}
								className='absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-red-500 p-1'
							>
								<X size={16} />
							</button>
						) : (
							<Search
								size={16}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary opacity-50'
							/>
						)}
					</div>

					{typeOptions.length > 0 && (
						<div>
							<label className='block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2'>
								{activeTab === "champion"
									? "Vùng (Region)"
									: tUI("common.type")}
							</label>
							<div className='flex flex-wrap gap-1.5'>
								{typeOptions.map(opt => (
									<button
										key={opt.value}
										onClick={() =>
											setSelectedTypes(prev =>
												prev.includes(opt.value)
													? prev.filter(v => v !== opt.value)
													: [...prev, opt.value],
											)
										}
										className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border ${
											selectedTypes.includes(opt.value)
												? "bg-blue-600 border-blue-600 text-white shadow-md"
												: "bg-surface-bg border-border text-text-secondary hover:border-primary-500/50 hover:bg-surface-hover"
										}`}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>
					)}

					{rarityOptions.length > 0 && (
						<div>
							<label className='block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2'>
								{tUI("common.rarity")}
							</label>
							<div className='flex flex-wrap gap-1.5'>
								{rarityOptions.map(opt => (
									<button
										key={opt.value}
										onClick={() =>
											setSelectedRarities(prev =>
												prev.includes(opt.value)
													? prev.filter(v => v !== opt.value)
													: [...prev, opt.value],
											)
										}
										className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border ${
											selectedRarities.includes(opt.value)
												? "bg-purple-600 border-purple-600 text-white shadow-md"
												: "bg-surface-bg border-border text-text-secondary hover:border-primary-500/50 hover:bg-surface-hover"
										}`}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>
					)}
				</div>

				<div className='flex-1 overflow-y-auto p-4 custom-scrollbar bg-surface-hover/30'>
					{filteredItems.length > 0 ? (
						<div className='space-y-3'>
							{filteredItems.map((item, idx) => (
								<DropDragItem
									key={getUniqueId(item) || `${activeTab}-${idx}`}
									item={item}
									type={activeTab}
									setTooltipData={setTooltipData}
								/>
							))}
						</div>
					) : (
						<div className='flex flex-col items-center justify-center py-12 text-text-secondary opacity-60'>
							<Package size={48} className='mb-4' />
							<p className='text-sm font-medium'>Chưa có dữ liệu</p>
						</div>
					)}
				</div>
			</div>

			{tooltipData && (
				<div
					className='fixed z-[99999] w-80 p-5 bg-white text-slate-800 border border-slate-200 rounded-2xl shadow-2xl pointer-events-none transform -translate-y-1/2 -translate-x-full animate-in fade-in slide-in-from-right-2 duration-200'
					style={{ top: tooltipData.y, left: tooltipData.x - 20 }}
				>
					<div className='absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white border-r border-t border-slate-200 rotate-45 rounded-sm'></div>
					<div className='flex items-start gap-4 mb-4'>
						{tooltipData.item.assetAbsolutePath ||
						tooltipData.item.gameAbsolutePath ||
						tooltipData.item.image ||
						tooltipData.item.avatar ||
						tooltipData.item.assets?.[0]?.avatar ||
						tooltipData.item.background ? (
							<img
								src={
									tooltipData.item.assetAbsolutePath ||
									tooltipData.item.gameAbsolutePath ||
									tooltipData.item.image ||
									tooltipData.item.avatar ||
									tooltipData.item.assets?.[0]?.avatar ||
									tooltipData.item.background
								}
								className='w-14 h-20 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1 shrink-0 shadow-sm'
							/>
						) : (
							<div className='w-14 h-14 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm'>
								<span className='text-xl font-black text-slate-400'>
									{tooltipData.type.charAt(0).toUpperCase()}
								</span>
							</div>
						)}
						<div className='flex-1 min-w-0'>
							<p className='font-bold text-base leading-tight truncate text-slate-800'>
								{tDynamic(tooltipData.item, "name") ||
									tooltipData.item.cardName ||
									tooltipData.item.bossName ||
									tooltipData.item.adventureName}
							</p>
							<p className='text-[10px] text-slate-500 font-mono mt-1 bg-slate-100 inline-block px-1.5 py-0.5 rounded'>
								{getUniqueId(tooltipData.item) || "Unknown ID"}
							</p>
						</div>
					</div>
					<div className='text-sm text-slate-600 whitespace-pre-wrap leading-relaxed border-t border-slate-200 pt-3'>
						{tooltipData.item.descriptionRaw ||
						tooltipData.item.description ||
						tooltipData.item.note ? (
							<span
								dangerouslySetInnerHTML={{
									__html: (
										tDynamic(tooltipData.item, "descriptionRaw") ||
										tDynamic(tooltipData.item, "description") ||
										tooltipData.item.note ||
										""
									).replace(/\\n/g, "<br/>"),
								}}
							/>
						) : (
							<span className='italic opacity-50'>Không có mô tả chi tiết</span>
						)}
					</div>
				</div>
			)}
		</>
	);
});

export default DropDragSidePanel;
