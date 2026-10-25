# Quy Trình Cung Cấp & Cập Nhật Dữ Liệu Tướng (Champion Guide Workflow)

Tài liệu này xác lập quy trình chuẩn hóa (Standard Operating Procedure - SOP) để tiếp nhận mô tả lối chơi tướng từ người dùng (qua bản ghi âm / text / file Markdown tiếng Việt), chuẩn hóa cấu trúc dữ liệu, đối soát thông tin với `runeterrarelics.com` và dữ liệu hệ thống, biên dịch sang tiếng Anh chuẩn thuật ngữ Riot Games / LoR, và cập nhật trực tiếp vào Cơ sở dữ liệu MongoDB sau khi người dùng phê duyệt.

---

## 1. Toàn Bộ 10 Phân Vùng Dữ Liệu Trên Trang Admin (`/admin/champions/:id`)

Dựa trên cấu trúc trang `http://localhost:5173/admin/champions/C076`, một hồ sơ tướng hoàn chỉnh bao gồm 10 phân vùng dữ liệu:

1. **THÔNG TIN CƠ BẢN (Basic Info):**
   - `championID`, `cardCode`, `name` (VI & EN), `cost`, `maxStar`
   - `playStyle` (VI & EN), `tier` (VI & EN), `counter` (VI & EN)
   - Ảnh đại diện (`avatar`)
2. **HƯỚNG DẪN & VIDEO (Guide & Video):**
   - `videoLink` (YouTube Embed)
   - `description` (VI HTML) & `descriptionRaw` (VI Text)
   - `translations.en.description` & `descriptionRaw` (EN Text)
3. **KHỞI ĐẦU & SỨC MẠNH (Powers & Items):**
   - `adventurePowerIds` (Sức mạnh phiêu lưu khuyên dùng)
   - `itemIds` (Vật phẩm lá bài mặc định/gợi ý)
4. **BỘ BÀI KHỞI ĐẦU (Starting Deck):**
   - `baseCards`: `[{ cardCode, itemCodes: [{ itemCode, unlockLevel }] }]`
   - `referenceCards`: `[{ cardCode, itemCodes: [...] }]`
5. **BẢN ĐỒ CHÒM SAO (Constellation - Bảng guidePocConstellations):**
   - `constellationID` (= `championID`)
   - `nodes`: `[{ nodeID, nodeName, nodeType, powerCode, position... }]`
6. **ASSETS & KHU VỰC, NHÃN (Assets, Regions & Tags):**
   - `assets`: `[{ avatar, fullAbsolutePath, gameAbsolutePath }]`
   - `regions` (VI & EN)
   - `tags` (VI & EN)
7. **VẬN HÀNH COMBO MẶC ĐỊNH (Default Combo Steps):**
   - `comboSteps`: `[{ step, phase (VI), translations.en.phase (EN) }]`
8. **MẸO CHUYÊN SÂU & KHẮC CHẾ BOSS MẶC ĐỊNH (Default Pro Tips):**
   - `proTips`: `[{ tip (VI), translations.en.tip (EN) }]`
9. **DANH SÁCH BỘ CỔ VẬT GỢI Ý (Relic Sets - Đa Dạng Build):**
   - `items`: `[R0147, R0082, R0080]` (Tối đa 3 relics)
   - `title` (VI & EN), `recommendedStars` (1-6)
   - `description` (VI & EN) có gán thẻ `[r:...|...|icon]`
   - `videoLink`, `comboSteps` riêng, `proTips` riêng (nếu có)
10. **ĐÁNH GIÁ LỐI CHƠI (Ratings Section):**
    - `damage`, `defense`, `synergy`, `difficulty` (Thang điểm 1 - 10)
    - `playstyleNote` (VI & EN)

---

## 2. Ma Trận Phân Định Nguồn Dữ Liệu

- **Người dùng cung cấp:** Chất tướng, lối chơi, xếp hạng tier, mẹo khắc chế, các bước combo, các bộ cổ vật gợi ý (tên đồ, ý đồ vận hành, số sao khuyên dùng), điểm số đánh giá và nhận định.
- **AI tự động bổ sung / tra cứu:** Mã ID lá bài (`cardCode`), bộ bài khởi đầu (`startingDeck`), chòm sao (`constellations`), mã định danh cổ vật (`Rxxxx`), sức mạnh (`Pxxxx`), vật phẩm (`Ixxxx`), link CDN hình ảnh. Tham khảo thêm tương tác synergy tại `https://runeterrarelics.com/champions/`.
- **Nguyên tắc cốt lõi:** Không bịa đặt thông tin. Nếu thiếu thông tin quan trọng, AI bắt buộc phải hỏi người dùng để xác nhận.

---

## 3. Quy Tắc Biên Dịch & Thẻ Hệ Thống

1. **Cấu trúc Thẻ Tag:** Giữ nguyên 100% cấu trúc `[type:ID|DisplayName|options]`, chỉ dịch phần DisplayName ở giữa sang tiếng Anh.
2. **Từ Điển Thuật Ngữ LoR:**
   - Lắp trang bị ➔ `Equip / Play an Equipment`
   - Đang mang trang bị ➔ `Equipped`
   - Ra đòn ➔ `Strike` *(Tuyệt đối không dùng Attack nếu ý là Strike)*
   - Triệu hồi ➔ `Summon`
   - Tiêu hao / Giá ➔ `Cost / Mana cost`
   - Năng lượng ➔ `Mana`
   - Ngọc năng lượng ➔ `Mana Gem`
   - Năng lượng bài phép ➔ `Spell mana`
   - Tùy tùng ➔ `Follower`
   - Tướng ➔ `Champion`
   - Nhóm phụ (Tộc/Hệ) ➔ `Subtype / Subtyped allies`
   - Dàn quân ➔ `Board setup / Board development`
   - Dọn sàn ➔ `Clear the board`
   - Sức mạnh ➔ `Powers`
   - Đánh bằng chỉ số ➔ `Stat-checking / Raw stats`
   - Áp đảo ➔ `Overwhelm`
   - Khiên phép ➔ `SpellShield`
   - Hút máu ➔ `Lifesteal`
   - Bất tử ➔ `Deathless`
3. **Văn phong:** Đầy đủ, không cắt xén, chuẩn Deck Guide chuyên nghiệp.
