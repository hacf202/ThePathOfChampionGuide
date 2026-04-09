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

- **📚 Bách khoa toàn thư đa dữ liệu:** Tra cứu chi tiết toàn bộ dữ liệu game: Champions, Items, Powers, Relics, Runes, Constellations, Adventure Maps, Bosses.
- **Trạng thái cốt lõi**:
  - Giao diện phải cực kỳ trực quan, tránh lỗi vặt khi người quản trị nhập dữ liệu.
  - **Hiệu năng**: Áp dụng giới hạn render 100-item và smart loading cho SidePanel để xử lý danh sách bài quân cực lớn.
  - **Tự động hóa**: Trình biên tập hỗ trợ quét Markup tự động để đồng bộ dữ liệu tham chiếu.
  - Phải hỗ trợ đa ngôn ngữ 100% để đội ngũ quốc tế cũng có thể dùng chung.
  - Các trang danh sách dữ liệu phải có tính đồng nhất phân trang (Pagination), như áp dụng luật **24-item limit**.
- **🛠️ Hệ thống Build Cộng đồng:** Cho phép người chơi tạo, chia sẻ và bình chọn (yêu thích) các lối chơi/combo tối ưu cho từng vị tướng.
- **📖 Hướng dẫn chuyên sâu (Guides):** Đọc các bài viết hướng dẫn chiến thuật, cách đi map từ cộng đồng.
- **💬 Hệ thống bình luận:** Bình luận trực tiếp trên từng bản build và bài hướng dẫn.
- **🎲 Tiện ích:** Vòng quay ngẫu nhiên (Random Champion Wheel), Bản đồ Adventure Maps, Tier List.
- **🌐 Song ngữ Việt - Anh:** Toàn bộ giao diện có thể chuyển đổi ngôn ngữ linh hoạt.
- **🔐 Xác thực an toàn:** Đăng ký, đăng nhập và xác minh OTP qua AWS Cognito.

### 🛡️ Dành cho Quản trị viên (Admin CMS)

- **📊 Dashboard Thống kê:** Theo dõi lượng người dùng, số lượng build, lượt xem và tương tác.
- **📝 Quản lý Nội dung (Full CRUD):** Giao diện trực quan để thêm, sửa,
- **Champion Ratings**: Hệ thống đánh giá tướng chuyên sâu từ cộng đồng với 10 thang điểm và phân tích radar.
- **Bento Grid Database**: Tra cứu Items, Relics, Powers, Runes với giao diện hiện đại.
xóa dữ liệu game của tất cả các thực thể (Champions, Powers, Relics, Items, Runes, Builds, Guides, Bosses, Constellations, Adventure Maps...).
- **⚙️ Tự động hóa Dữ liệu (Editor):** Hệ thống **Auto-Scan** mô tả bài để tự động điền thẻ bài tham chiếu, giảm 80% thao tác nhập liệu thủ công.
- **⚡ Tối ưu hóa Hiệu năng (Admin):** Cơ chế lọc thông minh và Lazy-loading hình ảnh trên sidebar giúp xử lý mượt mà danh sách > 2.300 lá bài.
- **🎨 Đánh giá chỉ số tướng:** Nhập điểm đánh giá (1-10) cho 6 tiêu chí và ghi chú chiến thuật song ngữ trực tiếp từ Admin Panel.
- **🖼️ Quản lý Hình ảnh:** Tải ảnh lên Cloudflare R2, quản lý thư viện ảnh tích hợp.
- **🛡️ Phân quyền:** Bảo vệ các route nhạy cảm, chỉ có tài khoản Admin mới được phép can thiệp nội dung.

---

## 💻 Công nghệ sử dụng (Tech Stack)

Dự án được xây dựng theo kiến trúc hiện đại, **tách biệt hoàn toàn Frontend - Backend**, kết hợp các dịch vụ Cloud AWS và được cấu hình deploy lên Vercel.

### Frontend (`/fe`)

| Công nghệ | Mô tả |
|---|---|
| **React.js + Vite** | Core framework & ultra-fast build tool |
| **Tailwind CSS** | Utility-first CSS, Responsive Design |
| **Recharts** | Thư viện vẽ biểu đồ (Radar Chart) |
| **React Router DOM** | Điều hướng SPA |
| **React Context API** | Quản lý Auth State toàn cục |
| **Lucide React** | Bộ icon nhất quán toàn dự án |
| **i18n (vi.json / en.json)** | Hỗ trợ đa ngôn ngữ Việt - Anh |

### Backend (`/be`)

| Công nghệ | Mô tả |
|---|---|
| **Node.js + Express.js** | RESTful API Server |
| **AWS DynamoDB** | NoSQL Database - khả năng mở rộng cực cao |
| **AWS Cognito** | Quản lý định danh, JWT Token, OTP |
| **Cloudflare R2** | Lưu trữ ảnh (object storage) |
| **node-cache** | In-memory caching tăng tốc phản hồi API |
| **Vercel** | Serverless Functions deployment |

