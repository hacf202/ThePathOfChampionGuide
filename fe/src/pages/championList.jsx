// src/pages/championList.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePersistentState } from "../hooks/usePersistentState";
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
		false,
	);

	// --- LOGIC ĐIỀU HƯỚNG ---
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

	// --- LOGIC PHÍM TẮT (Global) ---
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
			) {
				return;
			}

			if (event.key === "ArrowLeft") {
				goToPrevPage();
			} else if (event.key === "ArrowRight") {
				goToNextPage();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [goToPrevPage, goToNextPage, setShowDesktopFilter]);

	// --- LOGIC FETCHING ---
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
			if (!response.ok) throw new Error("Lỗi tải dữ liệu");
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
	}, [queryParams]);

	useEffect(() => {
		fetchChampions();
	}, [fetchChampions]);

	const filterOptions = useMemo(
		() => ({
			regions: dynamicFilters.regions.map(r => ({
				value: r,
				label: r,
				iconUrl: iconRegions.find(i => i.name === r)?.iconAbsolutePath,
			})),
			costs: dynamicFilters.costs.map(c => ({ value: c, isCost: true })),
			maxStars: dynamicFilters.maxStars.map(s => ({ value: s, isStar: true })),
			tags: dynamicFilters.tags.map(t => ({ value: t, label: t, isTag: true })),
			sort: [
				{ value: "name-asc", label: "Tên A-Z" },
				{ value: "name-desc", label: "Tên Z-A" },
				{ value: "cost-asc", label: "Năng lượng thấp-cao" },
				{ value: "cost-desc", label: "Năng lượng cao-thấp" },
			],
		}),
		[dynamicFilters],
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
			<PageTitle title='Danh sách tướng' description='POC GUIDE...' />

			<div className='font-secondary'>
				<div className='flex justify-between items-center mb-2 md:mb-6'>
					<h1 className='text-3xl font-bold text-text-primary font-primary animate-glitch'>
						Danh Sách Tướng
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
							{showDesktopFilter ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
						</Button>
					</div>
				</div>

				<div className='flex flex-col lg:flex-row items-start'>
					{/* --- MAIN CONTENT Area --- */}
					<div
						className={`w-full transition-[flex] duration-300 ease-in-out ${
							showDesktopFilter ? "lg:flex-[3]" : "lg:flex-[1]"
						}`}
					>
						<div className='bg-surface-bg rounded-lg border border-border p-2 sm:p-4 shadow-sm min-h-[500px] relative overflow-hidden'>
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
												{/* Phân trang */}
												<div className='mt-8 flex justify-center items-center gap-4 border-t border-border pt-4'>
													<Button
														onClick={goToPrevPage}
														disabled={currentPage === 1}
														variant='outline'
													>
														Trang trước
													</Button>
													<span className='font-bold text-primary-500 bg-primary-100/10 px-3 py-1 rounded-full'>
														{currentPage} / {pagination.totalPages}
													</span>
													<Button
														onClick={goToNextPage}
														disabled={currentPage === pagination.totalPages}
														variant='outline'
													>
														Trang sau
													</Button>
												</div>
											</>
										) : (
											<div className='text-center py-20 text-text-secondary'>
												<XCircle
													size={48}
													className='mx-auto mb-4 opacity-20'
												/>
												Không tìm thấy tướng phù hợp.
											</div>
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* --- ASIDE (Bộ lọc PC) --- */}
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
										Tìm kiếm tướng
									</label>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyDown={e => e.key === "Enter" && handleSearch()}
										placeholder='Tên tướng...'
									/>
									<Button
										onClick={handleSearch}
										className='w-full mt-2 hover:animate-pulse-focus'
									>
										<Search size={16} className='mr-2' /> Tìm kiếm
									</Button>
									<MultiSelectFilter
										label='Vùng'
										options={filterOptions.regions}
										selectedValues={selectedRegions}
										onChange={setSelectedRegions}
									/>
									<MultiSelectFilter
										label='Năng lượng'
										options={filterOptions.costs}
										selectedValues={selectedCosts}
										onChange={setSelectedCosts}
									/>
									<MultiSelectFilter
										label='Sao tối đa'
										options={filterOptions.maxStars}
										selectedValues={selectedMaxStars}
										onChange={setSelectedMaxStars}
									/>
									<MultiSelectFilter
										label='Thẻ'
										options={filterOptions.tags}
										selectedValues={selectedTags}
										onChange={setSelectedTags}
									/>
									<DropdownFilter
										label='Sắp xếp'
										options={filterOptions.sort}
										selectedValue={sortOrder}
										onChange={setSortOrder}
									/>
									<Button
										variant='outline'
										onClick={handleResetFilters}
										className='w-full'
									>
										<RotateCw size={16} className='mr-2' /> Đặt lại bộ lọc
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
									placeholder='Tên tướng...'
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
											label='Vùng'
											options={filterOptions.regions}
											selectedValues={selectedRegions}
											onChange={setSelectedRegions}
										/>
										<MultiSelectFilter
											label='Năng lượng'
											options={filterOptions.costs}
											selectedValues={selectedCosts}
											onChange={setSelectedCosts}
										/>
										<MultiSelectFilter
											label='Sao tối đa'
											options={filterOptions.maxStars}
											selectedValues={selectedMaxStars}
											onChange={setSelectedMaxStars}
										/>
										<MultiSelectFilter
											label='Thẻ'
											options={filterOptions.tags}
											selectedValues={selectedTags}
											onChange={setSelectedTags}
										/>
										<DropdownFilter
											label='Sắp xếp'
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
