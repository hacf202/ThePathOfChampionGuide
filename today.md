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
