// src/context/LanguageContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
	// Khởi tạo ngôn ngữ mặc định từ localStorage, mặc định là 'vi'
	const [language, setLanguage] = useState(() => {
		const savedLang = localStorage.getItem("appLanguage");
		return savedLang ? savedLang : "vi";
	});

	// Mỗi khi ngôn ngữ thay đổi, lưu lại vào localStorage và cập nhật HTML lang
	useEffect(() => {
		localStorage.setItem("appLanguage", language);
		document.documentElement.lang = language; // Cực kỳ quan trọng cho SEO
	}, [language]);

	// Hàm chuyển đổi qua lại giữa 'vi' và 'en'
	const toggleLanguage = () => {
		setLanguage(prevLang => (prevLang === "vi" ? "en" : "vi"));
	};

	return (
		<LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
			{children}
		</LanguageContext.Provider>
	);
};
