// src/pages/admin/DropDragSidePanel.jsx
import { memo, useMemo, useState } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import { Search, Package, Gem, Zap, Shield, X } from "lucide-react";

const DropDragItem = memo(({ item, type }) => {
	const handleDragStart = e => {
		e.dataTransfer.setData(
			"text/plain",
			JSON.stringify({ type, name: item.name })
		);
		e.dataTransfer.effectAllowed = "copy";
	};

	return (
		<div
			draggable
			onDragStart={handleDragStart}
			className='p-3 bg-surface-hover rounded-md border border-border hover:bg-surface-hover-active transition-colors cursor-grab active:cursor-grabbing flex items-center gap-3 group'
		>
			{/* Icon */}
			{item.assetAbsolutePath ? (
				<img
					src={item.assetAbsolutePath}
					alt={item.name}
					className='w-10 h-10 rounded object-contain bg-white border'
					onError={e => (e.target.style.display = "none")}
				/>
			) : (
				<div className='w-10 h-10 bg-input-bg rounded border flex items-center justify-center'>
					<span className='text-xs text-text-secondary'>{type.charAt(0)}</span>
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

	const tabs = [
		{ id: "item", label: "Vật phẩm", icon: <Package size={16} /> },
		{ id: "relic", label: "Cổ vật", icon: <Shield size={16} /> },
		{ id: "power", label: "Sức mạnh", icon: <Zap size={16} /> },
		{ id: "rune", label: "Ngọc", icon: <Gem size={16} /> },
	];

	// Dữ liệu theo tab
	const currentData = useMemo(() => {
		const map = {
			item: cachedData.items || [],
			relic: cachedData.relics || [],
			power: cachedData.powers || [],
			rune: cachedData.runes || [],
		};
		return map[activeTab] || [];
	}, [cachedData, activeTab]);

	// Rarity options
	const rarityOptions = useMemo(() => {
		const rarities = [
			...new Set(currentData.map(i => i.rarity).filter(Boolean)),
		].sort();
		return rarities.map(r => ({ value: r, label: r }));
	}, [currentData]);

	// Lọc
	const filteredItems = useMemo(() => {
		let filtered = currentData;
		if (searchInput) {
			const term = searchInput.toLowerCase();
			filtered = filtered.filter(
				i =>
					i.name?.toLowerCase().includes(term) ||
					i.descriptionRaw?.toLowerCase().includes(term)
			);
		}
		if (selectedRarities.length > 0) {
			filtered = filtered.filter(i => selectedRarities.includes(i.rarity));
		}
		return filtered;
	}, [currentData, searchInput, selectedRarities]);

	const handleReset = () => {
		setSearchInput("");
		setSelectedRarities([]);
	};

	return (
		<div className='sticky top-0 h-screen bg-surface-bg border-l border-border flex flex-col'>
			{/* Header - Không nút đóng */}
			<div className='p-4 border-b border-border'>
				<h3 className='text-lg font-semibold text-text-primary'>
					Kéo thả Tài nguyên
				</h3>
			</div>

			{/* Tabs */}
			<div className='flex border-b border-border'>
				{tabs.map(tab => (
					<button
						key={tab.id}
						onClick={() => {
							setActiveTab(tab.id);
							handleReset();
						}}
						className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 text-sm font-medium transition-colors
							${
								activeTab === tab.id
									? "text-blue-700 border-b-2 border-primary"
									: "text-text-secondary hover:text-text-primary"
							}`}
					>
						{tab.icon}
						<span className='hidden sm:inline'>{tab.label}</span>
					</button>
				))}
			</div>

			{/* Bộ lọc - Scroll độc lập */}
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

				<div>
					<label className='block text-xs font-medium text-text-secondary mb-1'>
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
											: [...prev, opt.value]
									)
								}
								className={`px-2 py-1 text-xs rounded-full transition-colors
									${
										selectedRarities.includes(opt.value)
											? "bg-primary text-blue font-bold"
											: "bg-surface-hover text-text-secondary hover:bg-surface-hover-active"
									}`}
							>
								{opt.label}
							</button>
						))}
					</div>
				</div>

				{(searchInput || selectedRarities.length > 0) && (
					<Button
						variant='outline'
						size='sm'
						onClick={handleReset}
						className='w-full text-xs'
					>
						Đặt lại bộ lọc
					</Button>
				)}
			</div>

			{/* Danh sách - Scroll riêng, giới hạn chiều cao */}
			<div className='flex-1 overflow-y-auto p-4'>
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
						<p className='text-sm'>Không tìm thấy mục nào.</p>
						<p className='text-xs mt-1'>Thử thay đổi bộ lọc.</p>
					</div>
				)}
			</div>

			{/* Footer - Cố định dưới cùng */}
			<div className='p-4 border-t border-border bg-surface-hover text-xs text-text-secondary'>
				<p>Kéo item vào ô input trong form để thêm tên tự động.</p>
			</div>
		</div>
	);
});

export default DropDragSidePanel;
