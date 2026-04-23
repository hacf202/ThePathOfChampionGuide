# 📂 Tổng quan Dự án & Module (Projects)

*Mô tả các thực thể (entities), các component và kiến trúc xoay quanh dự án.*

## Cấu trúc thư mục chuẩn (sau tái cấu trúc 2026-03-28)

```
ThePathOfChampionGuide/
├── CLAUDE.md                  # Bộ luật vận hành AI (SSOT)
├── README.md
├── .gitignore
├── be/                        # Backend (Node.js / Express)
│   ├── server.js
│   ├── vercel.json
│   ├── .env
│   ├── src/
│   │   ├── config/            # cognito.js, db.js
│   │   ├── middleware/        # authenticate.js, normalizeDisplay.js, requireAdmin.js
│   │   ├── routes/            # 18 route files (champions, runes, relics, ...)
│   │   └── utils/             # buildCache.js, dynamodb.js, userCache.js, vietnameseUtils.js
│   └── uploadData/            # Scripts + JSON data để seeding DynamoDB
├── fe/                        # Frontend (React + Vite + Tailwind)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   ├── package.json
│   ├── vercel.json
│   ├── .env
│   └── src/
│       ├── App.jsx / main.jsx
│       ├── assets/            # Hình ảnh tĩnh
│       ├── components/
│       │   ├── admin/         # Admin Panel: editors và panel cho từng entity
│       │   ├── common/        # Shared UI components (buttons, cards, modals...)
│       │   ├── layout/        # Navbar, footer, genericListLayout
│       │   ├── map/           # Adventure map components
│       │   ├── build/champion/guide/item/power/relic/rune/wheel/tierMaker/about/auth/comment/
│       ├── context/           # AuthContext, LanguageContext, services/
│       ├── hooks/             # 21 custom hooks
│       ├── locales/           # en.json, vi.json (836 keys mỗi file, đồng bộ hoàn hảo)
│       ├── pages/             # 11 page components
│       ├── styles/            # theme.css
│       └── utils/             # bossBatcher, powerBatcher, jwt, safImage, vietnamUtils
├── scripts/                   # Dev/maintenance scripts (KHÔNG phải production code)
│   └── analyze_locales.cjs    # Kiểm tra đồng bộ en.json <-> vi.json
└── docs/
    └── memory/                # Bộ nhớ AI (SSOT)
        ├── today.md
        ├── projects.md
        ├── goals.md
        └── active-tasks.json
```

Ứng dụng và cổng thông tin xoay quanh các cơ chế game (bản đồ, tướng, trang bị,...). 

### 1. Module: Quản trị viên (Admin Panel)
- **Mục tiêu**: Nơi thao tác chỉnh sửa dữ liệu của Tướng (Champions), Lõi (Runes), Cổ vật (Relics), Phần thưởng và Quái (Rewards/Boss).
- **Trạng thái cốt lõi**:
  - Giao diện phải cực kỳ trực quan, tránh lỗi vặt khi người quản trị nhập dữ liệu.
  - **Hiệu năng**: Áp dụng giới hạn render 100-item và smart loading cho SidePanel để xử lý danh sách bài quân cực lớn.
  - **Tự động hóa**: Trình biên tập hỗ trợ quét Markup tự động để đồng bộ dữ liệu tham chiếu.
  - **Sticky Sidebar**: Tích hợp `DropDragSidePanel` dính (sticky) giúp tối ưu hóa thao tác kéo thả trên các form dài.
  - Phải hỗ trợ đa ngôn ngữ 100% để đội ngũ quốc tế cũng có thể dùng chung.
  - Các trang danh sách dữ liệu phải có tính đồng nhất phân trang (Pagination), như áp dụng luật **24-item limit**.
- **Trung tâm dữ liệu (Centralized Data Source)**: Sử dụng Backend API làm nguồn dữ liệu duy nhất (Single Source of Truth), loại bỏ các file JSON tĩnh dư thừa ở Frontend.

### 2. Module: Resources & Treasures (Tài nguyên & Rương)
- **Mục tiêu**: Cung cấp thư viện tra cứu toàn bộ các loại rương, rương đá quý và vật phẩm tiêu hao trong PoC.
- **Tính năng cốt lõi**:
  - **Dữ liệu chuyên sâu**: Hiển thị tỷ lệ rơi (Drop rates), nội dung rương theo từng bậc (Tier-based content) và nguồn gốc (Sources).
  - **Tích hợp Markup**: Liên kết chéo tự động với các thực thể khác thông qua hệ thống thẻ `[res:id|label]`.
  - **UX Chuyên dụng**: Sử dụng icon `Book` trong điều hướng, hỗ trợ bộ lọc nhanh và hiển thị bảng dữ liệu tối ưu cho di động (cuộn ngang, compact fonts).
  - **Vị trí chiến lược**: Xuất hiện đồng bộ trên trang chủ (Hero, Database Grid) và trang cá nhân hóa để tăng tính khám phá.

