# Module 06: API Security, Authorization & Zero Trust

Chào mừng bạn đến với **Module 06: API Security, Authorization & Zero Trust**. Module này tập trung vào các tiêu chuẩn an ninh ứng dụng hiện đại, phòng chống 10 nguy cơ API hàng đầu của OWASP, thiết kế hệ thống phân quyền quy mô lớn (RBAC/ABAC/ReBAC), và xây dựng kiến trúc mạng Zero Trust bảo vệ giao tiếp giữa các microservices.

---

## 📚 Danh Mục Bài Học

1. **[01-owasp-api-security-top-10.md](file:///d:/my-project/revision-document/security/06-api-security-and-zero-trust/01-owasp-api-security-top-10.md)**:
   - Phân tích chi tiết OWASP API Security Top 10 (Phiên bản mới nhất 2023).
   - Broken Object Level Authorization (BOLA / IDOR) và cơ chế phòng thủ Tenant Scoping.
   - Broken Object Property Level Authorization (Mass Assignment & Excessive Data Exposure) với DTO Whitelisting.
   - Broken Function Level Authorization (BFLA) và quản lý vòng đời Zombie/Shadow APIs.

2. **[02-access-control-models-rbac-abac-rebac.md](file:///d:/my-project/revision-document/security/06-api-security-and-zero-trust/02-access-control-models-rbac-abac-rebac.md)**:
   - So sánh chuyên sâu RBAC (Vai trò), ABAC (Thuộc tính ngữ cảnh), ReBAC (Mối quan hệ đồ thị).
   - Kiến trúc Google Zanzibar: Quan hệ Tuple (`object#relation@user`) và suy diễn quyền theo đồ thị.
   - Chính sách phân quyền dưới dạng mã nguồn (Policy-as-Code) với Open Policy Agent (OPA) và Rego.

3. **[03-zero-trust-and-microservices-mtls.md](file:///d:/my-project/revision-document/security/06-api-security-and-zero-trust/03-zero-trust-and-microservices-mtls.md)**:
   - Ba nguyên tắc Zero Trust: Verify Explicitly, Least Privilege, Assume Breach.
   - Bắt tay TLS 1.3 song phương (Mutual TLS - mTLS) giữa các microservices.
   - Khung định danh phân tán SPIFFE / SPIRE và cơ chế chứng chỉ ngắn hạn SVID.
   - Triển khai Service Mesh trong suốt qua Envoy Sidecar Proxies.

4. **[04-secure-api-design-cors-and-webhooks.md](file:///d:/my-project/revision-document/security/06-api-security-and-zero-trust/04-secure-api-design-cors-and-webhooks.md)**:
   - Chuẩn bảo mật Webhook Stripe/GitHub: Chữ ký HMAC-SHA256, Timestamp Replay Window và so sánh Timing-Safe.
   - Bản chất CORS: Tại sao CORS không bảo vệ backend khỏi hacker?
   - Cảnh báo bẫy phản chiếu Origin (Reflected Origin) và Wildcard Credentials.

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt thư viện phòng thủ & mô phỏng**: [api_security.mjs](file:///d:/my-project/revision-document/security/06-api-security-and-zero-trust/api_security.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/security/06-api-security-and-zero-trust/practice.mjs)

Chạy kiểm thử trực tiếp:
```bash
rtk node security/06-api-security-and-zero-trust/practice.mjs
```
