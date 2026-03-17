// src/utils/vietnameseUtils.js

/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành không dấu.
 * @param {string} str - Chuỗi đầu vào.
 * @returns {string} Chuỗi đã được bỏ dấu.
 */
export const removeAccents = str => {
	if (!str) return "";
	return str
		.normalize("NFD") // Tách ký tự và dấu
		.replace(/[\u0300-\u036f]/g, "") // Loại bỏ các ký tự dấu
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D");
};
