// src/pages/championList.jsx
import React, { useState, useMemo, useEffect } from "react";
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

const LoadingSpinner = () => (
	<div className='flex justify-center items-center h-64'>
		<div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500'></div>
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

function ChampionList() {
	const [champions, setChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [searchInput, setSearchInput] = usePersistentState(
		"championsSearchInput",
		""
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"championsSearchTerm",
		""
	);
	const [selectedRegions, setSelectedRegions] = usePersistentState(
		"championsSelectedRegions",
		[]
	);
	const [selectedCosts, setSelectedCosts] = usePersistentState(
		"championsSelectedCosts",
		[]
	);
	const [selectedMaxStars, setSelectedMaxStars] = usePersistentState(
		"championsSelectedMaxStars",
		[]
	);
	const [selectedTags, setSelectedTags] = usePersistentState(
		"championsSelectedTags",
		[]
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"championsSortOrder",
		"name-asc"
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"championsCurrentPage",
		1
	);
	const [isFilterOpen, setIsFilterOpen] = usePersistentState(
		"championsIsFilterOpen",
		false
	);

	// === FETCH DATA ===
	const fetchChampions = async () => {
		setLoading(true);
		setError(null);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(`${backendUrl}/api/champions`);
			if (!response.ok) throw new Error(`Lỗi server: ${response.status}`);
			const data = await response.json();

			// Chuẩn hóa dữ liệu cho frontend (avatar + đảm bảo kiểu dữ liệu)
			const formatted = data.map(champ => ({
				...champ,
				// Lấy avatar đúng theo cấu trúc mới
				avatarUrl:
					champ.assets?.[0]?.avatar ||
					champ.assets?.[0]?.fullAbsolutePath ||
					"/fallback-champion.png",
				// Đảm bảo cost và maxStar là số
				cost: Number(champ.cost) || 0,
				maxStar: Number(champ.maxStar) || 3,
			}));

			setChampions(formatted);
		} catch (err) {
			setError(err.message);
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchChampions();
	}, []);

	// === FILTER OPTIONS ===
	const filterOptions = useMemo(() => {
		if (champions.length === 0)
			return { regions: [], costs: [], maxStars: [], tags: [], sort: [] };

		const regions = [...new Set(champions.flatMap(c => c.regions || []))]
			.sort()
			.map(regionName => {
				const regionData = iconRegions.find(r => r.name === regionName);
				return {
					value: regionName,
					label: regionName,
					iconUrl: regionData?.iconAbsolutePath ?? "/fallback-image.svg",
				};
			});

		const costs = [...new Set(champions.map(c => c.cost))]
			.filter(c => c > 0)
			.sort((a, b) => a - b)
			.map(cost => ({ value: cost, isCost: true }));

		const maxStars = [...new Set(champions.map(c => c.maxStar))]
			.sort((a, b) => a - b)
			.map(star => ({ value: star, isStar: true }));

		const tags = [...new Set(champions.flatMap(c => c.tag || []))]
			.sort()
			.map(tag => ({ value: tag, label: tag, isTag: true }));

		const sort = [
			{ value: "name-asc", label: "Tên A-Z" },
			{ value: "name-desc", label: "Tên Z-A" },
			{ value: "cost-asc", label: "Năng lượng thấp-cao" },
			{ value: "cost-desc", label: "Năng lượng cao-thấp" },
		];

		return { regions, costs, maxStars, tags, sort };
	}, [champions]);

	// === FILTER + SORT ===
	const filteredChampions = useMemo(() => {
		let filtered = [...champions];

		// Tìm kiếm không dấu
		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(c =>
				removeAccents(c.name.toLowerCase()).includes(term)
			);
		}

		if (selectedRegions.length > 0)
			filtered = filtered.filter(c =>
				c.regions?.some(r => selectedRegions.includes(r))
			);
		if (selectedCosts.length > 0)
			filtered = filtered.filter(c => selectedCosts.includes(c.cost));
		if (selectedMaxStars.length > 0)
			filtered = filtered.filter(c => selectedMaxStars.includes(c.maxStar));
		if (selectedTags.length > 0)
			filtered = filtered.filter(c =>
				c.tag?.some(t => selectedTags.includes(t))
			);

		// Sắp xếp
		const [sortKey, sortDir] = sortOrder.split("-");
		filtered.sort((a, b) => {
			let valA = sortKey === "name" ? a.name : a[sortKey];
			let valB = sortKey === "name" ? b.name : b[sortKey];

			if (typeof valA === "string") {
				return sortDir === "asc"
					? valA.localeCompare(valB)
					: valB.localeCompare(valA);
			}
			return sortDir === "asc" ? valA - valB : valB - valA;
		});

		return filtered;
	}, [
		champions,
		searchTerm,
		selectedRegions,
		selectedCosts,
		selectedMaxStars,
		selectedTags,
		sortOrder,
	]);

	// Pagination
	const totalPages = Math.ceil(filteredChampions.length / ITEMS_PER_PAGE);
	const paginatedChampions = filteredChampions.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	// Handlers
	const handleSearch = () => {
		setSearchTerm(searchInput.trim());
		setCurrentPage(1);
		if (window.innerWidth < 1024) setIsFilterOpen(false);
	};
	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
		setCurrentPage(1);
	};
	const handleResetFilters = () => {
		handleClearSearch();
		setSelectedRegions([]);
		setSelectedCosts([]);
		setSelectedMaxStars([]);
		setSelectedTags([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	};

	if (loading) return <LoadingSpinner />;
	if (error) return <ErrorMessage message={error} onRetry={fetchChampions} />;

	return (
		<div>
			<PageTitle
				title='Danh sách tướng'
				description='POC GUIDE: Tier list tướng S/A/B Path of Champions mới nhất 2025: Jinx, LeBlanc, Swain, A.Sol, Viktor dẫn đầu! Lọc theo vùng (Demacia/Noxus), năng lượng, sao tối đa, thẻ. Build relic/power/rune tối ưu + chiến thuật đánh boss Galio dễ dàng!'
				type='website'
			/>
			<div className='font-secondary'>
				<h1 className='text-3xl font-bold mb-6 text-text-primary font-primary'>
					Danh Sách Tướng
				</h1>

				<div className='flex flex-col lg:flex-row gap-8'>
					{/* === FILTER SIDEBAR (giữ nguyên hoàn toàn giao diện cũ) === */}
					<aside className='lg:w-1/5 w-full lg:sticky lg:top-24 h-fit'>
						{/* Mobile */}
						<div className='lg:hidden p-2 rounded-lg border border-border bg-surface-bg'>
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
									onClick={() => setIsFilterOpen(p => !p)}
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
								className={`transition-all duration-300 ease-in-out overflow-visible${
									isFilterOpen
										? "max-h-[1200px] opacity-100"
										: "max-h-0 opacity-0"
								}`}
							>
								<div className='pt-4 space-y-4 border-t border-border'>
									<MultiSelectFilter
										label='Vùng'
										options={filterOptions.regions}
										selectedValues={selectedRegions}
										onChange={setSelectedRegions}
										placeholder='Tất cả Vùng'
									/>
									<MultiSelectFilter
										label='Năng lượng'
										options={filterOptions.costs}
										selectedValues={selectedCosts}
										onChange={setSelectedCosts}
										placeholder='Tất cả Năng lượng'
									/>
									<MultiSelectFilter
										label='Số sao tối đa'
										options={filterOptions.maxStars}
										selectedValues={selectedMaxStars}
										onChange={setSelectedMaxStars}
										placeholder='Tất cả Sao'
									/>
									<MultiSelectFilter
										label='Thẻ'
										options={filterOptions.tags}
										selectedValues={selectedTags}
										onChange={setSelectedTags}
										placeholder='Tất cả Thẻ'
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

						{/* Desktop */}
						<div className='hidden lg:block p-4 rounded-lg border border-border bg-surface-bg space-y-4'>
							<div>
								<label className='block text-sm font-medium mb-1 text-text-secondary'>
									Tìm kiếm tướng
								</label>
								<div className='relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Nhập tên tướng...'
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
								label='Vùng'
								options={filterOptions.regions}
								selectedValues={selectedRegions}
								onChange={setSelectedRegions}
								placeholder='Tất cả Vùng'
							/>
							<MultiSelectFilter
								label='Năng lượng'
								options={filterOptions.costs}
								selectedValues={selectedCosts}
								onChange={setSelectedCosts}
								placeholder='Tất cả Năng lượng'
							/>
							<MultiSelectFilter
								label='Số sao tối đa'
								options={filterOptions.maxStars}
								selectedValues={selectedMaxStars}
								onChange={setSelectedMaxStars}
								placeholder='Tất cả Sao'
							/>
							<MultiSelectFilter
								label='Thẻ'
								options={filterOptions.tags}
								selectedValues={selectedTags}
								onChange={setSelectedTags}
								placeholder='Tất cả Thẻ'
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

					{/* === MAIN CONTENT === */}
					<div className='lg:w-4/5 w-full lg:order-first'>
						<div className='bg-surface-bg rounded-lg border border-border p-2 sm:p-6'>
							{paginatedChampions.length > 0 ? (
								<>
									<div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
										{paginatedChampions.map(champion => (
											<Link
												key={champion.championID} // Dùng championID làm key thay vì name
												to={`/champion/${champion.championID}`} // Link theo ID, không bị lỗi ký tự đặc biệt
												className='hover:scale-105 transition-transform duration-200'
											>
												<ChampionCard champion={champion} />
											</Link>
										))}
									</div>

									<div className='text-center text-sm text-text-secondary mt-6 mb-2'>
										Hiển thị{" "}
										<span className='font-medium text-text-primary'>
											{(currentPage - 1) * ITEMS_PER_PAGE + 1}–
											{Math.min(
												currentPage * ITEMS_PER_PAGE,
												filteredChampions.length
											)}
										</span>{" "}
										trong{" "}
										<span className='font-medium text-text-primary'>
											{filteredChampions.length}
										</span>{" "}
										kết quả
									</div>

									{totalPages > 1 && (
										<div className='mt-4 flex justify-center items-center gap-2 md:gap-4'>
											<Button
												onClick={() => setCurrentPage(p => p - 1)}
												disabled={currentPage === 1}
												variant='outline'
											>
												Trang trước
											</Button>
											<span className='text-lg font-medium text-text-primary'>
												{currentPage} / {totalPages}
											</span>
											<Button
												onClick={() => setCurrentPage(p => p + 1)}
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
											Không tìm thấy tướng nào phù hợp.
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

export default ChampionList;
