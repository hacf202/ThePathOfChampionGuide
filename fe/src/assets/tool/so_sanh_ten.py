import json

def tim_ten_khong_trung_lap(duong_dan_tep_mot, duong_dan_tep_hai):
    """
    Hàm này đọc dữ liệu từ hai tệp JSON, so sánh danh sách các tên
    và trả về những tên không bị trùng lặp giữa hai tệp.

    Tham số:
    duong_dan_tep_mot (str): Đường dẫn đến tệp JSON thứ nhất.
    duong_dan_tep_hai (str): Đường dẫn đến tệp JSON thứ hai.

    Trả về:
    list: Một danh sách chứa các tên không bị trùng lặp.
    """
    try:
        # Mở và đọc nội dung từ tệp JSON thứ nhất.
        with open(duong_dan_tep_mot, 'r', encoding='utf-8') as tep_mot:
            du_lieu_mot = json.load(tep_mot)

        # Mở và đọc nội dung từ tệp JSON thứ hai.
        with open(duong_dan_tep_hai, 'r', encoding='utf-8') as tep_hai:
            du_lieu_hai = json.load(tep_hai)

        # Trích xuất tất cả các giá trị của khóa 'name' từ cả hai tệp
        # và đưa chúng vào cấu trúc dữ liệu Set để xử lý hiệu quả.
        # Set trong Python được tối ưu cho các phép toán tập hợp.
        tap_hop_ten_mot = {doi_tuong['name'] for doi_tuong in du_lieu_mot}
        tap_hop_ten_hai = {doi_tuong['name'] for doi_tuong in du_lieu_hai}

        # Sử dụng toán tử XOR (^) để tìm phép hiệu đối xứng (symmetric difference),
        # tức là tìm các phần tử chỉ có ở một trong hai tập hợp.
        ten_khong_trung = tap_hop_ten_mot.symmetric_difference(tap_hop_ten_hai)

        # Chuyển đổi kết quả từ Set trở lại thành List.
        return list(ten_khong_trung)

    except FileNotFoundError as loi:
        # Xử lý trường hợp không tìm thấy tệp.
        print(f"Lỗi: Không tìm thấy tệp. Vui lòng kiểm tra lại đường dẫn: {loi}")
        return []
    except json.JSONDecodeError:
        # Xử lý trường hợp tệp không phải là định dạng JSON hợp lệ.
        print("Lỗi: Tệp không chứa dữ liệu JSON hợp lệ.")
        return []
    except KeyError:
        # Xử lý trường hợp một đối tượng trong JSON không có khóa 'name'.
        print("Lỗi: Một số đối tượng trong tệp JSON không có thuộc tính 'name'.")
        return []

# --- Ví dụ cách sử dụng ---
# Thay thế 'relics-vi_vn.json' và 'relics-vi_vn_new.json' bằng
# đường dẫn chính xác đến hai tệp dữ liệu của bạn.

# duong_dan_file_1 = 'items-vi_vn.json'
# duong_dan_file_2 = 'items-vi_vn1.json' 

duong_dan_file_1 = 'items-vi_vn.json'
duong_dan_file_2 = 'items1-vi_vn.json' 

# duong_dan_file_1 = 'relics-vi_vn.json'
# duong_dan_file_2 = 'relics-vi_vn1.json' 

danh_sach_ten = tim_ten_khong_trung_lap(duong_dan_file_1, duong_dan_file_2)

# In kết quả ra màn hình.
if danh_sach_ten:
    print("Danh sách các tên không bị trùng lặp giữa hai tệp là:")
    for ten in danh_sach_ten:
        print(f"- {ten}")
else:
    print("Không tìm thấy tên nào không trùng lặp hoặc đã có lỗi xảy ra.")