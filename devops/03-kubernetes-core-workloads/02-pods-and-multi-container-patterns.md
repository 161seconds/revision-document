# 02. Pods & Multi-Container Patterns

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. Kubernetes Architecture & Control Plane](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/01-kubernetes-architecture-and-control-plane.md).
- **Module hiện tại**: [Module 03: Kubernetes Core Workloads](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [03. Deployments, ReplicaSets & Rollouts](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/03-deployments-replicasets-and-rollouts.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Pod Anatomy: Cơ Chế Chia Sẻ Bên Trong Pod
- **Pod** là đơn vị tính toán có thể lập lịch nhỏ nhất trong Kubernetes.
- Một Pod có thể chứa một hoặc nhiều containers gắn kết chặt chẽ (Co-located & Co-scheduled).
- **Cơ chế hoạt động**:
  - Khi một Pod được tạo ra, K8s khởi chạy một container ngầm đặc biệt gọi là **Pause Container** (hoặc `infra` container).
  - Pause container giữ cố định **Network Namespace** và **IPC Namespace**.
  - Các container của ứng dụng sau đó cùng tham gia vào Network Namespace này (`--net=container:pause`).
  - **Hệ quả**:
    1. Tất cả container trong Pod dùng chung một địa chỉ IP duy nhất.
    2. Các container có thể gọi nhau trực tiếp qua **`localhost:<port>`** với độ trễ gần như bằng 0.
    3. Hai container trong cùng 1 Pod **không được phép bind vào cùng một cổng**.

### 2.2 Init Containers (Container Khởi Tạo)
- Chạy tuần tự từng container một đến khi **kết thúc thành công (Exit code 0)** trước khi bất kỳ App Container chính nào được khởi động.
- Nếu một Init Container thất bại, K8s sẽ khởi động lại toàn bộ Pod theo `restartPolicy`.
- **Ứng dụng thực tế**:
  - Chạy Database Migrations (`dotnet ef database update`, `prisma migrate deploy`).
  - Chờ dịch vụ phụ thuộc online (`until nc -z database 5432; do sleep 2; done`).
  - Tải file cấu hình, TLS certificates hoặc pre-warm cache vào Shared Volume.

---

## 3. Ba Mẫu Thiết Kế Multi-Container Kinh Điển

### 3.1 Sidecar Pattern (Phổ Biến Nhất)
- Bổ trợ tính năng phụ trợ cho container chính mà không can thiệp vào mã nguồn của container chính.
- *Ví dụ*: Container chính chạy Web App ghi log ra file `/var/log/app.log`. Container Sidecar (Fluent Bit / Vector) mount chung volume đó để đọc và đẩy log về Elasticsearch / Loki.

### 3.2 Adapter Pattern
- Đóng vai trò bộ chuyển đổi định dạng chuẩn hóa ra bên ngoài.
- *Ví dụ*: Container chính xuất metrics ở định dạng JSON thô hoặc JMX. Container Adapter đọc định dạng này và chuyển đổi thành chuẩn Prometheus (`/metrics`) để hệ thống giám sát dễ dàng cào dữ liệu.

### 3.3 Ambassador Pattern
- Đóng vai trò proxy đại diện kết nối ra các hệ thống bên ngoài phức tạp.
- *Ví dụ*: Container chính chỉ cần gửi truy vấn tới `localhost:6379`. Container Ambassador đứng cạnh sẽ tự động định tuyến truy vấn đó tới Redis Sharding Cluster hoặc Read/Write Replicas phù hợp.

---

## 4. Manifest Mẫu Chuẩn Mực: Pod Đa Container Kết Hợp Shared Volume

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-with-sidecar
  labels:
    app: secure-web
spec:
  # 1. Init Container: Đợi Database sẵn sàng
  initContainers:
  - name: wait-for-db
    image: busybox:1.36
    command: ['sh', '-c', 'echo "Checking DB connectivity..."; sleep 2; echo "DB Ready!"']

  # 2. Containers chính và Sidecar
  containers:
  # Container chính: Nginx Web Server
  - name: web-app
    image: nginx:alpine
    ports:
    - containerPort: 80
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log/nginx

  # Container phụ (Sidecar): Giám sát log
  - name: log-shipper
    image: busybox:1.36
    command: ['sh', '-c', 'tail -F /var/log/nginx/access.log']
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log/nginx

  # 3. Volume chia sẻ trên RAM (emptyDir)
  volumes:
  - name: shared-logs
    emptyDir: {}
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao các container trong cùng một Pod lại có thể giao tiếp qua `localhost`?**
   - *Trả lời*: Nhờ chia sẻ chung Network Namespace do Pause Container thiết lập khi Pod khởi tạo. Chúng dùng chung loopback interface ảo nên kết nối giữa các container trong Pod tương đương với giao tiếp giữa các tiến trình cục bộ trên cùng một máy.
2. **Nếu một Init Container chạy vô tận (bị treo vòng lặp hoặc timeout), trạng thái của Pod sẽ hiển thị là gì?**
   - *Trả lời*: Pod sẽ bị kẹt ở trạng thái `Init:0/1` (hoặc `Init:CrashLoopBackOff` nếu Init Container bị lỗi và liên tục khởi động lại). Các container ứng dụng chính sẽ không bao giờ được khởi động.
3. **Khi nào NÊN và KHÔNG NÊN gộp nhiều container vào chung một Pod?**
   - *Trả lời*: **NÊN** khi hai container có vòng đời gắn liền 1-1, cần chia sẻ trực tiếp bộ nhớ/volume hoặc giao tiếp cực nhanh qua localhost (như App + Envoy Proxy, App + Log Agent). **KHÔNG NÊN** gộp các dịch vụ có thể mở rộng độc lập (như Web Frontend + Backend API + Database); chúng phải được tách thành các Pod riêng biệt để có thể scale độc lập.
