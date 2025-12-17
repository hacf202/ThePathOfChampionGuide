// src/pages/powerList.jsx
import React, { useState, useMemo, useEffect } from "react";
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

// --- Component phụ ---
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

// --- Component chính ---
function PowerList() {
	const [powers, setPowers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchInput, setSearchInput] = usePersistentState(
		"powersSearchInput",
		""
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"powersSearchTerm",
		""
	);
	const [selectedRarities, setSelectedRarities] = usePersistentState(
		"powersSelectedRarities",
		[]
	);
	const [selectedTypes, setSelectedTypes] = usePersistentState(
		"powersSelectedTypes",
		[]
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"powersSortOrder",
		"name-asc"
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"powersCurrentPage",
		1
	);
	const [isFilterOpen, setIsFilterOpen] = usePersistentState(
		"powersIsFilterOpen",
		false
	);

	// API
	const fetchPowers = async () => {
		setLoading(true);
		setError(null);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(`${backendUrl}/api/powers`);
			if (!response.ok) throw new Error(`Lỗi server: ${response.status}`);
			const data = await response.json();
			setPowers(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPowers();
	}, []);

	// Filter options
	const filterOptions = useMemo(() => {
		if (powers.length === 0) return { rarities: [], types: [], sort: [] };

		const rarities = [...new Set(powers.map(p => p.rarity))]
			.sort()
			.map(rarity => ({
				value: rarity,
				label: rarity,
				iconComponent: <RarityIcon rarity={rarity} />,
			}));

		const types = [...new Set(powers.flatMap(p => p.type).filter(Boolean))]
			.sort()
			.map(type => ({ value: type, label: type }));

		const sort = [
			{ value: "name-asc", label: "Tên A-Z" },
			{ value: "name-desc", label: "Tên Z-A" },
		];

		return { rarities, types, sort };
	}, [powers]);

	// Filter & sort
	const filteredPowers = useMemo(() => {
		let filtered = [...powers];
		if (searchTerm) {
			const normalized = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(p =>
				removeAccents(p.name.toLowerCase()).includes(normalized)
			);
		}
		if (selectedRarities.length > 0) {
			filtered = filtered.filter(p => selectedRarities.includes(p.rarity));
		}
		if (selectedTypes.length > 0) {
			filtered = filtered.filter(p =>
				p.type?.some(t => selectedTypes.includes(t))
			);
		}

		const [sortKey, sortDirection] = sortOrder.split("-");
		filtered.sort((a, b) => {
			const valA = a[sortKey] || "";
			const valB = b[sortKey] || "";
			return sortDirection === "asc"
				? valA.toString().localeCompare(valB.toString())
				: valB.toString().localeCompare(valA.toString());
		});

		return filtered;
	}, [powers, searchTerm, selectedRarities, selectedTypes, sortOrder]);

	// Handlers
	const handleSearch = () => {
		setSearchTerm(searchInput);
		setCurrentPage(1);
		// Tự động đóng filter trên mobile
		if (window.innerWidth < 1024) {
			setIsFilterOpen(false);
		}
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
		setCurrentPage(1);
	};

	const handleResetFilters = () => {
		handleClearSearch();
		setSelectedRarities([]);
		setSelectedTypes([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	};

	const handlePageChange = page => {
		if (page > 0 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	const totalPages = Math.ceil(filteredPowers.length / ITEMS_PER_PAGE);
	const paginatedPowers = filteredPowers.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	if (loading) return <LoadingSpinner />;
	if (error) return <ErrorMessage message={error} onRetry={fetchPowers} />;

	return (
		<div>
			<PageTitle
				title='Danh sách sức mạnh'
				description='POC GUIDE: Danh sách đầy đủ sức mạnh (Powers) Path of Champions: Common, Rare, Epic với hiệu ứng chi tiết, tier list S/A/B, combo mạnh nhất cho Jinx, LeBlanc, Swain... Lọc theo độ hiếm/loại, tooltip mô tả đầy đủ + hướng dẫn chọn power đánh boss Galio/A.Sol!'
				type='website'
			/>
			<div className='font-secondary'>
				<h1 className='text-3xl font-bold mb-6 text-text-primary font-primary'>
					Danh Sách Sức Mạnh
				</h1>

				<div className='flex flex-col lg:flex-row gap-8'>
					{/* FILTER - MOBILE & DESKTOP */}
					<aside className='lg:w-1/5 w-full lg:sticky lg:top-24 h-fit'>
						{/* Mobile: Collapsible */}
						<div className='lg:hidden p-2 rounded-lg border border-border bg-surface-bg shadow-sm'>
							<div className='flex items-center gap-2'>
								<div className='flex-1 relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Nhập tên sức mạnh...'
									/>
									{searchInput && (
										<button
											onClick={handleClearSearch}
											className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary'
										>
											<XCircle size={18} />
										</button>
									)}
								</div>
								<Button onClick={handleSearch} className='whitespace-nowrap'>
									<Search size={16} />
								</Button>
								<Button
									variant='outline'
									onClick={() => setIsFilterOpen(prev => !prev)}
									className='whitespace-nowrap'
								>
									{isFilterOpen ? (
										<ChevronUp size={18} />
									) : (
										<ChevronDown size={18} />
									)}
								</Button>
							</div>

							<div
								className={`transition-all duration-300 ease-in-out overflow-visible ${
									isFilterOpen
										? "max-h-[1000px] opacity-100"
										: "max-h-0 opacity-0"
								}`}
							>
								<div className='pt-4 space-y-4 border-t border-border'>
									<MultiSelectFilter
										label='Độ hiếm'
										options={filterOptions.rarities}
										selectedValues={selectedRarities}
										onChange={setSelectedRarities}
										placeholder='Tất cả Độ hiếm'
									/>
									<MultiSelectFilter
										label='Loại'
										options={filterOptions.types}
										selectedValues={selectedTypes}
										onChange={setSelectedTypes}
										placeholder='Tất cả Loại'
									/>
									<DropdownFilter
										label='Sắp xếp'
										options={filterOptions.sort}
										selectedValue={sortOrder}
										onChange={setSortOrder}
									/>
									<div className='pt-2'>
										<Button
											variant='outline'
											onClick={handleResetFilters}
											iconLeft={<RotateCw size={16} />}
											className='w-full'
										>
											Đặt lại bộ lọc
										</Button>
									</div>
								</div>
							</div>
						</div>

						{/* Desktop: Full */}
						<div className='hidden lg:block p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
							<div>
								<label className='block text-sm font-medium mb-1 text-text-secondary'>
									Tìm kiếm
								</label>
								<div className='relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Nhập tên sức mạnh...'
									/>
									{searchInput && (
										<button
											onClick={handleClearSearch}
											className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary'
										>
											<XCircle size={18} />
										</button>
									)}
								</div>
								<Button onClick={handleSearch} className='w-full mt-2'>
									<Search size={16} className='mr-2' /> Tìm kiếm
								</Button>
							</div>

							<MultiSelectFilter
								label='Độ hiếm'
								options={filterOptions.rarities}
								selectedValues={selectedRarities}
								onChange={setSelectedRarities}
								placeholder='Tất cả Độ hiếm'
							/>
							<MultiSelectFilter
								label='Loại'
								options={filterOptions.types}
								selectedValues={selectedTypes}
								onChange={setSelectedTypes}
								placeholder='Tất cả Loại'
							/>
							<DropdownFilter
								label='Sắp xếp'
								options={filterOptions.sort}
								selectedValue={sortOrder}
								onChange={setSortOrder}
							/>
							<div className='pt-2'>
								<Button
									variant='outline'
									onClick={handleResetFilters}
									iconLeft={<RotateCw size={16} />}
									className='w-full'
								>
									Đặt lại bộ lọc
								</Button>
							</div>
						</div>
					</aside>

					{/* MAIN CONTENT */}
					<div className='lg:w-4/5 w-full lg:order-first'>
						<div className='bg-surface-bg rounded-lg border border-border p-2 sm:p-6 shadow-sm'>
							{paginatedPowers.length > 0 ? (
								<>
									<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
										{paginatedPowers.map(power => (
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
												{/* Tooltip */}
												<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-10'>
													<p className='whitespace-pre-wrap'>
														{power.descriptionRaw}
													</p>
													<div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900'></div>
												</div>
											</Link>
										))}
									</div>

									{/* Số lượng kết quả */}
									<div className='text-center text-sm text-text-secondary mt-6 mb-2'>
										Hiển thị{" "}
										<span className='font-medium text-text-primary'>
											{(currentPage - 1) * ITEMS_PER_PAGE + 1}–
											{Math.min(
												currentPage * ITEMS_PER_PAGE,
												filteredPowers.length
											)}
										</span>{" "}
										trong{" "}
										<span className='font-medium text-text-primary'>
											{filteredPowers.length}
										</span>{" "}
										kết quả
									</div>

									{/* Phân trang */}
									{totalPages > 1 && (
										<div className='mt-4 flex justify-center items-center gap-2 md:gap-4'>
											<Button
												onClick={() => handlePageChange(currentPage - 1)}
												disabled={currentPage === 1}
												variant='outline'
											>
												Trang trước
											</Button>
											<span className='text-lg font-medium text-text-primary'>
												{currentPage} / {totalPages}
											</span>
											<Button
												onClick={() => handlePageChange(currentPage + 1)}
												disabled={currentPage === totalPages}
												variant='outline'
											>
												Trang sau
											</Button>
										</div>
									)}
								</>
							) : (
								<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
									<div>
										<p className='font-semibold text-lg'>
											Không tìm thấy sức mạnh nào phù hợp.
										</p>
										<p>Vui lòng thử lại với bộ lọc khác hoặc đặt lại bộ lọc.</p>
									</div>
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
