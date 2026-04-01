# 📝 Nhật ký và Công việc (Today)

*File này là nơi lưu trữ trạng thái dở dang thuộc phiên làm việc hiện tại, các vấn đề và lỗi sinh ra khi code hoặc thảo luận để AI ghi nhớ tránh lạc lõng, hỏi lại nhiều lần.*

## Log thay đổi 2026-04-01

### ✅ Nâng cấp Card Explorer (Tính năng & Dữ liệu)
- **Chuẩn hóa dữ liệu & Markup**:
    - Chuyển đổi toàn bộ thẻ bài cũ `[c:Name]` sang định dạng chi tiết `[cd:Code|Name|icon,img-full]`.
    - Đồng bộ 2.246 lá bài lên DynamoDB (`guidePocCardList`) với markup đã được chuẩn hóa.
- **Tìm kiếm đa ngôn ngữ**: Hỗ trợ tìm kiếm theo tên/mô tả cả tiếng Việt và tiếng Anh, hỗ trợ tìm kiếm không dấu.
- **Bộ lọc nâng cao**: Triển khai bộ lọc Khu vực, Loại bài, Độ hiếm và Tiêu hao (Cost) trên cả Frontend và Backend.
- **Tối ưu UI/UX**:
    - Danh sách bài hiển thị dạng Gallery hình ảnh thuần túy, tự động tải dữ liệu khi lọc.
    - Bổ sung bộ phận sắp xếp (A-Z, Z-A, Tiêu hao).
    - Trang chi tiết hiển thị đầy đủ thông tin đa ngôn ngữ với `MarkupRenderer`.
- **Admin Editor (Pro Edition)**:
    - Tích hợp **`MarkupEditor`** chuyên dụng với Tooltip nổi và tìm kiếm thực thể (Champions, Items, etc.).
    - Trực quan hóa tiến trình biên tập với cửa sổ xem trước (Live Preview).
    - Hỗ trợ biên tập song ngữ (VI/EN) thuận tiện.

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
