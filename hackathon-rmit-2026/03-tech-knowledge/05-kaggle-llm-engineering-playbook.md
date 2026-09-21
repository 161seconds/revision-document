# Chuyên Đề 5: Cẩm Nang Thực Chiến Kaggle: Tối Ưu VRAM, Offline & Chống Trượt Submission
> Tài liệu kỹ thuật nâng cao phục vụ RMIT Hackathon 2026 (Track: Security × GenAI × Low-Resource Languages)

---

## 1. Công Thức Tính Bộ Nhớ GPU (VRAM Math) Cho Leader

Trước khi tải bất kỳ mô hình nào, Leader phải tính toán được mô hình đó có vừa với **GPU Nvidia T4 (16 GB VRAM)** của Kaggle hay không:

$$\text{VRAM Yêu Cầu} \approx (\text{Số Tỷ Tham Số} \times \text{Bytes / Tham Số}) + \text{KV Cache} + \text{Activation Memory} + \text{CUDA Overhead}$$

### Bảng Ước Tính VRAM Thực Tế:

| Mô Hình | Định Dạng (Precision) | Bytes / Param | Dung Lượng Trọng Số | VRAM Tổng Cần Thiết | Chạy Được Trên Kaggle T4 (16GB)? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Qwen 2.5 7B** | FP16 (16-bit) | 2 bytes | ~14 GB | ~15.5 - 16.5 GB | ⚠️ **Cực kỳ nguy hiểm (Dễ OOM)** |
| **Qwen 2.5 7B** | **4-bit (NF4)** | **0.5 bytes** | **~4.2 GB** | **~5.5 - 6.5 GB** |  **Hoàn hảo! Dư 10GB cho RAG** |
| **Qwen 2.5 14B** | **4-bit (NF4)** | **0.5 bytes** | **~8.5 GB** | **~11 - 12.5 GB** |  **Vừa vặn (Phù hợp pipeline ít RAG)** |
| **Gemma 2 9B** | **4-bit (NF4)** | **0.5 bytes** | **~5.5 GB** | **~7.5 - 8.5 GB** |  **Rất mượt mà** |
| **BGE-M3** | FP16 | 2 bytes | ~2.2 GB | ~3.0 GB |  **Có thể chạy chung với model 7B 4-bit** |

---

## 2. Kỹ Thuật Load Model 4-bit Bằng BitsAndBytes Chuẩn Xác

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

def load_quantized_model_offline(model_dir: str):
    """
    Nạp mô hình 7B ở định dạng 4-bit NF4 hoàn toàn Offline trên Kaggle.
    """
    # Cấu hình lượng tử hóa 4-bit tối ưu
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",               # Chuẩn NF4 cho chất lượng tốt nhất
        bnb_4bit_compute_dtype=torch.bfloat16,   # Tính toán bằng bfloat16 để tăng tốc
        bnb_4bit_use_double_quant=True           # Lượng tử hóa kép tiết kiệm thêm ~0.4GB VRAM
    )

    tokenizer = AutoTokenizer.from_pretrained(model_dir, local_files_only=True)
    model = AutoModelForCausalLM.from_pretrained(
        model_dir,
        quantization_config=bnb_config,
        device_map="auto",                       # Tự động phân bổ vào GPU
        local_files_only=True,                   # Bắt buộc khi chạy Offline
        torch_dtype=torch.bfloat16
    )
    
    return model, tokenizer
```

---

## 3. Quản Lý Rác & Bộ Nhớ VRAM Tránh Crash Giữa Chừng

Kaggle sẽ dừng toàn bộ phiên làm việc nếu bộ nhớ GPU vượt quá 16,384 MB dù chỉ 1 MB.  
**Quy tắc bất di bất dịch**: Luôn giải phóng bộ nhớ sau mỗi vòng lặp hoặc giữa các task:

```python
import gc
import torch

def flush_gpu_memory():
    """Gọi hàm này sau khi chạy xong một Task lớn hoặc sau mỗi batch inference"""
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.ipc_collect()
```

---

## 4. Checklist Sống Còn Chống "Submission Failed" (0 Điểm)

Trước khi bấm nút **"Submit to Competition"**, Leader bắt buộc phải kiểm tra 6 tiêu chí:

* [ ] **1. Tắt thử mạng (Disable Internet Test)**: Trong giao diện Notebook Kaggle, gạt switch `Internet: Off` rồi bấm `Run All` từ đầu đến cuối. Nếu có bất kỳ lỗi nạp thư viện hay model nào, sửa ngay!
* [ ] **2. Kiểm tra tên cột và số lượng dòng file nộp**:
  ```python
  import pandas as pd
  sub = pd.read_csv("submission.csv")
  test = pd.read_csv("/kaggle/input/.../test.csv")
  assert len(sub) == len(test), "Lỗi: Số dòng file nộp không khớp với file test!"
  assert not sub.isnull().values.any(), "Lỗi: File nộp có chứa giá trị NaN/None!"
  ```
* [ ] **3. Bọc toàn bộ inference bằng `try...except` an toàn**:
  ```python
  for idx, row in test_df.iterrows():
      try:
          prediction = run_pipeline(row["query"])
      except Exception as e:
          # Không bao giờ để script crash!
          prediction = "INSUFFICIENT_CONTEXT"
      results.append(prediction)
  ```
* [ ] **4. Giới hạn thời gian (Timeout Safety)**: Đảm bảo thời gian xử lý trung bình mỗi câu hỏi nhân với tổng số câu hỏi test không vượt quá **50% thời gian tối đa cho phép của Kaggle** (thường tối đa là 2 - 9 tiếng tùy cuộc thi).
