// fe/src/hooks/usePageTracking.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * usePageTracking Hook
 * Hiện tại đã vô hiệu hóa việc gửi dữ liệu về Backend (analytics/log) 
 * để đồng bộ với việc gỡ bỏ tính năng Analytics.
 * Hook này được giữ lại để tránh gây lỗi break code ở những nơi đang import nó.
 */
const usePageTracking = () => {
	const location = useLocation();
	const { user } = useAuth();

	useEffect(() => {
		// API Analytics đã bị gỡ bỏ, không thực hiện gửi log nữa.
		// console.debug("Page tracking disabled: ", location.pathname);
	}, [location, user]);
};

export default usePageTracking;
