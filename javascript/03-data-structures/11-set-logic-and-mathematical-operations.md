# Đại Số Tập Hợp & Logic: JavaScript Set Logic (ES2024 Set Operations)

Tài liệu chuyên sâu về 7 phép toán đại số tập hợp chuẩn ECMAScript 2024 trong JavaScript: Bản đồ biểu đồ Venn, phân tích tối ưu hóa thuật toán nội tại của V8 Engine ($O(\min(|A|, |B|))$), so sánh chi phí bộ nhớ Native C++ vs Mảng trung gian ES6, và các cạm bẫy toán học thường gặp.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [09-sets-and-weaksets.md](file:///d:/my-project/revision-document/javascript/03-data-structures/09-sets-and-weaksets.md) (Cấu trúc `OrderedHashSet` và thuật toán `SameValueZero`).
  - [10-set-methods-and-iteration.md](file:///d:/my-project/revision-document/javascript/03-data-structures/10-set-methods-and-iteration.md) (Giao diện Set-like Objects: `size`, `has`, `keys`).
- **Mở rộng tiếp theo (Next Steps):**
  - [12-maps-and-dictionaries.md](file:///d:/my-project/revision-document/javascript/03-data-structures/) (Ánh xạ Key-Value với Map).
  - Phân tích quyền hạn người dùng (RBAC: Role-Based Access Control) bằng phép toán tập hợp.
- **Khái niệm liên quan (Related):**
  - Lý thuyết tập hợp (Set Theory) & Biểu đồ Venn (Venn Diagrams).
  - Áp lực thu dọn rác (GC Pressure) khi sinh mảng trung gian.
  - Phép toán có tính giao hoán (Commutative) vs Không giao hoán (Non-commutative).

---

## 2. Bản Chất Hoạt Động (Mental Model: Đại Số Tập Hợp & Tối Ưu V8)

### 1. Bảng 7 Phép Toán Đại Số Tập Hợp (Venn Diagrams & Ký Hiệu Toán Học)

| Phương thức ES2024 | Ký hiệu toán học | Ý nghĩa toán học (Venn Diagram) | Tính giao hoán? | Độ phức tạp V8 |
| :--- | :--- | :--- | :--- | :--- |
| **`A.union(B)`** | $A \cup B$ | Lấy toàn bộ phần tử thuộc $A$ **hoặc** thuộc $B$ | Có: $A \cup B = B \cup A$ | $O(\|A\| + \|B\|)$ |
| **`A.intersection(B)`** | $A \cap B$ | Chỉ lấy phần tử vừa thuộc $A$ **và** vừa thuộc $B$ | Có: $A \cap B = B \cap A$ | **$O(\min(\|A\|, \|B\|))$** |
| **`A.difference(B)`** | $A \setminus B$ | Lấy phần tử thuộc $A$ nhưng **không** thuộc $B$ | **Không**: $A \setminus B \neq B \setminus A$ | $O(\|A\|)$ |
| **`A.symmetricDifference(B)`** | $A \triangle B$ | Thuộc $A$ hoặc $B$, nhưng **không thuộc cả hai** | Có: $A \triangle B = B \triangle A$ | $O(\|A\| + \|B\|)$ |
| **`A.isSubsetOf(B)`** | $A \subseteq B$ | Kiểm tra mọi phần tử của $A$ có nằm trong $B$ không | Không | $O(\|A\|)$ |
| **`A.isSupersetOf(B)`** | $A \supseteq B$ | Kiểm tra $A$ có chứa toàn bộ phần tử của $B$ không | Không | $O(\|B\|)$ |
| **`A.isDisjointFrom(B)`** | $A \cap B = \emptyset$ | Kiểm tra hai tập hợp có **hoàn toàn không chung nhau** phần tử nào | Có | $O(\min(\|A\|, \|B\|))$ |

---

### 2. Tối Ưu Hóa Kích Thước Của V8 Engine Trong `intersection()` & `isDisjointFrom()`

Khi thực hiện phép giao $A \cap B$ giữa tập $A$ (1.000.000 phần tử) và tập $B$ (5 phần tử):
- Nếu tự viết bằng mã ES6 cũ:
  ```javascript
  // KÉM TỐI ƯU: Luôn duyệt qua 1.000.000 phần tử của A!
  new Set([...A].filter(x => B.has(x)));
  ```
- **Cách V8 Engine tối ưu Native C++:**
  1. V8 đọc thuộc tính `A.size` và `B.size`.
  2. Phát hiện `B.size < A.size`.
  3. V8 sẽ **duyệt qua 5 phần tử của B** và kiểm tra `A.has(b)`.
  4. Số phép kiểm tra giảm từ **1.000.000 xuống chỉ còn 5 phép toán $O(1)$**!
  5. Độ phức tạp thực tế đạt mức tối ưu tuyệt đối: **$O(\min(|A|, |B|))$**.

---

### 3. Native ES2024 vs ES6 Polyfill: Cắt Giảm Áp Lực Bộ Nhớ (GC Pressure)

Trước khi có ES2024, các lập trình viên thường dùng toán tử Spread `[...set]` để biến đổi:
```javascript
// CÁCH CŨ (ES6) - TỐN BỘ NHỚ:
const unionOld = new Set([...A, ...B]); 
// 1. Tạo mảng trung gian từ A
// 2. Tạo mảng trung gian từ B
// 3. Ghép 2 mảng tạo mảng thứ 3
// 4. Khởi tạo Set mới từ mảng thứ 3
// -> Sinh ra hàng loạt mảng rác trên Memory Heap, kích hoạt Garbage Collector liên tục!

// CÁCH MỚI (ES2024) - NATIVE C++ ZERO INTERMEDIATE ARRAYS:
const unionNew = A.union(B); 
// V8 cấp phát trực tiếp OrderedHashSet mới và copy thẳng các bucket
// -> Không sinh mảng trung gian, giảm 60-80% thời gian thực thi!
```

---

### 4. Tính Bất Biến Tuyệt Đối (Immutability)
Tất cả các phương thức logic của Set:
- **Không bao giờ mutate (thay đổi) tập hợp gốc $A$ hay $B$**.
- Luôn tạo và trả về một đối tượng `Set` hoàn toàn mới (hoặc trả về `boolean`).
- Hoàn toàn tương thích với mô hình lập trình hàm (Functional Programming) và quản lý State trong React/Redux.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy Tính Chất Bất Đối Xứng Của `difference()`
```javascript
const admins = new Set(["Alice", "Bob"]);
const moderators = new Set(["Bob", "Charlie"]);

console.log([...admins.difference(moderators)]); // ["Alice"]
console.log([...moderators.difference(admins)]); // ["Charlie"]
// A \ B KHÔNG BAO GIỜ BẰNG B \ A (Trừ khi A === B)!
```

### 2. Bẫy Đối Số Không Thỏa Mãn Chuẩn Set-like
Các phương thức Set ES2024 yêu cầu đối số phải là **Set-like object** (phải có `.size`, `.has`, `.keys`):
```javascript
const set = new Set([1, 2, 3]);

// BẪY: Truyền Mảng thông thường sẽ ném TypeError!
set.union([3, 4, 5]); // TypeError: GetMethod is not a function hoặc đối số không phải Set-like!

// ➔ GIẢI PHÁP: Bọc vào new Set() hoặc truyền đối tượng có interface Set-like:
set.union(new Set([3, 4, 5])); // Hợp lệ!
```

### 3. Chân Lý Rỗng Của Tập Con (Vacuous Truth In Subset)
- Tập rỗng $\emptyset$ là con của **mọi tập hợp**:
  ```javascript
  const empty = new Set();
  const nums = new Set([1, 2, 3]);
  console.log(empty.isSubsetOf(nums)); // true!
  ```
- Hai tập bất kỳ đều rời nhau với tập rỗng:
  ```javascript
  console.log(empty.isDisjointFrom(nums)); // true!
  ```

---

## 4. File Code Thực Hành

- [11-set-logic-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/11-set-logic-demo.js): Code thực nghiệm 7 phép toán tập hợp ES2024, kiểm chứng tính giao hoán, đo đạc kiểm chứng tính bất biến, minh họa bẫy không phải Set-like ném `TypeError`, và ứng dụng thực tế phân quyền Role-Based Access Control (RBAC). Chạy bằng: `node 11-set-logic-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Thuật toán của `Set.prototype.intersection()` trong V8 Engine tối ưu hiệu năng như thế nào khi giao giữa một tập hợp 1 triệu phần tử và một tập hợp 3 phần tử?**
   *Đáp án:* V8 sẽ kiểm tra `.size` của hai tập hợp và quyết định lặp qua tập hợp nhỏ hơn (chỉ gồm 3 phần tử), sau đó gọi phương thức `.has()` với độ phức tạp $O(1)$ trên tập hợp 1 triệu phần tử. Tổng thời gian thực thi chỉ tốn 3 phép tra cứu thay vì phải duyệt qua toàn bộ 1 triệu phần tử, đạt độ phức tạp $O(\min(|A|, |B|))$.

2. **Tại sao truyền một Array `[1, 2, 3]` vào `set.union([1, 2, 3])` lại gây lỗi `TypeError`?**
   *Đáp án:* Vì thông số kỹ thuật ECMAScript 2024 quy định đối số của các phép toán tập hợp phải là một `Set-like object` (sở hữu các thuộc tính `.size`, `.has(key)` và `.keys()`). Array chỉ có `.length` và `.includes()` chứ không có `.size`, `.has()` hay `.keys()` trả về key iterator tương thích, dẫn tới việc Engine kiểm tra thất bại và ném lỗi `TypeError`.

3. **Phép toán `symmetricDifference()` (hiệu đối xứng) có thể biểu diễn qua các phép toán cơ bản nào?**
   *Đáp án:* Hiệu đối xứng $A \triangle B$ tương đương với Hợp trừ đi Giao: $(A \cup B) \setminus (A \cap B)$, hoặc hợp của hai phép hiệu: $(A \setminus B) \cup (B \setminus A)$.
