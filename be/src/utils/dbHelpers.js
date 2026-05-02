/**
 * Chuyển đổi dữ liệu display (boolean hoặc string "true"/"false") về định dạng chuẩn boolean.
 * Hỗ trợ khả năng tương thích ngược với dữ liệu cũ từ MongoDB.
 */
export const normalizeDisplay = (item) => {
	if (!item) return item;
	const newItem = { ...item };
	if (newItem.display === "true" || newItem.display === true) {
		newItem.display = true;
	} else if (newItem.display === "false" || newItem.display === false) {
		newItem.display = false;
	}
	return newItem;
};

/**
 * Chuẩn bị dữ liệu display trước khi lưu vào MongoDB.
 * Đảm bảo luôn lưu dưới dạng boolean.
 */
export const prepareDisplayForSave = (value) => {
	if (value === "true" || value === true) return true;
	if (value === "false" || value === false) return false;
	return !!value; // Fallback về boolean
};
