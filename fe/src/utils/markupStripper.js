/**
 * stripMarkup - Loại bỏ các thẻ markup [type:id|label|options]
 * Trả về nội dung thuần văn bản (chỉ giữ lại label).
 */
export const stripMarkup = (text) => {
	if (!text) return "";
	
	// Thay thế [type:id|label|options] bằng label
	// Nhóm 1: type, Nhóm 2: id, Nhóm 3: label, Nhóm 4: options
	let result = text.replace(/\[([a-z]+):([^\]|]+)\|([^\]|]+)(?:\|[^\]]*)?\]/gi, "$3");
	
	// Thay thế các thẻ dạng đơn giản [type:label] bằng label
	result = result.replace(/\[([a-z]+):([^\]|]+)\]/gi, "$2");
	
	return result;
};
