# Bản Chất Bất Đồng Bộ & Vòng Lặp Sự Kiện (Event Loop)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [02-functions-and-scope/01-declarations-vs-expressions.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/01-declarations-vs-expressions.md) (Call Stack & Khung hàm Execution Context).
  - [06-dom-and-web-apis/03-html-events-and-delegation.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/03-html-events-and-delegation.md) (Hệ thống Dispatch sự kiện của trình duyệt).
- **Khái niệm tương quan**:
  - **Single-Threaded Concurrency**: JavaScript Engine (V8) chỉ có một luồng duy nhất (Single Thread) để thực thi mã nguồn. Sự đồng thời (Concurrency) đạt được nhờ sự phối hợp giữa Call Stack và hệ thống Web APIs / Libuv chạy đa luồng ngầm ở tầng C++.
  - **Event Loop Starvation**: Hiện tượng một hàng đợi Microtask đệ quy vô hạn chiếm trọn CPU, khiến trình duyệt không bao giờ có thể Paint lại giao diện hoặc xử lý tương tác của người dùng.
- **Điểm đến tiếp theo**:
  - [02-promises-and-combinators.md](file:///d:/my-project/revision-document/javascript/09-asynchronous-javascript/02-promises-and-combinators.md) (Lời hứa Promise & Bộ tứ Combinators).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Kiến Trúc Vòng Lặp Sự Kiện (Event Loop Architecture)

```
+-------------------------------------------------------------------------------+
|                       V8 ENGINE (MAIN THREAD)                                 |
|                                                                               |
|  +--------------------+                     +------------------------------+  |
|  |    MEMORY HEAP     |                     |          CALL STACK          |  |
|  |  (Cấp phát Object) |                     |   functionB()                |  |
|  |                    |                     |   functionA()                |  |
|  +--------------------+                     +------------------------------+  |
+-------------------------------------------------------------|-----------------+
                                                              | Gặp tác vụ bất đồng bộ
                                                              v
+-------------------------------------------------------------------------------+
|                      HOST ENVIRONMENT (WEB APIS / LIBUV)                      |
|            - Timer Thread: setTimeout, setInterval                            |
|            - Network Thread: fetch, XMLHttpRequest, socket                    |
|            - File / I/O Thread: fs.readFile                                   |
+-------------------------------------------------------------------------------+
                                                              |
                                           Đẩy callback vào   |
                                                              v
+------------------------------------+      +-----------------------------------+
|          MICROTASK QUEUE           |      |          MACROTASK QUEUE          |
|  (ĐỘ ƯU TIÊN CAO TUYỆT ĐỐI)        |      |       (Task Queue thông thường)   |
|  - Promise.then / catch / finally  |      |  - setTimeout / setInterval       |
|  - queueMicrotask()                |      |  - I/O events                     |
|  - MutationObserver                |      |  - setImmediate (Node.js)         |
+------------------------------------+      +-----------------------------------+
                  |                                           |
                  +-------------------+   +-------------------+
                                      |   |
                                      v   v
+-------------------------------------------------------------------------------+
|                                  EVENT LOOP                                   |
|  1. Chờ cho Call Stack rỗng hoàn toàn.                                        |
|  2. Rút và thực thi TOÀN BỘ Microtasks cho đến khi Microtask Queue RỖNG SẠCH. |
|  3. Kích hoạt Render Pipeline (nếu ở trình duyệt: rAF -> Reflow -> Paint).    |
|  4. Rút duy nhất 1 Macrotask từ Macrotask Queue và đẩy vào Call Stack.        |
|  5. Lặp lại bước 1.                                                           |
+-------------------------------------------------------------------------------+
```

### 2.2. Sự Khác Biệt Cốt Tử Giữa Microtask và Macrotask
- **Microtask**: Được giải quyết **ngay lập tức sau khi Call Stack hiện tại rỗng**, TRƯỚC KHI trình duyệt vẽ lại khung hình (Paint) và TRƯỚC BẤT KỲ Macrotask nào khác.
- **Macrotask**: Mỗi vòng lặp Event Loop chỉ xử lý **duy nhất 1 Macrotask**, sau đó phải nhường quyền lại để kiểm tra Microtask và Render.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Nghẽn Trình Duyệt Bằng Microtask Vô Hạn (Event Loop Starvation)
```javascript
// ❌ THẢM HỌA: Làm đơ tab trình duyệt vĩnh viễn!
function infiniteMicrotask() {
  Promise.resolve().then(infiniteMicrotask);
}
infiniteMicrotask();
// Vì Event Loop luôn ưu tiên dọn sạch Microtask Queue trước khi làm việc khác,
// hàng đợi này không bao giờ rỗng -> Trình duyệt không thể Paint, không nhận click chuột!

// ✅ ĐÚNG: Nếu cần chạy nền không khóa UI, hãy dùng Macrotask (setTimeout)
function safeLoop() {
  setTimeout(safeLoop, 0); // Nhường quyền cho Render và các tương tác khác giữa các tick
}
```

### Bẫy 2: Thảm Họa Lồng Callback (Callback Hell / Pyramid of Doom)
```javascript
// ❌ ANTI-PATTERN: Khó đọc, bắt lỗi cực kỳ phức tạp
getUser(userId, (err, user) => {
  if (err) return handleError(err);
  getOrders(user.id, (err, orders) => {
    if (err) return handleError(err);
    getOrderDetails(orders[0].id, (err, details) => {
      // Tháp tam giác lồng sâu không thể kiểm soát!
    });
  });
});

// ✅ ĐÚNG: Chuyển đổi sang Promise Chaining hoặc async/await
```

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [01-callbacks-demo.js](file:///d:/my-project/revision-document/javascript/09-asynchronous-javascript/01-callbacks-demo.js)

### Tự Xây Dựng Hàm `promisify` Chuẩn Node.js
```javascript
function customPromisify(originalFunction) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      // Callback theo chuẩn Node: (err, data) => {}
      originalFunction(...args, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };
}

// Giả lập hàm callback truyền thống:
function fetchUserCallback(id, callback) {
  setTimeout(() => {
    if (id <= 0) callback(new Error("ID không hợp lệ"), null);
    else callback(null, { id, name: "Admin" });
  }, 100);
}

// Nâng cấp thành Promise hiện đại:
const fetchUser = customPromisify(fetchUserCallback);
const user = await fetchUser(10);
console.log(user); // { id: 10, name: 'Admin' }
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Thứ tự in ra console của đoạn mã sau là gì và tại sao:
```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3")).then(() => console.log("4"));
console.log("5");
```
<details>
<summary><b>Lời giải chi tiết</b></summary>

- **Kết quả in ra**: `1`, `5`, `3`, `4`, `2`.
- **Giải thích chi tiết**:
  1. `console.log("1")` chạy đồng bộ trên Call Stack -> In `1`.
  2. `setTimeout(..., 0)` đăng ký một Macrotask vào Task Queue.
  3. `Promise.resolve().then(...)` đẩy callback in `3` vào Microtask Queue.
  4. `console.log("5")` chạy đồng bộ trên Call Stack -> In `5`.
  5. Call Stack rỗng. Event Loop kiểm tra **Microtask Queue** trước tiên:
     - Chạy microtask 1: In `3`, trả về Promise mới và đẩy callback in `4` vào cuối hàng đợi Microtask.
     - Tiếp tục dọn sạch Microtask Queue: Chạy microtask 2 -> In `4`.
  6. Toàn bộ Microtask đã rỗng. Event Loop chuyển sang **Macrotask Queue**:
     - Lấy `setTimeout` callback -> In `2`.
</details>

### Câu 2: Trong Node.js, `process.nextTick()` khác biệt như thế nào so với `queueMicrotask()` hay `Promise.then()`?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- `process.nextTick()` không thuộc chuẩn Web API mà là tính năng đặc thù của Node.js.
- Hàng đợi của `process.nextTick()` có mức ưu tiên **cao hơn cả Microtask Queue thông thường**. Mỗi khi Call Stack vừa kết thúc, Node.js sẽ dọn dẹp sạch sẽ toàn bộ hàng đợi `nextTick` trước khi chuyển sang xử lý các Microtasks (Promise/queueMicrotask).
</details>
