// src/pages/buildList.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BuildCreation from "../components/build/buildCreation";
import MyBuilds from "../components/build/myBuilds";
import MyFavorite from "../components/build/myFavoriteBuild";
import CommunityBuilds from "../components/build/communityBuilds";
import { AuthContext } from "../context/AuthContext.jsx";
import { useTranslation } from "../hooks/useTranslation"; // 🟢 Import Hook Đa ngôn ngữ
import {
	PlusCircle,
	Globe,
	Shield,
	Heart,
	Search,
	RotateCw,
	ChevronDown,
	ChevronUp,
	ChevronLeft,
	ChevronRight,
	Loader2,
} from "lucide-react";
import Button from "../components/common/button";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import InputField from "../components/common/inputField";
import DropdownFilter from "../components/common/dropdownFilter";
import PageTitle from "../components/common/pageTitle";
import iconRegionsData from "../assets/data/iconRegions.json";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { usePersistentState } from "../hooks/usePersistentState";

// === CACHE CONFIG ===
const CACHE_KEY_PREFIX = "buildsCache_v1";
const CACHE_DURATION = 5 * 60 * 1000;

// Hàm tạo tùy chọn sắp xếp đa ngôn ngữ
const getSortOptions = language => [
	{ value: "createdAt-desc", label: language === "vi" ? "Mới nhất" : "Newest" },
	{ value: "createdAt-asc", label: language === "vi" ? "Cũ nhất" : "Oldest" },
	{
		value: "championName-asc",
		label: language === "vi" ? "Tên tướng (A-Z)" : "Champion (A-Z)",
	},
	{
		value: "championName-desc",
		label: language === "vi" ? "Tên tướng (Z-A)" : "Champion (Z-A)",
	},
	{
		value: "like-desc",
		label: language === "vi" ? "Lượt thích (Cao nhất)" : "Most Liked",
	},
	{
		value: "like-asc",
		label: language === "vi" ? "Lượt thích (Thấp nhất)" : "Least Liked",
	},
	{
		value: "views-desc",
		label: language === "vi" ? "Lượt xem (Nhiều nhất)" : "Most Viewed",
	},
];

const getCacheKey = (tab, filters) => {
	const filterStr = JSON.stringify({
		search: filters.searchTerm || "",
		stars: filters.selectedStarLevels || [],
		regions: filters.selectedRegions || [],
		sort: filters.sortBy || "createdAt-desc",
		page: filters.currentPage || 1, // Thêm trang vào cache key
	});
	return `${CACHE_KEY_PREFIX}_${tab}_${filterStr}`;
};

const getCachedData = key => {
	try {
		const cached = localStorage.getItem(key);
		if (!cached) return null;
		const { data, timestamp } = JSON.parse(cached);
		if (Date.now() - timestamp > CACHE_DURATION) {
			localStorage.removeItem(key);
			return null;
		}
		return data;
	} catch (err) {
		console.warn("Lỗi đọc cache:", err);
		return null;
	}
};

const setCachedData = (key, data) => {
	try {
		const cacheObj = { data, timestamp: Date.now() };
		localStorage.setItem(key, JSON.stringify(cacheObj));
	} catch (err) {
		console.warn("Không thể lưu cache:", err);
	}
};

const clearAllBuildsCache = () => {
	Object.keys(localStorage)
		.filter(key => key.startsWith(CACHE_KEY_PREFIX))
		.forEach(key => localStorage.removeItem(key));
};

