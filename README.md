# ThePathOfChampionGuide

[![repo size](https://img.shields.io/github/repo-size/hacf202/ThePathOfChampionGuide?style=flat-square)](https://github.com/hacf202/ThePathOfChampionGuide)
[![issues](https://img.shields.io/github/issues/hacf202/ThePathOfChampionGuide?style=flat-square)](https://github.com/hacf202/ThePathOfChampionGuide/issues)
[![license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![contributors](https://img.shields.io/github/contributors/hacf202/ThePathOfChampionGuide?style=flat-square)](https://github.com/hacf202/ThePathOfChampionGuide/graphs/contributors)

Phiên bản: 1.0.0 — Cập nhật: 2025-12-17

## Tổng quan

ThePathOfChampionGuide là kho tài liệu chuyên sâu, thân thiện dành cho người chơi The Path of Champion (hoặc tên trò chơi tương tự). Mục tiêu là tập hợp hướng dẫn từ cơ bản đến nâng cao: build, chiến thuật, cấu hình và tài nguyên tham khảo để người chơi mới nhanh nắm bắt và người chơi kỳ cựu tối ưu hoá lối chơi.

- Ngôn ngữ chính: Tiếng Việt (có thể mở rộng song ngữ)
- Dạng nội dung: hướng dẫn (guides), build mẫu (builds), hình ảnh, video, cấu hình

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng chính](#tính-năng-chính)
- [Ai nên dùng repo này](#ai-nên-dùng-repo-này)
- [Bắt đầu nhanh](#bắt-đầu-nhanh)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Hướng dẫn viết nội dung (template)](#hướng-dẫn-viết-nội-dung-template)
- [Quy trình đóng góp](#quy-trình-đóng-góp)
- [Quy tắc đóng góp / chuẩn commit](#quy-tắc-đóng-góp--chuẩn-commit)
- [License](#license)
- [Lộ trình (Roadmap)](#lộ-trình-roadmap)
- [Liên hệ & Acknowledgements](#liên-hệ--acknowledgements)

## Tính năng chính

- Hệ thống hướng dẫn có cấu trúc: từ Beginner → Intermediate → Advanced
- Thư viện build mẫu có mô tả, ưu/khuyết điểm và cấu hình chi tiết
- Mẹo chiến đấu, phối hợp nhóm và tối ưu hoá tài nguyên
- Mẫu file & template giúp người đóng góp nhanh viết chuẩn
- Quản lý tài nguyên media (ảnh, video) trong thư mục assets

## Ai nên dùng repo này

- Người mới bắt đầu muốn học nhanh cơ chế cơ bản và build chuẩn
- Người chơi trung cấp/một chút nâng cao muốn tối ưu build
- Người đóng góp muốn viết hướng dẫn, dịch thuật hoặc bổ sung media

## Bắt đầu nhanh

1. Clone repo:

   ```bash
   git clone https://github.com/hacf202/ThePathOfChampionGuide.git
   cd ThePathOfChampionGuide
   ```

2. Cài đặt (nếu repo dùng static site generator hoặc công cụ):

   - Node.js / npm (nếu dùng trang tĩnh)
     ```bash
     npm install
     npm run dev     # hoặc npm run start theo cấu hình repository
     ```
   - Hoặc mở file tĩnh bằng một static server:
     ```bash
     npx http-server ./public
     ```

3. Xem nội dung:
   - Mở `guides/` để xem các bài hướng dẫn hiện có.
   - Mở `builds/` để xem ví dụ build mẫu.

## Cấu trúc thư mục (gợi ý)

- /guides/ — Các bài hướng dẫn (Markdown)
- /builds/ — Mẫu build, cấu hình, ví dụ
- /assets/ — Ảnh, biểu đồ, video
- /docs/ — Tài liệu triển khai trang / metadata
- /templates/ — Template bài viết, issue/PR
- README.md — Tệp này
- LICENSE — Giấy phép (nên thêm)

## Hướng dẫn viết nội dung (template)

Mỗi file hướng dẫn nên tuân theo template Markdown có front-matter (nếu dùng SSG). Ví dụ cơ bản:

````md
---
title: "Tên hướng dẫn"
difficulty: "Beginner | Intermediate | Advanced"
author: "tên tác giả"
tags: ["build", "combat", "tips"]
---

# Tên hướng dẫn

## Tổng quan

- Mục tiêu bài viết

## Yêu cầu

- Level:
- Item cần có:

## Build / Cấu hình

```yaml
# ví dụ cấu hình
weapon: "Tên vũ khí"
skills:
  - name: "Skill A"
    level: 5
```
````

## Chiến thuật

- Bước 1: ...
- Bước 2: ...

## Ghi chú / Tham khảo

- Link hoặc tài nguyên

````

Quy trình đóng góp
------------------
Rất hoan nghênh mọi đóng góp. Các bước gợi ý:
1. Fork repository
2. Tạo branch mới:
   ```bash
   git checkout -b feature/ten-tinh-nang
````

3. Thực hiện thay đổi, viết rõ nội dung, thêm ảnh vào `/assets` nếu cần
4. Commit theo chuẩn (xem phần tiếp theo)
5. Push lên fork và tạo Pull Request mô tả rõ: mục tiêu, thay đổi, ảnh chụp (nếu có)

## Quy tắc đóng góp / chuẩn commit

- Commit message chuẩn (conventional commits gợi ý):
  - feat(scope): mô tả ngắn
  - fix(scope): sửa lỗi
  - docs(scope): thay đổi tài liệu
  - chore(scope): công việc vặt
- PR checklist:
  - [ ] Tiêu đề rõ ràng
  - [ ] Mô tả thay đổi + lý do
  - [ ] Không làm ảnh hưởng đến file khác không liên quan
  - [ ] Có ví dụ / ảnh nếu thay đổi giao diện hoặc hướng dẫn

## Issue templates (gợi ý)

- Bug report: mô tả, bước tái hiện, môi trường
- Feature request: mô tả tính năng, lợi ích, ảnh minh họa (nếu có)
  Bạn có thể sao chép mẫu dưới đây khi tạo issue:

```
Tiêu đề: [bug|feature] Tóm tắt ngắn
Mô tả:
Môi trường:
Các bước tái hiện:
Ảnh/Video:
```

## License

Hiện tại repo chưa có file LICENSE. Mặc định README này gợi ý dùng MIT cho code và CC-BY-SA cho nội dung nếu muốn chia sẻ nội dung có điều kiện. Để áp dụng license, thêm file `LICENSE` ở root. Ví dụ tiêu chuẩn: MIT.

## Roadmap (lộ trình)

- [ ] Thêm hệ thống đánh dấu difficulty cho từng guide
- [ ] Trang web tĩnh (Hugo / Jekyll / Docusaurus) để duyệt hướng dẫn
- [ ] Trang build chuyên dụng với bộ lọc (role, difficulty)
- [ ] Hệ thống dịch sang EN và các ngôn ngữ khác

## Liên hệ & Acknowledgements

- Tác giả / Maintainer: hacf202 — https://github.com/hacf202
- Góp ý / lỗi: tạo [Issue trên GitHub](https://github.com/hacf202/ThePathOfChampionGuide/issues)
- Cảm ơn các đóng góp từ cộng đồng — mọi nội dung đều được ghi nhận trong lịch sử commit và contributors graph.

## Một vài lưu ý cuối

- Giữ nội dung ngắn gọn, dễ theo dõi, ưu tiên bullet và ví dụ thực tế.
- Khi thêm ảnh, dùng file tối ưu hóa kích thước và đặt vào `/assets` với đường dẫn tương đối.
- Nếu bạn muốn, tôi có thể:
  - tạo mẫu `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, và templates cho issues/PRs;
  - hoặc mở PR chứa README + các file mẫu (bạn cho phép push hoặc cung cấp quyền).

Cám ơn bạn đã xây dựng ThePathOfChampionGuide — chúc dự án phát triển và thu hút cộng đồng nhiệt huyết!
