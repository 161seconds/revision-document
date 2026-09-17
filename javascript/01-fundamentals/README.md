# 01 - JavaScript Fundamentals (Nền Tảng Cốt Lõi)

Tài liệu ôn tập chuyên sâu về cơ chế biến, vùng nhớ, kiểu dữ liệu, ép kiểu và toán tử trong JavaScript.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):** Kiến thức lập trình cơ bản (biến, điều kiện, vòng lặp).
- **Mở rộng tiếp theo (Next Steps):** [02-functions-and-scope/](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/) (Hiểu Execution Context & Lexical Scope ở đây là chìa khóa để nắm Closure).
- **Kiến thức liên đới (Related):**
  - [TypeScript: Types & Interfaces](file:///d:/my-project/revision-document/typescript/01-types-and-interfaces/) (Hệ thống kiểu tĩnh xây dựng trên các kiểu nguyên thủy này).
  - [JavaScript Data Structures](file:///d:/my-project/revision-document/javascript/03-data-structures/) (Pass-by-value vs Pass-by-reference).

---

## 2. Bản Chất Hoạt Động (Under the Hood / Mental Model)

### Call Stack vs Memory Heap
- **Call Stack (Ngăn xếp thực thi):** Lưu trữ Execution Context, các hàm đang gọi và **các biến kiểu nguyên thủy (Primitive Types)** có kích thước cố định.
- **Memory Heap (Vùng nhớ đệm tự do):** Lưu trữ các đối tượng phức tạp (**Reference Types: Object, Array, Function**) có kích thước động. Biến trong Call Stack chỉ lưu con trỏ (pointer/reference) chỉ tới địa chỉ ô nhớ trong Heap.

### Cơ Chế Hoisting & Temporal Dead Zone (TDZ)
1. **Creation Phase:** JS Engine quét code, cấp phát vùng nhớ:
   - `var`: Được gán giá trị khởi tạo `undefined`.
   - `let` & `const`: Được đưa vào vùng nhớ nhưng **không khởi tạo**. Nằm trong vùng chết tạm thời (TDZ) từ đầu block cho đến dòng khai báo.
   - `function declaration`: Được hoisted toàn bộ (cả tên lẫn thân hàm).
2. **Execution Phase:** Chạy từng dòng code và gán giá trị thực tế.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

1. **Gán lại thuộc tính của `const` Object:**
   ```javascript
   const user = { name: "Alice" };
   user.name = "Bob"; // HOÀN TOÀN HỢP LỆ (chỉ con trỏ reference bị cố định, dữ liệu trong Heap vẫn đổi được)
   // user = {}; // TypeError: Assignment to constant variable
   ```
2. **Quirk `typeof null === 'object'`:**
   - Lỗi lịch sử từ phiên bản JS đầu tiên (năm 1995) do nhãn kiểu nhị phân `000` đại diện cho Object, mà `null` là con trỏ rỗng (`0x00`).
   - *Cách check đúng:* `value === null`.
3. **Toán tử ép kiểu ngầm (Implicit Coercion):**
   ```javascript
   "5" + 2   // "52" (Ưu tiên phép nối chuỗi)
   "5" - 2   // 3    (Toán tử trừ ép chuỗi thành số)
   [] + {}   // "[object Object]"
   true + 1  // 2    (true ép thành số 1)
   ```
4. **So sánh Loose `==` vs Strict `===`:**
   - Luôn dùng `===` để tránh bẫy coercion (`"" == 0` là `true`, `null == undefined` là `true`).

---

## 4. Danh Sách Code Thực Hành

- [00-introduction.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/00-introduction.md): Lý thuyết tổng quan & năng lực của JavaScript trong trình duyệt.
- [00-intro-demo.html](file:///d:/my-project/revision-document/javascript/01-fundamentals/00-intro-demo.html): Demo trực quan 4 khả năng thao tác DOM căn bản.
- [01-script-placement-and-loading.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-script-placement-and-loading.md): Vị trí nhúng thẻ script, cơ chế Parser Blocking, `async` vs `defer`.
- [01-script-placement-demo.html](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-script-placement-demo.html): Demo so sánh trực tiếp script trong head, body và external.
- [02-output-methods.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/02-output-methods.md): 4 phương thức xuất dữ liệu, bẫy `document.write` và kỹ thuật DevTools Console.
- [02-output-demo.html](file:///d:/my-project/revision-document/javascript/01-fundamentals/02-output-demo.html): Demo tương tác các cách xuất dữ liệu và thí nghiệm xóa trang.
- [02-console-tools.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/02-console-tools.js): Kỹ thuật dùng console chuyên nghiệp (`table`, `time`, `count`).
- [03-syntax-and-rules.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/03-syntax-and-rules.md): Quy tắc cú pháp, Expressions vs Statements, Identifier rules, và bẫy ASI.
- [03-syntax-rules-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/03-syntax-rules-demo.js): Minh họa phân biệt hoa thường, biểu thức và kiểm chứng bẫy ASI.
- [04-statements-and-blocks.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/04-statements-and-blocks.md): Câu lệnh (Statements), ranh giới dấu chấm phẩy, khối lệnh `{}` và Block Scope.
- [04-statements-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/04-statements-demo.js): Minh họa nhiều câu lệnh trên 1 dòng, khối lệnh độc lập và kiểm chứng scope.
- [05-comments-and-jsdoc.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/05-comments-and-jsdoc.md): Chú thích, bẫy lồng comment, quy tắc Clean Code và chuẩn JSDoc.
- [05-jsdoc-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/05-jsdoc-demo.js): Minh họa các thẻ JSDoc (@param, @returns, @typedef, @deprecated) cung cấp gợi ý kiểu.
- [06-variables-declaration-rules.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/06-variables-declaration-rules.md): 4 cách khai báo biến, tính bất biến tham chiếu của `const`, và Strict Mode.
- [06-variables-strict-mode-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/06-variables-strict-mode-demo.js): Minh họa khai báo nhiều biến, tính chất của const/let và tác dụng của "use strict".
- [01-variables-scope.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-variables-scope.js): Minh họa Scope, Hoisting và TDZ.
- [02-data-types.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/02-data-types.js): Phân biệt Primitive vs Reference, sao chép nông vs sâu.
- [practice.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/practice.js): Bài tập tự luyện kèm assertions kiểm tra kết quả.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Dòng code sau in ra gì và tại sao?**
   ```javascript
   console.log(typeof a);
   console.log(typeof b);
   var a = 1;
   let b = 2;
   ```
   *Đáp án:* `typeof a` in ra `undefined` (hoisted). `typeof b` ném lỗi `ReferenceError` (đang nằm trong TDZ).

2. **Làm sao để clone một object lồng nhau hoàn toàn độc lập (Deep Clone)?**
   *Đáp án:* Dùng hàm chuẩn hiện đại `structuredClone(obj)` thay vì spread operator `{ ...obj }` (chỉ shallow copy).
