# Bản Chất Chuỗi Nguyên Mẫu & Kế Thừa (Prototypes & Inheritance)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-fundamentals/01-variables-and-data-types.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-variables-and-data-types.md) (Đối tượng & Tham chiếu ô nhớ).
  - [02-functions-and-scope/01-declarations-vs-expressions.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/01-declarations-vs-expressions.md) (Hàm khởi tạo Constructor Functions).
- **Khái niệm tương quan**:
  - **V8 Hidden Classes (Shapes) & Prototype Caching**: Khi truy cập thuộc tính trên prototype, V8 lưu trữ đường dẫn tra cứu trong Inline Caches (IC). Gọi `Object.setPrototypeOf()` sẽ làm nổ tung toàn bộ IC này và ép V8 chuyển sang chế độ tra cứu chậm.
  - **Prototype Pollution**: Lỗ hổng bảo mật nghiêm trọng cấp độ doanh nghiệp khi kẻ tấn công chèn thuộc tính vào `Object.prototype`, làm thay đổi hành vi của toàn bộ các đối tượng trong ứng dụng.
- **Điểm đến tiếp theo**:
  - [02-classes-and-encapsulation.md](file:///d:/my-project/revision-document/javascript/10-oop-and-prototypes/02-classes-and-encapsulation.md) (Lớp ES6 & Đóng gói dữ liệu).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Cấu Trúc Chuỗi Nguyên Mẫu (The Prototype Chain)
Trong JavaScript, kế thừa không phải là sao chép mã nguồn (như Java hay C++), mà là **chuỗi liên kết con trỏ tham chiếu** thông qua khe nội bộ ẩn `[[Prototype]]`:

```
dog (Instance)
  │  __proto__
  ▼
Dog.prototype (Chứa bark)
  │  __proto__
  ▼
Animal.prototype (Chứa eat)
  │  __proto__
  ▼
Object.prototype (Chứa toString, valueOf, hasOwnProperty)
  │  __proto__
  ▼
null (Điểm tận cùng của thế giới JavaScript)
```

- **Quy trình tra cứu (Property Lookup)**: Khi đọc `dog.eat()`:
  1. V8 kiểm tra thuộc tính riêng (Own Property) trên `dog` -> Không thấy.
  2. Đi theo con trỏ `[[Prototype]]` lên `Dog.prototype` -> Không thấy.
  3. Đi tiếp lên `Animal.prototype` -> Thấy hàm `eat()` -> Thực thi!
  4. Nếu đi tới `null` mà vẫn không thấy -> Trả về `undefined`.

### 2.2. Phân Biệt Ba Khái Niệm Hay Nhầm Lẫn
1. **`[[Prototype]]`**: Khe nội bộ (Internal Slot) của mọi object, trỏ tới đối tượng nguyên mẫu cha của nó.
2. **`__proto__`**: Getter/setter lịch sử trên `Object.prototype` cho phép truy cập vào `[[Prototype]]` (đã bị coi là Legacy, nên dùng `Object.getPrototypeOf(obj)`).
3. **`F.prototype`**: Thuộc tính thông thường **chỉ tồn tại trên các hàm thông thường** (Function). Khi hàm đó được gọi với toán tử `new F()`, đối tượng mới sinh ra sẽ có `[[Prototype]]` trỏ tới `F.prototype`.

### 2.3. Hiểm Họa Prototype Pollution & Giải Pháp Clean Dictionary
Khi ứng dụng xử lý dữ liệu JSON không tin cậy từ người dùng và gộp vào đối tượng:
```javascript
// Kẻ tấn công gửi:
const payload = JSON.parse('{"__proto__": {"isAdmin": true}}');
// Nếu hàm gộp đối tượng (deep merge) duyệt qua key "__proto__":
Object.prototype.isAdmin = true; // MỌI ĐỐI TƯỢNG TRONG HỆ THỐNG ĐỀU CÓ isAdmin === true!
```
- **Giải pháp phòng thủ**:
  1. Dùng `Object.create(null)` khi tạo Map/Dictionary lưu trữ dữ liệu động (Object không có prototype thì không thể bị ô nhiễm).
  2. Đóng băng prototype toàn cục: `Object.freeze(Object.prototype)`.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Sử Dụng `Object.setPrototypeOf(obj, newProto)` Trong Runtime
- Việc thay đổi nguyên mẫu của một đối tượng đang chạy là một trong những thao tác làm **chậm hiệu năng tồi tệ nhất trong V8 Engine**. Nó ép V8 phải vứt bỏ toàn bộ mã máy tối ưu hóa JIT đã biên dịch và làm mất hiệu lực toàn bộ Inline Caches.
- Luôn khởi tạo prototype ngay từ đầu bằng `Object.create(proto)` hoặc cú pháp `class extends`.

### Bẫy 2: Gọi `obj.hasOwnProperty(prop)` Trên Object Tạo Bằng `Object.create(null)`
```javascript
const dict = Object.create(null);
dict.key = "value";

// ❌ LỖI VĂNG EXCEPTION CRASH APP: dict không kế thừa Object.prototype!
dict.hasOwnProperty("key"); // TypeError: dict.hasOwnProperty is not a function

// ✅ ĐÚNG CHUẨN (ES2022): Dùng Object.hasOwn() tĩnh
Object.hasOwn(dict, "key"); // true (Hoạt động an toàn 100% trên mọi đối tượng)
```

### Bẫy 3: Quên Khôi Phục `constructor` Khi Gán Lại `prototype`
```javascript
function Dog() {}
Dog.prototype = {
  bark() { console.log("Gâu"); }
};
// ❌ SAI LẦM: Gán đè Object Literal mới đã làm mất constructor gốc!
console.log(new Dog().constructor === Dog); // false! (Trỏ về Object)

// ✅ ĐÚNG: Khôi phục lại constructor
Dog.prototype.constructor = Dog;
```

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [01-prototypes-demo.js](file:///d:/my-project/revision-document/javascript/10-oop-and-prototypes/01-prototypes-demo.js)

### Mẫu Tạo Dictionary An Toàn Chống Prototype Pollution
```javascript
class SecureDictionary {
  constructor() {
    // Tạo cấu trúc lưu trữ thuần khiết, không kế thừa Object.prototype
    this._store = Object.create(null);
  }

  set(key, value) {
    // Ngăn chặn các key nhạy cảm
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      throw new Error(`Từ chối ghi khóa nhạy cảm: ${key}`);
    }
    this._store[key] = value;
  }

  get(key) {
    return this._store[key];
  }

  has(key) {
    return Object.hasOwn(this._store, key);
  }
}

const safeDict = new SecureDictionary();
safeDict.set("user_role", "EDITOR");
console.log(safeDict.get("user_role")); // "EDITOR"
// safeDict.set("__proto__", {}); // Ném lỗi bảo vệ an ninh!
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao phương thức `Object.hasOwn(obj, prop)` (ES2022) lại được khuyến nghị thay thế hoàn toàn cho `obj.hasOwnProperty(prop)`?
<details>
<summary><b>Lời giải chi tiết</b></summary>

1. **Khắc phục lỗi với Null Prototype**: Khi một đối tượng được tạo bằng `Object.create(null)`, nó không kế thừa `Object.prototype`, do đó việc gọi `obj.hasOwnProperty()` sẽ gây ra lỗi `TypeError: obj.hasOwnProperty is not a function`. `Object.hasOwn()` là hàm tĩnh (Static Method) của lớp `Object`, hoạt động an toàn tuyệt đối với mọi kiểu object.
2. **Khắc phục lỗi bị che khuất thuộc tính (Overridden Property)**: Nếu một đối tượng tình cờ có một thuộc tính riêng trùng tên là `hasOwnProperty` (ví dụ `{ hasOwnProperty: false }`), gọi `obj.hasOwnProperty()` sẽ gọi trúng giá trị biến boolean đó và văng lỗi. `Object.hasOwn(obj, prop)` hoàn toàn miễn nhiễm với lỗi này.
</details>

### Câu 2: Khi nào việc tìm kiếm một thuộc tính trên chuỗi Prototype Chain trả về `undefined`, và khi nào nó ném ra lỗi `TypeError`?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- **Trả về `undefined`**: Khi bạn **ĐỌC thuộc tính thông thường** trên đối tượng (`obj.foo`). V8 sẽ duyệt từ `obj` lên tận `null`. Nếu không thấy ở bất kỳ mắt xích nào, nó kết thúc và trả về giá trị `undefined`.
- **Ném lỗi `TypeError`**: Khi bạn cố gắng **GỌI HÀM** trên một thuộc tính không tồn tại (`obj.foo()`). Thuộc tính `foo` được đánh giá thành `undefined`, sau đó toán tử gọi hàm `()` cố gắng thực thi `undefined()` -> V8 ném lỗi `TypeError: obj.foo is not a function`. Hoặc khi bạn cố gắng đọc thuộc tính từ một giá trị là `null` hoặc `undefined` (`null.foo`).
</details>
