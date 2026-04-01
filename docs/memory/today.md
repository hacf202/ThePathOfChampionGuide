# 📝 Nhật ký và Công việc (Today)

*File này là nơi lưu trữ trạng thái dở dang thuộc phiên làm việc hiện tại, các vấn đề và lỗi sinh ra khi code hoặc thảo luận để AI ghi nhớ tránh lạc lõng, hỏi lại nhiều lần.*

## Log thay đổi 2026-04-01

### ✅ Nâng cấp Card Explorer (Tính năng & Dữ liệu)
- **Chuẩn hóa dữ liệu & Markup**:
    - Chuyển đổi toàn bộ thẻ bài cũ `[c:Name]` sang định dạng chi tiết `[cd:Code|Name|icon,img-full]`.
    - Đồng bộ 2.246 lá bài lên DynamoDB (`guidePocCardList`) với markup đã được chuẩn hóa.
- **Tìm kiếm đa ngôn ngữ**: Hỗ trợ tìm kiếm theo tên/mô tả cả tiếng Việt và tiếng Anh, hỗ trợ tìm kiếm không dấu.
- **Bộ lọc nâng cao**: Triển khai bộ lọc Khu vực, Loại bài, Độ hiếm và Tiêu bao (Cost) trên cả Frontend và Backend.
- **Tối ưu UI/UX**:
    - Danh sách bài hiển thị dạng Gallery hình ảnh thuần túy, tự động tải dữ liệu khi lọc.
    - Bổ sung bộ phận sắp xếp (A-Z, Z-A, Tiêu hao).
    - Trang chi tiết hiển thị đầy đủ thông tin đa ngôn ngữ với `MarkupRenderer`.
- **Admin Editor (Pro Edition)**:
    - Tích hợp **`MarkupEditor`** chuyên dụng với Tooltip nổi và tìm kiếm thực thể (Champions, Items, etc.).
    - Trực quan hóa tiến trình biên tập với cửa sổ xem trước (Live Preview).
    - Hỗ trợ biên tập song ngữ (VI/EN) thuận tiện.
    - Sửa lỗi căn lề và định vị Tooltip cho thành phần Markup.

### ✅ Khắc phục sự cố & Tối ưu hóa Deployment (Vercel)
- **Sửa lỗi Read-only Filesystem (500 Error)**:
    - Di chuyển thư mục bộ nhớ đệm hình ảnh (`proxy-images`) sang `/tmp` để tương thích với môi trường Serverless của Vercel.
- **Sửa lỗi Khởi tạo (ESM Hoisting)**:
    - Tách biệt việc nạp biến môi trường vào `be/src/config/env.js` và nạp nó đầu tiên trong `server.js` để tránh lỗi `undefined` khi khởi động.
- **Cải thiện Debugging**:
    - Cập nhật `errorMiddleware.js` để gửi Header CORS ngay cả khi Server bị sập, giúp hiển thị lỗi thực tế thay vì lỗi CORS giả.

### ✅ Tối ưu hóa SEO toàn trang
- **Base Metadata**: Bổ sung đầy đủ thẻ Meta (Description, Keywords), Open Graph và Twitter Cards vào `index.html`.
- **Cấu trúc Dữ liệu (Schema.org)**:
    - Triển khai **BreadcrumbList JSON-LD** trong `PageTitle.jsx` giúp Google hiểu cấu trúc phân cấp trang.
    - Hỗ trợ thuộc tính `lang` động trong thẻ `<html>` cho khả năng tiếp cận (Accessibility).
- **Chỉ dẫn Crawler**:
    - Tạo tệp `robots.txt` chuyên dụng để bảo mật khu vực Admin.
    - Tạo tệp `sitemap.xml` tĩnh liệt kê các trang quan trọng nhất của hệ thống.

## Log thay đổi 2026-03-28

### ✅ Thiết lập Framework AI Agent (Luật & Bộ nhớ)
- Tạo `CLAUDE.md` tại root: quy tắc ưu tiên độ chính xác, tự kết luận + ghi log, hỏi khi không chắc, ghi tri thức mới.
- Tạo `docs/memory/` với SSOT: `today.md`, `projects.md`, `goals.md`, `active-tasks.json`.

### ✅ Tái cấu trúc dự án
- **Verification**: Script `analyze_locales.cjs` chạy OK — EN=836 keys, VI=836 keys, đồng bộ hoàn hảo.

## Tiến độ gần nhất
- Đã hoàn tất việc tích hợp và chuẩn hóa hệ thống Lá bài (Cards) tương đương với hệ thống Tướng và Trang bị.
- Hệ thống cơ sở dữ liệu đã được nạp đầy đủ và đồng nhất 100%.

## Vấn đề đang chú ý (Blocking/Bugs)
*Không có bug hay blocking nghiêm trọng nào.*

## Mục tiêu phiên làm việc tiếp theo
- Kiểm tra lại tính tương thích của các thẻ markup mới trên các trình duyệt khác nhau.
- Xem xét việc tối ưu hóa hiệu suất tải ảnh (lazy loading) cho danh sách lá bài dài.
