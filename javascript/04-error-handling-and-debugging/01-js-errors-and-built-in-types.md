# Hệ Thống Lỗi & Các Kiểu Lỗi Tích Hợp (JavaScript Errors & Built-in Error Types)

Tài liệu ôn tập toàn diện về cơ chế ném và bắt lỗi trong JavaScript: Bản chất Call Stack Unwinding của V8 Engine, phân loại chi tiết 7 kiểu lỗi tích hợp chuẩn ECMAScript (`ReferenceError`, `TypeError`, `RangeError`, `SyntaxError`, `URIError`, `EvalError`, `AggregateError`), cạm bẫy lỗi thời điểm biên dịch vs thời điểm thực thi.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-fundamentals/07-let-and-const.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/07-let-and-const.md) (Vùng chết tạm thời - TDZ và `ReferenceError`).
  - [02-functions-and-scope/04-execution-context-scope-and-closures.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/04-execution-context-scope-and-closures.md) (Ngăn xếp cuộc gọi Call Stack và Execution Context).
- **Mở rộng tiếp theo (Next Steps):**
  - [02-silent-errors-and-defensive-coding.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/02-silent-errors-and-defensive-coding.md) (Lỗi im lặng không ném ngoại lệ và Strict Mode).
  - [03-error-statements-and-handling.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/03-error-statements-and-handling.md) (`try...catch...finally` và Error Chaining `cause`).
- **Khái niệm liên quan (Related):**
  - Tháo cuộn ngăn xếp (Stack Unwinding).
  - Xử lý bất đồng bộ không bắt được (Unhandled Promise Rejections).

---

## 2. Bản Chất Hoạt Động (Mental Model: V8 Call Stack Unwinding)

### 1. Cơ Chế Tháo Cuộn Ngăn Xếp (Call Stack Unwinding)
Khi một ngoại lệ (Exception) phát sinh tại một dòng mã:
1. V8 Engine tạm dừng luồng thực thi thông thường tại ngữ cảnh hiện tại.
2. V8 tìm kiếm khối `try...catch` bao bọc gần nhất trong Stack Frame hiện tại.
3. Nếu không tìm thấy, V8 **tháo gỡ (pop) Stack Frame** đó ra khỏi Call Stack và quay về hàm gọi trước nó để tìm tiếp (quá trình này gọi là **Stack Unwinding**).
4. Nếu đi ngược lên tận đỉnh (Global Execution Context) mà vẫn không có khối `catch` nào xử lý:
   - Trong trình duyệt: Ném ra sự kiện `window.onerror` và hiển thị lỗi đỏ trong DevTools Console.
   - Trong Node.js: Kích hoạt sự kiện `uncaughtException`, in stack trace và có thể terminate tiến trình (Exit code 1).

```
Call Stack:
  [innerFunc()]   <-- Ném TypeError! Không có catch! (Unwound / Pop khỏi stack)
  [middleFunc()]  <-- Không có catch! (Unwound / Pop khỏi stack)
  [outerFunc()]   <-- Có try...catch! Bắt lỗi thành công tại đây!
  [Global Context]
```

---

### 2. Bảng 7 Kiểu Lỗi Tích Hợp Chuẩn ECMAScript

| Tên lớp lỗi | Khi nào xảy ra? | Ví dụ điển hình |
| :--- | :--- | :--- |
| **`ReferenceError`** | Truy cập biến chưa khai báo hoặc biến trong TDZ | `console.log(undeclaredVar)` hoặc truy cập `let x` trước khi khai báo |
| **`TypeError`** | Thao tác sai kiểu dữ liệu (gọi non-function, sửa thuộc tính read-only) | `const n = 10; n()`, `"str".toUpperCase() = "X"` |
| **`RangeError`** | Giá trị số vượt quá giới hạn hoặc phạm vi cho phép | `new Array(-1)`, `(1).toPrecision(500)`, tràn Call Stack (Maximum call stack size exceeded) |
| **`SyntaxError`** | Cú pháp không tuân theo ngữ pháp của ngôn ngữ (lỗi lúc parse) | `const 123name = 1;`, `JSON.parse("{ invalid }")` |
| **`URIError`** | Mã hóa hoặc giải mã URI sai chuẩn RFC 3986 | `decodeURI("%")`, `decodeURIComponent("%E0%A4%A")` |
| **`EvalError`** | Sử dụng hàm `eval()` không đúng chuẩn (ít gặp trong ES6+) | Kế thừa lịch sử của ES3 |
| **`AggregateError`** | Bọc nhiều lỗi cùng lúc (chuẩn ES2021) | Được ném ra bởi `Promise.any()` khi tất cả Promise đều bị reject |

