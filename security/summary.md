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

---

## 7. OWASP API Security Top 10 (2023) Quick Reference

| Risk | Attack | Defense Strategy |
| :--- | :--- | :--- |
| **API1: BOLA (IDOR)** | Tampering with object ID in URL (`/invoices/99`). | Server-side tenant scoping (`WHERE id = :id AND org_id = :currentOrg`). |
| **API2: Broken Authentication** | Credential stuffing, missing rate limits on `/auth`. | Enforce MFA, Exponential Backoff, short-lived tokens, Account Lockout. |
| **API3: Mass Assignment** | Injecting `{"is_admin": true}` in JSON payload. | Strict DTO Whitelisting (Zod / Joi schema validation); strip unknown keys. |
| **API4: Resource Consumption** | Sending requests with `page_size=10000000`. | Enforce maximum page limits, request timeouts, and token bucket rate limits. |
| **API5: BFLA** | Regular user invokes `DELETE /api/admin/users/1`. | Centralized role & permission checking on every administrative route. |
| **API7: SSRF** | API takes webhook URL and queries internal metadata. | Restrict protocols to HTTP/HTTPS, block private RFC 1918 IPs and link-local. |
| **API9: Improper Inventory** | Attacking forgotten `/v1/` or shadow staging APIs. | Automated OpenAPI docs in CI/CD, strict deprecation schedule, API gateway routing. |
| **API10: Unsafe 3rd Party APIs** | Trusting webhook payload from partner without verification. | Verify HMAC-SHA256 signatures, validate TLS certificates, sanitize payload. |

---

## 8. Modern Authorization: RBAC vs ABAC vs ReBAC (Google Zanzibar)

- **RBAC (Role-Based)**: `User -> Roles (Admin/Editor) -> Permissions`. Simple, prone to role explosion.
- **ABAC (Attribute-Based)**: Dynamic policy evaluation: `f(Subject, Resource, Action, Environment) -> ALLOW/DENY`. Powered by OPA & Rego.
- **ReBAC (Relationship-Based / Google Zanzibar)**: Graph of relation tuples `object#relation@user`. Permissions are computed via graph traversal and inheritance (e.g. `owner` implies `editor`, `editor` implies `viewer`).

---

## 9. Zero Trust & Webhook Security Checklist

1. **Zero Trust Principles (NIST SP 800-207)**:
   - *Verify Explicitly*: Authenticate every user, device, and service.
   - *Least Privilege*: Grant minimum permissions for the shortest time.
   - *Assume Breach*: Segment networks, encrypt all internal traffic via **mTLS (Mutual TLS)** using SPIFFE/SPIRE identities.
2. **Webhook Security (Stripe/GitHub Pattern)**:
   - Header: `t={timestamp},v1={HMAC_SHA256(secret, t + "." + rawBody)}`.
   - Prevent Replay Attacks: Reject if $|t_{\text{current}} - t_{\text{header}}| > 300\text{s}$.
   - Timing-Safe Comparison: Use `crypto.timingSafeEqual` to avoid timing side-channels.

---

## 10. DevSecOps & Cloud Hardening (AWS & Kubernetes)

- **Secret Detection**: Block hardcoded secrets in pre-commit (Gitleaks, Trufflehog) using Regex and **Shannon Entropy** ($> 4.5$).
- **No Static Cloud Keys**: Use **GitHub Actions OIDC Federation** (`AssumeRoleWithWebIdentity`) to obtain temporary 15-minute AWS credentials.
- **AWS IMDSv2**: Blocks SSRF via session token requirement (`PUT /latest/api/token`) and `HttpPutResponseHopLimit = 1`.
- **KMS Envelope Encryption**: KMS encrypts a Data Encryption Key (DEK); the local app uses DEK to encrypt large datasets via AES-256-GCM.
- **Kubernetes Pod Hardening**: Set `runAsNonRoot: true`, `readOnlyRootFilesystem: true`, `cap-drop: [ALL]`, and enforce NetworkPolicy Default-Deny.

---

## 11. Threat Modeling: STRIDE & DREAD Formulas

### 11.1 STRIDE Threat Matrix
- **S**poofing $\implies$ Authentication (MFA, mTLS, JWT)
- **T**ampering $\implies$ Integrity (HMAC, Digital Signatures, SHA-256)
- **R**epudiation $\implies$ Non-repudiation (WORM Tamper-Evident Audit Logs)
- **I**nformation Disclosure $\implies$ Confidentiality (AES-256-GCM, TLS 1.3)
- **D**enial of Service $\implies$ Availability (Rate Limiting, WAF, Turnstile CAPTCHA)
- **E**levation of Privilege $\implies$ Authorization (RBAC, PoLP, Input Validation)

### 11.2 DREAD Risk Rating Formula
$$\text{Risk Score} = \frac{\text{Damage} + \text{Reproducibility} + \text{Exploitability} + \text{Affected Users} + \text{Discoverability}}{5}$$
- $\ge 8.0$: **CRITICAL** (Fix in 24 hours)
- $6.0 - 7.9$: **HIGH** (Fix in current sprint)
- $4.0 - 5.9$: **MEDIUM** (Security backlog)
- $< 4.0$: **LOW** (Accept / monitor)

---

## 12. NIST SP 800-61 Incident Response Lifecycle

$$\text{1. Preparation} \longrightarrow \text{2. Detection \& Analysis} \longrightarrow \text{3. Containment, Eradication \& Recovery} \longrightarrow \text{4. Post-Incident Review (RCA)}$$

