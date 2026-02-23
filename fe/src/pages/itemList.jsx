// src/pages/itemList.jsx
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
} from "lucide-react";
import { removeAccents } from "../utils/vietnameseUtils";
import PageTitle from "../components/common/pageTitle";
import SafeImage from "@/components/common/SafeImage";

const ITEMS_PER_PAGE = 21;

const LoadingSpinner = () => (
	<div className='flex justify-center items-center h-64'>
		<div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500'></div>
	</div>
);

function ItemList() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		totalPages: 1,
		totalItems: 0,
		currentPage: 1,
	});
	const [dynamicFilters, setDynamicFilters] = useState({ rarities: [] });

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
	const [isFilterOpen, setIsFilterOpen] = usePersistentState(
		"itemsIsFilterOpen",
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
		return params.toString();
	}, [currentPage, searchTerm, selectedRarities, sortOrder]);

	// 2. Fetch API với Callback để tránh re-render rác
	const fetchItems = useCallback(async () => {
		setLoading(true);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(`${backendUrl}/api/items?${queryParams}`);
			if (!response.ok) throw new Error(`Lỗi: ${response.status}`);
			const data = await response.json();

			setItems(data.items || []);
			setPagination(data.pagination);
			if (data.availableFilters) setDynamicFilters(data.availableFilters);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [queryParams]);

	useEffect(() => {
		fetchItems();
	}, [fetchItems]);

	// 3. Tùy chọn bộ lọc động
	const filterOptions = useMemo(
		() => ({
			rarities: dynamicFilters.rarities.map(r => ({
				value: r,
				label: r,
				iconComponent: <RarityIcon rarity={r} />,
			})),
			sort: [
				{ value: "name-asc", label: "Tên A-Z" },
				{ value: "name-desc", label: "Tên Z-A" },
			],
		}),
		[dynamicFilters],
	);

	const handleSearch = () => {
		setSearchTerm(removeAccents(searchInput.trim()));
		setCurrentPage(1);
		if (window.innerWidth < 1024) setIsFilterOpen(false);
	};

	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedRarities([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	};

	if (loading && items.length === 0) return <LoadingSpinner />;

	return (
		<div>
			<PageTitle
				title='Danh sách vật phẩm'
				description='POC GUIDE: Vật phẩm Path of Champions...'
			/>
			<div>
				<h1 className='text-3xl font-bold mb-6 text-text-primary font-primary'>
					Danh Sách Vật Phẩm
				</h1>

				<div className='flex flex-col lg:flex-row gap-8'>
					<aside className='lg:w-1/5 w-full lg:sticky lg:top-24 h-fit'>
						{/* Mobile UI */}
						<div className='lg:hidden p-2 rounded-lg border border-border bg-surface-bg shadow-sm'>
							<div className='flex items-center gap-2'>
								<div className='flex-1 relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Vật phẩm...'
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
								className={`transition-all duration-300 overflow-visible ${isFilterOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
							>
								<div className='pt-4 space-y-4 border-t border-border mt-2'>
									<MultiSelectFilter
										label='Độ hiếm'
										options={filterOptions.rarities}
										selectedValues={selectedRarities}
										onChange={setSelectedRarities}
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

						{/* Desktop UI */}
						<div className='hidden lg:block p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
							<label className='block text-sm font-medium text-text-secondary'>
								Tìm kiếm
							</label>
							<InputField
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								onKeyPress={e => e.key === "Enter" && handleSearch()}
								placeholder='Nhập tên...'
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
							{items.length > 0 ? (
								<>
									<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
										{items.map(item => (
											<Link
												key={item.itemCode}
												to={`/item/${encodeURIComponent(item.itemCode)}`}
												className='group relative flex items-center gap-4 bg-surface-bg p-4 rounded-lg hover:bg-surface-hover transition border border-border hover:border-primary-500'
											>
												<SafeImage
													src={item.assetAbsolutePath}
													alt={item.name}
													className='w-16 h-16 object-cover rounded-md border'
												/>
												<div className='flex-grow'>
													<h3 className='font-bold text-lg text-text-primary'>
														{item.name}
													</h3>
													<div className='flex items-center gap-2 text-sm text-text-secondary'>
														<RarityIcon rarity={item.rarity} />
														<span>{item.rarity}</span>
													</div>
												</div>
												{/* Tooltip */}
												<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-10'>
													<p className='whitespace-pre-wrap'>
														{item.descriptionRaw}
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
									Không tìm thấy vật phẩm.
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ItemList;
