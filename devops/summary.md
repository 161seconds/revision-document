# DevOps, Docker & Kubernetes: Master Cheat Sheet

Tổng hợp toàn diện kiến thức cốt lõi về **Containerization (Docker)**, **Orchestration (Kubernetes)**, và **CI/CD Pipelines & GitOps** phục vụ phỏng vấn kỹ sư phần mềm / DevOps / SRE và vận hành hệ thống thực tế.

---

## 1. Bản Chất Containerization & Linux Kernel
- **Container không phải máy ảo (VM)**: Container chia sẻ chung Linux Kernel của Host OS, không có Hypervisor và không cần chạy riêng một Guest OS.
- **Hai cơ chế nền tảng của Linux Kernel**:
  1. **Namespaces (Phân lập tài nguyên ảo)**:
     - `pid`: Phân lập tiến trình (Process IDs).
     - `net`: Phân lập network interfaces, routing tables, port bindings.
     - `mnt`: Phân lập file system mount points.
     - `ipc`: Phân lập Inter-Process Communication (shared memory, semaphores).
     - `uts`: Phân lập hostname và domain name.
     - `user`: Phân lập UID/GID (User & Group mapping).
  2. **cgroups (Control Groups - Giới hạn và đo lường tài nguyên)**:
     - Giới hạn cứng (hard limit) và giới hạn mềm (soft limit) cho CPU, RAM, Disk I/O, Network bandwidth.
     - Ngăn ngừa hiện tượng "noisy neighbor" hoặc một container ăn hết RAM gây OOM (Out Of Memory) sập cả host.
  3. **OverlayFS (Union Mount File System)**:
     - Xếp chồng các lớp (Layers) chỉ đọc (Read-Only Image Layers) lên nhau, phía trên cùng là một lớp mỏng có thể ghi (Read-Write Container Layer).

---

## 2. Dockerfile Best Practices & Multi-Stage Builds

### 2.1 Cấu Trúc Multi-Stage Chuẩn Mực
Tách rời công đoạn **Build (chứa compiler, SDK nặng)** khỏi công đoạn **Runtime (chỉ chứa binary/artifacts nhẹ)**:

```dockerfile
# Stage 1: Build & Test
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS builder
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore
COPY . ./
RUN dotnet publish -c Release -o /app/publish --no-restore

# Stage 2: Minimal Production Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runner
WORKDIR /app
# Bảo mật: Chạy dưới non-root user
USER app
COPY --from=builder --chown=app:app /app/publish ./
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "MyApi.dll"]
```

### 2.2 Quy Tắc Tối Ưu Cache & Kích Thước Image
1. **Sắp xếp thứ tự lệnh từ ít thay đổi đến hay thay đổi**: `COPY package.json` $\rightarrow$ `RUN npm install` $\rightarrow$ `COPY src .`.
2. **Luôn sử dụng `.dockerignore`**: Loại trừ `node_modules`, `bin/`, `obj/`, `.git`, `.env`, log files.
3. **Kết hợp lệnh `RUN`**: `apt-get update && apt-get install -y --no-install-recommends pkg && rm -rf /var/lib/apt/lists/*`.
4. **Chọn Base Image nhẹ**: Ưu tiên `alpine` (5MB) hoặc `distroless` (Google container không có shell/package manager, giảm 99% lỗ hổng CVE).
5. **Phân biệt `CMD` vs `ENTRYPOINT`**:
   - `ENTRYPOINT`: Lệnh cốt lõi không thay đổi (Exec form: `["executable", "param1"]`).
   - `CMD`: Tham số mặc định truyền vào ENTRYPOINT, có thể bị ghi đè bởi caller từ dòng lệnh.

---

## 3. Docker Storage & Networking

### 3.1 Ba Hình Thức Lưu Trữ (Storage Drivers)
- **Named Volume (`docker volume create`)**: Do Docker quản lý hoàn toàn tại `/var/lib/docker/volumes/`. An toàn, cô lập, hiệu năng cao, độc lập với vòng đời container (Khuyên dùng cho Database).
- **Bind Mount (`-v /host/path:/container/path`)**: Ánh xạ trực tiếp thư mục trên máy host vào container. Phù hợp cho môi trường Dev (Hot-reloading).
- **tmpfs Mount**: Lưu trữ tạm thời hoàn toàn trên RAM của host, không ghi vào disk. Dùng cho dữ liệu nhạy cảm hoặc bộ nhớ cache tốc độ cao.

