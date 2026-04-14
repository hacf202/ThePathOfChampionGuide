// src/components/layout/GenericListLayout.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Search,
	RotateCw,
	XCircle,
	ChevronDown,
	ChevronUp,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import Button from "../common/button";
import InputField from "../common/inputField";
import PageTitle from "../common/pageTitle";
import { useTranslation } from "../../hooks/useTranslation";
import GoogleAd from "../common/googleAd";

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
	renderSkeleton, // Hàm trả về skeleton loading
	skeletonCount = 12,
	customHeaderActions = null, // Nút bấm tùy chỉnh ở góc trên cùng (VD: Tạo Build)
	customTabs = null, // Các tab chuyển đổi (VD: Community / My Builds)

	// --- Layout Customization ---
	gridClassName, // Chuỗi class hoặc Hàm nhận vào showDesktopFilter trả về chuỗi class
}) => {
	const { tUI } = useTranslation();
	const [showDesktopFilter, setShowDesktopFilter] = useState(false);
	const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

	// Tính toán Class cho Lưới (Grid) dựa trên việc Sidebar đang mở hay đóng
	const currentGridClass =
		typeof gridClassName === "function"
			? gridClassName(showDesktopFilter)
			: gridClassName ||
				`grid-cols-2 md:grid-cols-3 ${showDesktopFilter ? "xl:grid-cols-4" : "xl:grid-cols-5"}`;

	// Xử lý phím tắt (Trái/Phải để chuyển trang, Tab để đóng/mở Filter)
	useEffect(() => {
		const handleKeyDown = event => {
			if (event.key === "Tab") {
				event.preventDefault();
				setShowDesktopFilter(prev => !prev);
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
				<div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-2 md:mb-6'>
					<h1 className='text-3xl font-bold text-text-primary font-primary animate-glitch uppercase italic pr-4 pt-1'>
						{heading}
					</h1>

					<div className='flex items-center gap-2 md:gap-4'>
						{customHeaderActions}
						<div className='hidden lg:flex items-center'>
							<Button
								variant='outline'
								onClick={() => setShowDesktopFilter(!showDesktopFilter)}
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
						</div>
					</div>
				</div>
				<div className='flex flex-col lg:flex-row items-start'>
					{/* --- MAIN CONTENT (GRID DANH SÁCH) --- */}
					<div
						className={`w-full transition-[flex] duration-300 ease-in-out ${showDesktopFilter ? "lg:flex-[3] xl:lg:flex-[4]" : "lg:flex-[1]"}`}
					>
						<div className='bg-surface-bg rounded-lg border border-border p-2 sm:p-4 shadow-sm min-h-[500px] relative overflow-visible'>
							<AnimatePresence mode='wait'>
								{loading && data.length === 0 ? (
									<motion.div
										key='skeleton'
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className={`grid ${currentGridClass} gap-4 sm:gap-6`}
									>
										{[...Array(skeletonCount)].map((_, i) => (
											<React.Fragment key={i}>
												{renderSkeleton()}
											</React.Fragment>
										))}
									</motion.div>
								) : (
									<motion.div
										key='content'
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.3 }}
									>
										{data && data.length > 0 ? (
											<>
												<div
													className={`grid ${currentGridClass} gap-4 sm:gap-6`}
												>
													{data.map((item, index) => (
														<motion.div
															key={
																item.id || item._id || item.powerCode || index
															}
															layout
														>
															{renderItem(item)}
														</motion.div>
													))}
												</div>
												
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
															{tUI("common.prevPage")}
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
															{tUI("common.nextPage")}
															<ChevronRight size={16} className='ml-2' />
														</Button>
													</div>
												)}
											</>
										) : (
											<div className='text-center py-20 text-text-secondary'>
												<XCircle
													size={48}
													className='mx-auto mb-4 opacity-20'
												/>
												<p className='text-xl font-primary mb-4'>
													{tUI("common.notFound")}
												</p>
												<Button variant='ghost' onClick={onResetFilters}>
													{tUI("championList.resetFilter")}
												</Button>
											</div>
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* --- BỘ LỌC DESKTOP --- */}
					<AnimatePresence initial={false}>
						{showDesktopFilter && (
							<motion.aside
								key='desktop-filter'
								initial={{
									width: 0,
									opacity: 0,
									marginLeft: 0,
									overflow: "hidden",
								}}
								animate={{
									width: "auto",
									opacity: 1,
									marginLeft: "1.5rem",
									transitionEnd: { overflow: "visible" },
								}}
								exit={{
									width: 0,
									opacity: 0,
									marginLeft: 0,
									overflow: "hidden",
								}}
								transition={{ duration: 0.3, ease: "easeInOut" }}
								className='hidden lg:block sticky top-24 h-fit z-40'
							>
								<div className='w-[224px] xl:w-[256px] p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm relative'>
									<label className='block text-sm font-medium text-text-secondary'>
										{tUI("common.search")}
									</label>
									<InputField
										value={searchValue}
										onChange={e => onSearchChange(e.target.value)}
										onKeyDown={e => e.key === "Enter" && onSearchSubmit()}
										placeholder={searchPlaceholder || tUI("common.search")}
									/>
									<Button
										onClick={onSearchSubmit}
										className='w-full mt-2 hover:animate-pulse-focus'
									>
										<Search size={16} className='mr-2' /> {tUI("common.search")}
									</Button>

									{/* Các filter riêng biệt được truyền từ ngoài vào */}
									{renderFilters()}

									<Button
										variant='outline'
										onClick={onResetFilters}
										className='w-full'
									>
										<RotateCw size={16} className='mr-2' />{" "}
										{tUI("championList.resetFilter")}
									</Button>
								</div>
							</motion.aside>
						)}
					</AnimatePresence>

					{/* --- BỘ LỌC MOBILE --- */}
					<div className='lg:hidden w-full p-2 mb-4 rounded-lg border border-border bg-surface-bg shadow-sm order-first relative z-40'>
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
						</div>
						<AnimatePresence>
							{isMobileFilterOpen && (
								<motion.div
									initial={{ height: 0, opacity: 0, overflow: "hidden" }}
									animate={{
										height: "auto",
										opacity: 1,
										transitionEnd: { overflow: "visible" },
									}}
									exit={{ height: 0, opacity: 0, overflow: "hidden" }}
								>
									<div className='pt-4 space-y-4 border-t border-border mt-3'>
										{renderFilters()}
										<Button
											variant='outline'
											onClick={onResetFilters}
											className='w-full mt-4'
										>
											<RotateCw size={16} className='mr-2' />{" "}
											{tUI("championList.resetFilter")}
										</Button>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>{" "}
				<p className='mt-6 text-xs text-text-secondary text-center mb-2 uppercase tracking-widest'>
					AD
				</p>
				<GoogleAd slot='2943049680' format='horizontal' />
				{customTabs && <div className='mb-4'>{customTabs}</div>}
			</div>
		</div>
	);
};

export default GenericListLayout;
