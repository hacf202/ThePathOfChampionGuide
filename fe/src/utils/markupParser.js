/**
 * parseMarkup - Chuyển đổi chuỗi văn bản chứa thẻ đánh dấu thành mảng các phân đoạn.
 * Cú pháp hỗ trợ: [type:value|label]
 * Ví dụ: [k:Overwhelm], [c:Yasuo|Đấng], [i:Gold]
 */
export const parseMarkup = text => {
	if (!text) return [];

	/**
	 * Regex hỗ trợ: 
	 * 1. [type:value|label|options] (loại thẻ đặc biệt)
	 * 2. <(b|i|br)/> (thẻ HTML rỗng/mở)
	 * 3. </(b|i)> (thẻ HTML đóng)
	 * 4. \n hoặc literal \n (xuống dòng)
	 */
	const regex = /\[([a-z]+):([^\]|]+)(?:\|([^|\]]*))?(?:\|([^\]]*))?\]|<(b|i|br)\/?>|<\/(b|i)>|(\\n|\n)/gi;
	const segments = [];
	let lastIndex = 0;
	let match;

	while ((match = regex.exec(text)) !== null) {
		// Thêm phần văn bản thuần trước thẻ
		if (match.index > lastIndex) {
			segments.push({
				type: "text",
				value: text.substring(lastIndex, match.index),
			});
		}

		if (match[1]) {
			// Thêm phân đoạn của thẻ [type:value|label|options]
			segments.push({
				type: "tag",
				tagType: match[1].toLowerCase(),
				tagValue: match[2],
				tagLabel: match[3] || match[2],
				tagOptions: match[4] ? match[4].split(",").map(opt => opt.trim()) : [],
				original: match[0],
			});
		} else if (match[5]) {
			// Thẻ mở HTML: <b>, <i>, <br>
			segments.push({
				type: "html_open",
				tag: match[5].toLowerCase(),
			});
		} else if (match[6]) {
			// Thẻ đóng HTML: </b>, </i>
			segments.push({
				type: "html_close",
				tag: match[6].toLowerCase(),
			});
		} else if (match[7]) {
			// Xuống dòng thực sự (\n) hoặc ký tự \n
			segments.push({
				type: "html_open",
				tag: "br",
			});
		}

		lastIndex = regex.lastIndex;
	}

	// Thêm phần văn bản thuần còn lại
	if (lastIndex < text.length) {
		segments.push({
			type: "text",
			value: text.substring(lastIndex),
		});
	}

	return segments;
};
