# Cú Pháp Async / Await & Xử Lý Lỗi Bất Đồng Bộ

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [02-promises-and-combinators.md](file:///d:/my-project/revision-document/javascript/09-asynchronous-javascript/02-promises-and-combinators.md) (Trạng thái Promise & Chuỗi Chaining).
  - [03-data-structures/13-iterators-and-generators.md](file:///d:/my-project/revision-document/javascript/03-data-structures/13-iterators-and-generators.md) (Generators & Coroutines).
- **Khái niệm tương quan**:
  - **Syntactic Sugar over Co-routines**: `async/await` bản chất là lớp vỏ cú pháp (Syntactic Sugar) bọc quanh sự kết hợp giữa **Generators (`function*` / `yield`)** và **Promises**, được thực thi bởi một bộ điều phối ngầm (Co-routine Runner) trong C++ của V8.
  - **Async Stack Traces**: V8 cải tiến khả năng theo dõi vết ngăn xếp qua các điểm dừng `await` mà không bị đứt đoạn như mô hình callback cổ điển.
- **Điểm đến tiếp theo**:
  - [04-fetch-and-abort-controller.md](file:///d:/my-project/revision-document/javascript/09-asynchronous-javascript/04-fetch-and-abort-controller.md) (Fetch API & Quản lý Hủy Request).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Quy Tắc Hoạt Động Cốt Lõi Của `async` và `await`
1. **Từ khóa `async`**:
   - Đặt trước khai báo hàm (`async function`).
   - Ép buộc giá trị trả về của hàm **luôn luôn là một Promise**. Nếu bạn `return 10`, V8 tự động bọc thành `Promise.resolve(10)`.
2. **Từ khóa `await`**:
   - Chỉ được phép sử dụng bên trong hàm `async` (hoặc ở cấp cao nhất của ES Module).
   - Tạm dừng (suspend) việc thực thi hàm `async` hiện tại và nhường lại quyền điều khiển Main Thread cho Event Loop.
   - Khi Promise được `await` giải quyết xong (Settled), hàm sẽ được đánh thức và tiếp tục chạy từ vị trí đã dừng với giá trị kết quả được giải nén ra.

### 2.2. So Sánh: Thực Thi Tuần Tự (Sequential) vs Song Song (Parallel)

```
A. TUẦN TỰ (Sequential): Bẫy nghẽn hiệu năng
await taskA(); // Mất 1s
await taskB(); // Mất 1s (Chờ taskA xong mới bắt đầu!)
===> TỔNG THỜI GIAN = 2 giây!

B. SONG SONG (Parallel): Tối ưu hóa tối đa
const promiseA = taskA(); // Bắt đầu chạy ngay lập tức
const promiseB = taskB(); // Bắt đầu chạy ngay lập tức
const [resA, resB] = await Promise.all([promiseA, promiseB]);
===> TỔNG THỜI GIAN = 1 giây (Bằng thời gian của task dài nhất)!
```

### 2.3. Cơ Chế Xử Lý Lỗi Tập Trung Với `try..catch..finally`
Khác với mô hình `.catch()` của Promise dễ bị bỏ quên, `async/await` cho phép đồng bộ hóa hoàn toàn cách bắt lỗi:
- Bất kỳ Promise nào bị `reject` sẽ được biến đổi thành một ngoại lệ (Exception) bình thường và rơi thẳng vào khối `catch (err)`.
- Khối `finally` đảm bảo 100% tài nguyên (như tắt loading spinner, đóng file kết nối) sẽ luôn được dọn dẹp sạch sẽ.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Dùng `await` Bên Trong Callback Của `Array.prototype.forEach`
```javascript
// ❌ THẢM HỌA HIỆU NĂNG & LOGIC: forEach KHÔNG CHỜ async callback!
async function processUsers(userIds) {
  userIds.forEach(async (id) => {
    await deleteUserFromDb(id);
  });
  console.log("Xóa hoàn tất!"); // CHẠY NGAY LẬP TỨC TRƯỚC KHI CÁC USER BỊ XÓA XONG!
}

// ✅ ĐÚNG 1: Nếu muốn xóa tuần tự từng user:
for (const id of userIds) {
  await deleteUserFromDb(id);
}

// ✅ ĐÚNG 2: Nếu muốn xóa song song đồng thời:
await Promise.all(userIds.map(id => deleteUserFromDb(id)));
```

### Bẫy 2: Lỗi Bất Đồng Bộ Bị Nuốt Chửng (Unhandled Promise Rejection)
- Nếu gọi một hàm `async` mà quên không `await` hoặc không có `.catch()`:
  ```javascript
  saveAnalyticsData(); // Lỗi mạng xảy ra bên trong hàm này sẽ văng UnhandledPromiseRejection!
  ```
- Trong Node.js hiện đại, Unhandled Rejection chưa bắt sẽ khiến **tiến trình Node.js lập tức bị crash (Exit code 1)**!

### Bẫy 3: Nghẽn CPU Do `await` Vô Căn Cứ Các Tác Vụ Độc Lập
- Khi gọi 3 API độc lập (ví dụ: lấy cấu hình, lấy danh sách bạn bè, lấy thông báo): Viết 3 dòng `await` liên tiếp sẽ làm trang web tải chậm gấp 3 lần. Luôn gom bằng `Promise.all()`.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [03-async-await-demo.js](file:///d:/my-project/revision-document/javascript/09-asynchronous-javascript/03-async-await-demo.js)

### Pattern Production: Tự Động Thử Lại Có Giãn Cách Lũy Thừa (Exponential Backoff Retry)
```javascript
async function fetchWithRetry(fn, retries = 3, delayMs = 500) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 1) {
      throw new Error(`Đã thử ${3} lần nhưng đều thất bại: ${err.message}`);
    }
    console.warn(`Thử lại sau ${delayMs}ms... (Còn ${retries - 1} lần)`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
    // Giãn cách lũy thừa: gấp đôi thời gian chờ mỗi lần thử lại
    return fetchWithRetry(fn, retries - 1, delayMs * 2);
  }
}

// Giả lập API chập chờn
let attempts = 0;
async function flakyApi() {
  attempts++;
  if (attempts < 3) throw new Error("503 Service Unavailable");
  return { success: true, data: "Dữ liệu máy chủ" };
}

const result = await fetchWithRetry(flakyApi, 4, 100);
console.log(result); // { success: true, data: 'Dữ liệu máy chủ' }
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao đoạn mã `return await promise;` bên trong một hàm `async` thường bị coi là dư thừa, nhưng trong trường hợp nào thì nó lại BẮT BUỘC phải có?
<details>
<summary><b>Lời giải chi tiết</b></summary>

1. **Khi nằm ngoài khối `try..catch`**: Viết `return await promise;` là dư thừa, vì bản thân hàm `async` đã tự động bọc bất kỳ giá trị trả về nào thành một Promise (`return promise;` là đủ). Bỏ bớt `await` giúp loại bỏ một tick trung gian không cần thiết trong Microtask Queue.
2. **Khi nằm BÊN TRONG khối `try..catch`**: Viết `return await promise;` là **BẮT BUỘC**!
   - Nếu bạn viết `return promise;`, Promise đó được trả về cho Caller trước khi nó kịp Resolve/Reject. Khối `catch` cục bộ của hàm sẽ **hoàn toàn bị bỏ qua**, không bắt được lỗi!
   - Viết `return await promise;` ép buộc hàm phải chờ kết quả ngay tại chỗ, giúp khối `catch` cục bộ bắt được lỗi nếu Promise bị reject.
</details>

### Câu 2: Tính năng Top-Level Await hoạt động như thế nào trong ES Modules và nó giải quyết bài toán gì?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Trước ES2022, từ khóa `await` chỉ được phép nằm bên trong thân hàm `async`. Muốn khởi tạo tài nguyên ở cấp cao nhất của file, lập trình viên bắt buộc phải dùng hàm IIFE: `(async () => { await initDb(); })();`. Điều này khiến các file import khác có thể sử dụng database trước khi nó được kết nối hoàn tất.
- **Top-Level Await**: Cho phép viết trực tiếp `await connectDb();` ở cấp cao nhất của file Module. Trình duyệt/Node.js sẽ **tạm dừng việc nạp các module phụ thuộc** cho đến khi Promise của module đó được giải quyết thành công, đảm bảo tài nguyên hệ thống luôn được nạp đầy đủ trước khi ứng dụng chạy.
</details>
