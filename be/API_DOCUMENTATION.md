# 📘 POC GUIDE - API Documentation

Tài liệu này tổng hợp toàn bộ các API hiện có trong hệ thống backend của dự án **The Path of Champion Guide**.

## 🚀 Tổng quan
- **Base URL (Local):** `http://localhost:3000/api`
- **Định dạng dữ liệu:** JSON
- **Bảo mật:** Sử dụng AWS Cognito Token (Bearer Token) cho các route yêu cầu đăng nhập.

---

## 1. Xác thực (Authentication)
*Quản lý đăng nhập và khôi phục mật khẩu.*

| Phương thức | Endpoint | Chức năng |
| :--- | :--- | :--- |
| `POST` | `/auth/forgot-password` | Gửi mã OTP khôi phục mật khẩu đến email người dùng. |
| `POST` | `/auth/confirm-password-reset` | Xác nhận mã OTP và đặt lại mật khẩu mới. |

---

## 2. Quản lý Tướng (Champions)
*Dữ liệu về các anh hùng trong trò chơi.*

| Phương thức | Endpoint | Chức năng |
| :--- | :--- | :--- |
| `GET` | `/champions` | Lấy danh sách tướng (Hỗ trợ phân trang, lọc theo vùng, tags, sao, giá). |
| `GET` | `/champions/search` | Tìm kiếm tướng chính xác theo tên. |
| `POST` | `/champions/resolve` | Trả về thông tin chi tiết của một danh sách ID tướng. |
| `GET` | `/champions/:id/full` | **[Tối ưu]** Lấy toàn bộ dữ liệu (tướng, chòm sao, cổ vật, kỹ năng) cho trang chi tiết. |
| `GET` | `/champions/:id` | Lấy thông tin cơ bản của một tướng. |
| `PUT` | `/champions` | Tạo mới hoặc cập nhật thông tin tướng (Admin). |
| `DELETE` | `/champions/:id` | Xóa tướng khỏi hệ thống (Admin). |

---

## 3. Quản lý Build (Builds)
*Các bộ trang bị và kỹ năng được người chơi chia sẻ.*

| Phương thức | Endpoint | Chức năng |
| :--- | :--- | :--- |
| `GET` | `/builds` | Lấy danh sách build công khai (Hỗ trợ tìm kiếm Anh/Việt, lọc vùng, sao). |
| `GET` | `/builds/my-builds` | Lấy danh sách build do chính người dùng hiện tại tạo. |
| `GET` | `/builds/:id` | Xem chi tiết một bài build (Tự động tăng lượt xem). |
| `POST` | `/builds` | Tạo một bài build mới. |
| `PUT` | `/builds/:id` | Cập nhật bài build (Chỉ chủ sở hữu). |
| `DELETE` | `/builds/:id` | Xóa bài build. |
| `PATCH` | `/builds/:id/like` | Tăng lượt yêu thích cho bài build. |
| `GET` | `/admin/builds` | Quản lý toàn bộ build trong hệ thống (Admin). |

**Lưu ý:** Tất cả các endpoint trả về danh sách Build đều đã được **làm giàu dữ liệu** (`creatorName`) và áp dụng **Per-user Caching**.

---

## 4. Tương tác Cộng đồng (Comments & Ratings)
*Bình luận và đánh giá chỉ số lối chơi.*

| Phương thức | Endpoint | Chức năng |
| :--- | :--- | :--- |
| `GET` | `/builds/:buildId/comments` | Lấy danh sách bình luận của một bài build. |
| `POST` | `/builds/:buildId/comments` | Đăng bình luận hoặc phản hồi (reply). |
| `GET` | `/comments/latest` | Lấy các bình luận mới nhất trên toàn hệ thống. |
| `PUT` | `/comments/:id` | Chỉnh sửa nội dung bình luận. |
| `DELETE` | `/comments/:id` | Xóa bình luận. |
| `GET` | `/ratings/:championID` | Lấy tất cả đánh giá lối chơi của cộng đồng cho một tướng. |
| `GET` | `/ratings/:championID/my` | Lấy đánh giá cá nhân của người dùng cho tướng đó. |
| `POST` | `/ratings/:championID` | Gửi hoặc cập nhật đánh giá (6 chỉ số: damage, defense, speed...). |

---

## 5. Danh sách Yêu thích (Favorites)
*Lưu trữ các bài build người dùng quan tâm.*

