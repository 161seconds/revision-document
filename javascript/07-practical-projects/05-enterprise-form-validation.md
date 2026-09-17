# Dự Án 05: Xác Thực Biểu Mẫu Chuẩn Doanh Nghiệp (Enterprise Form Validation)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [04-html-first-and-progressive-enhancement.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/04-html-first-and-progressive-enhancement.md) (Constraint Validation API, `validity`, `checkValidity`).
  - [02-event-listener-playground.md](file:///d:/my-project/revision-document/javascript/07-practical-projects/02-event-listener-playground.md) (Debounce cho ô nhập dữ liệu realtime).
- **Khái niệm tương quan**:
  - **Client-Side vs Server-Side Validation**: Client validation phục vụ trải nghiệm người dùng (UX) phản hồi tức thì; Server validation bắt buộc 100% để đảm bảo an ninh (Security). Client validation không bao giờ được coi là chốt chặn an toàn cuối cùng.
  - **WCAG Form Accessibility**: Nhóm lỗi phải được liên kết bằng `aria-describedby` và thông báo qua `aria-live="assertive"` để Screen Reader đọc ngay lập tức.
- **Điểm đến tiếp theo**:
  - Module 08: Bảng Tra Cứu Toàn Cục & Từ Khóa Ngôn Ngữ (`08-language-reference/`).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Chiến Lược Kích Hoạt Lỗi (Validation Timing Strategies)
Trải nghiệm biểu mẫu phụ thuộc rất lớn vào **thời điểm** hiển thị lỗi cho người dùng:

```
[Người dùng bắt đầu gõ]
       |
       v (KHÔNG hiển thị lỗi ngay khi vừa gõ ký tự đầu tiên -> Tránh gây khó chịu/Aggressive UX)
[Sự kiện Blur (Rời focus)]
       |
       v (Bắt đầu hiển thị lỗi nếu bỏ trống hoặc sai format)
[Đã hiển thị lỗi lần đầu (Dirty State)]
       |
       v (Chuyển sang chế độ Realtime Debounced Validation 300ms để xóa lỗi ngay khi người dùng sửa đúng)
[Bấm Nút Submit]
       |
       v (Kiểm tra toàn diện mọi trường, cuộn và focus vào trường lỗi đầu tiên)
```

### 2.2. Thuật Toán Đo Lường Độ Mạnh Mật Khẩu (Password Entropy)
Mật khẩu mạnh không chỉ là chuỗi dài, mà còn dựa trên không gian tổ hợp ký tự (Character Space Size $N$):
$$\text{Entropy} = L \times \log_2(N)$$
Hệ thống chấm điểm phân tầng:
1. Độ dài tối thiểu ($L \ge 8$ ký tự, lý tưởng $L \ge 12$).
2. Tập hợp chữ thường `[a-z]` và chữ hoa `[A-Z]`.
3. Tập hợp chữ số `[0-9]`.
4. Tập hợp ký tự đặc biệt `[!@#$%^&*...]`.

### 2.3. Thu Thập Dữ Liệu Sạch Bằng `FormData` API Native
Không truy cập thủ công `input1.value`, `input2.value` rời rạc.
Sử dụng `const formData = new FormData(form)`:
- Tự động gom toàn bộ các input có thuộc tính `name`.
- Tự động bỏ qua các trường bị `disabled`.
- Chuyển đổi một dòng sang JSON payload sạch: `Object.fromEntries(formData.entries())`.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Chỉ Kiểm Tra Khớp Mật Khẩu Trên Trường `confirmPassword`
- Nếu người dùng nhập mật khẩu `123456`, sau đó nhập xác nhận `123456` (hợp lệ).
- Sau đó người dùng quay lại sửa trường `password` thành `abcdef`, nếu bạn không kích hoạt kiểm tra lại `confirmPassword`, form sẽ gửi hai mật khẩu khác nhau lên máy chủ!
- Luôn kiểm tra lại trường xác nhận bất cứ khi nào trường mật khẩu chính thay đổi.

### Bẫy 2: Bỏ Qua Thuộc Tính `autocomplete` Gây Khó Chịu Cho Trình Quản Lý Mật Khẩu (1Password, Bitwarden, Google Autofill)
- Nếu đặt `name="p"` hoặc không có thuộc tính `autocomplete`, các tiện ích tự động điền mật khẩu sẽ không thể nhận diện.
- Chuẩn Enterprise:
  - Tên đăng nhập: `autocomplete="username"`
  - Mật khẩu mới: `autocomplete="new-password"`
  - Mật khẩu đăng nhập: `autocomplete="current-password"`

### Bẫy 3: Hiển Thị Thông Báo Lỗi Bằng Màu Đỏ Đơn Thuần (Vi Phạm Tiếp Cận Thị Giác)
- Khoảng 8% nam giới bị mù màu (Color Blindness - Daltonism) và không thể phân biệt giữa viền xanh lá (hợp lệ) và viền đỏ (lỗi).
- Bắt buộc phải có **biểu tượng icon kèm văn bản thông báo rõ ràng** bên dưới input.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [05-form-validation-demo.js](file:///d:/my-project/revision-document/javascript/07-practical-projects/05-form-validation-demo.js)

### Biểu Mẫu Xác Thực Đăng Ký Đầy Đủ Chuẩn Production
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Enterprise Registration Form</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      justify-content: center;
      padding: 3rem 1rem;
    }
    .form-card {
      background: #1e293b;
      padding: 2rem;
      border-radius: 16px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    label {
      display: block;
      margin-bottom: 0.4rem;
      font-size: 0.9rem;
      font-weight: 500;
    }
    input[type="text"], input[type="email"], input[type="password"] {
      width: 100%;
      box-sizing: border-box;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid #475569;
      background: #0f172a;
      color: white;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    input.error { border-color: #ef4444; }
    input.valid { border-color: #22c55e; }
    .error-text {
      color: #f87171;
      font-size: 0.8rem;
      margin-top: 0.35rem;
      display: none;
    }
    .error-text.show { display: block; }
    .strength-meter {
      height: 4px;
      background: #334155;
      border-radius: 2px;
      margin-top: 0.5rem;
      overflow: hidden;
    }
    .strength-bar {
      height: 100%;
      width: 0%;
      transition: all 0.3s ease;
    }
    button[type="submit"] {
      width: 100%;
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.85rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="form-card">
    <h2>Tạo Tài Khoản Doanh Nghiệp</h2>
    
    <form id="reg-form" novalidate>
      <!-- Username -->
      <div class="form-group">
        <label for="username">Tên người dùng</label>
        <input type="text" id="username" name="username" autocomplete="username" />
        <div id="username-err" class="error-text" role="alert"></div>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="email">Địa chỉ Email</label>
        <input type="email" id="email" name="email" autocomplete="email" />
        <div id="email-err" class="error-text" role="alert"></div>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="password">Mật khẩu</label>
        <input type="password" id="password" name="password" autocomplete="new-password" />
        <div class="strength-meter">
          <div id="strength-bar" class="strength-bar"></div>
        </div>
        <div id="password-err" class="error-text" role="alert"></div>
      </div>

      <!-- Confirm Password -->
      <div class="form-group">
        <label for="confirm-pass">Xác nhận mật khẩu</label>
        <input type="password" id="confirm-pass" name="confirmPassword" autocomplete="new-password" />
        <div id="confirm-err" class="error-text" role="alert"></div>
      </div>

      <button type="submit">Đăng Ký Tài Khoản</button>
    </form>
  </div>

  <script>
    const form = document.getElementById("reg-form");
    const passInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirm-pass");
    const strengthBar = document.getElementById("strength-bar");

    function updateStrength(val) {
      let score = 0;
      if (val.length >= 8) score++;
      if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
      if (/\d/.test(val)) score++;
      if (/[^a-zA-Z0-9]/.test(val)) score++;

      const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
      const widths = ["25%", "50%", "75%", "100%"];
      if (val.length === 0) {
        strengthBar.style.width = "0%";
      } else {
        strengthBar.style.width = widths[score - 1] || "25%";
        strengthBar.style.background = colors[score - 1] || "#ef4444";
      }
    }

    passInput.addEventListener("input", () => {
      updateStrength(passInput.value);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const username = form.username.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;
      const confirmPass = form.confirmPassword.value;

      let hasError = false;

      function showError(id, msg) {
        const errEl = document.getElementById(id);
        errEl.textContent = msg;
        errEl.classList.add("show");
        errEl.previousElementSibling.classList.add("error");
        hasError = true;
      }

      function clearError(id) {
        const errEl = document.getElementById(id);
        errEl.textContent = "";
        errEl.classList.remove("show");
        errEl.previousElementSibling.classList.remove("error");
        errEl.previousElementSibling.classList.add("valid");
      }

      // 1. Kiểm tra username
      if (username.length < 3) showError("username-err", "Tên đăng nhập phải có ít nhất 3 ký tự");
      else clearError("username-err");

      // 2. Kiểm tra email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) showError("email-err", "Email không đúng định dạng");
      else clearError("email-err");

      // 3. Kiểm tra mật khẩu
      if (password.length < 8) showError("password-err", "Mật khẩu phải từ 8 ký tự trở lên");
      else clearError("password-err");

      // 4. Kiểm tra khớp mật khẩu
      if (confirmPass !== password) showError("confirm-err", "Mật khẩu xác nhận không trùng khớp");
      else clearError("confirm-err");

      if (!hasError) {
        const payload = Object.fromEntries(new FormData(form).entries());
        alert("Đăng ký thành công!\nPayload: " + JSON.stringify(payload));
        form.reset();
        strengthBar.style.width = "0%";
      }
    });
  </script>
</body>
</html>
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao thuộc tính `novalidate` trên thẻ `<form>` lại cần thiết khi bạn tự xây dựng giao diện hiển thị lỗi tùy biến (Custom UI Validation)?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Khi trình duyệt thấy các thuộc tính như `required`, `type="email"`, nó sẽ mặc định kích hoạt popup tooltip bong bóng native che khuất giao diện và chặn submit.
- Thêm `novalidate` vào thẻ `<form>` ra lệnh cho trình duyệt **tắt bỏ popup tooltip mặc định**, nhưng **vẫn giữ nguyên toàn bộ trạng thái đánh giá logic của Constraint Validation API** (`form.checkValidity()`, `input.validity`). Nhờ vậy, lập trình viên có thể kiểm soát hoàn toàn việc render thông báo lỗi bằng CSS tùy biến một cách mượt mà và đồng bộ trên mọi nền tảng.
</details>

### Câu 2: Thuộc tính `role="alert"` trên các thẻ chứa thông báo lỗi đóng vai trò gì đối với tiêu chuẩn tiếp cận Web (WCAG)?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- `role="alert"` biến phần tử thành một **Assertive Live Region**.
- Khi JavaScript chèn nội dung thông báo lỗi vào thẻ đó (ví dụ "Email không đúng định dạng"), phần mềm đọc màn hình (Screen Reader) sẽ lập tức ưu tiên ngắt mọi âm thanh khác và đọc to thông điệp cảnh báo đó vào tai người dùng khiếm thị, giúp họ biết ngay lập tức trường nào đang bị lỗi mà không cần di chuyển tiêu điểm thủ công.
</details>