const Builds = () => {
	const { user } = useContext(AuthContext);
	const { language, t } = useTranslation(); // 🟢 Khởi tạo Hook Đa ngôn ngữ
	const { tab } = useParams();
	const navigate = useNavigate();

	const activeTab = useMemo(() => {
		const validTabs = ["community", "my-builds", "favorites"];
		return validTabs.includes(tab) ? tab : "community";
	}, [tab]);

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	// === FILTER STATE (PERSISTENT) ===
	const [searchInput, setSearchInput] = usePersistentState(
		"buildsSearchInput",
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"buildsSearchTerm",
		"",
	);
	const [selectedStarLevels, setSelectedStarLevels] = usePersistentState(
		"buildsSelectedStarLevels",
		[],
	);
	const [selectedRegions, setSelectedRegions] = usePersistentState(
		"buildsSelectedRegions",
		[],
	);
	const [sortBy, setSortBy] = usePersistentState(
		"buildsSortBy",
		"createdAt-desc",
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"buildsCurrentPage",
		1,
	);
	const [isFilterOpen, setIsFilterOpen] = usePersistentState(
		"buildsIsFilterOpen",
		false,
	);
	const [showDesktopFilter, setShowDesktopFilter] = usePersistentState(
		"buildsShowDesktopFilter",
		false,
	);

	// === DATA STATE ===
	const [championsList, setChampionsList] = useState([]);
	const [relicsList, setRelicsList] = useState([]);
	const [powersList, setPowersList] = useState([]);
	const [runesList, setRunesList] = useState([]);
	const [iconRegions, setIconRegions] = useState([]);
	const [loadingData, setLoadingData] = useState(true);
	const [errorData, setErrorData] = useState(null);

	// Tùy chọn sắp xếp (Cập nhật khi đổi ngôn ngữ)
	const sortOptions = useMemo(() => getSortOptions(language), [language]);

	// === LOGIC PHÍM TẮT (Global) ===
	useEffect(() => {
		const handleKeyDown = event => {
			if (event.key === "Tab") {
				event.preventDefault();
				setShowDesktopFilter(prev => !prev);
				return;
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [setShowDesktopFilter]);

	// === FETCH METADATA ===
	useEffect(() => {
		const fetchAllData = async () => {
			setLoadingData(true);
			setErrorData(null);
			try {
				const apiUrl = import.meta.env.VITE_API_URL;
				const fetchOptions = "?page=1&limit=1000";
				const [champRes, relicRes, powerRes, runeRes] = await Promise.all([
					fetch(`${apiUrl}/api/champions${fetchOptions}`),
					fetch(`${apiUrl}/api/relics${fetchOptions}`),
					// 🟢 Thêm types=General%20Power để lọc ở Backend
					fetch(`${apiUrl}/api/powers${fetchOptions}&types=General%20Power`),
					fetch(`${apiUrl}/api/runes${fetchOptions}`),
				]);
				if (!champRes.ok || !relicRes.ok || !powerRes.ok || !runeRes.ok)
					throw new Error(
						language === "vi" ? "Lỗi tải dữ liệu" : "Data loading error",
					);
				const [champData, relicData, powerData, runeData] = await Promise.all([
					champRes.json(),
					relicRes.json(),
					powerRes.json(),
					runeRes.json(),
				]);
				setChampionsList(champData.items || []);
				setRelicsList(relicData.items || []);
				setPowersList(powerData.items || []);
				setRunesList(runeData.items || []);
				setIconRegions(iconRegionsData);
			} catch (err) {
				setErrorData(err.message);
			} finally {
				setLoadingData(false);
			}
		};
		fetchAllData();
	}, [language]);

	// Tạo Map theo chuẩn Mã ID (powerCode) và dịch tên tự động
	const powerMap = useMemo(
		() => new Map(powersList.map(p => [p.powerCode, t(p, "name")])),
		[powersList, language, t],
	);

	const championNameToRegionsMap = useMemo(() => {
		const map = new Map();
		championsList.forEach(
			c => c.name && Array.isArray(c.regions) && map.set(c.name, c.regions),
		);
		return map;
	}, [championsList]);

	const regionOptions = useMemo(() => {
		const allRegions = championsList.flatMap(c => c.regions || []);
		return [...new Set(allRegions)].sort().map(name => ({
			value: name,
			label: name,
			iconUrl:
				iconRegions.find(r => r.name === name)?.iconAbsolutePath ??
				"/fallback-image.svg",
		}));
	}, [championsList, iconRegions]);

	const starLevelOptions = useMemo(
		() =>
			[1, 2, 3, 4, 5, 6, 7].map(s => ({
				value: s.toString(),
				label: "",
				isStar: true,
			})),
		[],
	);

	// === HANDLERS ===
	const handleSearch = () => {
		setSearchTerm(searchInput);
		setCurrentPage(1); // Luôn về trang 1 khi tìm kiếm mới
		if (window.innerWidth < 1024) setIsFilterOpen(false);
	};

	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedStarLevels([]);
		setSelectedRegions([]);
		setSortBy("createdAt-desc");
		setCurrentPage(1); // Đưa về trang đầu tiên
	};

	const triggerRefresh = () => {
		clearAllBuildsCache();
		setRefreshKey(prev => prev + 1);
	};

	const handleCreateSuccess = () => {
		setShowCreateModal(false);
		triggerRefresh();
		navigate("/builds/my-builds");
	};

	const changeTab = newTab => {
		setCurrentPage(1); // Về trang 1 khi chuyển tab
		navigate(`/builds/${newTab}`);
	};

	const cacheUtils = {
		getCache: tabName =>
			getCachedData(
				getCacheKey(tabName, {
					searchTerm,
					selectedStarLevels,
					selectedRegions,
					sortBy,
					currentPage,
				}),
			),
		setCache: (tabName, data) =>
			setCachedData(
				getCacheKey(tabName, {
					searchTerm,
					selectedStarLevels,
					selectedRegions,
					sortBy,
					currentPage,
				}),
				data,
			),
		clearCache: clearAllBuildsCache,
	};

	const commonProps = {
		searchTerm,
		selectedStarLevels: selectedStarLevels.join(","),
		selectedRegions: selectedRegions.join(","),
		sortBy,
		currentPage,
		setCurrentPage,
		championsList,
		relicsList,
		powersList,
		runesList,
		refreshKey,
		powerMap,
		championNameToRegionsMap,
		showDesktopFilter,
		onEditSuccess: triggerRefresh,
		onDeleteSuccess: triggerRefresh,
		onFavoriteToggle: triggerRefresh,
		...cacheUtils,
	};

	const renderContent = () => {
		if (loadingData)
			return (
				<div className='flex justify-center items-center h-64'>
					<Loader2 className='animate-spin text-primary-500' size={48} />
				</div>
			);
		if (errorData)
			return (
				<div className='text-center p-10 bg-danger-bg-light text-danger-text-dark rounded-lg'>
					<p>{errorData}</p>
					<Button onClick={() => window.location.reload()}>
						{language === "vi" ? "Tải lại" : "Retry"}
					</Button>
				</div>
			);

		switch (activeTab) {
			case "community":
				return <CommunityBuilds {...commonProps} />;
			case "my-builds":
				return user ? (
					<MyBuilds {...commonProps} />
				) : (
					<p className='text-center p-4'>
						{language === "vi"
							? "Vui lòng đăng nhập."
							: "Please login to view."}
					</p>
				);
			case "favorites":
				return user ? (
					<MyFavorite {...commonProps} />
				) : (
					<p className='text-center p-4'>
						{language === "vi"
							? "Vui lòng đăng nhập."
							: "Please login to view."}
					</p>
				);
			default:
				return <CommunityBuilds {...commonProps} />;
		}
	};

	return (
		<div className='animate-fadeIn'>
			<PageTitle
				title={language === "vi" ? "Danh sách bộ cổ vật" : "Relic Builds List"}
				description={
					language === "vi"
						? "Khám phá các build tối ưu cho POC."
						: "Discover optimized builds for POC."
				}
			/>
			<div className='font-secondary'>
				<div className='flex justify-between items-center mb-2 md:mb-6'>
					<h1 className='text-3xl font-bold text-text-primary font-primary animate-glitch'>
						{language === "vi" ? "Danh Sách Bộ Cổ Vật" : "Relic Builds List"}
					</h1>
					<div className='hidden lg:flex items-center gap-4'>
						<Button
							variant='outline'
							onClick={() => setShowDesktopFilter(!showDesktopFilter)}
							className='flex items-center gap-2'
						>
							{showDesktopFilter ? (
								<ChevronRight size={18} />
							) : (
								<ChevronLeft size={18} />
							)}
							{showDesktopFilter
								? language === "vi"
									? "Ẩn bộ lọc"
									: "Hide Filters"
								: language === "vi"
									? "Hiện bộ lọc"
									: "Show Filters"}
						</Button>
					</div>
				</div>

				<div className='flex flex-wrap justify-between gap-2 border border-border mb-2'>
					<div className='flex gap-1'>
						<Button
							variant={activeTab === "community" ? "primary" : "ghost"}
							onClick={() => changeTab("community")}
							iconLeft={<Globe size={18} />}
						>
							{language === "vi" ? "Cộng Đồng" : "Community"}
						</Button>
						{user && (
							<>
								<Button
									variant={activeTab === "my-builds" ? "primary" : "ghost"}
									onClick={() => changeTab("my-builds")}
									iconLeft={<Shield size={18} />}
								>
									{language === "vi" ? "Của Tôi" : "My Builds"}
								</Button>
								<Button
									variant={activeTab === "favorites" ? "primary" : "ghost"}
									onClick={() => changeTab("favorites")}
									iconLeft={<Heart size={18} />}
								>
									{language === "vi" ? "Yêu Thích" : "Favorites"}
								</Button>
							</>
						)}
					</div>
					{user ? (
						<Button
							variant='primary'
							onClick={() => setShowCreateModal(true)}
							iconLeft={<PlusCircle size={20} />}
						>
							{language === "vi" ? "Tạo Mới" : "Create New"}
						</Button>
					) : (
						<NavLink
							to='/auth'
							className='text-md font-bold text-primary-500 hover:underline flex items-center'
						>
							{language === "vi" ? "Đăng Nhập Để Tạo" : "Login to Create"}
						</NavLink>
					)}
				</div>

				<div className='flex flex-col lg:flex-row items-start'>
					<div
						className={`w-full transition-[flex] duration-300 ease-in-out ${
							showDesktopFilter ? "lg:flex-[3]" : "lg:flex-[1]"
						}`}
					>
						<div className='bg-surface-bg rounded-lg border border-border p-2 sm:p-4 shadow-sm min-h-[500px] relative overflow-hidden'>
							{renderContent()}
						</div>
					</div>

					<AnimatePresence initial={false}>
						{showDesktopFilter && (
							<motion.aside
								key='desktop-filter'
								initial={{ width: 0, opacity: 0, marginLeft: 0 }}
								animate={{
									width: "auto",
									opacity: 1,
									marginLeft: "2rem",
								}}
								exit={{ width: 0, opacity: 0, marginLeft: 0 }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
								className='hidden lg:block sticky top-24 h-fit overflow-hidden'
							>
								<div className='w-[280px] xl:w-[320px] p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
									<label className='block text-sm font-medium text-text-secondary'>
										{language === "vi" ? "Tìm kiếm" : "Search"}
									</label>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyDown={e => e.key === "Enter" && handleSearch()}
										placeholder={
											language === "vi"
												? "Tên tướng, cổ vật..."
												: "Champion, relic..."
										}
									/>
									<Button onClick={handleSearch} className='w-full mt-2'>
										<Search size={16} className='mr-2' />
										{language === "vi" ? "Tìm kiếm" : "Search"}
									</Button>
									<MultiSelectFilter
										label={language === "vi" ? "Cấp sao" : "Star Level"}
										options={starLevelOptions}
										selectedValues={selectedStarLevels}
										onChange={setSelectedStarLevels}
									/>
									<MultiSelectFilter
										label={language === "vi" ? "Khu vực" : "Region"}
										options={regionOptions}
										selectedValues={selectedRegions}
										onChange={setSelectedRegions}
									/>
									<DropdownFilter
										label={language === "vi" ? "Sắp xếp" : "Sort By"}
										options={sortOptions}
										selectedValue={sortBy}
										onChange={setSortBy}
									/>
									<Button
										variant='outline'
										onClick={handleResetFilters}
										className='w-full'
									>
										<RotateCw size={16} className='mr-2' />
										{language === "vi" ? "Đặt lại bộ lọc" : "Reset Filters"}
									</Button>
								</div>
							</motion.aside>
						)}
					</AnimatePresence>

					<div className='lg:hidden w-full p-2 mb-4 rounded-lg border border-border bg-surface-bg shadow-sm order-first'>
						<div className='flex items-center gap-2'>
							<div className='flex-1 relative min-w-0'>
								<InputField
									value={searchInput}
									onChange={e => setSearchInput(e.target.value)}
									onKeyDown={e => e.key === "Enter" && handleSearch()}
									placeholder={
										language === "vi"
											? "Tìm tướng, cổ vật..."
											: "Champion, relic..."
									}
								/>
							</div>
							<Button onClick={handleSearch} className='px-3'>
								<Search size={18} />
							</Button>
							<Button
								variant='outline'
								onClick={handleResetFilters}
								className='px-3'
							>
								<RotateCw size={18} />
							</Button>
							<Button
								variant='outline'
								onClick={() => setIsFilterOpen(!isFilterOpen)}
								className='px-3'
							>
								{isFilterOpen ? (
									<ChevronUp size={18} />
								) : (
									<ChevronDown size={18} />
								)}
							</Button>
						</div>
						<AnimatePresence>
							{isFilterOpen && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									className='overflow-hidden'
								>
									<div className='pt-4 space-y-4 border-t border-border mt-3'>
										<MultiSelectFilter
											label={language === "vi" ? "Cấp sao" : "Star Level"}
											options={starLevelOptions}
											selectedValues={selectedStarLevels}
											onChange={setSelectedStarLevels}
										/>
										<MultiSelectFilter
											label={language === "vi" ? "Khu vực" : "Region"}
											options={regionOptions}
											selectedValues={selectedRegions}
											onChange={setSelectedRegions}
										/>
										<DropdownFilter
											label={language === "vi" ? "Sắp xếp" : "Sort By"}
											options={sortOptions}
											selectedValue={sortBy}
											onChange={setSortBy}
										/>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>

				{showCreateModal && (
					<BuildCreation
						onConfirm={handleCreateSuccess}
						onClose={() => setShowCreateModal(false)}
						championsList={championsList}
						relicsList={relicsList}
						powersList={powersList}
						runesList={runesList}
					/>
				)}
			</div>
		</div>
	);
};

export default Builds;
