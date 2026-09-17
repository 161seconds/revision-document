# Thứ Tự Ưu Tiên & Chiều Kết Hợp Của Toán Tử (Operator Precedence & Associativity)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [03-operators-and-expressions.md](file:///d:/my-project/revision-document/javascript/08-language-reference/03-operators-and-expressions.md) (Toàn cảnh hệ thống toán tử).
  - [01-statements-and-declarations.md](file:///d:/my-project/revision-document/javascript/08-language-reference/01-statements-and-declarations.md) (Quy tắc cú pháp & Expressions).
- **Khái niệm tương quan**:
  - **Abstract Syntax Tree (AST) Parsing**: Mức độ ưu tiên quyết định cấu trúc nhánh cây của AST trong giai đoạn biên dịch. Toán tử có độ ưu tiên cao hơn sẽ nằm sâu hơn ở các nút lá của cây cú pháp.
  - **Evaluation Order vs Grouping Precedence**: Độ ưu tiên chỉ quyết định **cách gom nhóm (grouping)** các toán tử, không làm thay đổi nguyên tắc cơ bản là **các biểu thức con luôn được nạp và tính toán tuần tự từ trái sang phải**.
- **Điểm đến tiếp theo**:
  - [09-es-next-and-advanced-concepts/](file:///d:/my-project/revision-document/javascript/) (Các tính năng JavaScript nâng cao & ES Next).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Bảng Tra Cứu 18 Cấp Độ Ưu Tiên Chuẩn ECMAScript (Master Precedence Table)

| Mức (Level) | Loại toán tử (Operator Group) | Ký hiệu | Chiều kết hợp (Associativity) |
| :---: | :--- | :--- | :---: |
| **18** | **Ngoặc nhóm (Grouping)** | `( ... )` | n/a |
| **17** | **Truy cập thành viên & Gọi hàm** | `.` , `[ ]` , `?.` (Optional Chaining) , `fn( )` , `new Ctor(args)` | Trái $\rightarrow$ Phải |
| **16** | **Khởi tạo không tham số** | `new Ctor` (Không có ngoặc) | Phải $\rightarrow$ Trái |
| **15** | **Hậu tố tăng/giảm (Postfix)** | `x++` , `x--` | n/a |
| **14** | **Tiền tố & Đơn vị (Prefix / Unary)** | `++x` , `--x` , `!` , `~` , `+x` , `-x` , `typeof` , `void` , `delete` , `await` | Phải $\rightarrow$ Trái |
| **13** | **Lũy thừa (Exponentiation)** | `**` | **Phải $\rightarrow$ Trái** |
| **12** | **Nhân / Chia / Chia lấy dư** | `*` , `/` , `%` | Trái $\rightarrow$ Phải |
| **11** | **Cộng / Trừ (Số & Chuỗi)** | `+` , `-` | Trái $\rightarrow$ Phải |
| **10** | **Dịch bit (Bitwise Shift)** | `<<` , `>>` , `>>>` | Trái $\rightarrow$ Phải |
| **9** | **So sánh quan hệ (Relational)** | `<` , `<=` , `>` , `>=` , `in` , `instanceof` | Trái $\rightarrow$ Phải |
| **8** | **So sánh bằng (Equality)** | `===` , `!==` , `==` , `!=` | Trái $\rightarrow$ Phải |
| **7** | **Bitwise AND** | `&` | Trái $\rightarrow$ Phải |
| **6** | **Bitwise XOR** | `^` | Trái $\rightarrow$ Phải |
| **5** | **Bitwise OR** | `\|` | Trái $\rightarrow$ Phải |
| **4** | **Logical AND** | `&&` | Trái $\rightarrow$ Phải |
| **3** | **Logical OR & Nullish** | `\|\|` , `??` | Trái $\rightarrow$ Phải |
| **2** | **3 ngôi, Phép gán & Arrow** | `? :` , `=` , `+=` , `&&=` , `??=` , `=>` , `yield` | **Phải $\rightarrow$ Trái** |
| **1** | **Dấu phẩy (Comma)** | `,` | Trái $\rightarrow$ Phải |

### 2.2. Chiều Kết Hợp Từ Phải Qua Trái (Right-to-Left Associativity)
Trong khi hầu hết các toán tử đều tính từ trái sang phải, có 3 nhóm đặc biệt tính toán từ **PHẢI SANG TRÁI**:
1. **Toán tử lũy thừa `**`**:
   `2 ** 3 ** 2` $\iff$ `2 ** (3 ** 2)` $\iff$ `2 ** 9 = 512`.
   (Nếu tính từ trái sang phải sẽ ra sai: `(2 ** 3) ** 2 = 64`).
2. **Toán tử gán `=`**:
   `a = b = c = 10` $\iff$ `a = (b = (c = 10))`.
3. **Toán tử 3 ngôi lồng nhau `? :`**:
   `a ? b : c ? d : e` $\iff$ `a ? b : (c ? d : e)`.

### 2.3. Sự Khác Biệt: Thứ Tự Ưu Tiên (Precedence) vs Thứ Tự Thực Thi (Evaluation Order)
Nhiều kỹ sư nhầm tưởng rằng toán tử có độ ưu tiên cao hơn sẽ khiến các hàm hoặc biểu thức con ở vế của nó chạy trước.
**Thực tế trong ECMAScript**:
- Thứ tự ưu tiên chỉ quyết định **cách đóng mở ngoặc ngầm định** giữa các toán tử.
- Các biểu thức con **LUÔN LUÔN được thực thi và đánh giá từ TRÁI SANG PHẢI**:
```javascript
function A() { console.log("A"); return 2; }
function B() { console.log("B"); return 3; }
function C() { console.log("C"); return 4; }

// Dù phép nhân B() * C() được gom nhóm tính trước,
// nhưng thứ tự gọi hàm trong Call Stack vẫn là: A -> B -> C!
const result = A() + B() * C(); // In ra: "A", "B", "C"
```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Cấm Trộn Lẫn Toán Tử `??` Với `&&` Hoặc `||` Không Có Dấu Ngoặc (SyntaxError)
```javascript
// ❌ CẤM CÚ PHÁP: ECMAScript ném lỗi SyntaxError ngay khi parse
const port = process.env.PORT || config.port ?? 3000;
// Uncaught SyntaxError: Unexpected token '??'

// ✅ ĐÚNG: Bắt buộc dùng ngoặc tròn () để chỉ định rõ ý định gom nhóm
const port = (process.env.PORT || config.port) ?? 3000;
```

### Bẫy 2: Cấm Viết Dấu Trừ Âm Trước Phép Lũy Thừa `-x ** y`
```javascript
// ❌ CẤM CÚ PHÁP: Để tránh xung đột toán học (-2)^2 = 4 vs -(2^2) = -4
const val = -2 ** 2; // SyntaxError: Unary operator used immediately before exponentiation expression

// ✅ ĐÚNG: Đóng mở ngoặc minh thị
const posVal = (-2) ** 2; // 4
const negVal = -(2 ** 2); // -4
```

### Bẫy 3: Tiền Tố `++i` vs Hậu Tố `i++` Trong Biểu Thức Phức Tạp
```javascript
let i = 1;
const a = i++ + ++i;
// i++: Trả về 1 (sau đó i tăng lên 2)
// ++i: Tăng i lên 3 trước, rồi trả về 3
// Kết quả: 1 + 3 = 4 (và cuối cùng i = 3)
// ⚠️ ANTI-PATTERN: Tránh tối đa việc nhúng ++/-- vào các biểu thức tính toán phức tạp vì cực kỳ khó bảo trì!
```

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [04-precedence-demo.js](file:///d:/my-project/revision-document/javascript/08-language-reference/04-precedence-demo.js)

### Bảng Kiểm Tra Dự Đoán Thứ Tự Toán Tử Thực Tế
```javascript
// Câu đố 1: Độ ưu tiên giữa `.` và `new`
function User(name) {
  this.name = name;
  this.getName = function() { return this.name; };
}

// "new User('John').getName()" được phân tích như thế nào?
// Mức 17: "new Ctor(args)" và "." cùng mức 17 (kết hợp Trái -> Phải)
// -> (new User('John')).getName() -> "John"
console.log(new User('John').getName()); // "John"

// "new User.getName()" (không có ngoặc khởi tạo)
// Mức 17 (.) cao hơn Mức 16 (new không ngoặc)
// -> new (User.getName)() -> Gọi constructor trên thuộc tính tĩnh getName!
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Biểu thức `100 / 5 * 2` cho kết quả là `40` hay `10`, và tại sao theo quy tắc Associativity của ECMAScript?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- **Kết quả là `40`**.
- **Giải thích**:
  - Toán tử chia `/` và toán tử nhân `*` nằm ở cùng cấp độ ưu tiên (Cấp 12 trong bảng Precedence Table).
  - Theo đặc tả ECMAScript, cả hai toán tử này đều có chiều kết hợp từ **Trái sang Phải (Left-to-Right Associativity)**.
  - Do đó, biểu thức được gom nhóm thành: `(100 / 5) * 2 = 20 * 2 = 40`.
</details>

### Câu 2: Tại sao biểu thức `false == 0 == ""` lại cho kết quả là `true`, nhưng `false === 0 === ""` lại ném lỗi hoặc cho kết quả khác?
<details>
<summary><b>Lời giải chi tiết</b></summary>

1. **Với `false == 0 == ""`**:
   - Toán tử `==` kết hợp từ Trái sang Phải.
   - Bước 1: `(false == 0)`: Theo quy tắc ép kiểu trừu tượng, `false` ép về số `0`. Phép so sánh `0 == 0` cho kết quả là `true`.
   - Bước 2: `(true == "")`: Theo quy tắc ép kiểu, `true` ép thành số `1`, chuỗi rỗng `""` ép thành số `0`. Phép so sánh `1 == 0` cho ra **`false`**! (Lưu ý: Không phải ra `true`).
2. **Với `false === 0 === ""`**:
   - Bước 1: `(false === 0)` là `false` (khác kiểu dữ liệu Boolean vs Number).
   - Bước 2: `(false === "")` là `false` (khác kiểu dữ liệu Boolean vs String).
   - Cả hai bước đều không có ép kiểu ngầm định, giúp tránh hoàn toàn các kết quả bất ngờ.
</details>
