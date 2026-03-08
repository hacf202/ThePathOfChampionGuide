// components/layout/Navbar.jsx
import React from "react";
import DesktopNavbar from "./desktopNavbarView";
import MobileSidebar from "./mobileNavbarView";
import { useTranslation } from "../../hooks/useTranslation"; // Import hook đa ngôn ngữ

function Navbar() {
	// Lấy state và hàm chuyển đổi ngôn ngữ từ Context
	const { language, toggleLanguage } = useTranslation();

	return (
		<>
			<DesktopNavbar language={language} toggleLanguage={toggleLanguage} />
			<MobileSidebar language={language} toggleLanguage={toggleLanguage} />
		</>
	);
}

export default Navbar;
