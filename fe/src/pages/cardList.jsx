import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "../hooks/useTranslation.js";
import { Loader2, Info } from "lucide-react";
import CardItem from "../components/card/CardItem.jsx";
import GenericListLayout from "../components/layout/genericListLayout.jsx";
import MultiSelectFilter from "../components/common/multiSelectFilter.jsx";
import Button from "../components/common/button.jsx";

/**
 * Skeleton for Card Item
 */
const CardSkeleton = () => (
	<div className='rounded-xl border border-border bg-surface-bg p-0 overflow-hidden space-y-0 animate-pulse'>
		<div className='aspect-[680/1024] w-full bg-gray-700/50' />
	</div>
);

/**
 * Trang Khám Phá Lá Bài (Card Explorer) - Standardized Version
 */
const CardList = () => {
	const { tUI } = useTranslation();
	
	// State quản lý danh sách và phân trang
	const [cards, setCards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState(null);
	const [dynamicFilters, setDynamicFilters] = useState(null); // Lưu trữ bộ lọc từ API
	
	// State quản lý tìm kiếm và hiệu ứng
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedRegions, setSelectedRegions] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);
	const [selectedCosts, setSelectedCosts] = useState([]);
	const [sort, setSort] = useState("cardName-asc");

	// --- CƠ CHẾ LAYEROED LOADING & SYNC ---
	const [fullCards, setFullCards] = useState(null); // Toàn bộ dữ liệu ngầm
	const [isSyncing, setIsSyncing] = useState(false);
	const [preloadedPages, setPreloadedPages] = useState({}); // Cache các trang riêng lẻ

	/**
	 * Hàm fetch dữ liệu lá bài (Page-based)
	 */
	const fetchCards = useCallback(async (targetPage = 1, isNewSearch = false) => {
		try {
			setLoading(true);
			if (isNewSearch) {
				setCards([]);
			}

			// NẾU CÓ DỮ LIỆU ĐẦY ĐỦ -> LỌC TẠI TRÌNH DUYỆT (CLIENT-SIDE)
			if (fullCards) {
				const filtered = applyClientSideFilters(fullCards);
				const totalItems = filtered.length;
				const pageSize = 24;
				const pagData = {
					totalItems,
					totalPages: Math.ceil(totalItems / pageSize),
					currentPage: targetPage,
					pageSize
				};
				const slicedItems = filtered.slice((targetPage - 1) * pageSize, targetPage * pageSize);

				setCards(slicedItems);
				setPagination(pagData);
				setPage(targetPage);
				setLoading(false);
				return;
			}

			// NẾU CHƯA CÓ DỮ LIỆU ĐẦY ĐỦ -> GỌI API (SERVER-SIDE)
			const API_URL = `${import.meta.env.VITE_API_URL}/api/cards`;
			const params = {
				page: targetPage,
				limit: 24,
				searchTerm,
				rarities: selectedRarities.join(","),
				regions: selectedRegions.join(","),
				types: selectedTypes.join(","),
				costs: selectedCosts.join(","),
				sort
			};

			const response = await axios.get(API_URL, { params });
			const { items, pagination: pagData, availableFilters } = response.data;

			// Lưu bộ lọc động
			if (availableFilters) {
				setDynamicFilters(availableFilters);
			}

			setCards(items || []);
			setPagination(pagData);
			setPage(targetPage);
			setError(null);

			// SAU KHI TẢI XONG TRANG HIỆN TẠI -> TẢI TRƯỚC TRANG TIẾP THEO (PREFETCH)
			if (pagData.currentPage < pagData.totalPages) {
				preloadNextPage(pagData.currentPage + 1);
			}
		} catch (err) {
			console.error("Error fetching cards:", err);
			setError(tUI("common.errorLoadData"));
		} finally {
			setLoading(false);
		}
	}, [tUI, searchTerm, selectedRarities, selectedRegions, selectedTypes, selectedCosts, sort, fullCards]);

	/**
	 * Helper: Lọc dữ liệu tại trình duyệt
	 */
	const applyClientSideFilters = (allData) => {
		let filtered = [...allData];
		
		if (searchTerm) {
			const s = searchTerm.toLowerCase();
			filtered = filtered.filter(c => 
				c.cardName?.toLowerCase().includes(s) || 
				c.cardCode?.toLowerCase().includes(s)
			);
		}
		if (selectedRarities.length > 0) {
			filtered = filtered.filter(c => selectedRarities.includes(c.rarity));
		}
		if (selectedRegions.length > 0) {
			filtered = filtered.filter(c => c.regions?.some(r => selectedRegions.includes(r)));
		}
		if (selectedTypes.length > 0) {
			filtered = filtered.filter(c => selectedTypes.includes(c.type));
		}
		if (selectedCosts.length > 0) {
			filtered = filtered.filter(c => selectedCosts.includes(String(c.cost)));
		}

		// Sắp xếp
		const [field, order] = sort.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			if (typeof vA === "string") return order === "asc" ? vA.localeCompare(vB) : vB.localeCompare(vA);
			return order === "asc" ? vA - vB : vB - vA;
		});

		return filtered;
	};

	/**
	 * Logic Tải trước (Prefetch)
	 */
	const preloadNextPage = async (nextPage) => {
		if (preloadedPages[nextPage] || fullCards) return;
		try {
			const params = {
				page: nextPage,
				limit: 24,
				searchTerm,
				rarities: selectedRarities.join(","),
				regions: selectedRegions.join(","),
				types: selectedTypes.join(","),
				costs: selectedCosts.join(","),
				sort
			};
			const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cards`, { params });
			setPreloadedPages(prev => ({ ...prev, [nextPage]: res.data.items }));
		} catch (e) {
			console.warn("Prefetch failed", e);
		}
	};

	/**
	 * Logic Đồng bộ toàn bộ dữ liệu (Full Sync)
	 */
	useEffect(() => {
		const syncAll = async () => {
			if (fullCards || isSyncing) return;
			try {
				setIsSyncing(true);
				const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cards`, { params: { limit: -1 } });
				setFullCards(res.data.items || []);
			} catch (e) {
				console.error("Full Sync Error", e);
			} finally {
				setIsSyncing(false);
			}
		};

		// Trì hoãn việc đồng bộ 2 giây để ưu tiên trang 1, 2 tải trước
		const timer = setTimeout(syncAll, 2000);
		return () => clearTimeout(timer);
	}, []);

	/**
	 * hook tự động fetch khi bộ lọc hoặc trang thay đổi
	 */
	/**
	 * hook tự động fetch khi bộ lọc hoặc trang thay đổi
	 */
	useEffect(() => {
		// Chỉ tự động fetch khi thay đổi bộ lọc (quay về trang 1)
		// Các trang sau sẽ do Infinite Scroll hoặc nút bấm điều khiển
		if (page === 1) {
			fetchCards(1, true);
		}
	}, [selectedRarities, selectedRegions, selectedTypes, selectedCosts, sort]);

    /**
     * Tìm kiếm thủ công cho text input (để tránh spam API khi gõ)
     */
	const handleSearch = () => {
		fetchCards(1, true);
	};

	const handleResetFilters = () => {
		setSearchTerm("");
		setSelectedRarities([]);
		setSelectedRegions([]);
		setSelectedTypes([]);
		setSelectedCosts([]);
        setSort("cardName-asc");
		setPage(1);
	};

	return (
		<GenericListLayout
			pageTitle={tUI("cardList.title")}
			pageDescription={tUI("cardList.metaDesc")}
			heading={tUI("cardList.heading")}
			
			// Data & Pagination
			data={cards}
			loading={loading}
			pagination={pagination}
			currentPage={page}
			onPageChange={(newPage) => fetchCards(newPage, false)}
			isInfiniteScroll={false} // QUAY LẠI CHẾ ĐỘ PHÂN TRANG THEO YÊU CẦU
			hasNextPage={pagination?.currentPage < pagination?.totalPages}
			
			// Search
			searchValue={searchTerm}
			onSearchChange={setSearchTerm}
			onSearchSubmit={handleSearch}
			searchPlaceholder={tUI("cardList.placeholder")}
			
			// Actions
			onResetFilters={handleResetFilters}
			
			// Render
			renderSkeleton={() => <CardSkeleton />}
			skeletonCount={12}
			renderItem={(card) => (
				<CardItem card={card} key={card.cardCode} />
			)}
			renderFilters={() => (
				<div className="space-y-6">
                    {/* Bộ lọc sắp xếp */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary">
                            {tUI("championList.sortBy") || "Sắp xếp"}
                        </label>
                        <select 
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-500 transition-colors"
                        >
                            <option value="cardName-asc">{tUI("sort.nameAsc") || "Tên (A-Z)"}</option>
                            <option value="cardName-desc">{tUI("sort.nameDesc") || "Tên (Z-A)"}</option>
                            <option value="cost-asc">{tUI("sort.costAsc") || "Tiêu hao (Thấp-Cao)"}</option>
                            <option value="cost-desc">{tUI("sort.costDesc") || "Tiêu hao (Cao-Thấp)"}</option>
                        </select>
                    </div>

                    <hr className="border-border/50" />

					<MultiSelectFilter
						label={tUI("common.rarity")}
						options={dynamicFilters?.rarities?.map(r => ({
							label: tUI(`rarity.${r.toLowerCase()}`) || r,
							value: r
						})) || []}
						selectedValues={selectedRarities}
						onChange={(vals) => { setSelectedRarities(vals); setPage(1); }}
					/>

					<MultiSelectFilter
						label={tUI("common.region") || "Khu vực"}
						options={dynamicFilters?.regions?.map(r => ({
							label: tUI(`region.${r.replace(/[\s&]+/g, '')}`) || r,
							value: r
						})) || []}
						selectedValues={selectedRegions}
						onChange={(vals) => { setSelectedRegions(vals); setPage(1); }}
					/>

					<MultiSelectFilter
						label={tUI("common.type") || "Loại bài"}
						options={dynamicFilters?.types?.map(t => ({
							label: tUI(`cardType.${t}`) || t,
							value: t
						})) || []}
						selectedValues={selectedTypes}
						onChange={(vals) => { setSelectedTypes(vals); setPage(1); }}
					/>

					<MultiSelectFilter
						label={tUI("common.cost") || "Tiêu hao"}
						options={dynamicFilters?.costs?.map(n => ({ 
							label: n.toString(), 
							value: n.toString() 
						})) || []}
						selectedValues={selectedCosts}
						onChange={(vals) => { setSelectedCosts(vals); setPage(1); }}
					/>
				</div>
			)}
			
			// Pagination adapt (Handled by GenericListLayout)
			customTabs={null}
		/>
	);
};

export default CardList;
