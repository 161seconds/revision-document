# Kaggle Offline Debugging & Emergency OOM Recovery Handbook

Sổ tay hướng dẫn khắc phục khẩn cấp các lỗi thảm họa thường gặp trên Kaggle trong 14 tiếng thi đấu On-site. Khi đối mặt với sự cố chỉ còn 30 phút trước hạn chót nộp bài, hãy làm theo chính xác các quy trình xử lý dưới đây.

---

## 1. Lỗi 1: CUDA Out of Memory (CUDA OOM - GPU VRAM Tràn)

### Dấu hiệu nhận biết:
```text
torch.cuda.OutOfMemoryError: CUDA out of memory. Tried to allocate 2.40 GiB (GPU 0; 15.77 GiB total capacity; 13.80 GiB already allocated...)
```

### Quy trình cấp cứu 4 bước:
1. **Thu hồi rác bộ nhớ ngay lập tức:**
   ```python
   import gc
   import torch

   del model, outputs, loss  # Xóa các biến chiếm dụng VRAM
   gc.collect()
   torch.cuda.empty_cache()
   torch.cuda.ipc_collect()
   ```
2. **Giảm Batch Size xuống 1 hoặc 2 kết hợp Gradient Accumulation:**
   ```python
   training_args = TrainingArguments(
       per_device_train_batch_size=1,        # Ép batch size về 1
       gradient_accumulation_steps=16,       # Tích lũy 16 bước để tương đương batch 16
       fp16=True,                            # Bắt buộc bật nửa chính xác
       optim="paged_adamw_8bit"              # Dùng optimizer 8-bit tiết kiệm VRAM
   )
   ```
3. **Giới hạn độ dài chuỗi tối đa (`max_length`):**
   - Giảm `max_length` từ `2048` xuống `512` hoặc `1024`. VRAM tiêu thụ của Self-Attention tăng theo cấp số nhân bậc hai $O(L^2)$ so với độ dài câu!
4. **Bật cơ chế Gradient Checkpointing:**
   ```python
   model.gradient_checkpointing_enable()     # Đánh đổi 20% tốc độ để giảm 60% VRAM!
   ```

---

## 2. Lỗi 2: Kernel Crashed / OOM-Killed (Tràn Bộ Nhớ RAM Máy Chủ 30GB)

### Dấu hiệu nhận biết:
Giao diện Kaggle hiện thông báo màu đỏ: *"Kernel died, please restart"* hoặc tiến trình đột ngột biến mất mà không in ra ngoại lệ Python nào.

### Nguyên nhân:
Đọc tệp dữ liệu lớn bằng Pandas mặc định khiến các cột số bị gán kiểu `float64` và `int64` chiếm gấp 4 lần dung lượng RAM thực tế.

### Khắc phục bằng hàm tối ưu kiểu dữ liệu (Reduce Memory Usage):
```python
import numpy as np
import pandas as pd

def reduce_mem_usage(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.columns:
        col_type = df[col].dtype
        if col_type != object:
            c_min = df[col].min()
            c_max = df[col].max()
            if str(col_type)[:3] == 'int':
                if c_min > np.iinfo(np.int8).min and c_max < np.iinfo(np.int8).max:
                    df[col] = df[col].astype(np.int8)
                elif c_min > np.iinfo(np.int16).min and c_max < np.iinfo(np.int16).max:
                    df[col] = df[col].astype(np.int16)
                elif c_min > np.iinfo(np.int32).min and c_max < np.iinfo(np.int32).max:
                    df[col] = df[col].astype(np.int32)
            else:
                if c_min > np.finfo(np.float32).min and c_max < np.finfo(np.float32).max:
                    df[col] = df[col].astype(np.float32)
    return df
```

---

## 3. Lỗi 3: "Submission Scoring Error" Trên Kaggle

Đây là lỗi đau đớn nhất: Notebook chạy thành công trên máy bạn nhưng hệ thống tự động chấm điểm của Kaggle báo lỗi chấm điểm.

### Bảng Kiểm Tra Định Dạng Nộp Bài (Submission Checklist):
1. **Kiểm tra tệp `submission.csv` có tồn tại ở thư mục gốc `/kaggle/working/` không?**
   ```python
   import os
   assert os.path.exists('/kaggle/working/submission.csv'), "File nộp bài chưa được lưu!"
   ```
2. **Kiểm tra số lượng dòng và tên cột:**
   - Số lượng dòng bắt buộc phải khớp $100\%$ với số dòng của tập `test.csv`.
   - Tên cột phải trùng khớp chính xác từng ký tự chữ hoa/thường: `id,prediction` hoặc `id,label`.
3. **Kiểm tra giá trị rỗng (NaN / Null / Infinite):**
   ```python
   sub = pd.read_csv('/kaggle/working/submission.csv')
   assert sub.isna().sum().sum() == 0, "File nộp bài chứa giá trị NaN!"
   # Vá khẩn cấp nếu có giá trị NaN:
   sub['prediction'] = sub['prediction'].fillna(0.5)
   sub.to_csv('/kaggle/working/submission.csv', index=False)
   ```

---

## 4. Lỗi 4: Đĩa Cứng Đầy ("No space left on device")

Dung lượng đĩa ghi tại `/kaggle/working/` bị giới hạn cứng ở mức **20 GB**. Nếu bạn huấn luyện mô hình qua 5 folds và mỗi fold lưu 1 checkpoint 4GB $\implies$ Sau fold 4 đĩa sẽ bị tràn và notebook bị dừng khẩn cấp!

### Dọn dẹp checkpoint cũ trong vòng lặp huấn luyện:
```python
import shutil

# Sau khi đánh giá xong fold và lưu trọng số tối ưu nhất (best_model.pt):
# Xóa sạch các checkpoint tạm thời của HuggingFace:
checkpoint_dirs = [d for d in os.listdir('/kaggle/working') if d.startswith('checkpoint-')]
for c_dir in checkpoint_dirs:
    shutil.rmtree(os.path.join('/kaggle/working', c_dir), ignore_errors=True)
```
