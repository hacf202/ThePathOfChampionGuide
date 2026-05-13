# Cập nhật Hệ thống Xác thực (Auth System Update) - 13/05/2026

Tài liệu này ghi lại các thay đổi quan trọng trong hệ thống xác thực của dự án The Path of Champion Guide sau khi chuyển đổi từ AWS Cognito sang Supabase.

## 1. Chuyển đổi sang Supabase Auth
- Toàn bộ luồng đăng ký, đăng nhập và khôi phục mật khẩu đã được chuyển từ AWS Cognito sang **Supabase Auth**.
- Đã loại bỏ các thư viện và cấu hình thừa liên quan đến AWS SDK và Cognito trên cả Frontend và Backend.
- Biến môi trường được cập nhật: Loại bỏ `AWS_*`, `COGNITO_*`, thay thế bằng `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY`.

## 2. Tính năng Đăng nhập Đa năng (Dual Login)
- Hệ thống hiện hỗ trợ đăng nhập bằng cả **Email** hoặc **Tên tài khoản (Username)**.
- **Cơ chế:** Backend sẽ kiểm tra input của người dùng. Nếu không chứa ký tự `@`, hệ thống sẽ truy vấn MongoDB để lấy Email tương ứng với Username đó trước khi xác thực với Supabase.

## 3. Bảo mật Phân quyền (Admin Role)
- **Cải tiến:** Quyền Admin hiện được lưu trữ trong `app_metadata` của Supabase thay vì `user_metadata`.
- **Lý do:** `user_metadata` có thể bị người dùng tự ý chỉnh sửa từ phía Client (Security Risk). `app_metadata` chỉ có thể được chỉnh sửa bởi Backend/Admin, đảm bảo an toàn tuyệt đối.
- **Frontend:** `AuthContext.jsx` đã được cập nhật để chỉ nhận diện quyền Admin từ `app_metadata.groups`.

## 4. Kiểm tra trùng lặp Username
- Đã bổ sung bước kiểm tra trùng lặp Username trong MongoDB trước khi tạo tài khoản trên Supabase.
- Đảm bảo tính duy nhất của Username để tránh xung đột khi người dùng đăng nhập bằng tên tài khoản.

## 5. Cải thiện UX & Cleanup
- **Frontend:** Thêm thuộc tính `autoComplete` (ví dụ: `current-password`, `new-password`, `username`) vào các ô nhập liệu để hỗ trợ trình quản lý mật khẩu và xóa các cảnh báo Console.
- **Cleanup:** Xóa bỏ các component thừa như `OTPConfirmation.jsx` (không còn dùng OTP từ frontend cho Supabase trong luồng hiện tại).
- **Cleanup:** Xóa bỏ hàng loạt script xử lý dữ liệu một lần (`.cjs`) trong thư mục `be/uploadData` để làm gọn source code.

## 6. Công cụ quản trị (Utility Scripts)
- Thêm script `be/scripts/setAdmin.cjs`: Cho phép cấp quyền Admin cho người dùng bất kỳ thông qua Command Line.
  - Sử dụng: `node be/scripts/setAdmin.cjs <email>`

---
*Người cập nhật: Antigravity AI*
