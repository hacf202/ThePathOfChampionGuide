// src/hooks/useGenericData.js
import { useState, useEffect, useCallback } from "react";

// Cache với TTL 5 phút và giới hạn 100 entry để tránh memory leak
const CACHE_TTL_MS = 5 * 60 * 1000;  // 5 phút
const CACHE_MAX_SIZE = 100;

const localCache = new Map(); // { key → { data, timestamp } }

function cacheGet(key) {
	const entry = localCache.get(key);
	if (!entry) return null;
	if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
		localCache.delete(key);
		return null;
	}
	return entry.data;
}

function cacheSet(key, data) {
	// Evict entry cũ nhất nếu vượt giới hạn
	if (localCache.size >= CACHE_MAX_SIZE) {
		const firstKey = localCache.keys().next().value;
		localCache.delete(firstKey);
	}
	localCache.set(key, { data, timestamp: Date.now() });
}

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
		
		// 1. Kiểm tra Cache có TTL trước khi gọi API
		const cachedData = cacheGet(cacheKey);
		if (cachedData) {
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

			if (!response.ok) throw new Error(tUI("common.error"));

			const data = await response.json();
			const fetchedItems = data.items || [];

			// 2. Lưu vào Cache (kèm TTL)
			cacheSet(cacheKey, data);

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
			if (!signal?.aborted) {
				setLoading(false);
			}
		}
	}, [endpoint, queryParams, tUI, idKey]);

	useEffect(() => {
		const controller = new AbortController();
		fetchData(controller.signal);
		
		return () => controller.abort(); // Hủy request cũ nếu queryParams thay đổi hoặc component unmount
	}, [fetchData]);

	// refetch() dùng để gọi lại từ bên ngoài (vd: sau khi delete)
	// Xóa cache entry hiện tại để buộc fetch mới từ API
	const refetch = useCallback(() => {
		const cacheKey = `${endpoint}?${queryParams}`;
		localCache.delete(cacheKey);
		const controller = new AbortController();
		fetchData(controller.signal);
	}, [endpoint, queryParams, fetchData]);

	return {
		dataList,
		knownDict,
		loading,
		error,
		pagination,
		dynamicFilters,
		refetch,
	};
};
