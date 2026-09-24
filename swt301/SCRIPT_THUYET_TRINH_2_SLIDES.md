# 🎙️ KỊCH BẢN THUYẾT TRÌNH KHỚP 100% VỚI 2 SLIDE CANVA
> **Chủ đề:** Components of a Test Case & The Test Oracle Problem  
> **Thời lượng:** 2.5 - 3 phút (Chuẩn chỉnh, không dông dài)  
> **Thiết kế slide:** Khớp chính xác 100% với 2 hình ảnh Canva bạn vừa gửi!

---

## 🖼️ SLIDE 1 | COMPONENTS OF A TEST CASE (0:00 - 1:20 | 80 GIÂY)
*(Màn hình chiếu: 3 cột — INPUT DATA [Tích xanh] | STEPS [Tích xanh] | EXPECTED OUTPUT [Dấu hỏi đỏ])*

### 🎬 Hành động sân khấu:
* Bật Slide 1. Đứng tự tin, tay mở rộng hướng về màn hình slide.

### 🗣️ Lời thoại khớp từng hình trên Slide 1:
> *"Kính thưa Thầy và các bạn, tiếp nối phần trình bày của nhóm...  
> 
> Để trả lời rốt ráo câu hỏi 'LLM có thực sự tạo ra được test case hoàn chỉnh hay không?', xin mời mọi người cùng nhìn lên **Slide 1: Ba cấu phần nền tảng của một Test Case**.  
> 
> *(Chỉ tay vào cột 1: Phím bấm Input & Dấu tích xanh)*  
> **1. Thành phần đầu tiên: INPUT DATA — ĐÁNH DẤU TÍCH XANH (LLM LÀM RẤT TỐT)!**  
> Con người chúng ta khi viết test thường lười, chỉ nhập các giá trị đơn giản như số 1, 2 hay chuỗi mẫu.  
> Nhưng LLM lại là **bậc thầy Fuzzing dữ liệu**. Nó tự động vét cạn mọi giá trị biên và trường hợp cực đoan: chuỗi rỗng `""`, ký tự vô hình `\u200B`, biểu tượng cảm xúc, số nguyên tràn ngưỡng `MAX_SAFE_INTEGER`, và cả lỗi tính toán dấu phẩy động kinh điển `0.1 + 0.2`. Ở phần này, LLM làm nhanh và bao quát hơn con người rất nhiều!  
> 
> *(Chỉ tay vào cột 2: Bậc thang Steps & Dấu tích xanh)*  
> **2. Thành phần thứ hai: STEPS (CÁC BƯỚC THỰC THI) — TIẾP TỤC LÀ DẤU TÍCH XANH!**  
> LLM nắm rất vững quy trình chuẩn từ Bước 1 đến Bước 5 theo mẫu **Arrange — Act — Assert**. Nếu được cung cấp đủ Interface và Type definitions, nó dựng khung code rất mượt. Dù đôi khi có thể nhảy cóc ở các quy trình phức tạp nhiều trạng thái (State Machine), nhưng nhìn chung LLM xử lý phần Steps rất tốt.  
> 
> *(Dừng lại 2 giây, hạ giọng, chỉ thẳng tay vào DẤU HỎI CHẤM ĐỎ ở cột 3)*  
> 
> **3. Nhưng hãy nhìn vào thành phần thứ ba: EXPECTED OUTPUT — TẠI SAO LẠI CÓ DẤU CHẤM HỎI ĐỎ Ở ĐÂY?**  
> Trong kiểm thử phần mềm, Input có độc lạ đến đâu, Steps có đẹp đến đâu, mà **EXPECTED OUTPUT (hay gọi là TEST ORACLE) mà SAI — thì toàn bộ bài test trở thành vô nghĩa, thậm chí gây họa!**"*

---

## 🖼️ SLIDE 2 | WHAT WRONG WITH ORACLE? (1:20 - 2:45 | 85 GIÂY)
*(Màn hình chiếu: Hộp trái: 25% OF ORACLE IS ACCEPTED | Hộp phải: 62% BUG BIAS OR MUTATION | Dưới: Meta & Carnegie Mellon)*

### 🎬 Hành động sân khấu:
* **[BẤM CHUYỂN SLIDE 2]**. Tông giọng trầm, dõng dạc, phong thái phân tích bằng số liệu khoa học.

