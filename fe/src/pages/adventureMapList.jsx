// src/pages/adventureMapList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GenericListLayout from "../components/layout/genericListLayout";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import DropdownFilter from "../components/common/dropdownFilter";
import { useTranslation } from "../hooks/useTranslation";
import { useMapFilters } from "../hooks/useMapFilters";
import { useGenericData } from "../hooks/useGenericData";

const MapSkeleton = () => (
	<div className='w-full h-48 bg-surface-hover animate-pulse rounded-xl border border-border'></div>
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
			<div className='flex justify-center py-20 text-red-500'>
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
					className='block h-full group'
				>
					<div className='bg-surface-bg border border-border rounded-xl overflow-hidden shadow-sm hover:border-primary-500 transition-all h-full'>
						<div className='relative w-full aspect-video bg-surface-hover'>
							<img
								src={item.assetAbsolutePath || "/fallback-image.svg"}
								alt={tDynamic(item, "adventureName")}
								className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
								onError={e => {
									e.target.src = "/fallback-image.svg";
								}}
							/>
							<div className='absolute top-2 right-2 bg-black/70 text-yellow-400 font-bold px-2 py-1 rounded text-sm backdrop-blur-sm shadow-md'>
								{item.difficulty} ★
							</div>
						</div>
						<div className='p-4'>
							<h3 className='font-bold text-lg text-text-primary group-hover:text-primary-500 line-clamp-1'>
								{tDynamic(item, "adventureName")}
							</h3>
							<p className='text-text-secondary text-sm mt-1 line-clamp-1'>
								{tDynamic(item, "typeAdventure")}
							</p>
							<div className='mt-3 flex justify-between items-center border-t border-border pt-3'>
								<span className='text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded'>
									XP: {item.championXP || 0}
								</span>
								<span className='text-xs text-text-secondary'>
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
						label={tUI("mapList.difficulty") || "Độ khó"}
						options={optionsMap.difficulty || []}
						selectedValues={state.customFilters?.difficulty || []}
						onChange={vals => actions.setFilterValue("difficulty", vals)}
						placeholder={tUI("mapList.allDifficulties") || "Tất cả độ khó"}
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
