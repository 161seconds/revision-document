# Biểu Thức Chính Quy Toàn Tập (Regular Expressions Deep Dive)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-fundamentals/07-strings-and-templates.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/07-strings-and-templates.md) (Chuỗi ký tự & Phương thức String).
  - [03-operators-and-expressions.md](file:///d:/my-project/revision-document/javascript/08-language-reference/03-operators-and-expressions.md) (Toán tử kiểm tra logic).
- **Khái niệm tương quan**:
  - **NFA Engine & Backtracking**: V8 sử dụng cỗ máy trạng thái hữu hạn bất định (Non-deterministic Finite Automaton - NFA). Khi không khớp, engine sẽ lùi bước (backtrack) để thử nhánh khác. Các biểu thức lồng nhau có thể dẫn đến thời gian chạy hàm mũ $O(2^N)$ gây treo CPU (ReDoS).
  - **Unicode Code Point Awareness (`u` and `v` flags)**: Xử lý các ký tự Emoji (như 🚀 hoặc 👨‍👩‍👧‍👦) vốn chiếm 2 Code Units (Surrogate Pairs) trong UTF-16.
- **Điểm đến tiếp theo**:
  - [09-asynchronous-javascript/](file:///d:/my-project/revision-document/javascript/09-asynchronous-javascript/) (Lập trình bất đồng bộ).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Ma Trận Các Cờ Hiệu (Flags) Của RegExp Trong ECMAScript

| Flag | Tên đầy đủ | Tác dụng kỹ thuật |
| :---: | :--- | :--- |
| **`g`** | **Global** | Tìm tất cả các kết quả khớp thay vì dừng lại ở kết quả đầu tiên. **Lưu trạng thái chỉ mục vào `regex.lastIndex`**. |
| **`i`** | **Ignore Case** | Không phân biệt chữ hoa, chữ thường (`a` khớp `A`). |
| **`m`** | **Multiline** | Cho phép `^` và `$` khớp ở đầu và cuối của **từng dòng** (ngăn cách bởi `\n`), thay vì toàn bộ chuỗi. |
| **`s`** | **DotAll** | Cho phép dấu chấm `.` khớp với **tất cả mọi ký tự**, bao gồm cả ký tự xuống dòng `\n`. |
| **`u`** | **Unicode** | Bật hỗ trợ Unicode toàn diện, xử lý chính xác các cặp mã Surrogate Pairs (Emoji, chữ tượng hình). |
| **`y`** | **Sticky** | Tìm kiếm chuẩn xác "dính chặt" tại vị trí `lastIndex`, không quét tìm tiếp phía sau. |
| **`d`** | **HasIndices** | Trả về mảng chỉ mục bắt đầu và kết thúc của từng nhóm bắt (`indices`). |

### 2.2. Kỹ Thuật Tiền Kiểm & Hậu Kiểm (Lookaround Assertions)
Lookaround là các xác thực vị trí mà **không tiêu thụ ký tự (Zero-Width Assertions)**:

```
                            LOOKAROUND ASSERTIONS
                                      |
         +----------------------------+----------------------------+
         |                                                         |
         v                                                         v
   [LOOKAHEAD (?= / ?!)]                                     [LOOKBEHIND (?<= / ?<!)]
  Kiểm tra chuỗi PHÍA SAU                                  Kiểm tra chuỗi PHÍA TRƯỚC
         |                                                         |
  +------+------+                                           +------+------+
  |             |                                           |             |
  v             v                                           v             v
Positive:    Negative:                                   Positive:     Negative:
(?=exp)       (?!exp)                                     (?<=exp)      (?<!exp)
Phải có       Không được có                               Phải có       Không được có
```

### 2.3. Cạm Bẫy Trạng Thái `lastIndex` (Stateful Regex Bug)
Khi một RegExp đối tượng có cờ `g` hoặc `y`:
- Nó trở thành một **Stateful Object** (có trạng thái nội tại).
- Thuộc tính `regex.lastIndex` ghi nhớ vị trí kết thúc của lần tìm kiếm trước đó.
- Nếu bạn gọi `regex.test(str)` liên tiếp trong vòng lặp hoặc nhiều request khác nhau, kết quả sẽ **bị luân phiên đổi giữa `true` và `false`** một cách kỳ lạ!

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Tái Sử Dụng Đối Tượng RegExp Có Cờ `/g` Trong Kiểm Tra Điều Kiện
```javascript
// ❌ SAI LẦM: Khai báo RegExp global bên ngoài hàm kiểm tra
const hasSpecialChar = /[!@#$%]/g;

function checkPassword(pass) {
  return hasSpecialChar.test(pass);
}

// Giả sử người dùng nhập liên tiếp:
console.log(checkPassword("pass@1")); // true (lastIndex nhảy lên 5)
console.log(checkPassword("pass@1")); // false! (TÌM TỪ INDEX 5 TRỞ ĐI -> KHÔNG THẤY -> FALSE!)
console.log(checkPassword("pass@1")); // true (lastIndex tự reset về 0)

// ✅ ĐÚNG: Bỏ cờ 'g' khi chỉ cần kiểm tra boolean
const safeSpecialChar = /[!@#$%]/; // Không bao giờ bị kẹt lastIndex!
```

### Bẫy 2: Lỗ Hổng Từ Chối Dịch Vụ ReDoS (Catastrophic Backtracking)
Khi biểu thức chính quy có cấu trúc định lượng lồng nhau (Nested Quantifiers):
`/^(a+)+$/`
Nếu chuỗi đầu vào là `"aaaaaaaaaaaaaaaaaaaaaaaaaaaa!"` (chuỗi toàn chữ `a` dài nhưng kết thúc bằng dấu `!` không khớp):
- NFA Engine của trình duyệt sẽ phải thử tất cả $2^N$ nhánh hoán vị của các nhóm `a+` trước khi kết luận không khớp.
- Chuỗi chỉ cần 30 ký tự sẽ làm treo đơ CPU 100% của toàn bộ máy chủ Node.js hoặc tab trình duyệt trong vài phút!
- **Phòng thủ**: Tránh viết các định lượng lồng nhau (`(a+)+`), sử dụng timeout hoặc thư viện an toàn `re2`.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [14-regexp-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/14-regexp-demo.js)

### Mẫu Định Dạng Số Tiền Tệ Tự Động Bằng Regex Lookahead
```javascript
// Thêm dấu phẩy phân cách hàng nghìn mà không cần thư viện bên ngoài:
function formatCurrency(amount) {
  // (?=(\d{3})+(?!\d)): Khớp các vị trí mà phía sau nó là bội số của 3 chữ số
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

console.log(formatCurrency(1000));      // "1,000"
console.log(formatCurrency(123456789)); // "123,456,789"
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Phương thức `string.matchAll(regex)` khác biệt gì so với `string.match(regex)` khi biểu thức có cờ `/g`?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Khi có cờ `/g`:
  - `string.match(regex)`: Chỉ trả về một mảng chứa các **chuỗi ký tự khớp đầy đủ**, hoàn toàn **vứt bỏ tất cả các nhóm bắt (Capturing Groups)** và thuộc tính `groups`.
  - `string.matchAll(regex)`: Trả về một **RegExp String Iterator**. Mỗi phần tử trong Iterator này là một mảng Match đầy đủ chứa trọn vẹn: chuỗi khớp, các nhóm bắt con (`match[1]`, `match[2]`), đối tượng `match.groups` (nếu dùng Named Groups) và vị trí `match.index`.
</details>

### Câu 2: Tại sao cờ `u` (Unicode) lại bắt buộc khi xử lý độ dài hoặc ký tự đặc biệt của văn bản chứa Emoji trong JavaScript?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- JavaScript lưu chuỗi theo mã hóa UTF-16. Các ký tự Emoji (như `😄` mã `\uD83D\uDE04`) chiếm **2 đơn vị mã (Surrogate Pair)**.
- Nếu không có cờ `u`, biểu thức `/^.$/` sẽ coi `😄` là 2 ký tự riêng biệt và trả về `false`.
- Khi có cờ `u` (`/^.$/u`), RegExp Engine sẽ xử lý theo từng **Code Point Unicode thực tế**, nhận diện `😄` là đúng 1 ký tự duy nhất và trả về `true`.
</details>
