// fe/src/hooks/useCardData.js
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useTranslation } from "./useTranslation";
import { removeAccents } from "../utils/vietnameseUtils";

/**
 * Hook logic mới: Tải toàn bộ dữ liệu một lần (Load-All)
 * Giúp tránh hiện tượng nhảy dữ liệu giữa Server-side và Client-side.
 */
export const useCardData = (queryParams, state, tUI) => {
	const { language } = useTranslation();
	const [allCards, setAllCards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [dynamicFilters, setDynamicFilters] = useState(null);

	// 1. Tải toàn bộ dữ liệu một lần duy nhất khi vào trang
	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				// Gọi API lấy toàn bộ lá bài gốc
				const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cards`, { 
					params: { limit: -1, onlyBase: "true" } 
				});
				const data = res.data.items || [];
				setAllCards(data);
				
				// Trích xuất bộ lọc động từ dữ liệu thực tế
				const filters = {
					rarities: [...new Set(data.map(c => c.rarity || "None"))].sort(),
					regions: [...new Set(data.flatMap(c => c.regions || []))].sort(),
					types: [...new Set(data.map(c => (c.translations?.en?.type || c.type || "other").toLowerCase()))].sort(),
					costs: [...new Set(data.map(c => Number(c.cost || 0)))].sort((a, b) => a - b),
				};
				setDynamicFilters(filters);
				setError(null);
			} catch (err) {
				console.error("Error loading all cards:", err);
				setError(tUI("common.error") || "Lỗi tải dữ liệu.");
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [tUI]);

	// 2. Logic Lọc & Phân trang tại Client (Sử dụng useMemo để tối ưu)
	const filteredCards = useMemo(() => {
		if (allCards.length === 0) return [];
		
		const { searchInput, customFilters, sortOrder } = state;
		const { rarities, regions, types, costs } = customFilters || {};
		
		let filtered = [...allCards];

		// A. Lọc Tìm kiếm (Bilingual & Accent-insensitive)
		if (searchInput) {
			const searchWords = removeAccents(searchInput.toLowerCase()).split(/\s+/).filter(Boolean);
			filtered = filtered.filter(c => {
				const textSources = [
					c.cardName,
					c.cardCode,
					c.descriptionRaw,
					c.translations?.en?.cardName,
					c.translations?.en?.descriptionRaw,
				].filter(Boolean).map(text => removeAccents(text.toLowerCase()));
				return searchWords.every(word => textSources.some(source => source.includes(word)));
			});
		}

		// B. Áp dụng các bộ lọc Custom
		if (rarities?.length > 0) filtered = filtered.filter(c => rarities.includes(c.rarity));
		if (regions?.length > 0) filtered = filtered.filter(c => c.regions?.some(r => regions.includes(r)));
		if (types?.length > 0) {
			filtered = filtered.filter(c => 
				types.some(t => {
					const typeVi = (c.type || "").toLowerCase();
					const typeEn = (c.translations?.en?.type || "").toLowerCase();
					return t.toLowerCase() === typeVi || t.toLowerCase() === typeEn;
				})
			);
		}
		if (costs?.length > 0) filtered = filtered.filter(c => costs.includes(String(c.cost)));

		// C. Sắp xếp (Ưu tiên Tướng lên đầu)
		const [field, order] = sortOrder.split("-");
		filtered.sort((a, b) => {
			const checkIsChamp = (item) => {
				const r = (item.rarity || "").toLowerCase();
				const t = (item.type || "").toLowerCase();
				const te = (item.translations?.en?.type || "").toLowerCase();
				return r === "champion" || t === "champion" || t === "anh hùng" || t === "tướng" || te === "champion";
			};
			const isA = checkIsChamp(a);
			const isB = checkIsChamp(b);
			if (isA !== isB) return isA ? -1 : 1;

			const targetField = field === "championCost" ? "cost" : field;
			let vA = a[targetField] ?? "";
			let vB = b[targetField] ?? "";
			
			if (typeof vA === "string") {
				const cmp = vA.localeCompare(vB, language === 'vi' ? 'vi' : 'en');
				return order === "asc" ? cmp : -cmp;
			}
			return order === "asc" ? Number(vA) - Number(vB) : Number(vB) - Number(vA);
		});

		return filtered;
	}, [allCards, state, language]);

	// 3. Logic Phân trang
	const pageSize = 24;
	const totalItems = filteredCards.length;
	const totalPages = Math.ceil(totalItems / pageSize);
	// Đảm bảo trang hiện tại không vượt quá tổng số trang
	const currentPage = Math.min(state.currentPage, totalPages || 1);
	
	const paginatedCards = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return filteredCards.slice(start, start + pageSize);
	}, [filteredCards, currentPage, pageSize]);

	return {
		cards: paginatedCards,
		loading,
		error,
		pagination: {
			totalItems,
			totalPages,
			currentPage,
			pageSize
		},
		dynamicFilters,
		refetch: () => {} // Logic mới không cần refetch liên tục
	};
};
