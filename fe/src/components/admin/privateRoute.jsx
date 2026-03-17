import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
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
	const { isAdmin, isLoading } = useContext(AuthContext);

	// Nếu đang xác thực, hiển thị trạng thái chờ
	// PrivateRoute.jsx
	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-lg'>Đang xác thực quyền truy cập...</div>
			</div>
		);
	}

	// Nếu là admin thì cho phép truy cập, ngược lại thì điều hướng về trang chủ
	return isAdmin ? <Outlet /> : <Navigate to='/' replace />;
};

export default PrivateRoute;
