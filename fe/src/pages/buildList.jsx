// src/pages/builds.jsx
import React, {
	useState,
	useMemo,
	useEffect,
	useCallback,
	useContext,
} from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePersistentState } from "../hooks/usePersistentState";
import { useTranslation } from "../hooks/useTranslation";
import InputField from "../components/common/inputField";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import DropdownFilter from "../components/common/dropdownFilter";
import Button from "../components/common/button";
import {
	Search,
	RotateCw,
	XCircle,
	ChevronDown,
	ChevronUp,
	ChevronLeft,
	ChevronRight,
	PlusCircle,
	Globe,
	Shield,
	Heart,
} from "lucide-react";
import { removeAccents } from "../utils/vietnameseUtils";
import iconRegions from "../assets/data/iconRegions.json";
import PageTitle from "../components/common/pageTitle";
import { AuthContext } from "../context/AuthContext.jsx";
import BuildCreation from "../components/build/buildCreation";
import MyBuilds from "../components/build/myBuilds";
import MyFavorite from "../components/build/myFavoriteBuild";
import CommunityBuilds from "../components/build/communityBuilds";
import { NavLink } from "react-router-dom";

const ITEMS_PER_PAGE = 20;

const BuildSkeleton = () => (
	<div className='rounded-lg border border-border bg-surface-bg p-4 space-y-3 animate-pulse'>
		<div className='aspect-[4/5] w-full bg-gray-700/50 rounded-md' />
		<div className='h-4 w-3/4 bg-gray-700/50 mx-auto rounded' />
		<div className='h-3 w-1/2 bg-gray-700/50 mx-auto rounded' />
	</div>
);

