# Dự Án 04: Hộp Thoại Modal Chuẩn Tiếp Cận (Accessible Modal Dialog)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [03-html-events-and-delegation.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/03-html-events-and-delegation.md) (Keyboard Events, Bubbling & StopPropagation).
  - [04-html-first-and-progressive-enhancement.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/04-html-first-and-progressive-enhancement.md) (Thẻ `<dialog>` native & HTML-First).
- **Khái niệm tương quan**:
  - **Top Layer & Stacking Context**: Trước đây lập trình viên phải đặt `z-index: 999999` để đè lên các phần tử khác. Thẻ `<dialog>` hiện đại nằm ở **Top Layer** độc lập do Browser Engine quản lý, vượt ra ngoài mọi Stacking Context của CSS.
  - **WCAG 2.1 Focus Trap Requirement**: Người khiếm thị điều khiển bằng phím Tab không được phép vô tình nhảy ra ngoài modal khi modal đang mở.
- **Điểm đến tiếp theo**:
  - [05-enterprise-form-validation.md](file:///d:/my-project/revision-document/javascript/07-practical-projects/05-enterprise-form-validation.md) (Xác Thực Biểu Mẫu Chuẩn Doanh Nghiệp).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. So Sánh Native `<dialog>` vs Custom `<div>` Modal

| Tính năng | Native `<dialog>` (Khuyên dùng) | Custom `<div class="modal">` (Legacy) |
| :--- | :--- | :--- |
| **Cách mở** | `dialog.showModal()` | Thêm class `.is-active` / `.open` |
| **Quản lý thứ tự hiển thị** | **Top Layer** (Không lo xung đột `z-index`) | Dễ bị che khuất bởi `z-index` của thư viện khác |
| **Phím Escape** | Tự động đóng (kích hoạt event `cancel`) | Phải tự lắng nghe `window.addEventListener("keydown")` |
| **Focus Trapping** | Tự động giam giữ tiêu điểm bên trong | Phải tự viết thuật toán vòng lặp Tab / Shift+Tab |
| **Lớp phủ nền Backdrop** | Tạo qua pseudo-element `::backdrop` | Phải tạo thẻ div `.overlay` riêng biệt |
| **Vô hiệu hóa trang nền** | Tự động làm trang nền thành trạng thái `inert` | Phải tự thêm `inert` hoặc khóa cuộn body |

### 2.2. Thuật Toán Bẫy Tiêu Điểm (Focus Trap Algorithm)
Khi dựng custom modal hoặc polyfill cho thiết bị cũ:
1. Truy vấn toàn bộ phần tử có thể nhận focus bên trong modal:
   `modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')`
2. Lưu phần tử đầu tiên (`firstElement`) và phần tử cuối cùng (`lastElement`).
3. Bắt sự kiện `keydown`:
   - Nếu nhấn `Tab` trên `lastElement`: Chuyển tiêu điểm (`focus()`) về `firstElement`.
   - Nếu nhấn `Shift + Tab` trên `firstElement`: Chuyển tiêu điểm (`focus()`) về `lastElement`.

### 2.3. Quy Tắc Phục Hồi Tiêu Điểm (Focus Restoration)
Một lỗi UX kinh điển là khi người dùng đóng modal, con trỏ tiêu điểm bị rơi vào hư không (`document.body`).
Người dùng điều khiển bằng bàn phím sẽ phải nhấn phím `Tab` hàng trăm lần từ đầu trang để quay lại vị trí cũ.
- Chuẩn Enterprise: Trước khi mở modal, ghi nhớ `document.activeElement`. Khi modal đóng lại, gọi `previousElement.focus()`.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Gọi `dialog.show()` Thay Vì `dialog.showModal()`
- `dialog.show()`: Chỉ hiển thị thẻ dialog như một khối `block` thông thường trong luồng tài liệu. **Không tạo lớp phủ Backdrop, không nằm trên Top Layer, không bẫy focus**.
- `dialog.showModal()`: Kích hoạt toàn bộ sức mạnh modal chuẩn của trình duyệt (Top Layer, Backdrop, Focus Trap, Escape close).

### Bẫy 2: Click Vào Nội Dung Modal Nhưng Bị Đóng Nhầm Vì Xử Lý Backdrop Sai
```javascript
// ❌ SAI LẦM: Click bên trong modal cũng làm đóng modal!
dialog.addEventListener("click", () => dialog.close());

// ✅ ĐÚNG: Kiểm tra vị trí click có nằm ngoài bounding rect của dialog hay không
dialog.addEventListener("click", (e) => {
  const rect = dialog.getBoundingClientRect();
  const isInDialog = (
    rect.top <= e.clientY &&
    e.clientY <= rect.top + rect.height &&
    rect.left <= e.clientX &&
    e.clientX <= rect.left + rect.width
  );
  if (!isInDialog) {
    dialog.close(); // Chỉ đóng khi click ngoài mép dialog (tức click trúng backdrop)
  }
});
```

### Bẫy 3: Quên Khóa Cuộn `overflow: hidden` Trên Thẻ `<body>`
- Khi người dùng cuộn chuột hoặc vuốt màn hình trên modal dài, trang web nền phía sau vẫn bị cuộn theo (hiện tượng Scroll Chaining / Scroll Bleed).

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [04-modal-dialog-demo.js](file:///d:/my-project/revision-document/javascript/07-practical-projects/04-modal-dialog-demo.js)

### Mẫu Modal Chuẩn Tiếp Cận Kết Hợp Thẻ `<dialog>` Native
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Accessible Modal Dialog</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 3rem;
    }
    /* Pseudo-element native của trình duyệt cho Backdrop */
    dialog::backdrop {
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
    }
    dialog {
      background: #1e293b;
      color: #f8fafc;
      border: 1px solid #475569;
      border-radius: 16px;
      padding: 2rem;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    }
    dialog[open] {
      animation: zoomIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes zoomIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .btn-group {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    button {
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      border: none;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-danger { background: #ef4444; color: white; }
    .btn-cancel { background: #475569; color: white; }
    .btn-primary { background: #3b82f6; color: white; }
  </style>
</head>
<body>
  <h1>Xác Nhận Xóa Dữ Liệu</h1>
  <p>Thao tác này sẽ xóa vĩnh viễn tài khoản của bạn khỏi hệ thống.</p>
  
  <button id="open-modal-btn" class="btn-primary">Mở Hộp Thoại Xóa</button>

  <!-- Thẻ HTML5 Native Dialog -->
  <dialog id="confirm-modal" aria-labelledby="modal-title" aria-describedby="modal-desc">
    <h2 id="modal-title">Bạn có chắc chắn muốn xóa?</h2>
    <p id="modal-desc" style="color: #94a3b8;">
      Hành động này không thể hoàn tác. Toàn bộ tài nguyên liên kết sẽ bị xóa sạch khỏi máy chủ.
    </p>

    <form method="dialog" class="btn-group">
      <!-- value="cancel" sẽ tự động gán vào dialog.returnValue khi submit -->
      <button value="cancel" class="btn-cancel">Hủy Bỏ</button>
      <button value="confirm" class="btn-danger">Xác Nhận Xóa</button>
    </form>
  </dialog>

  <p id="result-status" style="margin-top: 1rem; color: #38bdf8;"></p>

  <script>
    const modal = document.getElementById("confirm-modal");
    const openBtn = document.getElementById("open-modal-btn");
    const statusText = document.getElementById("result-status");

    openBtn.addEventListener("click", () => {
      // showModal tự động:
      // 1. Đưa lên Top Layer (không sợ z-index)
      // 2. Kích hoạt Focus Trap
      // 3. Tự đóng khi bấm phím Escape
      modal.showModal();
    });

    // Bắt sự kiện đóng modal (kể cả phím Escape hay bấm nút trong form method="dialog")
    modal.addEventListener("close", () => {
      statusText.textContent = `Hộp thoại đã đóng với kết quả: ${modal.returnValue}`;
      // Focus tự động được trả lại openBtn mà không cần viết thêm dòng code nào!
    });

    // Đóng khi click vào vùng phủ nền Backdrop
    modal.addEventListener("click", (e) => {
      const rect = modal.getBoundingClientRect();
      const isClickedInside = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isClickedInside) {
        modal.close("backdrop_click");
      }
    });
  </script>
</body>
</html>
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao thẻ `<dialog>` sử dụng Top Layer lại giải quyết được hoàn toàn vấn đề xung đột `z-index` (Z-Index Wars)?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Theo cơ chế xếp chồng của CSS thông thường, một phần tử có `z-index: 999999` vẫn có thể bị che khuất nếu phần tử cha của nó tạo một **Stacking Context** mới (ví dụ cha có `opacity < 1`, `transform`, hoặc `filter`) có mức ưu tiên thấp hơn các phần tử khác trên trang.
- **Top Layer** là một tầng kết xuất hoàn toàn riêng biệt nằm ở vị trí cao nhất trong cây hiển thị của trình duyệt. Mọi phần tử được đưa vào Top Layer (thông qua `dialog.showModal()` hoặc Fullscreen API) sẽ **bỏ qua toàn bộ Stacking Context và thứ tự phân cấp HTML của DOM**, đảm bảo luôn luôn nổi lên trên cùng của mọi thành phần giao diện.
</details>

### Câu 2: Trong thẻ `<dialog>`, cách hoạt động của `<form method="dialog">` có gì đặc biệt so với form HTML thông thường?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Khi một `<form>` có thuộc tính `method="dialog"` nằm bên trong thẻ `<dialog>`:
  1. Khi người dùng submit form (bấm các nút bấm bên trong), form **không gửi HTTP Request** và **không reload trang web**.
  2. Trình duyệt tự động đóng thẻ `<dialog>` ngay lập tức.
  3. Giá trị của thuộc tính `value` trên nút bấm được submit (ví dụ `<button value="confirm">`) sẽ được tự động gán thẳng vào thuộc tính `dialog.returnValue`, giúp code JavaScript lắng nghe sự kiện `modal.addEventListener("close")` có thể đọc được quyết định của người dùng mà không cần viết thêm hàm click handler riêng.
</details>
