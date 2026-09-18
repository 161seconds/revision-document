# Module 05: Cryptography, PKI & Transport Security

Chào mừng bạn đến với **Module 05: Cryptography, PKI & Transport Security**. Mật mã học (Cryptography) là nền tảng toán học bảo vệ toàn bộ thế giới số. Module này đưa bạn đi sâu vào mã hóa khối đối xứng có xác thực (AEAD), mật mã đường cong Elliptic, cơ sở hạ tầng khóa công khai (PKI) và giao thức truyền tải an toàn TLS 1.3.

---

## 📚 Danh Mục Bài Học

1. **[01-symmetric-encryption-aes-gcm-vs-cbc.md](file:///d:/my-project/revision-document/security/05-cryptography-and-transport-security/01-symmetric-encryption-aes-gcm-vs-cbc.md)**:
   - Advanced Encryption Standard (AES-256): Chế độ khối (Block Cipher).
   - Tại sao **AES-CBC** nguy hiểm? Lỗ hổng Padding Oracle Attack (POODLE / Lucky Thirteen).
   - Tiêu chuẩn hiện đại: **AES-GCM (Authenticated Encryption with Associated Data - AEAD)**.
   - Vai trò sống còn của Initialization Vector (IV / Nonce) và thảm họa Nonce Reuse.

2. **[02-asymmetric-encryption-rsa-and-ecc.md](file:///d:/my-project/revision-document/security/05-cryptography-and-transport-security/02-asymmetric-encryption-rsa-and-ecc.md)**:
   - RSA: Nền tảng phân tích thừa số nguyên tố, OAEP Padding.
   - **Mật mã đường cong Elliptic (ECC)**: Curve25519 / Ed25519 và NIST P-256.
   - So sánh sức mạnh: Tại sao khóa ECC 256-bit có độ an toàn tương đương RSA 3072-bit?
   - Trao đổi khóa an toàn qua kênh công khai: **Diffie-Hellman Key Exchange (ECDH)**.

3. **[03-digital-signatures-and-pki-certificates.md](file:///d:/my-project/revision-document/security/05-cryptography-and-transport-security/03-digital-signatures-and-pki-certificates.md)**:
   - Chữ ký số (Digital Signatures): Đảm bảo tính toàn vẹn (Integrity), Xác thực nguồn gốc (Authenticity) và Tính bất khả chối bỏ (Non-repudiation).
   - Cơ sở hạ tầng khóa công khai (Public Key Infrastructure - PKI).
   - Cấu trúc Chứng chỉ X.509, Tổ chức cấp phát chứng chỉ (Certificate Authorities - CAs), và Chuỗi tin cậy (Chain of Trust).
   - Thu hồi chứng chỉ: CRL (Certificate Revocation List) vs OCSP Stapling.

4. **[04-transport-layer-security-tls-13-and-hsts.md](file:///d:/my-project/revision-document/security/05-cryptography-and-transport-security/04-transport-layer-security-tls-13-and-hsts.md)**:
   - Quá trình bắt tay **TLS 1.3 Handshake (1-RTT)** so với TLS 1.2 (2-RTT).
   - **Perfect Forward Secrecy (PFS)**: Bảo vệ dữ liệu trong quá khứ kể cả khi Private Key của Server bị lộ trong tương lai.
   - Ép buộc kết nối HTTPS tuyệt đối với **HTTP Strict Transport Security (HSTS)** và danh sách Chrome Preload.

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt thuật toán**: [crypto_engine.mjs](file:///d:/my-project/revision-document/security/05-cryptography-and-transport-security/crypto_engine.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/security/05-cryptography-and-transport-security/practice.mjs)

Chạy lệnh kiểm thử:
```bash
rtk node security/05-cryptography-and-transport-security/practice.mjs
```
