"""
kaggle_offline_setup.py - Hướng dẫn & Script chuẩn bị môi trường Kaggle Offline
Dành cho Leader quản lý môi trường thi đấu RMIT Hackathon 2026.

MỤC TIÊU:
1. Tải sẵn các thư viện (.whl) về máy để upload lên Kaggle Dataset.
2. Tải trọng số mô hình (weights) từ HuggingFace về để nạp offline khi thi.
"""

import os
import subprocess
import sys

# Danh sách các thư viện cốt lõi cần tải sẵn
REQUIRED_PACKAGES = [
    "transformers",
    "accelerate",
    "bitsandbytes",
    "sentencepiece",
    "tokenizers",
    "faiss-cpu",        # hoặc faiss-gpu nếu môi trường hỗ trợ
    "rank_bm25",        # Hybrid search
    "pyvi",             # Tiền xử lý tiếng Việt
    "underthesea",      # Tiền xử lý tiếng Việt chuyên sâu
]

def download_wheels(output_dir="./offline_wheels"):
    """
    Tải toàn bộ file .whl về thư mục nội bộ.
    Sau khi chạy xong, nén thư mục này và upload lên Kaggle làm Private Dataset.
    """
    os.makedirs(output_dir, exist_ok=True)
    print(f"[*] Bắt đầu tải các file wheels vào: {output_dir}")
    
    cmd = [
        sys.executable, "-m", "pip", "download",
        *REQUIRED_PACKAGES,
        "-d", output_dir
    ]
    subprocess.run(cmd, check=True)
    print(f"[+] Đã tải xong wheels! Hãy nén '{output_dir}' và tạo Kaggle Dataset.")

def install_offline_in_kaggle(wheels_path="/kaggle/input/my-offline-wheels"):
    """
    Hàm này được chạy ở đầu Notebook Kaggle khi bắt đầu thi.
    Giúp cài đặt thư viện mà KHÔNG CẦN KẾT NỐI INTERNET.
    """
    code_cell = f"""
    # CHẠY TRÊN KAGGLE NOTEBOOK (CELL ĐẦU TIÊN)
    !pip install --no-index --find-links={wheels_path} transformers accelerate bitsandbytes faiss-cpu rank_bm25 pyvi
    """
    print("Mã nguồn để chạy trên Kaggle:")
    print(code_cell)

if __name__ == "__main__":
    print("=== CHUẨN BỊ MÔI TRƯỜNG KAGGLE OFFLINE CHO RMIT HACKATHON 2026 ===")
    print("1. Chạy hàm download_wheels() trên máy cá nhân trước ngày thi.")
    print("2. Tải model Qwen/Qwen2.5-7B-Instruct hoặc BAAI/bge-m3 về và đưa vào Kaggle Dataset.")
    print("3. Tham khảo mã lệnh trong install_offline_in_kaggle().")
