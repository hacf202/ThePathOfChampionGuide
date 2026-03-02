// src/pages/admin/DropDragSidePanel.jsx
import { memo, useMemo, useState } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import { Search, Package, Gem, Zap, Shield, Star, X, Info } from "lucide-react";

// Hàm helper để lấy ID duy nhất dựa trên bất kỳ cấu trúc CSDL nào
const getUniqueId = item => {
	return (
		item._id ||
		item.id ||
		item.bonusStarID ||
		item.powerCode ||
		item.relicCode ||
		item.itemCode ||
		item.runeCode
	);
};

const DropDragItem = memo(({ item, type, setTooltipData }) => {
	const handleDragStart = e => {
		const uniqueId = getUniqueId(item);
		// Truyền uniqueId thống nhất vào trường 'id' để dễ quản lý
		e.dataTransfer.setData(
			"text/plain",
			JSON.stringify({
				type: type,
				id: uniqueId,
				name: item.name,
			}),
		);
		e.dataTransfer.effectAllowed = "copy";

		// Ẩn tooltip khi bắt đầu kéo để không vướng víu
		setTooltipData(null);
	};

	// Lấy tọa độ thẻ hiện tại để định vị Tooltip
	const handleMouseEnter = e => {
		const rect = e.currentTarget.getBoundingClientRect();
		setTooltipData({
			item,
			type,
			x: rect.left, // Tọa độ mép trái của thẻ
			y: rect.top + rect.height / 2, // Tọa độ chính giữa chiều dọc của thẻ
		});
	};

	const handleMouseLeave = () => {
		setTooltipData(null);
	};

	return (
		<div
			draggable
			onDragStart={handleDragStart}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className='p-3 bg-surface-hover rounded-xl border border-border hover:bg-surface-hover-active hover:border-primary-500/50 transition-all duration-200 cursor-grab active:cursor-grabbing flex items-center gap-3 group shadow-sm hover:shadow-md'
		>
			{/* Hiển thị Icon/Ảnh của tài nguyên */}
			{item.assetAbsolutePath || item.image ? (
				<img
					src={item.assetAbsolutePath || item.image}
					alt={item.name}
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
					{item.name}
				</p>
				<p className='text-[10px] text-text-secondary truncate mt-0.5 font-medium'>
					{item.descriptionRaw || item.description || "Không có mô tả"}
				</p>
			</div>

			<div className='opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1.5 bg-primary-500/10 rounded-full'>
				<Info size={16} className='text-primary-500' />
			</div>
		</div>
	);
});

const DropDragSidePanel = memo(({ cachedData }) => {
	const [activeTab, setActiveTab] = useState("item");
	const [searchInput, setSearchInput] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);

	// State quản lý hiển thị Tooltip (chứa dữ liệu và tọa độ)
	const [tooltipData, setTooltipData] = useState(null);

	const tabs = [
		{ id: "item", label: "Vật phẩm", icon: <Package size={16} /> },
		{ id: "relic", label: "Cổ vật", icon: <Shield size={16} /> },
		{ id: "power", label: "Sức mạnh", icon: <Zap size={16} /> },
		{ id: "bonusStar", label: "Bonus Star", icon: <Star size={16} /> },
		{ id: "rune", label: "Ngọc", icon: <Gem size={16} /> },
	];

	const currentData = useMemo(() => {
		const map = {
			item: cachedData.items || [],
			relic: cachedData.relics || [],
			power: cachedData.powers || [],
			rune: cachedData.runes || [],
			bonusStar: cachedData.bonusStars || [],
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
		}
		return types.sort().map(t => ({ value: t, label: t }));
	}, [currentData, activeTab]);

	const filteredItems = useMemo(() => {
		let filtered = currentData;

		if (searchInput) {
			const term = searchInput.toLowerCase();
			filtered = filtered.filter(
				i =>
					i.name?.toLowerCase().includes(term) ||
					i.description?.toLowerCase().includes(term) ||
					i.descriptionRaw?.toLowerCase().includes(term),
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
			}
		}

		return filtered;
	}, [currentData, searchInput, selectedRarities, selectedTypes, activeTab]);

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

				<div className='flex border-b border-border overflow-x-auto no-scrollbar'>
					{tabs.map(tab => (
						<button
							key={tab.id}
							onClick={() => {
								setActiveTab(tab.id);
								handleReset();
							}}
							className={`flex-1 flex items-center justify-center gap-1 py-3 px-2 text-sm font-medium transition-colors min-w-[80px]
								${
									activeTab === tab.id
										? "text-primary-500 border-b-2 border-primary-500 bg-primary-500/5"
										: "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
								}`}
						>
							{tab.icon}
							<span className='hidden sm:inline'>{tab.label}</span>
						</button>
					))}
				</div>

				<div className='p-4 space-y-4 border-b border-border bg-surface-bg shadow-sm z-10'>
					<div className='relative'>
						<InputField
							value={searchInput}
							onChange={e => setSearchInput(e.target.value)}
							placeholder='Tìm trong danh sách...'
							className='pr-8 bg-surface-hover/50 border-transparent focus:border-primary-500'
						/>
						{searchInput ? (
							<button
								onClick={() => setSearchInput("")}
								className='absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-red-500 transition-colors p-1'
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
								Phân loại
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
										className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border
											${
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
								Độ hiếm
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
										className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border
											${
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

					{(searchInput ||
						selectedRarities.length > 0 ||
						selectedTypes.length > 0) && (
						<Button
							variant='ghost'
							size='sm'
							onClick={handleReset}
							className='w-full text-xs py-1.5 h-auto text-red-500 hover:text-red-600 hover:bg-red-500/10'
						>
							Xóa tất cả bộ lọc
						</Button>
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
									setTooltipData={setTooltipData} // Truyền hàm set state xuống component con
								/>
							))}
						</div>
					) : (
						<div className='flex flex-col items-center justify-center py-12 text-text-secondary opacity-60'>
							<Package size={48} className='mb-4' />
							<p className='text-sm font-medium'>Không tìm thấy mục nào.</p>
							<p className='text-xs'>Hãy thử thay đổi bộ lọc.</p>
						</div>
					)}
				</div>
			</div>

			{/* ========================================= */}
			{/* GIAO DIỆN TOOLTIP (FIXED POSITION PORTAL) */}
			{/* ========================================= */}
			{tooltipData && (
				<div
					className='fixed z-[99999] w-80 p-5 bg-white text-slate-800 border border-slate-200 rounded-2xl shadow-2xl pointer-events-none transform -translate-y-1/2 -translate-x-full animate-in fade-in slide-in-from-right-2 duration-200'
					style={{
						top: tooltipData.y,
						left: tooltipData.x - 20, // Cách mép trái thẻ 20px
					}}
				>
					{/* Mũi tên chỉ vào thẻ */}
					<div className='absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white border-r border-t border-slate-200 rotate-45 rounded-sm'></div>

					<div className='flex items-start gap-4 mb-4'>
						{tooltipData.item.assetAbsolutePath || tooltipData.item.image ? (
							<img
								src={
									tooltipData.item.assetAbsolutePath || tooltipData.item.image
								}
								className='w-14 h-14 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1 shrink-0 shadow-sm'
							/>
						) : (
							<div className='w-14 h-14 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm'>
								<span className='text-xl font-black text-slate-400'>
									{tooltipData.type.charAt(0).toUpperCase()}
								</span>
							</div>
						)}
						<div className='flex-1 min-w-0'>
							<p
								className='font-bold text-base leading-tight truncate text-slate-800'
								title={tooltipData.item.name}
							>
								{tooltipData.item.name}
							</p>
							<p className='text-[10px] text-slate-500 font-mono mt-1 bg-slate-100 inline-block px-1.5 py-0.5 rounded'>
								{getUniqueId(tooltipData.item) || "Unknown ID"}
							</p>
						</div>
					</div>

					<div className='text-sm text-slate-600 whitespace-pre-wrap leading-relaxed border-t border-slate-200 pt-3'>
						{tooltipData.item.descriptionRaw || tooltipData.item.description ? (
							<span
								dangerouslySetInnerHTML={{
									__html: (
										tooltipData.item.descriptionRaw ||
										tooltipData.item.description
									).replace(/\\n/g, "<br/>"),
								}}
							/>
						) : (
							<span className='italic opacity-50'>
								Không có mô tả chi tiết.
							</span>
						)}
					</div>

					{/* Hiển thị các Tags thông tin phụ trợ */}
					{(tooltipData.item.cost !== undefined ||
						tooltipData.item.rarity ||
						tooltipData.item.type) && (
						<div className='flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200'>
							{tooltipData.item.cost !== undefined && (
								<span className='px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold rounded-md flex items-center gap-1'>
									<Zap size={12} /> {tooltipData.item.cost} Mana
								</span>
							)}
							{tooltipData.item.rarity && (
								<span
									className={`px-2.5 py-1 text-xs font-bold rounded-md border
                        ${
													tooltipData.item.rarity === "Epic"
														? "bg-purple-50 text-purple-600 border-purple-100"
														: tooltipData.item.rarity === "Rare"
															? "bg-blue-50 text-blue-600 border-blue-100"
															: tooltipData.item.rarity === "Common"
																? "bg-slate-100 text-slate-600 border-slate-200"
																: "bg-amber-50 text-amber-600 border-amber-100"
												}`}
								>
									{tooltipData.item.rarity}
								</span>
							)}
						</div>
					)}
				</div>
			)}
		</>
	);
});

export default DropDragSidePanel;
