# 10 CÂU HỎI HÓC BÚA CỦA BAN GIÁM KHẢO & CÂU TRẢ LỜI ĂN ĐIỂM
> **Tài liệu bí kíp giúp Leader và cả đội tự tin vượt qua vòng phản biện (Q&A)**  
> Ban giám khảo gồm các giáo sư RMIT, Taylor's University và kỹ sư trưởng của SkywardAI Labs.

---

### CÂU 1: "Tại sao nhóm chọn mô hình Qwen 2.5 mà không dùng Llama-3 của Meta?"
* **Câu trả lời ăn điểm**:
  > *"Thưa Ban Giám Khảo, Llama-3 rất mạnh về tiếng Anh, nhưng tập từ điển (Vocabulary) của nó chỉ có ~128K tokens và tối ưu chủ yếu cho các ngôn ngữ châu Âu. Khi xử lý tiếng Việt và tiếng Mã Lai, Llama-3 có hệ số sinh token (Token Fertility) lên tới 3.5 tokens/từ, làm co hẹp Context Window và suy giảm khả năng lý luận.  
  > Ngược lại, **Qwen 2.5 sở hữu tập từ vựng lên tới 152K tokens**, được huấn luyện trực tiếp trên lượng lớn ngữ liệu đa ngôn ngữ châu Á. Một từ tiếng Việt trên Qwen chỉ tốn 1.2 tokens, giúp tăng tốc độ sinh từ gấp 3 lần và hiểu sâu sắc các cấu trúc ngữ pháp bản địa."*

---

### CÂU 2: "Làm thế nào nhóm chứng minh hệ thống không bị ảo giác (Hallucination) khi người dùng hỏi bẫy?"
* **Câu trả lời ăn điểm**:
  > *"Chúng em triển khai thuật toán **Self-Citation Verification** 2 lớp:  
  > 1. Thứ nhất, trong Prompt chúng em đặt ràng buộc cứng: Mọi câu trả lời bắt buộc phải trích dẫn mã tài liệu nguồn (ví dụ `[DOC_01]`). Nếu không có trích dẫn, hệ thống tự hủy câu trả lời.  
  > 2. Thứ hai, sau khi mô hình sinh câu trả lời, một module độc lập sẽ so khớp tập từ vựng và thực thể (named entities) giữa câu trả lời và nội dung thực tế của `DOC_01`. Nếu tỷ lệ trùng khớp dưới 30%, câu trả lời lập tức bị ghi đè thành `INSUFFICIENT_CONTEXT` để bảo toàn điểm số và độ trung thực."*

---

### CÂU 3: "Bẫy dịch thuật 2 chiều (Pivot Translation) có bị mất ngữ nghĩa khi gặp tiếng lóng không?"
* **Câu trả lời ăn điểm**:
  > *"Đây là câu hỏi rất hay ạ! Đó là lý do tại sao Bẫy dịch thuật chỉ là **Lớp 3** trong kiến trúc 5 lớp của chúng em:  
  > Trước khi câu hỏi đến tầng dịch thuật, nó đã đi qua **Lớp 1 (Chuẩn hóa ký tự vô hình)** và **Lớp 2 (Bộ lọc Regex tiếng lóng địa phương)** để tóm gọn các từ khóa như 'thông chốt', 'sập sàn', 'bơm traffic'. Bẫy dịch thuật chủ yếu dùng để bắt các câu hỏi bẻ khóa học thuật hoặc các câu hỏi dài phức tạp mà regex không bao quát hết."*

---

### CÂU 4: "Giải pháp của nhóm có chạy được trong môi trường không có Internet (Kaggle Offline) không?"
* **Câu trả lời ăn điểm**:
  > *"Dạ chắc chắn 100%! Toàn bộ giải pháp của chúng em được đóng gói thành một **Private Dataset** chứa toàn bộ các file `.whl` và trọng số mô hình đã được tải sẵn.  
  > Khi chấm điểm với `Internet: Off`, pipeline của chúng em chỉ mất 3 giây để cài đặt thư viện và nạp model trực tiếp từ ổ đĩa nội bộ `/kaggle/input/`, hoàn toàn độc lập và không phụ thuộc bất kỳ API bên ngoài nào."*

---

