# SỔ TAY CẤP CỨU SỰ CỐ KHẨN CẤP (EMERGENCY RUNBOOK)
> **Dành riêng cho Leader và Đội thi RMIT Hackathon 2026**  
> Mở file này ngay lập tức khi hệ thống gặp sự cố trong 14 tiếng thi đấu!

---

## 1. SỰ CỐ 1: BÁO LỖI "CUDA OUT OF MEMORY" (TRÀN BỘ NHỚ GPU)

### Dấu hiệu:
Đang chạy notebook thì màn hình đỏ rực dòng chữ: `RuntimeError: CUDA out of memory. Tried to allocate X.XX GiB...`

### Quy trình cấp cứu 3 bước trong 2 phút:
1. **Bước 1: Giảm Batch Size & Giới Hạn Max New Tokens**
   * Đặt `batch_size = 1` (xử lý từng câu một).
   * Giảm `max_new_tokens = 150` (chỉ cho phép mô hình sinh câu trả lời ngắn gọn, vừa đủ ý).
2. **Bước 2: Cưỡng chế giải phóng rác trong GPU**
   Chèn ngay đoạn mã này trước vòng lặp:
   ```python
   import gc
   import torch
   gc.collect()
   torch.cuda.empty_cache()
   torch.cuda.ipc_collect()
   ```
3. **Bước 3: Kích hoạt Lượng tử hóa 4-bit kép (Double Quantization)**
   Nếu vẫn OOM, đảm bảo mô hình đã được nạp ở chế độ `load_in_4bit=True` với `bnb_4bit_use_double_quant=True`:
   ```python
   # Tiết kiệm thêm 400MB - 600MB VRAM
   bnb_config = BitsAndBytesConfig(
       load_in_4bit=True,
       bnb_4bit_quant_type="nf4",
       bnb_4bit_use_double_quant=True,
       bnb_4bit_compute_dtype=torch.bfloat16
   )
   ```

---

## 2. SỰ CỐ 2: KAGGLE BÁO "NOTEBOOK THREW EXCEPTION" (SUBMISSION FAILED)

### Dấu hiệu:
Nộp bài xong chờ 10 phút thì Kaggle báo trạng thái màu đỏ `Submission Failed` hoặc `Notebook Threw Exception` nhưng không hiện log chi tiết.

### Nguyên nhân & Cách khắc phục:
1. **Nguyên nhân 1: Code có lệnh cần kết nối Internet khi Kaggle ngắt mạng**
   * *Kiểm tra*: Có dòng nào gọi `pip install` từ internet, hoặc gọi `from_pretrained("huggingface_hub/...")` mà không có `local_files_only=True` không?
   * *Khắc phục*: Thêm `local_files_only=True` vào tất cả các hàm load model/tokenizer.
2. **Nguyên nhân 2: File `test.csv` thật có chứa dòng dữ liệu đặc biệt (giá trị rỗng `NaN`, chuỗi rỗng, hoặc ký tự lạ)**
   * *Khắc phục*: Bọc toàn bộ code xử lý từng dòng trong khối `try...except` và trả về kết quả an toàn mặc định:
   ```python
   try:
       res = process_query(row["question"])
   except Exception:
       res = "INSUFFICIENT_CONTEXT"
   ```
3. **Nguyên nhân 3: Tên cột hoặc số dòng của `submission.csv` không khớp**
   * *Khắc phục*: Trước khi ghi file, in ra:
   ```python
   assert len(sub_df) == len(test_df), "Lỗi số dòng không khớp!"
   assert list(sub_df.columns) == ["id", "is_malicious", "retrieved_doc_id", "answer"]
   ```

---

## 3. SỰ CỐ 3: HẾT HẠN MỨC GPU (QUOTA 30H KAGGLE)

### Dấu hiệu:
Kaggle thông báo: `GPU quota exceeded for this week (0 hours remaining)`.

### Chiến thuật ứng phó của Leader:
1. **Luân chuyển tài khoản trong đội**:
   * Mỗi đội có 4 thành viên $\rightarrow$ Có thể kích hoạt tối đa **4 tài khoản Kaggle** (tương đương **120 giờ GPU/tuần**!).
   * Người làm Red Team hoặc Blue Team chỉ test code trên máy cá nhân hoặc CPU.
   * Chỉ duy nhất **Leader** và **RAG Engineer** mới bật GPU trên Kaggle.
2. **Tắt GPU khi đang gõ code (Chỉ bật khi Chạy & Submit)**:
   * Khi đang viết code hoặc sửa hàm: Chọn `Accelerator: None` (CPU) để không bị trừ dù chỉ 1 phút GPU quota.
   * Chỉ chuyển sang `Accelerator: GPU T4 x2` khi đã sẵn sàng chạy toàn bộ pipeline.

---

## 4. SỰ CỐ 4: MÔ HÌNH BỊ "NGÁO" (LẶP TỪ HOẶC TỪ CHỐI 100% CÂU HỎI)

### Dấu hiệu:
Mô hình sinh ra chuỗi ký tự lặp vô tận: `Tôi không biết... Tôi không biết... Tôi không biết...` hoặc câu hỏi nào cũng từ chối trả lời.

### Khắc phục:
1. **Thêm hình phạt lặp từ (Repetition Penalty)** trong hàm `generate()`:
   ```python
   outputs = model.generate(
       inputs.input_ids,
       max_new_tokens=150,
       repetition_penalty=1.2,    # Ngăn chặn việc lặp lại cụm từ cũ
       no_repeat_ngram_size=3,    # Không lặp lại bất kỳ cụm 3 từ nào
       temperature=0.2,           # Giảm nhiệt độ để câu trả lời bớt bay bổng
       top_p=0.9
   )
   ```
2. **Nới lỏng System Prompt**:
   * Nếu model quá nhạy cảm và từ chối cả câu hỏi bình thường, hãy sửa System Prompt thành:
   `"Bạn là trợ lý kỹ thuật tại RMIT. Trả lời trực tiếp và ngắn gọn câu hỏi của người dùng dựa trên thông tin được cấp."` (Bỏ bớt các từ ngữ hăm dọa cấm đoán trong system prompt).

---

## 5. SỰ CỐ 5: THÀNH VIÊN TRONG ĐỘI BỊ "NGỢP", HOẢNG LOẠN HOẶC BẾ TẮC

### Nguyên tắc lãnh đạo của Leader trong 14 tiếng:
1. **Quy tắc 30 phút**: Nếu một thành viên ngồi debug 1 lỗi quá 30 phút mà không tiến triển, Leader bắt buộc phải yêu cầu tạm dừng, đổi sang phương án đơn giản hơn (Fallback Option).
2. **Khen ngợi và giữ bình tĩnh**: Trong hackathon, đội nào giữ được bình tĩnh và nộp được bài hoàn chỉnh thì 80% đã có giải. Đừng để một tính năng phụ làm hỏng toàn bộ pipeline nộp bài!
3. **Ưu tiên cái chạy được trước (Working Prototype First)**: Thà nộp một giải pháp dùng Regex đơn giản mà được 70 điểm, còn hơn cố xây Deep Learning phức tạp nhưng bị lỗi và nhận 0 điểm.
