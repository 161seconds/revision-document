# 01. Threat Modeling Methodologies: STRIDE & DREAD

Mô hình hóa mối đe dọa (Threat Modeling) là kỹ thuật phân tích kiến trúc an ninh ngay từ giai đoạn thiết kế (Design Phase) trước khi viết bất kỳ dòng mã nào. Khắc phục một lỗ hổng kiến trúc trong giai đoạn thiết kế tiết kiệm chi phí gấp **30 - 100 lần** so với việc phải vá lỗ hổng khẩn cấp khi hệ thống đã hoạt động trên production.

---

## 1. Sơ Đồ Luồng Dữ Liệu & Ranh Giới Tin Cậy (Data Flow Diagrams & Trust Boundaries)

Mọi cuộc tấn công mạng đều xảy ra khi dữ liệu băng qua một **Ranh giới tin cậy (Trust Boundary)** - ranh giới phân tách giữa vùng có mức độ tin cậy thấp và vùng có mức độ tin cậy cao hơn.

```mermaid
graph LR
    subgraph Vùng Không Tin Cậy (Untrusted Zone)
        Attacker["Client Trình Duyệt / Kẻ Tấn Công"]
    end
    
    subgraph Ranh Giới Tin Cậy 1 (Trust Boundary 1)
        WAF["Cloudflare WAF / API Gateway"]
    end
    
    subgraph Ranh Giới Tin Cậy 2 (Trust Boundary 2)
        Backend["App Microservices (Cluster)"]
    end
    
    subgraph Vùng Tuyệt Đối An Toàn (Core Zone)
        DB[("Database / KMS HSM")]
    end
    
    Attacker -->|HTTP Untrusted Input| WAF
    WAF -->|Sanitized Requests| Backend
    Backend -->|Internal SQL / Queries| DB
```

---

## 2. Mô Hình Phân Loại Mối Đe Dọa: STRIDE (Microsoft Standard)

Được phát triển bởi Praerit Garg và Loren Kohnfelder tại Microsoft, **STRIDE** phân loại mọi mối nguy thành 6 nhóm tương ứng với 6 mục tiêu bảo mật:

| Mối đe dọa (STRIDE) | Hành vi của kẻ tấn công | Thuộc tính an ninh bị xâm phạm | Cơ chế phòng thủ đối ứng |
| :--- | :--- | :--- | :--- |
| **S - Spoofing (Giả mạo)** | Mạo danh người dùng, tiến trình hoặc máy chủ khác. | **Authentication (Xác thực)** | MFA, Chữ ký số, Chứng chỉ X.509, mTLS, JWT. |
| **T - Tampering (Can thiệp)** | Sửa đổi trái phép dữ liệu trong bộ nhớ, trên đĩa hoặc đường truyền. | **Integrity (Toàn vẹn)** | Chữ ký HMAC, SHA-256 Checksums, TLS 1.3, Prepared Statements. |
| **R - Repudiation (Chối bỏ)** | Người dùng thực hiện hành vi xấu nhưng tuyên bố *"Tôi không làm việc đó!"*. | **Non-repudiation (Bất khả chối bỏ)** | Ghi nhật ký kiểm toán bất biến (Audit Logs), Chữ ký số bất đối xứng. |
| **I - Information Disclosure (Lộ lọt thông tin)** | Đọc trộm dữ liệu nhạy cảm (mật khẩu, số thẻ, PII). | **Confidentiality (Bảo mật)** | Mã hóa dữ liệu lúc nghỉ (AES-256-GCM), Mã hóa đường truyền (HTTPS), IAM. |
| **D - Denial of Service (Từ chối dịch vụ)** | Làm cạn kiệt tài nguyên (CPU, RAM, kết nối mạng) khiến hệ thống tê liệt. | **Availability (Độ sẵn sàng)** | Rate Limiting, CAPTCHA, Auto-scaling, Tường lửa WAF chống DDoS. |
| **E - Elevation of Privilege (Leo thang đặc quyền)** | Người dùng thường giành được quyền quản trị viên (Admin/Root). | **Authorization (Phân quyền)** | Nguyên tắc đặc quyền tối thiểu (PoLP), RBAC, Input Validation. |

---

## 3. Lượng Hóa Mức Độ Rủi Ro: Mô Hình DREAD

Khi phát hiện 20 nguy cơ an ninh, đội ngũ kỹ thuật cần biết nên ưu tiên sửa lỗi nào trước. Mô hình **DREAD** chấm điểm từng nguy cơ trên thang điểm từ 0 đến 10 cho 5 khía cạnh:

$$\text{DREAD Score} = \frac{\text{Damage} + \text{Reproducibility} + \text{Exploitability} + \text{Affected Users} + \text{Discoverability}}{5}$$

1. **Damage Potential (Mức độ thiệt hại - D):** Nếu bị khai thác, kẻ tấn công gây hại bao nhiêu? (10: Kiểm soát toàn bộ hệ thống; 1: Lộ dữ liệu vô hại).
2. **Reproducibility (Khả năng tái lập - R):** Lỗ hổng có tái lập dễ dàng không? (10: $100\%$ lúc nào cũng chạy; 1: Rất khó, cần điều kiện mạng ngẫu nhiên).
3. **Exploitability (Độ dễ khai thác - E):** Cần trình độ kỹ thuật cỡ nào? (10: Trẻ em cũng làm được chỉ với trình duyệt web; 1: Cần chuyên gia mật mã học hàng đầu).
4. **Affected Users (Số người dùng bị ảnh hưởng - A):** Tỷ lệ nạn nhân? (10: $100\%$ toàn bộ khách hàng; 1: Chỉ 1 người dùng cá biệt).
5. **Discoverability (Độ dễ phát hiện - D):** Lỗ hổng có dễ tìm ra không? (10: Hiện rõ trên thanh địa chỉ URL; 1: Giấu kín trong mã nguồn nhị phân).

### Thang Phân Loại Mức Độ Khẩn Cấp
- **$8.0 - 10.0$ (Critical - Nghiêm trọng tối đa):** Dừng toàn bộ phát hành tính năng mới, vá ngay trong 24 giờ!
- **$6.0 - 7.9$ (High - Cao):** Lên kế hoạch vá trong sprint hiện tại.
- **$4.0 - 5.9$ (Medium - Trung bình):** Đưa vào backlog bảo mật.
- **$< 4.0$ (Low - Thấp):** Ghi nhận rủi ro, chấp nhận hoặc khắc phục khi thuận tiện.
