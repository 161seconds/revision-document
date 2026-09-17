# Lời Hứa & Bộ Tứ Gom Tụ Bất Đồng Bộ (Promises & Combinators)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-callbacks-and-event-loop.md](file:///d:/my-project/revision-document/javascript/09-asynchronous-javascript/01-callbacks-and-event-loop.md) (Microtasks & Call Stack).
  - [04-error-handling-and-debugging/01-js-errors-and-built-in-types.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/01-js-errors-and-built-in-types.md) (Cơ chế ném lỗi & AggregateError).
- **Khái niệm tương quan**:
  - **Promises/A+ Specification**: Chuẩn mực công nghiệp quốc tế quy định hành vi của phương thức `.then()`, chuỗi xử lý (Chaining) và giải quyết giá trị (Resolution Procedure).
  - **Settled vs Resolved**: Một Promise được gọi là `Settled` khi nó không còn ở trạng thái `Pending` (đã là `Fulfilled` hoặc `Rejected`).
- **Điểm đến tiếp theo**:
  - [03-async-await-and-error-handling.md](file:///d:/my-project/revision-document/javascript/09-asynchronous-javascript/03-async-await-and-error-handling.md) (Cú pháp async/await hiện đại).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Cỗ Máy Trạng Thái Của Promise (State Machine)
Một đối tượng `Promise` trong V8 Engine có 3 trạng thái bất biến sau khi chuyển đổi:

```
                  +-----------------------------------+
                  |             PENDING               |
                  | (Đang chờ xử lý kết quả mạng/I/O) |
                  +-----------------------------------+
                                    |
                   +----------------+----------------+
                   |                                 |
                   v (resolve)                       v (reject)
+------------------------------------+   +------------------------------------+
|             FULFILLED              |   |              REJECTED              |
| (Thành công - Lưu trữ Result Value)|   | (Thất bại - Lưu trữ Reason Error)  |
+------------------------------------+   +------------------------------------+
```
- **Quy tắc bất biến**: Một khi Promise đã chuyển sang `Fulfilled` hoặc `Rejected`, trạng thái và giá trị của nó **vĩnh viễn bị đóng băng** (không thể chuyển đổi lần thứ hai).

### 2.2. So Sánh Bản Chất Bộ Tứ Combinators

| Phương thức | Khi nào Resolve? | Khi nào Reject? | Ứng dụng thực tế |
| :--- | :--- | :--- | :--- |
| **`Promise.all`** | Khi **TẤT CẢ** đều thành công | **NGAY KHI CÓ 1 LỖI** (Fail-fast) | Tải toàn bộ tài nguyên bắt buộc của trang |
| **`Promise.allSettled`** | Khi **TẤT CẢ ĐÃ XONG** (thành công hoặc lỗi) | **KHÔNG BAO GIỜ REJECT** | Gửi hàng loạt email, dọn dẹp các dịch vụ nền |
| **`Promise.race`** | Ngay khi có **1 PROMISE VỀ ĐÍCH ĐẦU TIÊN** (dù thành công hay lỗi) | Ngay khi có **1 PROMISE BỊ LỖI ĐẦU TIÊN** | Cài đặt thời gian chờ tối đa (Request Timeout) |
| **`Promise.any`** | Ngay khi có **1 PROMISE THÀNH CÔNG ĐẦU TIÊN** | Khi **TẤT CẢ ĐỀU LỖI** (`AggregateError`) | Lấy dữ liệu từ nhiều cụm máy chủ sao lưu (Mirrors) |

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Cạm Bẫy Quên `return` Trong Chuỗi `.then()` (Broken Chain)
```javascript
// ❌ SAI LẦM: Không return khiến then tiếp theo nhận undefined
fetchUser(id)
  .then(user => {
    fetchOrders(user.id); // QUÊN RETURN PROMISE NÀY!
  })
  .then(orders => {
    console.log(orders); // undefined! Vì hàm then trước không trả về giá trị gì!
  });

// ✅ ĐÚNG: Luôn return Promise tiếp theo để chuỗi tiếp nối
fetchUser(id)
  .then(user => fetchOrders(user.id))
  .then(orders => console.log(orders)); // Nhận danh sách orders chuẩn xác
```

### Bẫy 2: Dùng `Promise.all` Cho Danh Sách Tác Vụ Độc Lập Không Muốn Bị Hủy Ngang
- Nếu bạn tải 10 ảnh đại diện của người dùng bằng `Promise.all`: Nếu chỉ duy nhất 1 ảnh bị lỗi 404, toàn bộ `Promise.all` sẽ lập tức bị Reject và hủy bỏ 9 ảnh thành công còn lại.
- **Giải pháp**: Luôn dùng `Promise.allSettled` cho các tác vụ độc lập để lấy toàn bộ dữ liệu thành công kèm danh sách các phần tử bị lỗi để hiển thị fallback.

### Bẫy 3: Tạo Promise Constructor Không Cần Thiết (Promise Constructor Antipattern)
```javascript
// ❌ RƯỜM RÀ / ANTI-PATTERN: Bọc Promise trong new Promise
function getUser() {
  return new Promise((resolve, reject) => {
    fetch("/api/user")
      .then(res => resolve(res.json()))
      .catch(err => reject(err));
  });
}

// ✅ ĐÚNG: Trả về trực tiếp chuỗi Promise có sẵn
function getUser() {
  return fetch("/api/user").then(res => res.json());
}
```

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [02-promises-demo.js](file:///d:/my-project/revision-document/javascript/09-asynchronous-javascript/02-promises-demo.js)

### Pattern Production: Đặt Thời Gian Chờ (Timeout) Cho Request Bằng `Promise.race`
```javascript
function withTimeout(promise, ms) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Tác vụ bị quá thời gian giới hạn (${ms}ms)`));
    }, ms);
  });

  // Ai về đích trước sẽ quyết định kết quả
  return Promise.race([promise, timeoutPromise]);
}

