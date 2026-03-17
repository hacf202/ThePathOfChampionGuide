// src/pages/championList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { useChampionFilters } from "../hooks/useChampionFilters";
import { useChampionData } from "../hooks/useChampionData";

import GenericListLayout from "../components/layout/genericListLayout";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import DropdownFilter from "../components/common/dropdownFilter";
import ChampionCard from "../components/champion/championCard";

const ChampionSkeleton = () => (
	<div className='rounded-lg border border-border bg-surface-bg p-4 space-y-3 animate-pulse'>
		<div className='aspect-[4/5] w-full bg-gray-700/50 rounded-md' />
		<div className='h-4 w-3/4 bg-gray-700/50 mx-auto rounded' />
		<div className='h-3 w-1/2 bg-gray-700/50 mx-auto rounded' />
	</div>
);

function ChampionList() {
	const { tUI } = useTranslation();

	// 1. State trung gian để phá vỡ vòng lặp phụ thuộc (Circular Dependency)
	const [filtersData, setFiltersData] = useState(null);

	// 2. Gọi Hook Filters (lần render đầu filtersData sẽ là null, không sao cả)
	const { state, actions, filterOptions, queryParams } = useChampionFilters(
		tUI,
		filtersData,
	);

	// 3. TỐI ƯU HIỆU SUẤT: Gọi Hook Data MỘT LẦN DUY NHẤT với queryParams thực tế
	const { champions, loading, error, pagination, dynamicFilters } =
		useChampionData(queryParams, tUI);

	// 4. Khi API gọi xong và trả về dynamicFilters, ta đồng bộ ngược lại vào filtersData
	// để giao diện cập nhật danh sách các dropdown.
	useEffect(() => {
		if (dynamicFilters && Object.keys(dynamicFilters).length > 0) {
			setFiltersData(dynamicFilters);
		}
	}, [dynamicFilters]);

	// Hàm xử lý thay đổi input tìm kiếm (Đã fix lỗi đóng băng kí tự)
	const handleSearchChange = eventOrString => {
		if (eventOrString == null) {
			actions.setSearchInput("");
			return;
		}

		const value =
			typeof eventOrString === "object" && eventOrString.target !== undefined
				? eventOrString.target.value
				: eventOrString;

		actions.setSearchInput(value);
	};

	if (error) {
		return (
			<div className='flex justify-center py-20 text-red-500'>
				{error.message || tUI("common.errorLoadData")}
			</div>
		);
	}

	return (
		<GenericListLayout
			pageTitle={tUI("championList.pageTitle")}
			pageDescription={tUI("championList.pageDescription")}
			heading={tUI("championList.heading")}
			// Truyền dữ liệu Data & Phân trang
			data={champions}
			loading={loading}
			pagination={pagination}
			currentPage={state.currentPage}
			onPageChange={actions.setCurrentPage}
			// Truyền Search
			searchValue={state.searchInput || ""}
			onSearchChange={handleSearchChange}
			onSearchSubmit={actions.handleSearch}
			searchPlaceholder={tUI("championList.searchPlaceholder")}
			onResetFilters={actions.handleResetFilters}
			// Render Nội dung Động
			renderSkeleton={() => <ChampionSkeleton />}
			renderItem={champion => (
				<Link
					to={`/champion/${champion.championID}`}
					className='hover:scale-105 transition-transform duration-200 block'
				>
					<ChampionCard champion={champion} />
				</Link>
			)}
			renderFilters={() => (
				<>
					<MultiSelectFilter
						label={tUI("championList.region")}
						options={filterOptions.regions}
						selectedValues={state.selectedRegions}
						onChange={actions.setSelectedRegions}
					/>
					<MultiSelectFilter
						label={tUI("championList.cost")}
						options={filterOptions.costs}
						selectedValues={state.selectedCosts}
						onChange={actions.setSelectedCosts}
					/>
					<MultiSelectFilter
						label={tUI("championList.maxStars")}
						options={filterOptions.maxStars}
						selectedValues={state.selectedMaxStars}
						onChange={actions.setSelectedMaxStars}
					/>
					<MultiSelectFilter
						label={tUI("championList.tags")}
						options={filterOptions.tags}
						selectedValues={state.selectedTags}
						onChange={actions.setSelectedTags}
					/>
					<DropdownFilter
						label={tUI("championList.sortBy")}
						options={filterOptions.sort}
						selectedValue={state.sortOrder}
						onChange={actions.setSortOrder}
					/>
				</>
			)}
		/>
	);
}

export default ChampionList;
