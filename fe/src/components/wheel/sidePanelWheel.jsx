// src/components/wheel/SidePanelWheel.jsx (ĐÃ ÁP DỤNG DROPDOWN MỚI)

import React, { useState, useMemo } from "react";
import { ChevronsRight, CheckCircle2, MinusCircle } from "lucide-react";
import DropdownFilter from "../common/dropdownFilter"; // <-- 1. IMPORT COMPONENT MỚI

// --- Nhãn bộ lọc (Giữ nguyên) ---
const filterLabels = {
	regions: "Khu vực",
	maxStar: "Sao tối đa",
	tags: "Nhãn",
	cost: "Tiêu hao",
	rarity: "Độ hiếm",
	type: "Loại",
};

const SidePanel = ({
	wheelsData,
	activeWheelKey,
	onSelectWheel,
	setIsOpen,
	customItemsText,
	onCustomItemsChange,
	originalItems,
	checkedItems,
	onCheckboxChange,
	onSelectAll,
	onDeselectAll,
	filters,
	activeFilter,
	onFilterChange,
}) => {
	const [activeTab, setActiveTab] = useState("select");
	const [searchTerm, setSearchTerm] = useState("");

	// --- Logic lọc (Giữ nguyên) ---
	const searchFilteredItems = useMemo(() => {
		if (!originalItems) return [];
		if (!searchTerm) return originalItems;
		return originalItems.filter(item =>
			item.name.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [originalItems, searchTerm]);

	const renderFilters = () => {
		if (!filters) return null;

		// Bộ lọc đa cấp (Dropdowns)
		if (typeof filters === "object" && !Array.isArray(filters)) {
			//
			// ✨✨✨ THAY ĐỔI NẰM Ở ĐÂY ✨✨✨
			//
			return (
				<div className='grid grid-cols-2 gap-x-4 gap-y-2 mb-2'>
					{Object.entries(filters).map(([type, options]) => {
						// Chuyển mảng string ['A', 'B'] thành [{ value: 'A', label: 'A' }, ...]
						const dropdownOptions = options.map(optionStr => ({
							value: optionStr,
							label: optionStr,
						}));

						return (
							<DropdownFilter
								key={type}
								label={
									filterLabels[type] ||
									type.charAt(0).toUpperCase() + type.slice(1)
								}
								options={dropdownOptions}
								selectedValue={activeFilter[type]}
								onChange={value => onFilterChange(activeWheelKey, type, value)}
								variant='dark' // <-- 2. SỬ DỤNG VARIANT "DARK"
							/>
						);
					})}
				</div>
			);
		}

		// Bộ lọc đơn (Buttons) - (Giữ nguyên)
		return (
			<div className='flex items-center space-x-2 my-1 pt-2 mb-4 pb-2'>
				{filters.map(filter => (
					<button
						key={filter}
						onClick={() => onFilterChange(activeWheelKey, null, filter)}
						className={`px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${
							activeFilter === filter
								? "bg-primary-500 text-white"
								: "bg-panel-item-bg text-panel-text-dim hover:bg-panel-item-hover-bg"
						}`}
					>
						{filter}
					</button>
				))}
			</div>
		);
	};

	// ... (Toàn bộ phần còn lại của component giữ nguyên) ...
	return (
		// Sử dụng class ngữ nghĩa cho Giao diện Kính
		<div className='bg-panel-glass-bg backdrop-blur-sm p-4 rounded-l-xl border-l border-t border-b border-panel-glass-border w-full h-full flex flex-col'>
			<div className='flex justify-between items-center mb-4'>
				<h3 className='text-xl font-bold text-panel-text-light'>
					Bảng Điều Khiển
				</h3>
				<button
					onClick={() => setIsOpen(false)}
					className='text-panel-text-dim hover:text-panel-text-light'
					title='Đóng bảng điều khiển'
				>
					<ChevronsRight size={24} />
				</button>
			</div>
			<div className='flex border-b border-panel-glass-border mb-4'>
				{/* Sử dụng màu Primary cho active tab */}
				<button
					onClick={() => setActiveTab("select")}
					className={`py-2 px-4 font-semibold transition-colors ${
						activeTab === "select"
							? "border-b-2 border-primary-500 text-panel-text-light"
							: "text-panel-text-dimmer hover:text-panel-text-light"
					}`}
				>
					Chọn Vòng Quay
				</button>
				<button
					onClick={() => setActiveTab("customize")}
					className={`py-2 px-4 font-semibold transition-colors ${
						activeTab === "customize"
							? "border-b-2 border-primary-500 text-panel-text-light"
							: "text-panel-text-dimmer hover:text-panel-text-light"
					}`}
				>
					Tùy Chỉnh
				</button>
			</div>
			<div className='flex-grow overflow-y-auto'>
				{activeTab === "select" && (
					<div className='grid grid-cols-2 gap-4'>
						{Object.values(wheelsData).map(wheel => (
							<button
								key={wheel.key}
								onClick={() => onSelectWheel(wheel.key)}
								// Sử dụng class ngữ nghĩa. Dùng màu Primary cho active.
								className={`p-4 flex items-center justify-center text-lg font-bold rounded-lg cursor-pointer transition-all duration-300 transform border-2 ${
									activeWheelKey === wheel.key
										? "bg-primary-500 text-white border-primary-300 shadow-lg shadow-primary-500/40"
										: "bg-panel-item-bg text-panel-text-dim border-transparent hover:bg-panel-item-hover-bg hover:scale-105 "
								}`}
							>
								{wheel.title}
							</button>
						))}
					</div>
				)}
				{activeTab === "customize" && (
					<div className='flex flex-col space-y-4 h-full'>
						<div>
							<label
								htmlFor='custom-items-textarea'
								className='text-panel-text-light mb-2 font-semibold block'
							>
								Thêm các giá trị mới (mỗi giá trị một dòng):
							</label>
							<textarea
								id='custom-items-textarea'
								value={customItemsText}
								onChange={event =>
									onCustomItemsChange(activeWheelKey, event.target.value)
								}
								placeholder='Nhập các giá trị tùy chỉnh...'
								// Sử dụng class ngữ nghĩa cho input
								className='w-full h-24 px-3 py-2 bg-panel-input-bg border border-panel-input-border rounded-md text-panel-text-light focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y'
							/>
						</div>
						<div className='flex-grow flex flex-col min-h-0'>
							<div className='flex justify-between items-center mb-2'>
								<h4 className='text-panel-text-light font-semibold'>
									Chọn các giá trị có sẵn:
								</h4>
								<div className='flex items-center space-x-2'>
									<button
										onClick={() =>
											onSelectAll(activeWheelKey, searchFilteredItems)
										}
										// Dùng màu Primary
										className='text-panel-text-dimmer hover:text-white p-1'
										title='Chọn tất cả các giá trị đang hiển thị'
										aria-label='Chọn tất cả các giá trị đang hiển thị'
									>
										<CheckCircle2 size={24} />
									</button>
									<button
										onClick={() =>
											onDeselectAll(activeWheelKey, searchFilteredItems)
										}
										className='text-panel-text-dimmer hover:text-panel-text-dim p-1'
										title='Bỏ chọn tất cả các giá trị đang hiển thị'
										aria-label='Bỏ chọn tất cả các giá trị đang hiển thị'
									>
										<MinusCircle size={24} />
									</button>
								</div>
							</div>
							{renderFilters()}
							<input
								type='text'
								placeholder='Tìm kiếm giá trị...'
								value={searchTerm}
								onChange={event => setSearchTerm(event.target.value)}
								// Sử dụng class ngữ nghĩa cho input
								className='w-full px-3 py-2 bg-panel-input-bg border border-panel-input-border rounded-md text-panel-text-light focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2'
							/>
							<div className='flex-grow overflow-y-auto bg-panel-input-bg border border-panel-input-border rounded-md p-2 space-y-2'>
								{searchFilteredItems.map(item => (
									<label
										key={item.name}
										className='flex items-center space-x-3 p-2 rounded-md hover:bg-panel-item-hover-bg cursor-pointer'
									>
										<input
											type='checkbox'
											checked={checkedItems[item.name] || false}
											onChange={event =>
												onCheckboxChange(
													activeWheelKey,
													item.name,
													event.target.checked,
												)
											}
											// Sử dụng class ngữ nghĩa cho checkbox
											className='h-5 w-5 rounded bg-panel-checkbox-bg border-panel-checkbox-border text-primary-500 focus:ring-primary-500'
										/>
										<span className='text-panel-text-dim'>{item.name}</span>
									</label>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default React.memo(SidePanel);
