# Bản Chất Con Trỏ this & Các Phương Thức call, apply, bind

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [02-functions-and-scope/03-arrow-functions-and-this.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/03-arrow-functions-and-this.md) (Arrow Function vs Regular Function).
  - [02-classes-and-encapsulation.md](file:///d:/my-project/revision-document/javascript/10-oop-and-prototypes/02-classes-and-encapsulation.md) (Toán tử `new` & Constructor).
- **Khái niệm tương quan**:
  - **Execution Context & ThisBinding**: `this` không phải là một biến tĩnh nằm trong Lexical Environment. Mỗi khi một hàm thông thường được gọi, một Execution Context mới được tạo trên Call Stack và giá trị của `this` được xác định động tại **thời điểm gọi hàm (Call-Site)**.
  - **Currying & Partial Application**: Kỹ thuật truyền trước một phần tham số cho hàm thông qua phương thức `fn.bind(context, arg1, arg2)`.
- **Điểm đến tiếp theo**:
  - Module 11: Siêu Lập Trình & Tính Năng ES Next (`11-meta-programming-and-es-next/`).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Bốn Quy Tắc Xác Định Con Trỏ `this` (Theo Thứ Tự Ưu Tiên Tăng Dần)

```
[1. Default Binding]          fn()          -> globalThis (Non-strict) / undefined (Strict)
                                                ▲ (Thấp nhất)
[2. Implicit Binding]         obj.fn()      -> obj
                                                ▲
[3. Explicit Binding]         fn.call(ctx)  -> ctx
                              fn.apply(ctx)
                              fn.bind(ctx)
                                                ▲
[4. new Binding]              new Fn()      -> Đối tượng mới sinh ra trong RAM (Cao nhất!)
```

### 2.2. Bốn Bước Thực Thi Của Toán Tử `new`
Khi bạn viết `const instance = new Constructor(args)`:
1. **Cấp phát bộ nhớ**: Tạo một đối tượng thuần túy rỗng mới `{}` trên Memory Heap.
2. **Liên kết nguyên mẫu**: Gán con trỏ `[[Prototype]]` của đối tượng mới trỏ tới `Constructor.prototype`.
3. **Ràng buộc ngữ cảnh**: Thực thi hàm `Constructor` với con trỏ `this` được trỏ thẳng vào đối tượng mới tạo ở bước 1.
4. **Trả về kết quả**:
   - Nếu hàm `Constructor` chủ động trả về một đối tượng khác (Object / Function), V8 sẽ trả về đối tượng đó.
   - Ngược lại (trả về kiểu nguyên thủy hoặc không return), V8 tự động trả về đối tượng mới được tạo ở bước 1.

### 2.3. Sự Khác Biệt Của Arrow Function (Lexical `this`)
- Arrow Function **HOÀN TOÀN KHÔNG CÓ con trỏ `this` riêng**.
- Khi gặp `this` bên trong Arrow Function, V8 sẽ tra cứu ngược lên phạm vi bao bọc bên ngoài (Lexical Scope) giống như tra cứu một biến thông thường.
- Các phương thức `call()`, `apply()`, `bind()` **HOÀN TOÀN BỊ VÔ HIỆU HÓA** đối với Arrow Function (không thể đổi được `this`).
- Arrow Function **không thể dùng làm Constructor** (gọi `new (() => {})` sẽ văng `TypeError`).

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Mất Ngữ Cảnh `this` Khi Truyền Method Làm Callback
```javascript
class TimerComponent {
  constructor() {
    this.seconds = 0;
  }
  tick() {
    this.seconds++; // ❌ TypeError: Cannot read properties of undefined (reading 'seconds')
  }
  start() {
    // Truyền method tách rời khỏi object cha:
    setTimeout(this.tick, 1000); // LỖI KINH ĐIỂN!
  }
}

// ✅ KHẮC PHỤC 1: Dùng Arrow Function bao bọc
setTimeout(() => this.tick(), 1000);

// ✅ KHẮC PHỤC 2: Ràng buộc vĩnh viễn bằng .bind()
setTimeout(this.tick.bind(this), 1000);
```

### Bẫy 2: Dùng Arrow Function Làm Method Của Object Literal
```javascript
const calculator = {
  factor: 2,
  // ❌ SAI LẦM: Arrow function kế thừa this của phạm vi bao bọc ngoài (window/module)
  calculate: (x) => x * this.factor // this.factor là undefined!
};

// ✅ ĐÚNG: Dùng method cú pháp rút gọn
const calculatorFixed = {
  factor: 2,
  calculate(x) {
    return x * this.factor; // this chính là calculatorFixed
  }
};
```

### Bẫy 3: Gán Liên Tiếp Bằng `bind()` Nhiều Lần (Hard Binding Không Thể Ghi Đè)
- Một hàm đã được gán bằng `.bind(objA)` thì **vĩnh viễn bị khóa cứng với `objA`**.
- Mọi lệnh gọi tiếp theo như `.bind(objB).call(objC)` đều **hoàn toàn vô tác dụng**, hàm vẫn sẽ thực thi với ngữ cảnh `objA` ban đầu.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [03-this-demo.js](file:///d:/my-project/revision-document/javascript/10-oop-and-prototypes/03-this-demo.js)

### Kỹ Thuật Currying & Mượn Hàm (Function Borrowing) Bằng `apply` và `bind`
```javascript
// Mượn hàm tính toán từ đối tượng khác
const mathService = {
  multiply(a, b) {
    return a * b;
  }
};

// Currying: Tạo hàm chuyên biệt nhân đôi (Double) bằng cách truyền trước tham số 2
const doubleNumber = mathService.multiply.bind(null, 2);

console.log(doubleNumber(5));  // 10
console.log(doubleNumber(12)); // 24

// Mượn phương thức slice của Array cho Arguments cũ:
function sumArguments() {
  // arguments là array-like, mượn hàm slice từ Array.prototype
  const argsArray = Array.prototype.slice.call(arguments);
  return argsArray.reduce((acc, curr) => acc + curr, 0);
}

console.log(sumArguments(10, 20, 30)); // 60
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Giữa toán tử `new Constructor()` và phương thức `.bind(anotherContext)`, quy tắc ràng buộc `this` nào có mức ưu tiên cao hơn?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- **Toán tử `new` có mức ưu tiên CAO HƠN `bind`**!
- Mặc dù một hàm đã bị khóa cứng với một ngữ cảnh bằng `const BoundFn = OriginalFn.bind(objA);`, nhưng nếu bạn thực thi `const instance = new BoundFn();`:
  - Trình biên dịch V8 sẽ **bỏ qua ngữ cảnh `objA`** đã được bind.
  - Con trỏ `this` sẽ được trỏ thẳng vào **đối tượng mới sinh ra trong RAM** do toán tử `new` tạo ra.
  - Đây là lý do quy tắc `new Binding` đứng ở đỉnh cao nhất trong 4 quy tắc ràng buộc `this` của JavaScript.
</details>

### Câu 2: Sự khác biệt kỹ thuật duy nhất giữa phương thức `Function.prototype.call` và `Function.prototype.apply` là gì?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Cả hai phương thức đều thực thi hàm ngay lập tức với một con trỏ `this` được chỉ định rõ ràng ở tham số đầu tiên.
- **Sự khác biệt duy nhất nằm ở cách truyền tham số tiếp theo**:
  - `fn.call(context, arg1, arg2, arg3)`: Nhận các tham số tiếp theo dưới dạng **danh sách tham số rời rạc** (ngăn cách bởi dấu phẩy).
  - `fn.apply(context, [arg1, arg2, arg3])`: Nhận các tham số tiếp theo dưới dạng **duy nhất một Mảng (Array)** hoặc đối tượng giống mảng (Array-like).
</details>
