import React, { memo } from "react";
import InputField from "./inputField"; // Component của bạn
import Button from "./button"; // Component của bạn
import { Search, XCircle, FilterReset } from "lucide-react"; // Giả sử bạn dùng lucide

/**
 * Component hiển thị bộ lọc động
 * @param {object} filterState - State từ hook (searchInput, customFilters, sortOrder...)
 * @param {object} filterActions - Actions từ hook (setSearchInput, handleSearch...)
 * @param {array} filterConfigs - Cấu hình vẽ UI (vd: { key: 'rarities', label: 'Độ hiếm', options: [...] })
 * @param {array} sortOptions - Mảng cấu hình sort
 * @param {object} tUI - Hàm dịch ngôn ngữ (Tùy chọn)
 */
const FilterPanel = memo(
	({
		filterState,
		filterActions,
		filterConfigs = [],
		sortOptions = [],
		tUI,
	}) => {
		// Xử lý khi ấn Enter ở ô tìm kiếm
		const handleKeyDown = e => {
			if (e.key === "Enter") {
				filterActions.handleSearch();
			}
		};

		return (
			<div className='bg-surface-bg p-4 rounded-xl border border-border shadow-sm space-y-4'>
				{/* 1. KHU VỰC TÌM KIẾM CƠ BẢN */}
				<div className='flex flex-col sm:flex-row gap-3'>
					<div className='flex-1 relative'>
						<InputField
							value={filterState.searchInput}
							onChange={e => filterActions.setSearchInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={
								tUI
									? tUI("admin.common.searchPlaceholder")
									: "Nhập từ khóa tìm kiếm..."
							}
							className='w-full'
						/>
						{filterState.searchInput && (
							<button
								className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-red-500'
								onClick={() => {
									filterActions.setSearchInput("");
									filterActions.handleSearch();
								}}
							>
								<XCircle size={18} />
							</button>
						)}
					</div>

					<Button
						onClick={filterActions.handleSearch}
						variant='primary'
						iconLeft={<Search size={18} />}
					>
						{tUI ? tUI("admin.common.search") : "Tìm kiếm"}
					</Button>

					<Button
						onClick={filterActions.handleResetFilters}
						variant='outline'
						iconLeft={<FilterReset size={18} />}
					>
						{tUI ? tUI("admin.common.reset") : "Đặt lại"}
					</Button>
				</div>

				{/* 2. KHU VỰC BỘ LỌC NÂNG CAO (RENDER ĐỘNG TỪ CONFIG) */}
				{(filterConfigs.length > 0 || sortOptions.length > 0) && (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border/50'>
						{/* Vẽ tự động các bộ lọc đặc thù (Multi-Select/Select) */}
						{filterConfigs.map(config => (
							<div key={config.key} className='flex flex-col gap-1'>
								<label className='text-[10px] font-bold uppercase text-text-secondary tracking-widest'>
									{config.label}
								</label>

								{/* Chú ý: Ở đây bạn nhúng component MultiSelect/Dropdown của dự án bạn vào */}
								<select
									className='w-full p-2.5 rounded-lg border border-border bg-surface-bg text-sm outline-none'
									value={filterState.customFilters[config.key] || []}
									onChange={e => {
										// Logic này tùy thuộc vào component Select của bạn. Dưới đây là ví dụ select HTML thuần.
										// Trong thực tế, nếu dùng Select component, nó sẽ pass thẳng mảng values.
										const value = Array.from(
											e.target.selectedOptions,
											option => option.value,
										);
										filterActions.setFilterValue(config.key, value);
									}}
									multiple={config.isMultiple !== false}
								>
									{config.options.map(opt => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>
						))}

						{/* Sắp xếp */}
						{sortOptions.length > 0 && (
							<div className='flex flex-col gap-1'>
								<label className='text-[10px] font-bold uppercase text-text-secondary tracking-widest'>
									{tUI ? tUI("admin.common.sortBy") : "Sắp xếp theo"}
								</label>
								<select
									className='w-full p-2.5 rounded-lg border border-border bg-surface-bg text-sm outline-none'
									value={filterState.sortOrder}
									onChange={e => filterActions.setSortOrder(e.target.value)}
								>
									{sortOptions.map(opt => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>
						)}
					</div>
				)}
			</div>
		);
	},
);

export default FilterPanel;
