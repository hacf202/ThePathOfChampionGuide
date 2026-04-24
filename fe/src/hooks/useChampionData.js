// src/hooks/useChampionData.js
import { useState, useEffect, useCallback } from "react";

export const useChampionData = (queryParams, tUI) => {
	const [champions, setChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		totalPages: 1,
		totalItems: 0,
		currentPage: 1,
	});
	const [dynamicFilters, setDynamicFilters] = useState({
		tags: [],
		regions: [],
		costs: [],
		maxStars: [],
	});

	const fetchChampions = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(
				`${backendUrl}/api/champions?${queryParams}`,
			);

			if (!response.ok) throw new Error(tUI("common.error"));

			const data = await response.json();

			setChampions(
				data.items.map(c => ({
					...c,
					avatarUrl:
						c.assets?.[0]?.avatar ||
						c.assets?.[0]?.fullAbsolutePath ||
						"/fallback-champion.png",
					cost: Number(c.cost) || 0,
					maxStar: Number(c.maxStar) || 3,
				})),
			);
			setPagination(data.pagination);
			if (data.availableFilters) {
				setDynamicFilters(data.availableFilters);
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setTimeout(() => setLoading(false), 800); // Giữ delay cho animation skeleton mượt mà
		}
	}, [queryParams, tUI]);

	useEffect(() => {
		fetchChampions();
	}, [fetchChampions]);

	return {
		champions,
		loading,
		error,
		pagination,
		dynamicFilters,
		refetch: fetchChampions,
	};
};
