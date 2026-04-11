# DynamoDB Database Schema

> Cập nhật: 2026-04-11 | Region: `us-east-1` | Tổng: 14 bảng, 4.437 bản ghi

---

## Mục lục

1. [guidePocChampionList](#1-guidepocchampionlist)
2. [guidePocChampionConstellation](#2-guidepocchampionConstellation)
3. [guidePocPowers](#3-guidepocpowers)
4. [guidePocRelics](#4-guidepocrelics)
5. [guidePocItems](#5-guidepocitems)
6. [guidePocRunes](#6-guidepocRunes)
7. [guidePocBonusStar](#7-guidepocbonusstar)
8. [guidePocCardList](#8-guidepoccardlist)
9. [guidePocBosses](#9-guidepocbosses)
10. [guidePocAdventureMap](#10-guidepocadventuremap)
11. [guidePocGuideList](#11-guidepocguidelist)
12. [guidePocFavoriteBuilds](#12-guidepocfavoritebuilds)
13. [guidePocPlayStyleRating](#13-guidepocplaystylerating)
14. [guidePocAuditLogs](#14-guidepocauditlogs)

---

## 1. guidePocChampionList

**Mô tả:** Danh sách tất cả Anh Hùng (Champion) trong Path of Champions, bao gồm thông tin build, đánh giá, bộ bài khởi đầu.

**Số bản ghi:** 85

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `championID` | String | ID duy nhất, dạng `C001` → `C084` |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `championID` | String | ID định danh, ví dụ `C001` |
| `name` | String | Tên tiếng Việt của Anh Hùng |
| `cost` | Number | Chi phí năng lượng của lá bài Anh Hùng |
| `maxStar` | Number | Số sao tối đa (thường 3 hoặc 6) |
| `description` | String | Mô tả build (có markup tag `[cd:...]`, `[p:...]`) |
| `descriptionRaw` | String | Mô tả build dạng plain text (chưa markup) |
| `regions` | List\<String\> | Vùng xuất xứ, ví dụ `["Piltover & Zaun"]` |
| `tags` | List\<String\> | Nhãn phân loại tự do |
| `powerStarIds` | List\<String\> | Danh sách ID Sức Mạnh Sao của Anh Hùng, ví dụ `["P0156","P0157","P0158"]` |
| `adventurePowerIds` | List\<String\> | Danh sách ID Sức Mạnh Phiêu Lưu gợi ý |
| `itemIds` | List\<String\> | Danh sách ID Vật Phẩm gợi ý, ví dụ `["I0118","I0068"]` |
| `relicSets` | List\<List\<String\>\> | Các bộ Cổ Vật gợi ý, mỗi bộ gồm 3 relicCode |
| `runeIds` | List\<String\> | Danh sách ID Ngọc gợi ý |
| `startingDeck` | Object | Bộ bài khởi đầu: `{ baseCards: [{cardCode, itemCodes}], referenceCards: [] }` |
| `assets` | List\<Object\> | Hình ảnh: `{ fullAbsolutePath, gameAbsolutePath, avatar }` |
| `videoLink` | String | Link video YouTube hướng dẫn |
| `ratings` | Object | Đánh giá: `{ damage, defense, speed, consistency, synergy, independence, playstyleNote }` (0-10) |
| `translations` | Object | Bản dịch EN: `{ en: { name, description, descriptionRaw, regions } }` |

---

## 2. guidePocChampionConstellation

**Mô tả:** Thông tin Chòm Sao (Constellation/Bonus Star milestones) của từng Anh Hùng — các mốc mở khóa khi đạt số sao nhất định.

**Số bản ghi:** 85

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `constellationID` | String | ID định danh, dạng `C001` (khớp với `championID`) |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `constellationID` | String | ID khớp với championID |
| `championName` | String | Tên Anh Hùng |
| `nodes` | List\<Object\> | Các mốc chòm sao: `{ star, title, description, powerIds, bonuses }` |
| `translations` | Object | Bản dịch EN |

---

## 3. guidePocPowers

**Mô tả:** Danh sách toàn bộ Sức Mạnh (Powers) — bao gồm Star Powers, Adventure Powers, Relic Powers.

**Số bản ghi:** 811

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `powerCode` | String | ID duy nhất, dạng `P0000` |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `powerCode` | String | ID định danh, ví dụ `P0000` |
| `name` | String | Tên tiếng Việt |
| `description` | String | Mô tả hiệu ứng (có markup) |
| `descriptionRaw` | String | Mô tả plain text |
| `rarity` | String | Độ hiếm: `Thường`, `Hiếm`, `Sử Thi`, `Huyền Thoại` |
| `type` | List\<String\> | Phân loại: `["Star Power"]`, `["Relic Power"]`, `["Adventure Power"]` |
| `assetAbsolutePath` | String | URL ảnh icon |
| `assetFullAbsolutePath` | String | URL ảnh đầy đủ |
| `translations` | Object | `{ en: { name, description, descriptionRaw, rarity } }` |

---

## 4. guidePocRelics

**Mô tả:** Danh sách Cổ Vật (Relics) trong PoC.

**Số bản ghi:** 146

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `relicCode` | String | ID duy nhất, dạng `R0000` |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `relicCode` | String | ID định danh, ví dụ `R0000` |
| `name` | String | Tên tiếng Việt |
| `description` | String | Mô tả hiệu ứng (có markup) |
| `descriptionRaw` | String | Mô tả plain text |
| `rarity` | String | Độ hiếm: `Thường`, `Hiếm`, `Sử Thi`, `Huyền Thoại` |
| `type` | String | Phân loại: `"Chung"`, `"Trấn"`, `"Vùng"` |
| `stack` | String | Số lần có thể chồng (stack), thường `"1"` hoặc `"3"` |
| `assetAbsolutePath` | String | URL ảnh icon |
| `assetFullAbsolutePath` | String | URL ảnh đầy đủ |
| `translations` | Object | `{ en: { name, description, descriptionRaw, rarity } }` |

---

## 5. guidePocItems

**Mô tả:** Danh sách Vật Phẩm (Items) trong PoC — trang bị cho bài quân.

**Số bản ghi:** 179

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `itemCode` | String | ID duy nhất, dạng `I0000` |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `itemCode` | String | ID định danh, ví dụ `I0000` |
| `name` | String | Tên tiếng Việt |
| `description` | String | Mô tả hiệu ứng (có markup) |
| `descriptionRaw` | String | Mô tả plain text |
| `rarity` | String | Độ hiếm |
| `assetAbsolutePath` | String | URL ảnh icon |
| `assetFullAbsolutePath` | String | URL ảnh đầy đủ |
| `translations` | Object | `{ en: { name, description, descriptionRaw, rarity } }` |

---

## 6. guidePocRunes

**Mô tả:** Danh sách Ngọc (Runes/Powers dạng ngọc) trong PoC.

**Số bản ghi:** 32

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `runeCode` | String | ID duy nhất, dạng `P0059` (cùng prefix P với Powers) |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `runeCode` | String | ID định danh |
| `name` | String | Tên tiếng Việt |
| `description` | String | Mô tả hiệu ứng (có markup) |
| `descriptionRaw` | String | Mô tả plain text |
| `rarity` | String | Độ hiếm |
| `region` | String | Vùng xuất xứ của ngọc, ví dụ `"Hoa Linh Lục Địa"` |
| `type` | List\<String\> | Phân loại: `["Sức Mạnh", "Ngọc"]` |
| `assetAbsolutePath` | String | URL ảnh icon |
| `assetFullAbsolutePath` | String | URL ảnh đầy đủ |
| `translations` | Object | `{ en: { name, description, descriptionRaw, rarity, region } }` |

---

## 7. guidePocBonusStar

**Mô tả:** Dữ liệu các mốc Sao Thưởng (Bonus Star) cho từng Anh Hùng ở từng level sao.

**Số bản ghi:** 305

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `bonusStarID` | String | ID duy nhất |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `bonusStarID` | String | ID định danh |
| `championID` | String | FK → `guidePocChampionList.championID` |
| `star` | Number | Cấp độ sao |
| `bonuses` | List\<Object\> | Danh sách phần thưởng tại mốc sao này |

---

## 8. guidePocCardList

**Mô tả:** Danh sách toàn bộ lá bài Legends of Runeterra (tất cả set).

**Số bản ghi:** 2.650

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `cardCode` | String | ID lá bài Riot, ví dụ `01DE001`, `06RU026T3` |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `cardCode` | String | ID định danh Riot |
| `cardName` | String | Tên tiếng Việt |
| `cost` | Number | Tiêu hao năng lượng |
| `description` | String | Mô tả hiệu ứng (có markup) |
| `descriptionRaw` | String | Mô tả plain text |
| `gameAbsolutePath` | String | URL ảnh icon lá bài |
| `rarity` | String | Độ hiếm: `Common`, `Rare`, `Epic`, `Champion`, `None` |
| `type` | String | Loại lá: `"Bài quân"`, `"Bài phép"`, `"Địa danh"`, `"Vật phẩm"` |
| `regions` | List\<String\> | Vùng xuất xứ |
| `associatedCardRefs` | List\<String\> | Các lá bài liên quan (token, buff...) |
| `translations` | Object | `{ en: { cardName, description, descriptionRaw, gameAbsolutePath, regions, type } }` |

---

## 9. guidePocBosses

**Mô tả:** Danh sách Boss/Kẻ Thù trong PoC.

**Số bản ghi:** 51

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `bossID` | String | ID duy nhất |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `bossID` | String | ID định danh |
| `name` | String | Tên boss |
| `description` | String | Mô tả/cơ chế boss |
| `difficulty` | String | Độ khó |
| `assets` | Object | Hình ảnh boss |
| `translations` | Object | Bản dịch EN |

---

## 10. guidePocAdventureMap

**Mô tả:** Bản đồ phiêu lưu — cấu trúc các vùng, node, và kết nối giữa các điểm trong PoC.

**Số bản ghi:** 1

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `adventureID` | String | ID bản đồ (hiện chỉ có 1 bản đồ chính) |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `adventureID` | String | ID định danh bản đồ |
| `name` | String | Tên bản đồ |
| `regions` | List\<Object\> | Danh sách vùng trong bản đồ |
| `nodes` | List\<Object\> | Danh sách node (điểm phiêu lưu) |
| `connections` | List\<Object\> | Kết nối giữa các node |

---

## 11. guidePocGuideList

**Mô tả:** Danh sách bài viết hướng dẫn (bài viết wiki/guide) của trang web.

**Số bản ghi:** 3

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `slug` | String | URL slug duy nhất, ví dụ `"relic-guide"` |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `slug` | String | URL slug, dùng làm partition key và route |
| `title` | String | Tiêu đề bài viết |
| `author` | String | Tên tác giả |
| `thumbnail` | String | URL ảnh thumbnail |
| `tags` | List\<String\> | Nhãn phân loại bài viết |
| `views` | Number | Số lượt xem |
| `publishedDate` | String | Ngày đăng `"YYYY-MM-DD"` |
| `updateDate` | String | Ngày cập nhật cuối `"YYYY-MM-DD"` |
| `sections` | List\<Object\> | Nội dung bài viết — mảng các block (xem cấu trúc block bên dưới) |

#### Cấu trúc `sections[].blocks`

| `type` | Mô tả | Các field phụ |
|--------|-------|--------------|
| `paragraph` | Đoạn văn | `text` |
| `list` | Danh sách | `items: string[]` |
| `table` | Bảng dữ liệu | `headers: string[]`, `rows: string[][]`, `relicIds?`, `caption?` |
| `image` | Ảnh | `src`, `alt` |
| `quote` | Trích dẫn | `text`, `author?` |
| `tierlist` | Bảng tier | `tiers: [{label, items}]` |
| `sublist` | Danh sách con có tiêu đề | `title`, `list: [{title, desc, image?}]` |
| `conclusion` | Kết luận | `title`, `text` |

---

## 12. guidePocFavoriteBuilds

**Mô tả:** Lưu trữ các build mà người dùng đã yêu thích (bookmark).

**Số bản ghi:** 38

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `user_sub` | String | Cognito User Sub (UUID) |
| Sort Key | `id` | String | UUID của build được yêu thích |
| GSI | `user_sub-index` | `user_sub` (PK) | Query tất cả build yêu thích của user |
| GSI | `id-index` | `id` (PK) | Query tất cả user đã yêu thích 1 build |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `user_sub` | String | Partition key — Cognito sub của người dùng |
| `id` | String | Sort key — UUID của build |
| `username` | String | Tên hiển thị người dùng |
| `championName` | String | Tên Anh Hùng của build |
| `creatorName` | String | Tên người tạo build gốc |
| `createdAt` | String | ISO timestamp khi người dùng yêu thích |

---

## 13. guidePocPlayStyleRating

**Mô tả:** Đánh giá phong cách chơi (playstyle rating) của từng Anh Hùng theo người dùng.

**Số bản ghi:** 9

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `championID` | String | FK → `guidePocChampionList.championID` |
| Sort Key | `userSub` | String | Cognito User Sub |
| GSI | `ReviewTypeCreatedAtIndex` | `reviewType` (PK), `createdAt` (SK) | Query đánh giá theo loại + thời gian |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `championID` | String | FK → Champion |
| `userSub` | String | Cognito sub của người đánh giá |
| `username` | String | Tên hiển thị |
| `championName` | String | Tên Anh Hùng |
| `championImage` | String | URL ảnh avatar Anh Hùng |
| `reviewType` | String | Loại đánh giá: `"CHAMPION_REVIEW"` |
| `ratings` | Object | `{ damage, defense, speed, consistency, synergy, independence }` (0-10) |
| `comment` | String | Bình luận tự do |
| `createdAt` | String | ISO timestamp khi tạo |
| `updatedAt` | String | ISO timestamp khi cập nhật |

---

## 14. guidePocAuditLogs

**Mô tả:** Lịch sử thay đổi dữ liệu — ghi lại mọi thao tác CREATE/UPDATE/DELETE/ROLLBACK của admin.

**Số bản ghi:** 42

### Keys & Indexes
| Loại | Field | Type | Mô tả |
|------|-------|------|-------|
| Partition Key | `logId` | String | UUID của log entry |
| Sort Key | `timestamp` | String | ISO timestamp |
| GSI | `LogTypeTimestampIndex` | `logType` (PK), `timestamp` (SK) | Query log theo loại |
| GSI | `EntityTypeTimestampIndex` | `entityType` (PK), `timestamp` (SK) | Query log theo loại thực thể |
| GSI | `ActionTimestampIndex` | `action` (PK), `timestamp` (SK) | Query log theo hành động |
| GSI | `UserTimestampIndex` | `userId` (PK), `timestamp` (SK) | Query log theo người thực hiện |

### Thuộc tính

| Field | Type | Mô tả |
|-------|------|-------|
| `logId` | String | UUID — Partition key |
| `timestamp` | String | ISO timestamp — Sort key |
| `action` | String | Hành động: `CREATE`, `UPDATE`, `DELETE`, `ROLLBACK` |
| `logType` | String | Loại log: `LOG` |
| `entityType` | String | Loại thực thể: `champion`, `relic`, `power`, `item`, `rune`, `card`, `guide` |
| `entityId` | String | ID của thực thể bị thay đổi (ví dụ `C076`, `R0000`) |
| `entityName` | String | Tên hiển thị của thực thể |
| `userId` | String | Cognito sub của admin thực hiện |
| `userName` | String | Tên hiển thị của admin |
| `oldData` | String (JSON) | Snapshot dữ liệu trước khi thay đổi (JSON string hoặc null nếu CREATE) |
| `newData` | String (JSON) | Snapshot dữ liệu sau khi thay đổi (JSON string hoặc null nếu DELETE) |

---

## Quan hệ giữa các bảng

```
guidePocChampionList
  ├── powerStarIds      → guidePocPowers.powerCode
  ├── adventurePowerIds → guidePocPowers.powerCode
  ├── itemIds           → guidePocItems.itemCode
  ├── relicSets         → guidePocRelics.relicCode
  ├── runeIds           → guidePocRunes.runeCode
  └── startingDeck.baseCards.cardCode → guidePocCardList.cardCode

guidePocChampionConstellation
  └── constellationID   → guidePocChampionList.championID (1:1)

guidePocBonusStar
  └── championID        → guidePocChampionList.championID (N:1)

guidePocFavoriteBuilds
  └── id                → (build ID trong hệ thống builds)
  └── user_sub          → Cognito User Pool

guidePocPlayStyleRating
  └── championID        → guidePocChampionList.championID

guidePocAuditLogs
  └── entityId          → (ID của bất kỳ bảng nào tuỳ entityType)
  └── userId            → Cognito User Pool
```

---

## Quy ước mã hóa

| Prefix | Bảng | Ví dụ |
|--------|------|-------|
| `C` | Champion | `C001`, `C084` |
| `P` | Power / Rune | `P0000`, `P0059` |
| `R` | Relic | `R0000`, `R0155` |
| `I` | Item | `I0000`, `I0200` |
| `cd:` | Card (markup tag) | `[cd:06RU026\|Aatrox\|icon,img-full]` |
| `k:` | Keyword (markup tag) | `[k:Challenger\|Thách Đấu]` |
| `p:` | Power (markup tag) | `[p:P0158\|Xiềng Xích Địa Ngục\|icon]` |
| `c:` | Champion (markup tag) | `[c:C076\|Aatrox\|icon]` |
| `s:` | Star level (markup tag) | `[s:3]` |
