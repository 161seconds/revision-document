# Câu Lệnh & Khối Lệnh (JavaScript Statements & Code Blocks)

Tài liệu ôn tập về bản chất câu lệnh, quy tắc phân tách bằng dấu chấm phẩy, cơ chế gom nhóm khối lệnh `{}` và phạm vi ngữ cảnh Lexical.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):** [03-syntax-and-rules.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/03-syntax-and-rules.md) (Quy tắc ngữ pháp và biểu thức).
- **Mở rộng tiếp theo (Next Steps):** [01-variables-scope.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-variables-scope.js) (Phạm vi khối `{}` ảnh hưởng tới `let`/`const` như thế nào).
- **Khái niệm liên quan (Related):**
  - Môi trường từ vựng (Lexical Environment) và Call Stack.
  - Vòng lặp và cấu trúc rẽ nhánh (Control Flow).

---

## 2. Bản Chất Hoạt Động (Mental Model: Statements & Blocks)

### 1. Câu Lệnh (Statements)
- Là đơn vị chỉ thị cơ bản để trình thông dịch (JavaScript Engine) thực thi một hành động.
- Chương trình JavaScript là một danh sách các câu lệnh được thực thi tuần tự từ trên xuống dưới trong **Call Stack** (Đơn luồng - Single-threaded).
- **Dấu chấm phẩy (`;`):** Phân định ranh giới kết thúc của một câu lệnh. Cho phép viết nhiều câu lệnh trên cùng một dòng:
  ```javascript
  let a = 1; let b = 2; let c = a + b;
  ```

### 2. Khối Lệnh (Code Blocks `{}`)
- Mục đích của `{ ... }` là gom nhóm nhiều câu lệnh lại để cùng được thực thi đồng thời.
- Thường xuất hiện trong: thân hàm (`function`), câu lệnh điều kiện (`if...else`), vòng lặp (`for`, `while`).
- **Tác động tới bộ nhớ:** Khối `{}` tạo ra một **Block Scope (Môi trường Lexical độc lập)** đối với các biến khai báo bằng `let` và `const`. Biến bên trong không thể rò rỉ ra bên ngoài khối.

### 3. Các Từ Khóa Mở Đầu Câu Lệnh Phổ Biến (Statement Keywords)
- Khai báo: `let`, `const`, `var`.
- Điều kiện: `if`, `else`, `switch`, `case`, `default`.
- Vòng lặp: `for`, `while`, `do...while`, `break`, `continue`.
- Hàm: `function`, `return`.
- Xử lý lỗi: `try`, `catch`, `finally`, `throw`.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

1. **Hiểu lầm về Scope của khối lệnh độc lập khi dùng `var`:**
   ```javascript
   {
     var x = 10;
     let y = 20;
   }
   console.log(x); // 10 (var rò rỉ ra ngoài vì không có block scope!)
   console.log(y); // ReferenceError: y is not defined (let được bảo vệ bên trong block)
   ```
2. **Quy tắc ngắt dòng (Line Breaking):**
   - Khi câu lệnh quá dài, vị trí an toàn nhất để ngắt dòng là **ngay sau một toán tử** (như `+`, `,`, `&&`), vì parser sẽ hiểu chắc chắn biểu thức chưa kết thúc:
     ```javascript
     const message = "Xin chào " +
       userName + ", chúc bạn một ngày làm việc tốt lành!";
     ```

---

## 4. File Code Thực Hành

- [04-statements-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/04-statements-demo.js): Minh họa tuần tự thực thi, khối lệnh độc lập, và sự cô lập phạm vi của `let` vs `var`. Chạy bằng: `node 04-statements-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Dấu ngoặc nhọn `{}` đứng độc lập (không thuộc hàm hay `if`) có tạo ra phạm vi biệt lập cho biến không?**
   *Đáp án:* Có, đối với `let` và `const` (tạo Block Scope riêng). Hoàn toàn không có tác dụng cô lập đối với `var`.
2. **Có bắt buộc phải đặt dấu chấm phẩy `;` ở cuối mỗi câu lệnh không?**
   *Đáp án:* Kỹ thuật thì không bắt buộc nhờ cơ chế ASI, nhưng thực tế **luôn được khuyến nghị sử dụng** trong các quy chuẩn code (như Airbnb, Google Style Guides) để tránh các lỗi tiềm ẩn khi minify hoặc nối file.
