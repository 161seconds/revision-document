# Triết Lý HTML-First & Progressive Enhancement

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-html-dom-architecture-and-selectors.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/01-html-dom-architecture-and-selectors.md) (DOM Tree & Selector engine).
  - [03-html-events-and-delegation.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/03-html-events-and-delegation.md) (Form Submit event, `preventDefault`).
- **Khái niệm tương quan**:
  - **Single Page Application (SPA) vs Multi-Page Application (MPA)**: Sự phụ thuộc thái quá vào Client-side JS dẫn đến tình trạng "White Screen of Death" khi file JS bundle 5MB bị nghẽn mạng.
  - **Core Web Vitals**: INP (Interaction to Next Paint) và TBT (Total Blocking Time) suy giảm nghiêm trọng khi trình duyệt bận parse/compile hàng trăm KB thư viện validation JS thay vì dùng engine C++ native của browser.
- **Điểm đến tiếp theo**:
  - [05-dom-animations-and-raf.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/05-dom-animations-and-raf.md) (Browser rendering pipeline, Reflow/Repaint, `requestAnimationFrame`).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Định nghĩa HTML-First & Kim Tự Tháp Tăng Cường Lũy Tiến (Progressive Enhancement)
HTML-First là tư duy thiết kế web đặt **HTML ngữ nghĩa (Semantic HTML)** làm xương sống vững chắc đầu tiên. Trang web phải hoàn toàn đọc được, điều hướng được và gửi nhận dữ liệu được chỉ với HTML thuần:

```
          /\
         /  \     [JS]: Tăng cường trải nghiệm (AJAX ngầm, Micro-animations, Offline cache)
        / JS \
       /------\
      /  CSS   \   [CSS]: Tăng cường thị giác (Layout lưới, màu sắc, Typography, Responsive)
     /----------\
    /    HTML    \  [HTML]: Xương sống dữ liệu & Hành vi native (Semantic, Form action, Input types)
   /--------------\
```

### 2.2. So sánh Progressive Enhancement vs Graceful Degradation

| Tiêu chí | Progressive Enhancement (HTML-First) | Graceful Degradation (JS-First) |
| :--- | :--- | :--- |
| **Điểm khởi đầu** | Bắt đầu từ mức tối thiểu: HTML thuần chạy 100% | Bắt đầu từ ứng dụng phức tạp nhất (React/Vue/Vite) |
| **Chiến lược** | Nâng cấp dần khi trình duyệt hỗ trợ tính năng mới | Cắt tỉa, vá lỗi ("polyfill") khi chạy trên thiết bị yếu/cũ |
| **Hành vi khi tắt JS** | **Hoạt động bình thường** (form submit truyền thống) | **Màn hình trắng xóa (Crash / Blank Screen)** |
| **Accessibility (a11y)** | Có sẵn từ gốc nhờ các thẻ ngữ nghĩa | Phải cấu hình thủ công `aria-*`, `role`, focus trapping |
| **Tốc độ hiển thị (FCP)** | Cực nhanh (HTML stream thẳng từ server về browser) | Chậm (Chờ tải file bundle JS -> Parse -> Hydrate) |

### 2.3. Browser-Native State Machines (Không Cần Code JS)
Nhiều kỹ sư có thói quen viết hàng chục dòng JS để xử lý Accordion, Dropdown, Modal Popup. Tuy nhiên, trình duyệt hiện đại đã tích hợp sẵn máy trạng thái (C++ Internal State Machine):
1. `<details>` & `<summary>`: Đóng mở nội dung độc lập qua thuộc tính boolean `open`. Hỗ trợ phím Space/Enter và Screen Reader tự động.
2. `<dialog>`: Quản lý hộp thoại với phương thức `dialog.showModal()` tạo top-layer backdrop, tự chặn tương tác nền (inert) và tự đóng khi bấm `Escape`.
3. `<input type="checkbox">` kết hợp CSS pseudo-class `:checked`: Đủ để dựng toàn bộ menu trượt (Off-canvas sidebar).

### 2.4. Constraint Validation API
Thay vì import thư viện validate (Joi, Yup, Vuelidate) nặng hàng trăm KB, trình duyệt có sẵn hệ thống kiểm tra tính hợp lệ bằng C++:
- Thuộc tính HTML: `required`, `pattern`, `min`, `max`, `minlength`, `maxlength`, `type="email|url|number"`.
- Trạng thái `element.validity` (ValidityState):
  - `valueMissing`: Vi phạm `required`.
  - `typeMismatch`: Vi phạm cú pháp `email`, `url`.
  - `patternMismatch`: Không khớp Regex `pattern`.
  - `rangeOverflow` / `rangeUnderflow`: Vượt ngưỡng `max` / `min`.
  - `customError`: Lỗi tùy biến do lập trình viên gán qua `element.setCustomValidity("thông báo")`.
  - `valid`: Trả về `true` khi toàn bộ các cờ trên đều là `false`.
- Phương thức:
  - `element.checkValidity()`: Trả về boolean hợp lệ.
  - `element.reportValidity()`: Hiển thị tooltip cảnh báo native của trình duyệt tới người dùng.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Chặn Form Submit Bằng `e.preventDefault()` Nhưng Quên Kiểm Tra `checkValidity()`
