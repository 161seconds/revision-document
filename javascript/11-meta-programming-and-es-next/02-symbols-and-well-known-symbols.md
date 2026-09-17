# Kiểu Dữ Liệu Symbol & Well-Known Symbols Trong JavaScript

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-fundamentals/03-data-types.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/03-data-types.md) (7 kiểu dữ liệu nguyên thủy Primitive Types).
  - [03-data-structures/13-iterators-and-generators.md](file:///d:/my-project/revision-document/javascript/03-data-structures/13-iterators-and-generators.md) (Giao thức lặp Iterable & `Symbol.iterator`).
- **Khái niệm tương quan**:
  - **Well-Known Symbols**: Các hằng số Symbol có sẵn trong động cơ JavaScript (như `Symbol.iterator`, `Symbol.toPrimitive`, `Symbol.toStringTag`, `Symbol.hasInstance`), cho phép lập trình viên tùy biến trực tiếp các hành vi cốt lõi của ngôn ngữ (Hooks vào V8 Runtime).
  - **Metaprogramming**: Tương tự như `Proxy`, các Well-Known Symbols cung cấp cơ chế can thiệp vào cách JavaScript tương tác với đối tượng (Object Coercion, Protocol Resolution).
- **Điểm đến tiếp theo**:
  - [03-web-storage-and-state-persistence.md](file:///d:/my-project/revision-document/javascript/11-meta-programming-and-es-next/03-web-storage-and-state-persistence.md) (Lưu trữ trạng thái Web Storage, Session & Cross-Tab Sync).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Bản Chất Của Symbol
`Symbol` là kiểu dữ liệu nguyên thủy (Primitive Type) được đưa vào từ ECMAScript 2015 (ES6). Giá trị của mỗi Symbol là **duy nhất và bất biến (Unique & Immutable)**.

```
+-------------------------------------------------------------------------------+
|                             BỘ NHỚ V8 RUNTIME                                 |
|                                                                               |
|  Local Symbols (Bộ nhớ đệm riêng lẻ):                                         |
|    sym1 = Symbol("id") ----> [Memory Address: 0x7fff0001 | Description: "id"] |
|    sym2 = Symbol("id") ----> [Memory Address: 0x7fff0002 | Description: "id"] |
|    ===> sym1 !== sym2 (Hoàn toàn độc lập dù chung chuỗi mô tả)               |
|                                                                               |
|  Global Symbol Registry (Bảng tra cứu toàn cục chung toàn bộ ứng dụng):       |
|    Symbol.for("token") ---> Tra cứu bảng key "token"                          |
|                             -> Nếu chưa có: Tạo mới và lưu vào Registry       |
|                             -> Nếu đã có: Trả về tham chiếu Symbol đã tồn tại |
+-------------------------------------------------------------------------------+
```

### 2.2. Well-Known Symbols: Các Cổng Can Thiệp Hệ Thống
ECMAScript định nghĩa các thuộc tính tĩnh trên hàm tạo `Symbol` đại diện cho các hành vi nội bộ của ngôn ngữ:

| Well-Known Symbol | Thời điểm kích hoạt | Mục đích tùy biến |
| :--- | :--- | :--- |
| `Symbol.iterator` | Vòng lặp `for...of`, toán tử Spread `...`, `Array.from()` | Định nghĩa Iterator biến đối tượng thành Iterable |
| `Symbol.asyncIterator` | Vòng lặp `for await...of` | Định nghĩa luồng dữ liệu bất đồng bộ Asynchronous Stream |
| `Symbol.toPrimitive` | Ép kiểu ngầm định khi tính toán số học, nối chuỗi | Ghi đè thuật toán chuyển đổi đối tượng sang nguyên thủy |
| `Symbol.toStringTag` | Khi gọi `Object.prototype.toString.call(obj)` | Thay thế chuỗi nhãn `[object Object]` mặc định |
| `Symbol.hasInstance` | Khi toán tử `instanceof` được thực thi | Tùy biến kiểm tra kiểu đa hình hoặc giao diện Interface |
| `Symbol.isConcatSpreadable` | Khi gọi `Array.prototype.concat()` | Quyết định đối tượng mảng có bị bung phẳng hay không |

### 2.3. Thuộc Tính Đối Tượng Có Khóa Là Symbol (Symbol Properties)
Khi gán thuộc tính cho một đối tượng bằng Symbol:
1. Thuộc tính **không bao giờ bị trùng tên** với bất kỳ thuộc tính nào khác (kể cả thuộc tính do thư viện bên ngoài bổ sung).
2. Thuộc tính được coi là bán ẩn (Semi-private metadata):
   - `for...in` và `Object.keys()` **bỏ qua** các khóa Symbol.
   - `JSON.stringify()` **bỏ qua** cả khóa và giá trị liên kết với Symbol.
   - Muốn trích xuất phải sử dụng hàm chuyên dụng `Object.getOwnPropertySymbols(obj)` hoặc `Reflect.ownKeys(obj)`.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Dùng Toán Tử `new` Với `Symbol`
`Symbol` là kiểu nguyên thủy chứ không phải Object Wrapper thông thường (khác với `new Boolean()`, `new Number()`).
```javascript
const s = new Symbol("key"); // TypeError: Symbol is not a constructor
// Đúng chuẩn:
const s = Symbol("key");
```

### Bẫy 2: Tự Động Ép Kiểu Chuỗi Ngầm Định (Implicit Coercion Blocked)
Để tránh các lỗi logic tiềm ẩn khi lập trình viên vô tình in ra hoặc nối Symbol thành chuỗi, V8 cấm tuyệt đối việc ép kiểu ngầm định:
```javascript
const sym = Symbol("test");
const str = "ID: " + sym; // TypeError: Cannot convert a Symbol value to a string
// Đúng chuẩn: Phải ép kiểu tường minh
const explicit = "ID: " + String(sym); // "ID: Symbol(test)"
const desc = "ID: " + sym.description; // "ID: test"
```

### Bẫy 3: `JSON.stringify()` Làm Bốc Hơi Các Thuộc Tính Symbol
```javascript
const id = Symbol("id");
const user = { [id]: 101, name: "Alice" };
console.log(JSON.stringify(user)); // '{"name":"Alice"}' (Mất hoàn toàn id!)
```

### Bẫy 4: Nhầm Lẫn Giữa `Symbol()` và `Symbol.for()`
- `Symbol("uid")`: Tạo Symbol cục bộ duy nhất, độc lập.
- `Symbol.for("uid")`: Tra cứu và dùng chung trên Global Symbol Registry. Có thể chia sẻ xuyên suốt các `iframe` hoặc `Web Workers` trên cùng một ngữ cảnh Execution Context.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn chạy trực tiếp tại file [02-symbols-demo.js](file:///d:/my-project/revision-document/javascript/11-meta-programming-and-es-next/02-symbols-demo.js).

Tóm tắt các ứng dụng then chốt:
1. **Can thiệp ép kiểu với `Symbol.toPrimitive`**:
   ```javascript
   const money = {
     amount: 500,
     currency: "USD",
     [Symbol.toPrimitive](hint) {
       if (hint === "number") return this.amount;
       if (hint === "string") return `${this.amount} ${this.currency}`;
       return this.amount; // default (ví dụ toán tử +)
     }
   };
   console.log(+money);          // 500 (hint: "number")
   console.log(`${money}`);       // "500 USD" (hint: "string")
   console.log(money + 100);     // 600 (hint: "default")
   ```
2. **Định danh thương hiệu lớp với `Symbol.toStringTag`**:
   ```javascript
   class CustomBuffer {
     get [Symbol.toStringTag]() {
       return "CustomBuffer";
     }
   }
   console.log(Object.prototype.toString.call(new CustomBuffer()));
   // Kết quả: "[object CustomBuffer]" (thay vì "[object Object]")
   ```
3. **Mô phỏng Interface/Structural Typing với `Symbol.hasInstance`**:
   ```javascript
   const IterableInterface = {
     [Symbol.hasInstance](instance) {
       return instance != null && typeof instance[Symbol.iterator] === "function";
     }
   };
   console.log([1, 2] instanceof IterableInterface); // true
   console.log({ a: 1 } instanceof IterableInterface); // false
   ```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Làm thế nào để sao chép sâu (Deep Clone) một Object mà không làm mất các thuộc tính có key là `Symbol`?
**Đáp án chi tiết**:
- Phương pháp cổ điển `JSON.parse(JSON.stringify(obj))` sẽ làm mất toàn bộ các thuộc tính có key là `Symbol`, các hàm và giá trị `undefined`.
- Phương thức `structuredClone(obj)` trong HTML/Node.js hiện đại hỗ trợ sao chép sâu hầu hết các kiểu dữ liệu, nhưng theo đặc tả W3C/WHATWG, nó **không** sao chép các thuộc tính có key là `Symbol` (thuộc tính Symbol bị bỏ qua).
- **Giải pháp chuẩn**: Viết thuật toán sao chép sâu đệ quy sử dụng `Reflect.ownKeys(source)` (hàm này trả về mảng kết hợp cả String keys và Symbol keys) kết hợp với bộ nhớ đệm `WeakMap` để giải quyết tham chiếu vòng (Circular Reference).

### Câu 2: Sự khác biệt cơ bản giữa `Symbol.keyFor(sym)` và `sym.description` là gì?
**Đáp án chi tiết**:
- `sym.description` (ES2019): Thuộc tính chỉ đọc trả về chuỗi mô tả ban đầu được truyền vào hàm tạo khi tạo Symbol (áp dụng cho cả Local Symbol `Symbol("abc")` và Global Symbol `Symbol.for("abc")`).
- `Symbol.keyFor(sym)`: Hàm tra cứu ngược trong **Global Symbol Registry**.
  - Nếu `sym` được tạo qua `Symbol.for("key")`, hàm trả về chuỗi `"key"`.
  - Nếu `sym` được tạo qua `Symbol("key")` (Local Symbol), hàm trả về `undefined` vì Symbol này không nằm trong Global Registry.
