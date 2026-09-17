# Tham Số, Đối Số & Cú Pháp Gom Rest (JavaScript Parameters, Arguments & Rest)

Tài liệu ôn tập toàn diện về cơ chế truyền tham số trong JavaScript: Phân biệt Parameters vs Arguments, Tham số mặc định (Default Parameters) & cạm bẫy TDZ, đối tượng cổ điển `arguments` vs Rest Parameters (`...args`), và kỹ thuật Destructuring tham số an toàn.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-function-declarations-vs-expressions.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/01-function-declarations-vs-expressions.md) (Định nghĩa hàm).
  - [01-fundamentals/12-assignment-operators.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/12-assignment-operators.md) (Gán mặc định).
- **Mở rộng tiếp theo (Next Steps):**
  - [03-arrow-functions-and-this.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/03-arrow-functions-and-this.md) (Arrow functions không có đối tượng `arguments`).
  - Functional Programming: Partial Application & Currying.
- **Khái niệm liên quan (Related):**
  - Pass-by-Value (Primitive) vs Pass-by-Sharing (Reference).
  - Array-like Objects.

---

## 2. Bản Chất Hoạt Động (Mental Model: Khởi Tạo Tham Số Trong Call Stack)

### 1. Phân Biệt Parameters vs Arguments
- **Parameters (Tham số hình thức):** Các biến được khai báo ở định nghĩa hàm (`function add(a, b)` ➔ `a, b` là parameters).
- **Arguments (Đối số thực tế):** Các giá trị cụ thể được truyền vào khi gọi hàm (`add(2, 3)` ➔ `2, 3` là arguments).

### 2. Tham Số Mặc Định (Default Parameters - ES6)
- **Cơ chế kích hoạt:** Giá trị mặc định **chỉ được kích hoạt khi đối số là `undefined`** hoặc bị bỏ qua. Nếu truyền `null`, `false`, `0`, `""`, giá trị mặc định **sẽ KHÔNG được dùng**:
  ```javascript
  function connect(timeout = 3000) { return timeout; }
  connect(undefined); // 3000 (Dùng default)
  connect(0);         // 0    (0 là đối số hợp lệ!)
  connect(null);      // null (Không kích hoạt default!)
  ```
- **Thứ tự đánh giá (Left-to-Right Evaluation & Scope riêng):**
  - Các tham số có scope riêng (Parameter Scope) nằm giữa phạm vi ngoài và thân hàm.
  - Tham số sau có thể dùng giá trị của tham số trước (`(width, height = width * 2)`).
  - Nhưng nếu tham số trước tham chiếu tham số sau: Bị ném lỗi **`ReferenceError` (TDZ)**!

### 3. Rest Parameters (`...rest`) vs Đối Tượng Cũ `arguments`
| Tiêu chí | `arguments` (Cũ) | Rest Parameters `...rest` (ES6 - Khuyên dùng) |
| :--- | :--- | :--- |
| **Kiểu dữ liệu** | **Array-like Object** (Không có `.map()`, `.filter()`) | **Mảng thực thụ (`Array`)** |
| **Hỗ trợ Arrow Function** | **KHÔNG** (kế thừa từ hàm cha) | **Có** |
| **Vị trí áp dụng** | Chứa toàn bộ đối số truyền vào | Chỉ gom các đối số còn lại; **luôn đứng ở vị trí cuối cùng** |
| **Liên kết tham số (Binding)** | Trong non-strict mode bị đồng bộ ngầm gây bug | Độc lập hoàn toàn |

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Cạm bẫy Destructuring tham số không có giá trị fallback (`Cannot destructure property of undefined`)
```javascript
// NGUY HIỂM:
function setupUser({ name, role = "user" }) {
  console.log(name, role);
}
setupUser(); // TypeError: Cannot destructure property 'name' of undefined or null!

// ĐÚNG CHUẨN: Luôn gán fallback '= {}' cho toàn bộ object destructure:
function setupUserSafe({ name = "Anonymous", role = "user" } = {}) {
  console.log(name, role);
}
setupUserSafe(); // "Anonymous", "user" (Hoàn toàn an toàn!)
```

### 2. Cạm bẫy Temporal Dead Zone giữa các tham số
```javascript
function trap(a = b, b = 10) { // BẪY! Khi gán a, biến b đang nằm trong TDZ
  return a + b;
}
trap(); // ReferenceError: Cannot access 'b' before initialization
```

### 3. Nhầm lẫn Pass-by-Reference: Mutate object tham số ảnh hưởng dữ liệu ngoài
- JavaScript luôn là **Pass-by-Value**. Nhưng với Object, "Value" được truyền chính là địa chỉ tham chiếu.
- Nếu gán lại biến `user = {}`, biến ngoài không đổi. Nhưng nếu sửa `user.name = "Bob"`, object gốc bên ngoài **bị thay đổi theo**!

---

## 4. File Code Thực Hành

- [02-parameters-demo.js](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/02-parameters-demo.js): Code thực nghiệm Default Parameters với `null` vs `undefined`, Parameter TDZ, Rest Parameters vs `arguments`, và Safe Destructuring Fallback. Chạy bằng: `node 02-parameters-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Khi nào tham số mặc định (Default Parameter) được kích hoạt? Điều gì xảy ra nếu truyền `null`?**
   *Đáp án:* Tham số mặc định chỉ kích hoạt khi đối số là `undefined` hoặc không được truyền. Nếu truyền `null`, tham số sẽ nhận đúng giá trị `null` mà không kích hoạt giá trị mặc định.
2. **Tại sao Rest Parameters (`...args`) hoàn toàn vượt trội so với đối tượng `arguments`?**
   *Đáp án:* Rest Parameters là một mảng thực sự (Array instance) hỗ trợ đầy đủ các phương thức như `map`, `filter`, `reduce`; hoạt động chuẩn xác trong Arrow Functions; và cho phép gom chọn lọc các đối số dư thừa thay vì gom toàn bộ.
