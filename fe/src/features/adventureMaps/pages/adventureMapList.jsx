// src/pages/adventureMapList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GenericListLayout from "@/components/layout/genericListLayout";
import MultiSelectFilter from "@/components/common/multiSelectFilter";
import DropdownFilter from "@/components/common/dropdownFilter";
import { useTranslation } from "@/hooks/useTranslation";
import { useMapFilters } from "@/hooks/useMapFilters";
import { useGenericData } from "@/hooks/useGenericData";

import SafeImage from "@/components/common/SafeImage";

const MapSkeleton = () => (
	<div className='w-full aspect-[16/11] tactical-card animate-pulse clip-chamfer border border-white/10 bg-white/5'></div>
);

export default function MapList() {
	const { tUI, tDynamic } = useTranslation();

	const [filtersData, setFiltersData] = useState(null);

	const { state, actions, filterConfigs, sortOptions, queryParams } =
		useMapFilters(tUI, filtersData);

	const optionsMap =
		filterConfigs?.reduce((acc, config) => {
			acc[config.key] = config.options;
			return acc;
		}, {}) || {};

	const { dataList: adventures, loading, error, pagination, dynamicFilters } =
		useGenericData("adventures", queryParams, tUI, "adventureID");

	useEffect(() => {
		if (dynamicFilters && Object.keys(dynamicFilters).length > 0) {
			setFiltersData(dynamicFilters);
		}
	}, [dynamicFilters]);

	if (error) {
		return (
			<div className='flex justify-center py-20 text-red-500 font-mono-tech'>
				{error.message || tUI("common.error")}
			</div>
		);
	}

	return (
		<GenericListLayout
			pageTitle={tUI("mapList.pageTitle") || "Danh Sách Bản Đồ"}
			pageDescription={
				tUI("mapList.pageDescription") ||
				"Tổng hợp tất cả bản đồ (Adventures) và Boss trong trò chơi."
			}
			heading={tUI("mapList.pageTitle") || "Danh Sách Bản Đồ"}
			data={adventures}
			loading={loading}
			pagination={pagination}
			currentPage={state.currentPage}
			onPageChange={actions.setCurrentPage}
			searchValue={state.searchInput || ""}
			onSearchChange={actions.setSearchInput}
			onSearchSubmit={actions.handleSearch}
			searchPlaceholder={tUI("mapList.searchPlaceholder") || "Tìm kiếm bản đồ..."}
			onResetFilters={actions.handleResetFilters}
			renderSkeleton={() => <MapSkeleton />}
			renderItem={item => (
				<Link
					key={item.adventureID}
					to={`/map/${item.adventureID}`}
					className='block h-full group focus:outline-none'
				>
					<div className='tactical-card border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-cyan)] clip-chamfer overflow-hidden shadow-lg transition-all duration-300 h-full flex flex-col hover:shadow-[0_0_25px_rgba(0,245,212,0.2)] hover:-translate-y-1'>
						<div className='relative w-full aspect-video bg-black/40 overflow-hidden'>
							<SafeImage
								src={item.assetAbsolutePath || "/fallback-image.svg"}
								alt={tDynamic(item, "adventureName")}
								className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
							/>
							<div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent' />
							<div className='absolute top-3 right-3 bg-black/85 border border-amber-400/50 text-amber-400 font-mono-tech font-bold px-2.5 py-0.5 clip-chamfer-sm text-xs backdrop-blur-md shadow-md flex items-center gap-1'>
								<span>{item.difficulty}</span>
								<span>★</span>
							</div>
						</div>
						<div className='p-4 sm:p-5 flex-1 flex flex-col justify-between'>
							<div>
								<h3 className='font-display font-black text-lg sm:text-xl text-[var(--tactical-text-main)] group-hover:text-[var(--tactical-accent-cyan)] line-clamp-1 uppercase italic tracking-wide transition-colors'>
									{tDynamic(item, "adventureName")}
								</h3>
								<p className='text-[var(--tactical-text-dim)] font-mono-tech text-xs mt-1 line-clamp-1 uppercase tracking-wider'>
									{tDynamic(item, "typeAdventure")}
								</p>
							</div>
							<div className='mt-4 flex justify-between items-center border-t border-[var(--tactical-stroke-color)] pt-3 text-xs font-mono-tech'>
								<span className='px-2 py-0.5 bg-[var(--tactical-accent-lime)]/15 border border-[var(--tactical-accent-lime)]/40 text-[var(--tactical-accent-lime-fg)] font-bold clip-chamfer-sm'>
									XP: {item.championXP || 0}
								</span>
								<span className='text-[var(--tactical-text-sub)] uppercase font-semibold'>
									{item.Bosses?.length || 0} {tUI("mapList.bosses") || "Bosses"}
								</span>
							</div>
						</div>
					</div>
				</Link>
			)}
			renderFilters={() => (
				<>
					<MultiSelectFilter
						label={tUI("mapList.difficulty")}
						options={optionsMap.difficulty || []}
						selectedValues={state.customFilters?.difficulty || []}
						onChange={vals => actions.setFilterValue("difficulty", vals)}
						placeholder={tUI("mapList.allDifficulties") || "Tất cả độ khó"}
					/>
					<MultiSelectFilter
						label={tUI("mapList.type")}
						options={optionsMap.type || []}
						selectedValues={state.customFilters?.type || []}
						onChange={vals => actions.setFilterValue("type", vals)}
						placeholder={tUI("mapList.allTypes") || "Tất cả loại"}
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
