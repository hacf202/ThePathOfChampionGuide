// src/context/LanguageContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const LanguageContext = createContext();

// Khởi tạo một bộ nhớ đệm (cache) ngoài Component
// Giúp không bị fetch lại file JSON nếu người dùng chuyển đổi qua lại nhiều lần
const dictCache = {};

export const LanguageProvider = ({ children }) => {
	const [language, setLanguage] = useState(() => {
		return localStorage.getItem("appLanguage") || "vi";
	});

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

				// 2. Vì hệ thống dùng 'vi' làm fallback, nên nếu đang load 'en' mà chưa có 'vi',
				// ta phải tải luôn 'vi' ngầm ở background.
				if (lang !== "vi" && !dictCache["vi"]) {
					const viModule = await import(`../locales/vi.json`);
					dictCache["vi"] = viModule.default || viModule;
				}

				// 3. Cập nhật State để UI render lại
				if (isMounted) {
					setDictionaries({
						vi: dictCache["vi"],
						[lang]: dictCache[lang],
					});
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
