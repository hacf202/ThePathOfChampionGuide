import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ==========================================
// 0. TÁI TẠO __dirname TRONG MÔI TRƯỜNG ES MODULE
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. HÀM LOẠI BỎ CÁC THẺ MARKUP
// ==========================================
const stripMarkupTags = text => {
	if (!text || typeof text !== "string") {
		return text; // Trả về nguyên bản nếu không phải chuỗi hợp lệ
	}
	// Dùng Regex tìm và xóa mọi thứ nằm giữa < và >
	return text.replace(/<[^>]*>/g, "");
};

// ==========================================
// 2. HÀM XỬ LÝ TOÀN BỘ MẢNG DỮ LIỆU JSON
// ==========================================
const cleanJsonData = dataArray => {
	// Duyệt qua từng đối tượng trong mảng
	return dataArray.map(item => {
		// Tạo một bản sao của đối tượng hiện tại để tránh thay đổi trực tiếp dữ liệu gốc
		let cleanedItem = { ...item };

		// Xử lý trường description ở cấp độ ngoài cùng (tiếng Việt)
		if (cleanedItem.description) {
			cleanedItem.description = stripMarkupTags(cleanedItem.description);
		}

		// Kiểm tra và xử lý trường description bên trong object translations (nếu có)
		if (cleanedItem.translations) {
			// Duyệt qua tất cả các ngôn ngữ trong translations (ví dụ: 'en', 'fr',...)
			for (const lang in cleanedItem.translations) {
				if (
					cleanedItem.translations[lang] &&
					cleanedItem.translations[lang].description
				) {
					cleanedItem.translations[lang].description = stripMarkupTags(
						cleanedItem.translations[lang].description,
					);
				}
			}
		}

		// Trả về đối tượng sau khi đã được làm sạch
		return cleanedItem;
	});
};

// ==========================================
// 3. KHỐI LỆNH THỰC THI CHÍNH
// ==========================================
const main = () => {
	// ⚠️ LƯU Ý: Thay đổi tên file ở đây cho khớp với tên file JSON bạn muốn làm sạch
	// Ví dụ: Đọc từ file bạn vừa tải về và xuất ra file chuẩn bị upload
	const inputFilePath = path.join(__dirname, "downloaded_powers.json");
	const outputFilePath = path.join(__dirname, "converted_powers.json");

	try {
		console.log("Đang đọc file dữ liệu...");

		// Đọc dữ liệu từ file
		if (!fs.existsSync(inputFilePath)) {
			throw new Error(`Không tìm thấy file đầu vào tại: ${inputFilePath}`);
		}
		const rawData = fs.readFileSync(inputFilePath, "utf8");

		// Chuyển chuỗi JSON thành mảng JavaScript
		const parsedData = JSON.parse(rawData);

		console.log(
			`Đã tải thành công ${parsedData.length} đối tượng. Đang tiến hành làm sạch...`,
		);

		// Chạy hàm làm sạch dữ liệu
		const cleanedData = cleanJsonData(parsedData);

		// Chuyển đổi dữ liệu đã làm sạch ngược lại thành chuỗi JSON (định dạng đẹp với khoảng trắng là 4)
		const outputJson = JSON.stringify(cleanedData, null, 4);

		// Ghi dữ liệu ra file mới
		fs.writeFileSync(outputFilePath, outputJson, "utf8");

		console.log(
			`✨ Thành công! Đã lưu dữ liệu làm sạch vào file: ${outputFilePath}`,
		);
	} catch (error) {
		console.error("❌ Đã xảy ra lỗi trong quá trình xử lý:", error.message);
	}
};

// Chạy chương trình
main();
