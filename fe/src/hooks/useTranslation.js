// src/hooks/useTranslation.js
import { useContext, useCallback } from "react";
import { LanguageContext } from "../context/LanguageContext";

export const useTranslation = () => {
	// Lấy thêm dictionaries và isLangLoading từ Context
	const { language, toggleLanguage, dictionaries, isLangLoading } =
		useContext(LanguageContext);

	/**
	 * Hàm dịch thuật tự động cho DỮ LIỆU ĐỘNG từ Database (Giữ nguyên logic cũ)
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
	);

	/**
	 * Hàm dịch thuật cho VĂN BẢN TĨNH trên giao diện (UI)
	 */
	const tUI = useCallback(
		key => {
			// BẢO VỆ: Nếu tệp JSON chưa tải xong, trả tạm về key rỗng
			if (!dictionaries[language]) return "";

			const keys = key.split(".");
			let result = dictionaries[language];

			for (const k of keys) {
				if (result && result[k] !== undefined) {
					result = result[k];
				} else {
					return key; // Trả về nguyên gốc key nếu không tìm thấy, không fallback.
				}
			}

			return result;
		},
		[language, dictionaries], // Thêm dictionaries vào dependency array
	);

	// Trả về thêm cờ isLangLoading để giao diện bên ngoài có thể hiển thị hiệu ứng xoay (spinner)
	return {
		language,
		toggleLanguage,
		tDynamic,
		tUI,
		t: tDynamic,
		isLangLoading,
	};
};
