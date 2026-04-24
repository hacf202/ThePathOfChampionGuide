// fe/src/hooks/useCardData.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { removeAccents } from "../utils/vietnameseUtils";

export const useCardData = (queryParams, state, tUI) => {
	// State quản lý danh sách và phân trang
	const [cards, setCards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState(null);
	const [dynamicFilters, setDynamicFilters] = useState(null);
	
	// --- CƠ CHẾ LAYERED LOADING & SYNC ---
	const [fullCards, setFullCards] = useState(null); // Toàn bộ dữ liệu ngầm
	const [isSyncing, setIsSyncing] = useState(false);
	const [preloadedPages, setPreloadedPages] = useState({}); // Cache các trang riêng lẻ

	/**
	 * Helper: Lọc dữ liệu tại trình duyệt (Robust Bilingual & Multi-field Search)
	 */
	const applyClientSideFilters = useCallback((allData, currentSearch, currentFilters, sortOrder) => {
		let finalBaseCards = [];
		const { rarities, regions, types, costs } = currentFilters;

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
			filtered = filtered.filter(c => 
				types.some(t => t.toLowerCase() === (c.type || "").toLowerCase())
			);
		}
		if (costs?.length > 0) {
			filtered = filtered.filter(c => costs.includes(String(c.cost)));
		}

		// Sắp xếp
		const [field, order] = sortOrder.split("-");
		filtered.sort((a, b) => {
			let vA = a[field] ?? "";
			let vB = b[field] ?? "";
			if (typeof vA === "string") return order === "asc" ? vA.localeCompare(vB) : vB.localeCompare(vA);
			return order === "asc" ? vA - vB : vB - vA;
		});

		return filtered;
	}, []);

	/**
	 * Logic Tải trước (Prefetch)
	 */
	const preloadNextPage = useCallback(async (nextPage, currentParams) => {
		if (preloadedPages[nextPage] || fullCards) return;
		try {
			const nextParams = new URLSearchParams(currentParams);
			nextParams.set("page", nextPage);
			
			const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cards?${nextParams.toString()}`);
			setPreloadedPages(prev => ({ ...prev, [nextPage]: res.data.items }));
		} catch (e) {
			console.warn("Prefetch failed", e);
		}
	}, [preloadedPages, fullCards]);

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
				const filtered = applyClientSideFilters(fullCards, state.searchTerm, state.customFilters, state.sortOrder);
				const totalItems = filtered.length;
				const pageSize = 20;
				const pagData = {
					totalItems,
					totalPages: Math.ceil(totalItems / pageSize),
					currentPage: targetPage,
					pageSize
				};
				const slicedItems = filtered.slice((targetPage - 1) * pageSize, targetPage * pageSize);

				setCards(slicedItems);
				setPagination(pagData);
				setLoading(false);
				return;
			}

			// NẾU CHƯA CÓ DỮ LIỆU ĐẦY ĐỦ -> GỌI API (SERVER-SIDE)
			const API_URL = `${import.meta.env.VITE_API_URL}/api/cards`;
			const response = await axios.get(`${API_URL}?${queryParams}`);
			const { items, pagination: pagData, availableFilters } = response.data;

			if (availableFilters) {
				setDynamicFilters(availableFilters);
			}

			setCards(items || []);
			setPagination(pagData);
			setError(null);

			if (pagData.currentPage < pagData.totalPages) {
				preloadNextPage(pagData.currentPage + 1, queryParams);
			}
		} catch (err) {
			console.error("Error fetching cards:", err);
			setError(tUI("common.error"));
		} finally {
			setLoading(false);
		}
	}, [tUI, queryParams, state.searchTerm, state.customFilters, state.sortOrder, fullCards, applyClientSideFilters, preloadNextPage]);

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

		const timer = setTimeout(syncAll, 2000);
		return () => clearTimeout(timer);
	}, [fullCards, isSyncing]);

	useEffect(() => {
		fetchCards(state.currentPage, false);
	}, [queryParams, fullCards]);

	return {
		cards,
		loading,
		error,
		pagination,
		dynamicFilters,
		isSyncing,
		refetch: fetchCards
	};
};
