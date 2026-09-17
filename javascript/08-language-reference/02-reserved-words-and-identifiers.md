# Từ Khóa Dự Trữ & Quy Tắc Đặt Tên Định Danh (Reserved Words & Identifiers)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-fundamentals/01-variables-and-data-types.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-variables-and-data-types.md) (Khai báo biến & Kiểu dữ liệu).
  - [05-style-guide-and-best-practices/02-best-practices-and-clean-code.md](file:///d:/my-project/revision-document/javascript/05-style-guide-and-best-practices/02-best-practices-and-clean-code.md) (Strict Mode `"use strict"`).
- **Khái niệm tương quan**:
  - **Lexer Tokenization**: Trong giai đoạn phân tích từ vựng của V8 Engine, trình quét mã (Scanner) đối chiếu từng chuỗi ký tự với bảng băm (Hash Table) các từ khóa dự trữ của ECMAScript để phân loại token `KEYWORD` hoặc `IDENTIFIER`.
  - **Contextual Keywords**: Các từ chỉ có ý nghĩa đặc biệt trong một số cấu trúc ngữ pháp nhất định (`await` trong async, `yield` trong generator, `as` trong import).
- **Điểm đến tiếp theo**:
  - [03-operators-and-expressions.md](file:///d:/my-project/revision-document/javascript/08-language-reference/03-operators-and-expressions.md) (Toán Tử & Biểu Thức).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Phân Loại Toàn Bộ Từ Khóa Trong JavaScript (ECMAScript Spec)

```
                              BẢNG TỪ KHÓA JAVASCRIPT
                                        |
       +--------------------------------+--------------------------------+
       |                                |                                |
       v                                v                                v
[Reserved Keywords]           [Strict Mode Reserved]          [Contextual Keywords]
- Không bao giờ được đặt      - Bị cấm khi có "use strict"    - Chỉ là từ khóa trong
  làm tên biến trong code.      hoặc trong ES Modules.          ngữ cảnh nhất định.
  break, case, catch, class,    implements, interface, let,     await, yield, of, from,
  const, continue, debugger,    package, private, protected,    as, get, set, target,
  default, delete, do, else,    public, static                  using (ES2024 Explicit
  export, extends, finally,                                     Resource Management)
  for, function, if, import,
  in, instanceof, new, return,
  super, switch, this, throw,
  try, typeof, var, void,
  while, with, enum
```

### 2.2. Quy Tắc Cú Pháp Đặt Tên Định Danh (Identifier Grammar)
Theo chuẩn Unicode Standard Annex #31:
1. **Ký tự bắt đầu**: Bắt buộc phải là:
   - Dấu đô la (`$`).
   - Dấu gạch dưới (`_`).
   - Bất kỳ ký tự chữ cái nào thuộc nhóm Unicode `ID_Start` (bao gồm chữ cái Latin, chữ cái tiếng Việt có dấu, chữ Hán, chữ cái Hy Lạp...).
   - **TUYỆT ĐỐI KHÔNG BẮT ĐẦU BẰNG SỐ**.
2. **Các ký tự tiếp theo**: Gồm toàn bộ ký tự bắt đầu + các chữ số `0-9` (nhóm `ID_Continue`).
3. **Không được chứa toán tử toán học hoặc dấu chấm câu**: `user-name` (chứa dấu trừ), `user.name` (chứa dấu chấm truy cập object).

### 2.3. Sự Khác Biệt Giữa Tên Biến và Tên Thuộc Tính Object (Property Names)
Trước ES5, việc đặt tên thuộc tính object bằng từ khóa như `{ class: "btn" }` sẽ gây lỗi cú pháp.
Tuy nhiên, từ **ES5 trở đi**:
- **Tên biến / Tham số hàm**: Tuyệt đối cấm từ khóa dự trữ (`let class = "btn";` -> ❌ SyntaxError).
- **Tên thuộc tính Object (IdentifierName)**: **Hoàn toàn cho phép** dùng từ khóa dự trữ (`const obj = { class: "btn", delete: true, default: 1 };` -> ✅ Hợp lệ).

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Khai Báo Biến Tên Là `eval` Hoặc `arguments` Trong Strict Mode
```javascript
// Trong Non-Strict Mode (cũ):
var eval = 10; // Chạy được nhưng cực kỳ nguy hiểm vì làm hỏng hàm eval() toàn cục

// Trong Strict Mode ("use strict" hoặc ES Module):
"use strict";
let eval = 10;       // ❌ SyntaxError: Unexpected eval or arguments in strict mode
let arguments = 20;  // ❌ SyntaxError: Unexpected eval or arguments in strict mode
```

### Bẫy 2: Che Khuất Biến Toàn Cục (Variable Shadowing) Với `undefined`
- Trong JavaScript, `undefined` **không phải là một từ khóa dự trữ** (nó là một thuộc tính có thể đọc của `window`/`globalThis`).
```javascript
function dangerousCode() {
  const undefined = "Tôi không phải undefined!";
  let x;
  if (x === undefined) {
    // Không bao giờ chạy vào đây vì undefined đã bị biến cục bộ che khuất!
  }
}

// ✅ GIẢI PHÁP PHÒNG THỦ: Luôn dùng toán tử `typeof` hoặc `void 0`
if (typeof x === "undefined") { ... }
if (x === void 0) { ... } // void 0 luôn luôn đánh giá ra undefined nguyên bản
```

### Bẫy 3: Đặt Tên Biến Là `await` Trong File ES Module
- `await` trong Script thông thường có thể dùng làm tên biến: `var await = 5;` (Hợp lệ trong Non-Module).
- Nhưng trong **ES Module (`<script type="module">` hoặc Node.js `.mjs`)**, `await` là từ khóa dự trữ cấp cao nhất (Top-level await), nên việc đặt tên biến là `await` sẽ gây lỗi biên dịch ngay lập tức (`SyntaxError: await is only valid in async functions and the top level bodies of modules`).

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [02-reserved-words-demo.js](file:///d:/my-project/revision-document/javascript/08-language-reference/02-reserved-words-demo.js)

### Bộ Kiểm Tra Định Danh Hợp Lệ Chuẩn Production Regex
```javascript
// Sử dụng Unicode Property Escapes (\p{ID_Start} và \p{ID_Continue})
const RESERVED = new Set([
  "break", "case", "catch", "class", "const", "continue", "debugger", "default",
  "delete", "do", "else", "export", "extends", "finally", "for", "function",
  "if", "import", "in", "instanceof", "new", "return", "super", "switch",
  "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield",
  "enum", "implements", "interface", "let", "package", "private", "protected",
  "public", "static", "eval", "arguments"
]);

function validateJSIdentifier(identifier) {
  if (typeof identifier !== "string" || identifier.length === 0) {
    return { valid: false, reason: "Định danh rỗng" };
  }

  if (RESERVED.has(identifier)) {
    return { valid: false, reason: `"${identifier}" trùng với từ khóa dự trữ của JavaScript` };
  }

  // Khớp theo chuẩn ECMAScript Unicode
  const regex = /^[$_\p{ID_Start}][$_\p{ID_Continue}]*$/u;
  if (!regex.test(identifier)) {
    return { valid: false, reason: "Chứa ký tự không hợp lệ hoặc bắt đầu bằng số" };
  }

  return { valid: true, reason: "Định danh hoàn toàn hợp lệ" };
}

console.log(validateJSIdentifier("giá_tiền_VNĐ")); // { valid: true, ... }
console.log(validateJSIdentifier("123item"));      // { valid: false, reason: 'Chứa ký tự không hợp lệ...' }
console.log(validateJSIdentifier("class"));        // { valid: false, reason: '"class" trùng với từ khóa...' }
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao đoạn mã `const obj = { delete: true, class: "btn" };` lại hợp lệ trong JavaScript hiện đại nhưng `let delete = true;` lại báo lỗi `SyntaxError`?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Ngữ pháp của ECMAScript phân tách rõ ràng giữa hai khái niệm:
  1. `IdentifierName`: Tên định danh tổng quát, bao gồm cả từ khóa dự trữ. Trong cú pháp khai báo thuộc tính Object (`obj.prop` hoặc `{ prop: val }`), ECMAScript quy định vị trí này là một `IdentifierName`, do đó trình biên dịch chấp nhận mọi từ khóa như `delete`, `class`, `default`.
  2. `IdentifierReference`: Tên tham chiếu đến biến trong bộ nhớ. Ở câu lệnh khai báo biến `let <Identifier> = ...`, ngữ pháp ECMAScript bắt buộc vị trí này phải là một `Identifier` thuần túy (không được trùng với bất kỳ `ReservedWord` nào). Do `delete` là từ khóa toán tử đơn vị, V8 Engine lập tức chặn lại và ném lỗi `SyntaxError`.
</details>

### Câu 2: Từ khóa ngữ cảnh (Contextual Keyword) `using` mới được bổ sung vào ECMAScript (ES2024 / TypeScript 5.2) có vai trò gì?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- `using` là từ khóa dành cho cơ chế **Quản lý Tài nguyên Minh thị (Explicit Resource Management)**.
- Khi khai báo biến với `using resource = getResource()`, đối tượng tài nguyên đó phải cài đặt phương thức `[Symbol.dispose]()`.
- Khi luồng thực thi đi ra khỏi khối phạm vi `{}` hiện tại (kể cả thoát do `return` hoặc do `throw` ngoại lệ), trình duyệt sẽ **tự động kích hoạt phương thức giải phóng tài nguyên `[Symbol.dispose]()`** (ví dụ: tự động đóng kết nối cơ sở dữ liệu, giải phóng file handle, dọn dẹp bộ nhớ đệm), tương tự như lệnh `using` trong C# hoặc `with` trong Python.
</details>
