---
name: champion-guide
description: Workflow chuẩn hóa nhập liệu, phân tích lối chơi, đối soát RuneterraRelics và biên dịch thuật ngữ Riot Games/LoR để điền toàn bộ 10 phân vùng dữ liệu tướng vào Admin Champion Editor (/admin/champions/:id) và MongoDB. Kích hoạt khi người dùng cung cấp mô tả tướng, yêu cầu lên bài hoặc cập nhật guide cho tướng trong The Path of Champions.
---

# Champion Guide Workflow Skill

Skill này chuyên trách việc biến các đoạn ghi chú, bản ghi âm (voice transcript) hoặc tài liệu Markdown mô tả tướng từ người dùng thành dữ liệu chuẩn 100% cho hệ thống **The Path of Champions Guide**.

## 1. Tên Workflow & Cách Kích Hoạt

- **Tên kỹ năng (Skill / Workflow name):** `champion-guide`
- **Cách kích hoạt:**
  1. **Tự động kích hoạt (Context-based):** Bất cứ khi nào người dùng gửi thông tin tướng (chất tướng, lối chơi, các bộ relic, combo, đánh giá...) hoặc nói *"lên bài cho tướng X"*, *"cập nhật dữ liệu tướng Y"*.
  2. **Kích hoạt qua lệnh / tag:** Gõ `/champion-guide` hoặc `@champion-guide` kèm tên/mã tướng.

---

## 2. Quy Trình 5 Giai Đoạn Chuẩn

### Giai đoạn 1: Tiếp nhận dữ liệu người dùng
Bóc tách các thông tin người dùng cung cấp:
- Lối chơi (`playStyle`), Bậc xếp hạng (`tier`), Cấp sao tối ưu (`optimalStars`), Ngưỡng sức mạnh (`powerSpike`).
- Mô tả chi tiết chất tướng (`description`).
- Thứ tự các bước combo (`comboSteps`).
- Mẹo chuyên sâu & khắc chế boss (`proTips`).
- Các bộ cổ vật gợi ý (`relicSets`): Tên bộ, số sao khuyên dùng, 3 relics, phân tích vận hành.
- Điểm đánh giá (`ratings`): Sát thương, phòng thủ, phối hợp, độ khó (thang 1-10) và nhận định.

### Giai đoạn 2: Đối soát & Làm giàu dữ liệu (Zero Hallucination)
- Tra cứu mã thật từ Database nội bộ:
  - `guidePocRelics` ➔ Lấy `relicCode` (`Rxxxx`).
  - `guidePocPowers` ➔ Lấy `powerCode` (`Pxxxx`).
  - `guidePocItems` ➔ Lấy `itemCode` (`Ixxxx`).
  - `guidePocCardList` ➔ Lấy `cardCode`.
- Đối chiếu cơ chế với `https://runeterrarelics.com/champions/<slug>`.
- **Nếu thiếu thông tin:** Dừng lại hỏi người dùng, tuyệt đối không tự bịa đặt dữ liệu.

### Giai đoạn 3: Bọc thẻ Tag hệ thống (VI)
Áp dụng thẻ markup: `[r:Rxxxx|Tên|icon]`, `[cd:CardCode|Tên|icon]`, `[k:Keyword|Tên|icon]`, `[i:Ixxxx|Tên|icon]`, `[p:Pxxxx|Tên|icon]`.

### Giai đoạn 4: Biên dịch Tiếng Anh Chuẩn LoR (EN)
- **Cấu trúc thẻ:** Giữ nguyên 100% ngoặc vuông và mã code, chỉ dịch tên hiển thị ở giữa.
- **Từ điển bắt buộc:**
  - Lắp trang bị ➔ `Equip / Play an Equipment`
  - Đang mang trang bị ➔ `Equipped`
  - Ra đòn ➔ `Strike` *(CẤM dùng Attack nếu ý là Strike)*
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
  - Áp đảo ➔ `Overwhelm` | Khiên phép ➔ `SpellShield` | Hút máu ➔ `Lifesteal` | Bất tử ➔ `Deathless`
- Dịch trọn vẹn, không tóm tắt, phong cách Deck Guide chuyên nghiệp.

### Giai đoạn 5: Trình bày Proposal & Ghi CSDL
- Trình bày bảng đối chiếu song ngữ (VI & EN) kèm JSON payload.
- Chờ người dùng phê duyệt (Approve).
- Khi được duyệt: Chạy hàm `updateChampionGuideData(championID, payload)` từ `be/scripts/updateChampionGuide.js` để cập nhật trực tiếp vào MongoDB và xóa cache.
