# Chuỗi, Template Literals & Phương Thức Xử Lý (JavaScript Strings & Methods)

Tài liệu ôn tập toàn diện về chuỗi trong JavaScript: Tính bất biến (Immutability), mã hóa UTF-16 và bẫy Emoji surrogate pairs, phân biệt `slice` vs `substring`, tìm kiếm nâng cao, và cơ chế Tagged Template Literals (nền tảng của styled-components/SQL sanitization).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [09-data-types-deep-dive.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/09-data-types-deep-dive.md) (Kiểu dữ liệu nguyên thủy Primitive).
  - [13-comparisons-and-equality.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/13-comparisons-and-equality.md) (So sánh từ điển Unicode).
- **Mở rộng tiếp theo (Next Steps):**
  - Regular Expressions (RegExp) & Đối tượng `Intl` (Quốc tế hóa chuỗi, đối chiếu ngôn ngữ `localeCompare`).
- **Khái niệm liên quan (Related):**
  - UTF-16 Code Units & Code Points.
  - Tagged Template Functions.

---

## 2. Bản Chất Hoạt Động (Mental Model: Tính Bất Biến & UTF-16)

### 1. Tính Bất Biến Tuyệt Đối Của String (Primitive Immutability)
Trong JavaScript, chuỗi là **Primitive Value**. Một khi chuỗi đã được tạo ra trong bộ nhớ:
- Không thể thay đổi từng ký tự: `str[0] = "X"` sẽ bị bỏ qua trong non-strict mode hoặc ném lỗi trong strict mode.
- Mọi phương thức thao tác chuỗi (`toUpperCase`, `trim`, `slice`, `replace`) **luôn trả về một chuỗi mới**, không bao giờ làm thay đổi chuỗi gốc.

### 2. Mã Hóa UTF-16 & Cạm Bẫy Emoji (Surrogate Pairs)
JavaScript lưu trữ chuỗi theo các đơn vị mã 16-bit (UTF-16 Code Units):
- Các ký tự thông thường nằm trong mặt phẳng đa ngôn ngữ cơ bản (BMP) chiếm 1 code unit (16-bit) ➔ `length = 1`.
- Các Emoji hoặc ký tự cổ/hiếm nằm ngoài BMP phải dùng **cặp đại diện (Surrogate Pair)** gồm 2 code unit 16-bit ghép lại:
  ```javascript
  const emoji = "🚀";
  console.log(emoji.length); // 2! (Không phải 1)
  console.log(emoji[0]);      // Ký tự rác không đọc được (High Surrogate)
  
  // Cách đếm độ dài thực tế của ký tự: Dùng Spread Operator hoặc Array.from
  console.log([...emoji].length); // 1 (Đúng số lượng ký tự trực quan)
  ```

### 3. Phân Biệt Các Phương Thức Cắt Chuỗi
- **`slice(start, end)` (Khuyên Dùng):**
  - Hỗ trợ chỉ số âm: `str.slice(-3)` lấy 3 ký tự cuối cùng.
  - Nếu `start > end`, trả về chuỗi rỗng `""`.
- **`substring(start, end)`:**
  - Không hỗ trợ chỉ số âm (coi số âm là `0`).
  - Nếu `start > end`, nó **tự động đảo ngược** hai tham số (`substring(5, 2)` biến thành `substring(2, 5)`).
- **`substr(start, length)`:** Đã bị **Deprecated (Khai tử)**, không dùng trong code hiện đại.
- **`str.at(index)` (ES2022):** Lấy 1 ký tự, hỗ trợ chỉ số âm (`str.at(-1)` lấy ký tự cuối cùng).

### 4. Tagged Template Literals (Gắn Thẻ Mẫu Chuỗi)
Tagged Template cho phép phân tích cú pháp template literal bằng một hàm:
```javascript
function highlight(strings, ...values) {
  // strings: mảng các chuỗi tĩnh
  // values: các giá trị được nội suy từ ${...}
  return strings.reduce((acc, str, i) => `${acc}${str}<strong>${values[i] || ""}</strong>`, "");
}
const user = "Alice";
highlight`Xin chào ${user}!`; // "Xin chào <strong>Alice</strong>!"
```
> [!NOTE]
> Đây chính là cơ chế đứng sau các thư viện nổi tiếng như `styled.div\`...\`` của `styled-components`, `sql\`SELECT * FROM users WHERE id = ${id}\`` (tự động escape chống SQL Injection), và `html\`...\`` trong Lit.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

1. **Bẫy `replace()` chỉ thay thế lần xuất hiện đầu tiên:**
   ```javascript
   const text = "127.0.0.1";
   text.replace(".", "-");    // "127-0.0.1" (Chỉ thay dấu chấm đầu tiên!)
   // Cách đúng: Dùng replaceAll() (ES2021) hoặc RegExp với cờ g:
   text.replaceAll(".", "-"); // "127-0-0-1"
   ```

2. **Bẫy `trim()` không xóa ký tự khoảng trắng không ngắt (Non-breaking space `&nbsp;`):**
   - Các khoảng trắng đặc biệt có thể lọt qua bộ lọc nếu không dùng RegExp Unicode.

3. **Cắt ngang cặp đại diện Emoji (Surrogate Pair Splitting):**
   - Nếu dùng `slice(0, 1)` trên chuỗi `"🎉 Chúc mừng"`, kết quả sẽ là một nửa surrogate rác `\uD83C` gây lỗi hiển thị màn hình.

---

## 4. File Code Thực Hành

- [16-strings-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/16-strings-demo.js): Code thực nghiệm tính bất biến, surrogate pair emoji, `slice` vs `substring`, `replaceAll`, và Tagged Template chống XSS Sanitizer. Chạy bằng: `node 16-strings-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao `"😂".length` lại bằng `2` và làm sao để lấy chính xác số lượng ký tự của một chuỗi chứa Emoji?**
   *Đáp án:* Vì Emoji nằm ngoài dải BMP nên được mã hóa bằng 2 Code Units 16-bit (Surrogate Pair) trong UTF-16. Để đếm chính xác số glyph/code point, dùng iterator: `[..."😂"].length` hoặc `Array.from("😂").length`.
2. **Cơ chế Tagged Template Literal hoạt động như thế nào và ứng dụng phổ biến nhất của nó là gì?**
   *Đáp án:* Tagged Template truyền chuỗi tĩnh dưới dạng mảng tham số đầu tiên `strings` và các giá trị `${...}` dưới dạng rest parameters `...values` vào một hàm xử lý. Ứng dụng phổ biến: Ngăn chặn SQL Injection trong ORM/Database client, chống XSS trong template engine, và CSS-in-JS (`styled-components`).
