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
  - Phải hỗ trợ đa ngôn ngữ 100% để đội ngũ quốc tế cũng có thể dùng chung.
  - Các trang danh sách dữ liệu phải có tính đồng nhất phân trang (Pagination), như áp dụng luật **24-item limit**.

### 2. Module: Localization (i18n)
- **Nguyên tắc**: Đảm bảo tất cả từ vựng trong tiếng Anh và tiếng Việt được nạp linh hoạt.
- **Thành phần tham gia**: `fe/src/locales/vi.json`, `fe/src/locales/en.json`, và các trình phân tích kiểm tra dịch thuật (VD: `analyze_locales.cjs`).
