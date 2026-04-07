import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

/**
 * useUnsavedChanges Hook - Bảo vệ dữ liệu chưa lưu khi điều hướng
 * @param {boolean} isDirty - Trạng thái đã thay đổi dữ liệu nhưng chưa lưu
 * @returns {object} blocker - Đối tượng blocker từ react-router-dom
 */
const useUnsavedChanges = (isDirty) => {
	// 1. Chặn điều hướng nội bộ bằng React Router v7
	const blocker = useBlocker(
		({ currentLocation, nextLocation }) =>
			isDirty && currentLocation.pathname !== nextLocation.pathname
	);

	// 2. Chặn việc đóng Tab hoặc F5 trang bằng sự kiện trình duyệt
	useEffect(() => {
		const handleBeforeUnload = (e) => {
			if (isDirty) {
				e.preventDefault();
				e.returnValue = ""; // Hiển thị cảnh báo chuẩn của trình duyệt
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [isDirty]);

	return blocker;
};

export default useUnsavedChanges;
