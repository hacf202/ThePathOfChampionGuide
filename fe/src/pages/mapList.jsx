// src/pages/adventureList.jsx
import React, { useState, useMemo } from "react";
import { usePersistentState } from "../hooks/usePersistentState";
import InputField from "../components/common/inputField";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import Button from "../components/common/button";
import PageTitle from "../components/common/pageTitle";
import DropdownFilter from "../components/common/dropdownFilter";
import AdventureCard from "../components/map/adventureCard";
import {
	Search,
	RotateCw,
	XCircle,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { removeAccents } from "../utils/vietnameseUtils";
import mapsData from "../assets/data/map.json";

const ITEMS_PER_PAGE = 12;

function AdventureList() {
	const adventures = mapsData;

	// --- States ---
	const [searchInput, setSearchInput] = usePersistentState(
		"advSearchInput",
		""
	);
	const [searchTerm, setSearchTerm] = usePersistentState("advSearchTerm", "");
	const [currentPage, setCurrentPage] = usePersistentState("advCurrentPage", 1);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const [selectedDifficulties, setSelectedDifficulties] = usePersistentState(
		"advSelectedDiff",
		[]
	);
	const [selectedTypes, setSelectedTypes] = usePersistentState(
		"advSelectedTypes",
		[]
	);
	const [selectedRegions, setSelectedRegions] = usePersistentState(
		"advSelectedRegions",
		[]
	);
	const [sortOption, setSortOption] = usePersistentState(
		"advSortOption",
		"diff_desc"
	);

	// --- Logic Options ---
	const typeOptions = useMemo(() => {
		const types = [
			...new Set(adventures.map(a => a.typeAdventure).filter(Boolean)),
		];
		return types.map(t => ({ value: t, label: t }));
	}, [adventures]);

	const regionOptions = useMemo(() => {
		const regions = new Set();
		adventures.forEach(adv => {
			if (Array.isArray(adv.requirement)) {
				adv.requirement.forEach(req => {
					if (req && req !== "ALL") regions.add(req);
				});
			}
		});
		return [...regions].map(r => ({ value: r, label: r }));
	}, [adventures]);

	const difficultyOptions = [
		{ value: "0", label: "0 - 1 Sao" },
		{ value: "1", label: "1 - 2 Sao" },
		{ value: "2", label: "2 - 3 Sao" },
		{ value: "3", label: "3 - 4 Sao" },
		{ value: "4", label: "4 - 5 Sao" },
		{ value: "5", label: "5 - 6 Sao" },
		{ value: "6", label: "6+ Sao " },
	];

	const sortOptions = [
		{ value: "diff_asc", label: "Độ khó: Thấp đến Cao" },
		{ value: "diff_desc", label: "Độ khó: Cao đến Thấp" },
		{ value: "xp_asc", label: "XP: Thấp đến Cao" },
		{ value: "xp_desc", label: "XP: Cao đến Thấp" },
	];

	// --- Search & Filter Logic ---
	const processedAdventures = useMemo(() => {
		let result = [...adventures];
		if (searchTerm) {
			const normalized = removeAccents(searchTerm.toLowerCase());
			result = result.filter(a => {
				const matchName =
					removeAccents(a.adventureName?.toLowerCase() || "").includes(
						normalized
					) ||
					removeAccents(a.adventureNameRef?.toLowerCase() || "").includes(
						normalized
					);
				const matchBoss = a.bosses?.some(b =>
					removeAccents(b.name.toLowerCase()).includes(normalized)
				);
				const matchReq = a.requirement?.some(r =>
					removeAccents(r.toLowerCase()).includes(normalized)
				);
				const matchReward = a.rewards?.some(rg =>
					rg.items?.some(i =>
						removeAccents(i.name.toLowerCase()).includes(normalized)
					)
				);
				return matchName || matchBoss || matchReq || matchReward;
			});
		}
		if (selectedDifficulties.length > 0)
			result = result.filter(a =>
				selectedDifficulties.includes(Math.floor(a.difficulty).toString())
			);
		if (selectedTypes.length > 0)
			result = result.filter(a => selectedTypes.includes(a.typeAdventure));
		if (selectedRegions.length > 0)
			result = result.filter(a =>
				a.requirement?.some(req => selectedRegions.includes(req))
			);

		result.sort((a, b) => {
			if (sortOption === "diff_asc") return a.difficulty - b.difficulty;
			if (sortOption === "diff_desc") return b.difficulty - a.difficulty;
			if (sortOption === "xp_asc")
				return (a.championXP || 0) - (b.championXP || 0);
			if (sortOption === "xp_desc")
				return (b.championXP || 0) - (a.championXP || 0);
			return 0;
		});
		return result;
	}, [
		adventures,
		searchTerm,
		selectedDifficulties,
		selectedTypes,
		selectedRegions,
		sortOption,
	]);

	const totalPages = Math.ceil(processedAdventures.length / ITEMS_PER_PAGE);
	const paginatedAdventures = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return processedAdventures.slice(start, start + ITEMS_PER_PAGE);
	}, [processedAdventures, currentPage]);

	// --- Handlers ---
	const handleSearch = () => {
		setSearchTerm(searchInput);
		setCurrentPage(1);
		if (window.innerWidth < 1024) setIsFilterOpen(false);
	};
	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
		setCurrentPage(1);
	};
	const handlePageChange = p => {
		if (p > 0 && p <= totalPages) {
			setCurrentPage(p);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};
	const handleResetFilters = () => {
		handleClearSearch();
		setSelectedDifficulties([]);
		setSelectedTypes([]);
		setSelectedRegions([]);
		setSortOption("diff_desc");
		setCurrentPage(1);
	};

	return (
		<div>
			<PageTitle title='Danh sách Bản Đồ' />
			<div className='font-secondary md:px-0'>
				<h1 className='text-3xl font-bold mb-6 text-primary font-primary'>
					Danh Sách Bản Đồ
				</h1>

				{/* Bố cục: lg:flex-row để Content bên trái, Sidebar bên phải */}
				<div className='flex flex-col lg:flex-row gap-8'>
					{/* --- MAIN CONTENT (BÊN TRÁI) --- */}
					<div className='lg:w-3/4 w-full order-2 lg:order-1'>
						<div className='bg-surface-bg rounded-lg border border-border p-0 sm:p-6 shadow-sm min-h-[500px]'>
							{paginatedAdventures.length > 0 ? (
								<>
									<div className='grid grid-cols-1 gap-6'>
										{paginatedAdventures.map((adv, index) => (
											<AdventureCard
												key={`${adv.adventureName}-${index}`}
												adventure={adv}
												onFilterClick={val => {
													setSearchInput(val === "ALL" ? "" : val);
													setSearchTerm(val === "ALL" ? "" : val);
													setCurrentPage(1);
													window.scrollTo({ top: 0, behavior: "smooth" });
												}}
											/>
										))}
									</div>

									{/* Pagination info */}
									<div className='text-center text-base text-primary-500 mt-8 mb-2'>
										Hiển thị{" "}
										<span className='font-bold'>
											{(currentPage - 1) * ITEMS_PER_PAGE + 1}–
											{Math.min(
												currentPage * ITEMS_PER_PAGE,
												processedAdventures.length
											)}
										</span>{" "}
										trong{" "}
										<span className='font-bold'>
											{processedAdventures.length}
										</span>{" "}
										kết quả
									</div>

									{totalPages > 1 && (
										<div className='mt-4 flex justify-center items-center gap-4'>
											<Button
												onClick={() => handlePageChange(currentPage - 1)}
												disabled={currentPage === 1}
												variant='outline'
											>
												Trang trước
											</Button>
											<span className='text-lg font-bold text-primary-500'>
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
								<div className='flex flex-col items-center justify-center h-full min-h-[400px] text-text-secondary opacity-50'>
									<Search size={64} className='mb-4' />
									<p className='font-bold text-xl'>
										Không tìm thấy bản đồ nào!
									</p>
									<Button
										variant='outline'
										onClick={handleResetFilters}
										className='mt-4'
									>
										Xóa tất cả bộ lọc
									</Button>
								</div>
							)}
						</div>
					</div>

					{/* --- SIDEBAR BỘ LỌC (BÊN PHẢI) --- */}
					<aside className='lg:w-1/4 w-full lg:sticky lg:top-24 h-fit order-1 lg:order-2'>
						{/* Mobile View */}
						<div className='lg:hidden p-2 rounded-lg border border-border bg-surface-bg shadow-sm mb-4'>
							<div className='flex items-center gap-2'>
								<div className='flex-1 relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Map, boss, item...'
									/>
									{searchInput && (
										<button
											onClick={handleClearSearch}
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
								className={`${
									isFilterOpen ? "block" : "hidden"
								} pt-4 space-y-4 border-t border-border mt-2`}
							>
								<MultiSelectFilter
									label='Độ khó'
									options={difficultyOptions}
									selectedValues={selectedDifficulties}
									onChange={setSelectedDifficulties}
								/>
								<MultiSelectFilter
									label='Chiến dịch'
									options={typeOptions}
									selectedValues={selectedTypes}
									onChange={setSelectedTypes}
								/>
								<MultiSelectFilter
									label='Vùng'
									options={regionOptions}
									selectedValues={selectedRegions}
									onChange={setSelectedRegions}
								/>
								<DropdownFilter
									label='Sắp xếp'
									options={sortOptions}
									selectedValue={sortOption}
									onChange={setSortOption}
								/>
								<Button
									variant='outline'
									onClick={handleResetFilters}
									iconLeft={<RotateCw size={16} />}
									className='w-full'
								>
									Đặt lại
								</Button>
							</div>
						</div>

						{/* Desktop View */}
						<div className='hidden lg:block p-4 rounded-lg border border-border bg-surface-bg space-y-6 shadow-sm'>
							<div>
								<label className='block text-base font-medium mb-1 text-primary'>
									Tìm kiếm
								</label>
								<div className='relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Map, boss, item...'
									/>
									{searchInput && (
										<button
											onClick={handleClearSearch}
											className='absolute right-3 top-1/2 -translate-y-1/2'
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
								label='Độ khó'
								options={difficultyOptions}
								selectedValues={selectedDifficulties}
								onChange={setSelectedDifficulties}
							/>
							<MultiSelectFilter
								label='Chiến dịch'
								options={typeOptions}
								selectedValues={selectedTypes}
								onChange={setSelectedTypes}
							/>
							<MultiSelectFilter
								label='Vùng yêu cầu'
								options={regionOptions}
								selectedValues={selectedRegions}
								onChange={setSelectedRegions}
							/>
							<DropdownFilter
								label='Sắp xếp theo'
								options={sortOptions}
								selectedValue={sortOption}
								onChange={setSortOption}
							/>
							<Button
								variant='outline'
								onClick={handleResetFilters}
								iconLeft={<RotateCw size={16} />}
								className='w-full'
							>
								Đặt lại bộ lọc
							</Button>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}

export default AdventureList;
