// src/pages/itemList.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePersistentState } from "../hooks/usePersistentState";
import { useTranslation } from "../hooks/useTranslation";
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

const ItemSkeleton = () => (
	<div className='flex items-center gap-3 sm:gap-4 bg-surface-bg p-3 sm:p-4 rounded-lg border border-border animate-pulse'>
		<div className='w-12 h-12 sm:w-16 sm:h-16 bg-gray-700/50 rounded-md shrink-0' />
		<div className='flex-grow space-y-3'>
			<div className='h-5 w-2/3 bg-gray-700/50 rounded' />
			<div className='h-4 w-1/3 bg-gray-700/50 rounded' />
		</div>
	</div>
);

function ItemList() {
	const { tUI, t } = useTranslation();

	// --- STATE ---
	const [items, setItems] = useState([]);
	const [knownItems, setKnownItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		totalPages: 1,
		totalItems: 0,
		currentPage: 1,
	});

	const [dynamicFilters, setDynamicFilters] = useState({
		rarities: [],
	});

	// --- PERSISTENT STATE ---
	const [searchInput, setSearchInput] = usePersistentState(
		"itemsSearchInput",
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState("itemsSearchTerm", "");
	const [selectedRarities, setSelectedRarities] = usePersistentState(
		"itemsSelectedRarities",
		[],
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"itemsSortOrder",
		"name-asc",
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"itemsCurrentPage",
		1,
	);
	const [showDesktopFilter, setShowDesktopFilter] = usePersistentState(
		"itemsShowDesktopFilter",
		true,
	);

	const [isFilterOpen, setIsFilterOpen] = useState(false);

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
	}, [searchInput, setSearchTerm, setCurrentPage]);

	// --- PHÍM TẮT ---
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

	// --- FETCHING ---
	const queryParams = useMemo(() => {
		const params = new URLSearchParams();
		params.append("page", currentPage);
		params.append("limit", ITEMS_PER_PAGE);
		params.append("sort", sortOrder);
		if (searchTerm) params.append("searchTerm", searchTerm);
		if (selectedRarities.length > 0)
			params.append("rarities", selectedRarities.join(","));
		return params.toString();
	}, [currentPage, searchTerm, selectedRarities, sortOrder]);

	const fetchItems = useCallback(async () => {
		setLoading(true);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(`${backendUrl}/api/items?${queryParams}`);
			if (!response.ok) throw new Error(tUI("common.errorLoadData"));
			const data = await response.json();

			setItems(data.items || []);
			setKnownItems(prev => {
				const map = new Map(prev.map(i => [i.itemCode, i]));
				(data.items || []).forEach(i => map.set(i.itemCode, i));
				return Array.from(map.values());
			});
			setPagination(data.pagination);
			if (data.availableFilters) setDynamicFilters(data.availableFilters);
		} catch (err) {
			setError(err.message);
		} finally {
			setTimeout(() => setLoading(false), 500);
		}
	}, [queryParams, tUI]);

	useEffect(() => {
		fetchItems();
	}, [fetchItems]);

	// --- DỊCH ĐỘ HIẾM ---
	const getTranslatedRarity = useCallback(
		(rawRarity, item) => {
			if (!rawRarity) return "";
			if (item) {
				const dynTrans = t(item, "rarity");
				if (dynTrans) return dynTrans;
			}
			return tUI(`item.rarity.${rawRarity.toLowerCase()}`);
		},
		[tUI, t],
	);

	// --- BỘ LỌC ---
	const filterOptions = useMemo(
		() => ({
			rarities: (dynamicFilters.rarities || []).map(r => {
				const sample = knownItems.find(i => i.rarity === r);
				return {
					value: r,
					label: getTranslatedRarity(r, sample),
					iconComponent: <RarityIcon rarity={r} />,
				};
			}),
			sort: [
				{ value: "name-asc", label: tUI("sort.nameAsc") },
				{ value: "name-desc", label: tUI("sort.nameDesc") },
			],
		}),
		[dynamicFilters, knownItems, tUI, getTranslatedRarity],
	);

	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedRarities([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	};

	return (
		<div className='animate-fadeIn'>
			<PageTitle
				title={tUI("itemList.title")}
				description={tUI("itemList.metaDesc")}
			/>

			<div className='font-secondary'>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-3xl font-bold text-text-primary font-primary animate-glitch'>
						{tUI("itemList.heading")}
					</h1>
					<Button
						variant='outline'
						onClick={() => setShowDesktopFilter(!showDesktopFilter)}
						className='hidden lg:flex gap-2'
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

				<div className='flex flex-col lg:flex-row items-start'>
					<div
						className={`w-full transition-all duration-300 ${showDesktopFilter ? "lg:flex-[3] xl:lg:flex-[4]" : "lg:flex-[1]"}`}
					>
						<div className='bg-surface-bg rounded-lg border border-border p-4 sm:p-6 shadow-sm min-h-[500px] relative overflow-visible'>
							<AnimatePresence mode='wait'>
								{loading ? (
									<div
										className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${showDesktopFilter ? "xl:grid-cols-3" : "xl:grid-cols-4"} gap-6`}
									>
										{[...Array(9)].map((_, i) => (
											<ItemSkeleton key={i} />
										))}
									</div>
								) : (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
									>
										{items.length > 0 ? (
											<>
												<div
													className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${showDesktopFilter ? "xl:grid-cols-3" : "xl:grid-cols-4"} gap-6`}
												>
													{items.map(item => (
														<Link
															key={item.itemCode}
															to={`/item/${item.itemCode}`}
															className='group relative flex items-center gap-4 bg-surface-bg p-4 rounded-lg border border-border hover:border-primary-500 transition-all'
														>
															<SafeImage
																src={item.assetAbsolutePath}
																alt={t(item, "name")}
																className='w-16 h-16 shrink-0 object-cover rounded-md'
															/>
															<div className='flex-grow overflow-hidden'>
																<h3 className='font-bold text-lg text-text-primary group-hover:text-primary-500 truncate'>
																	{t(item, "name")}
																</h3>
																<div className='flex items-center gap-2 text-sm text-text-secondary'>
																	<RarityIcon rarity={item.rarity} />
																	<span className='truncate'>
																		{getTranslatedRarity(item.rarity, item)}
																	</span>
																</div>
															</div>
															{/* Tooltip Description */}
															<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 p-4 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 invisible group-hover:visible pointer-events-none z-50 border border-white/10'>
																<p className='whitespace-pre-wrap leading-relaxed'>
																	{t(item, "description")}
																</p>
																<div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900/95'></div>
															</div>
														</Link>
													))}
												</div>
												{/* Pagination */}
												<div className='mt-8 flex justify-center items-center gap-4 border-t border-border pt-4'>
													<Button
														onClick={goToPrevPage}
														disabled={currentPage === 1}
														variant='outline'
													>
														<ChevronLeft size={16} className='mr-2' />{" "}
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
														{tUI("common.nextPage")}{" "}
														<ChevronRight size={16} className='ml-2' />
													</Button>
												</div>
											</>
										) : (
											<div className='flex flex-col items-center justify-center py-20 text-text-secondary'>
												<XCircle size={64} className='mb-4 opacity-10' />
												<p className='text-xl font-primary'>
													{tUI("itemList.notFound")}
												</p>
												<Button
													variant='ghost'
													onClick={handleResetFilters}
													className='mt-4'
												>
													{tUI("itemList.clearFilters")}
												</Button>
											</div>
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* Desktop Sidebar Filter */}
					<AnimatePresence initial={false}>
						{showDesktopFilter && (
							<motion.aside
								initial={{ width: 0, opacity: 0, marginLeft: 0 }}
								animate={{ width: "auto", opacity: 1, marginLeft: "2rem" }}
								exit={{ width: 0, opacity: 0, marginLeft: 0 }}
								className='hidden lg:block sticky top-24 h-fit z-40'
							>
								<div className='w-[280px] xl:w-[320px] p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
									<label className='block text-sm font-medium text-text-secondary'>
										{tUI("itemList.searchLabel")}
									</label>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyDown={e => e.key === "Enter" && handleSearch()}
										placeholder={tUI("itemList.placeholder")}
									/>
									<Button onClick={handleSearch} className='w-full mt-2'>
										<Search size={16} className='mr-2' /> {tUI("common.search")}
									</Button>
									<MultiSelectFilter
										label={tUI("common.rarity")}
										options={filterOptions.rarities}
										selectedValues={selectedRarities}
										onChange={setSelectedRarities}
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

					{/* Mobile Filter UI */}
					<div className='lg:hidden w-full p-2 mb-4 rounded-lg border border-border bg-surface-bg shadow-sm order-first relative z-40'>
						<div className='flex items-center gap-2'>
							<div className='flex-1 relative min-w-0'>
								<InputField
									value={searchInput}
									onChange={e => setSearchInput(e.target.value)}
									onKeyDown={e => e.key === "Enter" && handleSearch()}
									placeholder={tUI("itemList.placeholder")}
								/>
							</div>
							<Button onClick={handleSearch} className='px-3'>
								<Search size={18} />
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
									className='pt-4 space-y-4 border-t border-border mt-3'
								>
									<MultiSelectFilter
										label={tUI("common.rarity")}
										options={filterOptions.rarities}
										selectedValues={selectedRarities}
										onChange={setSelectedRarities}
									/>
									<DropdownFilter
										label={tUI("championList.sortBy")}
										options={filterOptions.sort}
										selectedValue={sortOrder}
										onChange={setSortOrder}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ItemList;
