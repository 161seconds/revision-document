# Các Phương Thức Xuất Dữ Liệu (JavaScript Output Methods & Debugging)

Tài liệu ôn tập về 4 cơ chế hiển thị dữ liệu trong JavaScript, tác động đến Event Loop và bộ công cụ gỡ lỗi chuyên nghiệp.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):** [00-introduction.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/00-introduction.md) (Năng lực tương tác với trang).
- **Mở rộng tiếp theo (Next Steps):** 
  - [01-variables-scope.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-variables-scope.js): Khai báo biến và lưu trữ giá trị xuất ra.
  - JavaScript Statements & Syntax (Câu lệnh và cú pháp).
- **Khái niệm liên quan (Related):**
  - Trình gỡ lỗi trình duyệt (Browser DevTools Console).
  - Lỗ hổng bảo mật XSS và cơ chế đồng bộ chặn luồng giao diện (UI Blocking).

---

## 2. Bản Chất Hoạt Động (Mental Model: 4 Phương Thức Xuất Dữ Liệu)

| Phương thức | Vị trí xuất | Ảnh hưởng tới UI / Event Loop | Độ an toàn & Khuyến nghị |
| :--- | :--- | :--- | :--- |
| `element.innerHTML` / `textContent` | Ghi vào phần tử HTML | Thay đổi cây DOM (Reflow/Repaint) | **Chuẩn production** (ưu tiên `textContent` chống XSS) |
| `console.log()` | Bảng điều khiển DevTools | Chạy ngầm, không ảnh hưởng UI | **Chuẩn gỡ lỗi (Debugging)** cho lập trình viên |
| `window.alert()` | Hộp thoại cảnh báo popup | **Chặn hoàn toàn luồng giao diện (Blocking)** | **Tránh dùng** (gây ức chế trải nghiệm người dùng) |
| `document.write()` | Luồng tài liệu HTML | **Xóa sạch toàn bộ trang nếu gọi sau khi load** | **Deprecated/Tránh dùng** (chỉ dùng test nhanh) |

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

1. **Thảm họa `document.write()` sau khi tải trang:**
   - Khi trang web đã render xong, luồng tài liệu HTML đã đóng lại (`document.close()`).
   - Nếu bạn gọi `document.write()` sau đó (ví dụ trong sự kiện click nút), trình duyệt sẽ tự động gọi `document.open()` ngầm ➔ **Xóa sổ sạch sẽ toàn bộ HTML/CSS hiện có và ghi đè nội dung mới**.
2. **Hộp thoại `alert()` làm đơ toàn bộ trang:**
   - `alert()`, `prompt()`, `confirm()` là các phương thức đồng bộ chặn luồng (synchronous modal). Trình duyệt sẽ dừng toàn bộ JavaScript và không cho người dùng cuộn hay bấm bất kỳ nút nào cho đến khi nhấn "OK".
3. **Bộ công cụ Console nâng cao (Professional Debugging):**
   - Không chỉ có `console.log()`, lập trình viên chuyên nghiệp dùng:
     - `console.table(data)`: Hiển thị mảng hoặc object dạng bảng trực quan.
     - `console.time('label')` & `console.timeEnd('label')`: Đo thời gian thực thi của đoạn mã.
     - `console.warn()` & `console.error()`: Phân loại mức độ cảnh báo/lỗi và giữ lại stack trace.

---

## 4. File Code Thực Hành

- [02-output-demo.html](file:///d:/my-project/revision-document/javascript/01-fundamentals/02-output-demo.html): Demo trực quan 4 cách xuất dữ liệu và thí nghiệm chứng minh `document.write()` xóa sạch trang.
- [02-console-tools.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/02-console-tools.js): Kỹ thuật dùng console chuyên nghiệp chạy bằng Node.js.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Điều gì xảy ra khi gọi `document.write("<p>Xin chào</p>")` bên trong hàm xử lý sự kiện `onclick` của một nút bấm?**
   *Đáp án:* Toàn bộ nội dung của trang web bị xóa sạch, chỉ còn lại duy nhất dòng chữ `<p>Xin chào</p>`.
2. **Làm thế nào để in ra thời gian chạy một thuật toán trong JavaScript một cách chính xác?**
   *Đáp án:* Bọc thuật toán giữa `console.time("Tên nhãn")` và `console.timeEnd("Tên nhãn")`.
