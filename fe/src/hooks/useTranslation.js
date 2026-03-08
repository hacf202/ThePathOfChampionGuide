// src/hooks/useTranslation.js
import { useContext, useCallback } from "react";
import { LanguageContext } from "../context/LanguageContext";

// Import các file từ điển tĩnh
import viDict from "../locales/vi.json";
import enDict from "../locales/en.json";

const dictionaries = {
	vi: viDict,
	en: enDict,
};

export const useTranslation = () => {
	const { language, toggleLanguage } = useContext(LanguageContext);

	/**
	 * Hàm dịch thuật tự động cho DỮ LIỆU ĐỘNG từ Database
	 */
	const tDynamic = useCallback(
		(item, field = "name") => {
			if (!item) return "";

			if (
				language === "en" &&
				item.translations &&
				item.translations.en &&
				item.translations.en[field] !== undefined
			) {
				return item.translations.en[field];
			}

			return item[field] || "";
		},
		[language],
	); // Bọc useCallback, chỉ tạo lại khi language thay đổi

	/**
	 * Hàm dịch thuật cho VĂN BẢN TĨNH trên giao diện (UI)
	 */
	const tUI = useCallback(
		key => {
			const keys = key.split(".");
			let result = dictionaries[language];

			for (const k of keys) {
				if (result && result[k] !== undefined) {
					result = result[k];
				} else {
					let fallbackResult = dictionaries["vi"];
					for (const fallbackKey of keys) {
						if (fallbackResult && fallbackResult[fallbackKey] !== undefined) {
							fallbackResult = fallbackResult[fallbackKey];
						} else {
							return key;
						}
					}
					return fallbackResult;
				}
			}

			return result;
		},
		[language],
	); // Bọc useCallback, chặn đứng vòng lặp vô hạn (Infinite Loop)

	return { language, toggleLanguage, tDynamic, tUI };
};
