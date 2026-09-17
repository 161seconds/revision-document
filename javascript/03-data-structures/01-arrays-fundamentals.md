# Mảng & Cơ Chế Bộ Nhớ (JavaScript Arrays Fundamentals & V8 Elements)

Tài liệu ôn tập toàn diện về Mảng trong JavaScript: Bản chất đối tượng đặc biệt (Special Object), các loại phần tử trong V8 Engine (Packed vs Holey Elements), cạm bẫy khởi tạo `new Array()`, thao tác với `length`, và cạm bẫy toán tử `delete`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-fundamentals/09-data-types-deep-dive.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/09-data-types-deep-dive.md) (Kiểu tham chiếu Reference & Memory Heap).
  - [01-fundamentals/15-loops-and-control-flow.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/15-loops-and-control-flow.md) (`for...of` trên Iterable).
- **Mở rộng tiếp theo (Next Steps):**
  - [02-array-methods-mutating-vs-immutable.md](file:///d:/my-project/revision-document/javascript/03-data-structures/02-array-methods-mutating-vs-immutable.md) (Phương thức biến đổi `push/pop/splice` vs Bất biến `map/filter/toSpliced`).
  - TypedArrays (`Uint8Array`, `Float64Array` - Thao tác nhị phân hiệu năng cao).
- **Khái niệm liên quan (Related):**
  - V8 Elements Kinds (`PACKED_SMI_ELEMENTS`, `HOLEY_ELEMENTS`).
  - Giao thức Duyệt `Symbol.iterator`.

---

## 2. Bản Chất Hoạt Động (Mental Model: Dưới Tầng Động Cơ V8)

### 1. Bản Chất Thật Sự Của Mảng Trong JavaScript
Trong C++ hay Java, mảng là một khối nhớ liên tục với kích thước cố định. Nhưng trong JavaScript:
- **Mảng thực chất là một Đối tượng (Object) đặc biệt.**
- Các chỉ số `arr[0]`, `arr[1]` thực chất là các **Key dạng chuỗi ký tự (`"0"`, `"1"`)**.
- Thuộc tính ma thuật **`length`**: Tự động đồng bộ bằng giá trị của chỉ số số học lớn nhất cộng thêm 1.

### 2. Mô Hình Lưu Trữ Của V8 Engine: Packed vs Holey Elements
Để tối ưu hóa hiệu năng tiệm cận mảng trong C++, V8 Engine phân loại mảng thành các loại phần tử (Elements Kinds):
1. **Packed Elements (Mảng Đầy Đủ - Cực Nhanh):**
   - Các phần tử liên tục, không có lỗ hổng (`[1, 2, 3]`).
   - Được lưu trong bộ nhớ contiguous vector. Truy xuất $O(1)$ mà không cần tra cứu prototype chain.
2. **Holey Elements (Mảng Thưa / Có Lỗ Hổng - Chậm):**
   - Khi mảng có khoảng trống (ví dụ: `new Array(3)` hoặc gán nhảy cóc `arr[100] = 5`).
   - Khi truy xuất phần tử bị rỗng, JS Engine **bắt buộc phải tra cứu ngược lên `Array.prototype` và `Object.prototype`** để xem có thuộc tính nào cùng tên không trước khi trả về `undefined`.
   - ➔ **Quy tắc vàng của V8:** Mảng một khi đã bị biến thành **Holey** thì **KHÔNG BAO GIỜ quay trở lại được dạng Packed**! Hiệu năng sẽ bị giảm sút.

### 3. Phân Biệt Các Cách Khởi Tạo Mảng
| Cú pháp | Kết quả | Bản chất V8 | Đánh giá |
| :--- | :--- | :--- | :--- |
| `[1, 2, 3]` | `[1, 2, 3]` (length 3) | `PACKED_SMI_ELEMENTS` | **Khuyên dùng nhất** |
| `new Array(3)` | `[ <3 empty items> ]` (length 3) | `HOLEY_SMI_ELEMENTS` (Toàn lỗ rỗng) | **Bẫy! Tránh dùng** |
| `new Array(3, 4)` | `[3, 4]` (length 2) | Khởi tạo với các phần tử | Cú pháp không nhất quán |
| `Array.of(3)` | `[3]` (length 1) | Khởi tạo an toàn 1 phần tử số | Chuẩn ES6 |
| `Array.from({ length: 3 }, (_, i) => i)` | `[0, 1, 2]` | Khởi tạo mảng có giá trị xác định | Chuẩn hiện đại |

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Dùng toán tử `delete` trên phần tử mảng
```javascript
const colors = ["red", "green", "blue"];
delete colors[1];
// KẾT QUẢ: ["red", <1 empty item>, "blue"]
// colors.length VẪN LÀ 3!
// delete KHÔNG XÓA PHẦN TỬ, nó chỉ tạo ra một lỗ hổng (Hole) và làm suy giảm hiệu năng mảng!
// ĐÚNG: Dùng colors.splice(1, 1) hoặc colors.toSpliced(1, 1).
```

### 2. Kiểm tra phần tử tồn tại: `in` vs `=== undefined`
```javascript
const holey = new Array(1); // [<1 empty item>]
const filled = [undefined];

// Hai mảng trông giống nhau khi đọc:
holey[0] === undefined;  // true
filled[0] === undefined; // true

// NHƯNG bản chất khác biệt hoàn toàn:
0 in holey;  // false! (Chỉ số 0 không hề tồn tại trong object)
0 in filled; // true!  (Chỉ số 0 có tồn tại và giá trị của nó là undefined)
```

### 3. Kiểm tra kiểu mảng bằng `typeof`
```javascript
typeof [1, 2, 3]; // "object" (Không phân biệt được với plain object {})
// ĐÚNG: Luôn luôn dùng Array.isArray(arr)
Array.isArray([1, 2, 3]); // true
```

### 4. Thuộc tính `length` có thể ghi (Writable `length`)
- Giảm `length` sẽ **cắt ngắn mảng vĩnh viễn (Truncate)**:
  ```javascript
  const list = [1, 2, 3, 4, 5];
  list.length = 2; // list trở thành [1, 2], các phần tử sau bị huỷ!
  ```
- Kỹ thuật dọn sạch mảng tức thì (Clear Array) mà không thay đổi tham chiếu:
  ```javascript
  list.length = 0; // Làm rỗng mảng gốc, mọi biến đang trỏ tới list đều thấy mảng rỗng!
  ```

---

## 4. File Code Thực Hành

- [01-arrays-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/01-arrays-demo.js): Code thực nghiệm Packed vs Holey Arrays, cạm bẫy toán tử `delete`, kiểm chứng `in` operator với holes, `Array.of()` vs `new Array()`, và dọn mảng bằng `length = 0`. Chạy bằng: `node 01-arrays-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Điều gì xảy ra khi bạn gọi `delete arr[0]` trên mảng `[10, 20, 30]`? Thuộc tính `length` thay đổi thế nào?**
   *Đáp án:* Giá trị tại chỉ số `0` bị xóa để lại một lỗ hổng rỗng (`empty slot`), biến mảng thành Holey Array. Thuộc tính `length` **hoàn toàn không thay đổi** (vẫn là 3).
2. **Sự khác biệt giữa `0 in new Array(1)` và `0 in [undefined]` là gì?**
   *Đáp án:* `0 in new Array(1)` trả về `false` vì chỉ số `0` chưa từng được cấp phát thuộc tính trong đối tượng mảng (là slot trống). Trong khi `0 in [undefined]` trả về `true` vì thuộc tính `"0"` đã được tạo và chứa giá trị là `undefined`.