### 3.2 Docker Networks
- **Bridge (Mặc định)**: Mạng ảo nội bộ trên host (`docker0`). Các container kết nối vào cùng Custom Bridge Network có thể phân giải IP của nhau qua Container Name (Built-in DNS).
- **Host**: Container dùng trực tiếp network stack của host (không cần ánh xạ port `-p`, throughput cực cao, mất tính cô lập port).
- **Overlay**: Định tuyến mạng đa máy chủ (Multi-host networking) trong Docker Swarm hoặc Kubernetes.
- **None**: Tắt hoàn toàn network interface bên trong container (Air-gapped).

---

## 4. Docker Compose: Orchestration Cục Bộ

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DB_CONNECTION=Server=db;Database=appdb;User=sa;Password=Secret123!;
    depends_on:
      db:
        condition: service_healthy
    networks:
      - backend-net

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_PASSWORD: Secret123!
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - backend-net

volumes:
  pgdata:

networks:
  backend-net:
    driver: bridge
```

---

## 5. Kiến Trúc Kubernetes (K8s)

```
       +-------------------------------------------------------------+
       |                     CONTROL PLANE                           |
       |  +----------------+  +--------------+  +-----------------+  |
       |  |   API Server   |  |     etcd     |  | kube-scheduler  |  |
       |  +----------------+  +--------------+  +-----------------+  |
       |  +--------------------------+                               |
       |  |  kube-controller-manager |                               |
       |  +--------------------------+                               |
       +-------------------------------------------------------------+
                                      |
                 +--------------------+--------------------+
                 |                                         |
+--------------------------------+       +--------------------------------+
|          WORKER NODE 1         |       |          WORKER NODE 2         |
|  +---------+   +------------+  |       |  +---------+   +------------+  |
|  | kubelet |   | kube-proxy |  |       |  | kubelet |   | kube-proxy |  |
|  +---------+   +------------+  |       |  +---------+   +------------+  |
|  +--------------------------+  |       |  +--------------------------+  |
|  | Container Runtime (CRI)  |  |       |  | Container Runtime (CRI)  |  |
|  | (containerd / CRI-O)     |  |       |  | (containerd / CRI-O)     |  |
|  +--------------------------+  |       |  +--------------------------+  |
|   [Pod 1]  [Pod 2]  [Pod 3]    |       |   [Pod 4]  [Pod 5]             |
+--------------------------------+       +--------------------------------+
```

### 5.1 Các Thành Phần Control Plane (Master Node)
- **API Server (`kube-apiserver`)**: Trái tim của cluster, cổng giao tiếp duy nhất (REST API), xác thực và phân quyền (RBAC). Mọi thành phần đều nói chuyện qua API Server.
- **`etcd`**: Key-value store phân tán, nhất quán (Raft consensus), lưu trữ toàn bộ trạng thái (State) và cấu hình của K8s cluster.
- **`kube-scheduler`**: Lựa chọn Node phù hợp nhất để gán Pod dựa trên tài nguyên CPU/RAM khả dụng, Taints/Tolerations, Node Affinity.
- **`kube-controller-manager`**: Chạy các vòng lặp điều khiển (Control Loops - Reconciliation) để đưa trạng thái thực tế (Current State) về trạng thái mong muốn (Desired State) (vd: Node Controller, ReplicaSet Controller).

### 5.2 Các Thành Phần Worker Node
- **`kubelet`**: Agent chạy trên mỗi node, nhận PodSpec từ API Server và điều khiển Container Runtime khởi chạy, theo dõi sức khỏe containers.
- **`kube-proxy`**: Quản lý các quy tắc mạng (iptables hoặc IPVS) trên Node để định tuyến lưu lượng từ Service đến các Pods.
- **Container Runtime (CRI)**: `containerd` hoặc `CRI-O` chịu trách nhiệm tải image, chạy và dừng container.

---

## 6. K8s Core Workloads: Pods & Deployments

### 6.1 Pod & Multi-Container Pod Patterns
- **Pod**: Đơn vị tính toán nhỏ nhất có thể triển khai trong K8s. Các container trong cùng một Pod chia sẻ chung Network Namespace (chung IP, giao tiếp qua `localhost`) và chung Volume.
- **Các mẫu thiết kế Multi-Container**:
  - **Sidecar Pattern**: Chạy kèm một container phụ trợ (như envoy proxy, log shipping agent).
  - **Init Container**: Chạy hoàn tất trước khi container chính khởi động (như migrate database schema, chờ service phụ thuộc online).

### 6.2 Deployment & Rolling Updates

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
  labels:
    app: api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Số lượng pod tối đa được tạo vượt mức replicas khi update
      maxUnavailable: 0  # Số lượng pod tối đa bị gián đoạn (0 = Zero Downtime)
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api-server
        image: myregistry.com/myapi:v1.2.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "128Mi"
            cpu: "250m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        startupProbe:
          httpGet:
            path: /health/startup
            port: 8080
          failureThreshold: 30
          periodSeconds: 2
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          periodSeconds: 10
```

