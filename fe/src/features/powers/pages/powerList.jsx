// src/pages/powerList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

import { usePowerFilters } from "@/hooks/usePowerFilters";
import { useGenericData } from "@/hooks/useGenericData";

import GenericListLayout from "@/components/layout/genericListLayout";
import MultiSelectFilter from "@/components/common/multiSelectFilter";
import DropdownFilter from "@/components/common/dropdownFilter";
import RarityIcon from "@/components/common/rarityIcon";
import SafeImage from "@/components/common/SafeImage";
import MarkupRenderer from "@/components/common/MarkupRenderer";

const PowerSkeleton = () => (
	<div className='flex items-center gap-3.5 tactical-card p-3.5 clip-chamfer-sm border border-white/10 animate-pulse bg-white/5'>
		<div className='w-14 h-14 bg-white/10 clip-chamfer-sm shrink-0 border border-white/10' />
		<div className='flex-grow space-y-2.5'>
			<div className='h-5 w-3/4 bg-white/10 clip-chamfer-sm' />
			<div className='flex gap-2'>
				<div className='h-4 w-14 bg-white/5 clip-chamfer-sm' />
				<div className='h-4 w-20 bg-white/5 clip-chamfer-sm' />
			</div>
		</div>
	</div>
);

function PowerList() {
	const { tUI, t } = useTranslation();

	const [tempDynamicFilters, setTempDynamicFilters] = useState({
		rarities: [],
		types: [],
	});
	const [tempKnownPowers, setTempKnownPowers] = useState([]);

	const {
		state,
		actions,
		filterConfigs,
		sortOptions,
		queryParams,
		getTranslatedRarity,
	} = usePowerFilters(tUI, t, tempDynamicFilters, tempKnownPowers);

	const optionsMap =
		filterConfigs?.reduce((acc, config) => {
			acc[config.key] = config.options;
			return acc;
		}, {}) || {};

	const {
		dataList: powers,
		knownDict: knownPowers,
		loading,
		error,
		pagination,
		dynamicFilters,
	} = useGenericData("powers", queryParams, tUI, "powerCode");

	useEffect(() => {
		if (dynamicFilters && dynamicFilters !== tempDynamicFilters) {
			setTempDynamicFilters(dynamicFilters);
		}
	}, [dynamicFilters, tempDynamicFilters]);

	useEffect(() => {
		if (knownPowers && knownPowers !== tempKnownPowers) {
			setTempKnownPowers(knownPowers);
		}
	}, [knownPowers, tempKnownPowers]);

	if (error) {
		return (
			<div className='p-10 text-center text-red-500 font-bold'>{error}</div>
		);
	}

	return (
		<GenericListLayout
			pageTitle={tUI("powerList.title") || "Danh Sách Sức Mạnh PoC"}
			pageDescription={tUI("powerList.metaDesc") || "Tổng hợp tất cả Sức Mạnh (Powers) trong chế độ Con Đường Anh Hùng (PoC) Legends of Runeterra."}
			pageKeywords="danh sách sức mạnh poc, power list path of champions, tất cả power lor pve, poc powers"
			heading={tUI("powerList.heading")}
			data={powers}
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
			searchPlaceholder={tUI("powerList.placeholder")}
			onResetFilters={actions.handleResetFilters}
			isFiltered={!!state.searchTerm || Object.values(state.customFilters || {}).some(v => Array.isArray(v) ? v.length > 0 : !!v)}
			renderSkeleton={() => <PowerSkeleton />}
			renderItem={power => {
				const powerName = t(power, "name");
				const powerDesc = t(power, "description");
				const powerRarityTranslated = getTranslatedRarity(power.rarity, power);

				return (
					<Link
						to={`/power/${encodeURIComponent(power.powerCode)}`}
						className='group relative flex items-center gap-3.5 p-3 sm:p-3.5 tactical-card clip-chamfer-sm border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-cyan)] transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(0,245,212,0.18)]'
					>
						<div className='w-12 h-12 sm:w-14 sm:h-14 shrink-0 relative overflow-hidden clip-chamfer-sm bg-black/40 border border-[var(--tactical-card-border)] group-hover:border-[var(--tactical-accent-cyan)] transition-colors p-1 flex items-center justify-center'>
							<SafeImage
								src={power.assetAbsolutePath}
								alt={powerName}
								className='w-full h-full object-contain group-hover:scale-110 transition-transform duration-300'
								width={128}
								height={128}
							/>
						</div>
						<div className='flex-grow overflow-hidden'>
							<h3 className='font-display font-bold uppercase italic tracking-wide text-sm sm:text-base text-[var(--tactical-text-main)] group-hover:text-[var(--tactical-accent-cyan)] truncate transition-colors'>
								{powerName}
							</h3>
							<div className='flex items-center gap-2 text-xs font-mono-tech text-[var(--tactical-text-dim)] mt-1'>
								<RarityIcon rarity={power.rarity} />
								<span className='truncate uppercase'>{powerRarityTranslated}</span>
							</div>
						</div>
						{/* Tooltip hiển thị mô tả Tactical */}
						<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-80 p-4 bg-slate-950/95 backdrop-blur-md text-[var(--tactical-text-main)] text-xs clip-chamfer-sm shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 invisible group-hover:visible pointer-events-none z-50 border border-[var(--tactical-accent-cyan)]/40 leading-relaxed'>
							<div className='font-display font-bold text-sm text-[var(--tactical-accent-cyan)] mb-1 uppercase italic'>{powerName}</div>
							<MarkupRenderer text={powerDesc} />
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
					<MultiSelectFilter
						label={tUI("common.type")}
						options={optionsMap.types || []}
						selectedValues={state.customFilters?.types || []}
						onChange={vals => actions.setFilterValue("types", vals)}
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

export default PowerList;
