# Hàm Mũi Tên & Ngữ Cảnh `this` (JavaScript Arrow Functions & Lexical `this`)

Tài liệu ôn tập toàn diện về Arrow Functions (ES6): Cú pháp implicit return, cơ chế `this` từ vựng (Lexical `this`), sự thiếu vắng của `arguments` / `prototype` / `[[Construct]]`, và các cạm bẫy chết người khi dùng Arrow Function làm Object Method hoặc Event Handler.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-function-declarations-vs-expressions.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/01-function-declarations-vs-expressions.md) (Function Expressions).
  - [02-parameters-arguments-and-rest.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/02-parameters-arguments-and-rest.md) (Rest parameters thay thế `arguments`).
- **Mở rộng tiếp theo (Next Steps):**
  - [04-execution-context-scope-and-closures.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/04-execution-context-scope-and-closures.md) (Lexical Environment & Closure).
  - Lập trình hướng đối tượng OOP (`Class`, `bind`, `call`, `apply`).
- **Khái niệm liên quan (Related):**
  - Dynamic `this` (Xác định tại thời điểm gọi hàm).
  - Lexical `this` (Xác định tại thời điểm định nghĩa hàm).

---

## 2. Bản Chất Hoạt Động (Mental Model: Lexical `this` Dưới Tầng Engine)

### 1. Sự Khác Biệt Cốt Lõi Giữa Regular Function và Arrow Function
| Tiêu chí | Regular Function (`function`) | Arrow Function (`() => {}`) |
| :--- | :--- | :--- |
| **Ràng buộc `this`** | **Dynamic** (Phụ thuộc vào *cách* và *đối tượng* gọi hàm) | **Lexical** (Kế thừa trực tiếp `this` từ phạm vi cha bao quanh) |
| **Lệnh `new` (Constructor)** | Có phương thức nội bộ `[[Construct]]` ➔ Chạy được | **Không có `[[Construct]]` ➔ Ném `TypeError`** |
| **Thuộc tính `prototype`** | Có (`fn.prototype`) | **`undefined`** |
| **Đối tượng `arguments`** | Có sẵn | **Không có** (Kế thừa từ hàm cha, hoặc dùng `...args`) |
| **`call`, `apply`, `bind`** | Thay đổi được `this` | **Bị bỏ qua hoàn toàn** (Không thể đổi `this` của Arrow) |

### 2. Cú Pháp Implicit Return & Cạm Bẫy Object Literal
- Nếu thân hàm chỉ có một biểu thức, có thể lược bỏ `{}` và từ khóa `return`:
  ```javascript
  const double = x => x * 2;
  ```
- **Cạm bẫy khi trả về Object:** JavaScript hiểu cặp ngoặc nhọn `{}` là thân hàm (Block Body), không phải Object Literal:
  ```javascript
  const makeUser = name => { name: name }; // BẪY: Trả về undefined!
  // CÁCH ĐÚNG: Bọc object trong cặp ngoặc đơn ():
  const makeUserCorrect = name => ({ name: name }); // Trả về { name: "..." }
  ```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Dùng Arrow Function làm Method trong Object Literal
```javascript
const profile = {
  username: "Antigravity",
  sayHi: () => {
    // BẪY CHÍ MẠNG! Object Literal KHÔNG tạo ra Scope riêng!
    // 'this' ở đây kế thừa scope ngoài cùng (Global / Window / module.exports)
    return `Xin chào, tôi là ${this.username}`;
  }
};
profile.sayHi(); // "Xin chào, tôi là undefined"!
```
> [!IMPORTANT]
> **Quy tắc vàng:** Không bao giờ dùng Arrow Function để định nghĩa method của Object. Hãy dùng cú pháp rút gọn ES6 Method: `sayHi() { return this.username; }`.

### 2. Dùng Arrow Function trong DOM Event Listener
```javascript
button.addEventListener("click", () => {
  // 'this' không trỏ tới thẻ button! 'this' trỏ tới window/module!
  this.classList.toggle("active"); // TypeError: Cannot read properties of undefined
});

// Cách đúng 1: Dùng regular function để this trỏ vào button
button.addEventListener("click", function () {
  this.classList.toggle("active");
});
// Cách đúng 2: Dùng event.currentTarget
button.addEventListener("click", (e) => {
  e.currentTarget.classList.toggle("active");
});
```

### 3. Cố tình dùng `call()`, `apply()`, hoặc `bind()` trên Arrow Function
- Arrow Function **miễn nhiễm** với việc đổi `this`. Tham số đầu tiên của `call/apply/bind` bị bỏ qua một cách âm thầm mà không báo lỗi.

---

## 4. File Code Thực Hành

- [03-arrow-this-demo.js](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/03-arrow-this-demo.js): Code thực nghiệm Lexical `this`, cạm bẫy object method, cạm bẫy `new` và `prototype`, và kiểm chứng `call()` không thể ghi đè `this` của arrow function. Chạy bằng: `node 03-arrow-this-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao việc gọi `new ArrowFunc()` luôn ném ra lỗi `TypeError`?**
   *Đáp án:* Vì Arrow Function trong đặc tả ECMAScript không có phương thức nội bộ `[[Construct]]` và không sở hữu thuộc tính `prototype`, do đó động cơ JavaScript không thể cấp phát đối tượng mới từ nó.
2. **Khi nào thì `this` trong Arrow Function trỏ vào `undefined` hoặc `window` dù nó được viết bên trong một Object Literal?**
   *Đáp án:* Khi Arrow Function được viết trực tiếp làm thuộc tính của một Object Literal `{ method: () => this }`. Do Object Literal không tạo ra Scope (phạm vi biến), phạm vi từ vựng cha gần nhất của Arrow Function chính là Global Scope (hoặc Module Scope), nên `this` trỏ ra ngoài thay vì trỏ vào Object.
