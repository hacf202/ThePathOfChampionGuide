import React, { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation.js";
import CardItem from "../components/card/CardItem.jsx";
import GenericListLayout from "../components/layout/genericListLayout.jsx";
import MultiSelectFilter from "../components/common/multiSelectFilter.jsx";
import DropdownFilter from "../components/common/dropdownFilter.jsx";
import { useCardFilters } from "../hooks/useCardFilters.js";
import { useCardData } from "../hooks/useCardData.js";

/**
 * Skeleton for Card Item
 */
const CardSkeleton = () => (
	<div className='rounded-xl border border-border bg-surface-bg p-0 overflow-hidden space-y-0 animate-pulse'>
		<div className='aspect-[680/1024] w-full bg-gray-700/50' />
	</div>
);

/**
 * Trang Khám Phá Lá Bài (Card Explorer) - Refactored Version
 */
const CardList = () => {
	const { tUI } = useTranslation();
	
	// 1. Quản lý Bộ lọc & Config
	// dynamicFilters được truyền vào để tạo label dịch thuật (key rarities, regions, types, costs)
	const [filtersFromData, setFiltersFromData] = useState(null);
	const { state, actions, queryParams, sortOptions, optionsMap } = useCardFilters(tUI, filtersFromData);
	
	// 2. Quản lý Dữ liệu & Sync
	const { cards, loading, error, pagination, dynamicFilters } = useCardData(queryParams, state, tUI);

	// Đồng bộ bộ lọc động khi dữ liệu tải về
	useEffect(() => {
		if (dynamicFilters) setFiltersFromData(dynamicFilters);
	}, [dynamicFilters]);

	/**
     * Tìm kiếm thủ công (Ví dụ: Nhấn Enter) - Thực thi ngay lập tức không chờ lọc tự động
     */
	const handleSearch = () => {
		actions.handleSearch();
	};

	return (
		<GenericListLayout
			pageTitle={tUI("cardList.title")}
			pageDescription={tUI("cardList.metaDesc")}
			heading={tUI("cardList.heading")}
			
			// Data & Pagination
			data={cards}
			loading={loading}
			pagination={pagination}
			currentPage={state.currentPage}
			onPageChange={(newPage) => actions.setCurrentPage(newPage)}
			isInfiniteScroll={false}
			hasNextPage={pagination?.currentPage < pagination?.totalPages}
			
			// Search
			searchValue={state.searchInput || ""}
			onSearchChange={(val) => actions.setSearchInput(val)}
			onSearchSubmit={handleSearch}
			searchPlaceholder={tUI("cardList.placeholder")}
			
			// Actions
			onResetFilters={actions.handleResetFilters}
			
			// Render
			renderSkeleton={() => <CardSkeleton />}
			skeletonCount={12}
			renderItem={(card) => (
				<CardItem card={card} key={card.cardCode} />
			)}
			renderFilters={() => (
				<div className="space-y-6">
					<MultiSelectFilter
						label={tUI("common.rarity") || "Độ hiếm"}
						options={optionsMap.rarities || []}
						selectedValues={state.customFilters?.rarities || []}
						onChange={(vals) => actions.setFilterValue("rarities", vals)}
					/>

					<MultiSelectFilter
						label={tUI("common.region") || "Khu vực"}
						options={optionsMap.regions || []}
						selectedValues={state.customFilters?.regions || []}
						onChange={(vals) => actions.setFilterValue("regions", vals)}
					/>

					<MultiSelectFilter
						label={tUI("common.type") || "Loại bài"}
						options={optionsMap.types || []}
						selectedValues={state.customFilters?.types || []}
						onChange={(vals) => actions.setFilterValue("types", vals)}
					/>

					<MultiSelectFilter
						label={tUI("common.cost") || "Tiêu hao"}
						options={optionsMap.costs || []}
						selectedValues={state.customFilters?.costs || []}
						onChange={(vals) => actions.setFilterValue("costs", vals)}
					/>

					<DropdownFilter
						label={tUI("championList.sortBy") || "Sắp xếp"}
						options={sortOptions}
						selectedValue={state.sortOrder}
						onChange={actions.setSortOrder}
					/>
				</div>
			)}
			// Pagination adapt (Handled by GenericListLayout)
			customTabs={null}
		/>
	);
};

export default CardList;
