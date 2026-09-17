# Bảng Tra Cứu Toàn Tập: Xử Lý Lỗi & Gỡ Lỗi (Error Handling & Debugging Master Cheatsheet)

Bảng tra cứu toàn diện về xử lý lỗi và nghệ thuật gỡ lỗi trong JavaScript: Ma trận phân loại lỗi chuẩn ECMAScript, bản đồ phím tắt DevTools, danh mục quy chuẩn vàng phòng ngừa lỗi, và cẩm nang xử lý ngoại lệ bất đồng bộ.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-js-errors-and-built-in-types.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/01-js-errors-and-built-in-types.md)
  - [02-silent-errors-and-defensive-coding.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/02-silent-errors-and-defensive-coding.md)
  - [03-error-statements-and-handling.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/03-error-statements-and-handling.md)
  - [04-custom-error-objects-and-hierarchy.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/04-custom-error-objects-and-hierarchy.md)
  - [05-debugging-and-devtools.md](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/05-debugging-and-devtools.md)
- **Mở rộng tiếp theo (Next Steps):**
  - [05-style-guide-and-best-practices/](file:///d:/my-project/revision-document/javascript/) (Quy chuẩn viết mã sạch và Best Practices).
  - Tích hợp công cụ giám sát lỗi thời gian thực (Sentry, Datadog APM, LogRocket).

---

## 2. Ma Trận Tra Cứu Các Loại Lỗi JavaScript

| Tên lớp lỗi | Nguồn gốc phổ biến | Cách nhận biết | Giải pháp xử lý |
| :--- | :--- | :--- | :--- |
| **`ReferenceError`** | Gọi biến chưa khai báo, biến bị kẹt trong TDZ | `... is not defined` hoặc `Cannot access before initialization` | Khai báo biến trước khi dùng; kiểm tra phạm vi scope |
| **`TypeError`** | Gọi non-function, đọc thuộc tính của `null`/`undefined` | `... is not a function` hoặc `Cannot read properties of null` | Dùng Optional Chaining `?.`, type guards `typeof` |
| **`RangeError`** | Đệ quy vô tận, mảng độ dài âm, `toPrecision` vượt chuẩn | `Maximum call stack size exceeded`, `Invalid array length` | Khử đệ quy bằng vòng lặp; kiểm tra giới hạn input |
| **`SyntaxError`** | JSON parse hỏng, cú pháp sai trong `eval`/`new Function` | `Unexpected token...` | Bọc `JSON.parse` trong `try...catch`; format đúng JSON |
| **`URIError`** | Giải mã chuỗi URL sai định dạng phần trăm | `URI malformed` | Kiểm tra chuỗi trước khi gọi `decodeURIComponent` |
| **`AggregateError`** | `Promise.any()` thất bại toàn bộ | Có thuộc tính `.errors` chứa danh sách con | Lặp qua `err.errors` để log chi tiết từng promise |

---

## 3. Bảng Tra Cứu Phím Tắt Chrome DevTools Debugging

| Phím tắt (Windows) | Phím tắt (macOS) | Hành động | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| **F8** hoặc **Ctrl + \\** | **Cmd + \\** | **Pause / Resume** | Tiếp tục chạy script cho đến điểm ngắt tiếp theo |
| **F10** hoặc **Ctrl + '** | **Cmd + '** | **Step Over** | Chạy qua dòng lệnh kế tiếp (không nhảy vào hàm con) |
| **F11** hoặc **Ctrl + ;** | **Cmd + ;** | **Step Into** | Nhảy sâu vào bên trong thân hàm đang được gọi |
| **Shift + F11** | **Shift + Cmd + ;** | **Step Out** | Chạy hết hàm hiện tại và nhảy ngược ra hàm gọi nó |
| **Ctrl + Shift + O** | **Cmd + Shift + O** | **Go to Member** | Tìm kiếm nhanh hàm / method trong file hiện tại |
| **Ctrl + P** | **Cmd + P** | **Open File** | Mở nhanh bất kỳ file mã nguồn nào trong tab Sources |

---

## 4. 7 Quy Tắc Vàng Trong Xử Lý Lỗi (Best Practices)

1. **Tuyệt đối không nuốt lỗi im lặng (Never Swallow Errors Silently)**: Tránh viết `catch (e) {}` mà không ghi log hay xử lý. Nếu không thể sửa lỗi, hãy ném lại (rethrow).
2. **Luôn ném đối tượng kế thừa từ `Error`**: Không bao giờ ném string hay number (`throw "Error"`). Luôn ném `throw new Error(...)` để lưu vết Call Stack.
3. **Bảo toàn nguyên nhân gốc với `cause` (ES2022)**: Bọc lỗi tầng thấp trong lỗi tầng cao bằng cú pháp `new AppError("msg", { cause: originalError })`.
4. **Không đặt `return` trong khối `finally`**: `finally` chỉ dành cho giải phóng tài nguyên. Return trong `finally` sẽ âm thầm ghi đè mọi giá trị trả về trước đó.
5. **Kích hoạt `"use strict"`**: Loại bỏ các lỗi im lặng như gán biến global vô ý hay sửa thuộc tính read-only.
6. **Xây dựng phân cấp lỗi nghiệp vụ rõ ràng**: Kế thừa `Error` và phân biệt rõ lỗi vận hành (`isOperational: true`) vs bug lập trình.
7. **Lắng nghe sự kiện Unhandled Rejection toàn cục**: Phòng chống sập server Node.js hoặc đơ trang web client khi quên bắt Promise.

---

## 5. File Code Thực Hành

- [06-error-reference-demo.js](file:///d:/my-project/revision-document/javascript/04-error-handling-and-debugging/06-error-reference-demo.js): Code thực nghiệm kịch bản xử lý lỗi hoàn chỉnh (Pipeline), mô phỏng phân loại lỗi tự động, bọc Error Cause, và log an toàn chuẩn Enterprise. Chạy bằng: `node 06-error-reference-demo.js`.
