import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx"; // Hãy chắc chắn đường dẫn đến AuthContext là chính xác

/**
 * Component "Người gác cổng" để bảo vệ các route.
 *
 * Cách hoạt động:
 * 1. Lấy trạng thái `isAdmin` và `isLoading` từ AuthContext, giống hệt như trong Navbar.
 * 2. Nếu đang trong quá trình tải thông tin người dùng, hiển thị thông báo chờ.
 * 3. Nếu tải xong:
 * - `isAdmin` là `true` -> Cho phép truy cập bằng cách render <Outlet />,
 * <Outlet /> sẽ hiển thị component con (ví dụ: AdminPanel).
 * - `isAdmin` là `false` -> Chuyển hướng người dùng về trang chủ ("/").
 */
const PrivateRoute = () => {
	// Sử dụng cơ chế kiểm tra giống hệt trong navbar.jsx
	const { user, isAdmin, isLoading } = useContext(AuthContext);
	const location = useLocation();

	// Nếu đang xác thực, hiển thị trạng thái chờ
	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-screen bg-[#0f172a]'>
				<div className='text-lg text-white animate-pulse'>Đang xác thực quyền truy cập...</div>
			</div>
		);
	}

	// Nếu chưa đăng nhập -> Chuyển đến trang login và lưu lại trang đang muốn vào
	if (!user) {
		return <Navigate to={`/auth?mode=login&redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
	}

	// Nếu đã đăng nhập nhưng không phải admin -> Về trang chủ
	if (!isAdmin) {
		return <Navigate to='/' replace />;
	}

	// Nếu là admin -> Cho phép truy cập
	return <Outlet />;
};

export default PrivateRoute;
