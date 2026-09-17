# Phương Thức Mảng: Biến Đổi vs Bất Biến (JavaScript Array Methods: Mutating vs Immutable)

Tài liệu ôn tập toàn diện về các phương thức mảng cơ bản: Phân loại triệt để In-place Mutating vs Pure Immutable, độ phức tạp thuật toán $O(1)$ vs $O(n)$ dưới tầng V8, cặp đối ngẫu `splice()` vs `toSpliced()` (ES2023), và cạm bẫy giá trị trả về của `push`/`unshift`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-arrays-fundamentals.md](file:///d:/my-project/revision-document/javascript/03-data-structures/01-arrays-fundamentals.md) (Bản chất mảng & V8 Elements).
  - [01-fundamentals/08-const-and-immutability.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/08-const-and-immutability.md) (Tính bất biến của dữ liệu).
- **Mở rộng tiếp theo (Next Steps):**
  - [04-array-iteration-and-higher-order.md](file:///d:/my-project/revision-document/javascript/03-data-structures/04-array-iteration-and-higher-order.md) (`map`, `filter`, `reduce`, `flatMap`).
  - Quản lý trạng thái bất biến trong React / Redux / Zustand (`Immer.js`).
- **Khái niệm liên quan (Related):**
  - Big-O Complexity ($O(1)$ vs $O(n)$).
  - ECMAScript 2023 Change Array by Copy specification.

---

## 2. Bản Chất Hoạt Động (Mental Model: Phân Loại & Hiệu Năng V8)

### 1. Bảng Phân Loại: Mutating (Thay đổi mảng gốc) vs Immutable (Tạo mảng mới)
| Phương thức | Phân loại | Giá trị trả về | Tác động mảng gốc |
| :--- | :--- | :--- | :--- |
| `push(...items)` | Mutating | **Độ dài mới (`length`)** | Thêm phần tử vào cuối |
| `pop()` | Mutating | **Phần tử bị xóa** (hoặc `undefined`) | Xóa phần tử cuối |
| `unshift(...items)` | Mutating | **Độ dài mới (`length`)** | Thêm phần tử vào đầu |
| `shift()` | Mutating | **Phần tử bị xóa** (hoặc `undefined`) | Xóa phần tử đầu |
| `splice(start, del, ...ins)` | Mutating | **Mảng các phần tử bị xóa** | Thêm/sửa/xóa trực tiếp |
| `toSpliced(...)` (ES2023) | **Immutable** | **Mảng mới đã sửa đổi** | **Không đổi** |
| `slice(start, end)` | **Immutable** | **Mảng con mới (Shallow Copy)** | **Không đổi** |
| `concat(...arrays)` | **Immutable** | **Mảng mới hợp nhất** | **Không đổi** |
| `flat(depth)` | **Immutable** | **Mảng mới đã làm phẳng** | **Không đổi** |
| `join(separator)` | **Immutable** | **Chuỗi ký tự (`string`)** | **Không đổi** |

### 2. Độ Phức Tạp Thuật Toán Dưới Tầng Động Cơ ($O(1)$ vs $O(n)$)
- **`push()` / `pop()` là $O(1)$ Amortized:**
  - V8 cấp phát bộ nhớ dự phòng ở đuôi vector. Thao tác ở đuôi không ảnh hưởng đến vị trí chỉ số của các phần tử phía trước ➔ **Cực nhanh**.
- **`shift()` / `unshift()` là $O(n)$ Tuyến Tính:**
  - Khi xóa hoặc thêm phần tử ở đầu mảng, V8 buộc phải **dịch chuyển địa chỉ của toàn bộ $n$ phần tử còn lại trong bộ nhớ** và đánh số lại toàn bộ chỉ số (`index 1 -> 0, index 2 -> 1...`).
  - ➔ **Quy tắc hiệu năng:** Tránh dùng `shift()` trong các vòng lặp lớn hoặc khi xây dựng Queue hàng triệu phần tử (hãy dùng Ring Buffer hoặc Con trỏ hai đầu).

### 3. Cặp Đối Ngẫu `splice()` vs `toSpliced()` (ES2023)
- `splice()` (có từ ES3): Làm thay đổi mảng gốc và trả về những gì bị xóa (gây lỗi mất tính bất biến trong React State).
- `toSpliced()` (chuẩn ES2023): Giữ nguyên mảng gốc, trả về bản sao mảng mới đã được áp dụng thay đổi.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy nhầm lẫn giá trị trả về của `push()` và `unshift()`
```javascript
const items = [1, 2, 3];
const nextItems = items.push(4); // BẪY!
console.log(nextItems); // 4 (Đây là new length, KHÔNG PHẢI MẢNG [1, 2, 3, 4]!)
```

### 2. Mutate trực tiếp trong React State / Functional Programming
```javascript
// SAI - React sẽ KHÔNG re-render vì tham chiếu mảng không đổi:
setList(prevList => {
  prevList.push(newItem);
  return prevList;
});

// ĐÚNG - Luôn tạo mảng mới bằng Spread Operator hoặc toSpliced:
setList(prevList => [...prevList, newItem]);
```

### 3. Bẫy `flat()` chỉ làm phẳng 1 cấp theo mặc định
```javascript
const deep = [1, [2, [3, [4]]]];
deep.flat(); // [1, 2, [3, [4]]] (Chỉ làm phẳng cấp 1!)

// Để làm phẳng triệt để mọi cấp độ lồng nhau:
deep.flat(Infinity); // [1, 2, 3, 4]
```
> [!TIP]
> Phương thức `flat()` tự động loại bỏ các lỗ rỗng (Empty Slots / Holes) trong mảng thưa!

---

## 4. File Code Thực Hành

- [03-array-methods-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/03-array-methods-demo.js): Code thực nghiệm giá trị trả về của `push/pop/shift/unshift`, so sánh `splice` vs `toSpliced`, độ sâu `flat(Infinity)`, và dọn lỗ rỗng bằng `flat()`. Chạy bằng: `node 03-array-methods-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Phương thức `arr.push(x)` và `arr.splice(...)` trả về kết quả gì?**
   *Đáp án:* `arr.push(x)` trả về độ dài mới của mảng (`number`). `arr.splice(...)` trả về mảng chứa các phần tử đã bị xóa (`Array`). Cả hai đều làm thay đổi mảng gốc.
2. **Tại sao phương thức `shift()` lại chậm hơn rất nhiều so với `pop()` trên các mảng có kích thước lớn?**
   *Đáp án:* Vì `pop()` chỉ xóa phần tử cuối cùng ở độ phức tạp $O(1)$ mà không ảnh hưởng tới các phần tử khác. Trong khi `shift()` xóa phần tử đầu tiên, buộc động cơ JavaScript phải dịch chuyển toàn bộ $n - 1$ phần tử phía sau về trước 1 vị trí chỉ số ở độ phức tạp $O(n)$.
