// fe/src/hooks/useBatchFavoriteData.js
import { useState, useEffect } from "react";

export const useBatchFavoriteData = (builds, token) => {
	const [favoriteStatus, setFavoriteStatus] = useState({});
	const [favoriteCounts, setFavoriteCounts] = useState({});

	// 🟢 QUAN TRỌNG: Tạo ra một chuỗi ID (String) cố định thay vì dùng mảng (Array).
	// Chuỗi String sẽ không bị cấp phát lại vùng nhớ khi re-render, giúp CHẶN ĐỨNG LỖI INFINITE LOOP API.
	const buildIdsStr = builds ? builds.map(b => b.id).join(",") : "";

	useEffect(() => {
		if (!buildIdsStr) return;

		const apiUrl = import.meta.env.VITE_API_URL;

		// 1. Batch Count (Luôn gọi)
		fetch(`${apiUrl}/api/builds/favorites/count/batch?ids=${buildIdsStr}`)
			.then(res => res.json())
			.then(data => setFavoriteCounts(data))
			.catch(err => console.error("Batch count error:", err));

		// 2. Batch Status (Chỉ gọi nếu đã đăng nhập)
		if (token) {
			fetch(`${apiUrl}/api/builds/favorites/batch?ids=${buildIdsStr}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
				.then(res => res.json())
				.then(data => setFavoriteStatus(data))
				.catch(err => console.error("Batch status error:", err));
		}
	}, [buildIdsStr, token]); // Phụ thuộc vào chuỗi ID (buildIdsStr)

	// Hàm cập nhật state để UI phản hồi ngay lập tức (Optimistic Update)
	const toggleFavorite = (buildId, newStatus, newCount) => {
		setFavoriteStatus(prev => ({ ...prev, [buildId]: newStatus }));
		setFavoriteCounts(prev => ({ ...prev, [buildId]: newCount }));
	};

	return { favoriteStatus, favoriteCounts, toggleFavorite };
};
