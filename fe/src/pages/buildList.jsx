// src/pages/buildList.jsx
import React, { useState, useMemo, useContext, useEffect } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { useTranslation } from "../hooks/useTranslation";

// --- Import Custom Hooks ---
import { useBuildFilters } from "../hooks/useBuildFilters";
import { useBuildData } from "../hooks/useBuildData";
import { useLazyMetadata } from "../hooks/useLazyMetadata";
import { useBatchFavoriteData } from "../hooks/useBatchFavoriteData";

// --- Import UI Components ---
import GenericListLayout from "../components/layout/genericListLayout";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import DropdownFilter from "../components/common/dropdownFilter";
import Button from "../components/common/button";
import BuildCreation from "../components/build/buildCreation";
import BuildSummary from "../components/build/buildSummary";
import { PlusCircle, Globe, Shield, Heart, Loader2 } from "lucide-react";

// --- Skeleton Component ---
const BuildSkeleton = () => (
	<div className='rounded-lg border border-border bg-surface-bg p-4 space-y-4 animate-pulse'>
		<div className='flex items-center gap-3'>
			<div className='w-12 h-12 bg-gray-700/50 rounded-full' />
			<div className='flex-1 space-y-2'>
				<div className='h-4 w-3/4 bg-gray-700/50 rounded' />
				<div className='h-3 w-1/2 bg-gray-700/50 rounded' />
			</div>
		</div>
		<div className='h-24 w-full bg-gray-700/50 rounded-md' />
		<div className='flex gap-2'>
			<div className='h-8 w-8 bg-gray-700/50 rounded-full' />
			<div className='h-8 w-8 bg-gray-700/50 rounded-full' />
			<div className='h-8 w-8 bg-gray-700/50 rounded-full' />
		</div>
	</div>
);

