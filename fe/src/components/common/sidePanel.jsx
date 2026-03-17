// src/components/common/sidePanel.jsx
import { memo } from "react";
import InputField from "./inputField";
import MultiSelectFilter from "./multiSelectFilter";
import DropdownFilter from "./dropdownFilter";
import Button from "./button";
import { Search, Plus, RotateCw, XCircle } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook

const SidePanel = memo(
	({
		searchPlaceholder,
		addLabel,
		resetLabel,
		searchInput,
		onSearchInputChange,
		onSearch,
		onClearSearch,
		onAddNew,
		onResetFilters,
		multiFilterConfigs = [],
		sortOptions = [],
		sortSelectedValue,
		onSortChange,
		onSearchKeyDown, // 🟢 Bổ sung prop này từ component cha
	}) => {
		const { tUI } = useTranslation(); // 🟢 Khởi tạo Hook

		// 🟢 Xử lý giá trị mặc định bằng tUI
		const currentSearchPlaceholder =
			searchPlaceholder || tUI("common.searchPlaceholder");
		const currentAddLabel = addLabel || tUI("common.addNew");
		const currentResetLabel = resetLabel || tUI("championList.resetFilter");

		// Hàm xử lý khi nhấn phím trong ô input
		const handleKeyDown = e => {
			if (onSearchKeyDown) {
				onSearchKeyDown(e);
			} else if (e.key === "Enter" && onSearch) {
				// Mặc định tự gọi hàm onSearch nếu nhấn Enter
				onSearch();
			}
		};

		return (
			<div className='bg-surface-bg rounded-lg border border-border p-4 sm:p-6 mb-6'>
				<div className='space-y-4'>
					{/* Search Block */}
					<div>
						<div className='relative'>
							<InputField
								type='text'
								placeholder={currentSearchPlaceholder}
								value={searchInput}
								onChange={onSearchInputChange}
								onKeyDown={handleKeyDown} // 🟢 Lắng nghe sự kiện phím
								className='pr-10'
							/>
							{searchInput && (
								<button
									onClick={onClearSearch}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary'
								>
									<XCircle size={18} />
								</button>
							)}
						</div>
						<Button onClick={onSearch} className='w-full mt-2'>
							<Search size={16} className='mr-2' />
							{tUI("common.search")}
						</Button>
					</div>

					{/* Action Buttons Block */}
					<div className='flex flex-col gap-4'>
						<Button onClick={onAddNew} className='w-full'>
							<Plus size={16} className='mr-2' />
							{currentAddLabel}
						</Button>
						<Button
							variant='outline'
							onClick={onResetFilters}
							iconLeft={<RotateCw size={16} />}
							className='w-full'
						>
							{currentResetLabel}
						</Button>
					</div>

					{/* Filters Block */}
					<div className='flex flex-col gap-4'>
						{multiFilterConfigs.map((config, index) => (
							<MultiSelectFilter
								key={index}
								label={config.label}
								options={config.options}
								selectedValues={config.selectedValues}
								onChange={config.onChange}
								placeholder={config.placeholder}
							/>
						))}
					</div>

					{/* Sort Dropdown Block */}
					<div>
						<DropdownFilter
							label={tUI("championList.sortBy")}
							options={sortOptions}
							selectedValue={sortSelectedValue} // 🟢 Fix lại thành selectedValue cho khớp với DropdownFilter
							onChange={onSortChange}
						/>
					</div>
				</div>
			</div>
		);
	},
);

export default SidePanel;
