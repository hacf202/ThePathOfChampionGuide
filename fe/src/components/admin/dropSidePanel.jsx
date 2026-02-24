// src/pages/admin/DropDragSidePanel.jsx
import { memo, useMemo, useState } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import { Search, Package, Gem, Zap, Shield, Star, X } from "lucide-react";

const DropDragItem = memo(({ item, type }) => {
	const handleDragStart = e => {
		// Gửi dữ liệu dưới dạng JSON khi bắt đầu kéo
		e.dataTransfer.setData(
			"text/plain",
			JSON.stringify({ type, name: item.name }),
		);
		e.dataTransfer.effectAllowed = "copy";
	};

	return (
		<div
			draggable
			onDragStart={handleDragStart}
			className='p-3 bg-surface-hover rounded-md border border-border hover:bg-surface-hover-active transition-colors cursor-grab active:cursor-grabbing flex items-center gap-3 group'
		>
			{/* Hiển thị Icon/Ảnh của tài nguyên */}
			{item.assetAbsolutePath || item.image ? (
				<img
					src={item.assetAbsolutePath || item.image}
					alt={item.name}
					className='w-10 h-10 rounded object-contain bg-white border'
					onError={e => (e.target.style.display = "none")}
				/>
			) : (
				<div className='w-10 h-10 bg-input-bg rounded border flex items-center justify-center'>
					<span className='text-xs text-text-secondary'>
						{type.charAt(0).toUpperCase()}
					</span>
				</div>
			)}

			<div className='flex-grow min-w-0'>
				<p className='font-medium text-text-primary truncate'>{item.name}</p>
				<p className='text-xs text-text-secondary truncate'>
					{item.descriptionRaw || item.description || "Không có mô tả"}
				</p>
			</div>

			<div className='opacity-0 group-hover:opacity-100 transition-opacity'>
				<Search size={16} className='text-primary' />
			</div>
		</div>
	);
});

