import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "../hooks/useTranslation.js";
import { Loader2, Info } from "lucide-react";
import CardItem from "../components/card/CardItem.jsx";
import GenericListLayout from "../components/layout/genericListLayout.jsx";
import MultiSelectFilter from "../components/common/multiSelectFilter.jsx";
import Button from "../components/common/button.jsx";
import { useGenericFilters } from "../hooks/useGenericFilters.js";
import { removeAccents } from "../utils/vietnameseUtils.js";
import iconRegions from "../assets/data/iconRegions.json";

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
	
	// 1. Khởi tạo Hook dùng chung (Tự động lo liệu việc đồng bộ URL)
	const { state, actions, queryParams } = useGenericFilters({
		prefix: "cards",
		initialCustomFilters: { rarities: [], regions: [], types: [], costs: [] },
		defaultSort: "cardName-asc",
		itemsPerPage: 24,
		extraParams: { onlyBase: "true" }, // Chỉ hiển thị lá bài gốc (không phải token)
	});
	
	// State quản lý danh sách và phân trang
	const [cards, setCards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState(null);
	const [dynamicFilters, setDynamicFilters] = useState(null); // Lưu trữ bộ lọc từ API
	
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
				const filtered = applyClientSideFilters(fullCards, state.searchTerm);
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
				// (State page được quản lý bởi useGenericFilters qua actions.setCurrentPage)
				setLoading(false);
				return;
			}

			// NẾU CHƯA CÓ DỮ LIỆU ĐẦY ĐỦ -> GỌI API (SERVER-SIDE)
			const API_URL = `${import.meta.env.VITE_API_URL}/api/cards`;
			
			// Sử dụng queryParams từ hook (đã bao gồm searchTerm, filters, sort, page)
			const response = await axios.get(`${API_URL}?${queryParams}`);
			const { items, pagination: pagData, availableFilters } = response.data;

			// Lưu bộ lọc động
			if (availableFilters) {
				setDynamicFilters(availableFilters);
			}

			setCards(items || []);
			setPagination(pagData);
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
	}, [tUI, queryParams, state.searchTerm, fullCards]);

	/**
	 * Helper: Lọc dữ liệu tại trình duyệt (Robust Bilingual & Multi-field Search)
	 */
	const applyClientSideFilters = (allData, currentSearch) => {
		let finalBaseCards = [];
		const { rarities, regions, types, costs } = state.customFilters;

		if (currentSearch) {
			const searchWords = removeAccents(currentSearch.toLowerCase()).split(/\s+/).filter(Boolean);
			
			// 1. Tìm tất cả các lá bài (bao gồm cả Token) khớp với từ khóa
			const matchingCodes = new Set();
			allData.forEach(c => {
				const textSources = [
					c.cardName,
					c.cardCode,
					c.description,
					c.descriptionRaw,
					c.translations?.en?.cardName,
					c.translations?.en?.description,
					c.translations?.en?.descriptionRaw
				].filter(Boolean).map(text => removeAccents(text.toLowerCase()));

				const isMatch = searchWords.every(word => textSources.some(source => source.includes(word)));
				
				if (isMatch) {
					// Nếu khớp, lấy mã thẻ gốc (ví dụ 01IO012T2 -> 01IO012)
					const baseCode = (c.cardCode || "").split("T")[0];
					matchingCodes.add(baseCode);
				}
			});

			// 2. Chỉ giữ lại các lá bài GỐC (không chứa T) có mã nằm trong matchingCodes
			finalBaseCards = allData.filter(c => 
				!/[A-Z]\d+T\d+$/.test(c.cardCode || "") && 
				matchingCodes.has(c.cardCode)
			);
		} else {
			// Nếu không tìm kiếm, mặc định chỉ lấy các lá bài gốc
			finalBaseCards = allData.filter(c => !/[A-Z]\d+T\d+$/.test(c.cardCode || ""));
		}

		// 3. Áp dụng các bộ lọc khác (Rarity, Region, ...) trên danh sách thẻ gốc
		let filtered = finalBaseCards;
		
		if (rarities?.length > 0) {
			filtered = filtered.filter(c => rarities.includes(c.rarity));
		}
		if (regions?.length > 0) {
			filtered = filtered.filter(c => c.regions?.some(r => regions.includes(r)));
		}
		if (types?.length > 0) {
			filtered = filtered.filter(c => types.includes(c.type));
		}
		if (costs?.length > 0) {
			filtered = filtered.filter(c => costs.includes(String(c.cost)));
		}

		// Sắp xếp
		const [field, order] = state.sortOrder.split("-");
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
			// Fake queryParams for next page
			const nextParams = new URLSearchParams(queryParams);
			nextParams.set("page", nextPage);
			
			const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cards?${nextParams.toString()}`);
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
	 * hook tự động fetch khi bộ lọc, tìm kiếm hoặc trang thay đổi
	 */
	useEffect(() => {
		// Tự động fetch khi thay đổi bộ lọc hoặc từ khóa tìm kiếm (quay về trang 1)
		fetchCards(state.currentPage, false);
	}, [queryParams, fullCards]);

    /**
     * Tìm kiếm thủ công (Ví dụ: Nhấn Enter) - Thực thi ngay lập tức không chờ lọc tự động
     */
	const handleSearch = () => {
		actions.handleSearch();
	};

	/**
	 * Helper: Chuẩn hóa Key Khu vực (Region)
     * Đảm bảo cả tên tiếng Anh (Shadow Isles) và tiếng Việt (Quần Đảo Bóng Đêm) đều về key 'quandaobongdem'
	 */
	const getRegionKey = (r) => {
		if (!r) return "";
		// 1. Tìm trong iconRegions.json để lấy tên tiếng Việt chuẩn
		const iconRegion = iconRegions.find(i => 
			i.name === r || // Khớp tên tiếng Việt
			i.nameRef === r || // Khớp mã English CamelCase
			i.nameRef === r.replace(/[\s&]+/g, '') // Khớp mã English không dấu/khoảng cách
		);
		
		const targetName = iconRegion ? iconRegion.name : r;
		
		// 2. Slugify tên tiếng Việt để ra key (ví dụ: 'Quần Đảo Bóng Đêm' -> 'quandaobongdem')
		return removeAccents(targetName)
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "");
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
			currentPage={state.currentPage}
			onPageChange={(newPage) => actions.setCurrentPage(newPage)}
			isInfiniteScroll={false}
			hasNextPage={pagination?.currentPage < pagination?.totalPages}
			
			// Search
			searchValue={state.searchInput || ""}
			onSearchChange={(val) => actions.setSearchInput(val)}
			onSearchSubmit={handleSearch}
			searchPlaceholder={tUI("cardList.placeholder")}
			
			// Actions
			onResetFilters={actions.handleResetFilters}
			
			// Render
			renderSkeleton={() => <CardSkeleton />}
			skeletonCount={12}
			renderItem={(card) => (
				<CardItem card={card} key={card.cardCode} />
			)}
			renderFilters={() => (
				<div className="space-y-6">
					<MultiSelectFilter
						label={tUI("common.rarity")}
						options={dynamicFilters?.rarities?.map(r => ({
							label: tUI(`rarity.${r.toLowerCase()}`) || r,
							value: r
						})) || []}
						selectedValues={state.customFilters?.rarities || []}
						onChange={(vals) => actions.setFilterValue("rarities", vals)}
					/>

					<MultiSelectFilter
						label={tUI("common.region") || "Khu vực"}
						options={dynamicFilters?.regions?.map(r => {
							const iconRegion = iconRegions.find(i => 
								i.name === r || 
								i.nameRef === r || 
								i.nameRef === r.replace(/[\s&]+/g, '')
							);
							return {
								label: tUI(`region.${getRegionKey(r)}`) || r,
								value: r,
								iconUrl: iconRegion?.iconAbsolutePath
							};
						}) || []}
						selectedValues={state.customFilters?.regions || []}
						onChange={(vals) => actions.setFilterValue("regions", vals)}
					/>

					<MultiSelectFilter
						label={tUI("common.type") || "Loại bài"}
						options={dynamicFilters?.types?.map(t => ({
							label: tUI(`cardType.${t}`) || t,
							value: t
						})) || []}
						selectedValues={state.customFilters?.types || []}
						onChange={(vals) => actions.setFilterValue("types", vals)}
					/>

					<MultiSelectFilter
						label={tUI("common.cost") || "Tiêu hao"}
						options={dynamicFilters?.costs?.map(n => ({ 
							label: n.toString(), 
							value: n.toString() 
						})) || []}
						selectedValues={state.customFilters?.costs || []}
						onChange={(vals) => actions.setFilterValue("costs", vals)}
					/>
					{/* Bộ lọc sắp xếp */}
					<div className="space-y-2">
						<label className="block text-sm font-medium text-text-secondary">
							{tUI("championList.sortBy") || "Sắp xếp"}
						</label>
						<select 
							value={state.sortOrder}
							onChange={(e) => actions.setSortOrder(e.target.value)}
							className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-500 transition-colors"
						>
							<option value="cardName-asc">{tUI("sort.nameAsc") || "Tên (A-Z)"}</option>
							<option value="cardName-desc">{tUI("sort.nameDesc") || "Tên (Z-A)"}</option>
							<option value="cost-asc">{tUI("sort.costAsc") || "Tiêu hao (Thấp-Cao)"}</option>
							<option value="cost-desc">{tUI("sort.costDesc") || "Tiêu hao (Cao-Thấp)"}</option>
						</select>
					</div>
				</div>
			)}
			// Pagination adapt (Handled by GenericListLayout)
			customTabs={null}
		/>
	);
};

export default CardList;
