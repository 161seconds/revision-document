# Câu Lệnh Xử Lý Lỗi & Lan Truyền Lỗi (JavaScript Error Statements & Error Chaining)

Tài liệu chuyên sâu về cơ chế kiểm soát ngoại lệ trong JavaScript: Cú pháp `try`, `catch` (kèm Optional Catch Binding ES2019), `finally` (và cạm bẫy ghi đè `return`), kỹ thuật Ném lại lỗi (Rethrowing), và chuẩn Chuỗi nguyên nhân lỗi `Error.prototype.cause` (ES2022).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-js-errors-and-built-in-types.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/01-js-errors-and-built-in-types.md) (Kiểu lỗi và Call Stack Unwinding).
  - [02-functions-and-scope/04-execution-context-scope-and-closures.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/04-execution-context-scope-and-closures.md) (Luồng trả về của hàm và Stack Frames).
- **Mở rộng tiếp theo (Next Steps):**
  - [04-custom-error-objects-and-hierarchy.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/04-custom-error-objects-and-hierarchy.md) (Tạo các lớp lỗi nghiệp vụ tùy biến).
  - [05-debugging-and-devtools.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/05-debugging-and-devtools.md) (Bắt Unhandled Promise Rejections).
- **Khái niệm liên quan (Related):**
  - Optional Catch Binding (ES2019).
  - Error Cause Chaining (ES2022).
  - Khối `finally` bảo đảm dọn dẹp tài nguyên (Resource Cleanup).

---

## 2. Bản Chất Hoạt Động (Mental Model: Luồng Điều Khiển try-catch-finally)

### 1. Cấu Trúc Toàn Diện & Thứ Tự Thực Thi
```javascript
try {
  // 1. Khối mã được theo dõi (Testing block)
} catch (error) {
  // 2. Khối xử lý khi có ngoại lệ ném ra (Handling block)
} finally {
  // 3. Khối LUÔN LUÔN được thực thi dù thành công hay lỗi (Cleanup block)
}
```

- Nếu trong `try` không có lỗi: Chạy hết `try` -> Chạy thẳng sang `finally` (bỏ qua `catch`).
- Nếu trong `try` phát sinh lỗi: Ngừng thực thi `try` ngay lập tức -> Nhảy vào `catch` -> Chạy tiếp `finally`.
- Nếu có `return` trong `try`: Giá trị trả về được lưu tạm vào thanh ghi, động cơ V8 **bắt buộc chạy qua `finally`** rồi mới hoàn tất trả về!

---

### 2. Cạm Bẫy Kinh Điển: `finally` Ghi Đè `return` Của `try`
Nếu trong khối `finally` chứa câu lệnh `return`, nó sẽ **ghi đè hoàn toàn** bất kỳ giá trị `return` nào của khối `try` hoặc `catch` trước đó:

```javascript
function test() {
  try {
    return "RESULT_FROM_TRY";
  } finally {
    return "OVERRIDDEN_BY_FINALLY"; // CỰC KỲ NGUY HIỂM!
  }
}
console.log(test()); // "OVERRIDDEN_BY_FINALLY"
```
➔ **Nguyên tắc vàng:** Khối `finally` chỉ dùng cho các thao tác dọn dẹp tài nguyên (đóng file, ngắt kết nối database, giải phóng khóa lock). **Tuyệt đối không viết lệnh `return` trong `finally`!**

---

### 3. Optional Catch Binding (ECMAScript 2019)
Trước ES2019, bắt buộc phải khai báo biến lỗi `catch (err)`. Kể từ ES2019, nếu bạn chỉ muốn nuốt lỗi mà không quan tâm chi tiết lỗi, có thể bỏ qua biến này:
```javascript
// CŨ (ES6):
try {
  JSON.parse(data);
} catch (e) { /* e không dùng tới */ }

// MỚI (ES2019):
try {
  JSON.parse(data);
} catch {
  // Bỏ qua hoàn toàn biến error!
}
```

---

