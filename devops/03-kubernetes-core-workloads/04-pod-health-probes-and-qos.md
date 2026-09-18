# 04. Pod Health Probes & Quality of Service (QoS)

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [03. Deployments, ReplicaSets & Rollouts](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/03-deployments-replicasets-and-rollouts.md).
- **Module hiện tại**: [Module 03: Kubernetes Core Workloads](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [Module 04: Kubernetes Networking & Storage](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/README.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Bộ Ba Health Probes Chuẩn Mực Trong Kubernetes
Kubelet sử dụng 3 loại Probes để theo dõi trạng thái sức khỏe của Container:

| Loại Probe | Thời Điểm Hoạt Động | Mục Đích Cốt Lõi | Hành Động Khi Thất Bại |
| :--- | :--- | :--- | :--- |
| **`startupProbe`** | Chỉ khi vừa khởi động | Dành cho ứng dụng khởi động chậm (Java, Spring, .NET, pre-caching). **Tạm vô hiệu hóa 2 probe còn lại** đến khi thành công | Khởi động lại container nếu quá `failureThreshold` |
| **`readinessProbe`** | Suốt vòng đời container | Kiểm tra app có sẵn sàng **nhận traffic người dùng** từ Service hay không (DB connected, cache warmed) | **Tách IP của Pod khỏi Service Endpoint**. KHÔNG khởi động lại container |
| **`livenessProbe`** | Sau khi startup thành công | Phát hiện container bị **Deadlock, Freeze, Treo luồng** không thể tự phục hồi | **KILLED và khởi động lại container** theo `restartPolicy` |

### 2.2 Ba Cơ Chế Kiểm Tra (Probe Handlers)
1. **`httpGet`**: Gửi HTTP GET request (vd: `/healthz`). Mã phản hồi $\ge 200$ và $< 400$ coi là thành công.
2. **`tcpSocket`**: Kiểm tra có thể mở kết nối TCP Handshake tới một cổng cụ thể hay không (dùng cho DB, Cache).
3. **`exec`**: Chạy một lệnh nhị phân bên trong container. Exit Code `0` là thành công, khác 0 là thất bại.

---

## 3. Quản Lý Tài Nguyên: Requests vs Limits & Ba Hạng QoS

### 3.1 Requests vs Limits
- **`requests` (Cam kết tài nguyên tối thiểu)**:
  - Được `kube-scheduler` dùng để quyết định xếp Pod lên Node nào. Nếu Node không còn đủ dung lượng `requests`, Pod sẽ ở trạng thái `Pending`.
- **`limits` (Giới hạn trần tối đa)**:
  - Được Linux Kernel `cgroups` thực thi.
  - **CPU Limit**: Nếu container dùng vượt CPU limit, nó bị **Throttling (Bóp xung nhịp CPU)** làm app chậm đi chứ không bị kill.
  - **Memory Limit**: Nếu container dùng vượt Memory limit, Linux Kernel lập tức **OOMKilled (Exit code 137)** để bảo vệ máy chủ!

### 3.2 Ba Phân Hạng Quality of Service (QoS)
Khi Node bị cạn kiệt tài nguyên (Memory Pressure), Kubelet sẽ trục xuất (Evict) các Pod theo thứ tự ưu tiên:

```
[ 1. BestEffort: BỊ KILL ĐẦU TIÊN KHI THIẾU RAM ]
                         ↓
[ 2. Burstable: BỊ KILL TIẾP THEO NẾU VƯỢT QUÁ REQUESTS ]
                         ↓
[ 3. Guaranteed: BẢO VỆ TUYỆT ĐỐI, CHỈ KILL CUỐI CÙNG KHI CỰC KỲ KHẨN CẤP ]
```

- **`Guaranteed`**: Khi và chỉ khi MỌI container trong Pod đều có khai báo `requests` và `limits`, đồng thời `requests == limits` cho cả CPU và RAM.
- **`Burstable`**: Có khai báo `requests` và `requests < limits`.
- **`BestEffort`**: Hoàn toàn **không khai báo** bất kỳ `requests` hoặc `limits` nào.

---

## 4. Manifest Mẫu Chuẩn Mực: Cấu Hình Probes & QoS Burstable

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payment-api
  template:
    metadata:
      labels:
        app: payment-api
    spec:
      containers:
      - name: api
        image: myregistry.com/payment:v1.0.0
        ports:
        - containerPort: 8080

        # Phân bổ tài nguyên (QoS: Burstable)
        resources:
          requests:
            cpu: "250m"       # 0.25 vCPU
            memory: "256Mi"   # 256 Megabytes
          limits:
            cpu: "1000m"      # 1.0 vCPU tối đa
            memory: "512Mi"   # Vượt quá 512Mi sẽ bị OOMKilled

        # 1. Startup Probe: Cho phép tối đa 30 * 2s = 60s để khởi động
        startupProbe:
          httpGet:
            path: /health/startup
            port: 8080
          failureThreshold: 30
          periodSeconds: 2

        # 2. Readiness Probe: Kiểm tra sẵn sàng nhận traffic
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 2
          failureThreshold: 3

        # 3. Liveness Probe: Kiểm tra sống còn
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          periodSeconds: 10
          timeoutSeconds: 2
          failureThreshold: 3
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao việc cấu hình `livenessProbe` kiểm tra kết nối Database bên ngoài là một sai lầm chết người?**
   - *Trả lời*: Nếu Database bị chậm hoặc mất kết nối tạm thời, liveness probe của toàn bộ hàng trăm Pods sẽ đồng loạt thất bại $\rightarrow$ Kubelet sẽ **kill và khởi động lại toàn bộ Pods cùng một lúc**, gây ra hiệu ứng bão tuyết (Cascading Failure) làm sập hoàn toàn hệ thống! Kiểm tra Database chỉ được phép nằm trong `readinessProbe` để tạm gỡ Pod khỏi traffic chứ không được restart Pod.
2. **Sự khác biệt về hậu quả khi Container chạm trần CPU Limit vs Memory Limit là gì?**
   - *Trả lời*: Chạm trần CPU chỉ khiến tiến trình bị **CPU Throttling** (giảm số chu kỳ xung nhịp được cấp, phản hồi chậm hơn) nhưng không bị dừng. Chạm trần Memory kích hoạt **OOM Killer** của Linux Kernel, container bị gửi tín hiệu `SIGKILL` và lập tức khởi động lại (Exit code 137).
3. **Làm thế nào để Pod được K8s xếp hạng QoS `Guaranteed`?**
   - *Trả lời*: Tất cả containers trong Pod phải thiết lập cả CPU và Memory, và giá trị `requests` phải bằng chính xác giá trị `limits` cho từng loại tài nguyên (`requests.cpu == limits.cpu` và `requests.memory == limits.memory`).
