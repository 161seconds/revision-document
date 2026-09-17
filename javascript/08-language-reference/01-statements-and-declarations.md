# Bản Chất Câu Lệnh & Khai Báo (Statements & Declarations)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-fundamentals/02-scope-and-hoisting.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/02-scope-and-hoisting.md) (Block Scope vs Function Scope, Hoisting).
  - [05-style-guide-and-best-practices/01-conventions-and-style-guide.md](file:///d:/my-project/revision-document/javascript/05-style-guide-and-best-practices/01-conventions-and-style-guide.md) (Quy tắc ASI & Dấu chấm phẩy).
- **Khái niệm tương quan**:
  - **Completion Record**: Cấu trúc đặc tả trừu tượng của ECMAScript mô tả kết quả thực thi của từng câu lệnh trong Call Stack.
  - **Syntax Grammars**: Trình biên dịch V8 phân tích mã nguồn thành Abstract Syntax Tree (AST) dựa trên phân định giữa Statement (Câu lệnh cấu trúc) và Expression (Biểu thức tính toán).
- **Điểm đến tiếp theo**:
  - [02-reserved-words-and-identifiers.md](file:///d:/my-project/revision-document/javascript/08-language-reference/02-reserved-words-and-identifiers.md) (Từ Khóa Dự Chữ & Định Danh).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Phân Biệt Cốt Tử: Statement (Câu Lệnh) vs Expression (Biểu Thức)

```
+-------------------------------------------------------------------------------+
| EXPRESSION (Biểu thức)                                                        |
| - Luôn được đánh giá để sinh ra một GIÁ TRỊ (Value).                          |
| - Có thể đặt ở bất kỳ nơi nào cần một giá trị (tham số hàm, vế phải phép gán)|
| Ví dụ: 5 + 3, true && false, fn(), [1, 2], { a: 1 }, x = 10                  |
+-------------------------------------------------------------------------------+
                                      |
                         Được bao bọc bên trong
                                      v
+-------------------------------------------------------------------------------+
| STATEMENT (Câu lệnh)                                                          |
| - Là một CHỈ DẪN HÀNH ĐỘNG (Action / Instruction) gửi tới Engine.             |
| - Thực hiện luồng điều khiển, khai báo, hoặc tạo side-effects.                |
| - KHÔNG THỂ gán vào một biến khác.                                            |
| Ví dụ: let x = 5;, if (...) {}, for (...) {}, return;, throw err;             |
+-------------------------------------------------------------------------------+
```

### 2.2. Hồ Sơ Hoàn Tất (Completion Record) Của Câu Lệnh
Theo đặc tả ECMAScript, mỗi khi V8 thực thi một Statement, nó trả về một bộ dữ liệu nội bộ gọi là **Completion Record**:
$$\text{Completion Record} = \langle \text{[[Type]]}, \text{[[Value]]}, \text{[[Target]]} \rangle$$
- **`[[Type]]`**: Một trong các trạng thái:
  - `normal`: Chạy bình thường tiếp tục lệnh kế.
  - `break`: Nhảy ra khỏi vòng lặp hoặc switch.
  - `continue`: Nhảy sang vòng lặp tiếp theo.
  - `return`: Trả về từ hàm.
  - `throw`: Ném ra ngoại lệ.
- **`[[Value]]`**: Giá trị kết quả (nếu có, hoặc `empty`). Lệnh `eval()` trong JavaScript trả về chính xác `[[Value]]` của câu lệnh cuối cùng được chạy.
- **`[[Target]]`**: Nhãn (Label) đích để chuyển quyền điều khiển (nếu dùng `break label` hoặc `continue label`).

### 2.3. Labeled Statements (Câu Lệnh Có Gắn Nhãn)
Trong JavaScript, bạn có thể gán một nhãn định danh (`label:`) cho bất kỳ khối lệnh hoặc vòng lặp nào.
Điều này cực kỳ hữu ích khi cần thoát khỏi các vòng lặp lồng nhau sâu (Nested Loops) mà không cần dùng biến cờ hiệu (`flag = true`):
```javascript
outerLoop: for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    if (matrix[i][j] === target) {
      break outerLoop; // Nhảy thẳng ra khỏi cả vòng lặp cha!
    }
  }
}
```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Cố Gắng Gán Câu Lệnh Khai Báo Biến Vào Vế Phải
```javascript
// ❌ SYNTAX ERROR: Statement không thể đóng vai trò Expression
const val = (let x = 10); // Lỗi cú pháp!

// ❌ SAI LẦM VỚI IF: "if" là Statement, không phải Expression
const status = (if (isLoggedIn) "Admin" else "Guest"); // SyntaxError!

// ✅ ĐÚNG: Dùng Toán tử 3 ngôi (Ternary Operator) vì nó là Expression
const status = isLoggedIn ? "Admin" : "Guest";
```

### Bẫy 2: Cạm Bẫy Xuống Dòng Sau `return` Do Cơ Chế ASI
```javascript
// ❌ SAI LẦM: Trả về undefined thay vì Object
function getUser() {
  return
  {
    name: "Alice"
  }
}
// V8 tự động chèn dấu chấm phẩy ngay sau return:
// function getUser() { return; { name: "Alice"; } }

// ✅ ĐÚNG: Đặt dấu mở ngoặc nhọn { cùng dòng với return
function getUser() {
  return {
    name: "Alice"
  };
}
```

### Bẫy 3: Gắn Nhãn (Label) Trùng Với Khối Lệnh Không Phải Vòng Lặp
- Dùng `break label` chỉ hợp lệ khi khối lệnh đó đang được thực thi.
- Dùng `continue label` **bắt buộc nhãn đó phải gắn trên một vòng lặp (`for`, `while`, `do-while`)**. Nếu gắn `continue` trên một khối `if` hay `block` thông thường, trình duyệt sẽ ném lỗi `SyntaxError: Undefined label`.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [01-statements-demo.js](file:///d:/my-project/revision-document/javascript/08-language-reference/01-statements-demo.js)

### Mẫu Thuật Toán Tìm Kiếm Ma Trận Ma Trận 2D Bằng Labeled Statement
```javascript
function searchCoordinates(grid, targetValue) {
  let foundAt = null;

  rowLoop: for (let y = 0; y < grid.length; y++) {
    colLoop: for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === targetValue) {
        foundAt = { x, y };
        break rowLoop; // Dừng ngay lập tức toàn bộ quá trình quét
      }
    }
  }

  return foundAt;
}

const mapData = [
  ["rừng", "núi", "biển"],
  ["hang động", "kho báu", "sa mạc"],
  ["thành phố", "sông", "đảo"]
];

console.log(searchCoordinates(mapData, "kho báu")); // { x: 1, y: 1 }
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao đoạn mã `(function() {})()` (IIFE) lại cần cặp dấu ngoặc đơn bọc ngoài, nếu bỏ ngoặc đơn thì V8 Engine sẽ báo lỗi gì?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Nếu viết `function foo() {}()`, V8 Engine đang ở đầu dòng câu lệnh và phân tích từ khóa `function` như một **Function Declaration (Statement)**.
- Theo quy tắc cú pháp, một Function Declaration bắt buộc phải có tên và kết thúc bằng thân hàm `{}`. Cặp dấu ngoặc đơn `()` tiếp theo sẽ bị V8 coi là một cặp ngoặc nhóm biểu thức bị rỗng đứng độc lập, dẫn đến lỗi `SyntaxError: Unexpected token ')'`.
- Khi bọc trong cặp ngoặc đơn `(function() {})`, dấu ngoặc đơn ép buộc bộ phân tích cú pháp của V8 phải coi nội dung bên trong là một **Function Expression (Biểu thức)**. Vì là biểu thức, nó lập tức có thể được kích hoạt ngay bằng toán tử gọi hàm `()`.
</details>

### Câu 2: Trong cấu trúc điều khiển `try-catch-finally`, nếu khối `try` có lệnh `return 1` và khối `finally` có lệnh `return 2`, giá trị cuối cùng trả về là gì và tại sao theo cơ chế Completion Record?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- **Giá trị trả về là `2`**.
- **Giải thích theo Completion Record**:
  - Khi lệnh `return 1` trong khối `try` thực thi, nó tạo ra Completion Record: `[[Type]]: return, [[Value]]: 1`.
  - Tuy nhiên, khối `finally` luôn được bảo đảm phải chạy trước khi Call Stack gỡ bỏ khung hàm.
  - Khi khối `finally` gặp lệnh `return 2`, nó tạo ra một Completion Record mới: `[[Type]]: return, [[Value]]: 2`.
  - Completion Record của khối `finally` **ghi đè hoàn toàn (override)** Completion Record trước đó của khối `try`. Kết quả cuối cùng trả về cho caller là `2`.
</details>
