# The Path of Champion Guide 🌟

[![repo size](https://img.shields.io/github/repo-size/hacf202/ThePathOfChampionGuide?style=flat-square)](https://github.com/hacf202/ThePathOfChampionGuide)
[![issues](https://img.shields.io/github/issues/hacf202/ThePathOfChampionGuide?style=flat-square)](https://github.com/hacf202/ThePathOfChampionGuide/issues)
[![license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![contributors](https://img.shields.io/github/contributors/hacf202/ThePathOfChampionGuide?style=flat-square)](https://github.com/hacf202/ThePathOfChampionGuide/graphs/contributors)

**The Path of Champion Guide (POC GUIDE)** là một ứng dụng Web Full-stack toàn diện, hoạt động như một hệ thống bách khoa toàn thư, từ điển và nền tảng chia sẻ lối chơi dành riêng cho chế độ **"The Path of Champions"** (Con Đường Anh Hùng) của tựa game **Legends of Runeterra**.

Dự án cung cấp cho cộng đồng người chơi một nơi để tra cứu thông tin chi tiết về Tướng, Vật phẩm, Sức mạnh, cũng như tạo và thảo luận về các chiến thuật tối ưu. Toàn bộ giao diện hỗ trợ **song ngữ Việt - Anh (i18n)**.

---

## 🚀 Tính năng nổi bật

### 👤 Dành cho Người dùng (Client)

- **📚 Bách khoa toàn thư đa dữ liệu:** Tra cứu chi tiết toàn bộ dữ liệu game: Champions, Items, Powers, Relics, Runes, Cards, Constellations, Adventure Maps, Bosses, Resources.
- **🛠️ Hệ thống Build Cộng đồng:** Tạo, chia sẻ và yêu thích các lối chơi/combo tối ưu cho từng vị tướng.
- **📖 Hướng dẫn chuyên sâu (Guides):** Bài viết chiến thuật, cách đi map từ cộng đồng.
- **💬 Hệ thống bình luận:** Bình luận trực tiếp trên từng build và bài hướng dẫn.
- **🏆 Champion Ratings:** Hệ thống đánh giá tướng chuyên sâu với 6 tiêu chí, thang 10 điểm và biểu đồ radar.
- **🎲 Bộ công cụ tiện ích:**
  - **Vault Simulator** — Giả lập mở rương với tỉ lệ drop chính xác theo dữ liệu cộng đồng.
  - **Random Wheel** — Vòng quay chọn ngẫu nhiên Tướng, Vật phẩm, Bản đồ...
  - **Tier List** — Bảng xếp hạng tướng và cổ vật theo meta hiện tại.
  - **Best Sub-Champion** — Tìm tướng phụ phù hợp nhất với chiến lược của bạn.
- **🗺️ Adventure Maps:** Bản đồ phiêu lưu tương tác, trực quan hoá route và phần thưởng.
- **🌐 Song ngữ Việt - Anh:** Chuyển đổi ngôn ngữ linh hoạt toàn giao diện.
- **🎨 Cá nhân hóa Giao diện:** Hệ thống Theme 3 chế độ (**Solid Light**, **Solid Dark**, **Artwork Mode**).
- **🔐 Xác thực an toàn:** Đăng ký, đăng nhập qua Email và Username bằng **Supabase Auth**.

### 🛡️ Dành cho Quản trị viên (Admin CMS)

- **📊 Dashboard Thống kê:** Theo dõi người dùng, build, lượt xem và tương tác theo thời gian thực.
- **📝 Quản lý Nội dung (Full CRUD):** Giao diện trực quan thêm/sửa/xóa toàn bộ thực thể (Champions, Powers, Relics, Items, Runes, Builds, Guides, Bosses, Constellations, Adventure Maps, Cards...).
- **⚙️ Tự động hóa Dữ liệu (Auto-Scan):** Tự động điền thẻ bài tham chiếu từ mô tả, giảm 80% thao tác nhập tay.
- **📌 Kéo-thả tài nguyên (Drag & Drop):** Thanh SidePanel sticky hỗ trợ kéo thả Item, Relic vào bộ bài.
- **⚡ Hiệu năng Admin:** Lazy-loading và lọc thông minh xử lý mượt mà danh sách > 2.300 lá bài.
- **📋 Audit Logs:** Nhật ký toàn bộ thao tác của admin, hỗ trợ rollback khi cần.
- **🛡️ Phân quyền:** Route nhạy cảm chỉ tài khoản Admin mới truy cập được.

---

## 💻 Công nghệ sử dụng (Tech Stack)

Dự án theo kiến trúc **tách biệt hoàn toàn Frontend - Backend**, kết hợp dịch vụ Cloud và deploy lên Vercel.

### Frontend (`/fe`)

| Công nghệ                    | Phiên bản | Mô tả                                       |
| ---------------------------- | --------- | ------------------------------------------- |
| **React.js + Vite**          | 18 / 5    | Core framework & ultra-fast build tool      |
| **Tailwind CSS**             | 3         | Utility-first CSS, Responsive Design        |
| **GSAP + @gsap/react**       | 3         | Animation engine (Flip, Stagger, Draggable) |
| **React Router DOM**         | 6         | Điều hướng SPA với Data Router              |
| **@dnd-kit**                 | —         | Kéo thả (Drag & Drop) cho Admin Editor      |
| **Recharts**                 | —         | Biểu đồ Radar cho Champion Ratings          |
| **Lucide React**             | —         | Bộ icon nhất quán toàn dự án                |
| **i18n (vi.json / en.json)** | —         | Đa ngôn ngữ Việt - Anh                      |
| **React Helmet Async**       | —         | SEO & meta tags động                        |

### Backend (`/be`)

| Công nghệ                | Mô tả                                              |
| ------------------------ | -------------------------------------------------- |
| **Node.js + Express.js** | RESTful API Server                                 |
| **MongoDB (Atlas)**      | Cơ sở dữ liệu chính cho dữ liệu game và người dùng |
| **Supabase Auth**        | Quản lý định danh, JWT Token, phân quyền admin     |
| **Cloudflare R2**        | Lưu trữ ảnh (object storage, CDN)                  |
| **Upstash Redis**        | Caching tăng tốc phản hồi API                      |
| **Vercel**               | Serverless deployment                              |

---

## 📂 Cấu trúc dự án

```
ThePathOfChampionGuide/
├── be/                             # Backend Node.js
│   ├── config/                     # Cấu hình MongoDB, Supabase, R2, Redis
│   ├── middleware/                 # Xác thực & phân quyền Admin
│   ├── routes/                     # 21+ API route modules
│   ├── utils/                      # Caching, tiếng Việt, helpers
│   ├── uploadData/                 # Scripts migrate dữ liệu lên MongoDB
│   ├── server.js                   # Entry point Express
│   └── vercel.json                 # Cấu hình Serverless Vercel
│
└── fe/                             # Frontend React + Vite
    └── src/
        ├── App.jsx                 # Router & routing logic
        ├── main.jsx                # Entry point React
        ├── assets/                 # Hình ảnh tĩnh, icon.json
        ├── context/                # AuthContext, ThemeContext, LanguageContext
        │   └── services/           # apiHelper, authService
        ├── hooks/                  # Custom hooks toàn cục (useTranslation, useGenericData...)
        ├── locales/                # Bản dịch (vi.json, en.json)
        ├── utils/                  # Pure utilities (entityLookup, markupUtils...)
        ├── styles/                 # Global CSS
        ├── pages/                  # Trang toàn cục
        │   ├── home.jsx            # Trang chủ
        │   └── ErrorPage.jsx       # Trang lỗi 404/500
        ├── components/             # Shared UI components
        │   ├── common/             # Button, Modal, PageTitle, Animations...
        │   ├── layout/             # Navbar, Footer, GenericListLayout
        │   ├── admin/              # Toàn bộ hệ thống Admin CMS
        │   └── home/
        │       └── components/     # CinematicCard, CinematicSection
        └── features/               # Feature-based modules (kiến trúc cốt lõi)
            ├── about/
            │   └── pages/          # aboutUs, introduction, termsOfUse
            ├── adventureMaps/
            │   ├── admin/
            │   ├── components/     # adventureMapDetail, visualizer, sections...
            │   └── pages/          # adventureMapList
            ├── auth/
            │   └── pages/          # login, register, profile, authContainer, ResetPassword
            ├── bonusStars/
            ├── bosses/
            │   ├── components/     # BossDetailPage
            │   └── pages/          # BossListPage
            ├── builds/
            │   ├── components/     # buildDetail, buildList components...
            │   └── pages/          # buildList
            ├── cards/
            │   ├── components/     # CardItem, cardDetail, CardCarouselModal
            │   └── pages/          # cardList
            ├── champions/
            │   ├── components/     # championDetail, constellationMap, ratings...
            │   └── pages/          # championList, subChampionList
            ├── comment/
            │   └── components/     # commentsSection, latestComments
            ├── guides/
            │   ├── components/     # guideDetail, guideContent
            │   └── pages/          # guideListPage
            ├── items/
            │   ├── components/     # itemDetail
            │   └── pages/          # itemList
            ├── powers/
            │   ├── components/     # powerDetail
            │   └── pages/          # powerList
            ├── relics/
            │   ├── components/     # relicDetail
            │   └── pages/          # relicList
            ├── resources/
            │   ├── components/     # ResourceTableSection, ResourceSectionRenderer...
            │   └── pages/          # resourceListPage, resourceDetailPage
            ├── runes/
            │   ├── components/     # runeDetail
            │   └── pages/          # runeList
            └── tools/
                ├── championItems/
                │   ├── components/ # ChampionProfileBar, CompatibleItemsGrid...
                │   └── pages/      # championItems
                ├── championRating/
                ├── randomWheel/
                │   ├── components/ # sidePanelWheel, radomWheel
                │   └── pages/      # randomWheelPage
                ├── tierList/
                └── vaultSimulator/
                    ├── components/ # VaultProbabilityInfo, vaultConfig
                    └── vaultSimulator.jsx
```

---

## ⚙️ Cài đặt & Chạy cục bộ (Local Development)

### Yêu cầu

- Node.js >= 18
- npm >= 9
- MongoDB Atlas (hoặc local)
- Tài khoản Supabase
- Tài khoản Cloudflare R2
- Upstash Redis

### 1. Clone repository

```bash
git clone https://github.com/hacf202/ThePathOfChampionGuide.git
cd ThePathOfChampionGuide
```

### 2. Backend

```bash
cd be
npm install
```

Tạo file `.env` trong `be/`:

```env
FRONTEND_URL=http://localhost:5173
PORT=3000
MONGODB_URI=your_mongodb_atlas_uri
MONGODB_DB_NAME=guidePoc
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REDIS_URL=your_upstash_redis_url
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_CUSTOM_DOMAIN=https://your-r2-domain
```

```bash
node server.js
# API chạy tại http://localhost:3000
```

### 3. Frontend

```bash
cd fe
npm install
```

Tạo file `.env` trong `fe/`:

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
# App chạy tại http://localhost:5173
```

---

## 🗺️ API Endpoints chính

| Method | Endpoint              | Mô tả                         |
| ------ | --------------------- | ----------------------------- |
| `GET`  | `/api/champions`      | Danh sách tất cả tướng        |
| `GET`  | `/api/champions/:id`  | Chi tiết tướng (kèm ratings)  |
| `GET`  | `/api/builds`         | Danh sách build cộng đồng     |
| `POST` | `/api/builds`         | Tạo build mới                 |
| `GET`  | `/api/powers`         | Danh sách sức mạnh            |
| `GET`  | `/api/relics`         | Danh sách cổ vật              |
| `GET`  | `/api/items`          | Danh sách vật phẩm            |
| `GET`  | `/api/runes`          | Danh sách ngọc bổ trợ         |
| `GET`  | `/api/cards`          | Thư viện 2.300+ thẻ bài game  |
| `GET`  | `/api/adventures`     | Danh sách adventure maps      |
| `GET`  | `/api/bosses`         | Danh sách boss                |
| `GET`  | `/api/guides`         | Danh sách bài hướng dẫn       |
| `GET`  | `/api/ratings`        | Bảng đánh giá tướng cộng đồng |
| `GET`  | `/api/constellations` | Dữ liệu chòm sao tướng        |
| `POST` | `/api/auth/login`     | Đăng nhập                     |
| `POST` | `/api/auth/register`  | Đăng ký                       |

---

## 🤝 Đóng góp (Contributing)

Mọi Pull Request, Issue và góp ý đều được chào đón. Vui lòng đọc qua `RULE.md` và cấu trúc dự án trước khi đóng góp:

- **Kiến trúc Feature-based**: Mỗi tính năng tổ chức trong `features/<name>/` với `pages/`, `components/`, `admin/` riêng biệt.
- **Shared components** chỉ nằm ở `components/common/` hoặc `components/layout/`.
- **i18n bắt buộc**: Mọi văn bản hiển thị đều phải mapping qua `locales/vi.json` và `en.json`.
- **Không thay đổi Data Flow**: Các lớp data fetching và hook hiện có phải được giữ nguyên.

---

## 📄 License

Dự án được phân phối dưới [MIT License](./LICENSE).
