# 03. Zero Trust Architecture & Microservices Mutual TLS (mTLS)

Mô hình bảo mật truyền thống kiểu "Lâu đài và Hào nước" (Castle-and-Moat) giả định rằng: Bất kỳ ai nằm bên ngoài tường lửa (Firewall) đều nguy hiểm, nhưng một khi đã lọt vào mạng nội bộ (VPN / Private Subnet) thì hoàn toàn đáng tin cậy.

Mô hình này đã sụp đổ hoàn toàn trong kỷ nguyên Cloud và Remote Work: Khi kẻ tấn công xâm nhập được vào 1 máy chủ thông qua mã độc hoặc lỗ hổng SSRF, chúng có thể tự do di chuyển ngang (Lateral Movement) và đánh cắp toàn bộ cơ sở dữ liệu.

---

## 1. Ba Nguyên Tắc Cốt Lõi Của Kiến Trúc Zero Trust (NIST SP 800-207)

> **"Never Trust, Always Verify" (Không bao giờ tin tưởng, luôn luôn xác thực)**

```mermaid
graph TD
    ZT["Kiến Trúc Zero Trust"]
    ZT --> ZT1["1. Xác Thực Tường Minh (Verify Explicitly)<br/>Luôn xác thực danh tính người dùng và thiết bị trên MỌI yêu cầu."]
    ZT --> ZT2["2. Đặc Quyền Tối Thiểu (Use Least Privilege Access)<br/>Chỉ cấp đúng quyền cần thiết với thời hạn ngắn nhất (JIT - Just-In-Time)."]
    ZT --> ZT3["3. Giả Định Đã Bị Xâm Nhập (Assume Breach)<br/>Mã hóa toàn bộ lưu lượng (End-to-End Encryption), cô lập phân vùng mạng."]
```

---

## 2. Xác Thực Song Phương: Mutual TLS (mTLS) Trong Microservices

Trong TLS thông thường (One-way TLS), chỉ có Client xác thực danh tính của Server thông qua chứng chỉ SSL/TLS (trình duyệt kiểm tra máy chủ `google.com`). Server không hề biết máy khách là ai ở tầng giao vận.

**Mutual TLS (mTLS)** yêu cầu **cả hai bên đều phải xuất trình và kiểm tra chứng chỉ X.509 hợp lệ của nhau:**

```mermaid
sequenceDiagram
    participant SvcA as Order Service (Client)
    participant SvcB as Payment Service (Server)
    participant CA as Nội Bộ Private CA (SPIRE / Vault)

    Note over SvcA,SvcB: Bắt tay TLS 1.3 Song Phương (mTLS)
    SvcA->>SvcB: Client Hello + Hỗ trợ Cipher Suites
    SvcB->>SvcA: Server Hello + Server Certificate X.509 + Certificate Request
    Note over SvcA: Order Service kiểm tra chứng chỉ của Payment Service với Root CA
    SvcA->>SvcB: Client Certificate X.509 + Client Key Exchange + Certificate Verify
    Note over SvcB: Payment Service kiểm tra chứng chỉ của Order Service với Root CA
    Note over SvcA,SvcB: Cả hai thiết lập kênh mã hóa AES-256-GCM an toàn!
```

---

## 3. Định Danh Chuẩn SPIFFE & Triển Khai SPIRE

Làm sao để một container trong Kubernetes chứng minh được danh tính của mình mà không cần lưu mật khẩu hay API Key tĩnh trên ổ đĩa?

- **SPIFFE (Secure Production Identity Framework for Everyone):** Chuẩn mở của CNCF định nghĩa danh tính dưới dạng URI:
  ```text
  spiffe://prod.internal.company.com/ns/finance/sa/payment-service
  ```
- **SVID (SPIFFE Verifiable Identity Document):** Danh tính được đóng gói thành một chứng chỉ X.509 ngắn hạn (thời hạn sống chỉ 1 giờ) do SPIRE tự động cấp phát và xoay vòng liên tục vào container.
- Khi Order Service gọi Payment Service, Payment Service chỉ cần đọc trường `Subject Alternative Name (SAN)` trong chứng chỉ để biết chính xác pod nào đang gọi đến.

---

## 4. Service Mesh (Istio / Linkerd Envoy Sidecar)

Thay vì buộc các lập trình viên phải tự viết mã mTLS, gia hạn chứng chỉ trong từng ứng dụng Node.js/Go:
- Một **Envoy Proxy Sidecar** được gắn chạy song song bên cạnh mỗi container.
- Envoy tự động đánh chặn toàn bộ lưu lượng mạng vào/ra, tự động mã hóa mTLS và kiểm tra danh tính SPIFFE một cách hoàn toàn trong suốt đối với mã nguồn ứng dụng (Zero-code change).
