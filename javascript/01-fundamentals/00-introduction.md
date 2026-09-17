# Giới Thiệu Về JavaScript (JavaScript Overview & Capabilities)

Tổng quan về bản chất, vai trò của JavaScript trong phát triển Web và các khả năng tương tác cốt lõi.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):** Nền tảng cấu trúc HTML và định dạng CSS cơ bản.
- **Mở rộng tiếp theo (Next Steps):** 
  - [01-variables-scope.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/01-variables-scope.js): Cú pháp biến, vùng nhớ và phạm vi.
  - [05-dom-and-web-apis/](file:///d:/my-project/revision-document/javascript/05-dom-and-web-apis/): Thao tác sâu với toàn bộ cây DOM và Event Listeners.
- **Khái niệm liên quan (Related):**
  - Cơ chế DOM Tree & Render Tree của trình duyệt.
  - Môi trường thực thi: V8 Engine (Google Chrome, Node.js, Bun).

---

## 2. Bản Chất Hoạt Động & Vai Trò (Mental Model)

### Bộ Ba Trụ Cột Của Web
1. **HTML (Danh từ):** Xây dựng bộ khung xương và cấu trúc nội dung.
2. **CSS (Tính từ):** Định hình màu sắc, bố cục, kích thước và thẩm mỹ giao diện.
3. **JavaScript (Động từ):** Thổi hồn tương tác, xử lý logic, tính toán và phản hồi hành vi người dùng.

### 4 Khả Năng Tương Tác Trình Duyệt Cốt Lõi
JavaScript can thiệp trực tiếp vào tài liệu HTML sau khi đã tải vào bộ nhớ (DOM):
1. **Thay đổi nội dung phần tử:** Đọc và ghi đè chữ hoặc HTML (`textContent`, `innerHTML`).
2. **Thay đổi thuộc tính phần tử (Attributes):** Đổi đường dẫn ảnh (`src`), đổi link liên kết (`href`), bật/tắt trạng thái (`disabled`, `hidden`).
3. **Thay đổi định dạng giao diện (CSS):** Thay đổi trực tiếp các thuộc tính style (`element.style.color`, `element.style.fontSize`).
4. **Ẩn / Hiện phần tử:** Bằng cách gán `element.style.display = 'none'` (ẩn) hoặc `element.style.display = 'block'` (hiện).

---

## 3. Bẫy & Lỗi Thường Gặp (Common Pitfalls)

1. **Lỗ hổng bảo mật XSS (Cross-Site Scripting) với `innerHTML`:**
   - *Nguy cơ:* Nếu dùng `innerHTML` để hiển thị dữ liệu do người dùng nhập (user input), kẻ tấn công có thể chèn mã độc `<script>` hoặc thẻ `<img onerror=...>` để đánh cắp cookie/session.
   - *Cách khắc phục an toàn:* Luôn ưu tiên dùng `textContent` khi chỉ cần cập nhật văn bản thuần.
2. **Hiện tượng Reflow & Repaint làm giảm hiệu năng:**
   - Việc liên tục đọc và ghi đè `element.style` trong vòng lặp buộc trình duyệt phải tính toán lại toàn bộ vị trí layout (Reflow) và vẽ lại pixel trên màn hình (Repaint).
   - *Cách khắc phục:* Thêm/bớt class thông qua `element.classList.add/remove` thay vì style trực tiếp.

---

## 4. File Code Thực Hành Kèm Theo

Mở file sau trực tiếp bằng trình duyệt để tương tác thực tế:
- [00-intro-demo.html](file:///d:/my-project/revision-document/javascript/01-fundamentals/00-intro-demo.html): Ví dụ trực quan thay đổi nội dung, thuộc tính ảnh, đổi màu chữ và ẩn/hiện box.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Sự khác biệt an toàn giữa `element.innerHTML` và `element.textContent` là gì?**
   *Đáp án:* `innerHTML` phân tích chuỗi thành thẻ HTML (tiềm ẩn nguy cơ XSS nếu chuỗi chứa mã độc), còn `textContent` coi chuỗi là văn bản thô, tự động mã hóa ký tự đặc biệt.
2. **Khi thay đổi `display = 'none'`, phần tử đó có còn nằm trong DOM không?**
   *Đáp án:* Vẫn còn nguyên trong cây DOM, chỉ không được đưa vào Render Tree (không chiếm diện tích hiển thị trên màn hình).