---

## 📂 Cấu trúc dự án (Monorepo)

```
ThePathOfChampionGuide/
├── be/                         # Backend Node.js
│   ├── src/
│   │   ├── config/             # Cấu hình AWS (Cognito, DynamoDB, R2)
│   │   ├── middleware/         # Middleware xác thực (auth) & phân quyền (admin)
│   │   ├── routes/             # 18 API route modules (champions, builds, auth, users...)
│   │   └── utils/              # Caching, xử lý chuỗi tiếng Việt, utilities dùng chung
│   ├── uploadData/             # Scripts migrate/seed dữ liệu ban đầu lên DynamoDB
│   ├── server.js               # Entry point Express server
│   ├── vercel.json             # Cấu hình deploy Serverless Vercel cho API
│   └── package.json
│
├── fe/                         # Frontend React
│   ├── src/
│   │   ├── assets/             # Hình ảnh, scripts xử lý dữ liệu
│   │   ├── components/         # 16 domain UI components (admin, champion, build, auth, common...)
│   │   ├── context/            # AuthContext & API Service endpoints
│   │   ├── hooks/              # Custom Hooks (useCrudEditor, useTranslation, useSearch...)
│   │   ├── locales/            # Bản dịch đa ngôn ngữ (vi.json, en.json)
│   │   ├── pages/              # 11 trang view chính (Home, ChampionList, BuildList...)
│   │   ├── styles/             # Global theme (theme.css, CSS variables)
│   │   ├── utils/              # Tiện ích Frontend (formatters, helpers)
│   │   ├── App.jsx             # Cấu hình Router & Routing logic
│   │   └── main.jsx            # Entry point React
│   ├── index.html
│   ├── tailwind.config.cjs     # Design System Tailwind
│   ├── vite.config.js          # Vite bundler + proxy dev config
│   ├── vercel.json             # SPA rewrite rules cho Vercel
│   └── package.json
│
├── docs/                       # Tài liệu & bộ nhớ dự án
├── scripts/                    # Scripts tiện ích chung
└── README.md
```

---

## ⚙️ Cài đặt & Chạy cục bộ (Local Development)

### Yêu cầu
- Node.js >= 18
- npm >= 9
- Tài khoản AWS (DynamoDB + Cognito)
- Tài khoản Cloudflare (R2)

### 1. Clone repository

```bash
git clone https://github.com/hacf202/ThePathOfChampionGuide.git
cd ThePathOfChampionGuide
```

### 2. Cài đặt Backend

```bash
cd be
npm install
```

Tạo file `.env` trong thư mục `be/` với các biến sau:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
COGNITO_USER_POOL_ID=your_pool_id
COGNITO_APP_CLIENT_ID=your_client_id
FRONTEND_URL=http://localhost:5173
PORT=3000
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_CUSTOM_DOMAIN=https://your-r2-domain
```

Khởi chạy server:

```bash
node server.js
```

> API sẽ chạy tại `http://localhost:3000`

### 3. Cài đặt Frontend

```bash
cd fe
npm install
```

Tạo file `.env` trong thư mục `fe/`:

```env
VITE_API_URL=http://localhost:3000
```

Khởi chạy dev server:

```bash
npm run dev
```

> Ứng dụng sẽ chạy tại `http://localhost:5173`

---

## 🗺️ API Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/champions` | Danh sách tất cả tướng |
| `GET` | `/api/champions/:id` | Chi tiết một tướng (bao gồm ratings) |
| `PUT` | `/api/champions` | Cập nhật tướng (Admin) |
| `GET` | `/api/builds` | Danh sách build cộng đồng |
| `POST` | `/api/builds` | Tạo build mới |
| `GET` | `/api/powers` | Danh sách sức mạnh |
| `GET` | `/api/relics` | Danh sách cổ vật |
| `GET` | `/api/items` | Danh sách vật phẩm |
| `GET` | `/api/runes` | Danh sách ngọc bổ trợ |
| `GET` | `/api/guides` | Danh sách bài hướng dẫn |
| `GET` | `/api/adventures` | Danh sách adventure maps |
| `POST` | `/api/auth/login` | Đăng nhập |
| `POST` | `/api/auth/register` | Đăng ký |
| `GET` | `/api/analytics` | Thống kê hệ thống (Admin) |

---

## 🤝 Đóng góp (Contributing)

Mọi Pull Request, Issue và góp ý đều được chào đón. Vui lòng đọc qua cấu trúc dự án trước khi đóng góp để đảm bảo code nhất quán với các chuẩn đã thiết lập.

---

## 📄 License

Dự án được phân phối dưới [MIT License](./LICENSE).
