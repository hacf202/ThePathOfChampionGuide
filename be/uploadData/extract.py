import json
import os

def find_unique_in_second_file(file1_path, file2_path, target_attribute, output_file):
    # 1. Tạo tập hợp chứa các giá trị từ File 1
    file1_values = set()
    
    # Đọc File 1 và lưu các giá trị tham chiếu
    if os.path.exists(file1_path):
        print(f"🔄 Đang đọc file tham chiếu: '{file1_path}'...")
        with open(file1_path, 'r', encoding='utf-8') as f1:
            data1 = json.load(f1)
            if isinstance(data1, list):
                for item in data1:
                    if isinstance(item, dict) and target_attribute in item:
                        val = item[target_attribute]
                        if val:
                            file1_values.add(val)
    else:
        print(f"❌ Không tìm thấy File 1: '{file1_path}'")
        return

    # 2. Đọc File 2 và lọc ra các đối tượng KHÔNG CÓ trong File 1
    unique_objects = []
    
    if os.path.exists(file2_path):
        print(f"🔄 Đang đối chiếu với file: '{file2_path}'...")
        with open(file2_path, 'r', encoding='utf-8') as f2:
            data2 = json.load(f2)
            if isinstance(data2, list):
                for item in data2:
                    if isinstance(item, dict) and target_attribute in item:
                        val = item[target_attribute]
                        # Điều kiện sống còn: Giá trị này không được nằm trong File 1
                        if val and val not in file1_values:
                            unique_objects.append(item)
    else:
        print(f"❌ Không tìm thấy File 2: '{file2_path}'")
        return

    # 3. Sắp xếp và lưu kết quả
    unique_objects.sort(key=lambda x: x[target_attribute])
    
    try:
        with open(output_file, 'w', encoding='utf-8') as out_file:
            json.dump(unique_objects, out_file, ensure_ascii=False, indent=4)
            
        print("\n" + "="*50)
        print(f"✅ Đã tìm thấy {len(unique_objects)} đối tượng CHỈ CÓ ở File 2 (không có ở File 1).")
        print(f"📁 Dữ liệu đầy đủ đã được lưu vào: {output_file}")
        print("="*50)
    except Exception as e:
        print(f"❌ Lỗi khi lưu file: {e}")

# ==========================================
# CẤU HÌNH SCRIPT
# ==========================================
if __name__ == "__main__":
    FILE_1 = 'relics-en_us.json' # File gốc (tham chiếu)
    FILE_2 = 'relics-vi_vn.json' # File cần tìm đối tượng mới
    THUOC_TINH = 'relicCode'
    FILE_XUAT = 'relics2.json'
    
    find_unique_in_second_file(FILE_1, FILE_2, THUOC_TINH, FILE_XUAT)