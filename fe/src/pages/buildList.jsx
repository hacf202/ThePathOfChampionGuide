// src/pages/buildList.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BuildCreation from "../components/build/buildCreation";
import MyBuilds from "../components/build/myBuilds";
import MyFavorite from "../components/build/myFavoriteBuild";
import CommunityBuilds from "../components/build/communityBuilds";
import { AuthContext } from "../context/AuthContext.jsx";
import { useTranslation } from "../hooks/useTranslation"; // 🟢 Hook i18n
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

const getCacheKey = (tab, filters) => {
	const filterStr = JSON.stringify({
		search: filters.searchTerm || "",
		stars: filters.selectedStarLevels || [],
		regions: filters.selectedRegions || [],
		sort: filters.sortBy || "createdAt-desc",
		page: filters.currentPage || 1,
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
	const { language, tUI, tDynamic } = useTranslation(); // 🟢 Sử dụng tUI, tDynamic
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

	// Tùy chọn sắp xếp (Lấy từ từ điển)
	const sortOptions = useMemo(
		() => [
			{ value: "createdAt-desc", label: tUI("sort.createdAtDesc") },
			{ value: "createdAt-asc", label: tUI("sort.createdAtAsc") },
			{ value: "championName-asc", label: tUI("sort.nameAsc") },
			{ value: "championName-desc", label: tUI("sort.nameDesc") },
			{ value: "like-desc", label: tUI("sort.likeDesc") },
			{ value: "like-asc", label: tUI("sort.likeAsc") },
			{ value: "views-desc", label: tUI("sort.viewsDesc") },
		],
		[tUI],
	);

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
					fetch(`${apiUrl}/api/powers${fetchOptions}&types=General%20Power`),
					fetch(`${apiUrl}/api/runes${fetchOptions}`),
				]);
				if (!champRes.ok || !relicRes.ok || !powerRes.ok || !runeRes.ok)
					throw new Error(tUI("common.errorLoadData"));
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
	}, [tUI]);

	const powerMap = useMemo(
		() => new Map(powersList.map(p => [p.powerCode, tDynamic(p, "name")])),
		[powersList, tDynamic],
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

	// === KHÔI PHỤC LẠI COMMON PROPS CHUẨN ĐỂ TRUYỀN XUỐNG CÁC CHILD COMPONENTS ===
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
		...cacheUtils, // Hàm getCache, setCache, clearCache được truyền ở đây
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
						{tUI("common.ok")} {/* Có thể map "Thử lại" nếu cần */}
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
					<p className='text-center p-4 italic text-text-secondary'>
						{tUI("buildList.loginToCreate")}
					</p>
				);
			case "favorites":
				return user ? (
					<MyFavorite {...commonProps} />
				) : (
					<p className='text-center p-4 italic text-text-secondary'>
						{tUI("buildList.loginToCreate")}
					</p>
				);
			default:
				return <CommunityBuilds {...commonProps} />;
		}
	};

	return (
		<div className='animate-fadeIn'>
			<PageTitle
				title={tUI("buildList.title")}
				description={tUI("metadata.defaultDescription")}
			/>
			<div className='font-secondary'>
				<div className='flex justify-between items-center mb-2 md:mb-6'>
					<h1 className='text-3xl font-bold text-text-primary font-primary animate-glitch'>
						{tUI("buildList.heading")}
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
								? tUI("championList.hideFilter")
								: tUI("championList.showFilter")}
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
					{user ? (
						<Button
							variant='primary'
							onClick={() => setShowCreateModal(true)}
							iconLeft={<PlusCircle size={20} />}
						>
							{tUI("buildList.createNew")}
						</Button>
					) : (
						<NavLink
							to='/auth'
							className='text-md font-bold text-primary-500 hover:underline flex items-center'
						>
							{tUI("buildList.loginToCreate")}
						</NavLink>
					)}
				</div>

				<div className='flex flex-col lg:flex-row items-start gap-4'>
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
									marginLeft: "1rem", // Điều chỉnh lại margin để cân đối với gap
								}}
								exit={{ width: 0, opacity: 0, marginLeft: 0 }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
								className='hidden lg:block sticky top-24 h-fit overflow-hidden'
							>
								<div className='w-[280px] xl:w-[320px] p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
									<label className='block text-sm font-medium text-text-secondary'>
										{tUI("common.search")}
									</label>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyDown={e => e.key === "Enter" && handleSearch()}
										placeholder={tUI("buildList.searchPlaceholder")}
									/>
									<Button onClick={handleSearch} className='w-full mt-2'>
										<Search size={16} className='mr-2' />
										{tUI("common.search")}
									</Button>
									<MultiSelectFilter
										label={tUI("buildList.starLevel")}
										options={starLevelOptions}
										selectedValues={selectedStarLevels}
										onChange={setSelectedStarLevels}
									/>
									<MultiSelectFilter
										label={tUI("championList.region")}
										options={regionOptions}
										selectedValues={selectedRegions}
										onChange={setSelectedRegions}
									/>
									<DropdownFilter
										label={tUI("championList.sortBy")}
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
										{tUI("championList.resetFilter")}
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
									placeholder={tUI("buildList.searchPlaceholder")}
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
											label={tUI("buildList.starLevel")}
											options={starLevelOptions}
											selectedValues={selectedStarLevels}
											onChange={setSelectedStarLevels}
										/>
										<MultiSelectFilter
											label={tUI("championList.region")}
											options={regionOptions}
											selectedValues={selectedRegions}
											onChange={setSelectedRegions}
										/>
										<DropdownFilter
											label={tUI("championList.sortBy")}
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
