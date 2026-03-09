// src/components/common/AnnouncementPopup.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "./button";
import Logo from "/ahriicon.png";

// Đổi key để tránh xung đột với cache cũ của user
const ANNOUNCEMENT_KEY = "pocguide_daily_ad_announcement";

const AnnouncementPopup = () => {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		// Lấy ngày hiện tại dưới dạng chuỗi (VD: "Mon Mar 09 2026")
		const today = new Date().toDateString();

		// Lấy ngày đã lưu trong localStorage
		const lastSeenDate = localStorage.getItem(ANNOUNCEMENT_KEY);

		// Nếu chưa từng xem hoặc ngày xem cuối cùng không phải là hôm nay
		if (lastSeenDate !== today) {
			const timer = setTimeout(() => {
				setIsOpen(true);
				// Cập nhật lại ngày đã xem là hôm nay
				localStorage.setItem(ANNOUNCEMENT_KEY, today);
			}, 0); // Có thể tăng số này lên (VD: 1000) nếu muốn delay 1s mới hiện

			return () => clearTimeout(timer);
		}
	}, []);

	const handleClose = () => {
		setIsOpen(false);
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn'>
			<div className='relative max-w-md w-full bg-surface-bg rounded-xl shadow-2xl border border-primary-500/30 p-6 animate-slideUp'>
				{/* Nút đóng */}
				<button
					onClick={handleClose}
					className='absolute top-3 right-3 text-text-secondary hover:text-text-primary  '
				>
					<X size={20} />
				</button>

				{/* Icon */}
				<div className='flex justify-center mb-4'>
					<div className='p-3 bg-primary-500/10 rounded-full'>
						<img src={Logo} alt='LOGO' className='w-8 h-8 text-primary-500' />
					</div>
				</div>

				{/* Nội dung */}
				<h3 className='text-xl font-bold text-center text-text-primary mb-3'>
					Thông Báo Quan Trọng
				</h3>
				<p className='text-center text-text-secondary mb-6 leading-relaxed'>
					Vui lòng cho phép quảng cáo xuất hiện trên trang web để trang web có
					kinh phí duy trì. Sự ủng hộ của bạn giúp web có thể cập nhật thêm
					nhiều nội dung hữu ích trong thời gian tới.
				</p>

				{/* Nút */}
				<div className='flex justify-center'>
					<Button
						onClick={handleClose}
						className='bg-primary-500 hover:bg-primary-600 text-white font-medium px-6'
					>
						Đã hiểu
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AnnouncementPopup;