| Phương thức | Endpoint | Chức năng |
| :--- | :--- | :--- |
| `GET` | `/builds/favorites` | Lấy danh sách các build đã được người dùng nhấn yêu thích. |
| `PATCH` | `/builds/:id/favorite` | Thêm vào hoặc xóa khỏi danh sách yêu thích (Toggle). |
| `GET` | `/builds/:id/favorite/status` | Kiểm tra xem bài build đã được user hiện tại thích chưa. |
| `GET` | `/builds/favorites/batch` | Kiểm tra trạng thái yêu thích cho một danh sách build IDs. |

---

## 6. Dữ liệu Trò chơi phụ (Cards, Powers, Relics, Items, Runes)
*Các thành phần bổ trợ cho tướng.*

- **Endpoints chung cho mỗi loại:**
    - `GET /api/[type]`: Lấy danh sách (Phân trang, tìm kiếm, lọc độ hiếm).
    - `GET /api/[type]/:code`: Lấy chi tiết.
    - `POST /api/[type]/resolve`: Lấy chi tiết từ danh sách mã code.
    - `PUT /api/[type]`: Cập nhật/Tạo mới (Admin).
    - `DELETE /api/[type]/:code`: Xóa (Admin).

---

## 7. Nội dung Mở rộng (Adventures, Bosses, Constellations, Guides)
*Bản đồ thế giới, Trùm cuối, Chòm sao và Bài viết hướng dẫn.*

| Phương thức | Endpoint | Chức năng |
| :--- | :--- | :--- |
| `GET` | `/adventures` | Lấy danh sách bản đồ phiêu lưu. |
| `GET` | `/bosses` | Lấy danh sách trùm (Hỗ trợ resolve hàng loạt). |
| `GET` | `/constellations` | Lấy danh sách chòm sao của tất cả tướng. |
| `GET` | `/guides` | Lấy danh sách bài viết hướng dẫn (Sử dụng Cache, Slug). |
| `GET` | `/guides/:slug` | Xem chi tiết bài viết (Tự động tăng lượt xem). |

---

## 8. Quản lý Hình ảnh (Images)
*Tích hợp Cloudflare R2 Storage.*

| Phương thức | Endpoint | Chức năng |
| :--- | :--- | :--- |
| `GET` | `/images` | Lấy danh sách ảnh trong một thư mục cụ thể. |
| `POST` | `/images/upload` | Tải ảnh lên (Tự động convert sang .webp, nén chất lượng). |
| `POST` | `/images/folders` | Tạo thư mục mới. |
| `DELETE` | `/images/single` | Xóa một ảnh cụ thể bằng Key. |
| `GET` | `/images/stats` | Thống kê số lượng file và tổng dung lượng lưu trữ. |

---

## 9. Người dùng & Phân tích (Users & Analytics)
*Quản lý profile và theo dõi hệ thống.*

| Phương thức | Endpoint | Chức năng |
| :--- | :--- | :--- |
| `GET` | `/user/me` | Lấy thông tin profile người dùng đang đăng nhập. |
| `PUT` | `/user/change-name` | Đổi tên hiển thị (Display Name). |
| `POST` | `/analytics/log` | Ghi nhận lượt truy cập (Public). |
| `GET` | `/analytics/stats` | Xem biểu đồ thống kê truy cập, thiết bị, trình duyệt (Admin). |

---

## 10. Cơ chế Caching & Làm giàu dữ liệu (Caching & Enrichment)
*Hệ thống sử dụng cơ chế cache thông minh để tối ưu hiệu suất.*

### Per-user Caching (Builds)
- **TTL:** 1 giờ (3600s).
- **Cơ chế:** Mỗi người dùng (dựa trên `sub` trong Token) có một bản cache riêng. Khách (Guest) dùng chung bản `global`.
- **Invalidation:** Khi người dùng thực hiện `POST`, `PUT`, `DELETE` hoặc `LIKE` bài build, hệ thống sẽ xóa cache **của chính người dùng đó**. Điều này đảm bảo người dùng thấy kết quả ngay lập tức trong khi hệ thống vẫn duy trì cache ổn định cho người khác.

### User Data Enrichment
- Hệ thống tự động tra cứu Display Name từ Cognito cho các trường `creator` và `sub`.
- Dữ liệu được cache tại Server (`userCache.js`) với TTL 1 giờ để tránh vượt giới hạn API của AWS Cognito.

---

*Tài liệu này được cập nhật tự động dựa trên mã nguồn hiện tại.*
