# Hàm Tạo Mảng & Nhận Diện Kiểu Chuẩn (JavaScript Array Constructor & Type Checking)

Tài liệu ôn tập toàn diện về hàm tạo `Array()`, thuộc tính `constructor`, cạm bẫy khoảng trống (Holes) khi dùng `map()`, cạm bẫy chia sẻ tham chiếu với `.fill({})`, và giải mã lý do `Array.isArray()` vượt trội hơn `instanceof` trong môi trường Cross-Realm (Iframe / VM).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-arrays-fundamentals.md](file:///d:/my-project/revision-document/javascript/03-data-structures/01-arrays-fundamentals.md) (Packed vs Holey Elements).
  - [01-fundamentals/09-data-types-deep-dive.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/09-data-types-deep-dive.md) (Kiểu dữ liệu Reference).
- **Mở rộng tiếp theo (Next Steps):**
  - [03-array-methods-transform-and-search.md](file:///d:/my-project/revision-document/javascript/03-data-structures/03-array-methods-transform-and-search.md) (`map`, `filter`, `reduce`, `find`).
  - Kế thừa mảng (Subclassing Array) & Symbol Species (`[Symbol.species]`).
- **Khái niệm liên quan (Related):**
  - Lỗi `RangeError: Invalid array length`.
  - Vấn đề đa ngữ cảnh thực thi (Cross-Realm / Multiple Iframes / Worker Threads).

---

## 2. Bản Chất Hoạt Động (Mental Model: Array Constructor & Cross-Realm)

### 1. Hành Vi Phân Nhánh Kỳ Lạ Của `new Array(...)`
Hàm tạo `Array()` có hành vi phụ thuộc vào **số lượng** và **kiểu** của tham số truyền vào:
1. **Truyền 1 số nguyên dương ($0 \le n < 2^{32}-1$):**
   - Tạo ra mảng có `length = n` nhưng **chứa toàn bộ lỗ rỗng (Empty Slots / Holes)**.
   - Nếu truyền số âm hoặc số thực (`new Array(-1)` hoặc `new Array(3.14)`): Ném ngay lỗi **`RangeError: Invalid array length`**.
2. **Truyền 1 tham số không phải kiểu number:**
   - `new Array("5")` ➔ Tạo mảng `["5"]` có 1 phần tử là chuỗi `"5"` (length 1).
3. **Truyền từ 2 tham số trở lên:**
   - `new Array(1, 2, 3)` ➔ Tạo mảng `[1, 2, 3]`.
> [!NOTE]
> Gọi `Array(...)` không có từ khóa `new` mang lại kết quả y hệt như có `new` (`Array(5)` tương đương `new Array(5)`).

### 2. Sự Thất Bại Của `instanceof` & `constructor` Trong Môi Trường Cross-Realm
Tại sao không được dùng `arr instanceof Array` hoặc `arr.constructor === Array` để kiểm tra mảng?
- Trong các ứng dụng Web phức tạp (nhúng `<iframe>`, micro-frontends, hoặc Node.js `worker_threads` / `vm`), **mỗi Realm sở hữu một Global Object và một hàm tạo `Array` hoàn toàn độc lập trong bộ nhớ**.
- Mảng được tạo ra từ bên trong iframe sẽ kế thừa từ `iframe.contentWindow.Array.prototype`, vốn **khác địa chỉ ô nhớ** với `window.Array.prototype` của trang chính.
- Do đó: `iframeArray instanceof Array` trả về **`false`**!
- ➔ **Giải pháp:** `Array.isArray(arr)` kiểm tra internal slot `[[Class]]` (hoặc cờ `IsArray` trong engine C++), trả về `true` bất kể mảng được sinh ra từ bất kỳ Realm hay frame nào.

### 3. Bộ Đôi Khắc Phục Của ES6: `Array.of()` & `Array.from()`
- **`Array.of(...elements)`:** Triệt tiêu hoàn toàn sự nhập nhằng của `new Array`:
  `Array.of(3)` luôn luôn trả về `[3]`.
- **`Array.from(arrayLike, mapFn)`:** Chuyển đổi an toàn các đối tượng dạng mảng hoặc Iterable thành mảng thực thụ, hỗ trợ hàm ánh xạ (mapping) ngay tại thời điểm khởi tạo:
  `Array.from({ length: 3 }, (_, i) => i)` ➔ `[0, 1, 2]`.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy gọi `map()`, `forEach()` trên mảng rỗng `new Array(n)`
Các phương thức duyệt mảng của JavaScript (`map`, `forEach`, `filter`, `some`, `every`) **bỏ qua hoàn toàn các slot rỗng (Holes)**:
```javascript
const result = new Array(3).map(() => 10);
// KẾT QUẢ: VẪN LÀ [ <3 empty items> ]!
// Hàm callback () => 10 KHÔNG BAO GIỜ ĐƯỢC GỌI vì không có phần tử thực sự nào!

// CÁCH KHẮC PHỤC CHUẨN:
const safeList = Array.from({ length: 3 }, () => 10); // [10, 10, 10]
```

### 2. Bẫy chia sẻ tham chiếu với `.fill({})`
```javascript
const matrix = new Array(3).fill({});
matrix[0].status = "READY";

// BẪY CHÍ MẠNG! Tất cả các phần tử cùng trỏ vào MỘT Object duy nhất:
console.log(matrix[1].status); // "READY"! (Bị sửa lây!)

// CÁCH KHẮC PHỤC: Khởi tạo object độc lập qua Array.from:
const safeMatrix = Array.from({ length: 3 }, () => ({}));
safeMatrix[0].status = "READY";
console.log(safeMatrix[1].status); // undefined (Hoàn toàn độc lập!)
```

---

## 4. File Code Thực Hành

- [02-array-constructor-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/02-array-constructor-demo.js): Code thực nghiệm hành vi phân nhánh `new Array`, `RangeError`, bẫy `map()` trên empty slots, bẫy chia sẻ tham chiếu `.fill({})`, và mô phỏng lỗi `instanceof` trong môi trường Cross-Realm bằng Node.js `vm`. Chạy bằng: `node 02-array-constructor-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Biểu thức `new Array(3).map(() => 0)` trả về kết quả gì và tại sao?**
   *Đáp án:* Trả về `[ <3 empty items> ]` (mảng gồm 3 lỗ rỗng). Vì theo đặc tả ECMAScript, hàm `map` kiểm tra `k in O` và bỏ qua tất cả các chỉ số không tồn tại thực sự (empty slots).
2. **Tại sao `Array.isArray(arr)` là cách duy nhất an toàn để kiểm tra mảng trong ứng dụng web có sử dụng `<iframe>`?**
   *Đáp án:* Vì mỗi `<iframe>` có một Execution Context và hàm tạo `Array` riêng biệt. `instanceof Array` chỉ so sánh chuỗi prototype nội bộ của context hiện tại nên sẽ trả về `false` đối với mảng sinh ra từ iframe. `Array.isArray()` kiểm tra trực tiếp internal slot `[[Class]]` của động cơ nên hoạt động chính xác xuyên suốt mọi Realm.
