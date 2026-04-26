// src/hooks/useBuildData.js
import { useState, useEffect, useCallback } from "react";

export const useBuildData = (activeTab, queryParams, tUI, token) => {
	const [builds, setBuilds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({
		totalPages: 1,
		totalItems: 0,
		currentPage: 1,
	});
	const [dynamicFilters, setDynamicFilters] = useState({ regions: [] });

	const fetchBuilds = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			let endpoint = `/api/builds?${queryParams}`;

			// Điều hướng API dựa trên Tab
			if (activeTab === "my-builds")
				endpoint = `/api/builds/my-builds?${queryParams}`;
			else if (activeTab === "favorites")
				endpoint = `/api/builds/favorites?${queryParams}`;

			const headers = { "Content-Type": "application/json" };
			if (token && (activeTab === "my-builds" || activeTab === "favorites")) {
				headers["Authorization"] = `Bearer ${token}`;
			}

			const response = await fetch(`${backendUrl}${endpoint}`, { headers });
			if (!response.ok) throw new Error(tUI("common.error"));

			const data = await response.json();
			setBuilds(data.items || []);
			setPagination(data.pagination || { totalPages: 1, currentPage: 1 });

			// Giả lập lấy dynamic filters nếu backend trả về (ví dụ các khu vực có build)
			if (data.availableFilters) {
				setDynamicFilters(data.availableFilters);
			} else {
				// Nếu backend chưa hỗ trợ dynamic filters cho build, ta cung cấp mảng mặc định
				setDynamicFilters({
					regions: [
						"Demacia",
						"Noxus",
						"Ionia",
						"Piltover & Zaun",
						"Shadow Isles",
						"Freljord",
						"Bilgewater",
						"Targon",
						"Shurima",
						"Bandle City",
						"Runeterra",
					],
				});
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [activeTab, queryParams, tUI, token]);

	useEffect(() => {
		fetchBuilds();
	}, [fetchBuilds]);

	return {
		builds,
		loading,
		error,
		pagination,
		dynamicFilters,
		refetch: fetchBuilds,
	};
};
