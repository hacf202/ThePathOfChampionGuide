// src/hooks/useGenericFilters.js
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { usePersistentState } from "./usePersistentState";
import { removeAccents } from "../utils/vietnameseUtils";

/**
 * Hook dùng chung cho mọi danh sách: Lọc, Tìm kiếm, Phân trang và Tự động đồng bộ URL
 */
export const useGenericFilters = ({
	prefix,
	initialCustomFilters = {},
	defaultSort = "name-asc",
	itemsPerPage = 20,
}) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const isFirstRender = useRef(true);

	// 1. CÁC STATE CƠ BẢN (Đọc từ LocalStorage làm mặc định nếu URL rỗng)
	const [searchInput, setSearchInput] = usePersistentState(
		`${prefix}SearchInput`,
		"",
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		`${prefix}SearchTerm`,
		"",
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		`${prefix}SortOrder`,
		defaultSort,
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		`${prefix}CurrentPage`,
		1,
	);
	const [customFilters, setCustomFilters] = usePersistentState(
		`${prefix}CustomFilters`,
		initialCustomFilters,
	);

	// 2. ĐỌC DỮ LIỆU TỪ URL KHI VỪA VÀO TRANG (Ghi đè LocalStorage nếu có URL)
	useEffect(() => {
		let hasUrlParams = false;
		const newCustomFilters = { ...initialCustomFilters };

		const urlPage = searchParams.get("page");
		if (urlPage) {
			setCurrentPage(Number(urlPage));
			hasUrlParams = true;
		}

		const urlSort = searchParams.get("sort");
		if (urlSort) {
			setSortOrder(urlSort);
			hasUrlParams = true;
		}

		const urlSearch = searchParams.get("searchTerm");
		if (urlSearch) {
			setSearchTerm(urlSearch);
			setSearchInput(urlSearch);
			hasUrlParams = true;
		}

		// Lặp qua các key có trong cấu hình filter để tự động lấy từ URL
		Object.keys(initialCustomFilters).forEach(key => {
			const urlVal = searchParams.get(key);
			if (urlVal) {
				// Chuyển chuỗi "Epic,Rare" trên URL thành mảng ["Epic", "Rare"]
				newCustomFilters[key] = urlVal.split(",");
				hasUrlParams = true;
			}
		});

		if (hasUrlParams) {
			setCustomFilters(newCustomFilters);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Chỉ chạy 1 lần khi mount

	// 3. CẬP NHẬT URL KHI STATE THAY ĐỔI
	useEffect(() => {
		// Bỏ qua lần render đầu tiên để không ghi đè URL của người dùng
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		const params = new URLSearchParams();
		if (currentPage !== 1) params.append("page", currentPage);
		if (sortOrder !== defaultSort) params.append("sort", sortOrder);
		if (searchTerm) params.append("searchTerm", searchTerm);

		// Tự động nhét tất cả các mảng filter đang chọn vào URL
		Object.entries(customFilters).forEach(([key, values]) => {
			if (Array.isArray(values) && values.length > 0) {
				params.append(key, values.join(","));
			} else if (typeof values === "string" && values !== "") {
				params.append(key, values);
			}
		});

		setSearchParams(params, { replace: true });
	}, [
		currentPage,
		sortOrder,
		searchTerm,
		customFilters,
		defaultSort,
		setSearchParams,
	]);

	// 4. CÁC HÀM XỬ LÝ (ACTIONS)
	const handleSearch = useCallback(() => {
		setSearchTerm(removeAccents(searchInput.trim()));
		setCurrentPage(1);
	}, [searchInput, setSearchTerm, setCurrentPage]);

	const handleResetFilters = useCallback(() => {
		setSearchInput("");
		setSearchTerm("");
		setSortOrder(defaultSort);
		setCurrentPage(1);
		setCustomFilters(initialCustomFilters);
	}, [
		setSearchInput,
		setSearchTerm,
		setSortOrder,
		setCurrentPage,
		setCustomFilters,
		initialCustomFilters,
		defaultSort,
	]);

	const setFilterValue = useCallback(
		(filterKey, value) => {
			setCustomFilters(prev => ({ ...prev, [filterKey]: value }));
			setCurrentPage(1);
		},
		[setCustomFilters, setCurrentPage],
	);

	// 5. SINH QUERY PARAMS CHO BACKEND API
	const queryParams = useMemo(() => {
		const params = new URLSearchParams();
		params.append("page", currentPage);
		params.append("limit", itemsPerPage);
		params.append("sort", sortOrder);

		if (searchTerm) params.append("searchTerm", searchTerm);

		Object.entries(customFilters).forEach(([key, values]) => {
			if (Array.isArray(values) && values.length > 0) {
				params.append(key, values.join(","));
			} else if (typeof values === "string" && values !== "") {
				params.append(key, values);
			}
		});

		return params.toString();
	}, [currentPage, itemsPerPage, sortOrder, searchTerm, customFilters]);

	return {
		state: {
			searchInput,
			searchTerm,
			sortOrder,
			currentPage,
			customFilters,
		},
		actions: {
			setSearchInput,
			setSortOrder,
			setCurrentPage,
			setFilterValue,
			handleSearch,
			handleResetFilters,
		},
		queryParams,
	};
};
