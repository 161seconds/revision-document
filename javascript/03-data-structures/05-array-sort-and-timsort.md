# Sắp Xếp Mảng, TimSort & Tính Ổn Định (JavaScript Array Sort & TimSort)

Tài liệu ôn tập toàn diện về thuật toán sắp xếp mảng trong JavaScript: Cạm bẫy sắp xếp chuỗi mặc định, hàm so sánh (Comparator), thuật toán TimSort và tính ổn định (Sort Stability), phương thức bất biến `toSorted()`/`toReversed()` (ES2023), sắp xếp chuỗi tiếng Việt với `localeCompare()`, và thuật toán xáo trộn chuẩn Fisher-Yates Shuffle.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-arrays-fundamentals.md](file:///d:/my-project/revision-document/javascript/03-data-structures/01-arrays-fundamentals.md) (Mảng cơ bản).
  - [03-array-methods-mutating-vs-immutable.md](file:///d:/my-project/revision-document/javascript/03-data-structures/03-array-methods-mutating-vs-immutable.md) (Phương thức biến đổi vs bất biến).
- **Mở rộng tiếp theo (Next Steps):**
  - [06-array-higher-order-methods.md](file:///d:/my-project/revision-document/javascript/03-data-structures/) (`map`, `filter`, `reduce`).
  - Đối tượng quốc tế hóa `Intl.Collator` (Tối ưu hóa sắp xếp chuỗi số lượng lớn).
- **Khái niệm liên quan (Related):**
  - Thuật toán TimSort (Kết hợp Merge Sort & Insertion Sort).
  - Stable Sorting (Bảo toàn thứ tự tương đối của các phần tử có cùng giá trị).

---

## 2. Bản Chất Hoạt Động (Mental Model: Thuật Toán Sắp Xếp Dưới V8)

### 1. Cạm Bẫy Mặc Định Của `arr.sort()`
Khi gọi `arr.sort()` mà **không truyền hàm so sánh**:
- JavaScript tự động ép kiểu mọi phần tử thành **Chuỗi ký tự (`string`)**.
- Sau đó so sánh theo **Thứ tự từ điển Unicode (UTF-16 Code Units)**.
```javascript
const numbers = [25, 100, 4, 8];
numbers.sort();
// KẾT QUẢ: [100, 25, 4, 8]! (Vì "1" < "2" < "4" < "8")
```

### 2. Hợp Đồng Của Hàm So Sánh (Comparator Contract)
Hàm so sánh `compareFn(a, b)` nhận vào 2 phần tử và trả về một con số:
- **`compareFn(a, b) < 0`**: `a` đứng trước `b`.
- **`compareFn(a, b) === 0`**: Giữ nguyên thứ tự tương đối giữa `a` và `b`.
- **`compareFn(a, b) > 0`**: `b` đứng trước `a`.

```javascript
// Sắp xếp số tăng dần (Ascending):
numbers.sort((a, b) => a - b); // [4, 8, 25, 100]

// Sắp xếp số giảm dần (Descending):
numbers.sort((a, b) => b - a); // [100, 25, 8, 4]
```

### 3. Dưới Tầng Động Cơ V8: TimSort & Tính Ổn Định (Stable Sort)
- Từ ECMAScript 2019 (V8 v7.0), JavaScript chính thức chuẩn hóa thuật toán sắp xếp thành **TimSort** (thuật toán lai giữa Merge Sort và Insertion Sort, độ phức tạp $O(n \log n)$).
- **Tính Ổn Định (Sort Stability):** Đảm bảo các phần tử có cùng giá trị so sánh sẽ **giữ nguyên vị trí xuất hiện ban đầu**. Trước ES2019, V8 dùng QuickSort cho mảng $> 10$ phần tử, thuật toán này không ổn định khiến thứ tự bị đảo lộn ngẫu nhiên.

### 4. Chuẩn ES2023: `toSorted()` & `toReversed()` (Bảo Toàn Mảng Gốc)
- `sort()` và `reverse()` là các hàm **Mutating** (làm thay đổi mảng gốc ngay tại chỗ).
- `toSorted(compareFn)` và `toReversed()` là chuẩn **Immutable** của ES2023: Giữ nguyên mảng gốc, trả về bản sao mảng mới đã sắp xếp.

### 5. Sắp Xếp Chuỗi Văn Bản Với `localeCompare()`
Để sắp xếp chính xác chuỗi có dấu tiếng Việt hoặc quy tắc địa phương:
```javascript
const cities = ["Đà Nẵng", "Hà Nội", "Cần Thơ", "An Giang"];
cities.sort((a, b) => a.localeCompare(b, "vi"));
// ["An Giang", "Cần Thơ", "Đà Nẵng", "Hà Nội"]
```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy xáo trộn mảng bằng `sort(() => Math.random() - 0.5)`
```javascript
// SAI - BẪY PHỎNG VẤN KINH ĐIỂN!
arr.sort(() => Math.random() - 0.5);
```
- **Lý do sai:** TimSort yêu cầu hàm so sánh phải thỏa mãn **tính bắc cầu (Transitivity)** và tính đối xứng (`a < b` thì `b > a`). Hàm random vi phạm hoàn toàn các quy tắc này, dẫn đến:
  - Phân phối xác suất **không đồng đều (Biased)**.
  - Hành vi không nhất quán giữa các trình duyệt và engine V8.
- **Giải pháp chuẩn xác:** Sử dụng thuật toán **Fisher-Yates (Knuth) Shuffle** với độ phức tạp $O(n)$.

### 2. Cạm bẫy phép trừ `(a, b) => a - b` với `Infinity` hoặc tràn số
```javascript
const values = [1e308, -1e308];
values.sort((a, b) => a - b);
// 1e308 - (-1e308) = 2e308 = Infinity (Tràn số Floating-point!)
// Nếu mảng chứa NaN, phép trừ trả về NaN khiến vị trí không đổi!
// Giải pháp an toàn cho dữ liệu lớn:
(a, b) => (a > b ? 1 : a < b ? -1 : 0);
```

---

## 4. File Code Thực Hành

- [05-array-sort-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/05-array-sort-demo.js): Code thực nghiệm bẫy Unicode sort, so sánh `sort` vs `toSorted` (ES2023), kiểm chứng Sort Stability của TimSort, sắp xếp tiếng Việt bằng `localeCompare`, và thuật toán xáo trộn chuẩn Fisher-Yates. Chạy bằng: `node 05-array-sort-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao `[3, 10, 2].sort()` lại cho ra `[10, 2, 3]`?**
   *Đáp án:* Vì khi không truyền hàm so sánh, JavaScript ép kiểu các số sang chuỗi (`"3"`, `"10"`, `"2"`) và so sánh theo mã Unicode của ký tự đầu tiên. Ký tự `"1"` có mã 49, nhỏ hơn `"2"` (mã 50) và `"3"` (mã 51).
2. **Tại sao đoạn code `arr.sort(() => Math.random() - 0.5)` không phải là thuật toán xáo trộn mảng chuẩn?**
   *Đáp án:* Vì hàm so sánh của `sort` đòi hỏi tính bắc cầu (nếu $a > b$ và $b > c$ thì $a > c$) để TimSort xây dựng cây so sánh. Việc trả về giá trị ngẫu nhiên vi phạm hợp đồng toán học này, khiến một số vị trí xuất hiện với tần suất cao hơn các vị trí khác (không đồng đều xác suất).
