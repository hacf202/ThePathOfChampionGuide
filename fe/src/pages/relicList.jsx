// src/pages/relicList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

// --- Import Custom Hooks ---
import { useRelicFilters } from "../hooks/useRelicFilter";
import { useGenericData } from "../hooks/useGenericData"; // 🟢 Sử dụng Hook Data gộp

// --- Import UI Components ---
import GenericListLayout from "../components/layout/genericListLayout";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import DropdownFilter from "../components/common/dropdownFilter";
import RarityIcon from "../components/common/rarityIcon";
import SafeImage from "@/components/common/SafeImage";

const RelicSkeleton = () => (
	<div className='flex items-center gap-3 sm:gap-4 bg-surface-bg p-3 sm:p-4 rounded-lg border border-border animate-pulse'>
		<div className='w-12 h-12 sm:w-16 sm:h-16 bg-gray-700/50 rounded-md shrink-0' />
		<div className='flex-grow space-y-3'>
			<div className='h-5 w-2/3 bg-gray-700/50 rounded' />
			<div className='h-4 w-1/3 bg-gray-700/50 rounded' />
		</div>
	</div>
);

function RelicList() {
	const { tUI, t } = useTranslation();

	// Khởi tạo State trung gian để truyền dữ liệu giữa các Hook
	const [tempDynamicFilters, setTempDynamicFilters] = useState({
		rarities: [],
		types: [],
		stacks: [],
	});
	const [tempKnownRelics, setTempKnownRelics] = useState([]);

	// 1. Khởi tạo Hook Bộ lọc
	const { state, actions, filterOptions, queryParams, getTranslatedRarity } =
		useRelicFilters(tUI, t, tempDynamicFilters, tempKnownRelics);

	// 2. Khởi tạo Hook Dữ liệu (Dùng chung)
	// Gọi API /api/relics, và định danh thẻ bằng trường "relicCode"
	const {
		dataList: relics,
		knownDict: knownRelics,
		loading,
		error,
		pagination,
		dynamicFilters,
	} = useGenericData("relics", queryParams, tUI, "relicCode");

	// 3. Đồng bộ dữ liệu mới fetch được vào bộ lọc
	useEffect(() => {
		if (dynamicFilters && dynamicFilters !== tempDynamicFilters) {
			setTempDynamicFilters(dynamicFilters);
		}
	}, [dynamicFilters, tempDynamicFilters]);

	useEffect(() => {
		if (knownRelics && knownRelics !== tempKnownRelics) {
			setTempKnownRelics(knownRelics);
		}
	}, [knownRelics, tempKnownRelics]);

	if (error) {
		return (
			<div className='p-10 text-center text-red-500 font-bold'>{error}</div>
		);
	}

	return (
		<GenericListLayout
			pageTitle={tUI("relicList.title")}
			pageDescription={tUI("relicList.metaDesc")}
			heading={tUI("relicList.heading")}
			// --- Quản lý Dữ liệu ---
			data={relics}
			loading={loading}
			pagination={pagination}
			currentPage={state.currentPage}
			onPageChange={actions.setCurrentPage}
			skeletonCount={9}
			// 🟢 Prop tuỳ chỉnh lưới cho Relic (Giống Power/Item)
			gridClassName={showDesktopFilter =>
				`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${showDesktopFilter ? "xl:grid-cols-3" : "xl:grid-cols-4"}`
			}
			// --- Quản lý Tìm kiếm ---
			searchValue={state.searchInput}
			onSearchChange={actions.setSearchInput}
			onSearchSubmit={actions.handleSearch}
			searchPlaceholder={tUI("relicList.placeholder")}
			onResetFilters={actions.handleResetFilters}
			// --- Render Props ---
			renderSkeleton={() => <RelicSkeleton />}
			renderItem={relic => {
				const relicName = t(relic, "name");
				const relicDesc = t(relic, "descriptionRaw") || t(relic, "description");
				const relicRarityTranslated = getTranslatedRarity(relic.rarity, relic);

				return (
					<Link
						to={`/relic/${encodeURIComponent(relic.relicCode || relic.itemCode)}`}
						className='group relative flex items-center gap-3 sm:gap-4 bg-surface-bg p-2 sm:p-4 rounded-lg transition border border-border hover:border-primary-500'
					>
						<SafeImage
							src={relic.assetAbsolutePath}
							alt={relicName}
							className='w-12 h-12 sm:w-16 sm:h-16 shrink-0 object-cover rounded-md group transition-all'
						/>
						<div className='flex-grow overflow-hidden'>
							<h3 className='font-bold text-lg text-text-primary group-hover:text-primary-500 truncate'>
								{relicName}
							</h3>
							<div className='flex items-center gap-2 text-sm text-text-secondary'>
								<RarityIcon rarity={relic.rarity} />
								<span className='truncate'>{relicRarityTranslated}</span>
							</div>
						</div>
						{/* Tooltip hiển thị mô tả */}
						<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 p-4 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 invisible group-hover:visible pointer-events-none z-50 border border-white/10'>
							<p className='whitespace-pre-wrap leading-relaxed'>{relicDesc}</p>
							<div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900/95'></div>
						</div>
					</Link>
				);
			}}
			renderFilters={() => (
				<>
					<MultiSelectFilter
						label={tUI("common.rarity")}
						options={filterOptions.rarities}
						selectedValues={state.selectedRarities}
						onChange={actions.setSelectedRarities}
					/>
					{filterOptions.types.length > 0 && (
						<MultiSelectFilter
							label={tUI("common.type")}
							options={filterOptions.types}
							selectedValues={state.selectedTypes}
							onChange={actions.setSelectedTypes}
						/>
					)}
					{filterOptions.stacks.length > 0 && (
						<MultiSelectFilter
							label={tUI("common.stack")}
							options={filterOptions.stacks}
							selectedValues={state.selectedStacks}
							onChange={actions.setSelectedStacks}
						/>
					)}
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

export default RelicList;
