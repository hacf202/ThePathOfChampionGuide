import json

# 1. Đọc dữ liệu từ 2 file
with open('only_in_file2.json', 'r', encoding='utf-8') as f:
    file1_data = json.load(f)

with open('powers-en_us.json', 'r', encoding='utf-8') as f:
    file2_data = json.load(f)

# 2. Tạo một từ điển (dictionary) để tra cứu nhanh dữ liệu tiếng Anh bằng powerCode
# Kỹ thuật này giúp tối ưu hóa: thay vì dùng vòng lặp lồng nhau (O(N*M)), 
# việc tạo bảng băm này giúp thời gian tra cứu giảm xuống chỉ còn O(N+M).
en_powers = {item['powerCode']: item for item in file2_data if 'powerCode' in item}

merged_data = []

# 3. Duyệt qua từng sức mạnh (power) trong file tiếng Việt (file 1)
for item1 in file1_data:
    power_code = item1.get('powerCode')
    if not power_code:
        continue
        
    # 4. Xử lý độ hiếm tiếng Việt: Viết hoa chữ cái đầu mỗi từ (Title Case)
    # Ví dụ: "SỬ THI" -> Tách thành ["SỬ", "THI"] -> Capitalize thành ["Sử", "Thi"] -> Ghép lại thành "Sử Thi"
    rarity_vi = item1.get('rarity', '')
    if rarity_vi:
        rarity_vi = ' '.join(word.capitalize() for word in rarity_vi.split())
    
    # 5. Lấy dữ liệu tiếng Anh tương ứng từ Dictionary đã tạo ở bước 2
    item2 = en_powers.get(power_code)
    
    translations = {}
    if item2:
        # Xử lý độ hiếm tiếng Anh tương tự như tiếng Việt để đảm bảo format "Epic", "Common", "Legendary"
        rarity_en = item2.get('rarity', '')
        if rarity_en:
            rarity_en = ' '.join(word.capitalize() for word in rarity_en.split())
        
        # Đóng gói đối tượng translations
        translations = {
            "en": {
                "name": item2.get('name', ''),
                "description": item2.get('descriptionRaw', ''),
                "rarity": rarity_en
            }
        }
        
    # 6. Tạo cấu trúc đối tượng (object) mới theo đúng format yêu cầu
    merged_item = {
        "powerCode": power_code,
        "rarity": rarity_vi,
        "name": item1.get('name', ''),
        "type": [], # Khởi tạo mặc định là mảng rỗng
        "description": item1.get('descriptionRaw', ''),
        "assetFullAbsolutePath": item1.get('assetFullAbsolutePath', ''),
        "assetAbsolutePath": item1.get('assetAbsolutePath', ''),
        "translations": translations
    }
    
    # Thêm đối tượng hoàn chỉnh vào danh sách
    merged_data.append(merged_item)

# 7. Xuất toàn bộ dữ liệu ra file JSON mới
output_filename = 'converted_powers.json'
with open(output_filename, 'w', encoding='utf-8') as f:
    # Tham số ensure_ascii=False đảm bảo các ký tự tiếng Việt có dấu được giữ nguyên thay vì bị mã hóa thành Unicode.
    json.dump(merged_data, f, ensure_ascii=False, indent=4)

print(f"Gộp thành công {len(merged_data)} powers. Đã lưu vào {output_filename}")