### 4. Chuỗi Nguyên Nhân Lỗi: `Error.prototype.cause` (ECMAScript 2022)
Trong kiến trúc phần mềm phân tầng (Controller -> Service -> Repository), khi bắt lỗi tầng thấp, lập trình viên thường muốn ném lỗi nghiệp vụ tầng cao mà **không làm mất đi dấu vết (Stack Trace) của lỗi gốc**.

Kể từ ES2022, JavaScript bổ sung thuộc tính chuẩn `{ cause: err }`:

```javascript
async function fetchUserProfile(userId) {
  try {
    await database.connect();
  } catch (dbError) {
    // Bọc lỗi cơ sở dữ liệu bên trong lỗi nghiệp vụ tầng cao:
    throw new Error(`Không thể tải thông tin user ${userId}`, { cause: dbError });
  }
}

// Khi kiểm tra lỗi:
try {
  await fetchUserProfile(10);
} catch (err) {
  console.log(err.message);        // "Không thể tải thông tin user 10"
  console.log(err.cause.message);  // "Database connection timeout" (Nguyên nhân gốc rễ!)
}
```

---

### 5. Kỹ Thuật Ném Lại Lỗi (Rethrowing Pattern)
Một khối `catch` chỉ nên xử lý những lỗi mà nó biết cách khắc phục. Nếu gặp lỗi lạ hoặc lỗi hệ thống, nó **bắt buộc phải ném lại (rethrow)** để tầng ngoài xử lý:

```javascript
try {
  doRiskyOperation();
} catch (err) {
  if (err instanceof ValidationError) {
    handleValidation(err); // Đã xử lý êm đẹp
  } else {
    throw err; // Ném lại để các tầng trên phát hiện bug!
  }
}
```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy ném dữ liệu nguyên thủy (Primitive Throwing)
JavaScript cho phép ném bất kỳ kiểu dữ liệu nào (`throw "Lỗi rồi!";`, `throw 404;`).
- **Tác hại nghiêm trọng:** Giá trị nguyên thủy **không có Stack Trace** (`err.stack` là `undefined`), khiến việc debug trên server hoặc Sentry/Datadog trở nên bất khả thi!
- ➔ **Quy tắc:** Luôn luôn ném thể hiện của lớp `Error`: `throw new Error("Thông điệp lỗi")`.

### 2. Bẫy `try...catch` không bắt được mã Bất Đồng Bộ (Async Traps)
```javascript
try {
  setTimeout(() => {
    throw new Error("Lỗi trong Timer!"); // BẪY: Call Stack của try đã hoàn tất từ lâu!
  }, 100);
} catch (e) {
  console.log("Không bao giờ bắt được!"); // Trình duyệt/Node sẽ crash!
}
```
➔ **Giải pháp:** Phải đặt `try...catch` bên trong hàm async hoặc sử dụng Promise `.catch()`.

---

## 4. File Code Thực Hành

- [03-error-statements-demo.js](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/03-error-statements-demo.js): Code thực nghiệm thứ tự thực thi `try-catch-finally`, bẫy ghi đè `return` trong `finally`, Optional Catch Binding ES2019, kỹ thuật Rethrowing có chọn lọc, và mô hình Error Cause Chaining ES2022. Chạy bằng: `node 03-error-statements-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Điều gì xảy ra nếu khối `finally` ném một ngoại lệ mới khi khối `catch` đang xử lý một ngoại lệ cũ?**
   *Đáp án:* Ngoại lệ mới phát sinh trong khối `finally` sẽ ghi đè và dập tắt hoàn toàn ngoại lệ cũ đang được xử lý trong `catch`. Ngoại lệ cũ biến mất không để lại dấu vết. Đây là lý do khối `finally` phải được viết cực kỳ cẩn trọng, không để phát sinh lỗi mới.

2. **Lợi ích kiến trúc của tính năng `{ cause: originalError }` trong ES2022 là gì?**
   *Đáp án:* Cho phép các tầng ứng dụng trừu tượng hóa lỗi (ví dụ biến `SqlSyntaxError` thành `UserServiceError`) mà vẫn bảo tồn nguyên vẹn toàn bộ chuỗi ngữ cảnh và Stack Trace của lỗi gốc, hỗ trợ đắc lực cho các hệ thống giám sát và ghi log phân tán (APM).
