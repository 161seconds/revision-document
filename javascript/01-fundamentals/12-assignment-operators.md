# Toán Tử Gán & Cơ Chế Gán Ngắn Mạch (JavaScript Assignment Operators)

Tài liệu ôn tập toàn diện về các toán tử gán trong JavaScript: toán tử gán cơ bản, gán kết hợp số học/bitwise, toán tử gán logic hiện đại (ES2021), và cơ chế short-circuit không kích hoạt setter.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [10-operators-and-precedence.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/10-operators-and-precedence.md) (Thứ tự ưu tiên toán tử).
  - [11-arithmetic-and-math-quirks.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/11-arithmetic-and-math-quirks.md) (Toán tử số học & dị biệt).
- **Mở rộng tiếp theo (Next Steps):**
  - [13-data-structures/](file:///d:/my-project/revision-document/javascript/03-objects-and-arrays/) (Gán phá cấu trúc - Destructuring Assignment nâng cao).
  - Proxy & Reactive Systems (Vue 3 Reactivity, MobX): Cơ chế quan sát phép gán property setter.
- **Khái niệm liên quan (Related):**
  - Thứ tự kết hợp từ phải sang trái (Right-to-Left Associativity).
  - Short-circuit Evaluation (Đánh giá ngắn mạch).

---

## 2. Bản Chất Hoạt Động (Mental Model: Phép Gán & Dưới Tầng Động Cơ)

### 1. Tính Kết Hợp Phải-Sang-Trái (Right-to-Left Associativity)
Toán tử gán `=` có độ ưu tiên thấp hơn các phép toán số học/so sánh, và được đánh giá từ **phải sang trái**:
```javascript
let a, b, c;
a = b = c = 42;
// Tương đương: a = (b = (c = 42))
// c nhận 42, biểu thức (c = 42) trả về 42, gán tiếp cho b, rồi cho a.
```

### 2. Bảng Phân Loại Toán Tử Gán
| Nhóm | Toán tử | Cú pháp viết tắt | Bản chất tương đương |
| :--- | :--- | :--- | :--- |
| **Cơ bản** | `=` | `x = y` | Gán giá trị của `y` cho `x` |
| **Số học** | `+=`, `-=`, `*=`, `/=`, `%=`, `**=` | `x += y` | `x = x + y` (Lưu ý ép kiểu chuỗi với `+=`) |
| **Bitwise** | `&=`, `\|=`, `^=`, `<<=`, `>>=`, `>>>=` | `x \|= y` | `x = x \| y` (Ép kiểu về số nguyên 32-bit) |
| **Logic (ES2021)** | `&&=`, `\|\|=`, `??=` | `x ??= y` | **Chỉ gán khi điều kiện thỏa mãn** |

### 3. Sự Đột Phá Của Toán Tử Gán Logic (ES2021: Logical Assignment)
Trước ES2021, lập trình viên thường viết:
```javascript
x = x || defaultValue;  // Luôn thực hiện phép gán x = ...
```
Từ ES2021, JavaScript giới thiệu 3 toán tử gán ngắn mạch:
- **`x &&= y` (Logical AND assignment):** Chỉ gán `y` cho `x` nếu `x` đang là **Truthy**.
- **`x ||= y` (Logical OR assignment):** Chỉ gán `y` cho `x` nếu `x` đang là **Falsy** (`false`, `0`, `""`, `null`, `undefined`, `NaN`).
- **`x ??= y` (Nullish Coalescing assignment):** Chỉ gán `y` cho `x` nếu `x` là **Nullish** (`null` hoặc `undefined`).

### 4. Cơ Chế Under-the-hood: Short-circuit Assignment vs Re-assignment
Điểm khác biệt chí mạng trong V8 Engine giữa `x = x || y` và `x ||= y`:
```javascript
// Cách cũ: Luôn luôn kích hoạt phép gán (thực thi Property Setter)
obj.count = obj.count || 10; // Setter 'count' LUÔN được gọi dù obj.count đã là 5!

// Chuẩn ES2021: Ngắn mạch hoàn toàn (Short-circuiting)
obj.count ||= 10;            // Nếu obj.count = 5 (truthy), Setter HOÀN TOÀN KHÔNG BỊ GỌI!
```
> [!IMPORTANT]
> Trong các ứng dụng React/Vue sử dụng Proxy/State Tracker, việc gọi setter không cần thiết sẽ kích hoạt Re-render hoặc trigger watchers lãng phí. `??=` và `||=` giúp triệt tiêu hoàn toàn các thao tác ghi thừa.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

1. **Bẫy rò rỉ biến toàn cục khi khai báo chuỗi (Chained Declaration Leak):**
   ```javascript
   function leak() {
     let a = b = 10; // BẪY!
   }
   leak();
   // 'a' có scope trong hàm (bị huỷ sau khi hàm chạy).
   // 'b' không có từ khóa let/const => trở thành biến toàn cục (window.b = 10) trong non-strict mode!
   // Trong Strict Mode: ném lỗi ReferenceError: b is not defined.
   ```

2. **Bẫy `||=` đè mất giá trị `0`, `false`, hoặc chuỗi rỗng `""`:**
   ```javascript
   // Cấu hình số lượt tải tối đa:
   let maxDownloads = 0; // 0 là giá trị hợp lệ (cấm tải)
   maxDownloads ||= 5;   // BẪY! maxDownloads bị đổi thành 5 vì 0 là falsy!

   // Cách đúng: Dùng Nullish Coalescing Assignment
   maxDownloads ??= 5;   // Giữ nguyên 0!
   ```

3. **Nhầm lẫn giữa gán `=` và so sánh `===` trong câu lệnh rẽ nhánh:**
   ```javascript
   if (status = "active") { // BẪY! Biểu thức gán trả về "active" (truthy)
     // Luôn luôn nhảy vào đây!
   }
   ```

---

## 4. File Code Thực Hành

- [12-assignment-operators-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/12-assignment-operators-demo.js): Code thực nghiệm chuỗi gán, bẫy setter trong Proxy/Object, và kiểm chứng sự khác biệt giữa `||=` vs `??=`. Chạy bằng: `node 12-assignment-operators-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao `obj.val = obj.val ?? 10` không tối ưu bằng `obj.val ??= 10`?**
   *Đáp án:* `obj.val = ...` luôn luôn kích hoạt setter của thuộc tính ngay cả khi giá trị không thay đổi, gây overhead hiệu năng hoặc kích hoạt reactive watchers thừa. Trong khi `??=` ngắn mạch và chỉ gán khi `obj.val` thực sự là `null` hoặc `undefined`.
2. **Khi khởi tạo giá trị mặc định cho cấu hình (options/config), tại sao nên dùng `??=` thay vì `||=`?**
   *Đáp án:* Vì `||=` coi `0`, `false`, và chuỗi rỗng `""` là falsy và sẽ đè chúng bằng giá trị mặc định, phá hỏng các thiết lập hợp lệ của người dùng. `??=` chỉ thay thế khi giá trị chưa tồn tại (`null` hoặc `undefined`).
