# Tập Hợp Duy Nhất: JavaScript Set & WeakSet

Tài liệu chuyên sâu về cấu trúc dữ liệu `Set` và `WeakSet` trong JavaScript hiện đại (ES6 đến ES2024): Cơ chế `OrderedHashSet` trong V8 Engine, thuật toán so sánh `SameValueZero`, các phép toán tập hợp chuẩn ES2024 (`union`, `intersection`, `difference`), và giải pháp ngăn rò rỉ bộ nhớ với `WeakSet`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-arrays-fundamentals.md](file:///d:/my-project/revision-document/javascript/03-data-structures/01-arrays-fundamentals.md) (Mảng và các thao tác tuần tự).
  - [13-comparisons-and-equality.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/13-comparisons-and-equality.md) (Thuật toán `SameValueZero`, `===` vs `NaN`).
  - [08-const-arrays-and-immutability.md](file:///d:/my-project/revision-document/javascript/03-data-structures/08-const-arrays-and-immutability.md) (Tham chiếu ô nhớ trên Heap).
- **Mở rộng tiếp theo (Next Steps):**
  - [10-maps-and-weakmaps.md](file:///d:/my-project/revision-document/javascript/03-data-structures/) (Bảng tra cứu Key-Value và WeakMap).
  - Quản lý Cache và phát hiện vòng lặp vô hạn (Cycle Detection) trong thuật toán đồ thị.
- **Khái niệm liên quan (Related):**
  - Bảng băm (Hash Table) & Xử lý xung đột băm (Hash Collision).
  - Bộ thu dọn rác (Garbage Collector - V8 Mark-and-Sweep, Weak Reference).
  - Các phép toán đại số tập hợp (Set Algebra: Union, Intersection, Difference).

---

## 2. Bản Chất Hoạt Động (Mental Model: OrderedHashSet Trong V8)

### 1. Bản Chất Của `Set` Trong V8 Engine
- `Set` là tập hợp các giá trị **duy nhất (unique)**, không chứa phần tử trùng lặp.
- Khác với HashSet thuần túy trong một số ngôn ngữ khác (vốn không đảm bảo thứ tự), trong ECMAScript và V8:
  - `Set` được cài đặt dựa trên cấu trúc **`OrderedHashSet`**.
  - Nó kết hợp bảng băm (Hash Table) để đạt tốc độ tìm kiếm trung bình **$O(1)$**, đồng thời duy trì một danh sách liên kết/chỉ mục nội bộ để **bảo toàn chính xác thứ tự chèn (Insertion Order)** khi lặp qua các phần tử.
- Khi xóa một phần tử (`set.delete(val)`), V8 không dồn lại mảng mà đánh dấu ô đó là **Tombstone (lỗ hổng đã xóa)** để giữ nguyên thứ tự các phần tử còn lại, và chỉ nén lại khi số lượng lỗ hổng vượt quá ngưỡng chịu tải.

### 2. Thuật Toán So Khớp Giá Trị: `SameValueZero`
JavaScript `Set` xác định tính trùng lặp bằng thuật toán **`SameValueZero`**:
- `NaN` được coi là bằng `NaN`: `new Set([NaN, NaN]).size` trả về `1` (khác với toán tử `===` khi `NaN === NaN` là `false`).
- `+0` và `-0` được coi là bằng nhau: `new Set([+0, -0]).size` trả về `1`.
- Mọi kiểu dữ liệu nguyên thủy (primitive) được so sánh theo giá trị.
- Đối tượng (Objects, Arrays, Functions) được so sánh theo **địa chỉ tham chiếu (Reference Identity)** trên Memory Heap.

### 3. Ma Trận So Sánh Set vs Array

| Đặc điểm | `Array` | `Set` |
| :--- | :--- | :--- |
| **Tính duy nhất (Uniqueness)** | Cho phép phần tử trùng lặp | **Bắt buộc duy nhất** (Tự động khử trùng lặp) |
| **Truy cập theo chỉ mục** | $O(1)$ qua `arr[index]` | **Không hỗ trợ** (`set[0]` trả về `undefined`) |
| **Kiểm tra tồn tại (`has` / `includes`)** | $O(n)$ (phải duyệt tuần tự) | **Trung bình $O(1)$** (nhờ cơ chế băm) |
| **Thêm phần tử** | `push()`: $O(1)$ | `add()`: Trung bình $O(1)$ |
| **Xóa phần tử** | `splice()`: $O(n)$ (dồn chỉ mục) | `delete()`: Trung bình $O(1)$ |
| **Thuộc tính kích thước** | `.length` | **`.size`** |
| **Thứ tự lặp** | Thứ tự chỉ mục số | Thứ tự lúc chèn vào (Insertion Order) |

---

### 4. Các Phép Toán Tập Hợp Chuẩn Mới (ECMAScript 2024 New Set Methods)

Kể từ ECMAScript 2024 (đã hỗ trợ chính thức trong Node.js v22+ và các trình duyệt hiện đại), JavaScript bổ sung sẵn các phương thức đại số tập hợp nguyên bản:

```javascript
const A = new Set([1, 2, 3]);
const B = new Set([2, 3, 4]);

// 1. Phép Hợp (Union - A ∪ B):
A.union(B); // Set(4) { 1, 2, 3, 4 }

// 2. Phép Giao (Intersection - A ∩ B):
A.intersection(B); // Set(2) { 2, 3 }

// 3. Phép Hiệu (Difference - A \ B):
A.difference(B); // Set(1) { 1 }

// 4. Phép Hiệu Đối Xứng (Symmetric Difference - A △ B):
A.symmetricDifference(B); // Set(2) { 1, 4 }

// 5. Quan Hệ Tập Con & Tập Mẹ:
const sub = new Set([2, 3]);
sub.isSubsetOf(A);      // true
A.isSupersetOf(sub);    // true
A.isDisjointFrom(B);    // false (do có chung 2, 3)
```

---

### 5. `WeakSet`: Tham Chiếu Yếu & Ngăn Ngừa Rò Rỉ Bộ Nhớ

`WeakSet` là một biến thể đặc biệt của `Set`:
- **Chỉ chứa Object (hoặc Symbol không đăng ký)**: Không thể chứa giá trị nguyên thủy (`string`, `number`, `boolean`).
- **Giữ tham chiếu yếu (Weak Reference)**: Nếu một đối tượng nằm trong `WeakSet` mà không còn bất kỳ biến nào khác ngoài đời thực trỏ tới nó, Garbage Collector của V8 sẽ tự do thu dọn đối tượng đó khỏi Memory Heap.
- **Không thể duyệt tuần tự (Non-iterable)**: Không có `for...of`, không có `forEach`, không có `.values()`.
- **Không có thuộc tính `.size` và không có `.clear()`**: Vì kích thước của nó phụ thuộc vào thời điểm Garbage Collector chạy ngầm, không thể đoán trước được.
- **Phương thức khả dụng**: Chỉ có 3 phương thức: `add(obj)`, `has(obj)`, `delete(obj)`.

**Ứng dụng cốt lõi của `WeakSet`:**
1. **Brand Checking / Private Member Verification**: Đánh dấu xem một instance có thực sự được khởi tạo từ Class chỉ định hay không.
2. **Cycle Detection (Phát hiện đệ quy lặp vô hạn)**: Trong các thuật toán Deep Clone hoặc JSON Serializer mà không lo gây memory leak nếu quên xóa vết.
3. **Gắn cờ DOM Nodes / Objects**: Đánh dấu các phần tử đã xử lý mà không cản trở việc trình duyệt gỡ bỏ node đó khỏi DOM.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy truy cập chỉ mục số `set[index]`
```javascript
const set = new Set(["apple", "banana"]);
console.log(set[0]); // undefined!
```
➔ **Giải pháp:** Nếu muốn lấy phần tử đầu tiên, dùng `set.values().next().value` hoặc chuyển thành mảng `[...set][0]`.

### 2. Bẫy tham chiếu đối tượng (Reference Trap)
```javascript
const userSet = new Set();
userSet.add({ id: 101, name: "Nam" });

console.log(userSet.has({ id: 101, name: "Nam" })); // BẪY: false!
```
- **Nguyên nhân:** Hai literal `{ id: 101 }` nằm ở hai địa chỉ ô nhớ khác nhau trên Heap.
- ➔ **Giải pháp:** Phải lưu giữ biến tham chiếu gốc hoặc lưu trữ primitive identifier (như chuỗi `id`) vào Set.

### 3. Nhầm lẫn thuộc tính `.length` thay vì `.size`
```javascript
const tags = new Set(["js", "node"]);
console.log(tags.length); // undefined! (Set dùng .size)
```

### 4. Rò rỉ bộ nhớ (Memory Leak) khi dùng `Set` lưu DOM/Object tạm
```javascript
const processedNodes = new Set();
function handleClick(node) {
  processedNodes.add(node); // Nguy hiểm! Giữ chặt tham chiếu mạnh (Strong Reference)
}
// Dù DOM Node bị xóa khỏi cây DOM HTML, V8 vẫn KHÔNG THỂ giải phóng nó!
```
➔ **Giải pháp:** Chuyển sang dùng `WeakSet`. Khi node bị gỡ bỏ, V8 tự động thu hồi rác mà không cần gọi `delete()`.

---

## 4. File Code Thực Hành

- [09-sets-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/09-sets-demo.js): Code thực nghiệm toàn bộ các thao tác `Set`, so khớp `SameValueZero`, thuật toán khử trùng lặp mảng, bộ phương thức ES2024 (`union`, `intersection`, `difference`), cạm bẫy tham chiếu, và ứng dụng `WeakSet` phòng ngừa rò rỉ bộ nhớ. Chạy bằng: `node 09-sets-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao `new Set([NaN, NaN]).size` bằng `1`, trong khi toán tử `NaN === NaN` trả về `false`?**
   *Đáp án:* Vì `Set` sử dụng thuật toán so khớp `SameValueZero` được định nghĩa trong chuẩn ECMAScript. Thuật toán này xử lý trường hợp đặc biệt của `NaN`: xem `NaN` bằng chính nó để tránh việc vô tình thêm vô số giá trị `NaN` vào tập hợp duy nhất.

2. **So sánh ưu thế của `Set.prototype.has()` so với `Array.prototype.includes()` khi làm việc với 1.000.000 phần tử?**
   *Đáp án:* `Array.prototype.includes()` có độ phức tạp $O(n)$ vì phải duyệt tuần tự từ đầu đến cuối mảng, tốn hàng triệu phép so sánh khi phần tử nằm ở cuối hoặc không tồn tại. Trong khi đó, `Set.prototype.has()` tính toán mã băm của giá trị và truy cập trực tiếp vào bucket tương ứng trong `OrderedHashSet`, đạt độ phức tạp trung bình xấp xỉ $O(1)$ chỉ trong vài nano-giây.

3. **Tại sao `WeakSet` không cung cấp thuộc tính `.size` và phương thức lặp `forEach` hay `for...of`?**
   *Đáp án:* Vì các phần tử trong `WeakSet` chỉ được giữ bằng tham chiếu yếu (Weak Reference). Bất cứ lúc nào tiến trình thu gom rác (Garbage Collector) của V8 kích hoạt ngầm, các đối tượng không còn tham chiếu mạnh sẽ biến mất tức thì. Nếu cung cấp `.size` hoặc vòng lặp, kết quả trả về sẽ mang tính chất bất định (non-deterministic), phụ thuộc vào thời điểm chạy ngẫu nhiên của GC, vi phạm tính nhất quán của chương trình.
