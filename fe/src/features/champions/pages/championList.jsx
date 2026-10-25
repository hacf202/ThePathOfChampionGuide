// src/pages/championList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useChampionFilters } from "@/hooks/useChampionFilters";
import { useChampionData } from "@/hooks/useChampionData";

import GenericListLayout from "@/components/layout/genericListLayout";
import { generateSlug } from "@/utils/slugify";
import MultiSelectFilter from "@/components/common/multiSelectFilter";
import DropdownFilter from "@/components/common/dropdownFilter";
import ChampionCard from "@/features/champions/components/championCard";

const ChampionSkeleton = () => (
	<div className='relative w-full aspect-[340/500] tactical-card border border-white/10 clip-chamfer overflow-hidden animate-pulse bg-white/5'>
		{/* Cost Badge Skeleton */}
		<div className='absolute top-3 left-3 w-14 h-7 bg-white/10 clip-chamfer-sm border border-white/10' />
		{/* Star Badge Skeleton */}
		<div className='absolute top-3 right-3 w-12 h-6 bg-white/10 clip-chamfer-sm border border-white/10' />
		
		{/* Bottom Content Skeleton */}
		<div className='absolute bottom-0 left-0 right-0 p-4 space-y-2.5 bg-gradient-to-t from-black/80 to-transparent'>
			<div className='h-8 w-3/4 bg-white/10 clip-chamfer-sm' />
			<div className='flex gap-2'>
				<div className='h-5 w-16 bg-white/5 clip-chamfer-sm' />
				<div className='h-5 w-20 bg-white/5 clip-chamfer-sm' />
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
			<div className='flex justify-center py-20 text-red-500 font-mono-tech'>
				{error.message || tUI("common.error")}
			</div>
		);
	}

	return (
		<GenericListLayout
			pageTitle={tUI("championList.title") || "Danh Sách Tướng PoC"}
			pageDescription={tUI("championList.pageDescription") || "Danh sách toàn bộ Tướng (Champions) trong chế độ Con Đường Anh Hùng (PoC) Legends of Runeterra. Tra cứu nhanh lối chơi, sức mạnh sao, và cổ vật khuyên dùng."}
			pageKeywords="danh sách tướng poc, champion list path of champions, tất cả tướng lor pve, poc champions, tra cứu tướng poc"
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
					key={champion.championID}
					to={`/champion/${generateSlug(champion.translations?.en?.name || champion.name)}`}
					className='hover:scale-[1.03] transition-transform duration-300 block'
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
