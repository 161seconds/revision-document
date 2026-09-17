# Vòng Lặp & Điều Khiển Luồng (JavaScript Loops & Control Flow)

Tài liệu ôn tập toàn diện về vòng lặp trong JavaScript: `for`, `while`, `do...while`, phân biệt triệt để `for...in` vs `for...of`, câu lệnh nhãn (Labeled Statements), và cạm bẫy mutate mảng khi đang duyệt.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [07-let-and-block-scope.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/07-let-and-block-scope.md) (Cơ chế Loop Scope Binding của `let`).
  - [14-conditionals-and-logical-branching.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/14-conditionals-and-logical-branching.md) (Điều kiện dừng).
- **Mở rộng tiếp theo (Next Steps):**
  - [03-data-structures/](file:///d:/my-project/revision-document/javascript/03-data-structures/) (Higher-Order Array Methods: `map`, `filter`, `reduce`, `forEach`).
  - Iterator Protocol & Generators (`Symbol.iterator`, `function*`).
- **Khái niệm liên quan (Related):**
  - Prototype Chain enumeration trong `for...in`.
  - Iterables vs Plain Objects.

---

## 2. Bản Chất Hoạt Động (Mental Model: So Sánh Các Cấu Trúc Lặp)

### 1. Phân Biệt `for...in` vs `for...of`
Đây là một trong những điểm nhầm lẫn lớn nhất của lập trình viên JavaScript:

| Tiêu chí | `for...in` | `for...of` (ES6) |
| :--- | :--- | :--- |
| **Mục đích** | Duyệt qua tất cả **Key / Thuộc tính** có cờ `enumerable` | Duyệt qua các **Giá trị (Values)** của đối tượng Iterable |
| **Đối tượng áp dụng** | **Object** (Plain Objects) | **Iterable** (Array, String, Map, Set, NodeList) |
| **Nguy cơ tiềm ẩn** | Duyệt xuyên qua cả **Prototype Chain**; thứ tự không đảm bảo | Không áp dụng trực tiếp cho Plain Object (vì thiếu `Symbol.iterator`) |
| **Kiểu của biến lặp** | Luôn là kiểu `string` (dù duyệt mảng số) | Kiểu dữ liệu thực tế của từng phần tử |

```javascript
const arr = [10, 20];
arr.customProp = "hello";

// for...in in ra: "0", "1", "customProp" (BẪY!)
for (const key in arr) {
  console.log(key, typeof key); // key là string
}

// for...of in ra: 10, 20 (Chuẩn mực và an toàn cho mảng!)
for (const val of arr) {
  console.log(val);
}
```

### 2. Vòng Lặp `while` vs `do...while`
- `while (cond)`: Kiểm tra điều kiện **trước**. Nếu sai ngay từ đầu, thân vòng lặp không chạy lần nào.
- `do { ... } while (cond)`: Chạy thân vòng lặp trước, kiểm tra điều kiện **sau**. **Luôn luôn chạy tối thiểu 1 lần**.

### 3. Câu Lệnh Nhãn (Labeled Statements)
Khi cần thoát (`break`) hoặc bỏ qua bước lặp (`continue`) của một **vòng lặp cha bên ngoài** từ bên trong vòng lặp lồng nhau, dùng nhãn (label) thay vì biến cờ hiệu:
```javascript
outerLoop: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) {
      break outerLoop; // Thoát hẳn cả outerLoop!
    }
  }
}
```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Dùng `for...in` để duyệt mảng
- `for...in` duyệt qua cả các thuộc tính tự gán thêm hoặc thuộc tính trong `Array.prototype`. Thứ tự duyệt mảng không được đặc tả cam kết theo chỉ số `0, 1, 2...`.
- ➔ **Quy tắc vàng:** Dùng `for`, `for...of`, hoặc array methods (`forEach`, `map`) cho mảng; chỉ dùng `for...in` cho Plain Object (hoặc tốt hơn: `Object.keys()`, `Object.entries()`).

### 2. Thay đổi độ dài mảng khi đang duyệt (Mutating Array During Iteration)
```javascript
const nums = [1, 2, 3, 4, 5];
for (let i = 0; i < nums.length; i++) {
  if (nums[i] === 2) {
    nums.splice(i, 1); // Xóa phần tử số 2 => Mảng bị co lại, phần tử số 3 bị nhảy qua!
  }
}
// nums trở thành [1, 3, 4, 5] nhưng i nhảy cóc!
// Giải pháp: Duyệt ngược từ cuối mảng về đầu (i = nums.length - 1; i >= 0; i--) hoặc dùng filter.
```

### 3. Vòng lặp vô tận (Infinite Loop) do biến đếm số thực (Float Step)
- Do sai số IEEE 754, `i += 0.1` có thể không bao giờ đạt giá trị đẳng thức tuyệt đối `i === 1.0`! Luôn dùng so sánh `<=` hoặc `>=` thay vì `!==`.

---

## 4. File Code Thực Hành

- [15-loops-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/15-loops-demo.js): Code thực nghiệm `for...in` vs `for...of`, cạm bẫy prototype enumeration, labeled break, và kỹ thuật duyệt ngược mảng khi splice. Chạy bằng: `node 15-loops-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao không thể dùng `for...of` trực tiếp trên một Plain Object `{ a: 1, b: 2 }`? Làm sao để duyệt?**
   *Đáp án:* Vì Plain Object không triển khai giao thức Iterable (`[Symbol.iterator]` là `undefined`). Để duyệt object bằng `for...of`, cần dùng các hàm cầu nối: `for (const [key, val] of Object.entries(obj))`.
2. **Làm thế nào để thoát khỏi 2 vòng lặp lồng nhau ngay lập tức khi thỏa mãn điều kiện ở vòng lặp trong?**
   *Đáp án:* Đặt nhãn (label) trước vòng lặp ngoài (ví dụ: `outer: for (...)`) và gọi lệnh `break outer;` từ bên trong.
