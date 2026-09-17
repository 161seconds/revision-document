# Siêu Lập Trình Với Proxy & Reflect API (Meta-Programming)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [10-oop-and-prototypes/01-prototypes-and-inheritance.md](file:///d:/my-project/revision-document/javascript/10-oop-and-prototypes/01-prototypes-and-inheritance.md) (Thuộc tính & Chuỗi nguyên mẫu).
  - [10-oop-and-prototypes/03-this-binding-and-call-apply-bind.md](file:///d:/my-project/revision-document/javascript/10-oop-and-prototypes/03-this-binding-and-call-apply-bind.md) (Ngữ cảnh `this` & Receiver).
- **Khái niệm tương quan**:
  - **Meta Object Protocol (MOP)**: Tập hợp các phương thức nội tại của động cơ JavaScript (như `[[Get]]`, `[[Set]]`, `[[HasProperty]]`, `[[Call]]`). `Proxy` cho phép lập trình viên can thiệp (intercept) trực tiếp vào các phương thức cấp thấp này của V8 Engine.
  - **Reactivity Systems**: Toàn bộ hệ thống phản ứng (Reactivity) hiện đại của Vue 3 và MobX đều được xây dựng dựa trên `Proxy` để theo dõi tự động các thao tác đọc ghi dữ liệu.
- **Điểm đến tiếp theo**:
  - [02-symbols-and-well-known-symbols.md](file:///d:/my-project/revision-document/javascript/11-meta-programming-and-es-next/02-symbols-and-well-known-symbols.md) (Kiểu dữ liệu Symbol & Well-Known Symbols).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Kiến Trúc Hoạt Động Của Proxy

```
[Thao tác người dùng] (obj.prop, 'prop' in obj, delete obj.prop, fn(...args))
         |
         v
+-------------------------------------------------------------------------------+
|                                    PROXY                                      |
|                                                                               |
|  +--------------------+                     +------------------------------+  |
|  |       TRAPS        | ===(Bắt giữ)======> |         HANDLER              |  |
|  | get, set, has,     |                     | Thực thi logic bổ sung:      |  |
|  | deleteProperty...  |                     | Validation, Logging, Track...|  |
|  +--------------------+                     +------------------------------+  |
|                                                            |                  |
|                                                  Ủy thác   v                  |
|                                             +------------------------------+  |
|                                             |         REFLECT API          |  |
|                                             | Reflect.get(target, prop...) |  |
|                                             +------------------------------+  |
|                                                            |                  |
|                                                            v                  |
|                                             +------------------------------+  |
|                                             |        TARGET OBJECT         |  |
|                                             | (Đối tượng gốc được bảo vệ)  |  |
|                                             +------------------------------+  |
+-------------------------------------------------------------------------------+
```

### 2.2. Mối Quan Hệ Đối Xứng Giữa Proxy Traps và Reflect API
Mỗi cái bẫy (Trap) trong `Proxy` đều có một phương thức tĩnh tương ứng với **cùng tên và cùng danh sách tham số** trong `Reflect`:
- `get(target, prop, receiver)` $\iff$ `Reflect.get(target, prop, receiver)`
- `set(target, prop, val, receiver)` $\iff$ `Reflect.set(target, prop, val, receiver)`
- `has(target, prop)` $\iff$ `Reflect.has(target, prop)`
- `deleteProperty(target, prop)` $\iff$ `Reflect.deleteProperty(target, prop)`

**Tại sao bắt buộc phải dùng `Reflect` thay vì `target[prop]`?**
- Tham số `receiver` trong `Reflect.get(target, prop, receiver)` đảm bảo rằng nếu đối tượng gốc có một `getter` phụ thuộc vào `this`, con trỏ `this` sẽ **trỏ chính xác vào đối tượng Proxy** chứ không phải đối tượng target gốc.

### 2.3. Proxy Có Thể Thu Hồi (Revocable Proxy)
Khi tạo Proxy qua `const { proxy, revoke } = Proxy.revocable(target, handler)`:
- Bạn có thể chuyển giao `proxy` cho thư viện bên thứ ba sử dụng.
- Khi hết phiên làm việc, gọi `revoke()`: Toàn bộ liên kết giữa proxy và target bị cắt đứt vĩnh viễn ở tầng C++. Mọi thao tác truy xuất sau đó đều ném `TypeError`.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Cạm Bẫy `this` Của Các Built-in Objects (Private Slots Trap)
```javascript
// ❌ SAI LẦM: Proxy một đối tượng Map hoặc Date gốc
const map = new Map();
const proxyMap = new Proxy(map, {});

proxyMap.set("a", 1); // ❌ TypeError: Method Map.prototype.set called on incompatible receiver [object Object]

// NGUYÊN NHÂN: Map sử dụng khe nội bộ [[MapData]] ở tầng C++.
// Khi gọi proxyMap.set(), this trỏ vào Proxy thay vì Map gốc, khiến C++ Engine từ chối thực thi!

// ✅ ĐÚNG: Ràng buộc lại this trong get trap
const safeMapProxy = new Proxy(map, {
  get(target, prop) {
    const value = Reflect.get(target, prop);
    return typeof value === "function" ? value.bind(target) : value;
  }
});
safeMapProxy.set("a", 1); // Hoạt động hoàn hảo!
```

### Bẫy 2: Quên Trả Về `true` Trong `set` Trap (Strict Mode Failure)
- Trong Strict Mode, một `set` trap nếu trả về `false` hoặc không trả về gì (`undefined`), trình duyệt sẽ lập tức ném lỗi:
  `TypeError: 'set' on proxy: trap returned falsish for property 'x'`.
- Luôn kết thúc `set` trap bằng: `return Reflect.set(target, prop, value, receiver);`.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [01-proxy-demo.js](file:///d:/my-project/revision-document/javascript/11-meta-programming-and-es-next/01-proxy-demo.js)

### Mẫu Hỗ Trợ Chỉ Mục Âm Cho Mảng (Negative Array Indexing Giống Python)
```javascript
// Bằng Proxy, bạn có thể truy cập arr[-1] để lấy phần tử cuối cùng
function createPythonicArray(arr) {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      if (typeof prop === "string") {
        const index = Number(prop);
        // Nếu là chỉ mục âm
        if (Number.isInteger(index) && index < 0) {
          const positiveIndex = target.length + index;
          return Reflect.get(target, String(positiveIndex), receiver);
        }
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

const list = createPythonicArray(["Hà Nội", "Đà Nẵng", "TP. Hồ Chí Minh"]);
console.log(list[-1]); // "TP. Hồ Chí Minh" (Phần tử cuối)
console.log(list[-2]); // "Đà Nẵng"
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao tham số `receiver` trong `Reflect.get(target, prop, receiver)` lại có vai trò sống còn trong việc bảo toàn tính đúng đắn của chuỗi kế thừa?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Giả sử đối tượng `target` có một `getter` sử dụng con trỏ `this`:
  ```javascript
  const parent = {
    get fullName() { return `${this.firstName} ${this.lastName}`; }
  };
  const child = Object.create(new Proxy(parent, {
    get(target, prop, receiver) {
      // Nếu viết: return target[prop]; -> this sẽ trỏ vào parent!
      // Nếu viết: return Reflect.get(target, prop, receiver);
      return Reflect.get(target, prop, receiver); // this trỏ chính xác vào child!
    }
  }));
  child.firstName = "John";
  child.lastName = "Doe";
  ```
- Tham số `receiver` đại diện cho đối tượng ban đầu thực hiện lệnh truy xuất (trong ví dụ trên là `child`). `Reflect.get` truyền `receiver` này vào hàm getter, giúp `this.firstName` đọc đúng giá trị trên `child` thay vì trên `parent`.
</details>

### Câu 2: Điểm khác biệt mấu chốt giữa phương thức `Reflect.deleteProperty(target, prop)` và toán tử `delete target[prop]` là gì?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- **Toán tử `delete`**: Trong chế độ nghiêm ngặt (`"use strict"`), nếu bạn cố gắng xóa một thuộc tính không thể cấu hình (`non-configurable`), toán tử `delete` sẽ **ném ra lỗi ngoại lệ `TypeError`** làm gián đoạn chương trình.
- **Phương thức `Reflect.deleteProperty`**: Không bao giờ ném lỗi ngoại lệ. Nó thực hiện thao tác xóa một cách an toàn và **luôn trả về giá trị boolean** (`true` nếu xóa thành công, `false` nếu thuộc tính không thể xóa), giúp code dễ dàng kiểm tra điều kiện bằng câu lệnh `if` thông thường mà không cần bọc trong khối `try..catch`.
</details>
