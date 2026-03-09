// src/pages/championList.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePersistentState } from "../hooks/usePersistentState";
import { useTranslation } from "../hooks/useTranslation";
import InputField from "../components/common/inputField";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import DropdownFilter from "../components/common/dropdownFilter";
import ChampionCard from "../components/champion/championCard";
import Button from "../components/common/button";
import {
	Search,
	RotateCw,
	XCircle,
	ChevronDown,
	ChevronUp,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { removeAccents } from "../utils/vietnameseUtils";
import iconRegions from "../assets/data/iconRegions.json";
import PageTitle from "../components/common/pageTitle";

const ITEMS_PER_PAGE = 20;

const ChampionSkeleton = () => (
	<div className='rounded-lg border border-border bg-surface-bg p-4 space-y-3 animate-pulse'>
		<div className='aspect-[4/5] w-full bg-gray-700/50 rounded-md' />
		<div className='h-4 w-3/4 bg-gray-700/50 mx-auto rounded' />
		<div className='h-3 w-1/2 bg-gray-700/50 mx-auto rounded' />
	</div>
);

function ChampionList() {
	const { tUI } = useTranslation();

	// --- STATE ---
	const [champions, setChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		totalPages: 1,
		totalItems: 0,
		currentPage: 1,
	});
	const [dynamicFilters, setDynamicFilters] = useState({
		tags: [],
		regions: [],
		costs: [],
		maxStars: [],
	});

	const [searchInput, setSearchInput] = usePersistentState(
		"championsSearchInput",
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"championsSearchTerm",
		"",
	);
	const [selectedRegions, setSelectedRegions] = usePersistentState(
		"championsSelectedRegions",
		[],
	);
	const [selectedCosts, setSelectedCosts] = usePersistentState(
		"championsSelectedCosts",
		[],
	);
	const [selectedMaxStars, setSelectedMaxStars] = usePersistentState(
		"championsSelectedMaxStars",
		[],
	);
	const [selectedTags, setSelectedTags] = usePersistentState(
		"championsSelectedTags",
		[],
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"championsSortOrder",
		"name-asc",
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"championsCurrentPage",
		1,
	);
	const [isFilterOpen, setIsFilterOpen] = usePersistentState(
		"championsIsFilterOpen",
		false,
	);
	const [showDesktopFilter, setShowDesktopFilter] = usePersistentState(
		"championsShowDesktopFilter",
		true, // Đổi mặc định show filter ra cho dễ nhìn
	);

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
		if (searchTerm) params.append("searchTerm", searchTerm);
		if (selectedRegions.length > 0)
			params.append("regions", selectedRegions.join(","));
		if (selectedCosts.length > 0)
			params.append("costs", selectedCosts.join(","));
		if (selectedMaxStars.length > 0)
			params.append("maxStars", selectedMaxStars.join(","));
		if (selectedTags.length > 0) params.append("tags", selectedTags.join(","));
		return params.toString();
	}, [
		currentPage,
		searchTerm,
		selectedRegions,
		selectedCosts,
		selectedMaxStars,
		selectedTags,
		sortOrder,
	]);

	const fetchChampions = useCallback(async () => {
		setLoading(true);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(
				`${backendUrl}/api/champions?${queryParams}`,
			);
			if (!response.ok) throw new Error(tUI("common.errorLoadData"));
			const data = await response.json();
			setChampions(
				data.items.map(c => ({
					...c,
					avatarUrl:
						c.assets?.[0]?.avatar ||
						c.assets?.[0]?.fullAbsolutePath ||
						"/fallback-champion.png",
					cost: Number(c.cost) || 0,
					maxStar: Number(c.maxStar) || 3,
				})),
			);
			setPagination(data.pagination);
			if (data.availableFilters) setDynamicFilters(data.availableFilters);
		} catch (err) {
			setError(err.message);
		} finally {
			setTimeout(() => setLoading(false), 800);
		}
	}, [queryParams, tUI]);

	useEffect(() => {
		fetchChampions();
	}, [fetchChampions]);

	const filterOptions = useMemo(
		() => ({
			regions: dynamicFilters.regions.map(r => {
				// Xóa dấu cách, ký tự đặc biệt và chuyển thành chữ thường để tạo key
				// VD: "Piltover & Zaun" -> "piltoverzaun", "Freljord" -> "freljord"
				const regionKey = r.toLowerCase().replace(/[^a-z0-9]/g, "");
				return {
					value: r,
					label: tUI(`region.${regionKey}`) || r,
					iconUrl: iconRegions.find(i => i.name === r)?.iconAbsolutePath,
				};
			}),
			costs: dynamicFilters.costs.map(c => ({
				value: c,
				label: `${c} ${tUI("championList.cost")}`,
				isCost: true,
			})),
			maxStars: dynamicFilters.maxStars.map(s => ({
				value: s,
				label: `${s} ⭐`,
				isStar: true,
			})),
			tags: dynamicFilters.tags.map(t => ({ value: t, label: t, isTag: true })),
			sort: [
				{ value: "name-asc", label: tUI("sort.nameAsc") },
				{ value: "name-desc", label: tUI("sort.nameDesc") },
				{ value: "cost-asc", label: tUI("sort.costAsc") },
				{ value: "cost-desc", label: tUI("sort.costDesc") },
			],
		}),
		[dynamicFilters, tUI],
	);

	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedRegions([]);
		setSelectedCosts([]);
		setSelectedMaxStars([]);
		setSelectedTags([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	};

	return (
		<div className='animate-fadeIn'>
			<PageTitle
				title={tUI("championList.title")}
				description={tUI("metadata.defaultDescription")}
			/>

			<div className='font-secondary'>
				<div className='flex justify-between items-center mb-2 md:mb-6'>
					<h1 className='text-3xl font-bold text-text-primary font-primary animate-glitch'>
						{tUI("championList.heading")}
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

				<div className='flex flex-col lg:flex-row items-start'>
					{/* Khu vực danh sách tướng */}
					<div
						className={`w-full transition-[flex] duration-300 ease-in-out ${showDesktopFilter ? "lg:flex-[3]" : "lg:flex-[1]"}`}
					>
						<div className='bg-surface-bg rounded-lg border border-border p-2 sm:p-4 shadow-sm min-h-[500px] relative overflow-visible'>
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
											<ChampionSkeleton key={i} />
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
										{champions.length > 0 ? (
											<>
												<div
													className={`grid grid-cols-2 md:grid-cols-3 ${showDesktopFilter ? "xl:grid-cols-4" : "xl:grid-cols-5"} gap-4 sm:gap-6`}
												>
													{champions.map(c => (
														<motion.div key={c.championID} layout>
															<Link
																to={`/champion/${c.championID}`}
																className='hover:scale-105 transition-transform duration-200 block'
															>
																<ChampionCard champion={c} />
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
														<ChevronLeft size={16} className='mr-2' />
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
														<ChevronRight size={16} className='ml-2' />
													</Button>
												</div>
											</>
										) : (
											<div className='text-center py-20 text-text-secondary'>
												<XCircle
													size={48}
													className='mx-auto mb-4 opacity-20'
												/>
												{tUI("championList.notFound") || tUI("common.notFound")}
											</div>
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* --- ASIDE (Bộ lọc Desktop) --- */}
					<AnimatePresence initial={false}>
						{showDesktopFilter && (
							<motion.aside
								key='desktop-filter'
								initial={{
									width: 0,
									opacity: 0,
									marginLeft: 0,
									overflow: "hidden",
								}}
								animate={{
									width: "auto",
									opacity: 1,
									marginLeft: "2rem",
									transitionEnd: { overflow: "visible" },
								}}
								exit={{
									width: 0,
									opacity: 0,
									marginLeft: 0,
									overflow: "hidden",
								}}
								transition={{ duration: 0.3, ease: "easeInOut" }}
								className='hidden lg:block sticky top-24 h-fit z-40'
							>
								<div className='w-[280px] xl:w-[320px] p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm relative'>
									<label className='block text-sm font-medium text-text-secondary'>
										{tUI("championList.searchLabel")}
									</label>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyDown={e => e.key === "Enter" && handleSearch()}
										placeholder={tUI("championList.searchPlaceholder")}
									/>
									<Button
										onClick={handleSearch}
										className='w-full mt-2 hover:animate-pulse-focus'
									>
										<Search size={16} className='mr-2' /> {tUI("common.search")}
									</Button>

									<MultiSelectFilter
										label={tUI("championList.region")}
										options={filterOptions.regions}
										selectedValues={selectedRegions}
										onChange={setSelectedRegions}
									/>

									<MultiSelectFilter
										label={tUI("championList.cost")}
										options={filterOptions.costs}
										selectedValues={selectedCosts}
										onChange={setSelectedCosts}
									/>

									<MultiSelectFilter
										label={tUI("championList.maxStars")}
										options={filterOptions.maxStars}
										selectedValues={selectedMaxStars}
										onChange={setSelectedMaxStars}
									/>

									<MultiSelectFilter
										label={tUI("championList.tags")}
										options={filterOptions.tags}
										selectedValues={selectedTags}
										onChange={setSelectedTags}
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
										<RotateCw size={16} className='mr-2' />{" "}
										{tUI("championList.resetFilter")}
									</Button>
								</div>
							</motion.aside>
						)}
					</AnimatePresence>

					{/* --- BỘ LỌC MOBILE --- */}
					<div className='lg:hidden w-full p-2 mb-4 rounded-lg border border-border bg-surface-bg shadow-sm order-first relative z-40'>
						<div className='flex items-center gap-2'>
							<div className='flex-1 relative min-w-0'>
								<InputField
									value={searchInput}
									onChange={e => setSearchInput(e.target.value)}
									onKeyDown={e => e.key === "Enter" && handleSearch()}
									placeholder={tUI("championList.searchPlaceholder")}
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
									initial={{ height: 0, opacity: 0, overflow: "hidden" }}
									animate={{
										height: "auto",
										opacity: 1,
										transitionEnd: { overflow: "visible" },
									}}
									exit={{ height: 0, opacity: 0, overflow: "hidden" }}
								>
									<div className='pt-4 space-y-4 border-t border-border mt-3'>
										<MultiSelectFilter
											label={tUI("championList.region")}
											options={filterOptions.regions}
											selectedValues={selectedRegions}
											onChange={setSelectedRegions}
										/>
										<MultiSelectFilter
											label={tUI("championList.cost")}
											options={filterOptions.costs}
											selectedValues={selectedCosts}
											onChange={setSelectedCosts}
										/>
										<MultiSelectFilter
											label={tUI("championList.maxStars")}
											options={filterOptions.maxStars}
											selectedValues={selectedMaxStars}
											onChange={setSelectedMaxStars}
										/>
										<MultiSelectFilter
											label={tUI("championList.tags")}
											options={filterOptions.tags}
											selectedValues={selectedTags}
											onChange={setSelectedTags}
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
			</div>
		</div>
	);
}

export default ChampionList;
