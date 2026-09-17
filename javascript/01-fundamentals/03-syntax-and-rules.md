# Cú Pháp & Quy Tắc Ngữ Pháp (JavaScript Syntax & Lexical Rules)

Tài liệu ôn tập về cấu tạo ngữ pháp JavaScript: Literals, Expressions vs Statements, Identifier Rules, Phân biệt hoa thường, và cạm bẫy ASI (Automatic Semicolon Insertion).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):** [01-script-placement-and-loading.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-script-placement-and-loading.md)
- **Mở rộng tiếp theo (Next Steps):** [01-variables-scope.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-variables-scope.js) (Khai báo biến chi tiết `var`/`let`/`const`).
- **Khái niệm liên quan (Related):**
  - Quá trình phân tích mã nguồn (Lexing / Tokenization ➔ Abstract Syntax Tree - AST).
  - Cơ chế tự động chèn dấu chấm phẩy (Automatic Semicolon Insertion - ASI).

---

## 2. Bản Chất Hoạt Động (Mental Model: Cấu Trúc Ngữ Pháp)

### 1. Fixed Values (Literals) vs Variable Values (Variables)
- **Literals (Hằng giá trị thô):** Giá trị tự thân cố định được viết trực tiếp vào mã nguồn:
  - Số: `42`, `3.14`
  - Chuỗi: `"text"`, `'text'`, \`template literal\`
  - Boolean: `true`, `false`
  - Object/Array literal: `{ a: 1 }`, `[1, 2, 3]`
- **Variables (Biến số):** Vùng nhớ được đặt tên để lưu trữ và biến đổi giá trị (`let`, `const`, `var`).

### 2. Expressions (Biểu thức) vs Statements (Câu lệnh)
- **Expression (Biểu thức):** Bất kỳ đoạn mã nào **tính toán và trả về một giá trị** (VD: `5 + 10`, `x * 2`, `isActive ? "Yes" : "No"`). Có thể truyền làm tham số cho hàm.
- **Statement (Câu lệnh):** Một chỉ thị ra lệnh cho trình duyệt thực hiện một hành động (VD: `if (...) { ... }`, `for (...) { ... }`, `return;`). Statement không trả về giá trị để gán vào biến được.

### 3. Quy Tắc Đặt Tên Định Danh (Identifiers)
- Bắt buộc phải bắt đầu bằng: **Chữ cái (`a-z`, `A-Z`)**, **Dấu gạch dưới (`_`)**, hoặc **Ký hiệu đô la (`$`)**.
- Không được bắt đầu bằng chữ số (VD: `1user` là lỗi cú pháp, nhưng `user1` hợp lệ).
- Không được trùng với từ khóa bảo lưu (Reserved Keywords: `class`, `function`, `return`, `let`, `if`, v.v.).
- **Case-Sensitive (Phân biệt hoa - thường):** `myVariable` và `myvariable` là hai biến hoàn toàn khác nhau trong bảng ký hiệu (Symbol Table).
- **Quy ước đặt tên (Naming Conventions):**
  - `lowerCamelCase`: Dành cho biến, hàm, phương thức (VD: `calculateTotalPrice`).
  - `UpperCamelCase` (PascalCase): Dành cho Class, Constructor, React Component (VD: `UserProfile`).
  - `SCREAMING_SNAKE_CASE`: Dành cho hằng số bất biến toàn cục (VD: `MAX_RETRY_COUNT`).

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Cạm bẫy ASI (Automatic Semicolon Insertion)
JavaScript có cơ chế tự động chèn dấu chấm phẩy `;` vào cuối dòng nếu thiếu. Tuy nhiên, cơ chế này gây ra lỗi tai hại nhất với từ khóa `return`:

```javascript
// NGUY HIỂM:
function getUser() {
  return 
  {
    name: "Alice"
  };
}
console.log(getUser()); // KẾT QUẢ: undefined!
```

**Giải thích cơ chế ngầm:**
JS Engine thấy sau `return` là một ký tự xuống dòng (linebreak), nó tự động chèn dấu chấm phẩy ngay sau `return;` ➔ Khiến hàm kết thúc lập tức và trả về `undefined`. Khối `{ name: "Alice" }` bên dưới bị hiểu thành một block code độc lập không được thực thi.

**Cách khắc phục chuẩn:**
Luôn mở dấu ngoặc nhọn `{` hoặc ngoặc tròn `(` ngay trên cùng dòng với `return`:
```javascript
function getUser() {
  return {
    name: "Alice"
  };
}
```

---

## 4. File Code Thực Hành

- [03-syntax-rules-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/03-syntax-rules-demo.js): Minh họa phân biệt hoa thường, Expressions vs Statements, và test case chứng minh bẫy ASI. Chạy bằng: `node 03-syntax-rules-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Đoạn code sau đây `const x = if (true) { 10 };` có hợp lệ không và tại sao?**
   *Đáp án:* Không hợp lệ (SyntaxError). Vì `if` là một Statement (câu lệnh), không phải là Expression (biểu thức), nên không thể trả về giá trị để gán cho biến. Thay vào đó phải dùng Ternary Operator: `const x = true ? 10 : 0;`.
2. **Tên biến nào sau đây hợp lệ trong JavaScript?**
   `$value`, `_id`, `2users`, `user-name`, `let`
   *Đáp án:* `$value` và `_id` hợp lệ. `2users` (bắt đầu bằng số), `user-name` (dấu gạch ngang bị hiểu là toán tử trừ), và `let` (từ khóa bảo lưu) đều không hợp lệ.
