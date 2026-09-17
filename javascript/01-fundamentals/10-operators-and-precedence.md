# Toàn Tập Về Toán Tử & Độ Ưu Tiên (JavaScript Operators & Precedence)

Tài liệu ôn tập toàn diện về các nhóm toán tử trong JavaScript, thứ tự ưu tiên (Precedence), cơ chế đánh giá ngắn mạch (Short-Circuit), và toán tử Nullish Coalescing (`??`).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):** [09-data-types-deep-dive.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/09-data-types-deep-dive.md) (Nắm vững 8 kiểu dữ liệu).
- **Mở rộng tiếp theo (Next Steps):** Cấu trúc rẽ nhánh điều kiện `if...else` và vòng lặp `for`/`while`.
- **Khái niệm liên quan (Related):**
  - Cơ chế ép kiểu ngầm (Implicit Type Coercion).
  - Bảng ưu tiên toán tử (MDN Operator Precedence Table).

---

## 2. Bản Chất Hoạt Động (Mental Model: 5 Nhóm Toán Tử Cốt Lõi)

### 1. Toán Tử Số Học (Arithmetic)
- `+`, `-`, `*`, `/`, `%` (Chia lấy phần dư), `**` (Lũy thừa ES6).
- **Tiền tố vs Hậu tố (`++x` vs `x++`):**
  - `++x` (Prefix): Tăng giá trị ô nhớ lên 1 **trước**, sau đó mới trả về giá trị mới.
  - `x++` (Postfix): Trả về giá trị hiện tại **trước**, sau đó mới tăng giá trị ô nhớ lên 1.

### 2. Toán Tử So Sánh (Comparison)
- **Strict Equality (`===`, `!==`):** So sánh cả giá trị lẫn kiểu dữ liệu. **Luôn sử dụng mặc định.**
- **Loose Equality (`==`, `!=`):** Ép kiểu ngầm trước khi so sánh. Cực kỳ nguy hiểm (`0 == ""` là `true`, `false == "0"` là `true`).

### 3. Đánh Giá Ngắn Mạch (Short-Circuit Evaluation: `&&` và `||`)
Trong JavaScript, `&&` và `||` không chỉ trả về `true`/`false` mà **trả về chính toán hạng quyết định kết quả**:
- `A && B`: Nếu `A` là Falsy, dừng lại và trả về `A`. Nếu `A` là Truthy, tiếp tục chạy và trả về `B`.
- `A || B`: Nếu `A` là Truthy, dừng lại và trả về `A`. Nếu `A` là Falsy, tiếp tục chạy và trả về `B`.

### 4. Nullish Coalescing (`??`) vs Logical OR (`||`)
Đây là điểm phân biệt sống còn trong lập trình thực tế:
- `||` kiểm tra **Falsy** (`false`, `0`, `""`, `null`, `undefined`, `NaN`).
- `??` chỉ kiểm tra **Nullish** (`null` và `undefined`).

```javascript
const userSettings = { volume: 0 };

const vol1 = userSettings.volume || 50; // 50 (SAI: Số 0 là âm lượng hợp lệ nhưng bị coi là falsy!)
const vol2 = userSettings.volume ?? 50; // 0  (ĐÚNG: Số 0 không phải null/undefined)
```

### 5. Toán Tử Gán Logic Hiện Đại (ES2021)
- `x &&= y`: Tương đương `if (x) x = y;`
- `x ||= y`: Tương đương `if (!x) x = y;`
- `x ??= y`: Tương đương `if (x === null || x === undefined) x = y;` (Gán giá trị mặc định nếu biến đang rỗng).

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

1. **Bẫy toán tử cộng chuỗi:**
   ```javascript
   10 + 20 + "px"  // "30px" (10 + 20 = 30 trước, sau đó nối chuỗi)
   "px" + 10 + 20  // "px1020" (Nối chuỗi ngay từ đầu, biến toàn bộ thành chuỗi!)
   "10" - 2        // 8 (Toán tử trừ ép chuỗi về số)
   ```

2. **Độ ưu tiên toán tử (Precedence):**
   - Lũy thừa `**` có chiều kết hợp từ **Phải sang Trái**: `2 ** 2 ** 3` = `2 ** (2 ** 3)` = `2 ** 8` = `256` (không phải `4 ** 3 = 64`).
   - Phép gán `=` cũng có chiều kết hợp từ **Phải sang Trái**: `a = b = c = 5`.

---

## 4. File Code Thực Hành

- [10-operators-precedence-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/10-operators-precedence-demo.js): Kiểm chứng Prefix/Postfix, Short-circuit, so sánh `||` vs `??`, và toán tử gán logic `??=`. Chạy bằng: `node 10-operators-precedence-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Biểu thức `false || "0" && null ?? 100` trả về kết quả gì?**
   *Đáp án:* Trả về `100`. Phép `&&` có độ ưu tiên cao hơn `||`: `"0" && null` ra `null`. Tiếp theo `false || null` ra `null`. Cuối cùng `null ?? 100` ra `100`.
2. **Tại sao nên dùng `??` thay vì `||` khi thiết lập giá trị mặc định cho cấu hình số nguyên hoặc chuỗi?**
   *Đáp án:* Vì `||` sẽ vô tình ghi đè số `0` hoặc chuỗi rỗng `""` bằng giá trị mặc định (do coi chúng là falsy), trong khi `??` bảo toàn chính xác số `0` và `""`.
