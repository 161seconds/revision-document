# Chú Thích & Chuẩn JSDoc (JavaScript Comments & Documentation Standards)

Tài liệu ôn tập về chú thích trong JavaScript: Cú pháp cơ bản, cách Lexer xử lý, cạm bẫy lồng comment, và chuẩn tài liệu hóa JSDoc chuyên nghiệp.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):** [03-syntax-and-rules.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/03-syntax-and-rules.md) (Cú pháp cơ bản).
- **Mở rộng tiếp theo (Next Steps):** [01-variables-scope.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-variables-scope.js) (Áp dụng chú thích vào biến và hàm).
- **Khái niệm liên quan (Related):**
  - Quá trình Minification & Bundling (Xóa bỏ comment khi build production).
  - Chuẩn JSDoc và hệ thống gợi ý kiểu dữ liệu (Intellisense) trong Visual Studio Code.

---

## 2. Bản Chất Hoạt Động (Mental Model: Comments & Lexer)

1. **Quá trình Lexing (Tokenization):**
   - Bộ phân tích từ vựng của JavaScript Engine sẽ bỏ qua toàn bộ ký tự nằm trong comment. Comment hoàn toàn không tạo ra bất kỳ bytecode hay tốn bộ nhớ RAM khi chạy.
2. **2 Dạng cú pháp cơ bản:**
   - **Một dòng (`//`):** Bỏ qua mọi ký tự từ sau `//` cho đến hết dòng đó.
   - **Nhiều dòng (`/* ... */`):** Bỏ qua toàn bộ nội dung nằm giữa ký hiệu mở `/*` và đóng `*/`.
3. **Chuẩn tài liệu hóa JSDoc (`/** ... */`):**
   - Không chỉ để giải thích, JSDoc cho phép định nghĩa **kiểu dữ liệu tĩnh (Type Checking)** ngay trong JavaScript thuần mà không cần cài đặt TypeScript.
   - IDE (như VS Code) đọc các thẻ JSDoc để hiển thị bảng hướng dẫn, tự động hoàn thành code (Autocompletion) và cảnh báo truyền sai tham số.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

1. **Lỗi lồng comment nhiều dòng (Nested Multi-line Comments):**
   ```javascript
   /* 
     Bắt đầu comment ngoài
     /* Thử lồng comment trong */ 
     Đoạn này bị lỗi SyntaxError!
   */
   ```
   *Nguyên nhân:* Parser không hỗ trợ lồng comment. Ký hiệu `*/` đầu tiên sẽ lập tức đóng comment, khiến phần còn lại bị coi là code JS không hợp lệ.

2. **Quy tắc Clean Code: Viết "Why", không viết "What":**
   - **Bad (thừa thãi):** `// Gán x bằng 10` ➔ `let x = 10;` (Code đã tự nói lên điều đó).
   - **Good (giải thích lý do/nghiệp vụ):** 
     ```javascript
     // Safari 15.4 trở xuống không hỗ trợ structuredClone, cần fallback thủ công
     const clone = typeof structuredClone === "function" ? structuredClone(data) : JSON.parse(JSON.stringify(data));
     ```

3. **Comment bản quyền trong Minification:**
   - Khi build code bằng Webpack/Vite/esbuild, mọi comment đều bị xóa sạch để giảm dung lượng file.
   - Nếu muốn giữ lại thông tin bản quyền (License), phải dùng ký hiệu đặc biệt: `/*! ... */` hoặc `/** @license ... */`.

---

## 4. File Code Thực Hành

- [05-jsdoc-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/05-jsdoc-demo.js): Minh họa các thẻ JSDoc mạnh mẽ (`@param`, `@returns`, `@deprecated`, `@typedef`) cung cấp gợi ý kiểu dữ liệu chuẩn xác trong JS thuần. Chạy bằng: `node 05-jsdoc-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Làm thế nào để JSDoc cảnh báo lập trình viên rằng một hàm cũ không nên dùng nữa?**
   *Đáp án:* Thêm thẻ `@deprecated` vào khối JSDoc của hàm đó. IDE sẽ tự động gạch ngang tên hàm khi được gọi.
2. **Comment có làm tăng thời gian chạy của ứng dụng JavaScript trên production không?**
   *Đáp án:* Không. Khi build production, các công cụ minifier (như Terser hay esbuild) đã loại bỏ hoàn toàn các comment trước khi gửi file tới người dùng.
