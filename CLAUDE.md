# LUẬT VÀ PHƯƠNG PHÁP LÀM VIỆC CỦA AI VỚI DỰ ÁN NÀY

Đây là file bộ quy tắc ứng xử duy nhất cho AI (SSOT - Single Source of Truth). Bất cứ lúc nào AI vận hành dự án này, hãy tuân theo các chỉ mục sau:

## 1. Tiêu chí tối cao (Delivery Standards)
- **Ưu tiên Độ chính xác hơn Tốc độ (Accuracy > Speed)**: Thà chậm mà chắc. Làm việc tỉ mỉ, kiểm tra kỹ lưỡng các thay đổi trước khi báo cáo kết quả.
- **Tự động kết luận và Hành động (Auto-conclude & Apply)**: Được phép tự động kết luận lỗi và sửa đổi hệ thống cho những công việc nằm trong phạm vi hiểu biết, **tuy nhiên bắt buộc phải ghi lại những thay đổi chính vào file .md** (ví dụ `today.md` hoặc `walkthrough.md`) để dễ dàng theo vết (tracking).
- **Tuyệt đối không đoán mò**: Không sử dụng các cụm từ như "có vẻ đúng", "chắc là được".
- **Hỏi lại khi không chắc chắn (Ask instead of guess)**: Bất cứ khi nào không chắc chắn về cấu trúc, hoặc không hiểu rõ ý định của user, **bắt buộc phải dừng lại và đặt câu hỏi** trước khi viết code.

## 2. Quy tắc Hệ thống (Architecture Guidelines)
1. **Frontend**: Xử lý dựa trên React.js logic hiện có.
2. **Ngôn ngữ (i18n)**: Mọi text hiển thị trên UI đều phải mapping qua `locales/vi.json` và `en.json`. KHÔNG hardcode văn bản trong mọi tình huống.

## 3. Quy tắc Bộ nhớ và Tri thức (Memory & Knowledge)
- **today.md**: Ghi lại công việc, lỗi nhỏ và đặc biệt là **những thay đổi chính** sau mỗi lần tự động kết luận/sửa code.
- **projects.md / goals.md**: Nơi lưu trữ tầm nhìn dài hạn.
- **Ghi nhận tri thức mới**: Bắt buộc **phải ghi nhận những tri thức mới** (logic mới, cấu trúc dữ liệu mới, component mới phức tạp) vào `projects.md` hoặc các file tài liệu mỗi khi có tính năng/chức năng quan trọng được sinh ra. 
- **active-tasks.json**: Cập nhật tiến độ liên tục khi bắt đầu và hoàn thành 1 task.

## 4. Ranh giới vận hành (Boundaries)
- **Được phép thực thi và tự kết luận**: Sửa lỗi cú pháp, chỉnh i18n, cập nhật tính năng theo định hướng đã thống nhất (phải ghi log vào `.md`).
- **Bắt buộc hỏi lại (Human Review)**: Khi không hiểu rõ yêu cầu, khi thay đổi core database, cài thêm thư viện lớn, hoặc đụng chạm đến core architecture.
