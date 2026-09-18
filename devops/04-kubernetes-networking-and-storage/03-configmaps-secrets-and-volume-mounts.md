# 03. ConfigMaps, Secrets & Security

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. Services & Service Discovery](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/01-services-and-service-discovery.md).
- **Module hiện tại**: [Module 04: Kubernetes Networking & Storage](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [04. PV, PVC & StorageClasses](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/04-persistent-volumes-pv-pvc-and-storageclasses.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Tách Biệt Cấu Hình Khỏi Mã Nguồn (12-Factor App)
- Quy tắc bất biến trong DevOps: **Một Container Image duy nhất phải chạy được trên mọi môi trường (Dev, Staging, Production)** mà không cần build lại.
- Toàn bộ sự khác biệt giữa các môi trường (Database URL, Feature Flags, API Keys) được tiêm vào Pod thông qua **ConfigMaps** và **Secrets**.

### 2.2 ConfigMap vs Secret
| Tiêu chí | ConfigMap | Secret |
| :--- | :--- | :--- |
| **Mục đích** | Dữ liệu cấu hình công khai (plain-text) | Dữ liệu nhạy cảm (Passwords, Tokens, SSH/TLS Keys) |
| **Định dạng dữ liệu** | UTF-8 Plain text thô | **Base64 encoded** (trong manifest) |
| **Giới hạn kích thước** | Tối đa **1 MB** (do giới hạn của etcd) | Tối đa **1 MB** |
| **Các loại Secret** | N/A | `Opaque` (mặc định), `kubernetes.io/tls`, `kubernetes.io/dockerconfigjson` |

### 2.3 Hai Cách Nạp Cấu Hình Vào Pod
1. **Biến Môi Trường (`env` hoặc `envFrom`)**:
   - Giá trị được nạp cố định vào môi trường khi tiến trình container khởi động.
   - **Nhược điểm**: Khi bạn cập nhật ConfigMap, **biến môi trường trong Pod KHÔNG tự cập nhật** (bắt buộc phải restart Pod).
2. **Volume Mount (Gắn như file)**:
   - ConfigMap/Secret được chiếu thành các file thật bên trong thư mục (vd: `/etc/config/appsettings.json`).
   - **Ưu điểm vượt trội**: Kubelet tự động cập nhật nội dung file khi ConfigMap thay đổi thông qua cơ chế hoán đổi symbolic link nguyên tử (Atomic symlink swap) **mà không cần khởi động lại Pod**!

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Ngộ Nhận Base64 Là Mã Hóa (Encryption)**
> Nhiều lập trình viên lầm tưởng Secret trong K8s được mã hóa an toàn. **Base64 chỉ là một thuật toán mã hóa dạng chuỗi (Encoding)**, bất kỳ ai có quyền đọc YAML đều có thể giải mã ra mật khẩu gốc chỉ với lệnh:
> ```bash
> echo "c2VjcmV0MTIz" | base64 --decode # -> secret123
> ```
> - **Giải pháp an toàn thực sự**: Bật Encryption at Rest trong etcd, hoặc sử dụng **External Secrets Operator (ESO)** để đồng bộ mật khẩu trực tiếp từ AWS Secrets Manager / HashiCorp Vault.

> [!WARNING]
> **Bẫy 2: Commit File Secret YAML Lên Git Repository**
> Tuyệt đối không lưu các file `secret.yaml` chứa thông tin Base64 vào Git repo. Kẻ tấn công quét commit history sẽ trích xuất được toàn bộ mật khẩu Production. Sử dụng công cụ mã hóa GitOps như **Bitnami Sealed Secrets** hoặc **SOPS**.

---

## 4. Manifest Mẫu Chuẩn Mực: Tích Hợp ConfigMap & Secret Vào Pod

```yaml
# 1. ConfigMap: Cấu hình thông thường
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
  DATABASE_HOST: "postgres-service"
---
# 2. Secret: Thông tin nhạy cảm (Base64)
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
  namespace: production
type: Opaque
data:
  # echo -n "SuperAdminPass2026!" | base64
  DATABASE_PASSWORD: "U3VwZXJBZG1pblBhc3MyMDI2IQ=="
---
# 3. Deployment: Nạp cả hai nguồn
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-app
  namespace: production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-app
  template:
    metadata:
      labels:
        app: api-app
    spec:
      containers:
      - name: api
        image: myapi:1.0.0
        env:
        # Nạp từ ConfigMap
        - name: APP_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: APP_ENV
        # Nạp từ Secret
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: DATABASE_PASSWORD
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Làm thế nào để tạo một Kubernetes Secret từ dòng lệnh mà không cần tự encode Base64?**
   - *Trả lời*: Dùng lệnh: `kubectl create secret generic app-secret --from-literal=DB_PASSWORD='MySecretPassword123' --from-file=config.json=./config.json`. K8s sẽ tự động encode Base64 và tạo Secret an toàn.
2. **Khi một ConfigMap được gắn kết dưới dạng Volume Mount, điều gì xảy ra khi bạn chỉnh sửa ConfigMap đó?**
   - *Trả lời*: Kubelet chạy một chu kỳ kiểm tra định kỳ (sync frequency). Sau khoảng thời gian cấu hình (thường là vài chục giây), kubelet sẽ tạo một thư mục timestamp mới chứa file cập nhật và hoán đổi symlink nguyên tử. Ứng dụng theo dõi sự kiện file (như `fs.watch` trong Node hoặc file change monitor trong .NET) sẽ tự động nạp cấu hình mới mà không cần restart container.
3. **External Secrets Operator (ESO) giải quyết bài toán gì trong môi trường doanh nghiệp?**
   - *Trả lời*: Cho phép Kubernetes tích hợp an toàn với các hệ thống quản lý Secret chuyên nghiệp (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault). ESO tự động kéo bí mật từ Vault về và sinh ra K8s Secret cục bộ trong cluster, giúp lập trình viên không bao giờ phải viết tay hoặc lưu trữ Secret trong Git.
