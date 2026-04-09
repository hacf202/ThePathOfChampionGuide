# 📝 Nhật ký và Công việc (Today)

*File này là nơi lưu trữ trạng thái dở dang thuộc phiên làm việc hiện tại, các vấn đề và lỗi sinh ra khi code hoặc thảo luận để AI ghi nhớ tránh lạc lõng, hỏi lại nhiều lần.*


## Log thay đổi 2026-04-09 (Triple-Theme & Admin UX)

### ✅ Hệ thống Theme 3 Chế độ (Triple-Theme UI)
- **Kiến trúc ThemeContext**: Triển khai hệ thống quản lý trạng thái theme toàn cục hỗ trợ 3 chế độ: `Solid Light`, `Solid Dark`, và `Artwork Mode` (chế độ ảnh nền tùy chỉnh).
- **Đồng bộ hóa Giao diện**:
    - **Navbars**: Đồng bộ `DesktopNavbar` và `MobileNavbar` theo tông màu theme, xử lý độ trong suốt (glassmorphism) chuyên nghiệp.
    - **Modals & Tooltips**: Chuẩn hóa màu nền, viền và chữ cho `RatingModal`, `SelectChampionModal` và các hệ thống Tooltip.
    - **Inputs & Buttons**: Thống nhất sử dụng các biến semantic (`--color-input-bg`, `--color-btn-secondary-bg`, ...) trên toàn bộ ứng dụng.
- **Tính năng Cá nhân hóa**: Cập nhật menu `Personalization` với giao diện chọn theme dạng thẻ (Cards) trực quan và hiện đại.

### ✅ Nâng cấp Đột phá Giao diện Quản trị (Admin UX)
- **Sticky Resource Panel**: Biến thanh "Kéo thả Tài nguyên" (`DropDragSidePanel`) thành thanh công cụ dính (sticky) ở cả 3 editor: **Champion**, **Boss**, và **Adventure Map**. Đảm bảo thanh luôn hiện diện khi cuộn các form dài nghìn pixel.
- **MarkupEditor Synchronization**: Đồng bộ hóa màu nền và màu chữ của trình soạn thảo Markup theo theme, chuyển từ màu xám/trắng cứng sang màu semantic, đảm bảo tính thẩm mỹ cao trong `Solid Dark` và `Artwork Mode`.
- **Header Toolbar Sticky**: Cố định thanh công cụ (Lưu/Hủy/Ẩn sidebar) ở đầu trang editor để tăng hiệu suất làm việc.

### ✅ Bảo mật và Backend
- **Analytics Dashboard Auth Fix**: Giải quyết triệt để lỗi 401 Unauthorized bằng cách đồng bộ middleware xác thực JWT và kiểm tra quyền admin cho các route thống kê.
- **Entity Data Sync**: Hoàn tất trích xuất và chuẩn hóa dữ liệu mô tả cho Relics, Powers, Items từ các tệp localization vào master data.

### ✅ Cải thiện UI/UX Homepage
- **Cinematic Heading**: Thêm hiệu ứng Đổ bóng (drop-shadow) đa hướng cho tiêu đề chính để tăng độ sâu và tính chuyên nghiệp trên các nền ảnh động.
- **Optimization**: Tối ưu hóa layout `Bento Grid` để không bị tràn khung trên màn hình 2K/4K.


## Log thay đổi 2026-04-07/08 (Rating System & Home Integration)

### ✅ Đại tu Hệ thống Đánh giá Tướng (Champion Ratings)
- **Chuẩn hóa Thuật ngữ**: Chuyển đổi toàn bộ từ "Review" sang "Rating" (Đánh giá) trong toàn bộ mã nguồn, cấu trúc API và tệp đa ngôn ngữ để mang tính chuyên môn cao hơn.
- **Nâng cấp Giao diện Đánh giá**:
    - Thay thế chấm điểm sao bằng **hệ điểm 10** trực quan với các thanh trạng thái màu sắc.
    - Thiết kế lại trang `ChampionRatingPage` với layout trắng tinh tế, tối giản và hiện đại.
    - Bổ sung **Hộp thoại Hướng dẫn**: Giải thích chi tiết 6 tiêu chí đánh giá (Sát thương, Phòng ngự, Tốc độ, Ổn định, Combo, Độc lập) kèm theo ví dụ phân tích thực tế (Radar analysis).
    - **Logic đặc biệt cho C041**: Tự động quy đổi hệ điểm 10 sang hệ điểm 4 cho vị tướng đặc thù này nhằm đảm bảo tính chính xác về mặt gameplay.
- **Lỗi 404 & Routing**: Di chuyển route từ `/tools/reviews` sang `/tools/ratings` và xử lý triệt để lỗi 404 sau khi đổi tên tệp.

