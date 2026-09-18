# Module 01: Web Vulnerabilities & OWASP Top 10

Chào mừng bạn đến với **Module 01: Web Vulnerabilities & OWASP Top 10**. Để bảo vệ một ứng dụng web trước các cuộc tấn công mạng, lập trình viên không chỉ cần viết code chạy đúng tính năng, mà phải hiểu sâu sắc các vector tấn công và cơ chế khai thác của tin tặc.

---

## 📚 Danh Mục Bài Học

1. **[01-sql-injection-and-parameterized-queries.md](file:///d:/my-project/revision-document/security/01-web-vulnerabilities-and-owasp/01-sql-injection-and-parameterized-queries.md)**:
   - Bản chất của Injection: Lẫn lộn giữa Dữ liệu (Data) và Mã lệnh (Code).
   - Các biến thể SQLi: In-band (Classic `' OR 1=1--`), Error-based, Blind SQLi (Boolean-based, Time-based sleep).
   - Cơ chế phòng thủ chuẩn mực: **Prepared Statements / Parameterized Queries**.
   - Tại sao việc Escape chuỗi bằng `addslashes` hoặc Regex là sai lầm chết người.

2. **[02-cross-site-scripting-xss-and-csp.md](file:///d:/my-project/revision-document/security/01-web-vulnerabilities-and-owasp/02-cross-site-scripting-xss-and-csp.md)**:
   - Ba biến thể XSS: Stored XSS (Lưu trong DB), Reflected XSS (Qua URL), DOM-based XSS (Thao tác client DOM nguy hiểm: `innerHTML`, `document.write`).
   - Contextual Output Encoding: Mã hóa theo ngữ cảnh (HTML Body, HTML Attribute, JavaScript Variable, URL Parameter).
   - Tuyến phòng thủ chiều sâu: **Content Security Policy (CSP)** Headers (`script-src`, `nonce-`, `object-src 'none'`).

3. **[03-cross-site-request-forgery-csrf.md](file:///d:/my-project/revision-document/security/01-web-vulnerabilities-and-owasp/03-cross-site-request-forgery-csrf.md)**:
   - Cơ chế tấn công CSRF: Lợi dụng hành vi tự động đính kèm Cookie của trình duyệt khi gửi request cross-site.
   - Cơ chế phòng thủ hiện đại: Thuộc tính Cookie `SameSite=Strict` và `SameSite=Lax`.
   - Các mẫu phòng vệ truyền thống: Synchronizer Token Pattern (CSRF Token ngẫu nhiên theo session) và Double Submit Cookie Pattern.

4. **[04-ssrf-idor-and-access-control.md](file:///d:/my-project/revision-document/security/01-web-vulnerabilities-and-owasp/04-ssrf-idor-and-access-control.md)**:
   - **Server-Side Request Forgery (SSRF)**: Tấn công Cloud Metadata (`169.254.169.254`) để cướp IAM Role credentials; vượt tường lửa nội bộ (RFC 1918 Private IPs: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.1`); Kỹ thuật phòng thủ chặn dải IP và chống DNS Rebinding.
   - **Broken Object Level Authorization (BOLA / IDOR)**: Thay đổi `GET /api/documents/100` thành `101`; quy tắc kiểm tra quyền sở hữu đối tượng ở tầng Server.

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt thuật toán**: [owasp_defenses.mjs](file:///d:/my-project/revision-document/security/01-web-vulnerabilities-and-owasp/owasp_defenses.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/security/01-web-vulnerabilities-and-owasp/practice.mjs)

Chạy lệnh kiểm thử:
```bash
rtk node security/01-web-vulnerabilities-and-owasp/practice.mjs
```
