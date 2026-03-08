// fe/src/hooks/usePageTracking.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../context/services/apiHelper"; // 🟢 Sửa thành Named Import (thêm ngoặc nhọn)
import { useAuth } from "../context/AuthContext";

const usePageTracking = () => {
	const location = useLocation();
	const { user } = useAuth();

	useEffect(() => {
		const sendAnalytics = async () => {
			let loadTime = 0;

			// Đo lường hiệu năng tải trang (Performance Tracking)
			if (window.performance && window.performance.getEntriesByType) {
				const navEntry = window.performance.getEntriesByType("navigation")[0];
				if (navEntry) {
					// Thời gian từ lúc bắt đầu cho đến khi trang load xong hoàn toàn
					loadTime = navEntry.loadEventEnd - navEntry.startTime;
				}
			}

			try {
				// Lấy token từ localStorage (nếu có) để backend xác thực user retention
				// 🟢 Đổi "idToken" thành "token" để đồng bộ với key lưu trong AuthContext
				const token = localStorage.getItem("token");

				await api.post(
					"/analytics/log",
					{
						path: location.pathname + location.search,
						referrer: document.referrer,
						userAgent: navigator.userAgent,
						userId: user?.username || null,
						loadTime: Math.round(loadTime),
					},
					token,
				);
			} catch (err) {
				console.debug("Analytics silent failure");
			}
		};

		// Chờ 1.5 giây để đảm bảo loadEventEnd đã được trình duyệt cập nhật chính xác
		const timer = setTimeout(sendAnalytics, 1500);
		return () => clearTimeout(timer);
	}, [location, user]);
};

export default usePageTracking;
