// src/pages/relicList.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
	Loader2,
} from "lucide-react";
import { removeAccents } from "../utils/vietnameseUtils";
import PageTitle from "../components/common/pageTitle";
import SafeImage from "@/components/common/SafeImage";

const ITEMS_PER_PAGE = 21;

const LoadingSpinner = () => (
	<div className='flex justify-center items-center h-64 text-text-secondary'>
		<Loader2 className='animate-spin text-primary-500' size={48} />
	</div>
);

const ErrorMessage = ({ message, onRetry }) => (
	<div className='text-center p-10 bg-danger-bg-light text-danger-text-dark rounded-lg'>
		<h2 className='text-xl font-bold mb-2'>Đã xảy ra lỗi</h2>
		<p className='mb-4'>{message}</p>
		<Button onClick={onRetry} variant='danger'>
			Thử lại
		</Button>
	</div>
);

function RelicList() {
	const [relics, setRelics] = useState([]);
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
		stacks: [],
	});

	// States bộ lọc
	const [searchInput, setSearchInput] = usePersistentState(
		"relicsSearchInput",
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"relicsSearchTerm",
		"",
	);
	const [selectedRarities, setSelectedRarities] = usePersistentState(
		"relicsSelectedRarities",
		[],
	);
	const [selectedTypes, setSelectedTypes] = usePersistentState(
		"relicsSelectedTypes",
		[],
	);
	const [selectedStacks, setSelectedStacks] = usePersistentState(
		"relicsSelectedStacks",
		[],
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"relicsSortOrder",
		"name-asc",
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"relicsCurrentPage",
		1,
	);
	const [isFilterOpen, setIsFilterOpen] = usePersistentState(
		"relicsIsFilterOpen",
		false,
	);

	// 1. Memoize Query Params
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
		if (selectedStacks.length > 0)
			params.append("stacks", selectedStacks.join(","));
		return params.toString();
	}, [
		currentPage,
		searchTerm,
		selectedRarities,
		selectedTypes,
		selectedStacks,
		sortOrder,
	]);

	// 2. Fetch API với Callback
	const fetchRelics = useCallback(async () => {
		setLoading(true);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(`${backendUrl}/api/relics?${queryParams}`);
			if (!response.ok) throw new Error(`Lỗi server: ${response.status}`);
			const data = await response.json();

			setRelics(data.items || []);
			setPagination(data.pagination);
			if (data.availableFilters) setDynamicFilters(data.availableFilters);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [queryParams]);

	useEffect(() => {
		fetchRelics();
	}, [fetchRelics]);

	// 3. Tối ưu Filter Options dựa trên dữ liệu động
	const filterOptions = useMemo(
		() => ({
			rarities: dynamicFilters.rarities.map(r => ({
				value: r,
				label: r,
				iconComponent: <RarityIcon rarity={r} />,
			})),
			types: dynamicFilters.types.map(t => ({ value: t, label: t })),
			stacks: dynamicFilters.stacks.map(s => ({
				value: s,
				label: `Số lượng ${s}`,
			})),
			sort: [
				{ value: "name-asc", label: "Tên A-Z" },
				{ value: "name-desc", label: "Tên Z-A" },
			],
		}),
		[dynamicFilters],
	);

	// Handlers
	const handleSearch = () => {
		setSearchTerm(removeAccents(searchInput.trim()));
		setCurrentPage(1);
		if (window.innerWidth < 1024) setIsFilterOpen(false);
	};

	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedRarities([]);
		setSelectedTypes([]);
		setSelectedStacks([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	};

	return (
		<div>
			<PageTitle
				title='Danh sách cổ vật'
				description='Đầy đủ các cổ vật Path of Champions...'
				type='article'
			/>
			<div className='font-secondary'>
				<h1 className='text-3xl font-bold mb-6 text-text-primary font-primary'>
					Danh Sách Cổ Vật
				</h1>

				<div className='flex flex-col lg:flex-row gap-8'>
					<aside className='lg:w-1/5 w-full lg:sticky lg:top-24 h-fit'>
						{/* Mobile Filter */}
						<div className='lg:hidden p-2 rounded-lg border border-border bg-surface-bg shadow-sm'>
							<div className='flex items-center gap-2'>
								<div className='flex-1 relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Tên cổ vật...'
									/>
									{searchInput && (
										<button
											onClick={() => setSearchInput("")}
											className='absolute right-3 top-1/2 -translate-y-1/2'
										>
											<XCircle size={18} />
										</button>
									)}
								</div>
								<Button onClick={handleSearch}>
									<Search size={16} />
								</Button>
								<Button
									variant='outline'
									onClick={() => setIsFilterOpen(!isFilterOpen)}
								>
									{isFilterOpen ? (
										<ChevronUp size={18} />
									) : (
										<ChevronDown size={18} />
									)}
								</Button>
							</div>
							<div
								className={`transition-all duration-300 overflow-visible ${isFilterOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"}`}
							>
								<div className='pt-4 space-y-4 border-t border-border mt-2'>
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
									<MultiSelectFilter
										label='Số lượng'
										options={filterOptions.stacks}
										selectedValues={selectedStacks}
										onChange={setSelectedStacks}
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
										<RotateCw size={16} className='mr-2' />
										Đặt lại
									</Button>
								</div>
							</div>
						</div>

						{/* Desktop Filter */}
						<div className='hidden lg:block p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
							<label className='block text-sm font-medium text-text-secondary'>
								Tìm kiếm
							</label>
							<InputField
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								onKeyPress={e => e.key === "Enter" && handleSearch()}
								placeholder='Tên cổ vật...'
							/>
							<Button onClick={handleSearch} className='w-full mt-2'>
								<Search size={16} className='mr-2' />
								Tìm kiếm
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
							<MultiSelectFilter
								label='Số lượng'
								options={filterOptions.stacks}
								selectedValues={selectedStacks}
								onChange={setSelectedStacks}
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
								<RotateCw size={16} className='mr-2' />
								Đặt lại bộ lọc
							</Button>
						</div>
					</aside>

					<div className='lg:w-4/5 w-full lg:order-first'>
						<div className='bg-surface-bg rounded-lg border border-border p-2 sm:p-6 shadow-sm min-h-[500px]'>
							{loading && relics.length === 0 ? (
								<LoadingSpinner />
							) : relics.length > 0 ? (
								<>
									<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
										{relics.map(relic => (
											<Link
												key={relic.relicCode}
												to={`/relic/${encodeURIComponent(relic.relicCode)}`}
												className='group relative flex items-center gap-4 bg-surface-bg p-4 rounded-lg hover:bg-surface-hover transition border border-border hover:border-primary-500'
											>
												<SafeImage
													src={relic.assetAbsolutePath}
													alt={relic.name}
													className='w-16 h-16 object-cover rounded-md border'
												/>
												<div className='flex-grow'>
													<h3 className='font-bold text-lg text-text-primary'>
														{relic.name}
													</h3>
													<div className='flex items-center gap-2 text-sm text-text-secondary'>
														<RarityIcon rarity={relic.rarity} />
														<span>{relic.rarity}</span>
													</div>
												</div>
												{/* Tooltip giữ nguyên logic */}
												<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-10'>
													<p className='whitespace-pre-wrap'>
														{relic.descriptionRaw}
													</p>
													<div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900'></div>
												</div>
											</Link>
										))}
									</div>
									<div className='mt-8 flex justify-center items-center gap-4 border-t border-border pt-4'>
										<Button
											onClick={() => {
												setCurrentPage(p => p - 1);
												window.scrollTo({ top: 0, behavior: "smooth" });
											}}
											disabled={currentPage === 1}
											variant='outline'
										>
											Trang trước
										</Button>
										<span className='font-bold text-primary-500'>
											{currentPage} / {pagination.totalPages}
										</span>
										<Button
											onClick={() => {
												setCurrentPage(p => p + 1);
												window.scrollTo({ top: 0, behavior: "smooth" });
											}}
											disabled={currentPage === pagination.totalPages}
											variant='outline'
										>
											Trang sau
										</Button>
									</div>
								</>
							) : (
								<div className='text-center py-20 text-text-secondary'>
									Không tìm thấy cổ vật nào phù hợp.
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default RelicList;
