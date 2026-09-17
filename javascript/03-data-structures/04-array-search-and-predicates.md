# Tìm Kiếm Trong Mảng & Thuật Toán So Khớp (JavaScript Array Search & Predicates)

Tài liệu ôn tập toàn diện về các phương thức tìm kiếm trong mảng: `indexOf`, `lastIndexOf`, `includes` (thuật toán `SameValueZero`), các hàm tìm kiếm theo vị ngữ `find`/`findIndex`, tìm kiếm ngược từ đuôi `findLast`/`findLastIndex` (ES2023), và cạm bẫy tìm kiếm Object theo tham chiếu.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-arrays-fundamentals.md](file:///d:/my-project/revision-document/javascript/03-data-structures/01-arrays-fundamentals.md) (Mảng cơ bản & Empty slots).
  - [01-fundamentals/13-comparisons-and-equality.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/13-comparisons-and-equality.md) (Strict Equality `===` vs `Object.is`).
- **Mở rộng tiếp theo (Next Steps):**
  - [05-array-sort-and-iteration.md](file:///d:/my-project/revision-document/javascript/03-data-structures/) (`some`, `every`, `filter` lọc nhiều phần tử).
  - Thuật toán tìm kiếm nhị phân (Binary Search) trên mảng đã sắp xếp ($O(\log n)$).
- **Khái niệm liên quan (Related):**
  - Thuật toán so khớp `SameValueZero`.
  - Predicate Functions (Hàm vị ngữ kiểm tra điều kiện boolean).

---

## 2. Bản Chất Hoạt Động (Mental Model: Thuật Toán Tìm Kiếm)

### 1. Bảng So Sánh 7 Phương Thức Tìm Kiếm Mảng
| Phương thức | Chuẩn | Đầu vào | Giá trị trả về | Thuật toán so khớp | Hỗ trợ `NaN` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `indexOf(item, from)` | ES3 | Giá trị | **Chỉ số đầu tiên** hoặc `-1` | Strict Equality (`===`) | **KHÔNG** |
| `lastIndexOf(item, from)` | ES3 | Giá trị | **Chỉ số cuối cùng** hoặc `-1` | Strict Equality (`===`) | **KHÔNG** |
| `includes(item, from)` | ES2016 | Giá trị | **`true` / `false`** | **`SameValueZero`** | **CÓ** |
| `find(predicate)` | ES2015 | Hàm Callback | **Phần tử đầu tiên** hoặc `undefined` | Hàm vị ngữ trả về Truthy | Có |
| `findIndex(predicate)` | ES2015 | Hàm Callback | **Chỉ số đầu tiên** hoặc `-1` | Hàm vị ngữ trả về Truthy | Có |
| `findLast(predicate)` | **ES2023** | Hàm Callback | **Phần tử cuối cùng** hoặc `undefined` | Duyệt ngược từ đuôi mảng | Có |
| `findLastIndex(predicate)`| **ES2023** | Hàm Callback | **Chỉ số cuối cùng** hoặc `-1` | Duyệt ngược từ đuôi mảng | Có |

### 2. Sự Khác Biệt Giữa `indexOf` (`===`) vs `includes` (`SameValueZero`)
- **`indexOf` dùng phép so sánh nghiêm ngặt `===`:**
  - Vì trong đặc tả ECMAScript, `NaN === NaN` trả về `false`, nên `[NaN].indexOf(NaN)` trả về **`-1`** (Không tìm thấy!).
- **`includes` dùng thuật toán `SameValueZero`:**
  - Tương tự như `===`, nhưng coi `NaN` bằng `NaN` và `+0` bằng `-0`.
  - Do đó: `[NaN].includes(NaN)` trả về **`true`**!

### 3. Tìm Kiếm Ngược Từ Đuôi Với `findLast()` & `findLastIndex()` (ES2023)
Trước ES2023, để tìm phần tử khớp cuối cùng, lập trình viên thường viết:
```javascript
// Cách cũ tồi tệ: Mutate mảng gốc!
arr.reverse().find(...)

// Cách cũ tốn bộ nhớ: Clone mảng rồi đảo ngược O(n) bộ nhớ phụ
[...arr].reverse().find(...)
```
Từ ES2023, `findLast()` và `findLastIndex()` duyệt trực tiếp từ cuối mảng lên đầu:
- **Độ phức tạp bộ nhớ $O(1)$** (không copy mảng).
- Dừng ngay lập tức khi tìm thấy kết quả đầu tiên từ bên phải (Short-circuit).

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Dùng `indexOf` / `includes` để tìm kiếm Object theo nội dung
```javascript
const users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];

users.includes({ id: 1, name: "Alice" }); // false!
users.indexOf({ id: 1, name: "Alice" });  // -1!
// BẪY: Hai object độc lập nằm ở 2 địa chỉ ô nhớ khác nhau trong Heap!
// ĐÚNG: Luôn dùng find() hoặc findIndex() với hàm vị ngữ so sánh thuộc tính:
const user = users.find(u => u.id === 1); // { id: 1, name: "Alice" }
```

### 2. Cạm bẫy kiểm tra điều kiện `if (arr.indexOf(val))`
```javascript
const fruits = ["apple", "banana"];

// Bẫy 1: Phần tử nằm ở vị trí đầu tiên (index = 0)
if (fruits.indexOf("apple")) { // index = 0 -> Falsy!
  // KHÔNG BAO GIỜ CHẠY VÀO ĐÂY!
}

// Bẫy 2: Phần tử không tồn tại (index = -1)
if (fruits.indexOf("orange")) { // index = -1 -> Truthy!
  // CHẠY VÀO ĐÂY DÙ KHÔNG TÌM THẤY!
}

// ĐÚNG: Dùng includes() hoặc so sánh rõ ràng !== -1:
if (fruits.includes("apple")) { /* ... */ }
```

### 3. Phân biệt `find()` trả về `undefined` do đâu?
- Nếu mảng chứa phần tử `undefined` (`[10, undefined, 20]`), `arr.find(x => x === undefined)` trả về `undefined`.
- Nhưng nếu không tìm thấy gì, `find()` cũng trả về `undefined`.
- ➔ **Giải pháp:** Nếu mảng có thể chứa giá trị `undefined`, dùng `findIndex() !== -1` hoặc `includes()`.

---

## 4. File Code Thực Hành

- [04-array-search-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/04-array-search-demo.js): Code thực nghiệm `indexOf` vs `includes` với `NaN`, cạm bẫy tìm kiếm Object theo tham chiếu, bẫy truthy của `-1`, và duyệt ngược bằng `findLast`/`findLastIndex` (ES2023). Chạy bằng: `node 04-array-search-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao `[NaN].indexOf(NaN)` trả về `-1`, trong khi `[NaN].includes(NaN)` lại trả về `true`?**
   *Đáp án:* Vì `indexOf` sử dụng phép so sánh nghiêm ngặt Strict Equality (`===`), mà trong IEEE 754 thì `NaN === NaN` là `false`. Trong khi `includes` sử dụng thuật toán `SameValueZero`, thuật toán này coi hai giá trị `NaN` là tương đương nhau.
2. **Tại sao `findLast()` (ES2023) lại ưu việt hơn kỹ thuật `[...arr].reverse().find()`?**
   *Đáp án:* Kỹ thuật `[...arr].reverse()` phải cấp phát thêm một mảng mới trong bộ nhớ Heap ($O(n)$ memory overhead) và đảo ngược toàn bộ mảng trước khi tìm kiếm. `findLast()` duyệt trực tiếp từ cuối mảng về đầu mà không tạo mảng phụ ($O(1)$ memory) và dừng ngay khi tìm thấy phần tử khớp.
