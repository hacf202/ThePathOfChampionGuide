// src/pages/championList.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { useChampionFilters } from "../hooks/useChampionFilters"; // Từ tái cấu trúc trước đó
import { useChampionData } from "../hooks/useChampionData"; // Từ tái cấu trúc trước đó

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

	// Khởi tạo Data và Logic Filter
	const { dynamicFilters } = useChampionData("", tUI);
	const { state, actions, filterOptions, queryParams } = useChampionFilters(
		tUI,
		dynamicFilters,
	);
	const { champions, loading, error, pagination } = useChampionData(
		queryParams,
		tUI,
	);

	if (error) {
		return (
			<div className='p-10 text-center text-red-500 font-bold'>{error}</div>
		);
	}

	return (
		<GenericListLayout
			pageTitle={tUI("championList.title")}
			pageDescription={tUI("metadata.defaultDescription")}
			heading={tUI("championList.heading")}
			// Quản lý Dữ liệu
			data={champions}
			loading={loading}
			pagination={pagination}
			currentPage={state.currentPage}
			onPageChange={actions.setCurrentPage}
			// Quản lý Tìm kiếm
			searchValue={state.searchInput}
			onSearchChange={actions.setSearchInput}
			onSearchSubmit={actions.handleSearch}
			searchPlaceholder={tUI("championList.searchPlaceholder")}
			onResetFilters={actions.handleResetFilters}
			// Render Nội dung Động (Slot / Render Props)
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
