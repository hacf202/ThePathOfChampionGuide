import axios from "axios";
import sharp from "sharp";

/**
 * Xử lý proxy hình ảnh (Đã loại bỏ Disk Caching theo yêu cầu)
 * @param {string} imageUrl - URL gốc của ảnh
 * @param {object} options - { width, height, quality }
 * @returns {Promise<{data: Buffer, contentType: string}>}
 */
export async function getProxyImage(imageUrl, { width, height, quality = 80 } = {}) {
	try {
		// Tải ảnh từ nguồn gốc
		const response = await axios({
			url: imageUrl,
			method: "GET",
			responseType: "arraybuffer",
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
			},
			timeout: 10000,
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
