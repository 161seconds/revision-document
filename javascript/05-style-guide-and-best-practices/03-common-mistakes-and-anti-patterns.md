# Sai Lầm Thường Gặp & Các Phản Mẫu (JavaScript Common Mistakes & Anti-Patterns)

Tài liệu chuyên sâu phân tích những sai lầm kinh điển trong lập trình JavaScript: Độ chính xác số thực dấu phẩy động IEEE 754 (`0.1 + 0.2 !== 0.3`), cạm bẫy gán chỉ mục chuỗi cho Mảng (`arr["name"] = ...`), sự khác biệt bản chất giữa `null` và `undefined`, và các phản mẫu (Anti-patterns) tàn phá logic ứng dụng.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-fundamentals/17-numbers-and-bignum.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/17-numbers-and-bignum.md) (Số thực IEEE 754 và Number.EPSILON).
  - [03-data-structures/01-arrays-fundamentals.md](file:///d:/my-project/revision-document/javascript/03-data-structures/01-arrays-fundamentals.md) (Cơ chế chỉ mục số của mảng).
- **Mở rộng tiếp theo (Next Steps):**
  - [04-performance-optimization-and-v8.md](file:///d:/my-project/revision-document/javascript/05-style-guide-and-best-practices/04-performance-optimization-and-v8.md) (Tối ưu hóa hiệu năng V8).
  - Áp dụng các quy tắc kiểm tra tĩnh ESLint để phòng ngừa tự động.
- **Khái niệm liên quan (Related):**
  - Chuẩn IEEE 754 Double Precision Floating-Point.
  - V8 Dictionary Mode vs Fast Elements.
  - Type Coercion Matrix.

---

## 2. Bản Chất Hoạt Động (Mental Model: Giải Mã 5 Sai Lầm Kinh Điển)

### 1. Bản Chất Số Thực: `0.1 + 0.2 !== 0.3`
JavaScript biểu diễn tất cả số bằng định dạng nhị phân 64-bit dấu phẩy động (Double Precision IEEE 754):
- Trong hệ thập phân, các phân số như $1/3$ là số tuần hoàn vô hạn ($0.3333...$).
- Trong hệ nhị phân (Binary), các số thập phân như $0.1$ ($1/10$) và $0.2$ ($1/5$) **không thể biểu diễn chính xác tuyệt đối** mà là chuỗi nhị phân tuần hoàn vô hạn!
- Kết quả thực tế:
  ```javascript
  0.1 + 0.2; // 0.30000000000000004
  0.1 + 0.2 === 0.3; // FALSE!
  ```
➔ **Giải pháp chuẩn:** Sử dụng hằng số sai số cực tiểu **`Number.EPSILON`**:
```javascript
function areFloatsEqual(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}
console.log(areFloatsEqual(0.1 + 0.2, 0.3)); // true!
```

---

### 2. Cạm Bẫy Mảng Dùng Chỉ Mục Đặt Tên (Named Indexes in Arrays)
Nhiều lập trình viên chuyển từ ngôn ngữ khác (như PHP với Associative Arrays) cố tình gán chuỗi vào mảng JavaScript:
```javascript
const person = [];
person["firstName"] = "Nam";
person["lastName"] = "Nguyen";

console.log(person.length); // BẪY: 0! (length KHÔNG HỀ TĂNG!)
console.log(Array.isArray(person)); // true, nhưng đã bị thoái hóa thành Dictionary Object!
```
- **Hậu quả trong V8 Engine:** Thao tác này biến mảng từ cấu trúc mảng tuyến tính nhanh (`PACKED_ELEMENTS`) thành bảng băm chậm chạp (`DICTIONARY_ELEMENTS`). Toàn bộ các phương thức mảng (`map`, `filter`, `forEach`) **sẽ hoàn toàn bỏ qua các thuộc tính này**!
- ➔ **Quy tắc:** Mảng CHỈ dùng cho chỉ mục số (`0, 1, 2...`). Muốn lưu cặp Khóa - Giá trị, **bắt buộc dùng Object `{}` hoặc `Map`**!

---

### 3. Phân Biệt Bản Chất: `null` vs `undefined`

| Tiêu chí | `undefined` | `null` |
| :--- | :--- | :--- |
| **Ý nghĩa** | Biến đã khai báo nhưng **chưa được gán giá trị** | Đại diện cho **sự vắng mặt có chủ đích** của đối tượng |
| **Nguồn gốc** | Do JavaScript Engine tự động sinh ra | Do người lập trình viên chủ động gán |
| **`typeof`** | `"undefined"` | **`"object"`** (Bug lịch sử từ JS 1995) |
| **Khi ép kiểu số** | `Number(undefined)` là **`NaN`** | `Number(null)` là **`0`** |
| **So sánh lỏng (`==`)** | `undefined == null` là **`true`** | `undefined == null` là **`true`** |
| **So sánh chặt (`===`)** | `undefined === null` là **`false`** | `undefined === null` là **`false`** |

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy toán tử cộng chuỗi `+` vs toán tử trừ `-`
```javascript
console.log(10 + "5"); // "105" (Ép kiểu thành chuỗi và ghép chuỗi!)
console.log(10 - "5"); // 5 (Toán tử trừ bắt buộc ép kiểu thành số!)
console.log(10 * "5"); // 50
```

### 2. Bẫy so sánh boolean với chuỗi `"false"`
```javascript
// Cạm bẫy: false == "false" trả về FALSE!
// Vì: false -> 0; "false" -> NaN; 0 == NaN là false!
console.log(false == "false"); // false!
```

---

## 4. File Code Thực Hành

- [03-common-mistakes-demo.js](file:///d:/my-project/revision-document/javascript/05-style-guide-and-best-practices/03-common-mistakes-demo.js): Code thực nghiệm sai số số thực `0.1 + 0.2`, so sánh an toàn bằng `Number.EPSILON`, cạm bẫy gán Named Index cho Array, và so khớp phân biệt `null` vs `undefined`. Chạy bằng: `node 03-common-mistakes-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao `typeof null` lại trả về `"object"` trong khi nó là kiểu dữ liệu nguyên thủy?**
   *Đáp án:* Đây là một bug thiết kế nổi tiếng từ phiên bản đầu tiên của JavaScript (1995). Trong bộ mã gốc, các giá trị được lưu trữ với một nhãn kiểu (type tag) nhị phân. Đối tượng (Object) có nhãn kiểu là `000`. Do `null` được biểu diễn bằng con trỏ rỗng (`0x00`), V8 đọc nhãn kiểu là `000` và trả về nhầm `"object"`. Lỗi này không thể sửa vì sẽ phá vỡ tính tương thích ngược của hàng triệu trang web trên toàn cầu.

2. **Cách an toàn nhất để so sánh hai số thực dấu phẩy động trong JavaScript là gì?**
   *Đáp án:* Kiểm tra xem khoảng cách tuyệt đối giữa hai số có nhỏ hơn sai số máy `Number.EPSILON` hay không: `Math.abs(a - b) < Number.EPSILON`.
