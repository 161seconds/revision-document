# 02. Ingress & Layer 7 Routing

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. Services & Service Discovery](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/01-services-and-service-discovery.md).
- **Module hiện tại**: [Module 04: Kubernetes Networking & Storage](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [03. ConfigMaps, Secrets & Security](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/03-configmaps-secrets-and-volume-mounts.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Tại Sao Cần Ingress Khi Đã Có Service?
- **Service hoạt động ở Layer 4 (Transport Layer - TCP/UDP)**:
  - Nó chỉ nhìn thấy IP nguồn, IP đích và Port.
  - Nó hoàn toàn "mù" trước các thông tin HTTP như: HTTP Headers, Cookies, URL Paths (`/api/v1`), Hostname (`api.domain.com`), và không thể giải mã SSL/TLS.
- **Ingress hoạt động ở Layer 7 (Application Layer - HTTP/HTTPS)**:
  - Cung cấp tính năng **Reverse Proxy, SSL/TLS Termination, Host-based & Path-based Routing** tập trung cho toàn bộ Cluster.

### 2.2 Ingress Resource vs Ingress Controller
Đây là câu hỏi phỏng vấn phân loại ứng viên cực kỳ phổ biến:
1. **Ingress Resource**:
   - Chỉ là một file YAML định nghĩa các luật (Rules) định tuyến ("Nếu request đến `api.example.com/v1`, hãy chuyển đến Service A").
   - **Tự bản thân Ingress Resource không làm được gì cả** nếu cluster không có Ingress Controller.
2. **Ingress Controller**:
   - Là một ứng dụng reverse proxy thật sự chạy bên trong Cluster (phổ biến nhất là **NGINX Ingress Controller**, **Traefik**, **HAProxy**).
   - Ingress Controller liên tục lắng nghe Kubernetes API Server. Mỗi khi có Ingress Resource mới được tạo hoặc sửa đổi, nó tự động cập nhật lại file cấu hình `nginx.conf` bên trong và nạp lại (reload) mà không làm rớt kết nối.

### 2.3 Cơ Chế Giải Mã SSL/TLS Termination
- Ingress Controller tiếp nhận kết nối HTTPS (Port 443) từ trình duyệt người dùng.
- Nó sử dụng chứng chỉ số SSL/TLS lưu trong Kubernetes Secret (`kubernetes.io/tls`) để giải mã gói tin.
- Sau khi giải mã, Ingress Controller chuyển tiếp traffic dưới dạng HTTP thông thường (Port 80/8080) vào mạng nội bộ tới các Backend Pods, giúp giảm tải CPU mã hóa cho các microservices phía sau.

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Quên Khai Báo `ingressClassName`**
> Từ Kubernetes 1.18+, thuộc tính `ingressClassName` (vd: `ingressClassName: nginx`) thay thế cho annotation cũ `kubernetes.io/ingress.class: "nginx"`. Nếu bạn không khai báo `ingressClassName`, Ingress Controller sẽ bỏ qua manifest này và Ingress không bao giờ được cấp phát IP.

> [!WARNING]
> **Bẫy 2: Nhầm Lẫn Giữa `pathType: Prefix` và `pathType: Exact`**
> - `Exact`: Khớp chính xác từng ký tự. Nếu cấu hình `/api`, truy cập `/api/users` sẽ bị `404 Not Found`.
> - `Prefix`: Khớp theo tiền tố phân cách bởi dấu gạch chéo `/`. Khai báo `/api` sẽ khớp cả `/api`, `/api/` và `/api/users`. Luôn ưu tiên dùng `Prefix` cho REST API.

---

## 4. Manifest Mẫu Chuẩn Mực: Ingress Layer 7 với SSL/TLS

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: platform-ingress
  namespace: production
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-production"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "20m"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.example.com
    secretName: api-tls-cert # Secret chứa tls.crt và tls.key
  rules:
  - host: api.example.com
    http:
      paths:
      # Định tuyến đường dẫn API
      - path: /api/v1
        pathType: Prefix
        backend:
          service:
            name: order-service
            port:
              number: 80
      # Định tuyến người dùng chung
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-frontend-service
            port:
              number: 80
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Sự khác biệt cốt lõi giữa Ingress Resource và Ingress Controller là gì?**
   - *Trả lời*: Ingress Resource chỉ là cấu hình định nghĩa luật (Rules) được lưu trong etcd. Ingress Controller là tiến trình phần mềm thật (Pod chạy Nginx/Envoy) thực sự tiếp nhận traffic bên ngoài, đọc các Ingress Resource và thực thi việc định tuyến Layer 7.
2. **TLS Termination tại Ingress mang lại lợi ích gì cho hệ thống Microservices?**
   - *Trả lời*: Quản lý chứng chỉ SSL tập trung tại một cửa ngõ duy nhất (kết hợp với cert-manager để tự động gia hạn Let's Encrypt), giải phóng tài nguyên CPU của các Backend Pods khỏi việc mã hóa/giải mã TLS, và đơn giản hóa việc cấu hình cho từng dịch vụ con.
3. **Làm thế nào để tự động hóa việc cấp phát chứng chỉ SSL miễn phí trong Kubernetes?**
   - *Trả lời*: Cài đặt **`cert-manager`**, tạo một `ClusterIssuer` liên kết với dịch vụ Let's Encrypt (sử dụng HTTP-01 hoặc DNS-01 challenge). Khi khai báo annotation `cert-manager.io/cluster-issuer` trên Ingress, cert-manager sẽ tự động gửi yêu cầu, xác thực và lưu chứng chỉ vào Secret mà không cần can thiệp thủ công.