---

## 7. Pod Health Probes & Quality of Service (QoS)

### 7.1 Ba Loại Health Probes
| Loại Probe | Mục Đích | Hành Động Khi Thất Bại |
| :--- | :--- | :--- |
| **`startupProbe`** | Dành cho ứng dụng khởi động chậm | Tạm dừng liveness/readiness, khởi động lại container nếu quá threshold |
| **`readinessProbe`**| Kiểm tra app đã sẵn sàng nhận traffic chưa (kết nối DB, load cache) | **Gỡ IP của Pod khỏi Service Endpoints** (không định tuyến traffic vào, không restart container) |
| **`livenessProbe`** | Phát hiện app bị Deadlock hoặc treo tiến trình | **Kill container và khởi động lại** theo `restartPolicy` |

### 7.2 Ba Hạng QoS Classes
- **Guaranteed**: `requests == limits` cho cả CPU và RAM. Pod được ưu tiên bảo vệ cao nhất, không bao giờ bị OOMKilled trước.
- **Burstable**: Có khai báo `requests` và `requests < limits`. Bị kill sau BestEffort khi node hết tài nguyên.
- **BestEffort**: Không khai báo bất kỳ `requests` hoặc `limits` nào. Là nạn nhân đầu tiên bị OOMKilled khi Node thiếu RAM.

---

## 8. K8s Networking & Service Discovery

### 8.1 Các Loại Services
- **`ClusterIP` (Mặc định)**: Cấp phát một IP nội bộ chỉ có thể truy cập được từ bên trong Cluster.
- **`NodePort`**: Mở một cổng tĩnh (30000-32767) trên mỗi Worker Node. Truy cập qua `<NodeIP>:<NodePort>`.
- **`LoadBalancer`**: Tích hợp trực tiếp với Cloud Provider (AWS NLB/ALB, GCP, Azure) để cấp phát External Public IP.
- **`ExternalName`**: Ánh xạ Service tới CNAME bên ngoài (vd: `my-db.rds.amazonaws.com`).

