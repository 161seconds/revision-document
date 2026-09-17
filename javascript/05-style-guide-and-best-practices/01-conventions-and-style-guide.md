# Quy Chuẩn Viết Mã & Phong Cách Lập Trình (JavaScript Conventions & Style Guide)

Tài liệu chuyên sâu về chuẩn mực định dạng mã nguồn JavaScript: Quy tắc đặt tên (camelCase, PascalCase, UPPER_SNAKE_CASE), cơ chế tự động chèn dấu chấm phẩy (ASI - Automatic Semicolon Insertion) của V8 Engine, cạm bẫy câu lệnh `return` ngắt dòng, và quy chuẩn cấu trúc khối lệnh 1TBS (One True Brace Style).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-fundamentals/03-syntax-and-structure.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/03-syntax-and-structure.md) (Cú pháp cơ bản và câu lệnh).
  - [01-fundamentals/07-let-and-const.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/07-let-and-const.md) (Quy tắc khai báo biến).
- **Mở rộng tiếp theo (Next Steps):**
  - [02-best-practices-and-clean-code.md](file:///d:/my-project/revision-document/javascript/05-style-guide-and-best-practices/02-best-practices-and-clean-code.md) (Thực hành viết mã sạch và an toàn).
  - [03-common-mistakes-and-anti-patterns.md](file:///d:/my-project/revision-document/javascript/05-style-guide-and-best-practices/03-common-mistakes-and-anti-patterns.md) (Những sai lầm kinh điển).
- **Khái niệm liên quan (Related):**
  - Linter tooling (ESLint, Prettier, Biome).
  - Cơ chế phân tích cú pháp AST của V8.
  - ASI Grammar Rules (ECMAScript Semicolon Insertion).

---

## 2. Bản Chất Hoạt Động (Mental Model: ASI & Quy Chuẩn Đặt Tên)

### 1. Quy Ước Đặt Tên Chuẩn (Naming Conventions)

| Đối tượng | Quy chuẩn đặt tên | Ví dụ | Giải thích |
| :--- | :--- | :--- | :--- |
| **Biến & Hàm** | `lowerCamelCase` | `firstName`, `calculateTotal()` | Tiêu chuẩn toàn ngành JS |
| **Hằng số bất biến tuyệt đối** | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`, `API_BASE_URL` | Dành cho các giá trị cấu hình cố định |
| **Lớp (Class) & Hàm tạo** | `PascalCase` | `UserAccount`, `OrderService` | Phân biệt với hàm thường |
| **Trường riêng tư (Private)** | Ký hiệu `#` (ES2022) hoặc `_` | `#secretKey`, `_internalState` | `#` được V8 bảo vệ ở cấp độ engine |
| **File mã nguồn** | `kebab-case` hoặc `camelCase` | `order-service.js`, `orderService.js` | Tương thích tốt với hệ điều hành Linux phân biệt hoa/thường |

---

### 2. Cơ Chế Tự Động Chèn Dấu Chấm Phẩy (ASI - Automatic Semicolon Insertion)
Trình phân tích cú pháp của V8 Engine tự động chèn dấu chấm phẩy `;` vào luồng token nếu:
1. Gặp phải ký tự kết thúc dòng (Line Break) và token kế tiếp vi phạm ngữ pháp nếu không có `;`.
2. Gặp phải dấu đóng ngoặc nhọn `}`.
3. Gặp phải câu lệnh đặc biệt bị cấm ngắt dòng (Restricted Productions): **`return`**, **`throw`**, **`break`**, **`continue`**, **`yield`**.

### 3. Cạm Bẫy Tử Thần Của ASI: Câu Lệnh `return` Xuống Dòng
Nếu bạn đặt biểu thức trả về ở dòng tiếp theo ngay sau từ khóa `return`:
```javascript
// LẬP TRÌNH VIÊN NGHĨ:
function getUser() {
  return
  {
    name: "Nam"
  };
}

// V8 ENGINE THỰC SỰ BIÊN DỊCH:
function getUser() {
  return; // <-- ASI TỰ ĐỘNG CHÈN DẤU CHẤM PHẨY VÀO ĐÂY!
  {
    name: "Nam"; // Trở thành một block code vô nghĩa!
  }
}

console.log(getUser()); // undefined!
```
➔ **Quy chuẩn bắt buộc:** Dấu ngoặc mở `{` hoặc dấu ngoặc tròn `(` phải nằm **cùng dòng** với từ khóa `return`:
```javascript
function getUser() {
  return {
    name: "Nam"
  };
}
```

---

### 4. Quy Chuẩn Khối Lệnh: K&R / 1TBS (One True Brace Style)
Trong JavaScript, luôn sử dụng phong cách ngoặc nhọn dòng mở đầu (K&R Style):
```javascript
// ĐÚNG CHUẨN (1TBS):
if (condition) {
  doSomething();
} else {
  doOther();
}

// KHÔNG DÙNG (Allman Style): Dễ kích hoạt bug ASI trong JS!
if (condition)
{
  doSomething();
}
```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy ASI khi dòng sau bắt đầu bằng `[` hoặc `(`
Khi bỏ dấu chấm phẩy, nếu dòng tiếp theo bắt đầu bằng dấu ngoặc vuông hoặc tròn:
```javascript
let x = 1
[1, 2, 3].forEach(n => console.log(n))

// V8 BIÊN DỊCH THÀNH:
let x = 1[1, 2, 3].forEach(n => console.log(n)); // TypeError: Cannot read properties of undefined!
```

### 2. Bẫy ngắt dòng giữa các toán tử
Khi một biểu thức quá dài (> 80 ký tự), luôn ngắt dòng **sau toán tử** chứ không ngắt trước toán tử:
```javascript
// ĐÚNG: Ngắt sau toán tử + để V8 hiểu biểu thức chưa kết thúc:
const longText = "Dòng chữ thứ nhất " +
  "dòng chữ thứ hai " +
  "dòng chữ thứ ba";
```

---

## 4. File Code Thực Hành

- [01-conventions-demo.js](file:///d:/my-project/revision-document/javascript/05-style-guide-and-best-practices/01-conventions-demo.js): Code thực nghiệm cạm bẫy ASI với `return` xuống dòng, bug dòng mới bắt đầu bằng `[` và `(`, quy chuẩn đặt tên, và trường riêng tư `#privateField`. Chạy bằng: `node 01-conventions-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao việc viết `return` trên một dòng riêng biệt lại khiến hàm trả về `undefined` thay vì đối tượng bên dưới?**
   *Đáp án:* Vì trong đặc tả ECMAScript, câu lệnh `return` thuộc nhóm "Restricted Productions". Khi gặp ký tự xuống dòng (line terminator) ngay sau `return`, quy tắc ASI (Automatic Semicolon Insertion) của engine bắt buộc phải tự động chèn dấu `;` ngay sau `return`, biến nó thành `return;` hợp lệ trả về `undefined`, và biến khối ngoặc `{ ... }` bên dưới thành một block lệnh độc lập không bao giờ được thực thi.

2. **Khi nào lập trình viên bắt buộc phải thêm dấu chấm phẩy `;` nếu theo đuổi phong cách không dùng chấm phẩy (StandardJS / Semi-less)?**
   *Đáp án:* Khi một dòng mã bắt đầu bằng một trong 5 ký tự đặc biệt: `(`, `[`, `/` (RegExp), `+`, `-`. Nếu không có dấu `;` phía trước, engine sẽ coi dòng đó là lời gọi hàm hoặc truy cập chỉ mục của dòng trước, gây lỗi `TypeError`.
