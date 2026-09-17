# Số Học & Các Dị Biệt Toán Học (JavaScript Arithmetic & Numerical Quirks)

Tài liệu ôn tập về các phép toán số học trong JavaScript, cơ chế chia cho 0, toán tử một ngôi (Unary Operator), sai số vượt ngưỡng an toàn (`MAX_SAFE_INTEGER`), và phép Modulus với số âm.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):** [10-operators-and-precedence.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/10-operators-and-precedence.md) (Toán tử và độ ưu tiên).
- **Mở rộng tiếp theo (Next Steps):** [02-functions-and-scope/](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/) và đối tượng toán học nâng cao `Math` (`Math.round`, `Math.floor`, `Math.random`).
- **Khái niệm liên quan (Related):**
  - Tiêu chuẩn biểu diễn số thực IEEE 754 (Double Precision).
  - Kiểu số nguyên vô hạn `BigInt`.

---

## 2. Bản Chất Hoạt Động (Mental Model: Các Cơ Chế Số Học Đặc Biệt)

### 1. Phép Chia Cho 0 (Division by Zero)
Trong các ngôn ngữ như Java hay C#, chia cho 0 sẽ ném lỗi `DivideByZeroException`. Nhưng trong JavaScript:
- Số dương chia 0: Trả về **`Infinity`** (Vô cực dương).
- Số âm chia 0: Trả về **`-Infinity`** (Vô cực âm).
- `0 / 0`: Không xác định, trả về **`NaN`** (Not a Number).
➔ **Chương trình không bao giờ bị dừng (crash) do chia cho 0.**

### 2. Toán Tử Một Ngôi Unary (`+` và `-`)
- Đặt dấu `+` trước một chuỗi hoặc boolean là cách ép kiểu sang `number` ngắn nhất và tối ưu nhất trong V8 Engine:
  ```javascript
  +"42"    // 42 (number)
  +true    // 1
  +false   // 0
  +null    // 0
  +""      // 0
  +"abc"   // NaN
  ```

### 3. Bản Chất Của Phép Chia Lấy Dư (`%`) Với Số Âm
Trong JavaScript, phép `%` là **Remainder (Phần dư)** chứ không phải Modulo toán học chuẩn:
- Dấu của kết quả **luôn đi theo dấu của số bị chia (Toán hạng bên trái)**:
  ```javascript
  -5 % 2   // -1 (Vì -5 là số âm)
   5 % -2  //  1 (Vì 5 là số dương)
  ```

### 4. Giới Hạn Số Nguyên An Toàn (Safe Integer Limit)
- JavaScript chỉ có thể biểu diễn số nguyên chính xác tuyệt đối trong khoảng:
  `-(2^53 - 1)` đến `+(2^53 - 1)` (`Number.MAX_SAFE_INTEGER = 9007199254740991`).
- Nếu vượt quá ngưỡng này, phép cộng số học sẽ bị **mất độ chính xác (Precision Loss)**:
  ```javascript
  9007199254740991 + 1 === 9007199254740991 + 2 // TRUE! (Bị làm tròn)
  ```
- **Giải pháp:** Dùng kiểu `BigInt` (thêm hậu tố `n`, ví dụ: `9007199254740991n + 2n`).

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

1. **Bẫy thuật toán mảng vòng (Circular Array / Ring Buffer) với `%`:**
   - Khi lùi chỉ số mảng bằng `(index - 1) % length`, nếu `index = 0` thì kết quả ra `-1 % length = -1` ➔ Truy cập `arr[-1]` trả về `undefined`!
   - *Cách viết đúng chuẩn modulo toán học:*
     ```javascript
     const safeIndex = ((index - 1) % length + length) % length;
     ```

2. **Lan truyền `NaN` (NaN Propagation):**
   - Bất kỳ phép tính số học nào thực hiện với `NaN` đều sinh ra `NaN` (`10 + NaN = NaN`). Nếu không validate dữ liệu đầu vào, `NaN` sẽ lan truyền ra toàn bộ hệ thống tính toán tài chính/giỏ hàng.

---

## 4. File Code Thực Hành

- [11-arithmetic-quirks-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/11-arithmetic-quirks-demo.js): Code thực nghiệm chia cho 0, unary casting, cạm bẫy modulo số âm, và kiểm chứng hiện tượng mất độ chính xác khi vượt ngưỡng `MAX_SAFE_INTEGER`. Chạy bằng: `node 11-arithmetic-quirks-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Biểu thức `1 / 0` và `0 / 0` trong JavaScript trả về kết quả gì?**
   *Đáp án:* `1 / 0` trả về `Infinity`, còn `0 / 0` trả về `NaN`. Cả hai đều không ném Exception.
2. **Làm thế nào để tính toán chính xác với các ID hoặc số tiền lớn hơn 9 triệu tỉ (vượt ngưỡng 53-bit)?**
   *Đáp án:* Sử dụng kiểu dữ liệu `BigInt` (ví dụ: `12345678901234567890n`).