### 8.2 Ingress & Ingress Controller
- Service chỉ hoạt động ở Layer 4 (TCP/UDP).
- **Ingress** hoạt động ở **Layer 7 (HTTP/HTTPS)**: Cung cấp SSL/TLS Termination, Host-based routing (`api.domain.com` vs `web.domain.com`), Path-based routing (`/api/v1` vs `/api/v2`).

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.example.com
    secretName: api-tls-cert
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
```

---

## 9. ConfigMaps, Secrets & Persistent Storage

### 9.1 ConfigMap vs Secret
- **ConfigMap**: Lưu trữ cấu hình dạng plain-text (URLs, cờ tính năng, file config).
- **Secret**: Lưu trữ thông tin nhạy cảm (Passwords, API Keys, TLS certs). Mặc định mã hóa Base64 (cần bật Encryption at Rest trong etcd hoặc dùng HashiCorp Vault / External Secrets Operator).
- Cách nạp vào Pod:
  1. Biến môi trường (`env` hoặc `envFrom`).
  2. Gắn kết như Volume Mount (được tự động cập nhật khi ConfigMap thay đổi mà không cần restart pod).

### 9.2 PersistentVolume (PV) vs PersistentVolumeClaim (PVC)
- **PersistentVolume (PV)**: Vùng lưu trữ vật lý do Cluster Admin cấu hình hoặc StorageClass cấp phát động (NFS, AWS EBS, Ceph).
- **PersistentVolumeClaim (PVC)**: Yêu cầu cấp phát lưu trữ từ lập trình viên (VD: "Tôi cần 20Gi ReadWriteOnce").
- **Access Modes**:
  - `ReadWriteOnce (RWO)`: Gắn vào 1 Node duy nhất tại một thời điểm (EBS, Disk).
  - `ReadOnlyMany (ROX)`: Nhiều Node đọc đồng thời.
  - `ReadWriteMany (RWX)`: Nhiều Node cùng đọc và ghi đồng thời (NFS, EFS, CephFS).

---

## 10. CI/CD với GitHub Actions

```yaml
name: Production CI/CD Pipeline

on:
  push:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup .NET SDK
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Restore Dependencies
        run: dotnet restore

      - name: Run Unit & Integration Tests
        run: dotnet test --no-restore --verbosity normal

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build & Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:latest,ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 11. Chiến Lược Deployment & GitOps (ArgoCD)

| Chiến lược | Cơ chế | Ưu điểm | Nhược điểm |
| :--- | :--- | :--- | :--- |
| **Recreate** | Kill toàn bộ Pod cũ rồi mới khởi động Pod mới | Không xung đột schema/phiên bản | **Có Downtime** |
| **Rolling Update** | Thay thế từng Pod cũ bằng Pod mới dần dần | **Zero Downtime**, mặc định K8s | Phải tương thích ngược (Backward compatible) |
| **Blue/Green** | Duy trì song song 2 môi trường (Xanh/Đỏ), switch router | Chuyển đổi tức thì, Rollback trong 1 giây | **Gấp đôi chi phí tài nguyên phần cứng** |
| **Canary** | Chuyển 5-10% traffic người dùng sang phiên bản mới | Giảm thiểu rủi ro lỗi trên diện rộng | Cần Ingress/Service Mesh phức tạp (Istio) |

### Nguyên Lý GitOps:
- Git là **Single Source of Truth** duy nhất cho toàn bộ hệ thống.
- Công cụ GitOps (như **ArgoCD** hoặc **Flux**) chạy agent bên trong K8s cluster, liên tục so sánh (Reconciliation Loop) giữa trạng thái khai báo trong Git repo và trạng thái thực tế trong cluster, tự động đồng bộ khi có thay đổi.

---

## 12. Bảng Tra Cứu Lệnh Nhanh (CLI Fast Reference)

```bash
# Docker Essentials
docker build -t myapp:1.0 .                # Build image
docker run -d -p 8080:80 --name app myapp:1.0 # Run container ngầm
docker ps -a                                # Xem danh sách containers
docker exec -it app /bin/sh                # Mở shell trong container
docker logs -f --tail 100 app              # Xem realtime logs
docker system prune -af --volumes          # Dọn dẹp toàn bộ rác Docker

# Kubernetes Essentials
kubectl get pods -A -o wide                # Xem pods toàn bộ namespaces
kubectl describe pod <pod-name>            # Xem chi tiết events và lỗi crash
kubectl logs -f <pod-name> -c <container>  # Xem log container
kubectl apply -f manifest.yaml             # Triển khai manifest
kubectl rollout status deployment/my-dep   # Theo dõi tiến trình update
kubectl rollout undo deployment/my-dep     # Rollback về phiên bản trước
kubectl exec -it <pod-name> -- /bin/sh     # Vào trong pod debug
kubectl top nodes && kubectl top pods      # Giám sát CPU/RAM realtime
```
