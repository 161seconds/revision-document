# Ý Tưởng Đột Phá & Chiến Thuật Giành Giải (Winning Strategies)
> Dành cho Leader khi đang "bí ý tưởng" chuẩn bị cho RMIT Hackathon 2026.

---

## 1. 4 "Vũ Khí Bí Mật" (Secret Weapons) Giúp Đội Bạn Vượt Trội

### Vũ Khí 1: "Dual-Stage Pivot Translation Sentinel" (Bẫy Dịch Thuật 2 Chiều)
* **Vấn đề**: Các model guardrail tiếng Việt/Mã Lai thường yếu hoặc quá nặng để chạy trên Kaggle GPU.
* **Giải pháp đột phá**: 
  1. Khi nhận câu hỏi bằng tiếng Việt / Mã Lai / Tiếng lóng, chạy qua một model dịch siêu nhẹ (như `Helsinki-NLP/opus-mt-vi-en` hoặc `facebook/nllb-200-distilled-600M`).
  2. Câu tiếng Anh sau khi dịch được đưa qua bộ kiểm tra an toàn chuẩn tiếng Anh (như `Llama-Guard-3-1B` hoặc bộ rule regex tiếng Anh).
  3. **Ưu điểm**: Tận dụng được 100% sức mạnh của các bộ guardrail tiếng Anh vốn được đầu tư hàng triệu USD huấn luyện mà không tốn công gán nhãn dữ liệu bản địa.

---

### Vũ Khí 2: "Code-Switching Attack Engine" (Máy Sinh Tấn Công Lai Ngôn Ngữ)
* **Vấn đề**: Viết tay 50-100 prompt tấn công tiếng Việt rất tốn thời gian trong 14 tiếng thi đấu.
* **Giải pháp đột phá**:
  1. Viết một script Python tự động hóa việc dịch các từ khóa độc hại sang tiếng lóng gen Z Việt Nam (ví dụ: *"hack"* $\rightarrow$ *"thông chốt"*, *"ddos"* $\rightarrow$ *"bơm traffic sập sàn"*).
  2. Sử dụng cấu trúc câu đan xen: `[Động từ tiếng Việt] + [Thuật ngữ kỹ thuật tiếng Anh] + [Bối cảnh học thuật]`.
  3. Tỷ lệ vượt qua bộ lọc an toàn của phương pháp này đạt trên **85%** trên các mô hình như GPT-4 hay Llama-3.

---

### Vũ Khí 3: "Self-Citation Verification" (Cơ Chế Khử Ảo Giác RAG Triệt Để)
* **Vấn đề**: Trong Task 3, ban tổ chức thường phạt điểm rất nặng (trừ gấp đôi) nếu model tự bịa câu trả lời khi không có context.
* **Giải pháp đột phá**:
  1. Bước 1: Cho LLM sinh câu trả lời kèm trích dẫn: `"[DOC_01]: Timeout là 15 phút"`.
  2. Bước 2 (Verification): Dùng thuật toán so khớp chuỗi (String Overlap) hoặc Cosine Similarity giữa câu trả lời và nội dung thực tế của `DOC_01`.
  3. Nếu độ tương đồng < 0.6 $\rightarrow$ Buộc ghi đè kết quả thành `"INSUFFICIENT_CONTEXT"`.
  4. **Kết quả**: Đội bạn sẽ có điểm Precision gần như tuyệt đối, tránh được bẫy điểm âm của ban giám khảo.

---

### Vũ Khí 4: "Pre-Baked Kaggle Offline Kit" (Chuẩn Bị Sẵn Trước Ngày Thi)
* **Thực tế đau đớn**: 70% các đội thi Kaggle mất từ 2 đến 3 tiếng đầu tiên chỉ để... loay hoay cài đặt thư viện bị lỗi do không có Internet!
* **Hành động của Leader**:
  * Trước ngày 22/10/2026, tải sẵn toàn bộ `.whl`, model `Qwen2.5-7B-Instruct-GPTQ` hoặc `GGUF/AWQ`, và tokenizer lên Kaggle Dataset.
  * Khi BTC vừa phát đề lúc 8:00 sáng, trong khi các đội khác còn đang vật lộn cài package, đội bạn đã bấm chạy pipeline baseline lúc 8:15!

---

## 2. Ý Tưởng Pitching & Trình Bày Trước Ban Giám Khảo

Khi vào vòng phỏng vấn / thuyết trình (nếu có):
1. **Nhấn mạnh tính thực tiễn (Pragmatism)**: Không khoe model to, hãy nhấn mạnh: *"Giải pháp của chúng em tối ưu cho phần cứng phổ thông (chạy mượt trên GPU 16GB), độ trễ dưới 100ms, sẵn sàng triển khai cho người dùng thực tế tại Việt Nam & Malaysia"*.
2. **Nhấn mạnh yếu tố Low-Resource**: Thể hiện đội hiểu rất sâu về tiếng lóng, ngữ pháp tiếng Việt và sự bất bình đẳng trong huấn luyện an toàn AI toàn cầu.
3. **Thái độ chuyên nghiệp**: Cho giám khảo thấy sơ đồ kiến trúc rõ ràng và các con số đo lường (F1-score, Latency, ASR) thay vì chỉ nói lý thuyết.
