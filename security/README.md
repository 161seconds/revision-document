# Web Security, Authentication & Cryptography Revision Guide

Chào mừng bạn đến với kho tài liệu ôn tập và thực hành chuyên sâu **Web Security, Authentication & Cryptography**. Kho tài liệu được thiết kế nhằm trang bị tư duy phòng thủ chiều sâu (Defense-in-Depth), kiến trúc xác thực hiện đại (OAuth2, OIDC, WebAuthn), bảo vệ API (OWASP API Top 10, ReBAC Zanzibar, mTLS), chuỗi cung ứng mã nguồn (DevSecOps, SBOM, SLSA, IMDSv2), và quy trình ứng phó sự cố chuẩn quốc tế (STRIDE, DREAD, NIST SP 800-61).

---

## 🗺️ Lộ Trình 8 Module Chuyên Sâu

```mermaid
graph TD
    M1["Module 01: Web Vulnerabilities & OWASP Top 10"] --> M2["Module 02: Authentication & Modern Sessions"]
    M2 --> M3["Module 03: OAuth 2.0 & OpenID Connect"]
    M3 --> M4["Module 04: JWT Deep Dive & Token Security"]
    M4 --> M5["Module 05: Cryptography, PKI & Transport Security"]
    M5 --> M6["Module 06: API Security, Authorization & Zero Trust"]
    M6 --> M7["Module 07: DevSecOps, Supply Chain & Cloud Hardening"]
    M7 --> M8["Module 08: Threat Modeling, Defense-in-Depth & Incident Response"]
```

### Chi Tiết Từng Module

1. **[01-web-vulnerabilities-and-owasp/](file:///d:/my-project/revision-document/security/01-web-vulnerabilities-and-owasp/README.md)**:
   - Các lỗ hổng OWASP Top 10 kinh điển: SQL Injection (SQLi), Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF).
   - Server-Side Request Forgery (SSRF): Tấn công Cloud Metadata `169.254.169.254`, DNS Rebinding, Kỹ thuật chặn IP nội bộ.
   - Broken Object Level Authorization (BOLA / IDOR) & Security Misconfigurations.
   - Cơ chế phòng thủ: Prepared Statements, Contextual Output Encoding, CSP Headers, SameSite Cookies.