const DropDragSidePanel = memo(({ cachedData }) => {
	const [activeTab, setActiveTab] = useState("item");
	const [searchInput, setSearchInput] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]); // State mới cho bộ lọc loại

	// Danh sách các Tab tài nguyên (Đã thêm Bonus Star)
	const tabs = [
		{ id: "item", label: "Vật phẩm", icon: <Package size={16} /> },
		{ id: "relic", label: "Cổ vật", icon: <Shield size={16} /> },
		{ id: "power", label: "Sức mạnh", icon: <Zap size={16} /> },
		{ id: "bonusStar", label: "Bonus Star", icon: <Star size={16} /> },
		{ id: "rune", label: "Ngọc", icon: <Gem size={16} /> },
	];

	// Lấy dữ liệu tương ứng với Tab đang chọn
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

	// Lấy danh sách các độ hiếm
	const rarityOptions = useMemo(() => {
		const rarities = [
			...new Set(currentData.map(i => i.rarity).filter(Boolean)),
		].sort();
		return rarities.map(r => ({ value: r, label: r }));
	}, [currentData]);

	// Lấy danh sách các loại (Type/NodeType) tùy theo tab
	const typeOptions = useMemo(() => {
		let types = [];
		if (activeTab === "relic") {
			// Relic: lọc theo type (string)
			types = [...new Set(currentData.map(i => i.type).filter(Boolean))];
		} else if (activeTab === "power") {
			// Power: lọc theo type (list string)
			types = [
				...new Set(currentData.flatMap(i => i.type || []).filter(Boolean)),
			];
		} else if (activeTab === "bonusStar") {
			// BonusStar: lọc theo nodeType (string)
			types = [...new Set(currentData.map(i => i.nodeType).filter(Boolean))];
		}
		return types.sort().map(t => ({ value: t, label: t }));
	}, [currentData, activeTab]);

	// Logic lọc dữ liệu tổng hợp
	const filteredItems = useMemo(() => {
		let filtered = currentData;

		// 1. Lọc theo tìm kiếm
		if (searchInput) {
			const term = searchInput.toLowerCase();
			filtered = filtered.filter(
				i =>
					i.name?.toLowerCase().includes(term) ||
					i.description?.toLowerCase().includes(term) ||
					i.descriptionRaw?.toLowerCase().includes(term),
			);
		}

		// 2. Lọc theo độ hiếm
		if (selectedRarities.length > 0) {
			filtered = filtered.filter(i => selectedRarities.includes(i.rarity));
		}

		// 3. Lọc theo Loại (Type/NodeType)
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
		<div className='sticky top-0 h-screen bg-surface-bg border-l border-border flex flex-col'>
			<div className='p-4 border-b border-border'>
				<h3 className='text-lg font-semibold text-text-primary'>
					Kéo thả Tài nguyên
				</h3>
			</div>

			{/* Thanh chuyển đổi Tab */}
			<div className='flex border-b border-border overflow-x-auto no-scrollbar'>
				{tabs.map(tab => (
					<button
						key={tab.id}
						onClick={() => {
							setActiveTab(tab.id);
							handleReset();
						}}
						className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 text-sm font-medium transition-colors min-w-[100px]
							${
								activeTab === tab.id
									? "text-blue-700 border-b-2 border-primary"
									: "text-text-secondary hover:text-text-primary"
							}`}
					>
						{tab.icon}
						<span>{tab.label}</span>
					</button>
				))}
			</div>

			{/* Khu vực bộ lọc */}
			<div className='p-4 space-y-3 border-b border-border bg-surface-hover'>
				<div className='relative'>
					<InputField
						value={searchInput}
						onChange={e => setSearchInput(e.target.value)}
						placeholder='Tìm trong danh sách...'
						className='pr-8'
					/>
					{searchInput && (
						<button
							onClick={() => setSearchInput("")}
							className='absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary'
						>
							<X size={16} />
						</button>
					)}
				</div>

				{/* Lọc theo Loại (Chỉ hiện ở Relic, Power, BonusStar) */}
				{typeOptions.length > 0 && (
					<div>
						<label className='block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5'>
							Phân loại
						</label>
						<div className='flex flex-wrap gap-1'>
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
									className={`px-2 py-1 text-[10px] rounded-md transition-all border
										${
											selectedTypes.includes(opt.value)
												? "bg-blue-600 border-blue-600 text-white font-bold"
												: "bg-surface-bg border-border text-text-secondary hover:border-primary"
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
						<label className='block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5'>
							Độ hiếm
						</label>
						<div className='flex flex-wrap gap-1'>
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
									className={`px-2 py-1 text-[10px] rounded-md transition-all border
										${
											selectedRarities.includes(opt.value)
												? "bg-primary border-primary text-blue font-bold shadow-sm"
												: "bg-surface-bg border-border text-text-secondary hover:border-primary"
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
						variant='outline'
						size='sm'
						onClick={handleReset}
						className='w-full text-xs py-1 h-auto'
					>
						Xóa tất cả bộ lọc
					</Button>
				)}
			</div>

			{/* Danh sách các tài nguyên có thể kéo thả */}
			<div className='flex-1 overflow-y-auto p-4 custom-scrollbar'>
				{filteredItems.length > 0 ? (
					<div className='space-y-2'>
						{filteredItems.map((item, idx) => (
							<DropDragItem
								key={`${activeTab}-${idx}`}
								item={item}
								type={activeTab}
							/>
						))}
					</div>
				) : (
					<div className='text-center py-8 text-text-secondary'>
						<p className='text-sm italic'>Không tìm thấy mục nào.</p>
					</div>
				)}
			</div>

			<div className='p-4 border-t border-border bg-surface-hover text-[10px] text-text-secondary italic'>
				<p>
					Mẹo: Kéo tài nguyên vào các ô nhập liệu tương ứng để tự động điền
					thông tin.
				</p>
			</div>
		</div>
	);
});

export default DropDragSidePanel;
