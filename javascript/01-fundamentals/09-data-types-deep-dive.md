# 8 Kiểu Dữ Liệu Trong JavaScript & Cạm Bẫy Typeof (JavaScript Data Types Deep Dive)

Tài liệu ôn tập chuyên sâu về 7 kiểu nguyên thủy (Primitive) và 1 kiểu tham chiếu (Reference), cơ chế Dynamic Typing, và các trường hợp dị biệt của toán tử `typeof`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):** [08-const-and-immutability.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/08-const-and-immutability.md) (Lưu trữ Call Stack vs Heap).
- **Mở rộng tiếp theo (Next Steps):** [02-data-types.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/02-data-types.js) và bài học Ép kiểu ngầm (Type Coercion).
- **Khái niệm liên quan (Related):**
  - Tiêu chuẩn biểu diễn số thực dấu phẩy động IEEE 754.
  - [TypeScript: Type System](file:///d:/my-project/revision-document/typescript/) (Chuyển đổi từ dynamic sang static typing).

---

## 2. Bản Chất Hoạt Động (Mental Model: 8 Kiểu Dữ Liệu)

JavaScript là ngôn ngữ có **kiểu động (Dynamically Typed)**: Kiểu dữ liệu gắn liền với giá trị (Value) chứ không gắn liền với tên biến.

### 1. Bảy Kiểu Nguyên Thủy (7 Primitive Types - Bất biến & Pass-by-value)
1. `string`: Chuỗi ký tự UTF-16 (VD: `"hello"`, `'world'`).
2. `number`: Số thực 64-bit theo chuẩn IEEE 754 (bao gồm cả số nguyên và số thập phân).
3. `bigint`: Số nguyên có độ dài tùy ý vượt giới hạn `2^53 - 1` (VD: `9007199254740991n`).
4. `boolean`: Chỉ có 2 giá trị: `true` hoặc `false`.
5. `undefined`: Biến đã được khai báo nhưng chưa được gán bất kỳ giá trị nào.
6. `null`: Giá trị biểu thị sự cố ý vắng mặt của đối tượng ("Rỗng / Không trỏ tới đâu").
7. `symbol`: Giá trị định danh độc nhất vô nhị (Unique & Immutable), thường dùng làm khóa ẩn cho Object.

### 2. Một Kiểu Tham Chiếu (1 Reference Type - Khả biến & Pass-by-reference)
8. `Object`: Mọi cấu trúc dữ liệu phức tạp khác trong JavaScript đều kế thừa từ Object (Plain Object, Array, Date, Function, RegExp, Map, Set).

---

## 3. Bẫy & Dị Biệt Kinh Điển Của `typeof` (Common Pitfalls)

| Biểu thức | Kết quả trả về | Ghi chú / Cạm bẫy |
| :--- | :--- | :--- |
| `typeof "text"` | `"string"` | Bình thường |
| `typeof 42` | `"number"` | Bình thường |
| `typeof NaN` | `"number"` | `NaN` (Not a Number) vẫn thuộc kiểu `number`! |
| `typeof 10n` | `"bigint"` | Bình thường |
| `typeof true` | `"boolean"` | Bình thường |
| `typeof undefined` | `"undefined"` | Bình thường |
| `typeof null` | **`"object"`** | **LỖI LỊCH SỬ:** Lỗi nhãn nhị phân `000` từ năm 1995. |
| `typeof [1, 2]` | **`"object"`** | Array là Object. Phải dùng `Array.isArray()` để check. |
| `typeof function(){}`| `"function"` | Function là "Callable Object", được ưu tiên trả về function. |

### Các Lỗi Phỏng Vấn Kinh Điển:

1. **Sai số dấu phẩy động IEEE 754:**
   ```javascript
   0.1 + 0.2 === 0.3 // false! (Thực tế bằng 0.30000000000000004)
   // Cách giải quyết: Number.EPSILON hoặc làm tròn (0.1 + 0.2).toFixed(2)
   ```

2. **So sánh `null` và `undefined`:**
   ```javascript
   null == undefined  // true (Ép kiểu loose equality coi cả 2 là "không có giá trị")
   null === undefined // false (Strict equality phân biệt 2 kiểu dữ liệu khác nhau)
   ```

3. **Cách phân loại kiểu dữ liệu chính xác 100% trong JavaScript:**
   Thay vì dùng `typeof`, các thư viện chuyên nghiệp dùng hàm chuẩn của Object:
   ```javascript
   Object.prototype.toString.call(val);
   // [object Array], [object Null], [object Date], [object Object]
   ```

---

## 4. File Code Thực Hành

- [09-data-types-anomalies-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/09-data-types-anomalies-demo.js): Kiểm nghiệm toàn bộ 8 kiểu dữ liệu, các dị biệt của `typeof`, sai số `0.1 + 0.2` và hàm xác định kiểu chính xác 100%. Chạy bằng: `node 09-data-types-anomalies-demo.js`.
- [02-data-types.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/02-data-types.js): Phân biệt Primitive vs Reference và Deep Clone.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **`typeof NaN` trả về kiểu dữ liệu gì? Làm sao để kiểm tra một giá trị có phải là `NaN` hay không?**
   *Đáp án:* Trả về `"number"`. Vì `NaN === NaN` là `false`, cách duy nhất để kiểm tra chính xác là dùng `Number.isNaN(val)`.
2. **Làm thế nào để phân biệt một biến là `null` hay `undefined`?**
   *Đáp án:* Dùng so sánh nghiêm ngặt: `val === null` và `val === undefined`.