### ✅ Tích hợp Trang chủ (Bento & Moodboard)
- **Moodboard Tiles**: Thêm ô gạch "Champion Ratings" vào khu vực Hero (kéo thả) với biểu tượng `Star` và hình ảnh nền động.
- **Quick Tools Expansion**: 
    - Thêm thẻ công cụ Đánh giá vào phần Quick Tools với mô tả và màu sắc riêng biệt.
    - Tối ưu hóa lưới (Grid) công cụ từ 2 cột lên **3 cột** trên màn hình lớn để chứa đủ 5 công cụ mà vẫn đảm bảo thẩm mỹ.
- **Media Asset**: Bổ sung hình ảnh nền `BG10` mới cho hệ thống.

### ✅ Quản trị & Hệ thống (Admin & Backend)
- **Hệ thống Nhật ký (Audit Logs)**: Triển khai tính năng theo dõi lịch sử thao tác của Admin (`AuditLogList`), giúp kiểm soát các thay đổi dữ liệu trên hệ thống.
- **Backend Fixes**: Khắc phục lỗi `ReferenceError: ScanCommand is not defined` trong route ratings, khôi phục tính năng Bảng xếp hạng.
- **Cleanup**: Dọn dẹp thư mục `be/uploadData`, loại bỏ các script cũ không còn sử dụng để làm gọn dự án.

### ✅ Cải thiện UI/UX chung
- **EntityDetailLayout**: Triển khai layout chung cho các trang chi tiết thực thể.
- **useUnsavedChanges**: Hook cảnh báo người dùng khi thoát trang biên tập mà chưa lưu dữ liệu.

## Log thay đổi 2026-04-06 (Home Page Overhaul)

### ✅ Đại tu Giao diện và Hệ thống Thiết kế (Modernization)
- **Light Theme Toàn diện**: Chuyển đổi từ giao diện tối sang Light Theme sang trọng với tông màu `slate-50`, tối ưu hóa độ tương phản và tính thẩm mỹ cao cấp.
- **Bento Grid Database**: Thiết lập cấu trúc lưới 16 ô (4x4) đối xứng hoàn hảo cho phần Cơ sở dữ liệu. Tích hợp hiệu ứng **Aura Glow** và quầng sáng động theo chủ đề màu sắc.
- **Hero Moodboard**: Nâng cấp tiêu đề Cinematic với viền 8 hướng và các ô gạch tương tác có hiệu ứng khôi phục màu sắc/phóng lớn khi hover.
- **Công cụ mới**: Tích hợp **Giả lập mở rương (Vault Simulator)** vào danh sách công cụ nhanh.

### ✅ Tối ưu hóa Hiệu năng và Di động (UX/UI)
- **Fluid Mobile Design**: Tự động scale cỡ chữ và khoảng đệm trên mobile để loại bỏ hoàn toàn lỗi tràn khung và cuộn ngang.
- **Italic Clipping Fix**: Xử lý lỗi cắt chữ cho các tiêu đề in nghiêng trong `GenericListLayout` bằng cách bổ sung padding kỹ thuật.
- **Admin Consistency**: Đồng bộ hóa khoảng cách và phong cách thiết kế cho Dashboard Analytics và các trang quản trị.

### ✅ Backend & Security
- **Analytics Security Fix**: Khắc phục lỗi `401 Unauthorized` trên Dashboard bằng cách bổ sung middleware xác thực JWT đúng quy trình trước khi kiểm tra quyền Admin.
- **API Stability**: Đảm bảo các route quản trị luôn được bảo vệ bởi chuỗi `authenticateCognitoToken` và `requireAdmin`.

### ✅ Nội dung và Đa ngôn ngữ (i18n)
- **Legendary Support**: Cập nhật phím dịch cho bậc độ hiếm "Huyền Thoại" giúp hỗ trợ các nội dung game mới nhất.
- **Sorting Logic**: Bổ sung các tùy chọn sắp xếp theo ID (Tăng/Giảm) vào hệ thống ngôn ngữ chung.

## Log thay đổi 2026-04-05

### ✅ Tối ưu hoá Hiệu suất Admin (Sidebar)
- **Giải quyết vấn đề Render**: Giới hạn hiển thị tối đa 100 kết quả trong SidePanel để tránh quá tải DOM khi xử lý > 2.300 lá bài.
- **Cơ chế Smart Image Loading**: Tự động chuyển đổi giữa hiển thị Icon và Hình ảnh đầy đủ dựa trên số lượng kết quả hoặc thao tác tìm kiếm của người dùng. Giúp danh sách đạt độ mượt 60fps.

