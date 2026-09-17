# Khai Báo Biến & Quy Tắc Quản Lý Vùng Nhớ (JavaScript Variables & Scoping Rules)

Tài liệu ôn tập về 4 cách khai báo biến trong JavaScript (`const`, `let`, `var`, và biến ngầm), thứ tự ưu tiên trong Clean Code, và tác động của Strict Mode.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):** [03-syntax-and-rules.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/03-syntax-and-rules.md) (Quy tắc đặt tên định danh Identifiers).
- **Mở rộng tiếp theo (Next Steps):** [01-variables-scope.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-variables-scope.js) và bài học chuyên sâu về Block Scope / TDZ của `let` & `const`.
- **Khái niệm liên quan (Related):**
  - Chế độ nghiêm ngặt (`"use strict"`).
  - Ô nhiễm phạm vi toàn cục (Global Namespace Pollution) và Bộ dọn rác (Garbage Collector).

---

## 2. Bản Chất Hoạt Động (Mental Model: So Sánh 4 Cách Khai Báo)

| Tiêu chí | `const` (ES6) | `let` (ES6) | `var` (ES5 cũ) | Không dùng từ khóa |
| :--- | :--- | :--- | :--- | :--- |
| **Phạm vi (Scope)** | Block `{}` | Block `{}` | Function / Global | **Global ô nhiễm** |
| **Gán lại (Reassign)** | **Không** | **Có** | **Có** | **Có** |
| **Khai báo lại (Redeclare)**| Báo lỗi `SyntaxError` | Báo lỗi `SyntaxError` | Cho phép (nguy hiểm) | Không áp dụng |
| **Hoisting** | Có (nằm trong TDZ) | Có (nằm trong TDZ) | Có (gán `undefined`) | Không hoisted |
| **Thứ tự ưu tiên dùng** | **Mặc định số 1** | **Số 2** (khi cần đổi giá trị) | **Tránh dùng** | **Cấm dùng** |

### Quy Tắc Bất Biến Về Mặt Tham Chiếu (Reference Immutability) Của `const`
- `const` bảo vệ **địa chỉ ô nhớ (Reference)**, không bảo vệ giá trị bên trong của cấu trúc dữ liệu phức tạp.
- Do đó, đối với Object và Array khai báo bằng `const`, bạn hoàn toàn có thể thêm, sửa, xóa phần tử bên trong:
  ```javascript
  const scores = [8, 9];
  scores.push(10); // HỢP LỆ
  // scores = [1, 2]; // TypeError: Assignment to constant variable
  ```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

1. **Thảm họa biến toàn cục ngầm (Undeclared Global Leak):**
   ```javascript
   function calculateTotal() {
     total = 100; // Quên khai báo let/const -> trở thành window.total hoặc global.total!
   }
   calculateTotal();
   console.log(total); // 100 (Rò rỉ ra phạm vi toàn cục, gây memory leak)
   ```
   *Cách khắc phục:* Đặt `"use strict";` ở đầu file. Trình duyệt sẽ lập tức ném lỗi `ReferenceError: total is not defined`.

2. **Khai báo nhiều biến trên một dòng sai cú pháp:**
   ```javascript
   let a = 1, b = 2, c = 3; // Hợp lệ, cả 3 đều là let
   let x = 1, y = 2; z = 3;  // NGUY HIỂM: Dấu ';' biến z thành biến toàn cục ngầm!
   ```

3. **Tái khai báo vô tình ghi đè dữ liệu với `var`:**
   - Trong dự án lớn, hai lập trình viên khác nhau cùng dùng `var temp` trong cùng file sẽ vô tình ghi đè dữ liệu của nhau mà không có bất kỳ cảnh báo lỗi nào. `let` và `const` ngăn chặn triệt để điều này bằng lỗi `SyntaxError: Identifier already declared`.

---

## 4. File Code Thực Hành

- [06-variables-strict-mode-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/06-variables-strict-mode-demo.js): Minh họa Strict Mode chặn rò rỉ biến, khai báo nhiều biến an toàn, và kiểm chứng tính tái khai báo. Chạy bằng: `node 06-variables-strict-mode-demo.js`.
- [01-variables-scope.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-variables-scope.js): Minh họa Scope, Hoisting và TDZ.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Khi nào BẮT BUỘC phải dùng `let` thay vì `const`?**
   *Đáp án:* Khi giá trị của biến đó cần phải được gán lại giá trị mới (Reassigned) trong tương lai, ví dụ: biến đếm vòng lặp `for (let i = 0; ...)`, biến cờ bật/tắt `let isLoaded = false;`, hoặc biến tích lũy.
2. **Một biến khai báo bằng `let` mà không gán giá trị khởi tạo thì giá trị mặc định của nó là gì?**
   *Đáp án:* `undefined`.
