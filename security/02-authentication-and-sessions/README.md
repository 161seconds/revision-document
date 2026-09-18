# Module 02: Authentication & Modern Session Protocols

Chào mừng bạn đến với **Module 02: Authentication & Modern Session Protocols**. Nhận dạng và Xác thực (Authentication) là cổng thành đầu tiên của mọi hệ thống phần mềm. Một sai lầm nhỏ trong thuật toán băm mật khẩu hoặc cờ cookie có thể khiến toàn bộ cơ sở dữ liệu tài khoản người dùng bị xâm nhập.

---

## 📚 Danh Mục Bài Học

1. **[01-password-storage-argon2-and-bcrypt.md](file:///d:/my-project/revision-document/security/02-authentication-and-sessions/01-password-storage-argon2-and-bcrypt.md)**:
   - Tại sao MD5, SHA-1, SHA-256 là thảm họa khi dùng cho mật khẩu? (Tốc độ hàng tỷ hash/giây trên GPU/ASIC).
   - Cơ chế Salting ngẫu nhiên để triệt tiêu Rainbow Tables.
   - Các thuật toán hiện đại: **Argon2id** (Memory-hard winner), **bcrypt** (Work factor chi phí CPU), và PBKDF2.

2. **[02-session-management-and-cookie-security.md](file:///d:/my-project/revision-document/security/02-authentication-and-sessions/02-session-management-and-cookie-security.md)**:
   - Bộ cờ Cookie bất tử: `Secure`, `HttpOnly`, `SameSite=Strict`, `__Host-` prefix.
   - Tấn công **Session Fixation**: Cố định session ID trước khi đăng nhập và giải pháp tái tạo Session ID (`session.regenerate()`).
   - Tấn công **Session Hijacking**: Đánh cắp session qua mạng Wi-Fi công cộng hoặc XSS.

3. **[03-multi-factor-authentication-totp-and-webauthn.md](file:///d:/my-project/revision-document/security/02-authentication-and-sessions/03-multi-factor-authentication-totp-and-webauthn.md)**:
   - **TOTP (Time-based One-Time Password - RFC 6238)**: Thuật toán tính toán OTP 6 chữ số dựa trên Shared Secret, HMAC-SHA1 và bước thời gian 30 giây (Google Authenticator / Authy).
   - **FIDO2 / WebAuthn**: Xác thực không mật khẩu (Passwordless) dựa trên cặp khóa công khai/khóa bí mật phần cứng (Passkeys, YubiKey, TouchID/FaceID) chống lại hoàn toàn $100\%$ các cuộc tấn công lừa đảo (Phishing-resistant).

4. **[04-brute-force-and-credential-stuffing-defenses.md](file:///d:/my-project/revision-document/security/02-authentication-and-sessions/04-brute-force-and-credential-stuffing-defenses.md)**:
   - Tấn công dò mật khẩu (Brute Force) và Sử dụng danh sách tài khoản rò rỉ (Credential Stuffing).
   - Đánh đổi giữa **Khóa tài khoản (Account Lockout)** (Nguy cơ DoS tài khoản người dùng) và **Trì hoãn cấp số nhân (Exponential Backoff)**.
   - CAPTCHA vô hình và Proof-of-Work (PoW).

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt thuật toán**: [auth_protocols.mjs](file:///d:/my-project/revision-document/security/02-authentication-and-sessions/auth_protocols.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/security/02-authentication-and-sessions/practice.mjs)

Chạy lệnh kiểm thử:
```bash
rtk node security/02-authentication-and-sessions/practice.mjs
```