### ✅ Tự động hóa Dữ liệu bài tham chiếu (Champion Editor)
- **Logic Auto-Scan**: Tích hợp trình quét mô tả (VN/EN) tự động nhận diện thẻ Markup `[cd:...]` để thêm lá bài vào danh sách bài tham chiếu khi người dùng nạp bài vào bộ bài khởi đầu.
- **Đồng bộ hóa Backend**: Cập nhật API `/api/cards` trả về đầy đủ các trường mô tả cần thiết cho việc quét dữ liệu ở Frontend.
- **Indexing Thông minh**: Hỗ trợ tra cứu theo cả CardCode và CardName, đảm bảo tính nhất quán của dữ liệu tham chiếu.

### ✅ Nâng cấp UX/UI Đồng bộ (Champion Detail)
- **Capsule Tab System**: Triển khai thiết kế Tab hiện đại với hiệu ứng trượt (Framer Motion) và badge số lượng cho các phần:
    - **Bộ bài khởi đầu**: Chuyển đổi giữa Bài chính và Bài tham chiếu.
    - **Chi tiết Sức mạnh**: Chuyển đổi giữa Sức mạnh sao và Chòm sao bổ trợ (trong bảng chi tiết).
- **Tooltip & Preview**: Thêm tooltip xem trước hình ảnh khi hover vào các lá bài trong bộ bài khởi đầu.
- **Bản đồ Chòm sao**: Giữ nguyên hiển thị trực quan cố định để duy trì tính thẩm mỹ của trang.

### ✅ Sửa lỗi & Cải thiện
- Giải quyết triệt để lỗi `ReferenceError` khi khởi tạo dữ liệu trong Champion Editor Form.
- Khắc phục các lỗi cú pháp JSX phát sinh trong quá trình tái cấu trúc giao diện.

## Log thay đổi 2026-04-04

### ✅ Chuyển đổi và Flatten Cấu trúc dữ liệu
- Chuyển đổi toàn bộ Data nguồn (CSV) của Items, Powers, Relics, Runes sang JSON.
- Đệ quy Unmarshal gỡ bỏ các lớp cấu trúc thừa (như "S", "M", "L") do DynamoDB sinh ra để hệ thống FE dễ sử dụng.

### ✅ Chuẩn hoá Card Reference Markup và Render Backend
- Tự động hóa thay thế các tag `[c:Name]` lỗi thời thành `[cd:CardCode|CardName|icon,img-full]` trên cả dữ liệu tiếng Anh và tiếng Việt.
- Khắc phục lỗi `ReferenceError: constCache` trên Backend Route `/api/constellations`.
- Cải thiện RegExp ở hàm `parseMarkup` để chuyển đổi chính xác tự động cả ký tự string `\n` và ký tự xuống dòng gốc thành thẻ `<br/>` giúp văn bản xuống dòng chính xác khi render.

### ✅ Tối ưu hoá Giao diện Quản trị Mobile-first (Admin Panel)
- Cấu trúc lại **AdminListLayout** với kiến trúc Mobile-First, thêm nút Accordion (gập mở) trên Mobile để dễ dàng tiếp cận thanh Bộ Lọc (SidePanel) mà không cần cuộn dọc.
- Tái cấu trúc các trang **BossEditor**, **BonusStarEditor**, và **AdventureMapEditor**, cắt bỏ lưới cứng tĩnh và ép chạy chung trên khối lượng lưới (Grid) chuẩn của `AdminListLayout`.
- Đảm bảo hiển thị hoàn hảo ở chế độ Portrait trên màn hình cảm ứng di động. Đã triển khai và đẩy mã nguồn lên GitHub.

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
- Đã hoàn tất đại tu Giao diện Trang chủ và Hệ thống DB Bento Grid đạt tiêu chuẩn thẩm mỹ cao cấp.
- Đã sửa các lỗi bảo mật cơ bản và lỗi hiển thị (clipping, overflow) trên mọi thiết bị.
- Hệ thống i18n và Data (Rarities, Items) đã được cập nhật đồng nhất.

## Vấn đề đang chú ý (Blocking/Bugs)
*Không có bug hay blocking nghiêm trọng nào.*

## Mục tiêu phiên làm việc tiếp theo
- Đồng bộ hóa thiết kế Light Theme cho toàn bộ các trang chi tiết tướng (Champion Detail).
- Tích hợp hệ thống Filter nâng cao cho trang Thư viện Lá bài (Card Library).
- Kiểm tra lại toàn bộ các trang quản trị Admin để đảm bảo không còn lỗi 401 do thiếu middleware.
- Tối ưu hóa biểu diễn dữ liệu Radar Chart trong Champion Detail theo phong cách mới.
