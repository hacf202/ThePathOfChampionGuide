# The Path of Champion Guide 🌟

[![repo size](https://img.shields.io/github/repo-size/hacf202/ThePathOfChampionGuide?style=flat-square)](https://github.com/hacf202/ThePathOfChampionGuide)
[![issues](https://img.shields.io/github/issues/hacf202/ThePathOfChampionGuide?style=flat-square)](https://github.com/hacf202/ThePathOfChampionGuide/issues)
[![license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![contributors](https://img.shields.io/github/contributors/hacf202/ThePathOfChampionGuide?style=flat-square)](https://github.com/hacf202/ThePathOfChampionGuide/graphs/contributors)

**The Path of Champion Guide** là một ứng dụng Web Full-stack toàn diện, hoạt động như một hệ thống bách khoa toàn thư, từ điển, và nền tảng chia sẻ lối chơi (builds) dành riêng cho chế độ **"The Path of Champions"** (Con Đường Anh Hùng) của tựa game **Legends of Runeterra**.

Dự án cung cấp cho cộng đồng người chơi một nơi để tra cứu thông tin chi tiết về Tướng, Vật phẩm, Sức mạnh, cũng như tạo và thảo luận về các chiến thuật tối ưu.

---

## 🚀 Tính năng nổi bật

### Dành cho Người dùng (Client)

- **📚 Bách khoa toàn thư:** Tra cứu chi tiết toàn bộ dữ liệu game (Champions, Items, Powers, Relics, Runes, Constellations).
- **🛠️ Hệ thống Build Cộng đồng:** Cho phép người chơi tạo, chia sẻ, và bình chọn (favorite) các lối chơi/combo tối ưu cho từng vị tướng.
- **📖 Hướng dẫn chuyên sâu (Guides):** Đọc các bài viết hướng dẫn chiến thuật, cách đi map từ cộng đồng.
- **💬 Tương tác:** Hệ thống bình luận (Comments) trên các bản build và hướng dẫn.
- **🎲 Tiện ích khác:** Vòng quay ngẫu nhiên (Random Wheel), Bản đồ (Maps), và Tier List.
- **🔐 Xác thực an toàn:** Đăng ký, đăng nhập và xác minh qua OTP bảo mật cao.

### Dành cho Quản trị viên (Admin CMS)

- **📊 Dashboard Thống kê:** Theo dõi lượng người dùng, số lượng build, và tương tác.
- **📝 Quản lý Nội dung (CRUD):** Giao diện trực quan để thêm, sửa, xóa dữ liệu game trực tiếp trên web mà không cần can thiệp vào Database.
- **🛡️ Phân quyền:** Bảo vệ các route nhạy cảm, chỉ có tài khoản Admin mới được phép can thiệp nội dung.

---

## 💻 Công nghệ sử dụng (Tech Stack)

Dự án được xây dựng theo kiến trúc hiện đại, tách biệt hoàn toàn giữa Frontend và Backend, kết hợp cùng các dịch vụ Cloud của AWS.

**Frontend (`/fe`)**

- **Core:** React.js, Vite (build tool).
- **Styling:** Tailwind CSS, PostCSS (Utility-first CSS, Responsive design).
- **State Management:** React Context API (quản lý Auth/User state).
- **Routing:** React Router DOM (Single Page Application).

**Backend (`/be`)**

- **Core:** Node.js, Express.js (RESTful API).
- **Database:** **AWS DynamoDB** (NoSQL Database mang lại khả năng mở rộng cực cao).
- **Authentication:** **AWS Cognito** (Quản lý định danh người dùng, cấp phát JWT Tokens, gửi mã OTP).

---

## 📂 Cấu trúc dự án

```text
ThePathOfChampionGuide/
├── be/                         # BACKEND FOLDER (Node.js/Express)
│   ├── src/
│   │   ├── config/             # Cấu hình kết nối AWS (Cognito, DynamoDB)
│   │   ├── middleware/         # Các middleware xác thực token (authenticate.js, requireAdmin.js)
│   │   ├── routes/             # Định nghĩa các Endpoints API (champions, builds, auth, users...)
│   │   └── utils/              # Các hàm tiện ích (caching, xử lý chuỗi tiếng Việt...)
│   ├── server.js               # File khởi chạy server Express chính
│   └── uploadToDynamoDB.js     # Script hỗ trợ migrate/seed dữ liệu JSON ban đầu lên DynamoDB
│
├── fe/                         # FRONTEND FOLDER (React.js/Vite)
│   ├── src/
│   │   ├── assets/             # Hình ảnh, icon tĩnh và script Python xử lý data JSON
│   │   ├── components/         # Các UI component có thể tái sử dụng (chia theo domain: admin, auth, build, common...)
│   │   ├── context/            # Global states (AuthContext) và các API Services
│   │   ├── hooks/              # Custom React Hooks (useCrudEditor, useAccentInsensitiveSearch...)
│   │   ├── pages/              # Chứa các trang View chính (Home, BuildList, ChampionList...)
│   │   ├── styles/             # Global CSS
│   │   ├── App.jsx             # File cấu hình Router chính
│   │   └── main.jsx            # Entry point của Frontend
│   ├── tailwind.config.cjs     # Cấu hình Tailwind CSS
│   └── vite.config.js          # Cấu hình Vite bundler
│
└── README.md                   # Tài liệu mô tả dự án (File này)
```
