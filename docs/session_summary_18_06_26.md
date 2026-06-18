# Session Summary (18/06/2026)

## Tính năng mới: Card Guess Mini-game (LoRdle)

1. **Giao diện & Logic Trò chơi (Frontend)**
   - Thêm thư mục tính năng mới: `fe/src/features/tools/cardGuess`.
   - Tính năng bao gồm hiển thị crop một phần hình ảnh lá bài với 3 chế độ (Daily, Unlimited, Hard) để người dùng thử tài suy đoán.
   - Thêm logic ẩn `Footer` đối với trang Card Guess trong `App.jsx` để tối ưu trải nghiệm tập trung.
   - Bổ sung menu điều hướng vào `DesktopNavbarView` và `MobileNavbarView`.
   - Cập nhật và tối ưu `SafeImage.jsx`.

2. **API & Logic Backend**
   - Thêm file `be/src/routes/cardGuessGameLogic.js` để xử lý việc chọn ngẫu nhiên bài, thống kê và lưu lịch sử chơi.
   - Cập nhật `be/server.js` và `be/src/routes/cards.js` để tích hợp route mới.
   - Đã xử lý triệt để lỗi "nhầm lẫn token" (lọc bỏ các lá bài có định dạng kết thúc bằng `T\d+` ví dụ T1, T2, T3) bằng Regex ở cả BE và FE để kết quả tìm kiếm và chọn bài luôn chuẩn xác, loại trừ bài cấp độ phụ.

3. **Đồng bộ Đa ngôn ngữ (i18n)**
   - Tích hợp 100% tiếng Anh / tiếng Việt cho toàn bộ trang Card Guess.
   - Bổ sung cấu trúc object `"cardGuess": { ... }` vào tệp `fe/src/locales/vi.json` và `en.json`.
   - Refactor `EventLeaderboard.jsx` và các UI component để thay thế chữ hardcode bằng biến `tUI("cardGuess...")`. Xử lý và hợp nhất thành công lỗi trùng lặp JSON key gây mất dịch thuật.

## Các tệp chính bị ảnh hưởng
- **BE**: `server.js`, `cards.js`, `cardGuessGameLogic.js`
- **FE (UI)**: `App.jsx`, `SafeImage.jsx`, `EventLeaderboard.jsx`, `DesktopNavbarView.jsx`, `MobileNavbarView.jsx`
- **FE (i18n)**: `en.json`, `vi.json`

Đã hoàn thiện kiểm thử End-to-End trên trình duyệt, chức năng tìm kiếm, filter và leaderboards hoạt động ổn định và chính xác trên cả ngôn ngữ tiếng Việt và Tiếng Anh.
