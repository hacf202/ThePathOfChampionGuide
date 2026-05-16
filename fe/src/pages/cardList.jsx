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
	<div className='relative w-full aspect-[680/1024] bg-gray-800/40 rounded-xl overflow-hidden border border-white/5 animate-pulse shadow-lg'>
		<div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
		{/* Bottom placeholder */}
		<div className='absolute bottom-0 left-0 right-0 p-4 space-y-2'>
			<div className='h-4 w-3/4 bg-white/10 rounded-md' />
			<div className='h-3 w-1/2 bg-white/5 rounded-full' />
		</div>
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
	const [isReady, setIsReady] = useState(false);

	// Đảm bảo trang "sẵn sàng" sau khi tải dữ liệu
	useEffect(() => {
		let timer;
		if (!loading && cards.length > 0) {
			timer = setTimeout(() => setIsReady(true), 600);
		} else if (loading) {
			setIsReady(false);
		}
		return () => {
			if (timer) clearTimeout(timer);
		};
	}, [loading, cards.length]);

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
			loading={loading || !isReady}
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
			skeletonCount={15}
			gridClassName={(showFilter) => `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${showFilter ? "xl:grid-cols-5" : "xl:grid-cols-6"} gap-4 md:gap-8`}
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
