# LUẬT VÀ PHƯƠNG PHÁP LÀM VIỆC CỦA AI VỚI DỰ ÁN NÀY

Đây là file bộ quy tắc ứng xử duy nhất cho AI (SSOT - Single Source of Truth). Bất cứ lúc nào AI vận hành dự án này, hãy tuân theo các chỉ mục sau:

## 0. Quy tắc cốt lõi (Core Rule)
- **BẮT BUỘC ĐỌC SƠ ĐỒ DỰ ÁN**: Trước khi thực hiện bất kỳ thay đổi nào liên quan đến cấu trúc, logic hoặc thêm tính năng mới, AI **phải đọc file [project.nde](file:///d:/ThePathOfChampionGuide/project.nde)** để hiểu rõ mối quan hệ giữa các component, route và dữ liệu của hệ thống.

## 1. Tiêu chí tối cao (Delivery Standards)
- **Ưu tiên Độ chính xác hơn Tốc độ (Accuracy > Speed)**: Thà chậm mà chắc. Làm việc tỉ mỉ, kiểm tra kỹ lưỡng các thay đổi trước khi báo cáo kết quả.
- **Tự động kết luận và Hành động (Auto-conclude & Apply)**: Được phép tự động kết luận lỗi và sửa đổi hệ thống cho những công việc nằm trong phạm vi hiểu biết, **tuy nhiên bắt buộc phải ghi lại những thay đổi chính vào file .md** (ví dụ `walkthrough.md` hoặc `today.md`) để dễ dàng theo vết (tracking).
- **Tuyệt đối không đoán mò**: Không sử dụng các cụm từ như "có vẻ đúng", "chắc là được".
- **Hỏi lại khi không chắc chắn (Ask instead of guess)**: Bất cứ khi nào không chắc chắn về cấu trúc, hoặc không hiểu rõ ý định của user, **bắt buộc phải dừng lại và đặt câu hỏi** trước khi viết code.

### 1.1. Quy trình Lập kế hoạch (Planning Process)
Với mọi yêu cầu (trừ sửa lỗi cú pháp đơn giản), AI **bắt buộc** thực hiện theo các bước:
1. **Nghiên cứu (Research)**: Tìm hiểu kỹ mã nguồn và sơ đồ `project.nde`.
2. **Lập Kế hoạch (Plan)**: Tạo file `implementation_plan.md` mô tả từng bước thực hiện.
3. **Phê duyệt (Approval)**: Đợi người dùng phản hồi và chấp thuận kế hoạch.
4. **Thực thi (Execute)**: Chỉ thực hiện sau khi có sự đồng ý.
5. **Cập nhật Sơ đồ (Update NDE)**: Mọi thay đổi liên quan đến quan hệ, cấu trúc, logic đều phải cập nhật lại vào `project.nde`.

## 2. Quy tắc Hệ thống (Architecture Guidelines)
1. **Frontend**: Xử lý dựa trên React.js logic hiện có.
2. **Ngôn ngữ (i18n)**: Mọi text hiển thị trên UI đều phải mapping qua `locales/vi.json` và `en.json`. KHÔNG hardcode văn bản trong mọi tình huống.
3. **Cập nhật sơ đồ (BẮT BUỘC)**: Mọi thay đổi liên quan đến mối quan hệ giữa các component, logic xử lý, routing hoặc cấu trúc dữ liệu **phải được cập nhật ngay lập tức** vào file [project.nde](file:///d:/ThePathOfChampionGuide/project.nde) trước khi báo cáo hoàn thành.

## 3. Quy tắc Bộ nhớ và Tri thức (Memory & Knowledge)
- **today.md / task.md**: Ghi lại công việc, lỗi nhỏ và đặc biệt là **những thay đổi chính** sau mỗi lần tự động kết luận/sửa code.
- **walkthrough.md**: Tổng hợp các thay đổi đã hoàn thành để báo cáo cho người dùng.
- **projects.md / goals.md**: Nơi lưu trữ tầm nhìn dài hạn.
- **Ghi nhận tri thức mới**: Bắt buộc **phải ghi nhận những tri thức mới** (logic mới, cấu trúc dữ liệu mới, component mới phức tạp) vào tài liệu dự án mỗi khi có tính năng/chức năng quan trọng được sinh ra. 
- **active-tasks.json**: Cập nhật tiến độ liên tục khi bắt đầu và hoàn thành 1 task.

## 4. Ranh giới vận hành (Boundaries)
- **Được phép thực thi và tự kết luận**: Sửa lỗi cú pháp, chỉnh i18n, cập nhật tính năng theo định hướng đã thống nhất (phải ghi log vào `.md`).
- **Bắt buộc hỏi lại (Human Review)**: Khi không hiểu rõ yêu cầu, khi thay đổi core database, cài thêm thư viện lớn, hoặc đụng chạm đến core architecture.
