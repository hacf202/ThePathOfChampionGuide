// src/pages/BossListPage.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useBossFilters } from "../hooks/useBossFilters";
import { useGenericData } from "../hooks/useGenericData";

import GenericListLayout from "../components/layout/genericListLayout";
import BossListItem from "../components/boss/BossListItem";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import DropdownFilter from "../components/common/dropdownFilter";

const BossSkeleton = () => (
	<div className='flex items-center gap-3 sm:gap-4 bg-surface-bg p-3 sm:p-4 rounded-xl border border-border animate-pulse'>
		<div className='w-14 h-14 sm:w-16 sm:h-16 bg-gray-700/50 rounded-lg shrink-0' />
		<div className='flex-grow space-y-3'>
			<div className='h-5 w-2/3 bg-gray-700/50 rounded' />
			<div className='h-4 w-1/3 bg-gray-700/50 rounded' />
		</div>
	</div>
);

function BossListPage() {
	const { tUI, tDynamic } = useTranslation();

	// 1. Quản lý trạng thái bộ lọc động từ dữ liệu đã tải
	const [tempDynamicFilters, setTempDynamicFilters] = useState({
		regions: [],
	});
	const [tempKnownBosses, setTempKnownBosses] = useState([]);

	// 2. Sử dụng hook lọc chuyên dụng cho Boss
	const {
		state,
		actions,
		filterConfigs,
		sortOptions,
		queryParams,
	} = useBossFilters(tUI, tDynamic, tempDynamicFilters, tempKnownBosses);

	// 🟢 Map filterConfigs về dạng Object để dễ sử dụng ở UI
	const optionsMap =
		filterConfigs?.reduce((acc, config) => {
			acc[config.key] = config.options;
			return acc;
		}, {}) || {};

	// 3. Lấy dữ liệu Boss từ API
	const {
		dataList: bosses,
		knownDict: knownBosses,
		loading,
		error,
		pagination,
		dynamicFilters,
	} = useGenericData("bosses", queryParams, tUI, "bossID");

	// Đồng bộ dữ liệu động để lọc
	useEffect(() => {
		if (dynamicFilters && dynamicFilters !== tempDynamicFilters) {
			setTempDynamicFilters(dynamicFilters);
		}
	}, [dynamicFilters, tempDynamicFilters]);

	useEffect(() => {
		if (knownBosses && knownBosses !== tempKnownBosses) {
			setTempKnownBosses(knownBosses);
		}
	}, [knownBosses, tempKnownBosses]);

	if (error) {
		return (
			<div className='flex justify-center py-20 text-red-500 font-secondary font-bold'>
				{error}
			</div>
		);
	}

	return (
		<GenericListLayout
			pageTitle={tUI("bossList.pageTitle") || "Boss Encyclopedia"}
			pageDescription={tUI("bossList.pageDescription") || "Tra cứu thông tin, sức mạnh và mẹo đối đầu với các Boss trong Path of Champions."}
			heading={tUI("bossList.heading") || "Boss Encyclopedia"}
			
			data={bosses}
			loading={loading}
			pagination={pagination}
			currentPage={state.currentPage}
			onPageChange={actions.setCurrentPage}

			searchValue={state.searchInput}
			onSearchChange={actions.setSearchInput}
			onSearchSubmit={actions.handleSearch}
			searchPlaceholder={tUI("bossList.searchPlaceholder") || "Tìm tên Boss..."}
			
			onResetFilters={actions.handleResetFilters}
			renderSkeleton={() => <BossSkeleton />}
			skeletonCount={12}
			emptyMessage={tUI("bossList.notFound") || "Không tìm thấy Boss nào."}
			
			// Giao diện lưới giống Item List: 1 cột trên mobile, 2 cột trên md, 4 cột trên xl
			gridClassName={(showFilter) => 
				`grid-cols-1 sm:grid-cols-2 ${showFilter ? "xl:grid-cols-3" : "xl:grid-cols-4"}`
			}

			renderItem={(boss) => (
				<BossListItem boss={boss} />
			)}
			
			renderFilters={() => (
				<>
					{/* Sắp xếp */}
					<DropdownFilter
						label={tUI("championList.sortBy") || "Sắp xếp theo"}
						options={sortOptions || []}
						selectedValue={state.sortOrder}
						onChange={actions.setSortOrder}
					/>
				</>
			)}
		/>
	);
}

export default BossListPage;
