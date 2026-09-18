# Module 03: OAuth 2.0 & OpenID Connect (OIDC)

Chào mừng bạn đến với **Module 03: OAuth 2.0 & OpenID Connect (OIDC)**. Trong kỷ nguyên kiến trúc Microservices và các ứng dụng di động/Single Page App (SPA), OAuth 2.0 và OpenID Connect là hai giao thức tiêu chuẩn công nghiệp chi phối toàn bộ việc cấp quyền (Authorization) và xác thực định danh (Authentication).

---

## 📚 Danh Mục Bài Học

1. **[01-oauth2-roles-and-grant-types.md](file:///d:/my-project/revision-document/security/03-oauth2-and-oidc/01-oauth2-roles-and-grant-types.md)**:
   - Phân định ranh giới giữa Xác thực (Authentication - Ai là bạn?) và Cấp quyền (Authorization - Bạn được phép làm gì?).
   - 4 vai trò trong OAuth 2.0: Resource Owner, Client, Authorization Server, Resource Server.
   - Các luồng cấp quyền (Grant Types): Authorization Code, Client Credentials, Device Code.
   - Tại sao Implicit Grant và Resource Owner Password Credentials (ROPC) bị chính thức khai tử (Deprecated by OAuth 2.1)?

2. **[02-authorization-code-with-pkce.md](file:///d:/my-project/revision-document/security/03-oauth2-and-oidc/02-authorization-code-with-pkce.md)**:
   - Tại sao SPAs và Ứng dụng Mobile (Public Clients) không thể giữ bí mật Client Secret?
   - Cơ chế Proof Key for Code Exchange (PKCE - RFC 7636): `code_verifier`, `code_challenge` (S256).
   - Ngăn chặn việc đánh cắp Authorization Code qua Custom URI Schemes trên điện thoại.

3. **[03-openid-connect-and-id-tokens.md](file:///d:/my-project/revision-document/security/03-oauth2-and-oidc/03-openid-connect-and-id-tokens.md)**:
   - "OAuth 2.0 is NOT an authentication protocol": Sự ra đời của OpenID Connect (OIDC).
   - Phân biệt bản chất: `id_token` (Dành riêng cho Client) vs `access_token` (Dành riêng cho API Resource Server).
   - Khám phá các Claims tiêu chuẩn: `sub` (Subject ID), `iss` (Issuer), `aud` (Audience), `exp` (Expiration).
   - Khám phá cấu hình Discovery Endpoint: `/.well-known/openid-configuration`.

4. **[04-token-rotation-and-oauth-attacks.md](file:///d:/my-project/revision-document/security/03-oauth2-and-oidc/04-token-rotation-and-oauth-attacks.md)**:
   - **Refresh Token Rotation (RTR)**: Cơ chế một lần dùng (Single-Use) và phát hiện đánh cắp theo họ token (Token Family Revocation).
   - Các cuộc tấn công OAuth kinh điển: Redirect URI Poisoning, CSRF tấn công tham số `state`, Token Leakage qua Referer Headers.

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt thuật toán**: [oauth2_pkce.mjs](file:///d:/my-project/revision-document/security/03-oauth2-and-oidc/oauth2_pkce.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/security/03-oauth2-and-oidc/practice.mjs)

Chạy lệnh kiểm thử:
```bash
rtk node security/03-oauth2-and-oidc/practice.mjs
```
