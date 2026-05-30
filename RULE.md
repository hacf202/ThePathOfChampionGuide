# LUẬT VÀ PHƯƠNG PHÁP LÀM VIỆC CỦA AI VỚI DỰ ÁN NÀY

Đây là file bộ quy tắc ứng xử duy nhất cho AI (SSOT - Single Source of Truth). Bất cứ lúc nào AI vận hành dự án này, hãy tuân theo các chỉ mục sau:

---

## 0. Quy tắc cốt lõi (Core Rules)

- **ĐỌC CẤU TRÚC DỰ ÁN TRƯỚC**: Trước khi thực hiện bất kỳ thay đổi nào liên quan đến cấu trúc, logic hoặc tính năng mới, AI phải đọc `README.md` để hiểu kiến trúc tổng thể.
- **KHÔNG thay đổi Data Flow**: Các lớp data fetching (`hooks/`, Context API) và chuỗi props hiện có phải được giữ nguyên. Chỉ thêm, không phá vỡ.
- **Chạy `npm run build` sau mọi thay đổi cấu trúc**: Vite rất khắt khe với lỗi import/export. Sau mọi thao tác di chuyển file hoặc đổi tên, bắt buộc build để kiểm chứng.

---

## 1. Tiêu chí tối cao (Delivery Standards)

- **Độ chính xác > Tốc độ**: Làm việc tỉ mỉ, kiểm tra kỹ trước khi báo cáo kết quả.
- **Tự động kết luận và Hành động**: Được phép tự sửa các lỗi rõ ràng (typo, import sai, i18n thiếu key) mà không cần hỏi lại.
- **Hỏi lại khi không chắc chắn**: Bất cứ khi nào không chắc về ý định của user hoặc ảnh hưởng của thay đổi, **dừng lại và đặt câu hỏi** trước khi viết code.
- **Tuyệt đối không đoán mò**: Không dùng "có vẻ đúng", "chắc là được".

### 1.1. Quy trình Lập kế hoạch (Planning Process)

Với mọi yêu cầu phức tạp (trừ sửa lỗi đơn giản), AI **bắt buộc** thực hiện:
1. **Nghiên cứu (Research)**: Đọc mã nguồn liên quan, xác định scope ảnh hưởng.
2. **Lập Kế hoạch (Plan)**: Tạo `implementation_plan.md` mô tả từng bước.
3. **Phê duyệt (Approval)**: Đợi người dùng chấp thuận kế hoạch.
4. **Thực thi (Execute)**: Chỉ thực hiện sau khi có sự đồng ý.
5. **Xác minh (Verify)**: Chạy build hoặc test để xác nhận không có lỗi.

---

## 2. Quy tắc Kiến trúc (Architecture Guidelines)

### 2.1. Cấu trúc Feature-based

Dự án theo kiến trúc **Feature-based**. Mỗi tính năng có thư mục riêng trong `src/features/<name>/`:

```
features/<name>/
├── pages/        # Các trang routable (được đăng ký trong App.jsx)
├── components/   # Components chuyên biệt của feature này
├── hooks/        # Custom hooks riêng của feature (nếu có)
└── admin/        # Giao diện quản trị (nếu có)
```

**Quy tắc phân loại:**
- `src/features/<name>/` — Tất cả code chuyên biệt của một tính năng
- `src/components/common/` — Shared UI (Button, Modal, PageTitle, Animations...)
- `src/components/layout/` — Navbar, Footer, GenericListLayout
- `src/components/admin/` — Hệ thống Admin CMS
- `src/hooks/` — Chỉ các hook **thực sự dùng chung** (useTranslation, useGenericData, useGenericFilters, usePageTracking, usePersistentState...)
- `src/pages/` — Chỉ `home.jsx` và `ErrorPage.jsx` (global pages)
- `src/utils/` — Pure utility functions
- `src/context/` — React Contexts + API services

### 2.2. Quy tắc Component

- Mỗi component đảm nhận **một chức năng duy nhất** (Single Responsibility).
- Component quá lớn (> 300 dòng logic) nên được chia nhỏ theo sub-components.
- Import luôn dùng alias `@/` thay vì đường dẫn tương đối `../../../`.

### 2.3. Animation

- Dự án dùng **GSAP** (không dùng Framer Motion — đã gỡ bỏ).
- Sử dụng `useGSAP`, `gsap.to()`, `GSAP Flip`, `StaggerContainer/StaggerItem` từ `@/components/common/animations`.
- KHÔNG thêm prop `transition={}` vào thẻ HTML thuần — đây là syntax Framer Motion, sẽ gây lỗi.

---

## 3. Quy tắc i18n (Đa ngôn ngữ)

- **Bắt buộc 100%**: Mọi văn bản hiển thị trên UI phải mapping qua `locales/vi.json` và `locales/en.json`.
- **KHÔNG hardcode** văn bản tiếng Việt hay tiếng Anh trong JSX.
- Khi thêm key mới, cập nhật **cả hai file** `vi.json` và `en.json` cùng lúc.
- Sử dụng `tUI("key.path")` cho UI text, `tDynamic(obj, "field")` cho dữ liệu động từ DB.

---

## 4. Quy tắc Bộ nhớ và Tri thức (Memory & Knowledge)

- **task.md**: TODO list tiến độ công việc hiện tại.
- **walkthrough.md**: Tổng hợp thay đổi đã hoàn thành để báo cáo.
- **implementation_plan.md**: Kế hoạch chi tiết trước khi thực thi.
- Ghi nhận tri thức mới (logic phức tạp, cấu trúc dữ liệu mới) vào tài liệu dự án.

---

## 5. Ranh giới vận hành (Operational Boundaries)

| Loại thay đổi | Quyền hành động |
|---|---|
| Sửa lỗi cú pháp, typo, import sai | ✅ Tự động sửa, không cần hỏi |
| Cập nhật i18n (thêm/sửa key) | ✅ Tự động, không cần hỏi |
| Di chuyển file, đổi cấu trúc nhỏ | ✅ Tự động + chạy build kiểm chứng |
| Thêm tính năng mới theo định hướng đã thống nhất | ✅ Lập kế hoạch → Thực thi |
| Thay đổi core architecture | ⛔ Bắt buộc hỏi trước |
| Thay đổi Data Flow, schema database | ⛔ Bắt buộc hỏi trước |
| Cài thêm thư viện lớn mới | ⛔ Bắt buộc hỏi trước |
| Xóa file/thư mục lớn | ⛔ Bắt buộc hỏi trước |

---

## 6. Tính năng đặc thù cần lưu ý

- **GSAP Flip**: Dùng `useLayoutEffect` (không phải `useEffect`) khi dùng `Flip.getState()` trong `genericListLayout.jsx` để tránh layout shift khi toggle filter.
- **Admin Scroll**: Trang Admin Editor (`/admin/champions/:id`) dùng `overflow-y-auto` trên main container, KHÔNG dùng `overflow-hidden`.
- **Vault Simulator**: `LootItem` dùng key `vaultSimulator.loot.champ_frags` (không phải `champFrag`) để lấy tên "Mảnh Tướng".
- **Build verification**: Sau mọi thay đổi cấu trúc lớn, chạy `npm run build` trong `/fe` để kiểm tra không có lỗi import.
