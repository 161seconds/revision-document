# So Sánh, Đẳng Thức & Các Dị Biệt (JavaScript Comparisons & Equality)

Tài liệu ôn tập toàn diện về cơ chế so sánh trong JavaScript: Abstract Equality (`==`) vs Strict Equality (`===`), thuật toán ép kiểu tự động (Coercion), so sánh từ điển của chuỗi, cạm bẫy `null` / `undefined` / `NaN`, và thuật toán `Object.is()`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [09-data-types-deep-dive.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/09-data-types-deep-dive.md) (8 kiểu dữ liệu & Primitive vs Reference).
  - [10-operators-and-precedence.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/10-operators-and-precedence.md) (Toán tử và độ ưu tiên).
- **Mở rộng tiếp theo (Next Steps):**
  - [14-conditions-and-branching/](file:///d:/my-project/revision-document/javascript/01-fundamentals/) (Cấu trúc rẽ nhánh `if...else`, `switch...case`).
  - Thuật toán tìm kiếm trong mảng: `Array.prototype.indexOf()` (dùng `===`) vs `Array.prototype.includes()` (dùng thuật toán `SameValueZero` nhận diện được `NaN`).
- **Khái niệm liên quan (Related):**
  - Thuật toán ép kiểu `ToPrimitive`, `ToNumber`.
  - Bảng mã Unicode Code Point trong so sánh chuỗi.

---

## 2. Bản Chất Hoạt Động (Mental Model: Thuật Toán So Sánh ECMA-262)

### 1. Phân Biệt 3 Cấp Độ So Sánh Đẳng Thức
| Cấp độ | Cú pháp / Phương thức | Xử lý kiểu dữ liệu | `NaN === NaN` | `+0 === -0` |
| :--- | :--- | :--- | :--- | :--- |
| **Loose Equality** | `==` | Tự động ép kiểu (Coercion) | `false` | `true` |
| **Strict Equality** | `===` | So khớp cả kiểu lẫn giá trị | `false` | `true` |
| **SameValue** | `Object.is(x, y)` | So khớp tuyệt đối (không ép kiểu) | **`true`** | **`false`** |

### 2. Thuật Toán So Sánh Lỏng `==` (Abstract Equality Algorithm)
Khi hai toán hạng khác kiểu so sánh bằng `==`:
1. Nếu một bên là `Boolean`: Chuyển `Boolean` thành `Number` (`true -> 1`, `false -> 0`) rồi so sánh tiếp.
2. Nếu so sánh `String` với `Number`: Chuyển `String` thành `Number` bằng `ToNumber()`.
3. Nếu so sánh `Object` với `Primitive`: Gọi `ToPrimitive(object)` (lần lượt thử `valueOf()`, `toString()`).
4. **Quy tắc đặc biệt của `null` và `undefined`:**
   - `null == undefined` trả về **`true`**.
   - `null` và `undefined` **không bị ép kiểu thành số** khi dùng `==`. Chúng không bằng bất kỳ giá trị nào khác (kể cả `0` hay `false`).

### 3. Thuật Toán So Sánh Quan Hệ (`<`, `>`, `<=`, `>=`)
- **Trường hợp cả 2 là chuỗi (String):** So sánh theo **thứ tự từ điển (Lexicographical order)** dựa trên mã Unicode Code Point từ trái sang phải:
  ```javascript
  "2" > "12" // TRUE! Vì ký tự "2" (mã 50) lớn hơn ký tự đầu tiên "1" (mã 49).
  ```
- **Trường hợp có ít nhất một toán hạng không phải chuỗi:** Cả hai được ép kiểu sang số (`ToNumeric`):
  ```javascript
  null >= 0 // TRUE! Vì Number(null) là 0 => 0 >= 0 là true.
  ```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Dị biệt kinh điển: Bộ ba `null` và số `0`
```javascript
null > 0   // false (Number(null) -> 0, mà 0 > 0 là false)
null == 0  // false (Quy tắc ECMA: null chỉ bằng null hoặc undefined khi dùng ==)
null >= 0  // true  (Number(null) -> 0, mà 0 >= 0 là true)
```
> [!WARNING]
> Mặc dù `null >= 0` là `true`, nhưng `null == 0` lại là `false`! Đây là câu hỏi phỏng vấn bẫy phổ biến nhất về cơ chế so sánh của JavaScript.

### 2. Bẫy so sánh `NaN`
- `NaN` không bằng bất kỳ thứ gì, kể cả chính nó:
  ```javascript
  NaN === NaN // false
  NaN == NaN  // false
  ```
- Phân biệt `isNaN()` vs `Number.isNaN()`:
  - `isNaN("hello")` trả về `true` vì ép kiểu `"hello"` sang số thành `NaN`.
  - `Number.isNaN("hello")` trả về `false` vì kiểm tra nghiêm ngặt kiểu `number` trước.
  - Kiểm tra an toàn: dùng `Number.isNaN()` hoặc `Object.is(val, NaN)`.

### 3. Bẫy ép kiểu Array/Object khi so sánh lỏng `==`
```javascript
[] == false       // true! ([] -> "" -> 0; false -> 0 => 0 == 0)
[0] == false      // true! ([0] -> "0" -> 0 => 0 == 0)
[1, 2] == "1,2"   // true! ([1, 2].toString() -> "1,2")
```

### 4. Bẫy so sánh kiểu tham chiếu (Reference Equality)
- Hai object/array độc lập không bao giờ bằng nhau dù nội dung giống hệt:
  ```javascript
  {} === {}       // false
  [] === []       // false
  ```
- Phép so sánh object chỉ kiểm tra xem cả hai biến có cùng trỏ tới một địa chỉ ô nhớ trong Memory Heap hay không.

---

## 4. File Code Thực Hành

- [13-comparisons-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/13-comparisons-demo.js): Code thực nghiệm bộ ba dị biệt của `null`, so sánh từ điển chuỗi `"2" > "12"`, phân biệt `Object.is()`, và thuật toán `ToPrimitive` trên object. Chạy bằng: `node 13-comparisons-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao biểu thức `"25" < "3"` lại trả về `true` trong JavaScript?**
   *Đáp án:* Vì cả 2 toán hạng đều là `string`, JavaScript so sánh theo thứ tự từ điển (Unicode). Ký tự đầu tiên `"2"` (mã 50) nhỏ hơn ký tự `"3"` (mã 51), nên `"25" < "3"` là `true`. Để so sánh giá trị số, phải ép kiểu: `Number("25") < Number("3")` (`false`).
2. **Sự khác biệt giữa `+0 === -0` và `Object.is(+0, -0)` là gì? Tại sao điều này quan trọng?**
   *Đáp án:* `+0 === -0` trả về `true`, trong khi `Object.is(+0, -0)` trả về `false`. Điều này quan trọng trong các phép toán hình học/vật lý hoặc đồ họa, nơi `1 / +0 === Infinity` và `1 / -0 === -Infinity` (hướng đi ngược chiều nhau).
