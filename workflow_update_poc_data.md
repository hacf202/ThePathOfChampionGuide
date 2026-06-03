# Quy trình cập nhật dữ liệu Path of Champions (Items, Powers, Relics)

Tài liệu này tóm tắt các bước tự động hóa (hoặc bán tự động) để đối chiếu, trích xuất và định dạng dữ liệu mới từ các file data gốc của Legends of Runeterra trước khi đưa vào Database của dự án.

## 1. Tìm và trích xuất dữ liệu bị thiếu
- **Mục tiêu:** Đối chiếu file data tải về (VD: `powers-vi_vn.json`) với file JSON được export từ MongoDB (`guidePocPowers.json`).
- **Cách làm:**
  Sử dụng mã định danh (`itemCode`, `powerCode`, `relicCode`) làm khóa chính.
  Lọc ra các phần tử có trong file tải về nhưng **chưa tồn tại** trong file Database.

## 2. Ghép nối bản dịch Tiếng Anh (EN)
- **Mục tiêu:** Đảm bảo dữ liệu song ngữ.
- **Cách làm:**
  Từ danh sách bị thiếu ở trên, tìm mã định danh tương ứng trong file `*-en_us.json`.
  Tạo cấu trúc `translations.en` chứa các trường `name`, `description`, `descriptionRaw`, `rarity` của bản Tiếng Anh.

## 3. Dọn dẹp trường `descriptionRaw`
- **Mục tiêu:** Đảm bảo trường `descriptionRaw` chỉ chứa văn bản thô (plain text), không dính các thẻ HTML hoặc shortcode.
- **Cách làm:**
  Sử dụng Regex để loại bỏ các thẻ HTML dư thừa (VD: `<link=...>`, `<style=...>`).
  Nếu văn bản bị dính shortcode, có thể dùng Regex để bóc tách:
  ```javascript
  const regex = /\[(?:k|cd):[^|\]]+\|([^|\]]+)(?:\|[^\]]+)?\]/g;
  str = str.replace(regex, '$1'); // Lấy chữ hiển thị, bỏ thẻ
  ```

## 4. Áp dụng Custom Markup cho trường `description`
- **Mục tiêu:** Chuyển đổi text thô thành định dạng thẻ chuẩn của dự án (`[k:Keyword|Tên|icon]` hoặc `[cd:CardCode|Tên lá bài]`).
- **Cách làm:**
  - **Tự động:** Dạy script chạy qua hàm `applyMarkup()` trong file `markupUtility.js`. File này sẽ tự động dò các từ khóa từ `globals-vi_vn.json` và bọc thẻ `[k:...|...]`.
  - **Thủ công:** Đối với các token cụ thể không có trong `globals` (Ví dụ: `Xúc Tu` / `Tentacle`), ta phải thay thế bằng code thủ công:
    ```javascript
    str = str.replace(/(?<!\|)Xúc Tu(?!\s*\])/g, '[cd:06BW006T3|Xúc Tu]');
    ```

## 5. Chuẩn hóa cấu trúc và dữ liệu các trường khác
- **Mục tiêu:** Đảm bảo tính nhất quán với cấu trúc Database cũ.
- **Cách làm:**
  - **Rarity (Độ hiếm):** Chuyển đổi Viết Hoa, Title Case hoặc UPPER CASE (VD: `SỬ THI`, `Huyền Thoại`) tùy theo collection.
  - **Image / Asset:** Cấu hình lại các đường dẫn ảnh (`assetAbsolutePath`, `assetFullAbsolutePath`), hoặc sinh thêm link ảnh tĩnh (`https://images.pocguide.top/...`).
  - **Type / Stack:** Bổ sung các trường tĩnh như `"type": "Trấn"`, `"stack": "1"` đối với Relics.
  - Sắp xếp lại thứ tự các key trong Object JSON cho giống hệt mẫu đã có.

## 6. Gộp (Merge) và Sắp xếp
- **Mục tiêu:** Nối dữ liệu mới vào file JSON backup.
- **Cách làm:**
  Gộp array chứa dữ liệu mới vào array gốc.
  Sau đó dùng hàm `Array.prototype.sort()` để sắp xếp lại toàn bộ theo chuỗi ký tự (`localeCompare`) của `powerCode` / `relicCode`.

## 7. Đưa lên Cơ Sở Dữ Liệu (MongoDB)
- **Mục tiêu:** Update dữ liệu cuối cùng vào Database thực.
- **Cách làm:**
  - **Script:** Chạy lệnh `db.collection('...').updateOne({ code: ... }, { $set: data }, { upsert: true })` cho từng item mới.
  - Hoặc đơn giản là copy đoạn JSON chuẩn vừa tạo rồi import trực tiếp qua MongoDB Compass.
