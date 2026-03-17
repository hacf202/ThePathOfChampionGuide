// src/hooks/useGenericData.js
import { useState, useEffect, useCallback } from "react";

export const useGenericData = (
	endpoint,
	queryParams,
	tUI,
	idKey = "itemCode",
) => {
	const [dataList, setDataList] = useState([]);
	const [knownDict, setKnownDict] = useState([]); // Thay cho knownItems, knownRelics...
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		totalPages: 1,
		totalItems: 0,
		currentPage: 1,
	});
	const [dynamicFilters, setDynamicFilters] = useState({});

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(
				`${backendUrl}/api/${endpoint}?${queryParams}`,
			);

			if (!response.ok) throw new Error(tUI("common.errorLoadData"));

			const data = await response.json();
			const fetchedItems = data.items || [];

			setDataList(fetchedItems);

			// Lưu từ điển (Dùng idKey linh hoạt vì Relic có thể dùng relicCode, Item dùng itemCode)
			setKnownDict(prev => {
				const map = new Map(prev.map(item => [item[idKey], item]));
				fetchedItems.forEach(item => map.set(item[idKey], item));
				return Array.from(map.values());
			});

			setPagination(data.pagination);
			if (data.availableFilters) setDynamicFilters(data.availableFilters);
		} catch (err) {
			setError(err.message);
		} finally {
			setTimeout(() => setLoading(false), 500);
		}
	}, [endpoint, queryParams, tUI, idKey]);

	useEffect(() => {
		fetchData();
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