function Builds() {
	const { user } = useContext(AuthContext);
	const { language, tUI, tDynamic } = useTranslation(); // tUI cho text tĩnh, tDynamic cho dữ liệu động

	const { tab } = useParams();
	const navigate = useNavigate();

	const activeTab = useMemo(() => {
		const validTabs = ["community", "my-builds", "favorites"];
		return validTabs.includes(tab) ? tab : "community";
	}, [tab]);

	const changeTab = newTab => {
		navigate(`/builds/${newTab}`);
		setCurrentPage(1);
	};

	// --- STATE ---
	const [builds, setBuilds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		totalPages: 1,
		totalItems: 0,
		currentPage: 1,
	});
	const [dynamicFilters, setDynamicFilters] = useState({
		regions: [],
		starLevels: [],
	});

	const [searchInput, setSearchInput] = usePersistentState(
		"buildsSearchInput",
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"buildsSearchTerm",
		"",
	);
	const [selectedRegions, setSelectedRegions] = usePersistentState(
		"buildsSelectedRegions",
		[],
	);
	const [selectedStarLevels, setSelectedStarLevels] = usePersistentState(
		"buildsSelectedStarLevels",
		[],
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"buildsSortOrder",
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
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	// Metadata state
	const [championsList, setChampionsList] = useState([]);
	const [relicsList, setRelicsList] = useState([]);
	const [powersList, setPowersList] = useState([]);
	const [runesList, setRunesList] = useState([]);
	const [loadingData, setLoadingData] = useState(true);
	const [errorData, setErrorData] = useState(null);

	const goToNextPage = useCallback(() => {
		if (currentPage < pagination.totalPages && !loading) {
			setCurrentPage(prev => prev + 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [currentPage, pagination.totalPages, loading, setCurrentPage]);

	const goToPrevPage = useCallback(() => {
		if (currentPage > 1 && !loading) {
			setCurrentPage(prev => prev - 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [currentPage, loading, setCurrentPage]);

	const handleSearch = useCallback(() => {
		setSearchTerm(removeAccents(searchInput.trim()));
		setCurrentPage(1);
		if (window.innerWidth < 1024) setIsFilterOpen(false);
	}, [searchInput, setSearchTerm, setCurrentPage, setIsFilterOpen]);

	useEffect(() => {
		const handleKeyDown = event => {
			if (event.key === "Tab") {
				event.preventDefault();
				setShowDesktopFilter(prev => !prev);
				return;
			}
			if (
				event.target.tagName === "INPUT" ||
				event.target.tagName === "TEXTAREA"
			)
				return;
			if (event.key === "ArrowLeft") goToPrevPage();
			else if (event.key === "ArrowRight") goToNextPage();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [goToPrevPage, goToNextPage, setShowDesktopFilter]);

	const queryParams = useMemo(() => {
		const params = new URLSearchParams();
		params.append("page", currentPage);
		params.append("limit", ITEMS_PER_PAGE);
		params.append("sort", sortOrder);
		params.append("tab", activeTab);
		if (searchTerm) params.append("searchTerm", searchTerm);
		if (selectedRegions.length > 0)
			params.append("regions", selectedRegions.join(","));
		if (selectedStarLevels.length > 0)
			params.append("starLevels", selectedStarLevels.join(","));
		return params.toString();
	}, [
		currentPage,
		searchTerm,
		selectedRegions,
		selectedStarLevels,
		sortOrder,
		activeTab,
	]);

	const fetchBuilds = useCallback(async () => {
		setLoading(true);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(`${backendUrl}/api/builds?${queryParams}`);
			if (!response.ok) throw new Error(tUI("common.errorLoadData"));
			const data = await response.json();
			setBuilds(data.items || []);
			setPagination(data.pagination);
			if (data.availableFilters) setDynamicFilters(data.availableFilters);
		} catch (err) {
			setError(err.message);
		} finally {
			setTimeout(() => setLoading(false), 800);
		}
	}, [queryParams, tUI]);

	useEffect(() => {
		fetchBuilds();
	}, [fetchBuilds]);

	// Fetch metadata
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
			} catch (err) {
				setErrorData(err.message);
			} finally {
				setLoadingData(false);
			}
		};
		fetchAllData();
	}, [tUI]);

	// Filter Options
	const filterOptions = useMemo(
		() => ({
			regions: dynamicFilters.regions.map(r => ({
				value: r,
				label: r,
				iconUrl: iconRegions.find(i => i.name === r)?.iconAbsolutePath,
			})),
			starLevels: dynamicFilters.starLevels.map(s => ({
				value: s,
				label: `${s} ⭐`,
				isStar: true,
			})),
			sort: [
				{
					value: "createdAt-desc",
					label: tUI("sort.createdAtDesc") || "Newest",
				},
				{ value: "createdAt-asc", label: tUI("sort.createdAtAsc") || "Oldest" },
				{ value: "championName-asc", label: tUI("sort.nameAsc") },
				{ value: "championName-desc", label: tUI("sort.nameDesc") },
				{ value: "like-desc", label: tUI("sort.likeDesc") || "Most Liked" },
				{ value: "like-asc", label: tUI("sort.likeAsc") || "Least Liked" },
				{ value: "views-desc", label: tUI("sort.viewsDesc") || "Most Viewed" },
			],
		}),
		[dynamicFilters, tUI],
	);

	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedRegions([]);
		setSelectedStarLevels([]);
		setSortOrder("createdAt-desc");
		setCurrentPage(1);
	};

	const handleCreateSuccess = () => {
		setShowCreateModal(false);
		setRefreshKey(prev => prev + 1);
		fetchBuilds();
	};

	// Power Map và Region Map (giữ nguyên)
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

	// Render Content dựa trên tab, pass builds và các map cần thiết
	const renderContent = () => {
		if (errorData || loadingData) return <div>{tUI("common.loading")}</div>; // Hoặc xử lý error chi tiết hơn

		switch (activeTab) {
			case "community":
				return (
					<CommunityBuilds
						builds={builds}
						powerMap={powerMap}
						championNameToRegionsMap={championNameToRegionsMap}
					/>
				);
			case "my-builds":
				return (
					<MyBuilds
						builds={builds}
						powerMap={powerMap}
						championNameToRegionsMap={championNameToRegionsMap}
					/>
				);
			case "favorites":
				return (
					<MyFavorite
						builds={builds}
						powerMap={powerMap}
						championNameToRegionsMap={championNameToRegionsMap}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className='animate-fadeIn'>
			<PageTitle
				title={tUI("buildList.title") || "Build List"}
				description='POC GUIDE...'
			/>

			<div className='font-secondary'>
				<div className='flex justify-between items-center mb-2 md:mb-6'>
					<h1 className='text-3xl font-bold text-text-primary font-primary animate-glitch'>
						{tUI("buildList.heading") || "Relic Builds List"}
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
							{tUI("buildList.community") || "Community"}
						</Button>
						{user && (
							<>
								<Button
									variant={activeTab === "my-builds" ? "primary" : "ghost"}
									onClick={() => changeTab("my-builds")}
									iconLeft={<Shield size={18} />}
								>
									{tUI("buildList.myBuilds") || "My Builds"}
								</Button>
								<Button
									variant={activeTab === "favorites" ? "primary" : "ghost"}
									onClick={() => changeTab("favorites")}
									iconLeft={<Heart size={18} />}
								>
									{tUI("buildList.favorites") || "Favorites"}
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
							{tUI("buildList.createNew") || "Create New"}
						</Button>
					) : (
						<NavLink
							to='/auth'
							className='text-md font-bold text-primary-500 hover:underline flex items-center'
						>
							{tUI("buildList.loginToCreate") || "Login to Create"}
						</NavLink>
					)}
				</div>

				<div className='flex lg:flex-row gap-4'>
					<div className='flex-1 bg-surface-bg rounded-lg border border-border p-2 sm:p-4 shadow-sm min-h-[500px] relative overflow-hidden'>
						<AnimatePresence mode='wait'>
							{loading ? (
								<motion.div
									key='skeleton'
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className={`grid grid-cols-2 md:grid-cols-3 ${showDesktopFilter ? "xl:grid-cols-4" : "xl:grid-cols-5"} gap-4 sm:gap-6`}
								>
									{[...Array(8)].map((_, i) => (
										<BuildSkeleton key={i} />
									))}
								</motion.div>
							) : (
								<motion.div
									key='content'
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.3 }}
								>
									{builds.length > 0 ? (
										<>
											<div
												className={`grid grid-cols-2 md:grid-cols-3 ${showDesktopFilter ? "xl:grid-cols-4" : "xl:grid-cols-5"} gap-4 sm:gap-6`}
											>
												{builds.map(b => (
													<motion.div key={b.id} layout>
														<Link
															to={`/build/${b.id}`}
															className='hover:scale-105 transition-transform duration-200 block'
														>
															{/* Giả sử có BuildCard component; tạo nếu chưa */}
															<BuildCard build={b} />
														</Link>
													</motion.div>
												))}
											</div>
											<div className='mt-8 flex justify-center items-center gap-4 border-t border-border pt-4'>
												<Button
													onClick={goToPrevPage}
													disabled={currentPage === 1}
													variant='outline'
												>
													{tUI("common.prevPage")}
												</Button>
												<span className='font-bold text-primary-500 bg-primary-100/10 px-3 py-1 rounded-full'>
													{currentPage} / {pagination.totalPages}
												</span>
												<Button
													onClick={goToNextPage}
													disabled={currentPage === pagination.totalPages}
													variant='outline'
												>
													{tUI("common.nextPage")}
												</Button>
											</div>
										</>
									) : (
										<div className='text-center py-20 text-text-secondary'>
											<XCircle size={48} className='mx-auto mb-4 opacity-20' />
											{tUI("common.notFound")}
										</div>
									)}
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<AnimatePresence initial={false}>
						{showDesktopFilter && (
							<motion.aside
								key='desktop-filter'
								initial={{ width: 0, opacity: 0, marginLeft: 0 }}
								animate={{ width: "auto", opacity: 1, marginLeft: "2rem" }}
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
										placeholder={
											tUI("buildList.searchPlaceholder") || "Champion, relic..."
										}
									/>
									<Button
										onClick={handleSearch}
										className='w-full mt-2 hover:animate-pulse-focus'
									>
										<Search size={16} className='mr-2' /> {tUI("common.search")}
									</Button>
									<MultiSelectFilter
										label={tUI("buildList.starLevel") || "Star Level"}
										options={filterOptions.starLevels}
										selectedValues={selectedStarLevels}
										onChange={setSelectedStarLevels}
									/>
									<MultiSelectFilter
										label={tUI("championList.region")}
										options={filterOptions.regions}
										selectedValues={selectedRegions}
										onChange={setSelectedRegions}
									/>
									<DropdownFilter
										label={tUI("championList.sortBy")}
										options={filterOptions.sort}
										selectedValue={sortOrder}
										onChange={setSortOrder}
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

					{/* --- MOBILE FILTER --- */}
					<div className='lg:hidden w-full p-2 mb-4 rounded-lg border border-border bg-surface-bg shadow-sm order-first'>
						<div className='flex items-center gap-2'>
							<div className='flex-1 relative min-w-0'>
								<InputField
									value={searchInput}
									onChange={e => setSearchInput(e.target.value)}
									onKeyDown={e => e.key === "Enter" && handleSearch()}
									placeholder={
										tUI("buildList.searchPlaceholder") || "Champion, relic..."
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
											label={tUI("buildList.starLevel") || "Star Level"}
											options={filterOptions.starLevels}
											selectedValues={selectedStarLevels}
											onChange={setSelectedStarLevels}
										/>
										<MultiSelectFilter
											label={tUI("championList.region")}
											options={filterOptions.regions}
											selectedValues={selectedRegions}
											onChange={setSelectedRegions}
										/>
										<DropdownFilter
											label={tUI("championList.sortBy")}
											options={filterOptions.sort}
											selectedValue={sortOrder}
											onChange={setSortOrder}
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
}

export default Builds;
