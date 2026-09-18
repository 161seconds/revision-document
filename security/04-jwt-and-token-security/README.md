# Module 04: JWT Deep Dive & Token Security

Chào mừng bạn đến với **Module 04: JWT Deep Dive & Token Security**. JSON Web Token (RFC 7519) là tiêu chuẩn định dạng token phổ biến nhất trên Internet hiện nay. Tuy nhiên, việc triển khai JWT sai lầm thường xuyên dẫn đến các lỗ hổng nghiêm trọng cho phép tin tặc giả mạo token quản trị viên mà không cần biết khóa bí mật.

---

## 📚 Danh Mục Bài Học

1. **[01-jwt-anatomy-and-encoding.md](file:///d:/my-project/revision-document/security/04-jwt-and-token-security/01-jwt-anatomy-and-encoding.md)**:
   - Cấu tạo 3 phần của JWT: `Header.Payload.Signature`.
   - Tại sao Base64URL **KHÔNG PHẢI LÀ MÃ HÓA**? (Dữ liệu hoàn toàn là bản rõ công khai ai cũng đọc được).
   - Các Registered Claims: `sub`, `iss`, `aud`, `exp`, `nbf`, `iat`, `jti`.

2. **[02-symmetric-vs-asymmetric-signing.md](file:///d:/my-project/revision-document/security/04-jwt-and-token-security/02-symmetric-vs-asymmetric-signing.md)**:
   - Ký đối xứng: **HS256 (HMAC-SHA256)** - Cùng một Shared Secret để ký và kiểm tra (Nguy cơ rò rỉ secret sang các microservices khác).
   - Ký bất đối xứng: **RS256 (RSA)** và **ES256 (ECDSA)** - Auth Server giữ Private Key để ký; toàn bộ Microservices và bên thứ ba dùng Public Key để verify an toàn.

3. **[03-jwt-vulnerabilities-algorithm-confusion.md](file:///d:/my-project/revision-document/security/04-jwt-and-token-security/03-jwt-vulnerabilities-algorithm-confusion.md)**:
   - Lỗ hổng kinh điển: **"None" Algorithm (`alg: "none"`)** - Tự ký token không cần signature.
   - Lỗ hổng **Algorithm Confusion (HMAC vs RSA Key Confusion)**: Kẻ tấn công đổi `alg: "RS256"` thành `"HS256"` và dùng chính RSA Public Key công khai của server làm HMAC Secret để ký giả mạo token Admin!
   - Tấn công phát lại (Token Replay Attacks) và rò rỉ khóa yếu.

4. **[04-jwks-key-rotation-and-revocation.md](file:///d:/my-project/revision-document/security/04-jwt-and-token-security/04-jwks-key-rotation-and-revocation.md)**:
   - Cơ chế xoay vòng khóa không gây downtime với **JSON Web Key Set (JWKS)**: `keys`, `kid` (Key ID), `kty`, `alg`, `use`.
   - Bài toán nan giải: "Làm thế nào để thu hồi (Revoke) một Stateless JWT trước khi nó hết hạn?".
   - Giải pháp sản xuất: Redis Token Blacklist với TTL tự động giải phóng vs Token Versioning trong User DB.

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt thuật toán**: [jwt_engine.mjs](file:///d:/my-project/revision-document/security/04-jwt-and-token-security/jwt_engine.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/security/04-jwt-and-token-security/practice.mjs)

Chạy lệnh kiểm thử:
```bash
rtk node security/04-jwt-and-token-security/practice.mjs
```
