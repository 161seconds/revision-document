# Điều Kiện, Rẽ Nhánh & Logic (JavaScript Conditionals, Switch & Booleans)

Tài liệu ôn tập toàn diện về cấu trúc rẽ nhánh trong JavaScript: `if...else`, toán tử 3 ngôi (Ternary), câu lệnh `switch` với so khớp nghiêm ngặt (`===`), cạm bẫy fallthrough, block scope trong `case`, và đánh giá ngắn mạch (Short-circuiting).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [10-operators-and-precedence.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/10-operators-and-precedence.md) (Toán tử logic & short-circuit).
  - [13-comparisons-and-equality.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/13-comparisons-and-equality.md) (Đẳng thức so sánh `===`).
- **Mở rộng tiếp theo (Next Steps):**
  - [15-loops-and-control-flow.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/15-loops-and-control-flow.md) (Vòng lặp và kiểm soát luồng `break`/`continue`).
  - Pattern Matching trong các ngôn ngữ hiện đại & Thay thế `switch` bằng Object/Map Lookup table.
- **Khái niệm liên quan (Related):**
  - Falsy values: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`.
  - Block Scope `{}` trong thân `case`.

---

## 2. Bản Chất Hoạt Động (Mental Model: Luồng Điều Khiển & So Khớp Case)

### 1. Cơ Chế Ép Kiểu Boolean Của `if (condition)`
Mọi biểu thức đặt trong `if (...)` đều được JavaScript tự động gọi hàm trừu tượng `ToBoolean(value)`:
- Chỉ có 8 giá trị **Falsy**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`.
- **Mọi giá trị khác đều là Truthy**, bao gồm cả `[]` (mảng rỗng), `{}` (object rỗng), `"0"` (chuỗi có ký tự 0), và `"false"` (chuỗi ký tự false)!

### 2. Bản Chất Của `switch...case`
- Câu lệnh `switch (expression)` so sánh `expression` với từng `case value` bằng **Strict Equality (`===`)**, không có bất kỳ sự ép kiểu nào diễn ra:
  ```javascript
  const role = "1";
  switch (role) {
    case 1:
      // KHÔNG BAO GIỜ lọt vào đây vì "1" !== 1
      break;
    case "1":
      // Khớp chính xác!
      break;
  }
  ```
- **Cơ chế Fallthrough:** Nếu không có từ khóa `break`, con trỏ thực thi sẽ tiếp tục trôi xuống chạy toàn bộ code của các `case` bên dưới bất kể điều kiện có khớp hay không, cho đến khi gặp `break` hoặc kết thúc khối `switch`.

### 3. Toán Tử Ba Ngôi (Ternary Operator `condition ? expr1 : expr2`)
- Là **biểu thức (Expression)** chứ không phải câu lệnh (Statement), nên có thể gán trực tiếp vào biến hoặc return.
- Đánh giá lười (Lazy evaluation): Chỉ một trong hai nhánh `expr1` hoặc `expr2` được tính toán tùy thuộc vào điều kiện.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy Block Scope trong `switch...case` (Lexical Declaration Error)
Toàn bộ khối lệnh của `switch` dùng chung **một Lexical Scope**. Khai báo `let` hoặc `const` trong `case` này có thể gây lỗi trùng biến ở `case` khác hoặc lỗi Temporal Dead Zone (TDZ):
```javascript
// SAI - Lỗi SyntaxError hoặc ReferenceError
switch (action) {
  case "create":
    let message = "Created"; // Khai báo message
    break;
  case "update":
    let message = "Updated"; // SyntaxError: Identifier 'message' has already been declared
    break;
}

// ĐÚNG CHUẨN: Bọc từng case trong cặp ngoặc nhọn {} để tạo Block Scope riêng
switch (action) {
  case "create": {
    let message = "Created";
    break;
  }
  case "update": {
    let message = "Updated"; // Hợp lệ! Scope hoàn toàn độc lập.
    break;
  }
}
```

### 2. Quên `break` ngoài ý muốn (Accidental Fallthrough)
```javascript
const tier = "VIP";
let discount = 0;
switch (tier) {
  case "VIP":
    discount = 0.2; // Quên break!
  case "Standard":
    discount = 0.05; // Ghi đè discount của VIP thành 0.05!
    break;
}
```

### 3. Bẫy lạm dụng toán tử 3 ngôi lồng nhau (Nested Ternary Spaghetti)
- Viết lồng quá nhiều cấp `a ? b : c ? d : e ? f : g` gây khó đọc, khó debug và vi phạm chuẩn Clean Code. Nên thay thế bằng `if...else if` rõ ràng hoặc lookup table.

---

## 4. File Code Thực Hành

- [14-conditionals-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/14-conditionals-demo.js): Code thực nghiệm Falsy coercion, so khớp strict trong `switch`, bẫy scope `{}` trong `case`, và kỹ thuật thay thế `switch` bằng Object Lookup / Map. Chạy bằng: `node 14-conditionals-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Điều kiện `if ([])` và `if ("0")` đánh giá là `true` hay `false`? Tại sao?**
   *Đáp án:* Cả hai đều đánh giá là `true` (Truthy). Trong JavaScript, chỉ có 8 giá trị falsy cụ thể; mảng rỗng `[]` là một object và chuỗi `"0"` có độ dài > 0 nên đều là truthy.
2. **Tại sao nên bọc thân các nhánh `case` trong câu lệnh `switch` bằng cặp ngoặc nhọn `{}`?**
   *Đáp án:* Để tạo ra một Block Scope riêng biệt cho mỗi `case`, tránh lỗi `SyntaxError` do khai báo trùng biến `let`/`const` và tránh lỗi rò rỉ TDZ giữa các nhánh `case`.
