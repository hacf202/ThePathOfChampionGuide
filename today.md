# Thay đổi ngày 11/04/2026

## 1. MarkupTooltip — Đa ngôn ngữ nhãn loại & độ hiếm

**File:** `fe/src/components/common/MarkupTooltip.jsx`

### Vấn đề
- Nhãn loại (`TỪ KHÓA`, `TƯỚNG`, `CỔ VẬT`...) và nhãn độ hiếm (`THÔNG THƯỜNG`, `HIẾM`, `HUYỀN THOẠI`...) hardcode tiếng Việt bất kể ngôn ngữ UI.
- Mô tả tooltip hiển thị markup tags thô (ví dụ `[k:Stun|Choáng]`) thay vì text sạch.
- Nút "Xem chi tiết" không đổi sang EN.

### Sửa
- Import `useTranslation` để lấy `language`, tạo biến `isEN`.
- `typeLabel`: khi `isEN` → trả `KEYWORD / CHAMPION / RELIC / POWER / ITEM / CARD / STAR LEVEL / INFO`.
- `theme.label` (độ hiếm): khi `isEN` → trả `COMMON / RARE / EPIC / LEGENDARY / SPECIAL / BASIC`.
- Thêm hàm `stripMarkup()` inline (tránh circular import với `MarkupRenderer`) để làm sạch markup tags trước khi render trong tooltip.
- Nút "Xem chi tiết" → "View Details" khi EN.

---

## 2. entityLookup — Keyword tra cứu đúng ngôn ngữ

**File:** `fe/src/utils/entityLookup.js`

### Vấn đề
- `getEntityData()` với `type="k"` (keyword) luôn ưu tiên globals tiếng Việt (đặt trước trong `allSources`), khiến tooltip keyword hiển thị mô tả VN dù UI đang EN.

### Sửa
- Tách `primarySources` (đúng ngôn ngữ được chọn) và `fallbackSources`.
- Case `keyword`: tìm trong `primarySources` trước, chỉ fallback sang `fallbackSources` nếu không tìm thấy.
- Đảm bảo khi `lang="en"` → tìm trong `globalsEn` trước.

---

## 3. CardHoverTooltip — Ảnh card đúng ngôn ngữ

**File:** `fe/src/components/champion/CardHoverTooltip.jsx`

### Vấn đề
- Khi UI tiếng Anh, tooltip hover thẻ bài trong phần Starting Deck vẫn hiển thị ảnh artwork tiếng Việt.

### Sửa
- Import `language` từ `useTranslation`.
- Khi `isEN`: ưu tiên `card.translations.en.gameAbsolutePath`, fallback về `card.gameAbsolutePath`.

---

## 4. ChampionDetail — Thumbnail card đúng ngôn ngữ

**File:** `fe/src/components/champion/championDetail.jsx` (component `CardNameCell`)

### Vấn đề
- Thumbnail nhỏ của thẻ bài trong bảng Starting Deck cũng dùng ảnh VN.

### Sửa
- Lấy thêm `language` từ `useTranslation`.
- Khi `isEN`: ưu tiên `card.translations.en.gameAbsolutePath` cho ảnh thumbnail.
---

## 5. Markup Tooltip — Hỗ trợ hiển thị Vật phẩm (Items)

**Files:** `fe/src/hooks/useMarkupResolution.js`, `fe/src/components/common/MarkupRenderer.jsx`, `fe/src/components/common/MarkupTooltip.jsx`

### Vấn đề
- Khi nhắc đến thẻ bài trong văn bản (Markup), Tooltip không hiển thị các vật phẩm đính kèm (Items/Relics) giống như trong giao diện Deck.
- Các vật phẩm trong tùy chọn của thẻ (e.g. `[card:code|label|item1]`) không được tự động tải dữ liệu về cache.

### Sửa
- **useMarkupResolution.js**: Cập nhật logic quét để tự động nạp dữ liệu các vât phẩm/cổ vật nằm trong `tagOptions` của thẻ.
- **MarkupRenderer.jsx**: Phân giải các mã vật phẩm từ `tagOptions` và truyền vào Tooltip.
- **MarkupTooltip.jsx**: Bổ sung prop `items` và triển khai giao diện hiển thị icon vật phẩm lơ lửng bên phải ảnh chính, đồng nhất với `CardHoverTooltip`.
---

## 6. Markup Editor — Sửa lỗi tìm kiếm Vật phẩm & Cổ ngữ

**File:** `fe/src/utils/entityLookup.js`

### Vấn đề
- Không thể tìm thấy vật phẩm (ví dụ: "Búa Gỗ") khi tìm kiếm trong trình soạn thảo Markup.
- Nguyên nhân do hàm `preloadAllEntities` bỏ sót việc tải dữ liệu Vật phẩm (`items`) và Cổ ngữ (`runes`) từ máy chủ.

### Sửa
- Cập nhật `preloadAllEntities`: Gọi thêm API `/api/items` và `/api/runes` song song với các thực thể khác.
- Cập nhật `getAllEntities`: Bổ sung xử lý loại thực thể `rune` để hỗ trợ tìm kiếm đầy đủ.
