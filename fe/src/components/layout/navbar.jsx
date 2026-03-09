// components/layout/Navbar.jsx
import React, { useState } from "react";
import DesktopNavbar from "./desktopNavbarView";
import MobileSidebar from "./mobileNavbarView";
import { useTranslation } from "../../hooks/useTranslation";
import { LoaderPinwheel } from "lucide-react";

function Navbar() {
	const { language, toggleLanguage, tUI } = useTranslation();
	const [isChangingLanguage, setIsChangingLanguage] = useState(false);

	// Hàm xử lý chuyển đổi ngôn ngữ có kèm loading
	const handleLanguageChange = targetLang => {
		if (targetLang !== language) {
			setIsChangingLanguage(true);
			// Hiệu ứng loading giả lập 600ms để mượt mà
			setTimeout(() => {
				toggleLanguage();
				setIsChangingLanguage(false);
			}, 600);
		}
	};

	return (
		<>
			{/* Màn hình Loading Overlay khi chuyển ngôn ngữ */}
			{isChangingLanguage && (
				<div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity'>
					<div className='flex flex-col items-center text-white'>
						<LoaderPinwheel className='w-14 h-14 animate-spin mb-4' />
						<p className='text-lg font-semibold tracking-wider font-primary'>
							{language === "vi"
								? "Switching Language..."
								: "Đang chuyển ngôn ngữ..."}
						</p>
					</div>
				</div>
			)}

			<DesktopNavbar
				language={language}
				handleLanguageChange={handleLanguageChange}
				tUI={tUI}
			/>
			<MobileSidebar
				language={language}
				handleLanguageChange={handleLanguageChange}
				tUI={tUI}
			/>
		</>
	);
}

export default Navbar;
