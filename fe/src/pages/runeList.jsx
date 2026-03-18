// src/pages/runeList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

import { useRuneFilters } from "../hooks/useRuneFilters";
import { useGenericData } from "../hooks/useGenericData";

import GenericListLayout from "../components/layout/genericListLayout";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import DropdownFilter from "../components/common/dropdownFilter";
import RarityIcon from "../components/common/rarityIcon";
import SafeImage from "@/components/common/SafeImage";

const RuneSkeleton = () => (
	<div className='flex items-center gap-3 sm:gap-4 bg-surface-bg p-3 sm:p-4 rounded-lg border border-border animate-pulse'>
		<div className='w-12 h-12 sm:w-16 sm:h-16 bg-gray-700/50 rounded-md shrink-0' />
		<div className='flex-grow space-y-3'>
			<div className='h-5 w-2/3 bg-gray-700/50 rounded' />
			<div className='h-4 w-1/3 bg-gray-700/50 rounded' />
		</div>
	</div>
);

function RuneList() {
	const { tUI, t } = useTranslation();

	const [tempDynamicFilters, setTempDynamicFilters] = useState({
		rarities: [],
	});
	const [tempKnownRunes, setTempKnownRunes] = useState([]);

	const {
		state,
		actions,
		filterConfigs,
		sortOptions,
		queryParams,
		getTranslatedRarity,
	} = useRuneFilters(tUI, t, tempDynamicFilters, tempKnownRunes);

	const optionsMap =
		filterConfigs?.reduce((acc, config) => {
			acc[config.key] = config.options;
			return acc;
		}, {}) || {};

	const {
		dataList: runes,
		knownDict: knownRunes,
		loading,
		error,
		pagination,
		dynamicFilters,
	} = useGenericData("runes", queryParams, tUI, "runeCode");

	useEffect(() => {
		if (dynamicFilters && dynamicFilters !== tempDynamicFilters) {
			setTempDynamicFilters(dynamicFilters);
		}
	}, [dynamicFilters, tempDynamicFilters]);

	useEffect(() => {
		if (knownRunes && knownRunes !== tempKnownRunes) {
			setTempKnownRunes(knownRunes);
		}
	}, [knownRunes, tempKnownRunes]);

	if (error) {
		return (
			<div className='p-10 text-center text-red-500 font-bold'>{error}</div>
		);
	}

	return (
		<GenericListLayout
			pageTitle={tUI("runeList.title")}
			pageDescription={tUI("runeList.metaDesc")}
			heading={tUI("runeList.heading")}
			data={runes}
			loading={loading}
			pagination={pagination}
			currentPage={state.currentPage}
			onPageChange={actions.setCurrentPage}
			skeletonCount={9}
			gridClassName={showDesktopFilter =>
				`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${showDesktopFilter ? "xl:grid-cols-3" : "xl:grid-cols-4"}`
			}
			searchValue={state.searchInput}
			onSearchChange={actions.setSearchInput}
			onSearchSubmit={actions.handleSearch}
			searchPlaceholder={tUI("runeList.placeholder")}
			onResetFilters={actions.handleResetFilters}
			renderSkeleton={() => <RuneSkeleton />}
			renderItem={rune => {
				const runeName = t(rune, "name");
				const runeDesc = t(rune, "description");
				const runeRarityTranslated = getTranslatedRarity(rune.rarity, rune);

				return (
					<Link
						to={`/rune/${encodeURIComponent(rune.runeCode)}`}
						className='group relative flex items-center gap-3 sm:gap-4 bg-surface-bg p-2 sm:p-4 rounded-lg transition border border-border hover:border-primary-500'
					>
						<SafeImage
							src={rune.assetAbsolutePath}
							alt={runeName}
							className='w-12 h-12 sm:w-16 sm:h-16 shrink-0 object-cover rounded-md group transition-all'
						/>
						<div className='flex-grow overflow-hidden'>
							<h3 className='font-bold text-lg text-text-primary group-hover:text-primary-500 truncate'>
								{runeName}
							</h3>
							<div className='flex items-center gap-2 text-sm text-text-secondary'>
								<RarityIcon rarity={rune.rarity} />
								<span className='truncate'>{runeRarityTranslated}</span>
							</div>
						</div>
						<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 p-4 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 invisible group-hover:visible pointer-events-none z-50 border border-white/10'>
							<p className='whitespace-pre-wrap leading-relaxed'>{runeDesc}</p>
							<div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900/95'></div>
						</div>
					</Link>
				);
			}}
			renderFilters={() => (
				<>
					<MultiSelectFilter
						label={tUI("common.rarity")}
						options={optionsMap.rarities || []}
						selectedValues={state.customFilters?.rarities || []}
						onChange={vals => actions.setFilterValue("rarities", vals)}
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

export default RuneList;
