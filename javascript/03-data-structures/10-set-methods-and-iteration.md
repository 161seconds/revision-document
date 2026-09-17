# Phương Thức & Cơ Chế Duyệt Set (JavaScript Set Methods & Iteration)

Tài liệu ôn tập toàn diện về các phương thức của `Set` trong JavaScript: Bản chất bộ ba Iterators (`keys()`, `values()`, `entries()`), giải mã chữ ký `forEach(val, key)` đồng bộ với `Map`, cơ chế Living Iterators (sửa đổi tập hợp trong khi duyệt) của V8 Engine, và chuẩn Set-like objects trong các hàm đại số tập hợp ES2024.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [09-sets-and-weaksets.md](file:///d:/my-project/revision-document/javascript/03-data-structures/09-sets-and-weaksets.md) (Bản chất `OrderedHashSet` và thuật toán `SameValueZero`).
  - [06-array-iteration-and-higher-order.md](file:///d:/my-project/revision-document/javascript/03-data-structures/06-array-iteration-and-higher-order.md) (Giao thức lặp Iterator Protocol và Higher-Order Functions).
- **Mở rộng tiếp theo (Next Steps):**
  - [11-maps-and-dictionaries.md](file:///d:/my-project/revision-document/javascript/03-data-structures/) (Cấu trúc dữ liệu Map & WeakMap).
  - Tối ưu thuật toán đồ thị, xử lý luồng dữ liệu (Streams) không trùng lặp.
- **Khái niệm liên quan (Related):**
  - `Symbol.iterator` & Iterable Protocol.
  - Set-like Interface (`size`, `has`, `keys`).
  - Đột biến khi lặp (Concurrent Modification / Iterator Invalidation).

---

## 2. Bản Chất Hoạt Động (Mental Model: Iterators & V8 Living Iterators)

### 1. Bảng Tổng Hợp Phương Thức Core Của Set

| Phương thức | Cú pháp | Giá trị trả về | Độ phức tạp | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| `add(value)` | `set.add(x)` | Chính `set` (Set) | $O(1)$ | Cho phép gọi nối chuỗi (Method Chaining) |
| `delete(value)` | `set.delete(x)` | `true` nếu có và đã xóa, `false` nếu không tìm thấy | $O(1)$ | Đánh dấu tombstone trong hash table |
| `has(value)` | `set.has(x)` | `true` hoặc `false` | $O(1)$ | So khớp `SameValueZero` |
| `clear()` | `set.clear()` | `undefined` | $O(1)$ | Dọn sạch toàn bộ bucket |
| `forEach(callback)` | `set.forEach((v, k, s) => ...)` | `undefined` | $O(n)$ | `v === k` (để tương thích chữ ký `Map`) |
| `values()` | `set.values()` | Set Iterator | $O(1)$ | Trả về các giá trị theo thứ tự chèn |
| `keys()` | `set.keys()` | Set Iterator | $O(1)$ | Bí danh (alias) của `values()` |
| `entries()` | `set.entries()` | Set Iterator | $O(1)$ | Trả về các cặp `[value, value]` |
| `[Symbol.iterator]()` | `set[Symbol.iterator]()` | Set Iterator | $O(1)$ | Mặc định chính là phương thức `values()` |

---

### 2. Giải Mã Bí Ẩn: Tại Sao `keys()` Giống Hệt `values()` & `forEach` Có 2 Giá Trị Trùng Nhau?
Trong `Map`, mỗi phần tử gồm 1 cặp `[key, value]`. Do đó:
- `map.keys()` trả về danh sách khóa.
- `map.values()` trả về danh sách giá trị.
- `map.forEach((value, key, map) => ...)` cung cấp cả `value` và `key`.

Tuy nhiên, `Set` **chỉ có giá trị (value), không có khóa (key)**. Để các nhà phát triển có thể viết mã đa hình (polymorphic code) chạy chung cho cả `Set` và `Map`:
1. `set.keys()` được thiết kế như một bí danh trỏ thẳng vào `set.values()`.
2. `set.entries()` trả về cặp `[value, value]` để khớp với định dạng `[key, value]`.
3. `set.forEach((val1, val2, set) => ...)` truyền `val1 === val2` ở 2 tham số đầu:
   ```javascript
   const tags = new Set(["news", "tech"]);
   tags.forEach((value, key) => {
     console.log(value === key); // true! Luôn luôn bằng nhau!
   });
   ```

---

### 3. Cơ Chế Living Iterators: Đột Biến Trong Khi Lặp (Mutation During Iteration)
Trong nhiều ngôn ngữ lập trình như Java hay C#, việc thêm hoặc xóa phần tử trong khi đang duyệt một Collection sẽ ném ngay lỗi `ConcurrentModificationException`. 

Trong JavaScript và V8 Engine:
- `Set` sử dụng cơ chế **Living Iterator (Con trỏ sống)**.
- Khi đang lặp bằng `for...of` hoặc `forEach`:
  - Nếu bạn **`set.delete(x)`** một phần tử mà con trỏ chưa đi tới: Phần tử đó sẽ **bị bỏ qua**, không được duyệt.
  - Nếu bạn **`set.add(x)`** một phần tử mới: Phần tử đó sẽ được chèn vào cuối bảng chỉ mục và **sẽ được duyệt qua** trước khi vòng lặp kết thúc.
  - **CẢNH BÁO VÒNG LẶP VÔ TẬN**: Nếu bạn liên tục thêm phần tử mới trong thân vòng lặp, vòng lặp sẽ chạy mãi mãi!

```javascript
const numbers = new Set([1, 2]);
for (const n of numbers) {
  if (n < 5) {
    numbers.add(n + 2); // SẼ TIẾP TỤC ĐƯỢC DUYỆT!
  }
}
// numbers kết quả: Set(5) { 1, 2, 3, 4, 5 }
```

---

### 4. Chuẩn Set-like Object Trong Các Phương Thức ES2024
Các phương thức tập hợp mới trong ECMAScript 2024 (`union`, `intersection`, `difference`, v.v.) **không bắt buộc đối số truyền vào phải là một `Set` thực thụ**. Chúng chấp nhận bất kỳ đối tượng nào thỏa mãn giao diện **Set-like**:
- Có thuộc tính **`.size`** (số nguyên không âm).
- Có phương thức **`.has(value)`** (trả về boolean).
- Có phương thức **`.keys()`** (trả về một iterator duyệt qua các phần tử).

Điều này cho phép kết hợp Set trực tiếp với `Map` keys hoặc các cấu trúc tùy biến mà không cần ép kiểu qua trung gian `new Set()`.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy Vòng Lặp Vô Hạn Khi Mutate Trong `for...of`
```javascript
const set = new Set([1]);
for (const val of set) {
  set.add(val + 1); // BẪY: Treo trình duyệt / cạn kiệt bộ nhớ vì con trỏ luôn có phần tử kế tiếp!
}
```
➔ **Giải pháp:** Nếu muốn biến đổi tập hợp mà thêm phần tử mới, hãy duyệt trên một snapshot bản sao `[...set]` hoặc tạo một Set kết quả riêng biệt.

### 2. Nhầm Lẫn Giá Trị Trả Về Của `delete()` vs `clear()`
- `set.delete(val)` trả về `true` hoặc `false` để bạn biết việc xóa có thành công hay không.
- `set.clear()` luôn trả về **`undefined`** (không thể gán kết quả).

### 3. Nhầm Lẫn Cấu Trúc Trả Về Của `set.entries()`
- Trong Array: `arr.entries()` trả về `[index, element]` (ví dụ `[0, "a"]`).
- Trong Set: `set.entries()` trả về `[element, element]` (ví dụ `["a", "a"]`). Không có chỉ mục số nào xuất hiện!

---

## 4. File Code Thực Hành

- [10-set-methods-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/10-set-methods-demo.js): Code thực nghiệm toàn diện các phương thức Set, kiểm chứng `forEach` song trùng `val === key`, minh họa cơ chế Living Iterator (thêm phần tử lúc lặp), kiểm tra giao diện Set-like object trong ES2024, và các thao tác chaining an toàn. Chạy bằng: `node 10-set-methods-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao tham số thứ hai của callback trong `Set.prototype.forEach` lại nhận giá trị trùng hệt với tham số thứ nhất?**
   *Đáp án:* Để tương thích chữ ký với `Map.prototype.forEach(callback(value, key, map))`. Khi các thư viện hoặc hàm dùng chung muốn xử lý đa hình giữa `Set` và `Map`, chúng có thể gọi chung một callback nhận `(value, key)` mà không cần kiểm tra kiểu dữ liệu đầu vào.

2. **Chuyện gì xảy ra nếu bạn vừa lặp qua một Set bằng `for...of` vừa gọi `set.add(newVal)`?**
   *Đáp án:* JavaScript Set sở hữu cơ chế Living Iterator. Phần tử mới được chèn vào cuối bảng chỉ mục và vòng lặp `for...of` sẽ tiếp tục duyệt qua phần tử mới này. Nếu không có điều kiện dừng, thao tác này sẽ dẫn tới vòng lặp vô hạn (Infinite Loop).

3. **Giao diện Set-like Object trong chuẩn ECMAScript 2024 đòi hỏi những thuộc tính và phương thức tối thiểu nào?**
   *Đáp án:* Đối tượng cần có thuộc tính `.size` kiểu number, phương thức `.has(val)` kiểm tra sự tồn tại, và phương thức `.keys()` trả về một iterator của các phần tử.
