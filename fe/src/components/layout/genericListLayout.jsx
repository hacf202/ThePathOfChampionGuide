// src/components/layout/GenericListLayout.jsx
import React, { useState, useEffect, useRef } from "react";

import {
	Search,
	RotateCw,
	XCircle,
	ChevronDown,
	ChevronUp,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import Button from "@/components/common/button";
import InputField from "@/components/common/inputField";
import PageTitle from "@/components/common/pageTitle";
import { useTranslation } from "@/hooks/useTranslation";
import { StaggerContainer, StaggerItem } from "@/components/common/animations";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { flushSync } from "react-dom";

gsap.registerPlugin(Flip);

const GenericListLayout = ({
	pageTitle,
	pageDescription,
	heading,

	// --- Data & Pagination ---
	data,
	loading,
	pagination,
	currentPage,
	onPageChange,
	isInfiniteScroll = false, // Chế độ cuộn vô hạn
	hasNextPage = false, // Kiểm tra còn trang tiếp theo không

	// --- Search ---
	searchValue,
	onSearchChange,
	onSearchSubmit,
	searchPlaceholder,

	// --- Actions & Filters ---
	onResetFilters,
	renderFilters, // Hàm trả về các component filter (MultiSelect, Dropdown)
	renderItem, // Hàm trả về component thẻ item (ChampionCard, RelicCard...)
	renderSkeleton = () => (
		<div className='bg-surface-hover/20 animate-pulse rounded-lg h-64 border border-border/40' />
	), // Hàm mặc định trả về skeleton loading 
	skeletonCount = 12,
	emptyMessage, // Thông báo khi không có dữ liệu
	customHeaderActions = null, // Nút bấm tùy chỉnh ở góc trên cùng (VD: Tạo Build)
	customTabs = null, // Các tab chuyển đổi (VD: Community / My Builds)
	// --- Layout Customization ---
	gridClassName, // Chuỗi class hoặc Hàm nhận vào showDesktopFilter trả về chuỗi class
	itemClassName, // Hàm nhận vào item trả về chuỗi class (VD: 'col-span-full')
	showFilterToggle = true, // Ẩn/Hiện nút chuyển đổi bộ lọc
	isFiltered = false, // Chỉ định nếu có bộ lọc đang kích hoạt (để hiển thị thông báo trống phù hợp)
}) => {
	const { tUI } = useTranslation();
	const [showDesktopFilter, setShowDesktopFilter] = useState(false);
	const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

	const desktopFilterRef = useRef(null);
	const mobileFilterRef = useRef(null);

	useGSAP(() => {
		if (showDesktopFilter && desktopFilterRef.current) {
			// Stagger items inside
			gsap.fromTo(".filter-content-item", 
				{ x: 20, opacity: 0 },
				{ x: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.1 }
			);
		}
	}, [showDesktopFilter]);

	useGSAP(() => {
		if (isMobileFilterOpen && mobileFilterRef.current) {
			gsap.to(mobileFilterRef.current, { height: "auto", opacity: 1, duration: 0.4, ease: "power3.out" });
			gsap.fromTo(".mobile-filter-item",
				{ y: -10, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out", delay: 0.1 }
			);
		} else if (mobileFilterRef.current) {
			gsap.to(mobileFilterRef.current, { height: 0, opacity: 0, duration: 0.3, ease: "power3.in" });
		}
	}, [isMobileFilterOpen]);

	// --- Internal Layout Stabilization ---
	const [isReady, setIsReady] = useState(false);
	useEffect(() => {
		let timer;
		if (!loading) {
			// Một khoảng nghỉ ngắn để đảm bảo DOM và các bộ lọc đã sẵn sàng
			timer = setTimeout(() => setIsReady(true), 400);
		} else {
			setIsReady(false);
		}
		return () => clearTimeout(timer);
	}, [loading]);

	// Tính toán trạng thái hiển thị thực tế
	const isActuallyLoading = loading || !isReady;

	// Tính toán Class cho Lưới (Grid) dựa trên việc Sidebar đang mở hay đóng
	const currentGridClass =
		typeof gridClassName === "function"
			? gridClassName(showDesktopFilter)
			: gridClassName ||
				`grid-cols-2 md:grid-cols-3 ${showDesktopFilter ? "xl:grid-cols-4" : "xl:grid-cols-5"}`;

	const flipState = useRef(null);

	const handleToggleDesktopFilter = () => {
		// Chỉ animate layout trên desktop khi Flip.getState có thể tìm thấy thẻ
		if (window.innerWidth >= 1024) {
			flipState.current = Flip.getState(".flip-item, .flip-container, .flip-sidebar");
		}
		setShowDesktopFilter(!showDesktopFilter);
	};

	// Xử lý Flip animation một cách an toàn thông qua useLayoutEffect (tránh lỗi bấm quá nhanh)
	React.useLayoutEffect(() => {
		if (flipState.current) {
			Flip.from(flipState.current, {
				duration: 0.5,
				ease: "power2.inOut",
				// Loại bỏ absolute: true để không làm sập layout container gây nhảy thanh chuyển trang
				nested: true,
				props: "opacity,marginLeft"
			});
			flipState.current = null;
		}
	}, [showDesktopFilter]);

	// Xử lý phím tắt (Trái/Phải để chuyển trang, Tab để đóng/mở Filter)
	useEffect(() => {
		const handleKeyDown = event => {
			if (event.key === "Tab") {
				event.preventDefault();
				handleToggleDesktopFilter();
				return;
			}
			// Bỏ qua phím tắt nếu người dùng đang gõ chữ vào ô input
			if (
				event.target.tagName === "INPUT" ||
				event.target.tagName === "TEXTAREA"
			)
				return;

			if (event.key === "ArrowLeft" && currentPage > 1 && !loading) {
				onPageChange(currentPage - 1);
			} else if (
				event.key === "ArrowRight" &&
				currentPage < pagination?.totalPages &&
				!loading
			) {
				onPageChange(currentPage + 1);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [currentPage, pagination?.totalPages, loading, onPageChange, isInfiniteScroll]);

	// --- LOGIC INFINITE SCROLL (Intersection Observer) ---
	const observerTarget = useRef(null);

	useEffect(() => {
		if (!isInfiniteScroll || !hasNextPage || loading) return;

		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting) {
					onPageChange(currentPage + 1);
				}
			},
			{ threshold: 0.1 },
		);

		if (observerTarget.current) {
			observer.observe(observerTarget.current);
		}

		return () => {
			if (observerTarget.current) {
				observer.unobserve(observerTarget.current);
			}
		};
	}, [isInfiniteScroll, hasNextPage, loading, currentPage, onPageChange]);

	const handleMobileSearch = () => {
		onSearchSubmit();
		setIsMobileFilterOpen(false); // Đóng menu filter trên mobile sau khi bấm tìm kiếm
	};

	return (
		<div className='animate-fadeIn'>
			<PageTitle title={pageTitle} description={pageDescription} />

			<div className='font-secondary'>
				{/* --- HEADER --- */}
				<div className='flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8'>
					<div className="space-y-2">
						<h1 className='text-4xl md:text-6xl font-black text-text-primary font-primary uppercase italic tracking-tighter leading-none'>
							{heading}
						</h1>
						{pageDescription && (
							<p className="text-text-secondary font-secondary text-sm md:text-base opacity-70 max-w-2xl leading-relaxed">
								{pageDescription}
							</p>
						)}
					</div>

					<div className='flex items-center gap-2 md:gap-4'>
						{!showFilterToggle && onSearchChange && (
							<div className="hidden lg:flex items-center w-64 xl:w-80 relative group">
								<InputField
									value={searchValue}
									onChange={e => onSearchChange(e.target.value)}
									onKeyDown={e => e.key === "Enter" && onSearchSubmit()}
									placeholder={searchPlaceholder || tUI("common.search")}
									prefix={<Search size={18} className="text-text-secondary group-focus-within:text-primary-500 transition-colors" />}
									className="bg-surface-bg/50 backdrop-blur-md border-border/50 focus:border-primary-500/50"
								/>
							</div>
						)}
						{customHeaderActions}
						{showFilterToggle && (
							<div className='hidden lg:flex items-center relative group'>
								<Button
									variant='outline'
									onClick={handleToggleDesktopFilter}
									className='flex items-center gap-2'
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
								
								{/* Chú thích phím tắt Tab khi hover */}
								<div className="absolute top-full right-0 mt-2 px-3 py-1 bg-black/80 backdrop-blur-md text-white border border-white/10 text-[10px] uppercase font-black tracking-widest rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[60] translate-y-1 group-hover:translate-y-0 whitespace-nowrap">
									{tUI("globalSearch.filterTooltip")}
								</div>
							</div>
						)}
					</div>
				</div>
				<div className='flex flex-col lg:flex-row items-start'>
					{/* --- MAIN CONTENT (GRID DANH SÁCH) --- */}
					<div
						className={`w-full flip-container ${(showFilterToggle && showDesktopFilter) ? "lg:flex-[3] xl:flex-[4]" : "lg:flex-[1]"}`}
					>
						<div className='bg-surface-bg rounded-lg border border-border p-2 sm:p-4 shadow-sm min-h-[500px] relative overflow-visible'>
							
								{isActuallyLoading && (!isInfiniteScroll || data.length === 0) ? (
									<div
										key='skeleton'
										transition={{ duration: 0.3 }}
										className={`grid ${currentGridClass} gap-4 sm:gap-6 md:gap-8`}
									>
										{[...Array(skeletonCount)].map((_, i) => (
											<React.Fragment key={i}>
												{renderSkeleton()}
											</React.Fragment>
										))}
									</div>
								) : (
									<div
										key='content'
										transition={{ duration: 0.5, ease: "easeOut" }}
									>
										{data && data.length > 0 ? (
											<>
												<StaggerContainer
													className={`grid ${currentGridClass} gap-4 sm:gap-6 md:gap-8 grid-auto-rows-min items-start`}
												>
													
														{data.map((item, index) => (
															<div
																key={item.cardCode || item.id || item._id || item.powerCode || index}
																className={`relative isolate flip-item ${typeof itemClassName === 'function' ? itemClassName(item) : (itemClassName || '')}`}
															>
																<StaggerItem className="w-full h-full">
																	{renderItem(item)}
																</StaggerItem>
															</div>
														))}
													
												</StaggerContainer>
												
												{/* --- TRIGGER TẢI THÊM (Sử dụng cho Infinite Scroll) --- */}
												{isInfiniteScroll && hasNextPage && (
													<div 
														ref={observerTarget} 
														className="h-20 flex items-center justify-center mt-4"
													>
														{loading ? (
															<div className="flex items-center gap-2 text-primary-500 animate-pulse">
																<RotateCw size={20} className="animate-spin" />
																<span>{tUI("common.loadingMore") || "Đang tải thêm..."}</span>
															</div>
														) : (
															<div className="h-1 w-1 opacity-0" />
														)}
													</div>
												)}

												{/* --- PHÂN TRANG (Chỉ hiện nếu KHÔNG phải Infinite Scroll) --- */}
												{!isInfiniteScroll && pagination && pagination.totalPages > 1 && (
													<div className='mt-8 flex justify-center items-center gap-4 border-t border-border pt-4'>
														<Button
															onClick={() => {
																onPageChange(currentPage - 1);
																window.scrollTo({ top: 0, behavior: "smooth" });
															}}
															disabled={currentPage === 1}
															variant='outline'
														>
															<ChevronLeft size={16} className='mr-2' />
															{tUI("common.prev")}
														</Button>
														<span className='font-bold text-primary-500 bg-primary-100/10 px-3 py-1 rounded-full'>
															{currentPage} / {pagination.totalPages}
														</span>
														<Button
															onClick={() => {
																onPageChange(currentPage + 1);
																window.scrollTo({ top: 0, behavior: "smooth" });
															}}
															disabled={currentPage === pagination.totalPages}
															variant='outline'
														>
															{tUI("common.next")}
															<ChevronRight size={16} className='ml-2' />
														</Button>
													</div>
												)}
											</>
										) : (
											<div className='text-center py-24 text-text-secondary animate-fadeIn'>
												<div className="relative inline-block mb-6">
													<XCircle
														size={64}
														className='mx-auto opacity-10'
													/>
													<div 
														className="absolute -right-2 -bottom-2 bg-primary-500/10 p-2 rounded-full"
													>
														<Search size={20} className="text-primary-500/40" />
													</div>
												</div>
												
												<h3 className='text-2xl font-primary font-bold text-text-primary mb-2'>
													{emptyMessage || (isFiltered ? tUI("common.noResultsFound") : tUI("common.notFound")) || "Không tìm thấy kết quả"}
												</h3>
												
												<p className='text-sm opacity-60 max-w-md mx-auto mb-8 leading-relaxed'>
													{isFiltered 
														? (tUI("common.noResultsHint") || "Vui lòng kiểm tra lại từ khóa hoặc thay đổi các bộ lọc đang chọn để tìm thấy kết quả phù hợp hơn.")
														: (tUI("common.noDataHint") || "Hiện tại danh sách này chưa có dữ liệu hiển thị. Vui lòng quay lại sau.")
													}
												</p>

												{(isFiltered || onResetFilters) && (
													<Button 
														variant='outline' 
														onClick={onResetFilters}
														className="hover:bg-primary-500 hover:text-white transition-all duration-300 group"
													>
														<RotateCw size={16} className='mr-2 group-hover:rotate-180 transition-transform duration-500' />
														{tUI("championList.resetFilter") || "Đặt lại bộ lọc"}
													</Button>
												)}
											</div>
										)}
									</div>
								)}
							
						</div>
					</div>

					{/* --- BỘ LỌC DESKTOP --- */}
					{showFilterToggle && (
						<aside
							key='desktop-filter'
							ref={desktopFilterRef}
							className={`hidden lg:block sticky top-24 h-fit z-40 flip-sidebar ${
								showDesktopFilter ? "w-[240px] xl:w-[280px] opacity-100 ml-6 lg:ml-8 overflow-visible" : "w-0 opacity-0 ml-0 overflow-hidden"
							}`}
						>
							<div className='w-[240px] xl:w-[280px] p-5 rounded-3xl border border-border dark:border-white/10 bg-surface-hover-bg shadow-md space-y-5 relative isolate'>
								{/* Background Glow */}
								<div className="absolute inset-0 overflow-hidden rounded-3xl -z-10 pointer-events-none">
									<div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/10 blur-[60px] rounded-full" />
								</div>
								
								<div className="space-y-3 filter-content-item">
									<label className='block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 ml-1'>
										{tUI("common.search")}
									</label>
									<div className="relative group">
										<InputField
											value={searchValue}
											onChange={e => onSearchChange(e.target.value)}
											onKeyDown={e => e.key === "Enter" && onSearchSubmit()}
											placeholder={searchPlaceholder || tUI("common.search")}
											className="bg-input-bg dark:bg-white/5 border-input-border dark:border-white/10 focus:border-primary-500/50 rounded-xl"
										/>
										<button 
											onClick={onSearchSubmit}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary-500 transition-colors"
										>
											<Search size={18} />
										</button>
									</div>
								</div>

								{/* Các filter riêng biệt được truyền từ ngoài vào */}
								<div className="space-y-5 filter-content-item relative z-50">
									{isActuallyLoading ? (
										<div className="space-y-6">
											{[...Array(4)].map((_, i) => (
												<div key={i} className="space-y-2">
													<div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
													<div className="h-10 w-full bg-white/5 rounded-xl border border-white/5 animate-pulse" />
												</div>
											))}
										</div>
									) : (
										renderFilters()
									)}
								</div>

								<div className="pt-2 space-y-3 filter-content-item">
									<Button
										variant='outline'
										onClick={onResetFilters}
										disabled={isActuallyLoading}
										className='w-full rounded-xl border-btn-secondary-border dark:border-white/10 hover:bg-btn-secondary-hover-bg dark:hover:bg-white/5 flex items-center justify-center gap-2 py-3 disabled:opacity-50'
									>										
										<RotateCw size={14} className='group-hover:rotate-180 transition-transform duration-500' />{" "}
										<span className="text-[10px] font-bold uppercase tracking-wider">{tUI("championList.resetFilter")}</span>
									</Button>
								</div>
							</div>
						</aside>
					)}
					

					{/* --- BỘ LỌC MOBILE --- */}
					{(searchValue !== undefined || onSearchChange) && (
						<div className='lg:hidden w-full order-first'>
						<div className='p-2 mb-4 rounded-lg border border-border bg-surface-bg shadow-sm relative z-40'>
							<div className='flex items-center gap-2'>
								<div className='flex-1 relative min-w-0'>
									<InputField
										value={searchValue}
										onChange={e => onSearchChange(e.target.value)}
										onKeyDown={e => e.key === "Enter" && handleMobileSearch()}
										placeholder={searchPlaceholder || tUI("common.search")}
									/>
								</div>
								<Button onClick={handleMobileSearch} className='px-3'>
									<Search size={18} />
								</Button>
								{showFilterToggle && (
									<Button
										variant='outline'
										onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
										className='px-3'
									>
										{isMobileFilterOpen ? (
											<ChevronUp size={18} />
										) : (
											<ChevronDown size={18} />
										)}
									</Button>
								)}
							</div>
							
								<div
									ref={mobileFilterRef}
									className="overflow-hidden"
									style={{ height: isMobileFilterOpen ? "auto" : 0, opacity: isMobileFilterOpen ? 1 : 0 }}
								>
									<div className='overflow-hidden'>
										<div className='pt-4 space-y-4 border-t border-border mt-3'>
											{isActuallyLoading ? (
												<div className="space-y-4 mobile-filter-item">
													{[...Array(3)].map((_, i) => (
														<div key={i} className="h-10 w-full bg-border/50 rounded-lg animate-pulse" />
													))}
												</div>
											) : (
												<div className="mobile-filter-item">
													{renderFilters()}
												</div>
											)}
											<Button
												variant='outline'
												onClick={onResetFilters}
												className='w-full mt-4 mobile-filter-item'
											>
												<RotateCw size={16} className='mr-2' />{" "}
												{tUI("championList.resetFilter")}
											</Button>
										</div>
									</div>
								</div>
							
						</div>
					</div>
					)}
				</div>{" "}

				{customTabs && <div className='mb-4'>{customTabs}</div>}
			</div>
		</div>
	);
};

export default GenericListLayout;
