# 11. Kaggle GPU Optimization, Quantization & 100% Offline Submission Mastery

Một sự thật tàn khốc tại các cuộc thi Kaggle Hackathon: **Hơn $30\%$ các đội thi bị chấm điểm 0 (Submission Scoring Error)** vì notebook của họ chạy tốt khi có mạng Internet, nhưng lập tức vỡ vụn (Crash) khi Ban tổ chức kích hoạt chế độ chấm điểm chính thức: **Internet Strictly Disabled (Tắt mạng hoàn toàn)** và giới hạn phần cứng nghiêm ngặt.

---

## 1. Giới Hạn Phần Cứng & Môi Trường Kaggle Cần Nằm Lòng

| Thông số tài nguyên | Giới hạn thực tế trên Kaggle | Kịch bản rủi ro nếu vượt ngưỡng |
| :--- | :--- | :--- |
| **GPU VRAM** | 2x Nvidia T4 (16 GB mỗi card) hoặc 1x P100 (16 GB) | **CUDA Out of Memory (OOM)** $\implies$ Tiến trình chết ngay lập tức. |
| **CPU RAM** | 30 GB System Memory | **Kernel OOM-Killed** khi nạp tệp CSV/JSON quá lớn vào Pandas. |
| **Dung lượng Đĩa ghi** | **20 GB** tối đa tại `/kaggle/working` | **No space left on device** khi lưu checkpoint mô hình nặng. |
| **Thời gian chạy tối đa** | **9 tiếng** cho toàn bộ notebook nộp bài | **Time Limit Exceeded (TLE)** nếu suy luận (inference) quá chậm. |
| **Mạng Internet** | **TẮT HOÀN TOÀN (Disabled)** trong quá trình chấm | Bất kỳ lệnh gọi `pip install` online hoặc `from_pretrained('meta-llama/...')` đều gây lỗi mạng! |

---

## 2. Kỹ Thuật Lượng Hóa 4-Bit: Chạy Mô Hình 8B Tham Số Trên 16GB VRAM

Một mô hình 8 tỷ tham số (như Llama-3-8B hoặc Mistral-7B) ở định dạng chuẩn FP16 đòi hỏi:
$$\text{VRAM} = 8 \times 10^9 \times 2 \text{ bytes} = 16 \text{ GB (Chỉ riêng trọng số, chưa tính KV-Cache và Context!)}$$
$\implies$ Sẽ lập tức bị tràn bộ nhớ (CUDA OOM) ngay khi nhận batch đầu tiên.

### Giải pháp Lượng Hóa 4-Bit (BitsAndBytes NF4):
Nén mỗi tham số từ 16-bit xuống 4-bit, giảm dung lượng bộ nhớ từ **16 GB xuống chỉ còn 5.5 GB VRAM**, chạy mượt mà trên 1 card T4 duy nhất:

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

# Cấu hình lượng hóa 4-bit NF4 tối ưu
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",               # NormalFloat4 tối ưu cho phân phối chuẩn
    bnb_4bit_compute_dtype=torch.float16,    # Tính toán ở FP16 để giữ độ chính xác
    bnb_4bit_use_double_quant=True           # Lượng hóa kép: nén cả hằng số lượng hóa
)

# Nạp mô hình hoàn toàn OFFLINE từ thư mục /kaggle/input
model_path = "/kaggle/input/llama-3-8b-instruct-weights"
tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    quantization_config=bnb_config,
    device_map="auto",                       # Tự động chia tải lên cả 2 GPU T4
    local_files_only=True
)
```

---

## 3. Tăng Tốc Suy Luận Cực Đại: vLLM & PagedAttention

Thư viện chuẩn HuggingFace `model.generate()` xử lý bộ đệm Key-Value (KV-Cache) theo kiểu cấp phát bộ nhớ liên tục (Contiguous Memory), gây lãng phí $60\% - 80\%$ VRAM do hiện tượng phân mảnh bộ nhớ (Memory Fragmentation).

**vLLM** áp dụng thuật toán **PagedAttention** (Lấy cảm hứng từ cơ chế phân trang bộ nhớ ảo của hệ điều hành), cho phép tốc độ sinh token nhanh gấp **$5\times - 10\times$**:

```python
from vllm import LLM, SamplingParams

# Cấu hình vLLM tối ưu cho 2 GPU T4 trên Kaggle
llm = LLM(
    model="/kaggle/input/mistral-7b-instruct-v02",
    tensor_parallel_size=2,          # Song song hóa trên 2 GPU T4
    dtype="float16",
    max_model_len=2048,              # Giới hạn context length để tiết kiệm RAM
    gpu_memory_utilization=0.90      # Tận dụng 90% VRAM cho KV-Cache
)

sampling_params = SamplingParams(
    temperature=0.0,                 # Suy luận tất định (Greedy)
    max_tokens=256
)

# Xử lý toàn bộ 1.000 test prompts theo lô (Batching) chỉ trong vài phút!
outputs = llm.generate(test_prompts_list, sampling_params)
```

---

## 4. Quy Trình Chuẩn Bị Tệp Cài Đặt Ngoại Tuyến (Offline Wheels Packaging)

Để sử dụng các thư viện đặc biệt (như `vllm`, `peft`, `bitsandbytes`, `sentence-transformers`) trên Kaggle khi tắt mạng:

### Bước 1: Chuẩn bị trên máy có mạng hoặc 1 Notebook tiền trạm (Online)
```bash
# Tải toàn bộ các file .whl cần thiết vào thư mục wheelhouse
pip download -d ./wheelhouse \
    transformers==4.40.0 \
    bitsandbytes==0.43.0 \
    accelerate==0.29.0 \
    peft==0.10.0 \
    sentence-transformers==2.7.0
```
- Đẩy thư mục `wheelhouse` lên Kaggle dưới dạng một **Private Kaggle Dataset** tên là `rmit-offline-packages`.

### Bước 2: Cài đặt trong Notebook nộp bài chính thức (Offline)
```python
# Trong notebook chính thức khi TẮT MẠNG INTERNET:
!pip install --no-index --find-links=/kaggle/input/rmit-offline-packages/wheelhouse \
    transformers bitsandbytes accelerate peft sentence-transformers
```
- Tùy chọn `--no-index`: Cấm tuyệt đối pip tìm kiếm trên PyPI online.
- Tùy chọn `--find-links`: Chỉ định thư mục chứa các tệp `.whl` nội bộ.
- Đảm bảo $100\%$ cài đặt thành công mà không bao giờ gặp lỗi `ConnectionError`!
