# Lỗi Im Lặng & Lập Trình Phòng Thủ (JavaScript Silent Errors & Defensive Coding)

Tài liệu chuyên sâu về hiện tượng "Lỗi Im Lặng" (Silent Errors) trong JavaScript: Căn nguyên lịch sử từ năm 1995, 6 bẫy logic âm thầm phá hoại luồng dữ liệu (`Infinity`, `NaN` Propagation, phép gán trong `if`, ép kiểu ngầm, thuộc tính `undefined`), và kỹ thuật triệt tiêu lỗi im lặng bằng Strict Mode cùng TypeScript/Linter.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-js-errors-and-built-in-types.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/01-js-errors-and-built-in-types.md) (Ngoại lệ Runtime và Stack Unwinding).
  - [01-fundamentals/13-comparisons-and-equality.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/13-comparisons-and-equality.md) (Toán tử `==` vs `===` và ép kiểu ngầm).
- **Mở rộng tiếp theo (Next Steps):**
  - [03-error-statements-and-handling.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/03-error-statements-and-handling.md) (Chủ động kiểm soát luồng lỗi với `try...catch`).
  - [05-debugging-and-devtools.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/05-debugging-and-devtools.md) (Truy vết lỗi logic bằng Breakpoints và Console).
- **Khái niệm liên quan (Related):**
  - "Fail Fast" Architecture vs "Forgiving Language" Design.
  - Sự lan truyền của `NaN` (NaN Contamination / Poisoning).
  - Khung bảo vệ `"use strict"` (Strict Mode Directives).

---

## 2. Bản Chất Hoạt Động (Mental Model: Vì Sao JavaScript Không Crash?)

### 1. Căn Nguyên Lịch Sử: Ngôn Ngữ Vị Tha (Forgiving Language)
Năm 1995, Brendan Eich thiết kế JavaScript trong 10 ngày cho trình duyệt Netscape Navigator 2.0:
- Mục tiêu ban đầu: Cho phép các nhà thiết kế web bổ sung tương tác nhỏ (như hiệu ứng nút bấm, kiểm tra form đơn giản).
- **Quy tắc thiết kế cốt lõi**: "Không bao giờ được làm sập trang web của người dùng".
- JavaScript ban đầu không có cơ chế ngoại lệ `try...catch` (mãi đến ECMAScript 3 năm 1999 mới có).
- Hệ quả: JavaScript được thiết kế để **nuốt chửng lỗi (fail silently)** — tự động ép kiểu, trả về `undefined`, `NaN`, hoặc `Infinity` thay vì dừng chương trình.

---

### 2. Danh Mục 6 Lỗi Im Lặng Phổ Biến Nhất

#### a. Phép gán vô tình trong câu lệnh điều kiện
```javascript
let isActive = false;
// BẪY: Dùng 1 dấu '=' (phép gán) thay vì '===':
if (isActive = true) {
  // Biểu thức gán trả về 'true', biến isActive bị sửa thành true!
  console.log("Luôn luôn chạy vào đây!");
}
```

#### b. Sự lan truyền của `NaN` (NaN Poisoning)
Khi một phép toán số học thất bại, JavaScript không ném lỗi mà âm thầm trả về `NaN`:
```javascript
const price = parseInt("abc"); // NaN (không có lỗi)
const total = price * 1.1;     // NaN
const display = total + "$";   // "NaN$" (dữ liệu rác lọt ra giao diện người dùng!)
```

#### c. Phép chia cho 0 ra `Infinity` / `-Infinity`
Khác với Python hay Java ném lỗi `ZeroDivisionError`:
```javascript
const result = 100 / 0; // Infinity (không có ngoại lệ)
```

#### d. Truy cập thuộc tính không tồn tại trả về `undefined`
```javascript
const user = {};
console.log(user.profile); // undefined (không lỗi)
// NHƯNG nếu đọc tiếp cấp 2 thì sẽ vỡ trận thành TypeError:
console.log(user.profile.avatar); // TypeError: Cannot read properties of undefined!
```

