/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành không dấu và loại bỏ các ký tự đặc biệt.
 * Phục vụ cho mục đích tìm kiếm gần chính xác (Fuzzy Search).
 * * @param {string} str - Chuỗi cần chuẩn hóa
 * @returns {string} - Chuỗi đã loại bỏ dấu, đưa về chữ thường
 */
export const removeAccents = str => {
	if (!str || typeof str !== "string") return "";

	return str
		.normalize("NFD") // Tách các tổ hợp dấu ra khỏi chữ cái gốc (vd: 'ế' -> 'e' + '̂' + '́')
		.replace(/[\u0300-\u036f]/g, "") // Loại bỏ các ký tự dấu vừa tách
		.replace(/đ/g, "d") // Xử lý riêng chữ đ thường
		.replace(/Đ/g, "D") // Xử lý riêng chữ Đ hoa
		.replace(/[^a-zA-Z0-9\s]/g, "") // Tùy chọn: Loại bỏ ký tự đặc biệt chỉ giữ lại chữ và số
		.toLowerCase() // Chuyển về chữ thường để so sánh chính xác
		.trim(); // Loại bỏ khoảng trắng thừa ở hai đầu
};

/**
 * Kiểm tra xem một chuỗi nguồn có chứa từ khóa tìm kiếm hay không (không phân biệt dấu).
 * * @param {string} source - Chuỗi gốc (ví dụ: tên tướng trong DB)
 * @param {string} keyword - Từ khóa người dùng nhập
 * @returns {boolean}
 */
export const fuzzyMatch = (source, keyword) => {
	const normalizedSource = removeAccents(source);
	const normalizedKeyword = removeAccents(keyword);
	return normalizedSource.includes(normalizedKeyword);
};
