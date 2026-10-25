// @refresh reset
// src/context/LanguageContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const LanguageContext = createContext();

// Khởi tạo một bộ nhớ đệm (cache) ngoài Component
// Giúp không bị fetch lại file JSON nếu người dùng chuyển đổi qua lại nhiều lần
const dictCache = {};

// Hàm xác định ngôn ngữ ban đầu cho người dùng
const getInitialLanguage = () => {
	try {
		// 1. Kiểm tra ngôn ngữ đã lưu trước đó trong localStorage
		const saved = localStorage.getItem("appLanguage");
		if (saved && (saved === "vi" || saved === "en")) {
			return saved;
		}

		// 2. Lần đầu truy cập: kiểm tra ngôn ngữ trình duyệt của người dùng
		if (typeof navigator !== "undefined") {
			const browserLang = (
				navigator.language ||
				(navigator.languages && navigator.languages[0]) ||
				""
			).toLowerCase();

			// Nếu trình duyệt là tiếng Việt -> dùng tiếng Việt
			if (browserLang.startsWith("vi")) {
				return "vi";
			}
		}
	} catch (error) {
		console.warn("Lỗi kiểm tra ngôn ngữ trình duyệt:", error);
	}

	// 3. Ngược lại nếu không phải tiếng Việt -> mặc định tiếng Anh
	return "en";
};

export const LanguageProvider = ({ children }) => {
	const [language, setLanguage] = useState(getInitialLanguage);

	// Lưu trữ nội dung file JSON sau khi đã tải xong
	const [dictionaries, setDictionaries] = useState({
		vi: null,
		en: null,
	});

	// Cờ trạng thái để báo cho UI biết hệ thống đang tải file ngôn ngữ
	const [isLangLoading, setIsLangLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const loadDictionary = async lang => {
			setIsLangLoading(true);
			try {
				// 1. Nếu chưa có trong Cache thì tiến hành tải lười (Lazy Load)
				if (!dictCache[lang]) {
					// Vite/Webpack sẽ tự động code-split chỗ này
					const module = await import(`../locales/${lang}.json`);
					dictCache[lang] = module.default || module;
				}
				// 2. Cập nhật State để UI render lại
				if (isMounted) {
					setDictionaries(prev => ({
						...prev,
						[lang]: dictCache[lang],
					}));
				}
			} catch (error) {
				console.error(`Lỗi tải tệp ngôn ngữ: ${lang}`, error);
			} finally {
				if (isMounted) setIsLangLoading(false);
			}
		};

		loadDictionary(language);

		// Lưu lại cấu hình và tối ưu SEO như cũ
		localStorage.setItem("appLanguage", language);
		document.documentElement.lang = language;
	}, [language]);

	const toggleLanguage = () => {
		setLanguage(prevLang => (prevLang === "vi" ? "en" : "vi"));
	};

	return (
		<LanguageContext.Provider
			value={{
				language,
				toggleLanguage,
				dictionaries,
				isLangLoading,
			}}
		>
			{children}
		</LanguageContext.Provider>
	);
};
