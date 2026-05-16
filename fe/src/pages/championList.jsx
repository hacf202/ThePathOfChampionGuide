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
	<div className='relative w-full aspect-[340/500] bg-gray-800/40 rounded-lg overflow-hidden border border-white/5 animate-pulse'>
		{/* Cost Badge Skeleton */}
		<div className='absolute top-4 left-4 w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full border border-white/10' />
		
		{/* Bottom Content Skeleton */}
		<div className='absolute bottom-0 left-0 right-0 p-4 space-y-3 bg-gradient-to-t from-black/60 to-transparent'>
			<div className='h-7 w-3/4 bg-white/10 rounded-md' />
			<div className='flex gap-2'>
				<div className='h-6 w-16 bg-white/5 rounded-full' />
				<div className='h-6 w-20 bg-white/5 rounded-full' />
			</div>
		</div>
	</div>
);

function ChampionList() {
	const { tUI } = useTranslation();

	const [filtersData, setFiltersData] = useState(null);

	const { state, actions, filterConfigs, sortOptions, queryParams } =
		useChampionFilters(tUI, filtersData);

	const optionsMap =
		filterConfigs?.reduce((acc, config) => {
			acc[config.key] = config.options;
			return acc;
		}, {}) || {};

	const { champions, loading, error, pagination, dynamicFilters } =
		useChampionData(queryParams, tUI);

	useEffect(() => {
		if (dynamicFilters && Object.keys(dynamicFilters).length > 0) {
			setFiltersData(dynamicFilters);
		}
	}, [dynamicFilters]);

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
				{error.message || tUI("common.error")}
			</div>
		);
	}

	return (
		<GenericListLayout
			pageTitle={tUI("championList.title")}
			pageDescription={tUI("championList.pageDescription")}
			heading={tUI("championList.heading")}
			data={champions}
			loading={loading}
			pagination={pagination}
			currentPage={state.currentPage}
			onPageChange={actions.setCurrentPage}
			searchValue={state.searchInput || ""}
			onSearchChange={handleSearchChange}
			onSearchSubmit={actions.handleSearch}
			searchPlaceholder={tUI("championList.searchPlaceholder")}
			onResetFilters={actions.handleResetFilters}
			isFiltered={!!state.searchTerm || Object.values(state.customFilters || {}).some(v => Array.isArray(v) ? v.length > 0 : !!v)}
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
						options={optionsMap.regions || []}
						selectedValues={state.customFilters?.regions || []}
						onChange={vals => actions.setFilterValue("regions", vals)}
					/>
					<MultiSelectFilter
						label={tUI("championList.cost")}
						options={optionsMap.costs || []}
						selectedValues={state.customFilters?.costs || []}
						onChange={vals => actions.setFilterValue("costs", vals)}
					/>
					<MultiSelectFilter
						label={tUI("championList.maxStars")}
						options={optionsMap.maxStars || []}
						selectedValues={state.customFilters?.maxStars || []}
						onChange={vals => actions.setFilterValue("maxStars", vals)}
					/>
					<MultiSelectFilter
						label={tUI("championList.tags")}
						options={optionsMap.tags || []}
						selectedValues={state.customFilters?.tags || []}
						onChange={vals => actions.setFilterValue("tags", vals)}
					/>
					<DropdownFilter
						label={tUI("championList.sortBy")}
						options={sortOptions || []}
						selectedValue={state.sortOrder}
						onChange={actions.setSortOrder}
					/>
				</>
			)}
		/>
	);
}

export default ChampionList;
