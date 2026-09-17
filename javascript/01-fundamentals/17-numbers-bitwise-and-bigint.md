# Số Học Nâng Cao, Bitwise & BigInt (JavaScript Numbers, Bitwise & BigInt)

Tài liệu ôn tập toàn diện về kiểu số trong JavaScript: Cơ chế IEEE 754 64-bit, các phương thức parse số, hằng số `Number`, thao tác nhị phân 32-bit (Bitwise), và kiểu số nguyên vô hạn `BigInt` kèm cạm bẫy serialize JSON.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [09-data-types-deep-dive.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/09-data-types-deep-dive.md) (Kiểu dữ liệu Number & BigInt).
  - [11-arithmetic-and-math-quirks.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/11-arithmetic-and-math-quirks.md) (Sai số `MAX_SAFE_INTEGER`).
- **Mở rộng tiếp theo (Next Steps):**
  - WebGL / WebAssembly / TypedArrays (`Int32Array`, `BigInt64Array`): Tối ưu hóa bộ nhớ cấp thấp.
  - Mật mã học (Cryptography) & Xử lý số tiền / ID cơ sở dữ liệu (Snowflake ID 64-bit).
- **Khái niệm liên quan (Related):**
  - 32-bit Signed Integers trong Bitwise Engine.
  - Hằng số sai số máy tính `Number.EPSILON`.

---

## 2. Bản Chất Hoạt Động (Mental Model: Double Precision & 32-bit Bitwise)

### 1. Bản Chất IEEE 754 Floating-Point (64-bit)
JavaScript chỉ có một kiểu số duy nhất cho số thực và số nguyên thông thường: **Double-precision 64-bit**:
- 1 bit dấu (Sign).
- 11 bit số mũ (Exponent).
- 52 bit phần định trị (Mantissa / Fraction).
➔ Do không thể biểu diễn chính xác phân số 1/10 trong hệ nhị phân, `0.1 + 0.2 = 0.30000000000000004`.
➔ **Giải pháp:** Sử dụng `Number.EPSILON` để so sánh dung sai: `Math.abs((0.1 + 0.2) - 0.3) < Number.EPSILON`.

### 2. Các Hằng Số Trọng Yếu Của Đối Tượng `Number`
- `Number.MAX_SAFE_INTEGER` = `9007199254740991` (`2^53 - 1`).
- `Number.MIN_SAFE_INTEGER` = `-9007199254740991`.
- `Number.MAX_VALUE` = `1.7976931348623157e+308` (Số dương lớn nhất có thể biểu diễn trước khi thành `Infinity`).
- `Number.MIN_VALUE` = `5e-324` (**LƯU Ý:** Đây là **số dương nhỏ nhất gần 0 nhất**, KHÔNG PHẢI số âm nhỏ nhất!).

### 3. Parse Số: `parseInt` vs `parseFloat` vs `Number()`
| Hàm | Chuỗi `"42px"` | Chuỗi `""` (Rỗng) | Chuỗi `null` | Cơ chế |
| :--- | :--- | :--- | :--- | :--- |
| `parseInt(str, radix)` | `42` | `NaN` | `NaN` | Đọc từ trái sang phải đến khi gặp ký tự lạ. **Luôn truyền radix = 10!** |
| `parseFloat(str)` | `42` | `NaN` | `NaN` | Tương tự parseInt nhưng đọc thêm phần thập phân. |
| `Number(str)` | `NaN` | **`0`** | **`0`** | Ép kiểu toàn bộ chuỗi theo chuẩn ToNumber. Khắt khe nhất. |

### 4. Cơ Chế Thao Tác Bitwise 32-bit
Khi thực hiện bất kỳ phép toán bitwise nào (`&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`):
1. V8 Engine tạm thời ép kiểu số thực 64-bit về **Số nguyên có dấu 32-bit (32-bit Signed Integer)**.
2. Thực hiện phép toán bit.
3. Chuyển ngược kết quả về số thực 64-bit.
➔ Do đó, bitwise chỉ hoạt động trong khoảng `-(2^31)` đến `2^31 - 1`.
➔ **Ứng dụng kinh điển:** `~~num` hoặc `num | 0` để ép số thực thành số nguyên cực nhanh.

### 5. Kiểu `BigInt` (Số Nguyên Kích Thước Vô Hạn)
- Khởi tạo: thêm hậu tố `n` (ví dụ `12345678901234567890n`) hoặc dùng hàm `BigInt("...")`.
- **Quy tắc bất biến:**
  - Không thể tính toán số học giữa `BigInt` và `Number` (bị ném `TypeError: Cannot mix BigInt and other types`).
  - Không có phần thập phân: `5n / 2n === 2n`.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

1. **Bẫy `parseInt` không truyền Radix:**
   - Trong một số môi trường cũ, `parseInt("08")` bị hiểu là hệ bát phân (Octal) dẫn đến kết quả `0` thay vì `8`.
   - ➔ **Luôn viết:** `parseInt(str, 10)`.

2. **Bẫy `toFixed()` làm tròn không chuẩn (Banker's Rounding / Float Quirks):**
   ```javascript
   (1.005).toFixed(2); // "1.00" thay vì "1.01"! Vì 1.005 trong nhị phân là 1.00499999999999989...
   ```
   - Xử lý tiền tệ chuyên nghiệp: Nhân lên đơn vị nhỏ nhất (Cents / Xu / VNĐ) thành số nguyên, hoặc dùng thư viện `decimal.js` / `bignumber.js`.

3. **Bẫy `JSON.stringify` bị crash với `BigInt`:**
   ```javascript
   JSON.stringify({ id: 12345678901234567890n });
   // TypeError: Do not know how to serialize a BigInt
   ```
   - **Giải pháp:** Monkey-patch hoặc chuyển đổi qua String:
     ```javascript
     BigInt.prototype.toJSON = function () {
       return this.toString();
     };
     ```

---

## 4. File Code Thực Hành

- [17-numbers-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/17-numbers-demo.js): Code thực nghiệm so sánh `EPSILON`, `parseInt` radix, toán tử bitwise 32-bit, và serialize `BigInt` an toàn. Chạy bằng: `node 17-numbers-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao `Number.MIN_VALUE > 0` lại trả về `true` trong JavaScript?**
   *Đáp án:* Vì `Number.MIN_VALUE` đại diện cho giá trị dương nhỏ nhất khác 0 có thể biểu diễn được (`5e-324`), chứ không phải số âm nhỏ nhất. Số âm nhỏ nhất là `-Number.MAX_VALUE`.
2. **Làm thế nào để truyền một Object chứa dữ liệu kiểu `BigInt` qua API `JSON.stringify()` mà không bị crash?**
   *Đáp án:* Định nghĩa phương thức `BigInt.prototype.toJSON = function() { return this.toString(); }` hoặc dùng tham số replacer: `JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? value.toString() : value)`.
