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

		// 1. Batch Count (Luôn gọi vì là public endpoint)
		fetch(`${apiUrl}/api/builds/favorites/count/batch?ids=${buildIdsStr}`)
			.then(res => {
				if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
				return res.json();
			})
			.then(data => setFavoriteCounts(data || {}))
			.catch(err => console.error("Batch count error:", err));

		// 2. Batch Status (Chỉ gọi nếu ĐÃ ĐĂNG NHẬP và TOKEN HỢP LỆ)
		// Tránh trường hợp token bị gán thành chuỗi "null" hoặc "undefined" từ localStorage
		if (token && token !== "null" && token !== "undefined") {
			fetch(`${apiUrl}/api/builds/favorites/batch?ids=${buildIdsStr}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
				.then(res => {
					// Nếu backend trả về 401 (Unauthorized) hoặc 403 (Forbidden) -> Token lỗi/hết hạn
					if (res.status === 401 || res.status === 403) {
						console.warn(
							"Token không hợp lệ hoặc đã hết hạn. Đang tải dưới quyền khách.",
						);
						return {}; // Trả về object rỗng một cách an toàn
					}
					if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
					return res.json();
				})
				.then(data => setFavoriteStatus(data || {}))
				.catch(err => console.error("Batch status error:", err));
		} else {
			// Nếu không có token hợp lệ, dọn dẹp state status
			setFavoriteStatus({});
		}
	}, [buildIdsStr, token]);

	// Hàm cập nhật state để UI phản hồi ngay lập tức (Optimistic Update)
	const toggleFavorite = (buildId, newStatus, newCount) => {
		setFavoriteStatus(prev => ({ ...prev, [buildId]: newStatus }));
		setFavoriteCounts(prev => ({ ...prev, [buildId]: newCount }));
	};

	return { favoriteStatus, favoriteCounts, toggleFavorite };
};