// Giả lập API phản hồi sau 3 giây
const slowApi = new Promise(resolve => setTimeout(() => resolve("Dữ liệu lớn"), 3000));

try {
  // Đặt giới hạn timeout 1000ms
  const data = await withTimeout(slowApi, 1000);
  console.log(data);
} catch (err) {
  console.error("Xử lý ngoại lệ:", err.message); // "Tác vụ bị quá thời gian giới hạn (1000ms)"
}
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Điểm khác biệt căn bản giữa `Promise.all` và `Promise.allSettled` khi một trong các Promise đầu vào bị Reject là gì?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- `Promise.all`: Hoạt động theo cơ chế **Fail-fast**. Ngay khoảnh khắc có một Promise bất kỳ bị Reject, `Promise.all` lập tức chuyển sang trạng thái Rejected với lý do lỗi đó mà không thèm chờ các Promise còn lại kết thúc.
- `Promise.allSettled`: **Kiên nhẫn chờ cho đến khi 100% các Promise trong mảng đều kết thúc** (dù thành công hay thất bại). Nó luôn chuyển sang trạng thái Fulfilled và trả về một mảng các đối tượng chứa thông tin trạng thái chi tiết của từng promise: `{ status: "fulfilled", value }` hoặc `{ status: "rejected", reason }`.
</details>

### Câu 2: Trong phương thức `.then(onFulfilled, onRejected)`, việc bắt lỗi bằng tham số thứ hai `onRejected` có tương đương với việc dùng `.catch(onRejected)` nối phía sau không?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- **Hoàn toàn KHÔNG tương đương!**
- Nếu truyền `onRejected` làm tham số thứ hai của `.then(fnA, fnErr)`: Nó chỉ có thể bắt được lỗi xảy ra từ **Promise trước đó**. Nếu chính hàm `fnA` bị ném lỗi, `fnErr` sẽ hoàn toàn bất lực không thể bắt được lỗi đó.
- Nếu dùng `.then(fnA).catch(fnErr)`: Hàm `.catch()` nằm phía sau trong chuỗi Promise Chain, do đó nó bắt được **cả lỗi từ Promise trước đó lẫn bất kỳ lỗi runtime nào phát sinh từ bên trong chính hàm `fnA`**. Vì vậy, chuẩn Clean Code luôn khuyến nghị dùng `.catch()`.
</details>
