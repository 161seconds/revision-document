# 03. Deployments, ReplicaSets & Rollouts

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [02. Pods & Multi-Container Patterns](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/02-pods-and-multi-container-patterns.md).
- **Module hiện tại**: [Module 03: Kubernetes Core Workloads](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [04. Pod Health Probes & QoS](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/04-pod-health-probes-and-qos.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Cây Phân Cấp: Deployment $\rightarrow$ ReplicaSet $\rightarrow$ Pods
Trong thực tế sản xuất, bạn **hầu như không bao giờ tạo Pod trần (Naked Pod)**.
Lý do: Nếu Node chạy một Naked Pod bị sập, Pod đó sẽ biến mất vĩnh viễn và không bao giờ được tự động tạo lại!
Kubernetes quản lý theo mô hình phân cấp 3 tầng:

```
[ Deployment: Quản lý chiến lược nâng cấp phiên bản & Rollback ]
                             ↓
[ ReplicaSet: Đảm bảo số lượng bản sao (Replicas) luôn chính xác ]
                             ↓
[ Pods: Các đơn vị thực thi chứa containers thật sự ]
```

- Khi bạn cập nhật image trong Deployment:
  1. Deployment Controller tạo một **ReplicaSet mới** (New RS) với image mới.
  2. Scale up New RS từng Pod một: $0 \rightarrow 1 \rightarrow 2 \dots$
  3. Scale down Old RS tương ứng: $3 \rightarrow 2 \rightarrow 1 \rightarrow 0$.
  4. Giữ lại Old RS với `replicas: 0` để phục vụ Rollback khi cần!

### 2.2 Toán Học Của Zero-Downtime Rolling Update
Hai tham số cốt lõi trong `spec.strategy.rollingUpdate`:
1. **`maxSurge`**: Số lượng Pod tối đa được phép tạo **vượt mức** `spec.replicas` trong suốt quá trình cập nhật.
   - *Ví dụ*: `replicas: 4`, `maxSurge: 1` $\rightarrow$ Tối đa có $4 + 1 = 5$ Pods cùng tồn tại lúc cao điểm.
2. **`maxUnavailable`**: Số lượng Pod tối đa được phép **ở trạng thái không sẵn sàng** (Unavailable).
   - **Quy tắc Zero-Downtime**: **Đặt `maxUnavailable: 0`**.
   - Điều này đảm bảo hệ thống luôn luôn duy trì **ít nhất 100% dung lượng phục vụ**, không bao giờ bị giảm dù chỉ 1 Pod trong suốt quá trình deploy.

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Không Có `readinessProbe` Khiến Zero-Downtime Thất Bại Hoàn Toàn**
> Nếu Deployment không khai báo `readinessProbe`, K8s coi Pod mới là "Sẵn sàng" ngay khi container vừa chạy (Process started). K8s lập tức kill Pod cũ trong khi Pod mới còn đang load code, kết nối DB $\rightarrow$ Toàn bộ người dùng gửi request vào thời điểm này sẽ nhận mã lỗi `502 Bad Gateway`.
> - **Nguyên tắc sống còn**: RollingUpdate chỉ thực sự Zero-Downtime khi đi kèm `readinessProbe` chính xác.

> [!WARNING]
> **Bẫy 2: Dùng Tag `:latest` Cho Container Image**
> Nếu Deployment dùng `image: myapi:latest`, khi bạn push code mới với tag `latest` và chạy `kubectl apply`, K8s sẽ **từ chối cập nhật** vì file manifest YAML không hề có sự thay đổi nào!
> - **Giải pháp**: Luôn gắn tag phiên bản cố định (Immutable tags) theo Git Commit SHA hoặc Semantic Versioning: `myapi:v1.2.4` hoặc `myapi:sha-a421fbe`.

---

## 4. Manifest Mẫu Chuẩn Production: Zero-Downtime Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  labels:
    app: order-service
spec:
  replicas: 4
  revisionHistoryLimit: 10 # Giữ lại 10 bản lịch sử để rollback
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%         # Cho phép tạo thêm 1 pod (25% của 4)
      maxUnavailable: 0     # Tuyệt đối không giảm số lượng phục vụ
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
      - name: api
        image: ghcr.io/myorg/order-service:v2.1.0
        ports:
        - containerPort: 8080
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## 5. Các Lệnh Vận Hành & Rollback Tức Thì

```bash
# 1. Theo dõi tiến trình cập nhật Rolling Update trực tiếp
kubectl rollout status deployment/order-service

# 2. Xem lịch sử các phiên bản đã deploy
kubectl rollout history deployment/order-service

# 3. Rollback ngay lập tức về phiên bản liền kề trước đó (chỉ tốn 1-2 giây)
kubectl rollout undo deployment/order-service

# 4. Rollback về một phiên bản revision cụ thể
kubectl rollout undo deployment/order-service --to-revision=2

# 5. Khởi động lại toàn bộ Pods mà không đổi image (Restart Pods)
kubectl rollout restart deployment/order-service
```

---

## 6. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao K8s không xóa bỏ ReplicaSet cũ sau khi Rolling Update hoàn tất?**
   - *Trả lời*: Để hỗ trợ tính năng **Instant Rollback**. ReplicaSet cũ được scale về `replicas: 0` nhưng vẫn giữ nguyên Pod Template cũ trong etcd. Khi gọi lệnh `kubectl rollout undo`, Deployment chỉ cần scale up ReplicaSet cũ lên lại mà không cần tải lại manifest cũ.
2. **Chiến lược `Recreate` khác gì so với `RollingUpdate` và khi nào bắt buộc phải dùng nó?**
   - *Trả lời*: `Recreate` sẽ kill toàn bộ Pods phiên bản cũ về 0 rồi mới tạo Pods phiên bản mới (gây ra Downtime). Bắt buộc phải dùng khi ứng dụng không thể chạy đa phiên bản song song (vd: Batch job ghi độc quyền vào một cơ sở dữ liệu không hỗ trợ concurrent schema, hoặc ứng dụng dùng ổ đĩa ReadWriteOnce đơn lẻ).
3. **Ý nghĩa của `revisionHistoryLimit` là gì?**
   - *Trả lời*: Số lượng ReplicaSet cũ tối đa được lưu trữ trong cluster (mặc định là 10). Nếu không giới hạn, các ReplicaSet rác sẽ tích tụ làm phình to cơ sở dữ liệu `etcd` và gây chậm trễ cho API Server.
