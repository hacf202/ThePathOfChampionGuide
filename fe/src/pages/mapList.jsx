// src/pages/adventureList.jsx
import React, { useState, useMemo } from "react";
import { usePersistentState } from "../hooks/usePersistentState";
import InputField from "../components/common/inputField";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import Button from "../components/common/button";
import PageTitle from "../components/common/pageTitle";
import {
	Search,
	RotateCw,
	XCircle,
	Star,
	StarHalf,
	Trophy,
	Skull,
	Map,
	Info,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { removeAccents } from "../utils/vietnameseUtils";
import mapsData from "../assets/data/map.json";

const ITEMS_PER_PAGE = 12; // Số lượng map trên 1 trang

// --- Component: Star Rating ---
const StarRating = ({ count }) => {
	return (
		<div
			className='flex items-center text-yellow-500'
			title={`Độ khó: ${count} sao`}
		>
			{[...Array(7)].map((_, i) => {
				const starValue = i + 1;
				if (count >= starValue) {
					return (
						<Star key={i} size={16} className='fill-current' strokeWidth={0} />
					);
				} else if (count >= starValue - 0.5) {
					return (
						<StarHalf
							key={i}
							size={16}
							className='fill-current'
							strokeWidth={0}
						/>
					);
				} else {
					return (
						<Star key={i} size={16} className='text-white' strokeWidth={1.5} />
					);
				}
			})}
			<span className='ml-1.5 text-base font-bold text-white'>({count})</span>
		</div>
	);
};

// --- Component Card: Adventure Item (Phiên bản Pro UI) ---
const AdventureCard = ({ adventure }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div
			className={`
        group relative flex flex-col rounded-xl border transition-all duration-500 overflow-hidden isolate
        ${
					isExpanded
						? "border-primary-500 shadow-[0_0_20px_rgba(var(--primary-500),0.3)] bg-surface-bg"
						: "border-border/60 hover:border-primary-500/80 bg-surface-bg"
				}
      `}
		>
			{/* --- BACKGROUND IMAGE LAYER --- */}
			{/* Lớp này nằm dưới cùng (z-[-1]) để không đè lên nội dung */}
			{adventure.image && (
				<div className='absolute inset-0 -z-10 pointer-events-none select-none overflow-hidden rounded-xl'>
					<img
						src={adventure.image}
						alt=''
						className={`
              w-full h-full object-cover object-top transition-all duration-700 ease-out
              ${
								isExpanded
									? "scale-100 opacity-70 "
									: "scale-100 opacity-100  group-hover:opacity-100"
							}
            `}
					/>
					\{/* Gradient 2: Tối dần từ trái sang (Để làm nổi bật Tiêu đề) */}
					<div className='absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent' />
					{/* Lớp phủ màu Primary nhẹ khi hover để tạo cảm giác đồng bộ */}
					<div className='absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay' />
				</div>
			)}

			{/* --- CONTENT WRAPPER --- */}
			<div className='relative z-10 flex flex-col h-full'>
				{/* --- HEADER (Luôn hiển thị) --- */}
				<div
					className='p-4 cursor-pointer'
					onClick={() => setIsExpanded(!isExpanded)}
				>
					<div className='flex justify-between items-start gap-3 mb-2'>
						<div className='min-w-0 relative'>
							{/* Hiệu ứng glow nhẹ sau chữ tiêu đề */}
							<h3 className='font-bold text-xl md:text-4xl text-white font-primary truncate drop-shadow-md relative z-10'>
								{adventure.adventureName}
							</h3>
							<p className='text-base text-white italic truncate relative z-10'>
								{adventure.adventureNameRef}
							</p>
						</div>

						{/* XP Badge - Glass style */}
						<div className='shrink-0 bg-surface-bg/40 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-xl text-white font-bold shadow-sm whitespace-nowrap'>
							{adventure.championXP} XP
						</div>
					</div>

					<div className='flex flex-wrap items-center gap-2 mb-3 relative z-10'>
						<div className='flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full border border-white/5 backdrop-blur-[2px]'>
							<StarRating count={adventure.difficulty} />
						</div>
						<span className='text-white/50'>|</span>
						<div className='flex items-center gap-1.5 text-base text-white bg-black/20 px-2 py-0.5 rounded-full border border-white/5 backdrop-blur-[2px]'>
							<Map size={14} className='text-primary-400' />
							<span className='truncate max-w-[230px] drop-shadow-sm'>
								{adventure.typeAdventure}
							</span>
						</div>
					</div>

					{/* Boss Preview */}
					<div className='flex items-center justify-between mt-2 pt-2 border-t border-white/10'>
						<div className='flex items-center gap-2 text-base text-white group-hover:text-white transition-colors'>
							<div className='p-1 bg-danger-text-dark/10 rounded-full'>
								<Skull size={14} className='text-danger-text-dark' />
							</div>
							<span className='truncate'>
								<span className='font-medium'>{adventure.bosses[0]?.name}</span>
								{!isExpanded && adventure.bosses.length > 1 && (
									<span className='text-base ml-1.5 px-1.5 py-0.5 bg-surface-hover/50 rounded text-white'>
										+{adventure.bosses.length - 1}
									</span>
								)}
							</span>
						</div>

						<button
							className={`
                w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/70 text-white hover:text-primary-500 transition-all duration-300
                ${isExpanded ? "rotate-180 bg-white/50" : ""}
              `}
						>
							<ChevronDown size={20} />
						</button>
					</div>
				</div>

				{/* --- DETAILED INFO (Expandable Area) --- */}
				{/* Sử dụng grid template rows để animation mượt mà hơn height */}
				<div
					className={`
            grid transition-[grid-template-rows] duration-300 ease-out
            ${
							isExpanded
								? "grid-rows-[1fr] opacity-100"
								: "grid-rows-[0fr] opacity-0"
						}
          `}
				>
					<div className='overflow-hidden'>
						{/* Nội dung chi tiết được bọc trong lớp kính mờ */}
						<div className='md:px-4 pb-4 pt-1 bg-surface-bg/40 backdrop-blur-xl md:mx-2 mb-2 rounded-lg border border-white/5 shadow-inner'>
							{/* Boss List */}
							{adventure.bosses.length > 0 && (
								<div className='mb-4 mt-3'>
									<h4 className='text-base font-bold text-white uppercase mb-2 ml-1'>
										Trùm
									</h4>
									<div className='grid grid-cols-1 gap-2'>
										{adventure.bosses.map((boss, idx) => (
											<div
												key={idx}
												className='flex justify-between items-center text-base p-2 rounded bg-black/20 border border-white/5 hover:border-primary-500/30 transition-colors'
											>
												<span className='font-bold text-white text-base flex items-center gap-2'>
													<span className='w-1.5 h-1.5 rounded-full bg-danger-text-dark'></span>
													{boss.name}
												</span>
												<span className='text-base text-white  px-2 py-0.5 '>
													{boss.power}
												</span>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Rewards Table */}
							<div className='mb-4 rounded-lg overflow-hidden border border-border/60 shadow-sm'>
								<table className='w-full text-base text-left'>
									<thead className='text-base text-white uppercase bg-surface-hover/80'>
										<tr>
											<th className='px-3 py-2 w-1/3 border-r border-border/50'>
												Yêu cầu
											</th>
											<th className='px-3 py-2'>Phần thưởng</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-border/50 bg-surface-bg/60'>
										{adventure.requirement
											.slice(0, adventure.rewards.length)
											.map((req, idx) => (
												<tr
													key={idx}
													className='hover:bg-white/5 transition-colors'
												>
													<td className='px-3 py-2 font-bold text-white border-r border-border/50 text-base'>
														{req === "ALL" ? (
															<span className='text-primary-400 font-bold bg-primary-500/10 px-1.5 py-0.5 rounded'>
																Tướng Bất Kỳ
															</span>
														) : (
															req
														)}
													</td>
													<td className='px-3 py-2 text-white text-base'>
														{adventure.rewards[idx]?.items.map((item, i) => (
															<div
																key={i}
																className='flex items-center gap-1.5 py-0.5'
															>
																<span className=' text-warp '>
																	{item.count} {item.name}
																</span>
															</div>
														))}
													</td>
												</tr>
											))}
									</tbody>
								</table>
							</div>

							{/* Special Rules */}
							{adventure.specialRules && adventure.specialRules.length > 0 && (
								<div className='px-2 pb-4 pt-1 bg-surface-bg/40 backdrop-blur-xl md:mx-2 mb-2 rounded-lg border border-white/50 shadow-inner'>
									<h4 className='text-base font-bold text-white uppercase mb-2 ml-1'>
										Luật Chơi Đặc Biệt
									</h4>
									{/* Dải trang trí bên trái */}
									<div className='absolute left-0 top-0 bottom-0 w-1 bg-white'></div>

									<div className='flex justify-between items-center text-base p-2 rounded bg-black/20 border border-white/50 hover:border-primary-500/30 transition-colors'>
										<ul className='space-y-1 text-white'>
											{adventure.specialRules.map((rule, i) => (
												<li key={i} className='flex items-start gap-1.5 '>
													{rule}
												</li>
											))}
										</ul>
									</div>
								</div>
							)}

							<div className='text-center pt-1 '>
								<Button
									variant='outline'
									size='sm'
									onClick={e => {
										e.stopPropagation();
										setIsExpanded(false);
									}}
									className='w-full h-8 text-base border-white hover:bg-white/5 hover:text-primary-400'
								>
									Thu gọn
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// --- Main Component ---
function AdventureList() {
	const adventures = mapsData;

	// States
	const [searchInput, setSearchInput] = usePersistentState(
		"advSearchInput",
		""
	);
	const [searchTerm, setSearchTerm] = usePersistentState("advSearchTerm", "");
	const [selectedDifficulties, setSelectedDifficulties] = usePersistentState(
		"advSelectedDiff",
		[]
	);
	const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile filter toggle
	const [currentPage, setCurrentPage] = usePersistentState("advCurrentPage", 1);

	// Filter Options
	const difficultyOptions = [
		{ value: "0", label: "0 - 1 Sao" },
		{ value: "1", label: "1 - 2 Sao" },
		{ value: "2", label: "2 - 3 Sao" },
		{ value: "3", label: "3 - 4 Sao" },
		{ value: "4", label: "4 - 5 Sao" },
		{ value: "5", label: "5 - 6 Sao" },
		{ value: "6", label: "6+ Sao " },
	];

	// Filter Logic
	const filteredAdventures = useMemo(() => {
		let result = [...adventures];
		if (searchTerm) {
			const normalized = removeAccents(searchTerm.toLowerCase());
			result = result.filter(
				a =>
					removeAccents(a.adventureName.toLowerCase()).includes(normalized) ||
					removeAccents(a.adventureNameRef.toLowerCase()).includes(
						normalized
					) ||
					a.bosses.some(b =>
						removeAccents(b.name.toLowerCase()).includes(normalized)
					)
			);
		}
		if (selectedDifficulties.length > 0) {
			result = result.filter(a =>
				selectedDifficulties.includes(Math.floor(a.difficulty).toString())
			);
		}
		return result;
	}, [adventures, searchTerm, selectedDifficulties]);

	// Pagination Logic
	const totalPages = Math.ceil(filteredAdventures.length / ITEMS_PER_PAGE);
	const paginatedAdventures = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredAdventures.slice(start, start + ITEMS_PER_PAGE);
	}, [filteredAdventures, currentPage]);

	// Handlers
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

	const handlePageChange = page => {
		if (page > 0 && page <= totalPages) {
			setCurrentPage(page);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const handleResetFilters = () => {
		handleClearSearch();
		setSelectedDifficulties([]);
		setCurrentPage(1);
	};

	return (
		<div>
			<PageTitle
				title='Danh sách Bản Đồ'
				description='Tổng hợp các cuộc phiêu lưu (Adventure) Path of Champions.'
				type='website'
			/>
			<div className='font-secondary'>
				<h1 className='text-3xl font-bold mb-6 text-primary font-primary'>
					Danh Sách Bản Đồ
				</h1>

				<div className='flex flex-col lg:flex-row gap-8'>
					{/* --- SIDEBAR (FILTER) --- */}
					<aside className='lg:w-1/5 w-full lg:sticky lg:top-24 h-fit'>
						{/* Mobile: Collapsible (Giống hệt mẫu) */}
						<div className='lg:hidden p-2 rounded-lg border border-border bg-surface-bg shadow-sm'>
							<div className='flex items-center gap-2'>
								<div className='flex-1 relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Tên map, boss...'
									/>
									{searchInput && (
										<button
											onClick={handleClearSearch}
											className='absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white'
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
								className={`transition-all duration-300 ease-in-out overflow-hidden ${
									isFilterOpen
										? "max-h-[1000px] opacity-100"
										: "max-h-0 opacity-0"
								}`}
							>
								<div className='pt-4 space-y-4 border-t border-border'>
									<MultiSelectFilter
										label='Độ khó'
										options={difficultyOptions}
										selectedValues={selectedDifficulties}
										onChange={setSelectedDifficulties}
										placeholder='Tất cả độ khó'
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

						{/* Desktop: Full (Giống hệt mẫu) */}
						<div className='hidden lg:block p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
							<div>
								<label className='block text-base font-medium mb-1 text-primary'>
									Tìm kiếm
								</label>
								<div className='relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Tên map, boss...'
									/>
									{searchInput && (
										<button
											onClick={handleClearSearch}
											className='absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white'
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
								placeholder='Tất cả độ khó'
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

					{/* --- MAIN CONTENT --- */}
					{/* lg:order-first: Đẩy nội dung lên trước (về bên trái) trên màn hình lớn */}
					<div className='lg:w-4/5 w-full lg:order-first'>
						<div className='bg-surface-bg rounded-lg border border-border p-1 sm:p-6 shadow-sm min-h-[500px]'>
							{paginatedAdventures.length > 0 ? (
								<>
									<div className='grid grid-cols-1 gap-4'>
										{paginatedAdventures.map((adv, index) => (
											<AdventureCard key={index} adventure={adv} />
										))}
									</div>

									{/* Số lượng kết quả */}
									<div className='text-center text-base text-primary-500 mt-6 mb-2'>
										Hiển thị{" "}
										<span className='font-medium text-primary-500'>
											{(currentPage - 1) * ITEMS_PER_PAGE + 1}–
											{Math.min(
												currentPage * ITEMS_PER_PAGE,
												filteredAdventures.length
											)}
										</span>{" "}
										trong{" "}
										<span className='font-medium text-primary-500'>
											{filteredAdventures.length}
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
											<span className='text-lg font-medium text-primary-500'>
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
								<div className='flex items-center justify-center h-full min-h-[300px] text-center text-white'>
									<div>
										<Search size={48} className='mx-auto mb-4 opacity-20' />
										<p className='font-semibold text-lg'>
											Không tìm thấy bản đồ nào phù hợp.
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

export default AdventureList;
