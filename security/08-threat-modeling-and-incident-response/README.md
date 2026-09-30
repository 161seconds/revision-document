# Module 08: Threat Modeling, Defense-in-Depth & Incident Response

Chào mừng bạn đến với **Module 08: Threat Modeling, Defense-in-Depth & Incident Response**. Module này tập trung vào các quy trình an ninh cấp cao: Mô hình hóa mối đe dọa từ giai đoạn thiết kế (STRIDE/DREAD), phòng thủ DDoS và WAF ở các tầng mạng L3/L4/L7, thiết lập bộ tiêu đề an ninh chuẩn sản xuất (Nonce CSP, Cookie Prefixes), và quy trình xử lý khủng hoảng sự cố an ninh chuẩn quốc tế NIST SP 800-61.

---

## 📚 Danh Mục Bài Học

1. **[01-threat-modeling-stride-and-dread.md](file:///d:/my-project/revision-document/security/08-threat-modeling-and-incident-response/01-threat-modeling-stride-and-dread.md)**:
   - Sơ đồ luồng dữ liệu (DFD) và xác định các ranh giới tin cậy (Trust Boundaries).
   - Mô hình STRIDE: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege.
   - Thang lượng hóa rủi ro DREAD 5 yếu tố và phân loại mức độ khẩn cấp (Critical, High, Medium, Low).

2. **[02-waf-and-ddos-protection.md](file:///d:/my-project/revision-document/security/08-threat-modeling-and-incident-response/02-waf-and-ddos-protection.md)**:
   - Phân biệt DDoS hạ tầng mạng (L3/L4: SYN Flood, UDP Amplification) vs DDoS ứng dụng (L7: HTTP Flood, Slowloris).
   - Mô hình bảo mật tiêu cực (ModSecurity CRS Regex) vs tích cực (Schema Whitelist).
   - Nhận diện bot tự động bằng phân tích vân tay bắt tay TLS JA3/JA4 Fingerprinting.

3. **[03-production-security-headers-and-csp.md](file:///d:/my-project/revision-document/security/08-threat-modeling-and-incident-response/03-production-security-headers-and-csp.md)**:
   - Bản kê khai đầy đủ các HTTP Security Headers sản xuất.
   - Triệt tiêu XSS bằng Content-Security-Policy (CSP) thế hệ mới dựa trên Nonce ngẫu nhiên (`strict-dynamic`).
   - Tiền tố Cookie an toàn cao cấp: `__Host-` và `__Secure-` chống giả mạo cookie từ subdomain.

4. **[04-security-auditing-and-incident-response.md](file:///d:/my-project/revision-document/security/08-threat-modeling-and-incident-response/04-security-auditing-and-incident-response.md)**:
   - Vòng đời ứng phó sự cố 4 bước chuẩn NIST SP 800-61: Preparation, Detection, Containment/Eradication, Lessons Learned.
   - Nhật ký kiểm toán chống can thiệp (Tamper-Evident Audit Logging) bằng WORM và móc xích băm SHA-256 (Hash Chaining).
   - Chuẩn lượng hóa mức độ nghiêm trọng của lỗ hổng CVSS v3.1 Base Score.

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt thư viện mô hình hóa & giám sát sự cố**: [threat_incident_engine.mjs](file:///d:/my-project/revision-document/security/08-threat-modeling-and-incident-response/threat_incident_engine.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/security/08-threat-modeling-and-incident-response/practice.mjs)

Chạy kiểm thử trực tiếp:
```bash
rtk node security/08-threat-modeling-and-incident-response/practice.mjs
```
