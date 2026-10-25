import axios from "axios";
import sharp from "sharp";

const ALLOWED_HOSTNAME_PATTERNS = [
	/(^|\.)pvp\.net$/i,
	/(^|\.)riotgames\.com$/i,
	/(^|\.)pocguide\.top$/i,
	/(^|\.)r2\.cloudflarestorage\.com$/i,
	/(^|\.)githubusercontent\.com$/i,
];

/**
 * Kiểm tra tính hợp lệ và an toàn của URL (Chống SSRF)
 */
export function isSafeImageUrl(urlString) {
	try {
		const parsed = new URL(urlString);
		// Chỉ cho phép giao thức http và https
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
			return false;
		}

		const hostname = parsed.hostname.toLowerCase();

		// Chặn localhost, internal IP và cloud metadata
		if (
			hostname === "localhost" ||
			hostname === "127.0.0.1" ||
			hostname === "0.0.0.0" ||
			hostname === "::1" ||
			hostname.startsWith("169.254.") || // AWS/Cloud metadata service
			hostname.startsWith("10.") ||
			hostname.startsWith("192.168.") ||
			/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
		) {
			return false;
		}

		// Kiểm tra domain theo danh sách trắng
		return ALLOWED_HOSTNAME_PATTERNS.some(pattern => pattern.test(hostname));
	} catch (e) {
		return false;
	}
}

/**
 * Xử lý proxy hình ảnh có chống SSRF
 * @param {string} imageUrl - URL gốc của ảnh
 * @param {object} options - { width, height, quality }
 * @returns {Promise<{data: Buffer, contentType: string}>}
 */
export async function getProxyImage(imageUrl, { width, height, quality = 80 } = {}) {
	if (!imageUrl || typeof imageUrl !== "string") {
		const err = new Error("URL hình ảnh không hợp lệ.");
		err.statusCode = 400;
		throw err;
	}

	if (!isSafeImageUrl(imageUrl)) {
		const err = new Error("Nguồn ảnh không nằm trong danh sách được phép hoặc không an toàn.");
		err.statusCode = 400;
		throw err;
	}

	try {
		// Tải ảnh từ nguồn gốc với timeout và giới hạn kích thước
		const response = await axios({
			url: imageUrl,
			method: "GET",
			responseType: "arraybuffer",
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
			},
			timeout: 10000,
			maxContentLength: 15 * 1024 * 1024, // Tối đa 15MB
		});

		let transformer = sharp(response.data);

		// Thao tác với Sharp (Resize nếu có yêu cầu)
		if (width || height) {
			transformer = transformer.resize(
				width ? parseInt(width) : null,
				height ? parseInt(height) : null,
				{ fit: "inside", withoutEnlargement: true }
			);
		}

		// Chuyển sang WebP để tối ưu dung lượng và trả về buffer trực tiếp
		const optimizedBuffer = await transformer
			.webp({ quality })
			.toBuffer();

		return {
			data: optimizedBuffer,
			contentType: "image/webp",
		};
	} catch (error) {
		console.error(`Lỗi proxy cho ${imageUrl}:`, error.message);
		throw error;
	}
}
