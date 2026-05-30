// components/layout/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import DesktopNavbar from "./desktopNavbarView";
import MobileSidebar from "./mobileNavbarView";
import { useTranslation } from "@/hooks/useTranslation";
import { LoaderPinwheel } from "lucide-react";

function Navbar() {
	const { language, toggleLanguage, tUI } = useTranslation();
	const [isChangingLanguage, setIsChangingLanguage] = useState(false);
	const [isNavVisible, setIsNavVisible] = useState(true);
	const lastScrollY = useRef(0);

	useEffect(() => {
		const handleScroll = () => {
			const currentY = window.scrollY;
			if (currentY < 10) {
				setIsNavVisible(true);
			} else if (currentY > lastScrollY.current) {
				setIsNavVisible(false);
			} else {
				setIsNavVisible(true);
			}
			lastScrollY.current = currentY;
		};
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

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
								? "Đang chuyển ngôn ngữ..."
								: "Switching Language..."}
						</p>
					</div>
				</div>
			)}

			<DesktopNavbar
				language={language}
				handleLanguageChange={handleLanguageChange}
				tUI={tUI}
				isNavVisible={isNavVisible}
			/>
			<MobileSidebar
				language={language}
				handleLanguageChange={handleLanguageChange}
				tUI={tUI}
				isNavVisible={isNavVisible}
			/>
		</>
	);
}

export default Navbar;