const Builds = () => {
	const { user, token } = useContext(AuthContext);
	const { tUI } = useTranslation();
	const { tab } = useParams();
	const navigate = useNavigate();

	// Xác định Tab hiện tại (Cộng đồng, Của tôi, Yêu thích)
	const activeTab = useMemo(() => {
		const validTabs = ["community", "my-builds", "favorites"];
		return validTabs.includes(tab) ? tab : "community";
	}, [tab]);

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [tempDynamicFilters, setTempDynamicFilters] = useState({});

	// --- 1. Khởi tạo Hook Quản lý Bộ lọc ---
	const { state, actions, filterOptions, queryParams } = useBuildFilters(
		tUI,
		tempDynamicFilters,
	);

	// --- 2. Khởi tạo Hook Data Fetching (Tự động đổi API theo Tab) ---
	const { builds, loading, error, pagination, dynamicFilters, refetch } =
		useBuildData(activeTab, queryParams, tUI, token);

	// Cập nhật filter options khi fetch được dữ liệu metadata từ backend
	useEffect(() => {
		if (dynamicFilters && dynamicFilters !== tempDynamicFilters) {
			setTempDynamicFilters(dynamicFilters);
		}
	}, [dynamicFilters, tempDynamicFilters]);

	// --- 3. Hook Quản lý Logic Yêu thích (Favorite) ---
	const { favoriteStatus, favoriteCounts, toggleFavorite } =
		useBatchFavoriteData(builds, token);

	const handleFavoriteToggle = async (buildId, newStatus, newCount) => {
		await toggleFavorite(buildId, newStatus, newCount);
		// Nếu đang ở tab Yêu thích và người dùng bỏ tim (unlike), ta cần gọi refetch để cập nhật lại danh sách ngay lập tức
		if (activeTab === "favorites" && !newStatus) {
			refetch();
		}
	};

	// --- 4. Hook Lazy Load Metadata (Chỉ gọi khi tạo Build) ---
	const { metadata, isLoadingMeta, fetchAllMetadata } = useLazyMetadata(tUI);
	useEffect(() => {
		fetchAllMetadata();
	}, [fetchAllMetadata]);

	// --- Handlers ---
	const changeTab = newTab => {
		actions.setCurrentPage(1); // Luôn về trang 1 khi đổi tab
		navigate(`/builds/${newTab}`);
	};

	const handleOpenCreateModal = async () => {
		await fetchAllMetadata();
		setShowCreateModal(true);
	};

	const handleCreateSuccess = () => {
		setShowCreateModal(false);
		refetch();
		navigate("/builds/my-builds");
	};

	const handleBuildDeleted = () => {
		refetch();
	};

	// --- Render Lỗi Nếu Có ---
	if (error) {
		return (
			<div className='p-10 text-center bg-danger-bg-light text-danger-text-dark rounded-lg m-6'>
				<p className='font-bold text-xl mb-4'>{error}</p>
				<Button onClick={() => window.location.reload()}>
					{tUI("common.ok")}
				</Button>
			</div>
		);
	}

	return (
		<>
			<GenericListLayout
				pageTitle={tUI("buildList.title")}
				pageDescription={tUI("metadata.defaultDescription")}
				heading={tUI("buildList.heading")}
				// --- Điều hướng Tabs ---
				customTabs={
					<div className='flex flex-wrap gap-2 border border-border p-1 rounded-lg w-fit mb-2 md:mb-0 bg-surface-bg shadow-sm'>
						<Button
							variant={activeTab === "community" ? "primary" : "ghost"}
							onClick={() => changeTab("community")}
							iconLeft={<Globe size={18} />}
						>
							{tUI("buildList.community")}
						</Button>
						{user && (
							<>
								<Button
									variant={activeTab === "my-builds" ? "primary" : "ghost"}
									onClick={() => changeTab("my-builds")}
									iconLeft={<Shield size={18} />}
								>
									{tUI("buildList.myBuilds")}
								</Button>
								<Button
									variant={activeTab === "favorites" ? "primary" : "ghost"}
									onClick={() => changeTab("favorites")}
									iconLeft={<Heart size={18} />}
								>
									{tUI("buildList.favorites")}
								</Button>
							</>
						)}
					</div>
				}
				// --- Nút Tạo Mới ---
				customHeaderActions={
					user ? (
						<Button
							variant='primary'
							onClick={handleOpenCreateModal}
							iconLeft={
								isLoadingMeta ? (
									<Loader2 className='animate-spin' size={20} />
								) : (
									<PlusCircle size={20} />
								)
							}
							disabled={isLoadingMeta}
						>
							{isLoadingMeta
								? tUI("common.loading")
								: tUI("buildList.createNew")}
						</Button>
					) : (
						<NavLink
							to='/auth'
							className='text-md font-bold text-primary-500 hover:underline flex items-center bg-primary-500/10 px-4 py-2 rounded-lg'
						>
							{tUI("buildList.loginToCreate")}
						</NavLink>
					)
				}
				// --- Quản lý Dữ liệu và Phân trang ---
				data={builds}
				loading={loading}
				pagination={pagination}
				currentPage={state.currentPage}
				onPageChange={actions.setCurrentPage}
				skeletonCount={6}
				// --- Quản lý Tìm kiếm ---
				searchValue={state.searchInput}
				onSearchChange={actions.setSearchInput}
				onSearchSubmit={actions.handleSearch}
				searchPlaceholder={tUI("buildList.searchPlaceholder")}
				onResetFilters={actions.handleResetFilters}
				// --- Render Logic ---
				renderSkeleton={() => <BuildSkeleton />}
				renderItem={build => (
					<BuildSummary
						key={build._id || build.id}
						build={build}
						// Truyền Metadata (sẽ rỗng lúc đầu, có data khi user đã gọi lazy load, nhưng BuildSummary không bị lỗi vì dữ liệu build gốc đã có đủ text hiển thị cơ bản)
						championsList={metadata.champions}
						relicsList={metadata.relics}
						powersList={metadata.powers}
						runesList={metadata.runes}
						// Props giao diện
						showDesktopFilter={state.showDesktopFilter}
						isFavoritePage={activeTab === "favorites"}
						// Props logic tương tác
						onBuildUpdate={refetch}
						onBuildDelete={handleBuildDeleted}
						onFavoriteToggle={handleFavoriteToggle}
						initialIsFavorited={!!favoriteStatus[build.id]}
						initialLikeCount={favoriteCounts[build.id] || build.like || 0}
					/>
				)}
				renderFilters={() => (
					<>
						<MultiSelectFilter
							label={tUI("buildList.starLevel")}
							options={filterOptions.starLevels}
							selectedValues={state.selectedStarLevels}
							onChange={actions.setSelectedStarLevels}
						/>
						<MultiSelectFilter
							label={tUI("championList.region")}
							options={filterOptions.regions}
							selectedValues={state.selectedRegions}
							onChange={actions.setSelectedRegions}
						/>
						<DropdownFilter
							label={tUI("championList.sortBy")}
							options={filterOptions.sort}
							selectedValue={state.sortBy}
							onChange={actions.setSortBy}
						/>
					</>
				)}
			/>

			{/* Modal Tạo Build - Hiển thị độc lập với Layout chung */}
			{showCreateModal && !isLoadingMeta && (
				<BuildCreation
					onConfirm={handleCreateSuccess}
					onClose={() => setShowCreateModal(false)}
					championsList={metadata.champions}
					relicsList={metadata.relics}
					powersList={metadata.powers}
					runesList={metadata.runes}
				/>
			)}
		</>
	);
};

export default Builds;
