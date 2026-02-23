// src/hooks/useFavoriteStatus.js
import { useState, useEffect, useCallback } from "react";

export const useFavoriteStatus = (buildIds, token) => {
	const [statusMap, setStatusMap] = useState({});
	const [isLoading, setIsLoading] = useState(false);

	// Khắc phục lỗi .join: Đảm bảo buildIds luôn là mảng
	const idsArray = Array.isArray(buildIds) ? buildIds : [buildIds];
	const singleId = idsArray[0];

	const fetchStatus = useCallback(async () => {
		if (!token || idsArray.length === 0 || !idsArray[0]) return;
		setIsLoading(true);
		try {
			const apiUrl = import.meta.env.VITE_API_URL;
			// Gọi API batch với danh sách ID đã được join
			const res = await fetch(
				`${apiUrl}/api/builds/favorites/batch?ids=${idsArray.join(",")}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (res.ok) {
				const data = await res.json();
				setStatusMap(data);
			}
		} catch (err) {
			console.error("Lỗi lấy trạng thái yêu thích:", err);
		} finally {
			setIsLoading(false);
		}
	}, [idsArray.join(","), token]);

	useEffect(() => {
		fetchStatus();
	}, [fetchStatus]);

	const toggleFavorite = async () => {
		if (!token || !singleId) return;
		try {
			const apiUrl = import.meta.env.VITE_API_URL;
			const res = await fetch(`${apiUrl}/api/builds/${singleId}/favorite`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});
			if (res.ok) {
				const result = await res.json();
				// Cập nhật lại map trạng thái cục bộ
				setStatusMap(prev => ({ ...prev, [singleId]: result.isFavorited }));
				return result;
			}
		} catch (err) {
			console.error("Lỗi toggle yêu thích:", err);
		}
	};

	return {
		isFavorite: !!statusMap[singleId],
		toggleFavorite,
		isLoading,
		refreshStatus: fetchStatus,
	};
};
