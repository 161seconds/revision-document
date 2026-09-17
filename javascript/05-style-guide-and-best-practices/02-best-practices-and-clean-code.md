# Thực Hành Tốt Nhất & Viết Mã Sạch (JavaScript Best Practices & Clean Code)

Tài liệu chuyên sâu về các chuẩn mực viết mã JavaScript sạch, an toàn và tối ưu trong môi trường Enterprise: Phòng chống ô nhiễm phạm vi toàn cục (Global Scope Pollution), cạm bẫy đối tượng bao bọc nguyên thủy (`new String`, `new Number`), lý do V8 cấm tuyệt đối `eval()` và `with`, và nguyên tắc thiết kế hàm với tham số mặc định.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-fundamentals/07-let-and-const.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/07-let-and-const.md) (Quy tắc ưu tiên `const` > `let`).
  - [02-functions-and-scope/02-parameters-arguments-and-rest.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/02-parameters-arguments-and-rest.md) (Default Parameters).
- **Mở rộng tiếp theo (Next Steps):**
  - [03-common-mistakes-and-anti-patterns.md](file:///d:/my-project/revision-document/javascript/05-style-guide-and-best-practices/03-common-mistakes-and-anti-patterns.md) (Các lỗi sai phổ biến).
  - [04-performance-optimization-and-v8.md](file:///d:/my-project/revision-document/javascript/05-style-guide-and-best-practices/04-performance-optimization-and-v8.md) (Tối ưu hóa V8 TurboFan).
- **Khái niệm liên quan (Related):**
  - Primitive Boxing vs Object Wrappers.
  - De-optimization trong V8 JIT Compiler.
  - Lỗ hổng bảo mật Code Injection (CWE-95).

---

## 2. Bản Chất Hoạt Động (Mental Model: Vì Sao Phải Tuân Thủ Best Practices?)

### 1. Cấm Dùng Constructor Bao Bọc (`new String`, `new Number`, `new Boolean`)
Trong JavaScript, các kiểu nguyên thủy (`string`, `number`, `boolean`) có cơ chế tự động "đóng hộp" (Auto-boxing) khi gọi phương thức (`"abc".toUpperCase()`).
Tuy nhiên, nếu lập trình viên tự gọi `new String("abc")`:
1. V8 buộc phải cấp phát một **Object đầy đủ trên Memory Heap** thay vì lưu giá trị nguyên thủy gọn gàng trên Stack.
2. `typeof new String("abc")` trả về **`"object"`** thay vì `"string"`.
3. So sánh tham chiếu bị phá vỡ:
   ```javascript
   new String("a") === new String("a"); // FALSE! Vì là 2 object khác nhau trên Heap!
   Boolean(new Boolean(false));          // TRUE! Vì mọi Object trong JS đều là Truthy!
   ```
➔ **Quy tắc tuyệt đối:** Luôn luôn sử dụng Literals (`""`, `0`, `false`, `{}`, `[]`).

---

### 2. Phòng Chống Ô Nhiễm Toàn Cục (Zero Global Pollution)
Các biến toàn cục gắn trên `window` (trình duyệt) hoặc `global` (Node.js) có 3 nguy cơ:
- Dễ bị ghi đè ngẫu nhiên từ các thư viện bên thứ 3 (Name Collisions).
- Không bao giờ được Garbage Collector thu dọn rác, gây rò rỉ bộ nhớ vĩnh viễn.
- Khó kiểm thử độc lập (Unit Testing).

➔ **Giải pháp:** Luôn đóng gói mã trong **ES Modules (`import`/`export`)** hoặc mẫu hàm tự thực thi (IIFE):
```javascript
(() => {
  // Toàn bộ biến nằm trong Local Scope, an toàn tuyệt đối!
  const appConfig = { port: 3000 };
})();
```

---

### 3. Lý Do V8 Cấm Tuyệt Đối `eval()` và `with`
1. **Lỗ hổng bảo mật Injection**: `eval(userInput)` cho phép kẻ tấn công thực thi mã JavaScript độc hại tùy ý.
2. **Hủy diệt tối ưu hóa của V8 (JIT De-optimization)**:
   - Trình biên dịch V8 TurboFan tối ưu tốc độ dựa trên việc phân tích tĩnh phạm vi biến (Lexical Scope) trước khi chạy.
   - Khi có `eval()` hoặc `with`, V8 **không thể biết trước biến nào sẽ bị thay đổi tại runtime**.
   - Hậu quả: V8 buộc phải **tắt toàn bộ tối ưu hóa (De-opt)** và chuyển sang chế độ thông dịch bytecode chậm chạp!
3. Chế độ `"use strict"` **cấm hoàn toàn câu lệnh `with`** (gây lỗi `SyntaxError`).

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy `new Boolean(false)` luôn là Truthy
```javascript
const flag = new Boolean(false);
if (flag) {
  console.log("VẪN CHẠY VÀO ĐÂY!"); // BẪY CHẾT NGƯỜI: flag là một Object!
}
```

### 2. Bẫy quên nhánh `default` trong câu lệnh `switch`
Nếu một trường hợp mới không khớp với bất kỳ `case` nào, việc thiếu `default` sẽ khiến chương trình bỏ qua âm thầm mà không ghi lại log cảnh báo.

---

## 4. File Code Thực Hành

- [02-best-practices-demo.js](file:///d:/my-project/revision-document/javascript/05-style-guide-and-best-practices/02-best-practices-demo.js): Code thực nghiệm cạm bẫy `new Boolean(false)` biến thành truthy, sự khác biệt giữa Primitive vs Object Wrappers, đóng gói phạm vi bằng IIFE, và kiểm chứng Strict Mode cấm câu lệnh `with`. Chạy bằng: `node 02-best-practices-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao biểu thức `if (new Boolean(false))` lại đánh giá thành `true`?**
   *Đáp án:* Vì toán tử `new Boolean(false)` không tạo ra giá trị boolean nguyên thủy, mà tạo ra một đối tượng bao bọc (Object Wrapper) trên Memory Heap. Theo đặc tả ECMAScript, mọi đối tượng (Object) trong ngữ cảnh boolean đều luôn luôn là Truthy, bất kể giá trị bọc bên trong của nó là gì.

2. **Tại sao câu lệnh `with` bị cấm hoàn toàn trong Strict Mode?**
   *Đáp án:* Vì câu lệnh `with (obj)` mở rộng chuỗi phạm vi (Scope Chain) một cách động tại thời điểm chạy. Nó khiến engine không thể phân biệt được một định danh là thuộc tính của đối tượng hay biến cục bộ, gây ra các lỗi rò rỉ biến khó lường và vô hiệu hóa các thuật toán tối ưu hóa phân tích tĩnh của trình biên dịch JIT.
