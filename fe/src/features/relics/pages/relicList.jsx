// src/pages/relicList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

// --- Import Custom Hooks ---
import { useRelicFilters } from "@/hooks/useRelicFilters"; // 🟢 Đảm bảo tên import trùng khớp
import { useGenericData } from "@/hooks/useGenericData";

// --- Import UI Components ---
import GenericListLayout from "@/components/layout/genericListLayout";
import MultiSelectFilter from "@/components/common/multiSelectFilter";
import DropdownFilter from "@/components/common/dropdownFilter";
import RarityIcon from "@/components/common/rarityIcon";
import SafeImage from "@/components/common/SafeImage";
import MarkupRenderer from "@/components/common/MarkupRenderer";

const RelicSkeleton = () => (
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

function RelicList() {
	const { tUI, t } = useTranslation();

	// Khởi tạo State trung gian để truyền dữ liệu giữa các Hook
	const [tempDynamicFilters, setTempDynamicFilters] = useState({
		rarities: [],
		types: [],
		stacks: [],
	});
	const [tempKnownRelics, setTempKnownRelics] = useState([]);

	// 1. Khởi tạo Hook Bộ lọc (Đã áp dụng cấu trúc Generic)
	const {
		state,
		actions,
		filterConfigs,
		sortOptions,
		queryParams,
		getTranslatedRarity,
	} = useRelicFilters(tUI, t, tempDynamicFilters, tempKnownRelics);

	// 🟢 Map lại mảng filterConfigs thành Object để GenericListLayout dễ đọc
	const optionsMap =
		filterConfigs?.reduce((acc, config) => {
			acc[config.key] = config.options;
			return acc;
		}, {}) || {};

	// 2. Khởi tạo Hook Dữ liệu (Dùng chung)
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
			pageTitle={tUI("relicList.title") || "Danh Sách Cổ Vật PoC"}
			pageDescription={tUI("relicList.metaDesc") || "Tổng hợp tất cả Cổ Vật (Relics) trong chế độ Con Đường Anh Hùng (PoC) Legends of Runeterra. Tra cứu kỹ năng và cách lấy cổ vật dễ dàng."}
			pageKeywords="danh sách cổ vật poc, relic list path of champions, cách lấy cổ vật lor, poc relics, lor pve relics"
			heading={tUI("relicList.heading")}
			// --- Quản lý Dữ liệu ---
			data={relics}
			loading={loading}
			pagination={pagination}
			currentPage={state.currentPage}
			onPageChange={actions.setCurrentPage}
			skeletonCount={9}
			// Prop tuỳ chỉnh lưới cho Relic
			gridClassName={showDesktopFilter =>
				`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${showDesktopFilter ? "xl:grid-cols-3" : "xl:grid-cols-4"}`
			}
			// --- Quản lý Tìm kiếm ---
			searchValue={state.searchInput}
			onSearchChange={actions.setSearchInput}
			onSearchSubmit={actions.handleSearch}
			searchPlaceholder={tUI("relicList.placeholder")}
			onResetFilters={actions.handleResetFilters}
			isFiltered={!!state.searchTerm || Object.values(state.customFilters || {}).some(v => Array.isArray(v) ? v.length > 0 : !!v)}
			// --- Render Props ---
			renderSkeleton={() => <RelicSkeleton />}
			renderItem={relic => {
				const relicName = t(relic, "name");
				const relicDesc = t(relic, "description") || t(relic, "descriptionRaw");
				const relicRarityTranslated = getTranslatedRarity(relic.rarity, relic);

				return (
					<Link
						to={`/relic/${encodeURIComponent(relic.relicCode || relic.itemCode)}`}
						className='group relative flex items-center gap-3.5 p-3 sm:p-3.5 tactical-card clip-chamfer-sm border border-[var(--tactical-card-border)] hover:border-[var(--tactical-accent-lime)] transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(210,255,40,0.18)]'
					>
						<div className='w-12 h-12 sm:w-14 sm:h-14 shrink-0 relative overflow-hidden clip-chamfer-sm bg-black/40 border border-[var(--tactical-card-border)] group-hover:border-[var(--tactical-accent-lime)] transition-colors p-1 flex items-center justify-center'>
							<SafeImage
								src={relic.assetAbsolutePath}
								alt={relicName}
								className='w-full h-full object-contain group-hover:scale-110 transition-transform duration-300'
								width={128}
								height={128}
							/>
						</div>
						<div className='flex-grow overflow-hidden'>
							<h3 className='font-display font-bold uppercase italic tracking-wide text-sm sm:text-base text-[var(--tactical-text-main)] group-hover:text-[var(--tactical-accent-lime)] truncate transition-colors'>
								{relicName}
							</h3>
							<div className='flex items-center gap-2 text-xs font-mono-tech text-[var(--tactical-text-dim)] mt-1'>
								<RarityIcon rarity={relic.rarity} />
								<span className='truncate uppercase'>{relicRarityTranslated}</span>
							</div>
						</div>
						{/* Tooltip hiển thị mô tả Tactical */}
						<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-80 p-4 bg-slate-950/95 backdrop-blur-md text-[var(--tactical-text-main)] text-xs clip-chamfer-sm shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 invisible group-hover:visible pointer-events-none z-50 border border-[var(--tactical-accent-lime)]/40 leading-relaxed'>
							<div className='font-display font-bold text-sm text-[var(--tactical-accent-lime)] mb-1 uppercase italic'>{relicName}</div>
							<MarkupRenderer text={relicDesc} />
						</div>
					</Link>
				);
			}}
			renderFilters={() => (
				<>
					{/* 🟢 Lấy option từ optionsMap và selectedValue từFilters */}
					<MultiSelectFilter
						label={tUI("common.rarity")}
						options={optionsMap.rarities || []}
						selectedValues={state.customFilters?.rarities || []}
						onChange={vals => actions.setFilterValue("rarities", vals)}
					/>

					{optionsMap.types && optionsMap.types.length > 0 && (
						<MultiSelectFilter
							label={tUI("common.type")}
							options={optionsMap.types}
							selectedValues={state.customFilters?.types || []}
							onChange={vals => actions.setFilterValue("types", vals)}
						/>
					)}

					{optionsMap.stacks && optionsMap.stacks.length > 0 && (
						<MultiSelectFilter
							label={tUI("common.stack")}
							options={optionsMap.stacks}
							selectedValues={state.customFilters?.stacks || []}
							onChange={vals => actions.setFilterValue("stacks", vals)}
						/>
					)}

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

export default RelicList;
