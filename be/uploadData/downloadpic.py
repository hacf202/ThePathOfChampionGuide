import json
import os
import requests
from urllib.parse import urlparse

# Cấu hình
JSON_FILE = 'guidePocChampionList.json' # Tên file JSON nguồn
BASE_OUTPUT_FOLDER = 'champion_assets'  # Thư mục gốc để lưu trữ

def download_image(url, folder_name, champion_name):
    if not url:
        return
    
    # Tạo đường dẫn thư mục: champion_assets/[tên_loại_ảnh]
    target_folder = os.path.join(BASE_OUTPUT_FOLDER, folder_name)
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)
    
    # Lấy phần mở rộng của file (ví dụ: .png, .jpg)
    ext = os.path.splitext(urlparse(url).path)[1]
    if not ext:
        ext = ".png" # Mặc định nếu không tìm thấy đuôi file

    # Đổi tên file thành [Tên_Tướng][Đuôi_file] để dễ nhận diện trong thư mục chung
    filename = f"{champion_name.replace(' ', '_')}{ext}"
    file_path = os.path.join(target_folder, filename)

    # Kiểm tra nếu file đã tồn tại
    if os.path.exists(file_path):
        print(f"[-] Bỏ qua (đã tồn tại): {folder_name}/{filename}")
        return

    try:
        response = requests.get(url, stream=True, timeout=10)
        if response.status_code == 200:
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            print(f"[+] Đã tải: {folder_name}/{filename}")
        else:
            print(f"[!] Lỗi {response.status_code} tại URL: {url}")
    except Exception as e:
        print(f"[x] Thất bại khi tải {filename}: {e}")

def main():
    if not os.path.exists(JSON_FILE):
        print(f"Lỗi: Không tìm thấy file {JSON_FILE} trong thư mục hiện tại.")
        return

    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            print("Lỗi: File JSON không đúng định dạng.")
            return

    print(f"--- Bắt đầu quy trình tải ảnh vào 3 thư mục chính ---")

    for champ in data:
        name = champ.get('name', 'Unknown')
        assets = champ.get('assets', [])
        
        for asset in assets:
            # Tải vào thư mục fullAbsolutePath
            download_image(asset.get('fullAbsolutePath'), 'fullAbsolutePath', name)
            
            # Tải vào thư mục gameAbsolutePath
            download_image(asset.get('gameAbsolutePath'), 'gameAbsolutePath', name)
            
            # Tải vào thư mục avatar
            download_image(asset.get('avatar'), 'avatar', name)

    print(f"\n--- Hoàn tất! Ảnh được lưu tại thư mục: {BASE_OUTPUT_FOLDER} ---")

if __name__ == "__main__":
    main()