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

---

## 7. Markup Editor — Tăng tính linh hoạt khi tìm kiếm

**File:** `fe/src/components/admin/MarkupEditor.jsx`

### Cải tiến
- Tự động cắt bỏ các khoảng trắng thừa ở đầu hoặc cuối chuỗi tìm kiếm (`.trim()`).
- Giúp việc tìm kiếm "Búa Gỗ " hoặc " Búa Gỗ" vẫn trả về kết quả chính xác, cải thiện trải nghiệm người dùng khi thao tác nhanh.

---

## 8. Markup Editor — Xử lý khoảng trắng thông minh khi tạo thẻ

**File:** `fe/src/components/admin/MarkupEditor.jsx`

### Cải tiến
- Tự động phát hiện và đẩy các dấu cách ở đầu/cuối vùng chọn ra ngoài thẻ Markup (hoặc thẻ HTML).
- Tránh tình trạng nhãn của thẻ chứa dấu cách thừa hoặc văn bản bị dính liền vào thẻ sau khi render.
- Áp dụng cho cả việc chèn thực thể (Items, Champions...) và các công cụ định dạng (Bold, Italic).
---

## 9. Guide Components — Đồng bộ hóa hệ màu (Theme Synchronization)

**Files:** `fe/src/components/guide/guideDetail.jsx`, `fe/src/components/guide/guideContent.jsx`

### Vấn đề
- Các trang hướng dẫn (`GuideDetail`) sử dụng các class màu trắng/xám cứng (`bg-white`, `bg-gray-50`), không đồng bộ với hệ thống theme (Dark/Light/Artwork) của ứng dụng.

### Sửa
- Thay thế các class `bg-white`, `bg-gray-50`, `bg-slate-50` bằng các biến semantic như `bg-surface-bg`, `bg-page-bg`.
- Cập nhật màu chữ từ `text-gray-900/500` sang `text-text-primary/secondary`.
- Sử dụng hiệu ứng kính (`backdrop-blur-sm`) và màu nền hover (`bg-surface-hover/20`) cho bảng mục lục, giúp giao diện trông hiện đại và chuyên nghiệp hơn trên mọi loại nền.
- Đồng bộ lại các border và badge trang trí để sử dụng dải màu `primary-500` chuẩn của ứng dụng.
---

## 10. Guide List — Tìm kiếm không dấu (Accent-insensitive Search)

**File:** `fe/src/pages/guideListPage.jsx`

### Cải tiến
- Cho phép người dùng tìm kiếm bài viết bằng tiếng Việt không dấu (ví dụ: gõ "bua go" vẫn ra "Búa Gỗ").
- Sử dụng tiện ích `removeAccents` để chuẩn hóa cả từ khóa tìm kiếm và các trường dữ liệu (tiêu đề, mô tả, tác giả) trước khi so sánh.
- Giúp tăng tốc độ tìm kiếm và cải thiện trải nghiệm người dùng trên thiết bị di động hoặc khi gõ nhanh.
---

## 11. Vault Simulator — Giả lập rương Hoa Linh Lục Địa

**File:** `fe/src/pages/vaultSimulator.jsx`, `fe/src/locales/vi.json`, `fe/src/locales/en.json`

### Tính năng mới
- Thêm loại rương **Hoa Linh Lục Địa** vào danh sách giả lập.
- **Vật phẩm rơi**: Hỗ trợ logic rơi mới cho Ngọc (Runes) và Mảnh Ngọc (Rune Shards).
    - Mảnh Ngọc: Luôn rơi x4 (100%).
    - Ngọc: Tỷ lệ quay thưởng Thường (81.28%), Hiếm (17.12%), Huyền Thoại (1.6%).
- **Dữ liệu**: Tích hợp API để lấy danh sách Ngọc thực tế từ cơ sở dữ liệu.
- **Giao diện**: Cập nhật hiệu ứng màu hồng và bảng tra cứu tỷ lệ mở rương chi tiết.
---

## 12. Adventure Map — Mốc Thưởng Đa ngôn ngữ (Reward Milestones)

**Files:** `fe/src/locales/vi.json`, `fe/src/locales/en.json`, `fe/src/components/map/rewardSection.jsx`, `fe/src/components/map/adventureMapDetail.jsx`

### Vấn đề
- Phần "Mốc Thưởng" (Reward Milestones) trong chi tiết bản đồ hiển thị tên vật phẩm cứng bằng tiếng Việt từ dữ liệu backend.
- Các tiêu đề cột và nhãn mốc (ví dụ: "Mốc thưởng 1") hardcode tiếng Việt.
- Thiếu định nghĩa dịch thuật cho các loại rương và vật phẩm đặc trưng của PoC (Cosmic Vaults, Reliquaries, Stardust...).

### Sửa
- **Locales**: Bổ sung object `reward` vào cả 2 ngôn ngữ, định nghĩa dịch thuật cho toàn bộ các vật phẩm PoC (Bronze/Silver/Gold/Platinum/Diamond Vault, Reliquary, Nova Crystal, Gemstone, Wild Fragments, Champ Fragments...).
- **rewardSection.jsx**:
    - Xây dựng `REWARD_MAP` để ánh xạ tên vật phẩm tiếng Việt sang translation keys.
    - Cập nhật logic `parseRewardItem` để dịch tên vật phẩm và khu vực (Region) một cách linh hoạt.
    - Chuyển đổi toàn bộ headers và labels sang sử dụng `tUI`.
- **adventureMapDetail.jsx**:
    - Việt hóa/Anh hóa các fallbacks cho Champion XP và nút ẩn/hiện bản đồ (sử dụng `common.hide` và `common.show`).

