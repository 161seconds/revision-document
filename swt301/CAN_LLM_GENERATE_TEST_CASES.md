# BÀI THUYẾT TRÌNH 3 PHÚT: ĐÁNH GIÁ LLM THEO THÀNH PHẦN TEST CASE
> **Người trình bày:** Phần chuyên trách chuyên sâu (3 phút)  
> **Chủ đề:** *Xét theo 3 thành phần cốt lõi của Test Case: Input (Tốt) — Steps (Tốt nếu đủ context) — Oracle (Chưa tốt)*  
> **Thời lượng:** Đúng 180 giây (3 phút)  
> **Slide Canva:** 3 Slide (Tối ưu để dán thẳng vào [Canva Design](https://www.canva.com/design/DAHV7r01GRk/nI8dh-npIMOX4WHocpu0Tw/edit))

---

## 📊 TỔNG QUAN 3 SLIDE TRÊN CANVA

```
[SLIDE 1: INPUT & STEPS]       [SLIDE 2: TỬ HUYỆT ORACLE]     [SLIDE 3: DATA & TAKEAWAY]
┌───────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐
│ • Input: ★★★★★ (TỐT)   │  │ • The Oracle Problem      │  │ • Meta & IEEE Benchmark   │
│   Fuzzing, Boundary, Edge │  │ • Code-bias: "Bảo kê bug" │  │   75% pass, chỉ 25% chuẩn │
│ • Steps: ★★★☆☆         │  │ • DEMO THỰC CHỨNG         │  │ • PUNCHLINE:              │
│   Tốt nếu đủ ngữ cảnh     │  │   Spec 200$ vs LLM 400$   │  │   "Code, Not Truth!"      │
└───────────────────────────┘  └───────────────────────────┘  └───────────────────────────┘
```

---

## 🎙️ KỊCH BẢN NÓI CHI TIẾT (BẤM GIỜ TỪNG GIÂY)

### ⏱️ SLIDE 1 (0:00 - 1:00 | 60 giây): TEST INPUT & TEST STEPS
*(Nội dung Slide 1: Đánh giá Input [Xanh lá] & Steps [Vàng] kèm ví dụ test data)*

* **Lời thoại (Mở đầu mượt mà, nối tiếp từ đồng đội):**
> *"Tiếp nối phần trình bày của nhóm, em xin đi sâu vào **bản chất kỹ thuật bên trong một Test Case**:  
> Một test case luôn được cấu thành từ 3 phần: **Input (Đầu vào) — Steps (Các bước thực thi) — và Expected Result (Test Oracle)**.  
> 
> **1. Đầu tiên, về TEST INPUT: Đánh giá: XUẤT SẮC (★★★★★)**  
> Con người chúng ta khi viết test data thường rất lười, chỉ nhập `1, 2, 3` hay email `a@gmail.com`.  
> Nhưng LLM là bậc thầy sáng tạo và Fuzzing dữ liệu:  
> Nó tự động quét sạch các trường hợp biên: chuỗi rỗng `""`, khoảng trắng `"   "`, ký tự vô hình `\u200B`, số âm, số nguyên cực hạn `Number.MAX_SAFE_INTEGER`, và cả những lỗi tính toán dấu phẩy động kinh điển như `0.1 + 0.2`. Về khoản này, LLM làm nhanh và bao quát hơn con người gấp nhiều lần.
> 
> **2. Thứ hai, về TEST STEPS: Đánh giá: TỐT NẾU ĐỦ NGỮ CẢNH (★★★☆☆)**  
> LLM nắm rất vững các mẫu thiết kế chuẩn như **Arrange - Act - Assert (AAA)**.  
> Nếu chúng ta cung cấp đủ Type definitions và API interface, LLM sẽ gọi hàm và sắp xếp các bước rất mượt. Nhưng điểm yếu là: nếu một quy trình nghiệp vụ có 4-5 bước phụ thuộc trạng thái (state machine), LLM rất hay 'ăn gian' nhảy cóc bước vì nó không thực sự lưu trữ trạng thái hệ thống trong bộ nhớ."*

---

### ⏱️ SLIDE 2 (1:00 - 2:10 | 70 giây): TỬ HUYỆT "TEST ORACLE" & DEMO
*(Nội dung Slide 2: Chiếu khối code đối chứng: Code lỗi của Dev vs Assertion của LLM)*

* **Lời thoại (Tông giọng nhấn mạnh, dẫn chứng trực quan):**
> *"Và bây giờ là phần quan trọng nhất — **TỬ HUYỆT CỦA LLM**:  
> **3. EXPECTED RESULT (TEST ORACLE): ĐÁNH GIÁ: CHƯA TỐT (★☆☆☆☆)**.  
> 
> Trong kiểm thử phần mềm, một test case dù input có độc lạ đến đâu, steps có đẹp thế nào, nhưng nếu **EXPECTED RESULT mà SAI thì toàn bộ test case trở thành vô nghĩa, thậm chí gây họa!**  
> 
> LLM mắc phải một căn bệnh chết người: **Code-Bias Replication (Hợp thức hóa bug thành tính năng)**.  
> 
> Xin mời Thầy và các bạn nhìn vào **Demo thực chứng** trên màn hình:  
> - **Đặc tả nghiệp vụ (Spec):** Khách VIP mua trên 1.000$ được giảm 10%, **tối đa giảm 200$**.  
> - **Code của Dev:** Dev gõ nhầm 10% thành 20%, và hoàn toàn quên đặt trần 200$!  
> - **Khi đưa code này cho LLM viết test cho đơn hàng 2.000$:**  
>   LLM không đối chiếu với Spec, mà nó **nhìn vào code lỗi và tính nhẩm**: `2000 * 0.2 = 400`!  
>   Và nó khẳng định luôn: `expect(discount).toBe(400)`!  
> 
> **Hậu quả là gì?**  
> Test case này chạy trong CI/CD **xanh lè 100%**! Nhưng nó không hề bắt được lỗi, mà nó đang **bảo vệ cái bug của dev**! Bất kỳ ai sau này sửa code đúng lại 200$ thì test lại lăn ra đỏ!"*

---

### ⏱️ SLIDE 3 (2:10 - 3:00 | 50 giây): SỐ LIỆU THỰC CHỨNG & CHỐT HẠ
*(Nội dung Slide 3: 2 số liệu khoa học lớn + Câu punchline to tướng)*

* **Lời thoại (Dứt khoát, tự tin, mang tầm kỹ sư):**
> *"Đây không phải là lỗi ngẫu nhiên, mà là thực tế đã được khoa học chứng minh:  
> - Nghiên cứu của **Meta (TestGen-LLM tại ICSE 2024)** chỉ ra: Dù 75% test case LLM sinh ra chạy pass, nhưng chỉ có **25%** thực sự có giá trị nghiệp vụ để merge vào codebase, 75% còn lại bị reject vì Oracle sáo rỗng hoặc sai lệch.  
> - Nghiên cứu của **CMU/IEEE** cũng chứng minh: **62%** trường hợp LLM sinh assertion bọc lót cho chính đoạn code bị inject bug!  
> 
> **TỔNG KẾT TRONG 1 CÂU DUY NHẤT:**  
> **'LLM GENERATES CODE, NOT TRUTH!'**  
> *(LLM chỉ giỏi sinh cú pháp mã nguồn, chứ không sinh ra được Chân lý nghiệp vụ!)*  
> 
> 👉 **Chiến lược chuẩn khi áp dụng:**  
> Hãy tận dụng LLM tối đa để sinh **Test Input** và dựng khung **Steps**.  
> Nhưng riêng phần **Oracle (Assert đúng/sai)** — chúng ta bắt buộc phải tự tay viết và kiểm duyệt!  
> 
> Em xin cảm ơn Thầy và các bạn đã lắng nghe!"*

---

## 🎨 NỘI DUNG COPY THẲNG VÀO CANVA (3 SLIDES)

### SLIDE 1 (Dán vào Canva Slide 1):
* **Header:** `ANATOMY OF A TEST CASE: INPUT & STEPS`
* **Card 1 (Màu xanh lá):**
  * **TEST INPUT: ★★★★★ (XUẤT SẮC)**
  * Bậc thầy Fuzzing & Boundary data
  * Tự động sinh: String rỗng, `\u200B`, Emoji, `MAX_SAFE_INTEGER`, số âm, `0.1 + 0.2`
* **Card 2 (Màu vàng):**
  * **TEST STEPS: ★★★☆☆ (TỐT NẾU ĐỦ CONTEXT)**
  * Chuẩn hóa mẫu Arrange - Act - Assert (AAA)
  * Nhược điểm: Dễ nhảy cóc bước ở các workflow phụ thuộc State Machine
* **Ảnh thiết kế Slide 1 (Sơ đồ kỹ thuật):** [real_slide_1_anatomy.png](file:///d:/my-project/revision-document/swt301/slides/real_slide_1_anatomy.png)

---

### SLIDE 2 (Dán vào Canva Slide 2):
* **Header:** `TỬ HUYỆT: TEST ORACLE & CODE-BIAS`
* **Sub-text:** *LLM không biết đâu là chân lý, nó chỉ suy diễn theo code hiện có!*
* **Ảnh thiết kế Slide 2 (Case Study IDE Code):** [real_slide_2_oracle_demo.png](file:///d:/my-project/revision-document/swt301/slides/real_slide_2_oracle_demo.png)
* **Code Block (Hiển thị to, rõ):**
```typescript
// 1. SPEC YÊU CẦU: VIP giảm 10%, TỐI ĐA 200$
// 2. DEV GÕ NHẦM:   return total * 0.2; (quên cap 200$)

// 3. LLM VIẾT TEST (với đơn hàng 2000$):
const discount = calculateDiscount(true, 2000);
expect(discount).toBe(400); 

// ❌ KẾT QUẢ ĐÚNG PHẢI LÀ 200!
// 🚨 TEST PASS XANH LÈ -> HỢP THỨC HÓA BUG THÀNH TÍNH NĂNG!
```

---

### SLIDE 3 (Dán vào Canva Slide 3):
* **Header:** `DATA THỰC CHỨNG & KẾT LUẬN`
* **Ảnh thiết kế Slide 3 (Bài báo Meta ICSE 2024 & IEEE):** [real_slide_3_meta_takeaway.png](file:///d:/my-project/revision-document/swt301/slides/real_slide_3_meta_takeaway.png)
* **2 Cột số liệu (Big Numbers):**
  * **25%** *(Nghiên cứu Meta ICSE 2024)*: Tỷ lệ test case của LLM thực sự có giá trị nghiệp vụ được kỹ sư chấp nhận.
  * **62%** *(Nghiên cứu CMU/IEEE)*: Tỷ lệ LLM sinh Assertion bảo kê cho đoạn code có lỗi.
* **Banner nổi bật giữa slide:**
  > **"LLM GENERATES CODE, NOT TRUTH!"**
* **Takeaway:**
  * 🤖 **AI:** Tự động hóa Input & Skeleton Steps.
  * 🧑‍💻 **Human:** Nắm giữ Test Oracle & Logic nghiệp vụ.

---

## 🎯 BỘ PHẢN BIỆN PHÒNG THỦ (NẾU THẦY HỎI XOÁY VÀO PHẦN NÀY)

* **Thầy hỏi:** *"Nếu tôi đưa cả file Spec kèm theo code vào prompt thì LLM có giải quyết được lỗi Test Oracle không?"*  
  $\rightarrow$ **Bạn trả lời ngay:**  
  *"Dạ thưa Thầy, việc đưa Spec vào prompt giúp cải thiện tỷ lệ đúng, nhưng **vẫn không giải quyết triệt để**. Vì bản chất LLM hoạt động theo cơ chế xác suất ngôn ngữ (probabilistic token prediction), nó không có execution engine để chạy thử trong runtime. Khi gặp logic nghiệp vụ lồng ghép nhiều điều kiện bù trừ hoặc làm tròn số, nó vẫn xảy ra hiện tượng ảo giác (hallucination). Vì vậy con người vẫn bắt buộc là chốt chặn cuối cùng kiểm duyệt Oracle ạ."*
