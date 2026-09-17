# Cấu Trúc Bảng Ánh Xạ: Map & WeakMap Toàn Tập

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [09-sets-and-weaksets.md](file:///d:/my-project/revision-document/javascript/03-data-structures/09-sets-and-weaksets.md) (Set, WeakSet, Thuật toán SameValueZero).
  - [01-fundamentals/01-variables-and-data-types.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-variables-and-data-types.md) (Tham chiếu vs Tham trị).
- **Khái niệm tương quan**:
  - **Hash Table C++ Implementation**: Trong V8 Engine, `Map` được cài đặt bằng cấu trúc bảng băm đóng (Closed Hashing) kết hợp mảng liên kết (OrderedHashTable) giúp duy trì thời gian tra cứu $O(1)$ và bảo toàn thứ tự chèn.
  - **Garbage Collector Ephemerons**: `WeakMap` sử dụng thuật toán Ephemeron trong V8, trong đó một cặp key-value chỉ tồn tại khi key còn có ít nhất một tham chiếu mạnh từ nơi khác.
- **Điểm đến tiếp theo**:
  - [13-iterators-and-generators.md](file:///d:/my-project/revision-document/javascript/03-data-structures/13-iterators-and-generators.md) (Giao thức lặp Iterable & Generators).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Ma Trận So Sánh: `Map` vs `Object` Thuần

| Tiêu chí | `Map` (ES6+) | `Plain Object` (`{}`) |
| :--- | :--- | :--- |
| **Kiểu dữ liệu của Khóa (Key)** | **Mọi kiểu**: Object, Function, Number, NaN, Symbol | **Chỉ String hoặc Symbol** (tự động ép kiểu) |
| **Thứ tự phần tử** | **Bảo toàn 100% thứ tự chèn (Insertion Order)** | Phức tạp (Số nguyên dương xếp trước, sau đó tới chuỗi) |
| **Kích thước phần tử** | Có sẵn thuộc tính `map.size` cực nhanh ($O(1)$) | Phải tính thủ công `Object.keys(obj).length` ($O(N)$) |
| **Hiệu năng thêm / xóa liên tục** | **Tối ưu hóa chuyên dụng** cho tra cứu và mutate liên tục | Chậm hơn, dễ làm hỏng V8 Hidden Class |
| **Khóa mặc định** | Hoàn toàn sạch, không chứa key kế thừa từ prototype | Mặc định kế thừa `toString`, `valueOf` từ `Object.prototype` |
| **Tuần tự hóa JSON** | Không hỗ trợ trực tiếp `JSON.stringify(map)` | Hỗ trợ tự nhiên với `JSON.stringify(obj)` |

### 2.2. Thuật Toán So Sánh Khóa (SameValueZero)
`Map` sử dụng thuật toán so sánh `SameValueZero`:
- Giống `===` ngoại trừ việc coi `NaN === NaN` là **`true`**.
- Coi `+0` và `-0` là bằng nhau.
- Các Object làm key được so sánh bằng **địa chỉ tham chiếu bộ nhớ (Memory Reference)**, không phải nội dung cấu trúc:
  ```javascript
  const m = new Map();
  m.set({}, "A");
  m.get({}); // undefined! Vì 2 object literal là 2 vùng nhớ khác nhau
  ```

### 2.3. Bản Chất Của `WeakMap` & Cơ Chế Thu Gom Rác (GC)
- **Key bắt buộc phải là Object**: Không cho phép kiểu nguyên thủy (`string`, `number`, `boolean`) vì chúng không thể thu gom rác.
- **Tham chiếu yếu (Weak Reference)**: Khi đối tượng key không còn bất kỳ biến nào khác bên ngoài trỏ tới, Garbage Collector của V8 sẽ tự động dọn dẹp đối tượng đó và giải phóng luôn cả value tương ứng khỏi bộ nhớ RAM.
- **Không thể lặp (Non-iterable)**: `WeakMap` không có `.size`, không có `.keys()`, `.values()`, `.entries()` hay `forEach()`. Lý do: Bộ thu gom rác chạy bất đồng bộ (Non-deterministic), việc cho phép lặp sẽ dẫn đến kết quả không nhất quán giữa các thời điểm dọn rác.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Dùng Cú Pháp Gán Thuộc Tính (`map[key] = val`) Thay Vì `map.set(key, val)`
```javascript
const map = new Map();

// ❌ SAI LẦM: Bạn đang gán thuộc tính lên đối tượng JavaScript thông thường!
map["user"] = "Alice";
console.log(map.has("user")); // false!
console.log(map.size);        // 0! (Map không ghi nhận entry này vào bảng băm)

// ✅ ĐÚNG: Luôn dùng phương thức của Map API
map.set("user", "Alice");
console.log(map.has("user")); // true
console.log(map.size);        // 1
```

### Bẫy 2: Cố Gắng `JSON.stringify()` Một Đối Tượng `Map`
```javascript
const map = new Map([["a", 1], ["b", 2]]);

// ❌ BẪY: JSON.stringify chỉ duyệt qua các enumerable properties của object
console.log(JSON.stringify(map)); // "{}" (Trả về chuỗi JSON rỗng!)

// ✅ ĐÚNG: Chuyển đổi sang Plain Object bằng Object.fromEntries() trước
const jsonString = JSON.stringify(Object.fromEntries(map));
console.log(jsonString); // '{"a":1,"b":2}'
```

### Bẫy 3: Gắn Dữ Liệu Tạm Của DOM Node Vào `Map` Gây Rò Rỉ Bộ Nhớ (Memory Leak)
- Nếu dùng `Map` thông thường để lưu metadata của các DOM Elements (`map.set(buttonNode, { clicks: 10 })`): Khi thẻ button đó bị xóa khỏi trang bằng `button.remove()`, nó vẫn **vĩnh viễn không được giải phóng khỏi RAM** vì `Map` đang giữ một tham chiếu mạnh tới nó.
- **Giải pháp bắt buộc**: Luôn dùng `WeakMap` cho metadata của DOM: `const domStore = new WeakMap()`. Khi phần tử DOM bị hủy, toàn bộ dữ liệu đi kèm sẽ tự động bay hơi khỏi bộ nhớ.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [12-maps-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/12-maps-demo.js)

### Pattern Production: Cache Kết Quả Tính Toán (Memoization) Bằng WeakMap
```javascript
// Cache hàm tính toán nặng dựa trên Object đầu vào mà không lo rò rỉ RAM
const memoCache = new WeakMap();

function processUserAnalytics(userObject) {
  if (memoCache.has(userObject)) {
    console.log("-> Lấy kết quả từ Cache!");
    return memoCache.get(userObject);
  }

  console.log("-> Đang tính toán tác vụ nặng (CPU intensive)...");
  // Giả lập tính toán phức tạp
  const score = Object.keys(userObject).length * 100 + userObject.age;

  memoCache.set(userObject, score);
  return score;
}

let vipCustomer = { name: "Elon", age: 50 };
processUserAnalytics(vipCustomer); // Tính toán...
processUserAnalytics(vipCustomer); // Lấy từ Cache!

// Khi vipCustomer bị hủy tham chiếu:
vipCustomer = null;
// Vùng nhớ cache trong memoCache tự động được V8 thu gom sạch sẽ!
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao `WeakMap` lại không hỗ trợ thuộc tính `.size` và phương thức lặp `forEach()` hoặc `for..of`?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Quá trình thu gom rác (Garbage Collection - GC) của V8 Engine diễn ra một cách **bất định (Non-deterministic)** và phụ thuộc vào thuật toán phân bổ bộ nhớ của hệ điều hành và CPU.
- Nếu `WeakMap` cung cấp thuộc tính `.size` hoặc cho phép duyệt qua các phần tử, kết quả trả về sẽ thay đổi liên tục tùy thuộc vào việc GC đã chạy hay chưa, gây ra các lỗi Race Condition và lỗi logic không thể tái hiện trong kiểm thử phần mềm.
- Do đó, đặc tả ECMAScript cố tình cấm hoàn toàn khả năng liệt kê danh sách (Enum) của `WeakMap` để đảm bảo tính toàn vẹn ngữ nghĩa của bộ nhớ.
</details>

### Câu 2: Khi nào bạn nên chọn `Map` thay vì `Plain Object` trong một ứng dụng Node.js backend xử lý hàng triệu request?
<details>
<summary><b>Lời giải chi tiết</b></summary>

1. **Khi số lượng key thay đổi liên tục (High Churn Rate)**: Thêm và xóa thuộc tính (`delete obj.prop`) trên Object sẽ phá vỡ Hidden Class của V8, ép Engine chuyển object sang Dictionary Mode gây tụt giảm hiệu năng truy xuất. `Map` được thiết kế cấu trúc dữ liệu tối ưu riêng cho thao tác thêm/xóa phần tử tần suất cao.
2. **Khi không biết trước tên Key (Dynamic Keys)**: Tránh nguy cơ bị tấn công Prototype Pollution khi người dùng truyền vào các key độc hại như `__proto__`, `constructor`, `toString`.
3. **Khi cần bảo toàn thứ tự chèn chuẩn xác**: `Map` luôn đảm bảo thứ tự chèn, trong khi Object sẽ tự động đảo các key dạng số lên đầu.
4. **Khi cần đo đạc số lượng phần tử thường xuyên**: `map.size` có độ phức tạp $O(1)$, trong khi `Object.keys(obj).length` phải duyệt toàn bộ mảng khóa với độ phức tạp $O(N)$.
</details>
