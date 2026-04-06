---
name: nodegenie-nde
description: Đọc, ghi và hiểu file .nde (NodeGenie mind map) trong dự án
---

# NodeGenie — Hướng dẫn đọc và ghi file .nde

File `.nde` là sơ đồ tư duy dạng **thuần thông tin** giúp AI agent hiểu cấu trúc mã nguồn: các module, hàm, biến và cách chúng kết nối với nhau.

## Quy tắc định dạng

Mỗi dòng trong file `.nde` có cấu trúc:

```
[indent] KEY value
```

- **indent**: 2 dấu cách mỗi cấp — xác định quan hệ cha-con
- **KEY**: luôn VIẾT HOA
- **value**: text thuần, không có dấu ngoặc, không có ký tự đặc biệt
- **#**: dòng bắt đầu bằng # là comment, bỏ qua khi parse

## Các KEY hợp lệ

| KEY | Ý nghĩa | Ví dụ |
|-----|---------|-------|
| `META` | Block thông tin file (đứng đầu file) | `META` |
| `NODE` | Khai báo module / component / class | `NODE AuthModule` |
| `FUNC` | Khai báo hàm / phương thức | `FUNC login` |
| `VAR` | Khai báo biến / trạng thái | `VAR currentUser` |
| `DESC` | Mô tả ngắn (1 dòng) | `DESC Xử lý đăng nhập` |
| `FILE` | Đường dẫn file liên quan | `FILE src/auth/login.ts` |
| `DEPS` | Phụ thuộc (cách nhau dấu cách) | `DEPS ModuleA ModuleB` |
| `CALLS` | Các hàm được gọi | `CALLS hashPwd findUser` |
| `READS` | Biến được đọc | `READS currentSession` |
| `WRITES` | Biến được ghi | `WRITES accessToken` |
| `EMITS` | Event được phát ra | `EMITS user.loggedIn` |
| `RETURN` | Kiểu trả về | `RETURN AuthResult` |
| `TYPE` | Kiểu dữ liệu của biến | `TYPE string` hoặc `TYPE Map` |
| `WARN` | Cảnh báo khi sửa | `WARN Thay đổi ảnh hưởng token` |
| `NOTE` | Ghi chú quan trọng | `NOTE Dùng bcrypt salt=12` |
| `TAG` | Nhãn phân loại | `TAG auth security` |
| `LINK` | Kết nối giữa 2 node (hỗ trợ `NodeName.FuncName`) | `LINK login TokenService.generate gọi` |

## Cấu trúc file .nde

```
# Comment — bị bỏ qua khi parse

META
  name TênHệThống
  version 1.0.0
  author dev
  desc Mô tả tổng quát

NODE TênModule
  DESC Mô tả module
  FILE src/path/to/file.ts
  DEPS Phụ thuộc1 Phụ thuộc2

  FUNC tênhàm
    DESC Mô tả hàm làm gì
    FILE src/path/to/file.ts
    CALLS hàmKhác module.method
    READS biếnĐọc1 biếnĐọc2
    WRITES biếnGhi1 biếnGhi2
    EMITS tênEvent
    RETURN KiểuTrảVề
    WARN Cảnh báo nếu có
    NOTE Ghi chú nếu có

  VAR tênBiến
    DESC Lưu dữ liệu gì
    TYPE string
    WARN Cảnh báo nếu có

LINK TừNode ĐếnNode nhãnKết Nối
```

## Quy tắc indent

- **Cấp 0**: META, NODE gốc, LINK
- **Cấp 1** (2 spaces): thuộc tính của NODE / FUNC / VAR gốc; hoặc NODE/FUNC/VAR con
- **Cấp 2** (4 spaces): thuộc tính của NODE/FUNC/VAR con
- Mỗi cấp tăng thêm 2 dấu cách
- **Giới hạn tối đa 4 cấp lồng nhau** — nếu cần lồng sâu hơn, hãy tách thành file `.nde` riêng

Ví dụ indent đúng:
```
NODE AppRoot          <- cấp 0
  DEPS AuthModule     <- cấp 1 (thuộc tính của AppRoot)
  NODE AuthModule     <- cấp 1 (con của AppRoot)
    DESC Xác thực   <- cấp 2 (thuộc tính của AuthModule)
    FUNC login        <- cấp 2 (con của AuthModule)
      DESC Đăng nhập  <- cấp 3 (thuộc tính của login)
```

## Cách AI đọc file .nde

1. Đọc toàn bộ file line by line
2. Dòng nào là `META` → đọc các dòng tiếp theo thành key-value metadata
3. Dòng `NODE` / `FUNC` / `VAR` → tạo node mới với tên = phần sau keyword
4. Indent xác định cha-con: node có indent nhỏ hơn là cha của node hiện tại
5. Các KEY còn lại → là thuộc tính của node hiện tại (node gần nhất phía trên)
6. `LINK From To label` → tạo kết nối giữa 2 node bất kỳ; `From` hoặc `To` có thể là dạng `NodeName.FuncName` để trỏ đến hàm/biến cụ thể bên trong node

## Cách AI ghi file .nde

Khi agent tạo hoặc cập nhật file `.nde`:

1. **Bắt đầu bằng META** nếu là file mới
2. **Mỗi node một nhóm** — NODE/FUNC/VAR → rồi các thuộc tính DESC, FILE, DEPS...
3. **FUNC và VAR** là con của NODE, dùng indent 2 spaces
4. **LINK** luôn đặt ở cuối file, cấp 0
5. **Không dùng dấu hai chấm, ngoặc, hay ký tự đặc biệt** trong value
6. **Mỗi thuộc tính một dòng** — không gộp nhiều thuộc tính trên một dòng

## Cách sử dụng trong dự án

- File `.nde` đặt trong thư mục `.agents/` hoặc gốc workspace
- Tên file = tên module/hệ thống: `auth.nde`, `database.nde`...
- Cập nhật `.nde` sau mỗi lần thay đổi code quan trọng
- AI agent đọc `.nde` trước khi debug để hiểu ngữ cảnh hệ thống
