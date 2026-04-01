import globalsEn from "../assets/data/globals-en_us.json";
import globalsVi from "../assets/data/globals-vi_vn.json";

/**
 * markupLookup - Tiện ích tra cứu thông tin từ khóa (Keywords/Vocab)
 * Hỗ trợ đa ngôn ngữ và chuẩn hóa tìm kiếm.
 */

const dataStore = {
	en: {
		keywords: globalsEn.keywords || [],
		vocabTerms: globalsEn.vocabTerms || [],
		regions: globalsEn.regions || [],
	},
	vi: {
		keywords: globalsVi.keywords || [],
		vocabTerms: globalsVi.vocabTerms || [],
		regions: globalsVi.regions || [],
	},
};

/**
 * Chuẩn hóa chuỗi để tìm kiếm không phân biệt hoa thường và khoảng trắng
 */
const normalize = str => (str || "").toLowerCase().trim();

/**
 * Tra cứu dữ liệu Tooltip
 * @param {string} value - Giá trị cần tìm (VD: "Overwhelm" hoặc "Áp Đảo")
 * @param {string} lang - Ngôn ngữ hiện tại ("en" hoặc "vi")
 * @returns {object|null} - Dữ liệu tìm thấy { name, description, nameRef }
 */
export const getTooltipData = (value, lang = "vi") => {
	const currentLang = lang === "en" ? "en" : "vi";
	const searchKey = normalize(value);

	// 1. Tìm trong Keywords
	let found = dataStore[currentLang].keywords.find(
		k => normalize(k.name) === searchKey || normalize(k.nameRef) === searchKey,
	);

	if (found) return found;

	// 2. Tìm trong VocabTerms
	found = dataStore[currentLang].vocabTerms.find(
		v => normalize(v.name) === searchKey || normalize(v.nameRef) === searchKey,
	);

	if (found) return found;

	// 3. Nếu không thấy ở ngôn ngữ hiện tại, thử tìm ở ngôn ngữ kia (Fallback)
	const otherLang = currentLang === "en" ? "vi" : "en";
	found =
		dataStore[otherLang].keywords.find(
			k => normalize(k.name) === searchKey || normalize(k.nameRef) === searchKey,
		) ||
		dataStore[otherLang].vocabTerms.find(
			v => normalize(v.name) === searchKey || normalize(v.nameRef) === searchKey,
		);

	if (found) {
		// Mẹo: Nếu tìm thấy ở ngôn ngữ kia, chúng ta nên lấy "nameRef" 
		// để tìm lại ở ngôn ngữ hiện tại để có bản dịch đúng.
		const nameRef = found.nameRef;
		return (
			dataStore[currentLang].keywords.find(k => k.nameRef === nameRef) ||
			dataStore[currentLang].vocabTerms.find(v => v.nameRef === nameRef)
		);
	}

	return null;
};

/**
 * Lấy Icon dựa trên nameRef
 */
export const getKeywordIcon = nameRef => {
	// Logic ánh xạ URL icon (Sẽ mở rộng sau dựa trên icon.json nếu cần)
	// Hiện tại trả về null hoặc nameRef để component xử lý
	return nameRef || null;
};