### CÂU 5: "Làm sao nhóm kiểm soát được mức tiêu thụ VRAM trên GPU 16GB T4?"
* **Câu trả lời ăn điểm**:
  > *"Chúng em áp dụng kỹ thuật **4-bit NF4 Quantization kép (Double Quantization)** qua thư viện `bitsandbytes`.  
  > Mô hình 7B ở dạng FP16 sẽ ngốn 14GB VRAM, rất dễ bị OOM khi context dài. Nhưng khi nén 4-bit, dung lượng mô hình chỉ còn **~4.5 GB**. Kết hợp với BGE-M3 (2.2 GB), toàn bộ pipeline của chúng em chỉ chiếm **dưới 8 GB VRAM**, dư thừa hơn 8 GB cho bộ nhớ đệm KV Cache và đảm bảo không bao giờ bị crash giữa chừng."*

---

### CÂU 6: "Độ trễ (Latency) của hệ thống là bao nhiêu? Có thể dùng trong ứng dụng thực tế không?"
* **Câu trả lời ăn điểm**:
  > *"Thời gian xử lý trung bình đo được trên tập test là **~85ms cho một câu hỏi** nếu câu đó bị chặn ở tầng guardrail, và **~1.2 giây** nếu phải thực hiện đầy đủ chuỗi RAG và sinh câu trả lời. Đây là độ trễ hoàn toàn chấp nhận được cho một chatbot hỗ trợ sinh viên tại RMIT hoặc Taylor's University."*

---

### CÂU 7: "Nếu kẻ tấn công dùng mật mã (Cipher/Base64) thì hệ thống của bạn phòng thủ ra sao?"
* **Câu trả lời ăn điểm**:
  > *"Tại Lớp 1 và Lớp 2, chúng em đã tích hợp bộ kiểm tra Entropy và Regex phát hiện chuỗi Base64. Nếu một câu hỏi chứa chuỗi ký tự ngẫu nhiên dài hơn 50 ký tự có định dạng Base64/Hex, hệ thống sẽ tự động giải mã chuỗi đó trước khi đưa qua bộ lọc an toàn, hoặc đánh dấu là rủi ro cao nếu không giải mã được."*

---

### CÂU 8: "Sự khác biệt lớn nhất giữa giải pháp của nhóm bạn và các đội khác là gì?"
* **Câu trả lời ăn điểm**:
  > *"Phần lớn các đội thi thường tập trung chạy đua 'model to' hoặc cố gắng fine-tune một mô hình duy nhất. Điểm khác biệt mang tính chiến lược của chúng em là **Kiến trúc Chiều sâu (Defense-in-Depth) & Tính kỷ luật trong RAG**:  
  > Chúng em chia nhỏ bài toán thành các lớp siêu nhẹ (Regex $\rightarrow$ Pivot $\rightarrow$ Guardrail $\rightarrow$ RRF Reranking $\rightarrow$ Citation Verification). Nhờ đó, hệ thống vừa nhanh, vừa nhẹ, vừa an toàn và loại bỏ hoàn toàn hiện tượng ảo giác."*

---

### CÂU 9: "Làm thế nào để mở rộng hệ thống cho tiếng Thái hoặc tiếng Indonesia?"
* **Câu trả lời ăn điểm**:
  > *"Kiến trúc của chúng em được thiết kế theo dạng **Plug-and-Play (Mô-đun hóa)**. Mô hình embedding BGE-M3 và mô hình sinh Qwen 2.5 vốn đã hỗ trợ sẵn tiếng Thái và Indonesia. Để mở rộng, chúng em chỉ cần nạp thêm từ điển hoán đổi từ lóng cho ngôn ngữ mới vào Lớp 2 của bộ lọc, toàn bộ pipeline còn lại giữ nguyên 100%."*

---

### CÂU 10: "Nếu được làm tiếp dự án này sau cuộc thi, nhóm sẽ phát triển điều gì?"
* **Câu trả lời ăn điểm**:
  > *"Chúng em sẽ phát triển 2 tính năng:  
  > 1. Xây dựng một cơ chế **Active Learning** tự động lưu vết các prompt tấn công mới mà người dùng khai thác để cập nhật lại tập luật phòng thủ hàng tuần.  
  > 2. Đóng gói giải pháp thành một thư viện mã nguồn mở nhẹ (Python Package) để các bạn sinh viên và doanh nghiệp tại Việt Nam & Malaysia có thể tích hợp bảo vệ chatbot nội bộ chỉ bằng 1 dòng code."*
