# Giao Thức Mạng Fetch API & Hủy Tác Vụ Bằng AbortController

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [03-async-await-and-error-handling.md](file:///d:/my-project/revision-document/javascript/09-asynchronous-javascript/03-async-await-and-error-handling.md) (Xử lý bất đồng bộ với async/await).
  - [06-dom-and-web-apis/06-dom-and-events-reference.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/06-dom-and-events-reference.md) (Quản lý Event Listener bằng AbortSignal).
- **Khái niệm tương quan**:
  - **HTTP Stream Processing**: Fetch API hoạt động dựa trên luồng dữ liệu (ReadableStream), cho phép ứng dụng đọc dữ liệu theo từng chunk (chunked transfer) thay vì phải chờ toàn bộ payload tải xong vào bộ nhớ RAM.
  - **Race Condition in Search UI**: Tình trạng phản hồi của yêu cầu tìm kiếm cũ (gõ chậm hơn nhưng xử lý lâu) đè lên kết quả của yêu cầu tìm kiếm mới nhất, làm sai lệch dữ liệu hiển thị.
- **Điểm đến tiếp theo**:
  - Module 10: Lập trình Hướng Đối Tượng & Chuỗi Prototype (`10-oop-and-prototypes/`).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Bản Chất Hoạt Động Của Fetch API (Hai Tầng Promise)
Lệnh `fetch()` không trả về dữ liệu JSON ngay lập tức mà trải qua **2 giai đoạn bất đồng bộ riêng biệt**:

```
[Client] ---> fetch(url)
                 |
                 v Tầng 1: Đọc HTTP Headers
[Máy chủ gửi mã trạng thái: 200/404/500 và Headers]
                 |
                 v Trả về đối tượng Response (res.ok, res.status)
[Client] ---> res.json() / res.text()
                 |
                 v Tầng 2: Đọc ReadableStream phần thân (Body)
[Toàn bộ payload dữ liệu tải về và phân tích cú pháp]
```

- **Đặc điểm sống còn**: `fetch()` **CHỈ REJECT** khi có sự cố mạng ở tầng phần cứng (mất mạng, DNS thất bại, chặn CORS). Nếu máy chủ trả về mã lỗi HTTP `404 Not Found` hoặc `500 Internal Server Error`, Promise của `fetch()` **VẪN RESOLVE THÀNH CÔNG**! Bạn bắt buộc phải kiểm tra cờ `res.ok`.

### 2.2. Giao Thức Khóa Luồng Đọc (`bodyUsed` Protocol)
Đối tượng `Response` trong Fetch API là một luồng (Stream) chỉ đọc được một lần duy nhất:
- Sau khi bạn gọi `res.json()` hoặc `res.text()`, thuộc tính boolean `res.bodyUsed` sẽ chuyển thành `true`.
- Nếu tiếp tục gọi `res.text()` lần thứ hai trên cùng đối tượng đó, trình duyệt sẽ ném lỗi ngay lập tức:
  `TypeError: Failed to execute 'text' on 'Response': body stream already read`
- Muốn đọc nhiều lần: Bắt buộc phải nhân bản trước bằng `const cloneRes = res.clone()`.

### 2.3. Cỗ Máy Hủy Tác Vụ Bằng `AbortController`
- `const controller = new AbortController()` tạo ra một cặp:
  - `controller.signal`: Đối tượng `AbortSignal` gắn vào option của `fetch({ signal })`.
  - `controller.abort()`: Lệnh phát tín hiệu hủy.
- Khi gọi `controller.abort()`: Trình duyệt ngay lập tức ngắt kết nối TCP socket ở tầng mạng bên dưới, tiết kiệm băng thông và ném ra lỗi `AbortError` (`DOMException`) bên trong Promise.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Không Kiểm Tra `res.ok` Dẫn Đến Ứng Dụng Xử Lý Dữ Liệu Rác
```javascript
// ❌ SAI LẦM: Coi mã lỗi 404/500 là thành công
const res = await fetch("/api/users/999");
const data = await res.json(); // Nếu server trả về trang lỗi HTML 404, dòng này ném SyntaxError!

// ✅ ĐÚNG: Luôn kiểm tra res.ok trước khi đọc body
const res = await fetch("/api/users/999");
if (!res.ok) {
  throw new Error(`Máy chủ phản hồi mã lỗi HTTP: ${res.status} (${res.statusText})`);
}
const data = await res.json();
```

### Bẫy 2: Xung Đột Dữ Liệu Tìm Kiếm (Race Condition Trong Search Autocomplete)
- Người dùng gõ chữ "r" (Request 1 mất 500ms để tìm).
- Người dùng gõ tiếp "react" (Request 2 mất 100ms để tìm).
- Request 2 trả về kết quả trước, bảng danh sách hiện kết quả "react".
- 400ms sau, Request 1 mới trả về kết quả -> **Đè toàn bộ màn hình thành kết quả của chữ "r"**!
- **Giải pháp**: Luôn gọi `controller.abort()` của request tìm kiếm trước đó ngay khi người dùng gõ ký tự mới.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [04-fetch-abort-demo.js](file:///d:/my-project/revision-document/javascript/09-asynchronous-javascript/04-fetch-abort-demo.js)

### Hàm Fetch Chuẩn Doanh Nghiệp Kèm Timeout Tự Động & Hủy Thủ Công
```javascript
async function enterpriseFetch(url, { timeoutMs = 5000, ...options } = {}) {
  // Tạo signal tự động ngắt theo thời gian timeout
  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  // Kết hợp signal của người dùng (nếu có) với timeoutSignal bằng AbortSignal.any (ES2024)
  const combinedSignal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  try {
    const res = await fetch(url, { ...options, signal: combinedSignal });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    if (err.name === "TimeoutError") {
      console.error(`Yêu cầu mạng tới ${url} bị quá thời gian giới hạn (${timeoutMs}ms)!`);
    } else if (err.name === "AbortError") {
      console.warn("Yêu cầu mạng đã bị người dùng hủy bỏ.");
    }
    throw err;
  }
}
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao việc gọi `fetch()` khi máy chủ trả về mã HTTP 500 lại KHÔNG làm Promise rơi vào khối `catch`?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Theo đặc tả Fetch Specification của W3C, Promise trả về từ `fetch()` chỉ bị **Rejected** khi có lỗi xảy ra ở mức độ **Truyền dẫn mạng (Network Level)** khiến trình duyệt không thể hoàn tất chu trình bắt tay HTTP (ví dụ: máy tính bị ngắt kết nối Internet, tên miền DNS không tồn tại, kết nối TLS/SSL bị từ chối, hoặc bị vi phạm chính sách CORS).
- Khi máy chủ gửi về mã phản hồi `500 Internal Server Error`, việc giao tiếp HTTP giữa Client và Server **vẫn diễn ra thành công 100%**. Trình duyệt đã nhận trọn vẹn phần đầu Headers của gói tin HTTP, do đó Promise được coi là **Fulfilled**. Lập trình viên phải tự kiểm tra điều kiện logic qua thuộc tính `response.ok` (chỉ là `true` khi status nằm trong khoảng 200-299).
</details>

### Câu 2: Thuộc tính `AbortSignal.timeout(ms)` mới trong JavaScript hiện đại có ưu điểm gì so với việc dùng `setTimeout` kết hợp `AbortController` thủ công?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- **Không cần quản lý timer thủ công**: Trước đây phải tự viết `const timer = setTimeout(() => controller.abort(), ms)` và nhớ gọi `clearTimeout(timer)` sau khi request hoàn tất để tránh rò rỉ bộ nhớ.
- **Tối ưu hóa ngầm ở tầng C++**: `AbortSignal.timeout(ms)` được tích hợp trực tiếp trong lõi Browser/Node.js C++ Engine, tự động hủy bỏ timer khi tác vụ kết thúc mà không giữ tham chiếu timer trên Heap.
- **Ném lỗi ngữ nghĩa chính xác**: Khi hết thời gian, nó ném ra lỗi `TimeoutError` thay vì `AbortError`, giúp lập trình viên phân biệt rạch ròi giữa việc "người dùng chủ động hủy nút bấm" và "mạng bị chậm quá thời gian cho phép".
</details>
