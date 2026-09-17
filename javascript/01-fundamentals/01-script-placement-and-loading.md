# Vị Trí Nhúng & Cơ Chế Tải Script (Script Placement & Loading Lifecycle)

Tài liệu ôn tập về cách nhúng JavaScript vào HTML, sự khác biệt giữa Internal và External script, cùng cơ chế tải `async` và `defer`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):** [00-introduction.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/00-introduction.md) (Hiểu cách JS can thiệp vào các phần tử DOM).
- **Mở rộng tiếp theo (Next Steps):** [01-variables-scope.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-variables-scope.js) (Khai báo biến và phạm vi trong môi trường JS).
- **Khái niệm liên quan (Related):**
  - Quá trình dựng trang (Critical Rendering Path) của trình duyệt.
  - Sự kiện vòng đời trang: `DOMContentLoaded` vs `load`.

---

## 2. Bản Chất Hoạt Động (Mental Model: Browser Parsing)

Trình duyệt phân tích cú pháp HTML tuần tự từ trên xuống dưới (HTML Parser):

### 1. Script đồng bộ mặc định (Parser Blocking)
```html
<script src="app.js"></script>
```
Khi HTML parser gặp thẻ `<script>` thông thường:
1. Dừng phân tích HTML (Parser bị chặn).
2. Gửi request tải file script về (nếu là external).
3. Thực thi mã script ngay lập tức.
4. Sau khi script chạy xong, mới tiếp tục phân tích HTML phía dưới.

> **Hệ quả:** Nếu đặt script thông thường trong thẻ `<head>`, script sẽ cố truy cập các thẻ HTML chưa được tạo trong DOM ➔ Gây lỗi `Cannot read properties of null`.

### 2. Ba vị trí nhúng truyền thống:
- **Trong thẻ `<head>`:** Thường chỉ dùng cho script cần nạp trước khi render giao diện (như font loader, theme toggle) hoặc khi có thuộc tính `defer`.
- **Ở cuối thẻ `<body>`:** Cách truyền thống tốt nhất. Đảm bảo toàn bộ DOM đã sẵn sàng trước khi script thực thi.
- **Tập tin bên ngoài (External Script - `.js`):** Tách bạch cấu trúc HTML và logic JS, dễ bảo trì và tận dụng cơ chế lưu cache (Browser Cache) để tăng tốc độ tải trang.

### 3. Chuẩn hiện đại: `defer` vs `async` (Đặt trong `<head>`)

| Thuộc tính | Cơ chế tải | Thời điểm thực thi | Đảm bảo thứ tự? | Trường hợp sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Mặc định** | Chặn parser | Chặn parser thực thi ngay | Có | Rất ít dùng cho file nặng |
| `defer` | Tải ngầm song song | Chờ HTML parse xong mới chạy | **Có** (đúng thứ tự xuất hiện) | **Khuyến nghị dùng cho script ứng dụng chính** |
| `async` | Tải ngầm song song | Tải xong lúc nào chạy ngay lúc đó (chặn parser lúc chạy) | **Không** (file nào tải xong trước chạy trước) | Script độc lập: Google Analytics, quảng cáo, tracking |

---

## 3. Bẫy & Lỗi Thường Gặp (Common Pitfalls)

1. **Lỗi Null Pointer khi nhúng trong `<head>` không có `defer`:**
   ```html
   <head>
     <script>
       // LỖI: Button ở dưới body chưa được tạo!
       document.getElementById("btn").addEventListener("click", () => {});
     </script>
   </head>
   ```
2. **Gặp lỗi phụ thuộc khi dùng `async`:**
   - Nếu `plugin.js` phụ thuộc vào `core.js` mà cả hai đều dùng `async`, có thể `plugin.js` tải xong trước và chạy trước ➔ Gây lỗi `ReferenceError: Core is not defined`.
   - *Quy tắc:* Nếu có sự phụ thuộc thứ tự, bắt buộc dùng `defer`.

---

## 4. File Code Thực Hành

- [01-script-placement-demo.html](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-script-placement-demo.html): Demo so sánh vị trí chạy script trong `<head>`, `<body>`, `async` và `defer`.
- [external-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/external-demo.js): Script độc lập minh họa nạp external file.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao đặt script ở cuối thẻ `<body>` lại giúp trang web tải nhanh hơn về mặt cảm nhận người dùng (Perceived Performance)?**
   *Đáp án:* Vì trình duyệt hiển thị toàn bộ nội dung HTML/CSS ra màn hình trước mà không bị việc tải/thực thi file JS chặn lại.
2. **`defer` khác gì so với việc đặt script ở cuối `<body>`?**
   *Đáp án:* `defer` cho phép trình duyệt tải trước file script qua mạng song song ngay trong khi đang parse HTML, trong khi đặt cuối `<body>` phải đợi parse xong toàn bộ HTML mới bắt đầu tải script.
