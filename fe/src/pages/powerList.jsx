// src/pages/powerList.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Thêm Framer Motion
import { usePersistentState } from "../hooks/usePersistentState";
import InputField from "../components/common/inputField";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import DropdownFilter from "../components/common/dropdownFilter";
import Button from "../components/common/button";
import RarityIcon from "../components/common/rarityIcon";
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
import PageTitle from "../components/common/pageTitle";
import SafeImage from "@/components/common/SafeImage";

const ITEMS_PER_PAGE = 24;

/**
 * COMPONENT: PowerSkeleton
 * Mô phỏng cấu trúc của một Power Card khi đang tải.
 */
const PowerSkeleton = () => (
	<div className='flex items-center gap-4 bg-surface-bg p-4 rounded-lg border border-border animate-pulse'>
		<div className='w-16 h-16 bg-gray-700/50 rounded-md shrink-0' />
		<div className='flex-grow space-y-3'>
			<div className='h-5 w-2/3 bg-gray-700/50 rounded' />
			<div className='h-4 w-1/3 bg-gray-700/50 rounded' />
		</div>
	</div>
);

function PowerList() {
	// --- STATE ---
	const [powers, setPowers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		totalPages: 1,
		totalItems: 0,
		currentPage: 1,
	});
	const [dynamicFilters, setDynamicFilters] = useState({
		rarities: [],
		types: [],
	});

	const [searchInput, setSearchInput] = usePersistentState(
		"powersSearchInput",
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"powersSearchTerm",
		"",
	);
	const [selectedRarities, setSelectedRarities] = usePersistentState(
		"powersSelectedRarities",
		[],
	);
	const [selectedTypes, setSelectedTypes] = usePersistentState(
		"powersSelectedTypes",
		[],
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"powersSortOrder",
		"name-asc",
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"powersCurrentPage",
		1,
	);
	const [isFilterOpen, setIsFilterOpen] = usePersistentState(
		"powersIsFilterOpen",
		false,
	);
	const [showDesktopFilter, setShowDesktopFilter] = usePersistentState(
		"powersShowDesktopFilter",
		true,
	);

	// --- LOGIC ĐIỀU HƯỚNG (Pagination Logic) ---
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

	// --- LOGIC PHÍM TẮT (Global Hotkeys) ---
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
		if (selectedRarities.length > 0)
			params.append("rarities", selectedRarities.join(","));
		if (selectedTypes.length > 0)
			params.append("types", selectedTypes.join(","));
		return params.toString();
	}, [currentPage, searchTerm, selectedRarities, selectedTypes, sortOrder]);

	const fetchPowers = useCallback(async () => {
		setLoading(true);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(`${backendUrl}/api/powers?${queryParams}`);
			if (!response.ok) throw new Error(`Lỗi: ${response.status}`);
			const data = await response.json();

			setPowers(data.items || []);
			setPagination(data.pagination);
			if (data.availableFilters) setDynamicFilters(data.availableFilters);
		} catch (err) {
			setError(err.message);
		} finally {
			// Delay nhẹ để hiệu ứng skeleton trông tự nhiên hơn
			setTimeout(() => setLoading(false), 500);
		}
	}, [queryParams]);

	useEffect(() => {
		fetchPowers();
	}, [fetchPowers]);

	// --- FILTERS OPTIONS ---
	const filterOptions = useMemo(
		() => ({
			rarities: dynamicFilters.rarities.map(r => ({
				value: r,
				label: r,
				iconComponent: <RarityIcon rarity={r} />,
			})),
			types: dynamicFilters.types.map(t => ({ value: t, label: t })),
			sort: [
				{ value: "name-asc", label: "Tên A-Z" },
				{ value: "name-desc", label: "Tên Z-A" },
			],
		}),
		[dynamicFilters],
	);

	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedRarities([]);
		setSelectedTypes([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	};

	return (
		<div className='animate-fadeIn'>
			<PageTitle
				title='Danh sách sức mạnh'
				description='POC GUIDE: Dữ liệu sức mạnh Path of Champions...'
			/>

			<div className='font-secondary'>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-3xl font-bold text-text-primary font-primary animate-glitch'>
						Danh Sách Sức Mạnh
					</h1>

					{/* Desktop Toggle Button */}
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
					{/* --- MAIN CONTENT AREA --- */}
					<div
						className={`w-full transition-[flex] duration-300 ease-in-out ${
							showDesktopFilter ? "lg:flex-[3] xl:lg:flex-[4]" : "lg:flex-[1]"
						}`}
					>
						<div className='bg-surface-bg rounded-lg border border-border p-2 sm:p-6 shadow-sm min-h-[500px] relative overflow-visible'>
							<AnimatePresence mode='wait'>
								{loading ? (
									<motion.div
										key='skeleton'
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className={`grid grid-cols-2 md:grid-cols-3 ${showDesktopFilter ? "xl:grid-cols-3" : "xl:grid-cols-4"} gap-4 sm:gap-6`}
									>
										{[...Array(9)].map((_, i) => (
											<PowerSkeleton key={i} />
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
										{powers.length > 0 ? (
											<>
												<div
													className={`grid grid-cols-2 md:grid-cols-3 ${showDesktopFilter ? "xl:grid-cols-3" : "xl:grid-cols-4"} gap-4 sm:gap-6`}
												>
													{powers.map(power => (
														<motion.div key={power.powerCode} layout>
															<Link
																to={`/power/${encodeURIComponent(power.powerCode)}`}
																className='group relative flex items-center gap-4 bg-surface-bg p-4 rounded-lg hover:bg-surface-hover transition border border-border hover:border-primary-500'
															>
																<SafeImage
																	src={power.assetAbsolutePath}
																	alt={power.name}
																	className='w-16 h-16 object-cover rounded-md border shadow-sm group-hover:shadow-primary-md transition-all'
																/>
																<div className='flex-grow'>
																	<h3 className='font-bold text-lg text-text-primary group-hover:text-primary-500 transition-colors'>
																		{power.name}
																	</h3>
																	<div className='flex items-center gap-2 text-sm text-text-secondary'>
																		<RarityIcon rarity={power.rarity} />
																		<span>{power.rarity}</span>
																	</div>
																</div>
																{/* Tooltip Description */}
																<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 p-4 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 invisible group-hover:visible pointer-events-none z-50 border border-white/10'>
																	<p className='whitespace-pre-wrap leading-relaxed'>
																		{power.descriptionRaw}
																	</p>
																	<div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900/95'></div>
																</div>
															</Link>
														</motion.div>
													))}
												</div>

												{/* PHÂN TRANG */}
												<div className='mt-8 flex justify-center items-center gap-4 border-t border-border pt-4'>
													<Button
														onClick={goToPrevPage}
														disabled={currentPage === 1}
														variant='outline'
													>
														<ChevronLeft size={16} className='mr-2' />
														Trang Trước
													</Button>
													<span>/</span>
													<Button
														onClick={goToNextPage}
														disabled={currentPage === pagination.totalPages}
														variant='outline'
													>
														Trang Sau
														<ChevronRight size={16} className='ml-2' />
													</Button>
												</div>
											</>
										) : (
											<div className='flex flex-col items-center justify-center py-20 text-text-secondary'>
												<XCircle size={64} className='mb-4 opacity-10' />
												<p className='text-xl font-primary'>
													Không tìm thấy sức mạnh phù hợp.
												</p>
												<Button
													variant='ghost'
													onClick={handleResetFilters}
													className='mt-4'
												>
													Xóa tất cả bộ lọc
												</Button>
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
										Tìm kiếm sức mạnh
									</label>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyDown={e => e.key === "Enter" && handleSearch()}
										placeholder='Tên sức mạnh...'
									/>
									<Button
										onClick={handleSearch}
										className='w-full mt-2 hover:animate-pulse-focus'
									>
										<Search size={16} className='mr-2' /> Tìm kiếm
									</Button>
									<MultiSelectFilter
										label='Độ hiếm'
										options={filterOptions.rarities}
										selectedValues={selectedRarities}
										onChange={setSelectedRarities}
									/>
									<MultiSelectFilter
										label='Loại'
										options={filterOptions.types}
										selectedValues={selectedTypes}
										onChange={setSelectedTypes}
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
									placeholder='Tìm sức mạnh...'
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
											label='Độ hiếm'
											options={filterOptions.rarities}
											selectedValues={selectedRarities}
											onChange={setSelectedRarities}
										/>
										<MultiSelectFilter
											label='Loại'
											options={filterOptions.types}
											selectedValues={selectedTypes}
											onChange={setSelectedTypes}
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

export default PowerList;
