// src/pages/championList.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { removeAccents } from "../utils/vietnameseUtils";
import iconRegions from "../assets/data/iconRegions.json";
import PageTitle from "../components/common/pageTitle";

const ITEMS_PER_PAGE = 20;

function ChampionList() {
	const [champions, setChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		totalPages: 1,
		totalItems: 0,
		currentPage: 1,
	});

	// Lưu trữ bộ lọc động nhận từ Backend
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

			// Cập nhật danh sách thẻ và thuộc tính từ CSDL
			if (data.availableFilters) {
				setDynamicFilters(data.availableFilters);
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [queryParams]);

	useEffect(() => {
		fetchChampions();
	}, [fetchChampions]);

	// Xử lý options cho bộ lọc dựa trên dữ liệu động từ Backend
	const filterOptions = useMemo(() => {
		return {
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
		};
	}, [dynamicFilters]);

	const handleSearch = () => {
		setSearchTerm(removeAccents(searchInput.trim()));
		setCurrentPage(1);
		if (window.innerWidth < 1024) setIsFilterOpen(false);
	};

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
		<div>
			<PageTitle title='Danh sách tướng' description='POC GUIDE...' />
			<div className='font-secondary'>
				<h1 className='text-3xl font-bold mb-6 text-text-primary font-primary'>
					Danh Sách Tướng
				</h1>
				<div className='flex flex-col lg:flex-row gap-8'>
					<aside className='lg:w-1/5 w-full lg:sticky lg:top-24 h-fit'>
						{/* Mobile Filter UI (Giữ nguyên CSS cũ) */}
						<div className='lg:hidden p-2 rounded-lg border border-border bg-surface-bg shadow-sm'>
							<div className='flex items-center gap-2'>
								<div className='flex-1 relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Nhập tên tướng...'
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
								className={`transition-all duration-300 overflow-visible ${isFilterOpen ? "max-h-[1400px] opacity-100" : "max-h-0 opacity-0"}`}
							>
								<div className='pt-4 space-y-4 border-t border-border mt-2'>
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
										<RotateCw size={16} className='mr-2' /> Đặt lại
									</Button>
								</div>
							</div>
						</div>

						{/* Desktop Filter UI (Giữ nguyên CSS cũ) */}
						<div className='hidden lg:block p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
							<label className='block text-sm font-medium text-text-secondary'>
								Tìm kiếm tướng
							</label>
							<InputField
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								onKeyPress={e => e.key === "Enter" && handleSearch()}
								placeholder='Tên tướng...'
							/>
							<Button onClick={handleSearch} className='w-full mt-2'>
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
					</aside>

					<div className='lg:w-4/5 w-full lg:order-first'>
						<div className='bg-surface-bg rounded-lg border border-border p-2 sm:p-6 shadow-sm min-h-[500px]'>
							{loading && champions.length === 0 ? (
								<div className='flex justify-center items-center h-64'>
									<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500'></div>
								</div>
							) : champions.length > 0 ? (
								<>
									<div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
										{champions.map(c => (
											<Link
												key={c.championID}
												to={`/champion/${c.championID}`}
												className='hover:scale-105 transition-transform duration-200'
											>
												<ChampionCard champion={c} />
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
									Không tìm thấy tướng phù hợp.
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ChampionList;
