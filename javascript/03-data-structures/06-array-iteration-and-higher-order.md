# Phương Thức Lặp Mảng & Lập Trình Hàm (JavaScript Array Iteration & Higher-Order Methods)

Tài liệu ôn tập toàn diện về các phương thức lặp mảng nâng cao: `forEach`, `map`, `flatMap`, `filter`, `reduce`/`reduceRight`, `every`/`some`, phương thức bất biến `with()` (ES2023), cạm bẫy Async trong `forEach`, và định lý chân lý rỗng (Vacuous Truth).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [03-array-methods-mutating-vs-immutable.md](file:///d:/my-project/revision-document/javascript/03-data-structures/03-array-methods-mutating-vs-immutable.md) (Phương thức biến đổi vs bất biến).
  - [02-functions-and-scope/01-function-declarations-vs-expressions.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/01-function-declarations-vs-expressions.md) (Higher-Order Functions & Callbacks).
- **Mở rộng tiếp theo (Next Steps):**
  - [04-async-javascript/](file:///d:/my-project/revision-document/javascript/04-async-javascript/) (Xử lý bất đồng bộ mảng với `Promise.all()` / `Promise.allSettled()`).
  - Giao thức Lặp Iterator & Generator Functions (`Symbol.iterator`).
- **Khái niệm liên quan (Related):**
  - Vacuous Truth (Chân lý rỗng trong toán học).
  - Single-Pass Transformation với `flatMap` & `reduce`.

---

## 2. Bản Chất Hoạt Động (Mental Model: Duyệt & Biến Đổi Dữ Liệu)

### 1. Bảng So Sánh Các Phương Thức Lặp Mảng
| Phương thức | Chuẩn | Mục đích | Đầu ra | Short-circuit (Dừng sớm) |
| :--- | :--- | :--- | :--- | :--- |
| **`forEach`** | ES5 | Tác vụ phụ (Side Effects) | `undefined` | **KHÔNG** (Luôn chạy hết) |
| **`map`** | ES5 | Biến đổi 1-sang-1 | Mảng mới cùng độ dài | Không |
| **`filter`** | ES5 | Lọc phần tử theo điều kiện | Mảng mới chứa phần tử thỏa mãn | Không |
| **`flatMap`** | ES2019 | Ánh xạ rồi làm phẳng 1 cấp | Mảng mới (Có thể tăng/giảm kích thước) | Không |
| **`reduce`** | ES5 | Tích lũy về 1 giá trị duy nhất | Bất kỳ kiểu dữ liệu nào (Object, Number, Array...) | Không |
| **`reduceRight`**| ES5 | Tích lũy từ phải sang trái | Bất kỳ kiểu dữ liệu nào | Không |
| **`some`** | ES5 | Kiểm tra **có ít nhất 1** phần tử thỏa | `boolean` | **CÓ** (Dừng khi gặp true) |
| **`every`** | ES5 | Kiểm tra **tất cả** phần tử đều thỏa | `boolean` | **CÓ** (Dừng khi gặp false) |
| **`with`** | **ES2023** | Gán giá trị mới tại index bất biến | Mảng mới đã thay thế | Không |

### 2. Bản Chất `reduce()` & Cạm Bẫy Thiếu `initialValue`
- Cú pháp: `arr.reduce(callback, initialValue)`
- **Nếu có `initialValue`:** `accumulator` bắt đầu bằng `initialValue`, vòng lặp bắt đầu từ `index = 0`.
- **Nếu KHÔNG có `initialValue`:** `accumulator` lấy luôn phần tử đầu tiên `arr[0]`, vòng lặp bắt đầu từ `index = 1`.
> [!CAUTION]
> Nếu gọi `.reduce()` trên một **mảng rỗng `[]` mà không truyền `initialValue`**, JavaScript sẽ ngay lập tức ném lỗi chết chương trình:
> `TypeError: Reduce of empty array with no initial value`.
> ➔ **Quy tắc vàng:** Luôn luôn truyền `initialValue` cho `reduce()`.

### 3. Năng Lực Của `flatMap()`: Filter & Map Trong 1 Lần Duyệt
Thay vì gọi `.filter().map()` tạo ra 2 lần duyệt và 1 mảng trung gian tốn bộ nhớ, `flatMap` thực hiện cả hai thao tác trong 1 pass:
```javascript
// Bài toán: Nhân đôi các số chẵn, loại bỏ các số lẻ:
const numbers = [1, 2, 3, 4, 5, 6];

// Cách truyền thống (Tạo 2 mảng):
numbers.filter(x => x % 2 === 0).map(x => x * 2);

// Tối ưu bằng flatMap (1 lần duyệt duy nhất):
numbers.flatMap(x => x % 2 === 0 ? [x * 2] : []); // [4, 8, 12]
```

### 4. Định Lý Chân Lý Rỗng (Vacuous Truth) Của `[].every()`
Một trong những câu hỏi phỏng vấn hóc búa nhất:
```javascript
[].every(x => x > 100); // TRUE!
[].some(x => x > 100);  // FALSE!
```
- **Giải thích:** Trong toán học logic mệnh đề, một phát biểu "mọi phần tử trong tập rỗng đều thỏa mãn tính chất P" luôn được coi là **Đúng theo chân lý rỗng (Vacuously True)** vì không tồn tại bất kỳ phần tử nào phản bác lại điều đó.
- Ngược lại, `some` đòi hỏi phải tìm thấy ít nhất 1 phần tử thực tế, nên trên mảng rỗng nó luôn là `false`.

### 5. Cập Nhật Mảng Bất Biến Với `arr.with(index, value)` (ES2023)
```javascript
const original = ["A", "B", "C"];
const updated = original.with(1, "X"); // ["A", "X", "C"]
// original vẫn là ["A", "B", "C"] (An toàn tuyệt đối cho React/Redux)
```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Dùng hàm Async bên trong `forEach`
```javascript
// SAI HOÀN TOÀN:
const urls = ["/api/1", "/api/2"];
urls.forEach(async (url) => {
  await fetch(url); // forEach KHÔNG ĐỢI Promise! Nó chạy lướt qua ngay lập tức!
});
console.log("Xong!"); // Chạy trước khi các request fetch hoàn tất!

// ĐÚNG: Dùng for...of cho tuần tự hoặc Promise.all(map) cho song song:
await Promise.all(urls.map(url => fetch(url)));
```

### 2. Cố gắng dừng `forEach` bằng `break` hoặc `return`
- Từ khóa `break` hoặc `continue` đặt trong `forEach` sẽ gây lỗi cú pháp `SyntaxError: Illegal break statement`.
- Lệnh `return` trong callback chỉ tương đương với `continue` (bỏ qua phần còn lại của bước hiện tại, chứ không dừng cả vòng lặp!).
- ➔ **Giải pháp:** Muốn dừng sớm, hãy dùng `for...of`, hoặc dùng `some()` / `every()`.

---

## 4. File Code Thực Hành

- [06-array-iteration-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/06-array-iteration-demo.js): Code thực nghiệm `reduce` TypeError trên mảng rỗng, cạm bẫy Async forEach, tối ưu filter+map bằng `flatMap`, chân lý rỗng `every()`, và `arr.with()` (ES2023). Chạy bằng: `node 06-array-iteration-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao biểu thức `[].every(x => false)` lại trả về `true` trong JavaScript?**
   *Đáp án:* Theo định lý Chân lý rỗng (Vacuous Truth) trong logic toán học, điều kiện kiểm tra cho mọi phần tử trong tập hợp rỗng luôn luôn đúng vì không có bất kỳ phần tử nào vi phạm điều kiện đó.
2. **Khi nào thì phương thức `flatMap()` vượt trội hơn việc nối chuỗi `.filter().map()`?**
   *Đáp án:* Khi xử lý các mảng dữ liệu lớn, việc xâu chuỗi `.filter().map()` phải duyệt mảng 2 lần và cấp phát 1 mảng trung gian trên Heap. `flatMap()` thực hiện cả việc lọc (bằng cách trả về `[]`) và ánh xạ trong một lần duyệt duy nhất ($O(n)$ 1-pass), tiết kiệm bộ nhớ và chu kỳ CPU.
