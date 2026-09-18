# Web Security, Authentication & Cryptography: Master Cheat Sheet

A comprehensive reference for secure software design, threat modeling, modern authentication protocols, and production cryptography.

---

## 1. OWASP Top 10 Vulnerabilities & Core Defenses

| Vulnerability | Attack Vector | Root Cause | Defense Strategy |
| :--- | :--- | :--- | :--- |
| **A01: Broken Access Control (IDOR / BOLA)** | User accesses `/api/orders/999` belonging to another tenant. | Missing authorization check on entity ownership. | Enforce Server-Side Tenant Scoping (`WHERE id = :id AND user_id = :currentUser`). |
| **A02: Cryptographic Failures** | Exposing plaintext passwords or credit cards in DB; weak MD5/SHA1. | Missing encryption at rest; outdated hashing algorithms. | **Argon2id** / **bcrypt** for passwords; **AES-256-GCM** for sensitive data; TLS 1.3 in transit. |
| **A03: Injection (SQLi, Command, LDAP)** | `' OR '1'='1` in login form. | Concatenating untrusted user input directly into executable queries. | **Prepared Statements / Parameterized Queries**; strictly forbid string concatenation. |
| **A04: Insecure Design** | Unlimited password attempts; missing rate limiting. | Architecture lacks threat modeling and abuse cases. | Rate limiting, Exponential Backoff, Account Lockouts, Threat Modeling (STRIDE). |
| **A05: Security Misconfiguration** | Default admin passwords, directory listing, detailed stack traces exposed. | Insecure framework defaults, unhardened cloud settings. | Automated CIS benchmarks, disable debug modes in prod, enforce CSP & security headers. |
| **A07: Identification & Auth Failures** | Credential stuffing; weak session IDs; session fixation. | Predictable session tokens; lack of MFA. | Regenerate session ID on login; enforce MFA (TOTP/WebAuthn); secure cookie flags. |
| **A10: Server-Side Request Forgery (SSRF)** | Server fetches user-supplied URL `http://169.254.169.254/latest/meta-data/`. | Server makes outbound HTTP calls to arbitrary URLs without validation. | Block internal IP ranges (RFC 1918 + Link-Local `169.254.x.x`), DNS resolution pinning. |

---

## 2. Modern Password Hashing Comparison

Never use general-purpose cryptographic hash functions (MD5, SHA-1, SHA-256, SHA-512) for passwords. They are designed for speed (billions of hashes/sec on GPUs), making brute-force trivial.

| Algorithm | Type | Memory Hardness | GPU / ASIC Resistance | Recommended Parameter Baseline |
| :--- | :--- | :--- | :--- | :--- |
| **Argon2id** | Modern Hybrid (Password Hashing Competition Winner) | **Yes** (Configurable memory, e.g. 64 MB) | **Maximum** (Defeats GPU/ASIC attacks) | Memory: 64 MB, Iterations: 3, Parallelism: 4 |
| **bcrypt** | Blowfish-based | No (CPU only, 4 KB cache) | High | Work Factor: $\ge 12$ (~250ms per hash) |
| **scrypt** | Memory-hard | Yes | High | $N=2^{14}, r=8, p=1$ |
| **PBKDF2** | Iterative HMAC | No (CPU only) | Low (GPU vulnerable) | $\ge 600,000$ iterations (HMAC-SHA256) |

---

## 3. Web Application Security Headers

```http
# Enforces HTTPS for all future visits, including subdomains, for 1 year
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# Restricts where resources (scripts, styles, images) can be loaded from (stops XSS)
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com; object-src 'none';

# Prevents the browser from MIME-sniffing away from the declared Content-Type
X-Content-Type-Options: nosniff

# Prevents Clickjacking by disallowing framing in <iframe>
X-Frame-Options: DENY

# Controls how much referrer information is sent in requests
Referrer-Policy: strict-origin-when-cross-origin

# Restricts access to device hardware (camera, microphone, geolocation)
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 4. Cookie Security Flags

```http
Set-Cookie: sessionId=abc123xyz; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=3600
```
- **`Secure`**: Cookie is only transmitted over encrypted HTTPS connections (never unencrypted HTTP).
- **`HttpOnly`**: JavaScript (`document.cookie`) cannot read the cookie; prevents session token theft via XSS.
- **`SameSite=Strict`**: Cookie is never sent in cross-site requests (e.g. following external links or third-party forms). Completely neutralizes CSRF attacks.
- **`SameSite=Lax`**: Cookie is sent on top-level GET navigations (safe default for user experience).

---

## 5. OAuth 2.0 & OpenID Connect (OIDC) Protocols

### 5.1 Authorization Code Flow with PKCE (Proof Key for Code Exchange)
Mandatory for all modern SPAs, Mobile Apps, and Server-side Web Apps:
1. Client generates high-entropy random string: `code_verifier`.
2. Client computes SHA-256 hash: `code_challenge = BASE64URL(SHA256(code_verifier))`.
3. Client redirects to Authorization Server with `code_challenge` and `code_challenge_method=S256`.
4. Authorization Server issues temporary authorization `code`.
5. Client exchanges `code` + `code_verifier` for tokens.
6. Authorization Server re-hashes `code_verifier` and verifies it matches original `code_challenge`. Prevents authorization code interception.

### 5.2 Token Types
- **`id_token` (OIDC)**: Encoded as a JWT. Contains user identity claims (`sub`, `email`, `iss`, `aud`). Meant exclusively for the **Client App**.
- **`access_token` (OAuth 2.0)**: Bearer token (opaque string or JWT). Grants permission to access protected APIs on the **Resource Server**.
- **`refresh_token`**: Long-lived credential used to obtain new access tokens. Must implement **Refresh Token Rotation (RTR)**: exchanging a refresh token invalidates it and returns a new one; reusing an old token revokes the entire token family (theft detection).

---

## 6. Cryptography & Public Key Infrastructure (PKI)

### 6.1 Symmetric Encryption: AES-256-GCM (AEAD)
- **AEAD (Authenticated Encryption with Associated Data)**: Encrypts plaintext AND produces a 128-bit Authentication Tag (MAC).
- Guarantees both **Confidentiality** (data cannot be read) AND **Integrity** (any tampering with ciphertext or initialization vector $IV$ causes decryption to fail instantly).
- **Rule**: Never reuse the same Nonce / IV with the same encryption key!

### 6.2 Asymmetric Cryptography: RSA vs ECC
- **RSA (Rivest-Shamir-Adleman)**: 2048-bit or 4096-bit keys. Based on prime factorization. Large key sizes, slower signatures.
- **ECC (Elliptic Curve Cryptography: ECDSA, Ed25519, Curve25519)**: 256-bit keys provide equivalent security to 3072-bit RSA with fraction of CPU and bandwidth.

### 6.3 TLS 1.3 Handshake (1-RTT)
- Eliminates insecure legacy ciphers (RSA key exchange, CBC ciphers, RC4, 3DES).
- Enforces **Perfect Forward Secrecy (PFS)** via Ephemeral Elliptic Curve Diffie-Hellman (ECDHE): Compromise of a server's private key today does NOT compromise past recorded sessions.
