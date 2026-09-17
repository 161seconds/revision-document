# Khai Báo Hàm vs Biểu Thức Hàm (Function Declarations vs Function Expressions)

Tài liệu ôn tập toàn diện về các cách định nghĩa hàm trong JavaScript: Khai báo hàm (Function Declarations), Biểu thức hàm (Function Expressions), Biểu thức hàm có tên (NFE), cơ chế Hoisting dưới tầng V8 Engine, và các cạm bẫy IIFE (Immediately Invoked Function Expressions).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-fundamentals/03-syntax-and-rules.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/03-syntax-and-rules.md) (Expressions vs Statements).
  - [01-fundamentals/07-let-and-block-scope.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/07-let-and-block-scope.md) (Temporal Dead Zone).
- **Mở rộng tiếp theo (Next Steps):**
  - [02-parameters-arguments-and-rest.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/02-parameters-arguments-and-rest.md) (Tham số mặc định & Rest parameters).
  - [03-arrow-functions-and-this.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/03-arrow-functions-and-this.md) (Arrow functions & ngữ cảnh `this`).
  - [04-execution-context-scope-and-closures.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/04-execution-context-scope-and-closures.md) (Closure & Scope Chain).
- **Khái niệm liên quan (Related):**
  - First-Class Functions (Hàm là công dân hạng nhất).
  - Call Stack & Execution Context Creation Phase.

---

## 2. Bản Chất Hoạt Động (Mental Model: Creation Phase & Hoisting)

### 1. Phân Biệt Các Cách Khởi Tạo Hàm
| Đặc điểm | Function Declaration | Function Expression | Arrow Function |
| :--- | :--- | :--- | :--- |
| **Cú pháp** | `function foo() {}` | `const foo = function() {}` | `const foo = () => {}` |
| **Bản chất** | Statement (Câu lệnh) | Expression (Biểu thức gán) | Expression |
| **Hoisting** | **Hoán đổi toàn bộ** (Cả tên lẫn thân hàm) | Hoán đổi biến (`undefined` nếu var, TDZ nếu const/let) | Tương tự Expression |
| **Gọi trước khi khai báo** | **ĐƯỢC** | **LỖI (TypeError hoặc ReferenceError)** | **LỖI** |
| **Ngữ cảnh `this`** | Dynamic (Phụ thuộc cách gọi) | Dynamic | **Lexical (Thừa kế từ cha)** |
| **Dùng làm Constructor (`new`)**| Được | Được | **KHÔNG** |

### 2. Quá Trình Biên Dịch Trong JS Engine (Creation vs Execution Phase)
1. **Creation Phase (Pha khởi tạo):**
   - V8 Engine quét toàn bộ mã nguồn.
   - Gặp **Function Declaration**: Cấp phát con trỏ hàm trong Memory Heap và gắn nhãn tên hàm ngay lập tức. Do đó hàm có thể được gọi trước dòng khai báo.
   - Gặp `const fn = function() {}`: Biến `fn` được đăng ký vào phạm vi nhưng nằm trong **Temporal Dead Zone (TDZ)** cho đến khi dòng gán được thực thi.
2. **Execution Phase (Pha thực thi):** Chạy code tuần tự từ trên xuống dưới.

### 3. Named Function Expression (NFE)
Khi khai báo biểu thức hàm có kèm tên:
```javascript
const factorial = function calcFact(n) {
  if (n <= 1) return 1;
  return n * calcFact(n - 1); // calcFact chỉ truy cập được BÊN TRONG thân hàm!
};
// calcFact(5); // ReferenceError: calcFact is not defined ở scope ngoài!
```
- **Lợi ích:** Hiện tên hàm rõ ràng trong Stack Trace khi debug/crash thay vì `(anonymous function)`, và hỗ trợ đệ quy an toàn không phụ thuộc vào biến ngoài.

### 4. IIFE (Immediately Invoked Function Expression)
Cú pháp thực thi hàm ngay khi vừa định nghĩa:
```javascript
(function () {
  const secret = "private_data"; // Không làm ô nhiễm phạm vi toàn cục (Global Scope)
})();
```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy gọi Function Expression trước khi khai báo
```javascript
sayHello(); // TypeError: sayHello is not a function (nếu khai báo bằng var)
            // ReferenceError: Cannot access 'sayHello' before initialization (nếu const/let)
const sayHello = function () {
  console.log("Hello!");
};
```

### 2. Khai báo Function Declaration bên trong khối lệnh `if` (Block Scoped Functions)
- Trước ES6, khai báo `function foo() {}` trong khối `if` có hành vi không nhất quán giữa các trình duyệt (Inconsistent Hoisting).
- Từ ES6 (Strict Mode): Function Declarations có phạm vi **Block Scoped** (chỉ tồn tại trong khối `{}`). Tuy nhiên, để mã nguồn rõ ràng, **luôn dùng Function Expression** nếu muốn gán hàm theo điều kiện:
  ```javascript
  let action;
  if (isProduction) {
    action = function () { /* code */ };
  }
  ```

---

## 4. File Code Thực Hành

- [01-functions-demo.js](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/01-functions-demo.js): Code thực nghiệm Hoisting declaration vs expression, NFE stack trace & recursion, IIFE module pattern, và Block Scoped Functions. Chạy bằng: `node 01-functions-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao có thể gọi một Function Declaration trước dòng code khai báo nó, nhưng không thể làm vậy với Function Expression?**
   *Đáp án:* Trong pha khởi tạo (Creation Phase) của Execution Context, JS Engine hoán đổi (hoist) toàn bộ tên và thân của Function Declaration lên đầu phạm vi. Với Function Expression gán vào `const`/`let`, biến bị rơi vào Temporal Dead Zone (TDZ) và chỉ khả dụng sau khi dòng gán được thực thi.
2. **Tên nội bộ trong Named Function Expression (NFE) có tác dụng gì và có thể gọi nó từ phạm vi bên ngoài không?**
   *Đáp án:* Tên nội bộ chỉ tồn tại bên trong thân hàm, dùng cho đệ quy và hiển thị tên trong Stack Trace khi debug. Gọi từ bên ngoài sẽ ném lỗi `ReferenceError`.
