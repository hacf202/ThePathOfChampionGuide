// be/src/utils/proxyImage.js
import axios from "axios";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const CACHE_DIR = path.join(process.cwd(), "cache", "proxy-images");

// Đảm bảo thư mục cache tồn tại
if (!fs.existsSync(CACHE_DIR)) {
	fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Xử lý proxy hình ảnh với Disk Caching và Sharp
 * @param {string} imageUrl - URL gốc của ảnh
 * @param {object} options - { width, height, quality }
 * @returns {Promise<{data: Buffer, contentType: string}>}
 */
export async function getProxyImage(imageUrl, { width, height, quality = 80 } = {}) {
	// Tạo hash MD5 từ URL và các tùy chọn để làm tên file cache độc nhất
	const hash = crypto.createHash("md5").update(`${imageUrl}_w${width || "orig"}_h${height || "orig"}_q${quality}`).digest("hex");
	const cachePath = path.join(CACHE_DIR, `${hash}.webp`);

	// 1. Kiểm tra nếu đã có trong Disk Cache
	if (fs.existsSync(cachePath)) {
		const cachedData = fs.readFileSync(cachePath);
		return {
			data: cachedData,
			contentType: "image/webp",
		};
	}

	// 2. Nếu chưa có, tải từ nguồn gốc
	try {
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

		// Thao tác với Sharp
		if (width || height) {
			transformer = transformer.resize(
				width ? parseInt(width) : null,
				height ? parseInt(height) : null,
				{ fit: "inside", withoutEnlargement: true }
			);
		}

		// Chuyển sang WebP để tối ưu dung lượng
		const optimizedBuffer = await transformer
			.webp({ quality })
			.toBuffer();

		// 3. Lưu vào Disk Cache
		fs.writeFileSync(cachePath, optimizedBuffer);

		return {
			data: optimizedBuffer,
			contentType: "image/webp",
		};
	} catch (error) {
		console.error(`Lỗi proxy cho ${imageUrl}:`, error.message);
		throw error;
	}
}