2. **[02-authentication-and-sessions/](file:///d:/my-project/revision-document/security/02-authentication-and-sessions/README.md)**:
   - Lưu trữ mật khẩu an toàn: Tại sao MD5/SHA256 là thảm họa? Chuẩn hóa Argon2id, bcrypt, PBKDF2 (Memory cost, Salting).
   - Quản lý phiên Session: Cookie flags (`Secure`, `HttpOnly`, `SameSite`), Session Fixation, Session Hijacking.
   - Xác thực đa yếu tố (MFA): TOTP (RFC 6238 HMAC-SHA1 30s step), FIDO2 / WebAuthn.
   - Chống Brute-force & Credential Stuffing: Account Lockout vs Exponential Backoff.

3. **[03-oauth2-and-oidc/](file:///d:/my-project/revision-document/security/03-oauth2-and-oidc/README.md)**:
   - Các vai trò trong OAuth 2.0: Resource Owner, Client, Authorization Server, Resource Server.
   - Luồng Authorization Code với PKCE (`code_verifier`, `code_challenge` SHA-256) cho SPAs và Mobile.
   - OpenID Connect (OIDC): Tầng định danh, phân biệt `id_token` vs `access_token`, Claims (`sub`, `iss`, `aud`).
   - Refresh Token Rotation (RTR) và phát hiện đánh cắp token theo chuỗi (Token Family Revocation).

4. **[04-jwt-and-token-security/](file:///d:/my-project/revision-document/security/04-jwt-and-token-security/README.md)**:
   - Cấu trúc JSON Web Token (Header, Payload, Signature).
   - Ký đối xứng (HS256 HMAC) vs Bất đối xứng (RS256 RSA, ES256 ECDSA).
   - Các lỗ hổng JWT chí mạng: Lỗ hổng Algorithm Confusion (`alg: "none"`, HMAC-RSA public key confusion), Key Confusion.
   - Phân phối và xoay vòng khóa qua JWKS (JSON Web Key Set: `kid`, `kty`, `alg`).
   - Chiến lược thu hồi token: Redis Blacklist với TTL vs Token Versioning.

5. **[05-cryptography-and-transport-security/](file:///d:/my-project/revision-document/security/05-cryptography-and-transport-security/README.md)**:
   - Mã hóa đối xứng: AES-256-GCM (Authenticated Encryption - AEAD) vs AES-CBC (Lỗ hổng Padding Oracle).
   - Mã hóa bất đối xứng: RSA (OAEP padding) vs Elliptic Curve Cryptography (ECC, Ed25519, ECDSA).
   - Chữ ký số (Digital Signatures) và Tính bất khả chối bỏ (Non-repudiation).
   - Public Key Infrastructure (PKI): Chứng chỉ X.509, Certificate Authority (CA), Chain of Trust, OCSP Stapling.
   - Giao thức TLS 1.3: 1-RTT Handshake, Perfect Forward Secrecy (PFS via ECDHE), HTTP Strict Transport Security (HSTS).

6. **[06-api-security-and-zero-trust/](file:///d:/my-project/revision-document/security/06-api-security-and-zero-trust/README.md)**:
   - OWASP API Security Top 10 (2023 edition): BOLA, BFLA, Mass Assignment, Zombie/Shadow APIs.
   - Mô hình phân quyền hiện đại: So sánh RBAC (Vai trò), ABAC (Ngữ cảnh), ReBAC (Google Zanzibar Relation Tuples).
   - Kiến trúc Zero Trust: Verify Explicitly, Least Privilege, Assume Breach; Mutual TLS (mTLS) giữa các Microservices với SPIFFE/SPIRE.
   - Bảo mật Webhook bằng chữ ký HMAC-SHA256, Timestamp Replay Window, và cấu hình CORS Whitelist chống bypass.

7. **[07-devsecops-and-cloud-security/](file:///d:/my-project/revision-document/security/07-devsecops-and-cloud-security/README.md)**:
   - An ninh chuỗi cung ứng phần mềm: Dependency Confusion, Typosquatting, SBOM (CycloneDX, SPDX), SLSA Framework, Sigstore/Cosign.
   - Quản trị khóa bí mật (Secrets Management): Quét entropy và regex (Gitleaks), Khử khóa tĩnh bằng GitHub Actions OIDC Federation (`AssumeRoleWithWebIdentity`).
   - Hardening Container & Kubernetes: Linux Namespaces, cgroups, Seccomp, `cap-drop=ALL`, Rootless Pods, NetworkPolicy Default-Deny.
   - Củng cố an ninh Cloud: AWS IMDSv2 (Session Token & Hop Limit = 1) triệt tiêu SSRF, Cloud IAM PoLP, Mã hóa Phong Bì (Envelope Encryption).

8. **[08-threat-modeling-and-incident-response/](file:///d:/my-project/revision-document/security/08-threat-modeling-and-incident-response/README.md)**:
   - Mô hình hóa mối đe dọa: Sơ đồ luồng dữ liệu (DFDs), Ranh giới tin cậy, STRIDE Model, Thang lượng hóa rủi ro DREAD.
   - Tường lửa WAF & Phòng thủ DDoS: Phân biệt L3/L4 vs L7 (Slowloris), Nhận diện bot tự động qua TLS JA3/JA4 Fingerprinting.
   - HTTP Security Headers sản xuất: Nonce-based CSP (`'strict-dynamic'`), Tiền tố cookie an toàn `__Host-` và `__Secure-`.
   - Quy trình ứng phó sự cố an ninh NIST SP 800-61 4 bước, Nhật ký kiểm toán WORM và Móc xích băm SHA-256 (Hash Chaining), Chuẩn điểm CVSS v3.1.

---

## ⚡ Tiêu Chuẩn Thực Hành

Mỗi module từ 01 đến 08 bao gồm:
- Toàn bộ lý thuyết an ninh chuyên sâu bằng tiếng Việt chuẩn mực kèm thuật ngữ công nghiệp quốc tế.
- File code phòng thủ / cryptography algorithms chạy trực tiếp trên Node.js ES Modules.
- File `practice.mjs` với 5 bài kiểm tra assertions tự động chấm đạt/hỏng (tổng cộng 40 bài test tự động cho toàn bộ giáo trình).
