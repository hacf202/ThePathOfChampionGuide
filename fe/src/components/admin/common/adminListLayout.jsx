import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import Button from "@/components/common/button";
import SidePanel from "@/components/common/sidePanel";
import { useTranslation } from "@/hooks/useTranslation";
import { Filter, X, Plus, Search, RotateCw, ChevronLeft, ChevronRight } from "lucide-react";


const AdminListLayout = ({
	dataLength,
	totalPages,
	currentPage,
	onPageChange,
	sidePanelProps,
	emptyMessageTitle,
	emptyMessageSub,
	children,
	filterKeys = [], // Các key của bộ lọc cần đồng bộ URL (ví dụ: ['regions', 'costs'])
}) => {
	const { tUI } = useTranslation();
	const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();

	// --- URL Sync Logic ---
	// Cập nhật URL khi bộ lọc thay đổi (debounced hoặc hiệu ứng phụ)
	useEffect(() => {
		const params = new URLSearchParams(searchParams);
		
		// Đồng bộ Search Term
		if (sidePanelProps.searchTerm) {
			params.set("q", sidePanelProps.searchTerm);
		} else {
			params.delete("q");
		}

		// Đồng bộ Page
		if (currentPage > 1) {
			params.set("page", currentPage);
		} else {
			params.delete("page");
		}

		// Đồng bộ các bộ lọc khác từ multiFilterConfigs
		sidePanelProps.multiFilterConfigs?.forEach(config => {
			const key = config.urlKey || config.label.toLowerCase().replace(/\s+/g, "");
			if (config.selectedValues?.length > 0) {
				params.set(key, config.selectedValues.join(","));
			} else {
				params.delete(key);
			}
		});

		// Đồng bộ Sort
		if (sidePanelProps.sortSelectedValue) {
			params.set("sort", sidePanelProps.sortSelectedValue);
		}

		// Chỉ cập nhật nếu có thay đổi thực sự để tránh vòng lặp
		const newQuery = params.toString();
		if (newQuery !== searchParams.toString()) {
			setSearchParams(params, { replace: true });
		}
	}, [
		sidePanelProps.searchTerm, 
		sidePanelProps.sortSelectedValue, 
		sidePanelProps.multiFilterConfigs, 
		currentPage, 
		searchParams, 
		setSearchParams
	]);

	// Khôi phục bộ lọc từ URL khi mount
	useEffect(() => {
		const q = searchParams.get("q");
		if (q && sidePanelProps.onSearch) {
			// Giả sử có hàm để set trực tiếp term
		}
		// Logic khôi phục cụ thể sẽ phức tạp hơn nếu không có callback từ cha.
		// Tạm thời để cha tự xử lý useEffect(..., [searchParams]) là tốt nhất.
	}, []);

	return (
		<div className='flex flex-col lg:flex-row gap-6 relative h-full'>
			{/* Mobile Add Button Floating */}
			<div className="lg:hidden fixed bottom-6 right-6 z-30">
				{sidePanelProps?.onAddNew && (
					<button
						onClick={sidePanelProps.onAddNew}
						className="w-14 h-14 rounded-full bg-primary-500 text-white shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
					>
						<Plus size={28} />
					</button>
				)}
			</div>

			{/* Left Content Area */}
			<div className='flex-1 min-w-0 bg-surface-bg/30 rounded-2xl p-4 lg:p-6 order-2 lg:order-1 overflow-auto-scrollbar'>
				{/* Top Actions for Mobile (Filter Toggle) */}
				<div className="lg:hidden flex justify-between items-center mb-4">
					<span className="text-sm font-bold text-text-secondary">{dataLength} Kết quả</span>
					<button 
						onClick={() => setIsMobilePanelOpen(true)}
						className="flex items-center gap-2 px-4 py-2 bg-surface-bg border border-border rounded-xl text-sm font-bold"
					>
						<Filter size={16} /> Bộ lọc
					</button>
				</div>

				{dataLength > 0 ? (
					<div className="animate-in fade-in duration-500">
						{children}
					</div>
				) : (
					<div className='flex flex-col items-center justify-center h-full min-h-[400px] text-center'>
						<div className="w-20 h-20 bg-surface-bg rounded-3xl flex items-center justify-center mb-4 opacity-50 border border-border">
							<Search size={40} />
						</div>
						<p className='font-bold text-xl text-text-primary mb-2'>
							{emptyMessageTitle || tUI("common.notFound")}
						</p>
						<p className="text-text-secondary max-w-xs mx-auto text-sm">
							{emptyMessageSub || tUI("admin.rune.tryOtherFilter")}
						</p>
						<Button variant="outline" size="sm" className="mt-6" onClick={sidePanelProps.onResetFilters}>
							Xóa bộ lọc
						</Button>
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className='mt-12 flex flex-wrap justify-center items-center gap-2 py-6 border-t border-border/50'>
						<Button
							onClick={() => onPageChange(currentPage - 1)}
							disabled={currentPage === 1}
							variant='outline'
							size="sm"
							className="px-3"
						>
							<ChevronLeft size={16} />
						</Button>
						
						<div className='flex items-center gap-1.5'>
							{[...Array(totalPages)].map((_, i) => {
								const page = i + 1;
								if (
									page === 1 || 
									page === totalPages || 
									(page >= currentPage - 1 && page <= currentPage + 1)
								) {
									return (
										<button
											key={page}
											onClick={() => onPageChange(page)}
											className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
												currentPage === page 
													? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
													: 'bg-surface-bg text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-border'
											}`}
										>
											{page}
										</button>
									);
								} else if (
									page === currentPage - 2 || 
									page === currentPage + 2
								) {
									return <span key={page} className='text-text-secondary px-1'>...</span>;
								}
								return null;
							})}
						</div>

						<Button
							onClick={() => onPageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							variant='outline'
							size="sm"
							className="px-3"
						>
							<ChevronRight size={16} />
						</Button>
					</div>
				)}
			</div>

			{/* Filter Side Panel (Desktop & Mobile Drawer) */}
			<aside className='hidden lg:block w-72 shrink-0 order-2'>
				<div className='sticky top-4'>
					<SidePanel {...sidePanelProps} />
				</div>
			</aside>

			{/* Mobile Drawer Overlay */}
			
				{isMobilePanelOpen && (
					<>
						<div
							onClick={() => setIsMobilePanelOpen(false)}
							className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
						/>
						<div
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-surface-bg z-[70] lg:hidden shadow-2xl flex flex-col"
						>
							<div className="p-6 border-b border-border flex items-center justify-between">
								<h2 className="text-lg font-bold flex items-center gap-2">
									<Filter size={20} className="text-primary-500" /> Bộ lọc
								</h2>
								<button onClick={() => setIsMobilePanelOpen(false)} className="p-2 rounded-xl hover:bg-surface-hover transition-colors">
									<X size={20} />
								</button>
							</div>
							<div className="flex-1 overflow-y-auto p-6">
								<SidePanel {...sidePanelProps} />
							</div>
							<div className="p-6 border-t border-border bg-page-bg/50">
								<Button variant="primary" className="w-full" onClick={() => setIsMobilePanelOpen(false)}>
									Áp dụng bộ lọc
								</Button>
							</div>
						</div>
					</>
				)}
			
		</div>
	);
};

export default AdminListLayout;
