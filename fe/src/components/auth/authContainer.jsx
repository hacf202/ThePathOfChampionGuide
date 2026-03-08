// src/pages/auth/AuthContainer.jsx

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Login from "./login.jsx";
import Register from "./register.jsx";
import { ChevronLeft } from "lucide-react";
import Button from "../common/button.jsx";
import PageTitle from "../common/pageTitle";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook

const AuthContainer = () => {
	const { language } = useTranslation(); // 🟢 Khởi tạo Hook
	const [isLoginView, setIsLoginView] = useState(true);
	const navigate = useNavigate();
	const location = useLocation();

	// Chỉ hiển thị nút quay lại nếu có trang trước đó
	const showBackButton = location.key !== "default";

	const handleLoginSuccess = () => {
		navigate("/builds");
	};

	const handleRegisterSuccess = () => {
		setIsLoginView(true);
	};

	const switchToRegister = () => setIsLoginView(false);
	const switchToLogin = () => setIsLoginView(true);

	const handleBack = () => {
		if (showBackButton) {
			navigate(-1);
		} else {
			navigate("/");
		}
	};

	return (
		<div>
			<PageTitle
				title={language === "vi" ? "Đăng nhập / đăng ký" : "Login / Register"}
			/>
			<div className='flex justify-center min-h-screen p-4 pt-16 sm:pt-20 font-secondary'>
				<div className='w-full max-w-lg'>
					{/* === NÚT QUAY LẠI - NẰM TRÊN FORM === */}
					{showBackButton && (
						<div className='mb-4'>
							<Button onClick={handleBack} variant='outline'>
								<ChevronLeft size={18} />
								{language === "vi" ? "Quay lại" : "Back"}
							</Button>
						</div>
					)}

					{/* === TAB ĐĂNG NHẬP / ĐĂNG KÝ === */}
					<div className='flex mb-0'>
						<button
							onClick={switchToLogin}
							className={`relative flex-1 py-3 px-4 font-primary font-bold text-lg rounded-t-xl transition-all duration-300 ease-in-out
              ${
								isLoginView
									? "bg-surface-bg text-text-primary shadow-inner-top"
									: "bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-surface-active"
							}`}
						>
							{language === "vi" ? "Đăng Nhập" : "Login"}
							{isLoginView && (
								<span className='absolute bottom-0 left-0 w-full h-1 bg-primary-500'></span>
							)}
						</button>

						<button
							onClick={switchToRegister}
							className={`relative flex-1 py-3 px-4 font-primary font-bold text-lg rounded-t-xl transition-all duration-300 ease-in-out
              ${
								!isLoginView
									? "bg-surface-bg text-text-primary shadow-inner-top"
									: "bg-surface-hover text-text-secondary hover:text-text-primary hover:bg-surface-active"
							}`}
						>
							{language === "vi" ? "Đăng Ký" : "Register"}
							{!isLoginView && (
								<span className='absolute bottom-0 left-0 w-full h-1 bg-primary-500'></span>
							)}
						</button>
					</div>

					{/* === NỘI DUNG FORM === */}
					<div className='bg-surface-bg rounded-b-xl shadow-primary-md overflow-hidden border-t border-transparent'>
						{isLoginView ? (
							<Login
								onSwitchToRegister={switchToRegister}
								onSuccess={handleLoginSuccess}
							/>
						) : (
							<Register
								onSwitchToLogin={switchToLogin}
								onClose={handleRegisterSuccess}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthContainer;
