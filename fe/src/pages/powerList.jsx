// src/pages/powerList.jsx
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

function PowerList() {
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

	// 1. TỐI ƯU: Memoize Query Params
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

	// 2. Fetch API - Chỉ nhận 21 items từ Server
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
			setLoading(false);
		}
	}, [queryParams]);

	useEffect(() => {
		fetchPowers();
	}, [fetchPowers]);

	// 3. Tối ưu Filter Options dựa trên 1000+ items từ CSDL
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
		setSortOrder("name-asc");
		setCurrentPage(1);
	};

	if (loading && powers.length === 0) return <LoadingSpinner />;

	return (
		<div>
			<PageTitle
				title='Danh sách sức mạnh'
				description='Dữ liệu 1000+ sức mạnh Path of Champions.'
			/>
			<div className='font-secondary'>
				<h1 className='text-3xl font-bold mb-6 text-text-primary font-primary'>
					Danh Sách Sức Mạnh
				</h1>

				<div className='flex flex-col lg:flex-row gap-8'>
					<aside className='lg:w-1/5 w-full lg:sticky lg:top-24 h-fit'>
						<div className='p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
							<label className='block text-sm font-medium text-text-secondary'>
								Tìm kiếm
							</label>
							<InputField
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								onKeyPress={e => e.key === "Enter" && handleSearch()}
								placeholder='Tên sức mạnh...'
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
					</aside>

					<div className='lg:w-4/5 w-full lg:order-first'>
						<div className='bg-surface-bg rounded-lg border border-border p-2 sm:p-6 shadow-sm min-h-[500px]'>
							{powers.length > 0 ? (
								<>
									<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
										{powers.map(power => (
											<Link
												key={power.powerCode}
												to={`/power/${encodeURIComponent(power.powerCode)}`}
												className='group relative flex items-center gap-4 bg-surface-bg p-4 rounded-lg hover:bg-surface-hover transition border border-border hover:border-primary-500'
											>
												<SafeImage
													src={power.assetAbsolutePath}
													alt={power.name}
													className='w-16 h-16 object-cover rounded-md border'
												/>
												<div className='flex-grow'>
													<h3 className='font-bold text-lg text-text-primary'>
														{power.name}
													</h3>
													<div className='flex items-center gap-2 text-sm text-text-secondary'>
														<RarityIcon rarity={power.rarity} />
														<span>{power.rarity}</span>
													</div>
												</div>
												<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-10'>
													<p className='whitespace-pre-wrap'>
														{power.descriptionRaw}
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
										<span className='font-bold text-primary-500 text-sm'>
											{currentPage} / {pagination.totalPages} (
											{pagination.totalItems} kết quả)
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
									Không tìm thấy sức mạnh nào.
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PowerList;