---

### 3. Phân Biệt: Lỗi Thời Điểm Phân Tích Cú Pháp vs Lỗi Thời Điểm Chạy
- **Parse-Time SyntaxError**: Xảy ra trước khi bất kỳ dòng mã nào được thực thi. V8 phân tích cú pháp toàn bộ tệp hoặc hàm:
  - Khối `try...catch` **cùng cấp** KHÔNG THỂ bắt được lỗi này vì mã chưa hề chạy!
  - Chỉ có thể bắt `SyntaxError` lúc runtime nếu mã được đánh giá động qua `eval()`, `new Function()`, hoặc `JSON.parse()`.
- **Runtime Errors (`TypeError`, `ReferenceError`, `RangeError`)**: Xảy ra trong quá trình thực thi từng chỉ lệnh máy ảo (Bytecode) trên Call Stack. Các lỗi này được bắt hoàn hảo bởi `try...catch`.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy tưởng rằng `try...catch` bắt được `SyntaxError` cùng file
```javascript
try {
  // Lỗi cú pháp trực tiếp:
  const foo = ; // BẪY: Trình thông dịch ném SyntaxError ngay khi nạp file!
} catch (e) {
  console.log("Không bao giờ nhảy vào đây!");
}
```
➔ **Bản chất:** Trình biên dịch V8 phân tích cây cú pháp trừu tượng (AST) trước khi chạy. Lỗi cú pháp ngăn toàn bộ script thực thi.

### 2. Bẫy Temporal Dead Zone (TDZ) biến thành `ReferenceError`
```javascript
let x = 10;
function test() {
  console.log(x); // BẪY: ReferenceError: Cannot access 'x' before initialization
  let x = 20;     // Biến x ở scope con che bóng biến ngoài và tạo TDZ!
}
test();
```

### 3. Bẫy RangeError do Đệ Quy Tràn Ngăn Xếp (Stack Overflow)
```javascript
function infinite() {
  infinite(); // RangeError: Maximum call stack size exceeded
}
```
➔ **Giải pháp:** Sử dụng khử đệ quy (Tail Call Optimization / Vòng lặp `while`) hoặc xử lý ngắt quãng với `queueMicrotask` / `setImmediate`.

---

## 4. File Code Thực Hành

- [01-js-errors-demo.js](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/01-js-errors-demo.js): Code thực nghiệm kích hoạt và bắt toàn bộ 7 kiểu lỗi chuẩn (`ReferenceError`, `TypeError`, `RangeError`, `SyntaxError`, `URIError`, `AggregateError`), kiểm chứng cơ chế TDZ, và mô phỏng Stack Overflow an toàn. Chạy bằng: `node 01-js-errors-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Khối `try...catch` có thể bắt được lỗi `SyntaxError` trong trường hợp nào?**
   *Đáp án:* Chỉ bắt được `SyntaxError` khi việc phân tích cú pháp diễn ra tại thời điểm thực thi (Runtime Parsing), ví dụ như khi gọi `JSON.parse(invalidString)`, `eval(invalidCodeString)`, hoặc `new Function(invalidCodeString)`. Lỗi cú pháp nằm trực tiếp trong mã nguồn tĩnh của script sẽ khiến script bị từ chối trước khi thực thi nên không thể bắt bằng `try...catch` cùng khối.

2. **Khi nào một lỗi `AggregateError` xuất hiện trong JavaScript hiện đại?**
   *Đáp án:* `AggregateError` xuất hiện từ ES2021, chủ yếu khi làm việc với `Promise.any()`. Nếu tất cả các Promise truyền vào `Promise.any()` đều bị reject, nó sẽ ném ra một instance của `AggregateError` chứa thuộc tính `.errors` là một mảng tập hợp toàn bộ các lý do reject của từng promise.
