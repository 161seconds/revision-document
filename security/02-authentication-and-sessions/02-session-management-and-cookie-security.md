# Session Management & Cookie Security

Sau khi người dùng xác thực thành công, máy chủ cấp phát một định danh phiên làm việc (Session ID). Việc bảo vệ Session ID khỏi bị đánh cắp hoặc chiếm quyền điều khiển là trọng tâm của bảo mật phiên.

---

## 1. Bộ Cờ Cookie Bảo Mật Toàn Diện

Một Cookie lưu trữ Session ID chuẩn mực bắt buộc phải kích hoạt đầy đủ các thuộc tính bảo mật:

```http
Set-Cookie: __Host-sessionId=s_98f1c8e2b7a4; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=7200
```

### 1.1 Chi Tiết Các Cờ
- **`Secure`**: Chỉ gửi cookie qua kết nối mã hóa HTTPS. Ngăn chặn kẻ tấn công nghe lén (Sniffing) qua mạng Wi-Fi công cộng (Man-in-the-Middle).
- **`HttpOnly`**: Chặn hoàn toàn việc truy cập cookie từ JavaScript (`document.cookie`). Kể cả khi trang web dính lỗ hổng XSS, kẻ tấn công cũng **không thể đọc cắp Session ID**.
- **`SameSite=Strict`**: Không bao giờ gửi cookie trong các yêu cầu cross-origin. Vô hiệu hóa $100\%$ các cuộc tấn công CSRF.
- **Tiền tố `__Host-` (Cookie Prefix)**:
  - Bắt buộc cookie phải đi kèm cờ `Secure`.
  - Phải gửi từ host HTTPS hợp lệ.
  - Phải có thuộc tính `Path=/`.
  - **Không cho phép chia sẻ sang subdomain** (ví dụ: một subdomain bị chiếm quyền điều khiển như `blog.company.com` không thể ghi đè session của `company.com`).

---

## 2. Tấn Công Session Fixation (Cố Định Phiên) & Cách Phòng Thủ

### 2.1 Kịch Bản Khai Thác
1. Kẻ tấn công truy cập website ngân hàng và nhận được một Session ID ẩn danh chưa đăng nhập: `sessionId = 12345`.
2. Kẻ tấn công gửi một đường link có chứa session này cho nạn nhân: `https://bank.com/?session=12345`.
3. Nạn nhân mở link và đăng nhập vào tài khoản của mình.
4. **Lỗi của hệ thống**: Máy chủ giữ nguyên `sessionId = 12345` và nâng cấp quyền đăng nhập cho session đó!
5. Kẻ tấn công sử dụng lại `sessionId = 12345` để truy cập thẳng vào tài khoản của nạn nhân.

### 2.2 Quy Tắc Vàng Phòng Thủ: Tái Tạo Session ID Sau Đăng Nhập
Ngay tại thời điểm người dùng nhập đúng thông tin đăng nhập, máy chủ **BẮT BUỘC PHẢI HỦY SESSION ID CŨ VÀ CẤP PHÁT MỘT SESSION ID HOÀN TOÀN MỚI**:

```javascript
// Express.js Session Regeneration
app.post('/login', async (req, res) => {
  if (await verifyPassword(req.body.username, req.body.password)) {
    // 🛡️ Tái tạo Session ID mới, hủy session cũ
    req.session.regenerate((err) => {
      if (err) return res.status(500).send();
      req.session.userId = user.id;
      req.session.role = user.role;
      res.json({ message: 'Login successful' });
    });
  }
});
```

---

## 3. Session Hijacking & Vô Hiệu Hóa Từ Xa

Để bảo vệ người dùng trong trường hợp Session ID bị lộ:
1. **Ràng Buộc Ngữ Cảnh (Context Binding)**:
   - Lưu trữ `User-Agent` và dải Subnet IP của người dùng khi tạo session.
   - Nếu một request gửi đến có cùng Session ID nhưng đến từ một quốc gia khác hoặc một trình duyệt hoàn toàn khác (ví dụ: đang dùng Safari trên iPhone đổi thành Chrome trên Windows), lập tức hủy session và yêu cầu xác thực lại.
2. **Tính Năng Đăng Xuất Khỏi Mọi Thiết Bị ("Log Out All Devices")**:
   - Lưu một trường `token_version` hoặc `password_changed_at` trong Database của User.
   - Khi người dùng đổi mật khẩu hoặc bấm đăng xuất mọi thiết bị, tăng `token_version` lên 1. Mọi session cũ sẽ lập tức trở nên không hợp lệ.