```javascript
// ❌ SAI LẦM: Bỏ qua hoàn toàn validation native của browser
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  // Gửi request ngay cả khi input required bị rỗng hoặc email sai format!
  fetch("/api/login", { method: "POST", body: data });
});

// ✅ ĐÚNG: Tôn trọng Constraint Validation API trước khi chặn submit
form.addEventListener("submit", (e) => {
  if (!form.checkValidity()) {
    // Để trình duyệt tự hiển thị lỗi native tooltip
    return;
  }
  e.preventDefault(); // Chỉ chặn reload khi dữ liệu ĐÃ HỢP LỆ
  const data = new FormData(form);
  fetch("/api/login", { method: "POST", body: data });
});
```

### Bẫy 2: Dùng `<div>` hoặc `<span>` Làm Nút Bấm Thay Vì `<button>`
- `<div>` không nhận phím `Tab` để focus, không nhận phím `Enter` hoặc `Space` để kích hoạt trừ khi bạn tự viết logic phức tạp: `tabindex="0"`, `role="button"`, lắng nghe `keydown`.
- `<button>` native tự động hỗ trợ bàn phím, tự động submit form khi nằm trong `<form>` mà không cần một dòng JS nào.

### Bẫy 3: Gán `setCustomValidity` Nhưng Quên Xóa Về Chuỗi Rỗng `""`
- Một khi bạn gọi `input.setCustomValidity("Email đã tồn tại")`, thuộc tính `validity.customError` sẽ luôn là `true`. Input đó sẽ vĩnh viễn bị chặn submit cho đến khi bạn giải phóng nó bằng `input.setCustomValidity("")`.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [04-html-first-demo.js](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/04-html-first-demo.js)

### Mẫu Form Progressive Enhancement Chuẩn Production
```html
<!-- Tầng 1 (HTML thuần): Khi không có JS, form vẫn POST về server và xử lý bình thường -->
<form action="/api/newsletter" method="POST" id="subscribe-form">
  <label for="user-email">Email nhận tin:</label>
  <input 
    type="email" 
    id="user-email" 
    name="email" 
    required 
    placeholder="you@domain.com"
  />
  <button type="submit">Đăng ký</button>
  <p id="status-msg" aria-live="polite"></p>
</form>

<script>
  // Tầng 3 (Progressive Enhancement): Nâng cấp trải nghiệm người dùng
  const form = document.getElementById("subscribe-form");
  const emailInput = document.getElementById("user-email");
  const statusMsg = document.getElementById("status-msg");

  // Kiểm tra custom domain cấm realtime
  emailInput.addEventListener("input", () => {
    if (emailInput.value.endsWith("@spam.com")) {
      emailInput.setCustomValidity("Hệ thống từ chối email từ tên miền spam.com!");
    } else {
      emailInput.setCustomValidity(""); // Giải phóng lỗi
    }
  });

  form.addEventListener("submit", async (e) => {
    // Nếu dữ liệu HTML5 chưa pass, dừng lại để browser hiển thị popup native
    if (!form.checkValidity()) return;

    e.preventDefault(); // Chặn reload trang chỉ khi JS chạy tốt
    statusMsg.textContent = "Đang gửi dữ liệu...";

    try {
      const formData = new FormData(form);
      const res = await fetch(form.action, {
        method: form.method,
        body: formData,
      });

      if (!res.ok) throw new Error("Phản hồi lỗi từ máy chủ");
      statusMsg.textContent = "Đăng ký thành công!";
      form.reset();
    } catch (err) {
      // Fallback: Khi mạng chập chờn hoặc API lỗi, submit lại bằng luồng HTML truyền thống
      statusMsg.textContent = "Lỗi kết nối client. Đang chuyển hướng sang submit truyền thống...";
      form.submit(); // Submit native bỏ qua preventDefault
    }
  });
</script>
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao triết lý HTML-First lại giúp cải thiện chỉ số INP (Interaction to Next Paint) và TBT (Total Blocking Time) của Core Web Vitals?
<details>
<summary><b>Lời giải chi tiết</b></summary>

1. **Giảm tải JS Main Thread**: Khi dùng validation native (`<input required pattern="...">`) và semantic elements (`<details>`, `<dialog>`), trình duyệt xử lý logic hoàn toàn ở tầng mã nguồn C++ của Browser Engine (Blink/Gecko).
2. **Không tiêu tốn CPU parse/compile**: Giảm bớt hàng trăm KB thư viện validation/UI components của JavaScript, giải phóng Main Thread để ưu tiên phản hồi ngay lập tức cho các tương tác chuột và gõ phím của người dùng, giúp INP và TBT đạt mức xanh tuyệt đối.
</details>

### Câu 2: Điểm khác biệt mấu chốt giữa phương thức `input.checkValidity()` và `input.reportValidity()` là gì?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- `input.checkValidity()`: Chỉ thực hiện đánh giá logic và trả về giá trị boolean (`true` nếu hợp lệ, `false` nếu vi phạm). Nó kích hoạt sự kiện `invalid` trên element nhưng **không làm thay đổi giao diện** hay hiển thị popup cảnh báo.
- `input.reportValidity()`: Vừa đánh giá tính hợp lệ, vừa kích hoạt sự kiện `invalid`, vừa **tự động focus vào input lỗi và hiển thị tooltip thông báo lỗi chuẩn của trình duyệt** tới người dùng.
</details>
