# Cheat Sheet Kỹ Thuật: Thuật Ngữ & Khái Niệm Sống Còn Cho Leader
> Bản tóm tắt nhanh giúp Leader tự tin trao đổi kỹ thuật với cả đội và ban giám khảo.

---

## 1. Bản Đồ Thuật Ngữ Cốt Lõi (Core Concepts)

| Thuật ngữ | Định nghĩa dễ hiểu | Ứng dụng trong cuộc thi |
| :--- | :--- | :--- |
| **Prompt Injection** | Người dùng gửi câu lệnh nhằm ghi đè (override) hoặc vô hiệu hóa chỉ dẫn ban đầu của hệ thống. | Task 1 (tấn công) & Task 2 (phòng thủ). |
| **Jailbreak** | Kỹ thuật dùng mẹo tâm lý (nhập vai, giả định học thuật) để ép LLM phá vỡ rào cản an toàn (safety filter). | Tạo payload bẻ khóa ở Task 1. |
| **Code-Switching** | Trộn lẫn hai hoặc nhiều ngôn ngữ trong cùng một câu nói (ví dụ: tiếng Việt pha tiếng Anh kỹ thuật). | Điểm mù của các bộ lọc an toàn phương Tây. |
| **Subword Tokenization** | Cách LLM chia nhỏ từ vựng thành các mảnh (tokens). Tiếng hiếm bị chia rất nhỏ làm suy giảm chất lượng. | Khắc phục bằng mô hình đa ngôn ngữ tốt như `Qwen 2.5`. |
| **RAG (Retrieval-Augmented Generation)** | Kỹ thuật tìm kiếm tài liệu liên quan trước rồi mới đưa vào prompt cho LLM trả lời. | Xương sống của Task 3 và Task 4. |
| **Hallucination (Ảo giác)** | Hiện tượng LLM tự bịa ra thông tin sai sự thật nhưng với giọng điệu rất tự tin. | Điểm trừ cực nặng trong Task 3. |
| **Quantization (Lượng tử hóa)** | Nén trọng số mô hình từ FP16 (16-bit) xuống 4-bit (NF4) để tiết kiệm 70% VRAM GPU. | Cho phép chạy model 7B/14B trên GPU T4 16GB. |
| **ASR (Attack Success Rate)** | Tỷ lệ phần trăm các prompt tấn công bẻ khóa thành công hệ thống. | Thước đo chấm điểm chính của Task 1. |

---

## 2. Các Dòng Lệnh Python & PyTorch Thường Dùng Nhất

```python
# 1. Giải phóng bộ nhớ GPU để tránh CUDA OOM (Out-of-Memory)
import gc
import torch

gc.collect()
torch.cuda.empty_cache()

# 2. Nạp model 7B ở chế độ 4-bit siêu tiết kiệm VRAM
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16
)

model = AutoModelForCausalLM.from_pretrained(
    "/kaggle/input/qwen2-5-7b-instruct",
    quantization_config=bnb_config,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("/kaggle/input/qwen2-5-7b-instruct")
```
