# Nghệ Thuật Debug & Công Cụ DevTools (JavaScript Debugging & DevTools Mastery)

Tài liệu chuyên sâu về kỹ thuật gỡ lỗi trong JavaScript: Bộ công cụ Console API nâng cao (`table`, `trace`, `time/timeEnd`, `group`), câu lệnh `debugger` và cơ chế ngắt nhịp thực thi của V8 Engine, các loại điểm dừng Breakpoint trong DevTools, và kỹ thuật dò vết Call Stack bất đồng bộ (Async Stack Traces).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-js-errors-and-built-in-types.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/01-js-errors-and-built-in-types.md) (Ngăn xếp Call Stack và Exception).
  - [04-custom-error-objects-and-hierarchy.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/04-custom-error-objects-and-hierarchy.md) (Đối tượng Error và Stack Trace).
- **Mở rộng tiếp theo (Next Steps):**
  - [06-error-and-debugging-reference.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/06-error-and-debugging-reference.md) (Bảng tra cứu toàn tập Error & Debugging).
  - Giám sát hiệu năng Performance Profiling trong Chrome DevTools.
- **Khái niệm liên quan (Related):**
  - Câu lệnh `debugger` và giao thức Chrome DevTools Protocol (CDP).
  - Node.js Inspector (`node --inspect`).
  - Vết ngăn xếp bất đồng bộ (Async Stack Traces).

---

## 2. Bản Chất Hoạt Động (Mental Model: Điểm Dừng & Ngăn Xếp V8)

### 1. Câu Lệnh `debugger` & Điểm Ngắt Thực Thi (Breakpoints)
Khi V8 Engine bắt gặp từ khóa **`debugger`**:
- Nếu DevTools hoặc Debugger (VSCode, Chrome) đang mở: V8 **tạm dừng hoàn toàn luồng thực thi (freeze execution)** tại dòng đó, tương đương việc đặt một Breakpoint thủ công.
- Toàn bộ trạng thái bộ nhớ, giá trị biến trong Local Scope, Closure Scope, và Call Stack được giữ nguyên để lập trình viên kiểm tra.
- Nếu DevTools không mở: Câu lệnh `debugger` bị lờ đi hoàn toàn và chương trình chạy tiếp bình thường (tuy nhiên vẫn là bad practice nếu để sót lên môi trường Production).

---

### 2. Các Loại Breakpoint Trong Chrome DevTools

| Loại Breakpoint | Mô tả | Ứng dụng tối ưu |
| :--- | :--- | :--- |
| **Line Breakpoint** | Dừng tại dòng mã chỉ định | Dò vết luồng logic tuần tự |
| **Conditional Breakpoint** | Chỉ dừng khi một biểu thức logic thỏa mãn `true` | Debug vòng lặp lớn (ví dụ `i === 9999`) |
| **Logpoint** | In log ra console mà không làm dừng chương trình | Tránh phải sửa mã nguồn để chèn `console.log` |
| **DOM Mutation Breakpoint** | Dừng khi một node DOM bị xóa, thêm con, hoặc sửa thuộc tính | Tìm hàm JavaScript nào đang bí mật sửa DOM |
| **XHR/Fetch Breakpoint** | Dừng khi có request mạng gửi tới URL khớp mẫu | Bắt các lệnh gọi API gửi sai payload |
| **Event Listener Breakpoint** | Dừng khi một sự kiện cụ thể kích hoạt (click, keydown) | Truy vết event handler của component |

---

### 3. Bộ Công Cụ Console API Nâng Cao

Ngoài `console.log`, chuẩn Console Object cung cấp các API chuyên dụng:

- **`console.table(data)`**: Hiển thị mảng các đối tượng dưới dạng bảng kẻ cột trực quan.
- **`console.trace(label)`**: In toàn bộ Call Stack tại thời điểm hiện tại **mà không cần ném lỗi**.
- **`console.time(label)` & `console.timeEnd(label)`**: Đo thời gian thực thi chính xác đến mili-giây (micro-benchmarking).
- **`console.group(label)` & `console.groupEnd()`**: Gom nhóm các log liên quan theo phân cấp cây thu gọn được.
- **`console.assert(condition, message)`**: Chỉ in cảnh báo lỗi ra màn hình khi `condition` là **falsy** (không làm gián đoạn chương trình).

---

### 4. Async Call Stacks (Dấu Vết Ngăn Xếp Bất Đồng Bộ)
Trong JavaScript cổ điển, khi một lỗi ném ra bên trong callback bất đồng bộ (`setTimeout` hoặc Promise), Call Stack chỉ hiển thị từ ranh giới của Event Loop, làm mất hoàn toàn nguồn gốc hàm gọi ban đầu.

V8 Engine hiện đại đã tích hợp **Zero-Cost Async Stack Traces**:
- Tự động liên kết các chuỗi Promise (`.then`, `await`) xuyên qua các chu kỳ Event Loop.
- Giúp bạn nhìn thấy cả hàm đã kích hoạt tác vụ bất đồng bộ nằm ở đâu trong quá khứ!

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy để sót `console.log` và `debugger` lên Production
- Câu lệnh `debugger` có thể khiến trang web của khách hàng bị đơ nếu người dùng vô tình mở F12.
- Việc gọi `console.log` với các đối tượng khổng lồ có thể giữ chặt tham chiếu bộ nhớ trong DevTools, gây hiện tượng **Memory Leak**.
- ➔ **Giải pháp:** Sử dụng ESLint rule `no-debugger`, `no-console` và plugin Terser / Rollup / Webpack để tự động xóa sạch log/debugger khi build bundle production.

### 2. Bẫy Promise Rejection bị bỏ quên (Unhandled Rejection)
Nếu một Promise bị reject mà không có khối `.catch()` hoặc `try...catch`:
```javascript
async function doTask() {
  throw new Error("Lỗi mạng!");
}
doTask(); // BẪY: UnhandledPromiseRejection!
```
➔ **Giải pháp:** Luôn bắt sự kiện toàn cục để phòng vệ:
- Trình duyệt: `window.addEventListener("unhandledrejection", (e) => ...)`
- Node.js: `process.on("unhandledRejection", (reason, promise) => ...)`

---

## 4. File Code Thực Hành

- [05-debugging-demo.js](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/05-debugging-demo.js): Code thực nghiệm toàn bộ Console API nâng cao (`table`, `time/timeEnd`, `trace`, `assert`), mô phỏng ngắt nhịp `debugger`, và xử lý sự kiện bất đồng bộ `unhandledRejection`. Chạy bằng: `node 05-debugging-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Sự khác biệt giữa `console.assert(condition, msg)` và `assert.strictEqual()` của Node.js là gì?**
   *Đáp án:* `assert.strictEqual()` của thư viện `assert` sẽ ném ra một ngoại lệ `AssertionError` và làm dừng chương trình ngay lập tức nếu điều kiện sai. Ngược lại, `console.assert()` của trình duyệt/console chỉ ghi một dòng thông báo lỗi màu đỏ vào tab Console mà hoàn toàn không ném lỗi hay làm dừng luồng thực thi của script.

2. **Cơ chế Conditional Breakpoint trong DevTools hoạt động như thế nào và mang lại lợi ích gì khi debug?**
   *Đáp án:* Conditional Breakpoint cho phép lập trình viên gắn kèm một biểu thức JavaScript (ví dụ `user.id === 505` hoặc `items.length === 0`). V8 chỉ dừng thực thi khi biểu thức đó đánh giá thành `truthy`. Điều này giúp tiết kiệm thời gian, loại bỏ việc phải bấm nút "Resume/Next" hàng nghìn lần trong các vòng lặp lớn.