#### e. Ép kiểu ngầm toán tử cộng `+`
```javascript
const x = "5" + 2; // "52" (Chuỗi - Không cộng số!)
const y = "5" - 2; // 3 (Số)
```

#### f. Ghi đè biến toàn cục vô ý (Sloppy Mode)
Trong chế độ mặc định không nghiêm ngặt:
```javascript
function save() {
  score = 100; // Quên từ khóa let/const -> Âm thầm tạo biến window.score!
}
```

---

### 3. Strict Mode: Vũ Khí Biến Lỗi Im Lặng Thành Ngoại Lệ
Chỉ thị `"use strict"` giúp biến đổi hàng loạt lỗi im lặng nguy hiểm thành lỗi `TypeError`/`ReferenceError` hiển thị rõ ràng:

| Tình huống | Chế độ thường (Sloppy Mode) | Strict Mode (`"use strict"`) |
| :--- | :--- | :--- |
| Gán biến chưa khai báo (`x = 1`) | Âm thầm tạo biến Global | Ném **`ReferenceError`** |
| Gán đè thuộc tính read-only | Bị lờ đi, không tác dụng | Ném **`TypeError`** |
| Gán đè đối tượng `Object.freeze()` | Bị lờ đi | Ném **`TypeError`** |
| Xóa thuộc tính không thể xóa (`delete Object.prototype`) | Trả về `false` | Ném **`TypeError`** |
| Trùng lặp tên tham số trong hàm | Lấy tham số cuối | Ném **`SyntaxError`** |

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy `NaN` không bằng bất kỳ ai, kể cả chính nó
```javascript
const val = Number("xyz"); // NaN
if (val === NaN) { // BẪY KINH ĐIỂN: NaN === NaN là false!
  console.log("Sẽ không bao giờ được gọi!");
}
```
➔ **Giải pháp:** Dùng `Number.isNaN(val)` thay vì toán tử so sánh `===`.

### 2. Bẫy ép kiểu Falsy trong câu lệnh điều kiện
```javascript
function renderCart(itemCount) {
  // Bẫy: itemCount = 0 (hợp lệ) nhưng 0 là falsy!
  if (!itemCount) {
    console.log("Giỏ hàng rỗng!"); // Báo sai khi có 0 sản phẩm!
  }
}
```
➔ **Giải pháp:** So sánh tường minh `itemCount === 0` hoặc dùng Nullish Coalescing `??`.

---

## 4. File Code Thực Hành

- [02-silent-errors-demo.js](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/02-silent-errors-demo.js): Code thực nghiệm 6 cạm bẫy lỗi im lặng kinh điển, kiểm chứng sự lan truyền của `NaN`, so sánh Sloppy Mode vs Strict Mode biến lỗi im lặng thành `TypeError`, và mô hình lập trình phòng thủ với `Number.isNaN` & Optional Chaining `?.`. Chạy bằng: `node 02-silent-errors-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao JavaScript lại trả về `NaN` hoặc `Infinity` thay vì ném ngoại lệ khi gặp phép toán bất khả thi?**
   *Đáp án:* Đây là đặc trưng thiết kế vị tha (Forgiving) từ phiên bản đầu tiên của JavaScript (1995) nhằm đảm bảo các script trên trình duyệt không làm sập giao diện người dùng. JavaScript tuân theo chuẩn dấu phẩy động IEEE 754, quy định các trạng thái số đặc biệt như `NaN` và `±Infinity` thay vì dừng chương trình.

2. **Strict Mode giải quyết lỗi im lặng khi gán thuộc tính cho một đối tượng đóng băng (`Object.freeze`) như thế nào?**
   *Đáp án:* Trong Sloppy Mode, việc gán giá trị cho một thuộc tính có descriptor `writable: false` hoặc trên một đối tượng đóng băng sẽ bị engine âm thầm lờ đi (không thay đổi giá trị và không báo lỗi). Khi bật `"use strict"`, engine sẽ chặn đứng thao tác và ném ra một ngoại lệ **`TypeError`** ngay tại dòng mã đó.