### 🗣️ Lời thoại khớp từng hình trên Slide 2:
> *"Vậy điều gì thực sự đang sai với Test Oracle? — **'What wrong with oracle?'**  
> 
> Câu trả lời không phải là phỏng đoán, mà đến từ các nghiên cứu thực nghiệm của **Meta Platforms** và **Đại học Carnegie Mellon (CMU)** ngay trên slide:  
> 
> *(Chỉ tay vào ô bên trái: 25% OF ORACLE IS ACCEPTED)*  
> **Con số thứ nhất — 25%:**  
> Nghiên cứu thực tế của **Meta (công bố tại ICSE 2024)** khi áp dụng LLM sinh test trên quy mô hàng ngàn kỹ sư Instagram và Facebook chỉ ra rằng:  
> Dù hầu hết test case sinh ra đều chạy pass, nhưng **chỉ có 25% Test Oracle thực sự có giá trị nghiệp vụ** để kỹ sư duyệt merge vào codebase!  
> 75% còn lại bị vứt bỏ vì assertion sáo rỗng vô nghĩa, ví dụ chỉ kiểm tra `expect(result).toBeDefined()` — code chạy ra kết quả rỗng hay sai vẫn pass!  
> 
> *(Chỉ tay vào ô bên phải: 62% BUG BIAS OR MUTATION)*  
> **Con số thứ hai — và cũng là nguy hiểm nhất — 62% BUG BIAS:**  
> Nghiên cứu của **Đại học Carnegie Mellon và IEEE** chứng minh:  
> Khi source code của lập trình viên có lỗi ẩn (Mutation/Bug), thì có tới **62% trường hợp LLM sinh ra Assertion bọc lót cho chính cái lỗi đó!**  
> 
> *Ví dụ cụ thể:* Dev tính nhầm giảm giá 20% thay vì 10%, khi đưa code cho LLM viết test, LLM nhìn vào code lỗi và tự tính nhẩm theo cái lỗi đó!  
> Kết quả: **Test chạy xanh lè 100%**, nhưng nó không hề bắt được lỗi mà đang **hợp thức hóa bug của Dev thành tính năng đúng**!  
> 
> *(Bước lên một bước, kết bài đầy năng lượng)*  
> 
> **KẾT LUẬN CUỐI CÙNG TRONG 1 CÂU:**  
> **'LLM GENERATES CODE, NOT TRUTH!'**  
> *(LLM chỉ sinh ra cú pháp mã nguồn, chứ không sinh ra được Chân lý nghiệp vụ!)*  
> 
> 👉 Hãy tận dụng LLM tối đa ở 2 cột tích xanh: **Input và Steps**.  
> Nhưng riêng phần **Expected Output / Test Oracle** — chúng ta, những kỹ sư kiểm thử, bắt buộc phải tự tay kiểm soát!  
> 
> Em xin chân thành cảm ơn Thầy và các bạn đã lắng nghe!" *(Cúi chào tự tin).*

---

## 📌 FLASHCARD NHANH CẦM TAY (DÀNH CHO LÚC CẦM ĐIỆN THOẠI)

* **SLIDE 1 (COMPONENTS):**
  - **Input Data (Tích xanh):** Fuzzing đỉnh, vét cạn biên, `\u200B`, `MAX_SAFE_INT`, `0.1 + 0.2`.
  - **Steps (Tích xanh):** Chuẩn mẫu AAA (Arrange-Act-Assert), bước 1 tới bước 5 mượt.
  - **Expected Output (Dấu hỏi đỏ):** Tử huyệt! Input/Steps đẹp mà Expected sai thì test thành vô nghĩa.
* **SLIDE 2 (WHAT WRONG WITH ORACLE?):**
  - **25% (Meta ICSE 2024):** Chỉ 25% oracle được merge, 75% bị reject vì assert vô nghĩa (`toBeDefined`).
  - **62% (CMU / IEEE):** 62% bug bias, LLM tính nhẩm theo code lỗi $\rightarrow$ Test pass nhưng bảo kê bug!
  - **Chốt:** *"LLM generates code, not truth! Tận dụng AI cho Input & Steps, giữ chặt Oracle trong tay người!"*
