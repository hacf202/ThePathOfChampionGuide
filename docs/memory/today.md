# 📝 Nhật ký và Công việc (Today)

*File này là nơi lưu trữ trạng thái dở dang thuộc phiên làm việc hiện tại, các vấn đề và lỗi sinh ra khi code hoặc thảo luận để AI ghi nhớ tránh lạc lõng, hỏi lại nhiều lần.*

## Log thay đổi 2026-03-28

### ✅ Thiết lập Framework AI Agent (Luật & Bộ nhớ)
- Tạo `CLAUDE.md` tại root: quy tắc ưu tiên độ chính xác, tự kết luận + ghi log, hỏi khi không chắc, ghi tri thức mới.
- Tạo `docs/memory/` với SSOT: `today.md`, `projects.md`, `goals.md`, `active-tasks.json`.

### ✅ Tái cấu trúc dự án
- **XÓA** `fe/temp.txt` — note tạm không có giá trị.
- **XÓA** `fe/vi_in_en_suspicious.json` — output script, tái tạo được.
- **XÓA** `fe/upgrade_editors.cjs` — script one-shot đã hoàn thành mục đích.
- **XÓA** `fe/test_lang.cjs` — script one-shot đã hoàn thành mục đích.
- **DI CHUYỂN** `fe/analyze_locales.cjs` → `scripts/analyze_locales.cjs` (cập nhật path `../fe/src`).
- **Verify**: Script mới chạy OK — EN=836 keys, VI=836 keys, đồng bộ hoàn hảo.

## Tiến độ gần nhất
- Đã và đang chuẩn hóa hệ thống đa ngôn ngữ (i18n) cho khu vực **Admin Panel**.
- Đang nâng cấp và loại bỏ các đoạn text hardcode tại: `championEditor`, `runeEditor`, `relicEditor`, `powerEditor`, `bonusStarEditor`, `rewardSection`.
- Liên tục bổ sung chuỗi dịch vụ (translations) cho `vi.json` và `en.json`.

## Vấn đề đang chú ý (Blocking/Bugs)
*Không có bug hay blocking nghiêm trọng nào.*

## Mục tiêu phiên làm việc tiếp theo
- Hoàn thiện toàn bộ các chuỗi text trong trang quản trị bản đồ/phần thưởng (reward section).
- Kiểm tra tính ổn định của các chuỗi dịch thuật giữa hai ngôn ngữ chính Việt - Anh.
