# Lớp ES6 & Tính Đóng Gói (Classes & Encapsulation)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-prototypes-and-inheritance.md](file:///d:/my-project/revision-document/javascript/10-oop-and-prototypes/01-prototypes-and-inheritance.md) (Chuỗi Prototype & Bản chất kế thừa).
  - [05-style-guide-and-best-practices/01-conventions-and-style-guide.md](file:///d:/my-project/revision-document/javascript/05-style-guide-and-best-practices/01-conventions-and-style-guide.md) (Quy ước đặt tên Class PascalCase).
- **Khái niệm tương quan**:
  - **Class Syntactic Sugar**: Cú pháp `class` không tạo ra mô hình hướng đối tượng mới dựa trên Class-based (như C++ hay Java). Thực chất, nó vẫn là lớp vỏ bọc cú pháp (Syntactic Sugar) chạy trên nền tảng **Kế thừa nguyên mẫu (Prototypal Inheritance)** của JavaScript.
  - **Hard Private via Private Brand Checks**: Các trường `#privateField` được V8 Engine quản lý bằng một con dấu thương hiệu nội tại (Private Brand Check) ở tầng mã máy, đảm bảo không thể truy xuất từ bên ngoài bằng bất kỳ kỹ thuật Reflection nào.
- **Điểm đến tiếp theo**:
  - [03-this-binding-and-call-apply-bind.md](file:///d:/my-project/revision-document/javascript/10-oop-and-prototypes/03-this-binding-and-call-apply-bind.md) (Bản chất con trỏ `this`).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Bản Chất Dưới Tầng Động Cơ (Under The Hood Của ES6 Class)
Khi bạn khai báo một `class`:
```javascript
class User {
  constructor(name) { this.name = name; }
  sayHi() { return `Hi, ${this.name}`; }
}
```
V8 Engine thực sự làm những công việc sau:
1. Tạo một hàm constructor có tên là `User`.
2. Gắn phương thức `sayHi` trực tiếp vào `User.prototype.sayHi`.
3. Đánh dấu cờ nội bộ `[[IsClassConstructor]]: true` để **chặn việc gọi hàm mà không có từ khóa `new`**.
4. Toàn bộ mã nguồn bên trong thân class **tự động chạy ở chế độ Strict Mode (`"use strict"`)**.

### 2.2. Kế Thừa Lớp: `extends` và `super()`
Trong một lớp con (Subclass):
- Con trỏ `this` **CHƯA ĐƯỢC KHỞI TẠO** cho đến khi bạn gọi phương thức `super()`.
- Lệnh `super(...args)` chịu trách nhiệm gọi hàm khởi tạo của lớp cha (`ParentConstructor.call(this, ...args)`) để thiết lập vùng nhớ cho `this`.
- Nếu bạn cố gắng truy cập `this.property` trước khi gọi `super()`, V8 sẽ ném ra lỗi `ReferenceError: Must call super constructor in derived class before accessing 'this'`.

### 2.3. Sự Khác Biệt Giữa 3 Loại Thuộc Tính Riêng Tư

| Tiêu chí | Quy ước dấu gạch `_field` | TypeScript `private field` | True Private `#field` (ES2022) |
| :--- | :--- | :--- | :--- |
| **Bản chất** | Chỉ là quy ước thị giác (Convention) | Chỉ kiểm tra lúc biên dịch (Compile-time) | **Bảo mật phần cứng C++ Engine (Runtime)** |
| **Truy cập ngoài** | ✅ Vẫn đọc ghi bình thường | ✅ Sau khi build ra JS vẫn đọc ghi được | ⛔ **SyntaxError nếu cố tình truy xuất** |
| **Object.keys()** | Hiển thị trong danh sách | Hiển thị trong danh sách | **Hoàn toàn vô hình** |
| **Reflect API** | `Reflect.ownKeys()` đọc được | `Reflect.ownKeys()` đọc được | **Hoàn toàn vô hình** |

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Truy Cập `this` Trước Khi Gọi `super()` Trong Constructor Lớp Con
```javascript
class Parent {
  constructor(name) { this.name = name; }
}

class Child extends Parent {
  constructor(name, age) {
    // ❌ LỖI VĂNG EXCEPTION: this chưa tồn tại ở thời điểm này!
    this.age = age; // ReferenceError: Must call super constructor in derived class before accessing 'this'
    super(name);
  }
}

// ✅ ĐÚNG: Luôn đặt super() lên đầu tiên trong constructor con
class ChildFixed extends Parent {
  constructor(name, age) {
    super(name);
    this.age = age; // An toàn tuyệt đối
  }
}
```

### Bẫy 2: Gọi Lớp Như Một Hàm Thông Thường Mà Không Dùng `new`
```javascript
class Modal {}

// ❌ LỖI RUNTIME: Khác với Function constructor cũ (vốn chỉ gắn vào global/undefined)
Modal(); // TypeError: Class constructor Modal cannot be invoked without 'new'

// ✅ ĐÚNG: Bắt buộc dùng toán tử new
const m = new Modal();
```

### Bẫy 3: Gán Thuộc Tính Instance Bằng Arrow Function Làm Phình To Bộ Nhớ
```javascript
class HeavyComponent {
  // ⚠️ CẠM BẪY HIỆU NĂNG: Arrow function được tạo mới trên TỪNG INSTANCE!
  handleClick = () => { ... } // 1000 component sẽ tạo ra 1000 bản sao hàm handleClick trong Heap!

  // ✅ ĐÚNG: Viết method thông thường để chia sẻ duy nhất 1 bản trên Prototype:
  handleClick() { ... }
}
```

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [02-classes-demo.js](file:///d:/my-project/revision-document/javascript/10-oop-and-prototypes/02-classes-demo.js)

### Mẫu Thiết Kế Singleton Service Chuẩn Doanh Nghiệp Dùng Static Block & Private Field
```javascript
class PaymentGatewayService {
  static #instance = null; // Private Static Instance
  #apiKey;

  constructor(apiKey) {
    if (PaymentGatewayService.#instance) {
      throw new Error("Không thể khởi tạo: Đây là Singleton Service! Dùng getInstance()");
    }
    this.#apiKey = apiKey;
  }

  // Khối khởi tạo tĩnh (Static Initialization Block - ES2022)
  static {
    // Tự động khởi tạo instance mặc định từ biến môi trường
    const envKey = process.env.PAYMENT_KEY || "TEST_KEY_DEFAULT";
    this.#instance = new PaymentGatewayService(envKey);
  }

  static getInstance() {
    return this.#instance;
  }

  processTransaction(amount) {
    return `Đã thanh toán $${amount} qua Gateway (Key: ${this.#apiKey.slice(0, 4)}****)`;
  }
}

const service1 = PaymentGatewayService.getInstance();
const service2 = PaymentGatewayService.getInstance();
console.log(service1 === service2); // true (Chính xác cùng 1 vùng nhớ Singleton)
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao khai báo `class` lại KHÔNG được hoisting giống như khai báo hàm thông thường (`function declaration`)?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Mặc dù định danh của `class` có được V8 ghi nhận trong giai đoạn phân tích cú pháp (Parsing), nhưng nó bị đặt vào trạng thái **Temporal Dead Zone (TDZ)** giống như biến khai báo bằng `let` và `const`.
- **Lý do thiết kế**:
  1. Tính nhất quán trong kế thừa: Nếu cho phép hoisting class, bạn có thể gọi `new SubClass()` trước khi phần định nghĩa của `SuperClass` kịp thực thi, dẫn đến hành vi khởi tạo nguyên mẫu không thể đoán trước và dễ gây sập chương trình.
  2. Bắt buộc lập trình viên phải tổ chức luồng mã nguồn rõ ràng: Định nghĩa lớp cha trước, định nghĩa lớp con sau, và chỉ khởi tạo instance sau khi toàn bộ cấu trúc lớp đã sẵn sàng.
</details>

### Câu 2: Khối khởi tạo tĩnh (`static { ... }`) trong ES2022 giải quyết được vấn đề gì mà các phương thức `static` trước đây không làm được?
<details>
<summary><b>Lời giải chi tiết</b></summary>

1. **Khởi tạo dữ liệu tĩnh phức tạp với khối logic (Loops, try..catch, conditionals)**: Trước đây bạn chỉ có thể gán giá trị tĩnh đơn dòng (`static port = 8080;`). Nếu muốn có try/catch để đọc file cấu hình, bạn buộc phải viết code bên ngoài class làm mất tính đóng gói.
2. **Quyền truy cập đặc quyền vào Private Fields**: Khối `static { ... }` nằm bên trong thân class, do đó nó **có toàn quyền đọc và ghi vào các trường Private `#privateField`** của class đó, cho phép chia sẻ dữ liệu bí mật giữa các class hoặc cấp quyền truy cập đặc biệt cho các hàm helper bên ngoài một cách an toàn.
</details>