### 3. Module: Card Explorer (Lá bài)
- **Mục tiêu**: Cung cấp thư viện toàn bộ lá bài trong Legends of Runeterra với khả năng tìm kiếm và lọc mạnh mẽ.
- **Tính năng cốt lõi**:
  - **Dữ liệu chuẩn hóa**: Tự động chuyển đổi markup của game sang icon riêng của web thông qua `MarkupRenderer`.
  - **Tìm kiếm Song ngữ**: Tìm kiếm thông minh trên cả tiếng Việt và tiếng Anh đồng thời (Name, Description, Raw).
  - **Bộ lọc Đa năng**: Lọc theo Khu vực, Độ hiếm, Loại bài và Tiêu hao.
  - **Admin**: Trình quản lý bài (`CardEditor`) hỗ trợ biên tập nội dung markup và bản dịch chi tiết cho cả hai ngôn ngữ.
### 4. Module: Champion Ratings (Đánh giá Tướng)
- **Mục tiêu**: Nơi cộng đồng chấm điểm và nhận xét về lối chơi, sức mạnh của các vị tướng dựa trên 6 tiêu chí cốt lõi.
- **Tính năng cốt lõi**:
  - **Hệ thống Rating**: Tính toán điểm trung bình từ Damage, Defense, Speed, Consistency, Synergy, và Independence.
  - **Visualization**: Sử dụng thanh trạng thái màu sắc và biểu đồ 10 điểm để trực quan hóa sức mạnh tướng.
  - **Ranking**: Tự động tính toán bảng xếp hạng dựa trên điểm số trung bình và số lượng lượt đánh giá.
  - **Dynamic Scaling**: Hỗ trợ các hệ điểm đặc thù (ví dụ hệ 4 điểm cho C041).

### 5. Module: Audit Logs (Nhật ký Hệ thống)
- **Mục tiêu**: Ghi lại mọi thao tác quan trọng trên hệ thống Admin để phục vụ việc kiểm tra và khôi phục khi cần thiết.
- **Tính năng cốt lõi**:
  - **Tracking**: Ghi lại User ID, Loại thực thể (Champion, Item,...), Hành động (Create, Update, Delete) và thời điểm.
  - **Admin View**: Danh sách lọc nhanh trên bảng quản trị để xem lịch sử thay đổi theo thời gian thực.
+
+### 6. Module: Theme System (Hệ thống Giao diện)
+- **Mục tiêu**: Cung cấp trải nghiệm thị giác đa dạng và chuyên nghiệp cho người dùng.
+- **Tính năng cốt lõi**:
+  - **3 Chế độ (Triple-Mode)**: Solid Light (Sáng), Solid Dark (Tối), và Artwork Mode (Ảnh nền tùy chỉnh với hiệu ứng kính mờ).
+  - **Đồng bộ Semantic**: Toàn bộ hệ thống UI (Header, Footer, Modals, Inputs) sử dụng biến màu semantic để tự động thay đổi theo theme.
+  - **Cá nhân hóa**: Cho phép người dùng lưu trữ cấu hình giao diện yêu thích qua `localStorage`.
+
+### 7. Module: Build System & Personalized Caching
+- **Mục tiêu**: Nơi người dùng chia sẻ các bộ trang bị tối ưu cho tướng, hỗ trợ trải nghiệm thời gian thực với hiệu suất cao.
+- **Tính năng cốt lõi**:
+  - **Identity Sync**: Tự động liên kết và hiển thị tên thật (Cognito Name) của người tạo build trên toàn hệ thống thay vì username kỹ thuật.
+  - **Per-user Caching**: Áp dụng cơ chế cache 1 giờ cho danh sách build công khai nhưng hỗ trợ xóa cache cục bộ cho chính người tạo khi có thay đổi. Điều này giúp người dùng thấy kết quả ngay lập tức mà không làm ảnh hưởng đến tính ổn định của hệ thống cache chung.
+  - **Markup Enrichment**: Tự động giải mã các mô tả build chứa thẻ game (`[k:...]`, `[r:...]`) sang giao diện trực quan kèm tooltip.
+  - **Favorite Sync**: Hệ thống đồng bộ trạng thái yêu thích thời gian thực trên mọi danh sách hiển thị.
