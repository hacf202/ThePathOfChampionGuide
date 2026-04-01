// src/hooks/useGenericData.js
import { useState, useEffect, useCallback } from "react";

// Bộ nhớ đệm toàn cục (Cache) để lưu trữ kết quả API theo queryParams
const localCache = new Map();

export const useGenericData = (
	endpoint,
	queryParams,
	tUI,
	idKey = "itemCode",
) => {
	const [dataList, setDataList] = useState([]);
	const [knownDict, setKnownDict] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		totalPages: 1,
		totalItems: 0,
		currentPage: 1,
	});
	const [dynamicFilters, setDynamicFilters] = useState({});

	const fetchData = useCallback(async (signal) => {
		const cacheKey = `${endpoint}?${queryParams}`;
		
		// 1. Kiểm tra Cache trước khi gọi API
		if (localCache.has(cacheKey)) {
			const cachedData = localCache.get(cacheKey);
			setDataList(cachedData.items);
			setPagination(cachedData.pagination);
			if (cachedData.availableFilters) setDynamicFilters(cachedData.availableFilters);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(
				`${backendUrl}/api/${endpoint}?${queryParams}`,
				{ signal } // Gắn signal để có thể hủy request nếu có request mới
			);

			if (!response.ok) throw new Error(tUI("common.errorLoadData"));

			const data = await response.json();
			const fetchedItems = data.items || [];

			// 2. Lưu vào Cache
			localCache.set(cacheKey, data);

			setDataList(fetchedItems);

			// Cập nhật từ điển các item đã biết
			setKnownDict(prev => {
				const map = new Map(prev.map(item => [item[idKey], item]));
				fetchedItems.forEach(item => map.set(item[idKey], item));
				return Array.from(map.values());
			});

			setPagination(data.pagination);
			if (data.availableFilters) setDynamicFilters(data.availableFilters);
		} catch (err) {
			if (err.name === 'AbortError') return; // Bỏ qua lỗi nếu request bị hủy
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [endpoint, queryParams, tUI, idKey]);

	useEffect(() => {
		const controller = new AbortController();
		fetchData(controller.signal);
		
		return () => controller.abort(); // Hủy request cũ nếu queryParams thay đổi hoặc component unmount
	}, [fetchData]);

	return {
		dataList,
		knownDict,
		loading,
		error,
		pagination,
		dynamicFilters,
		refetch: fetchData,
	};
};
