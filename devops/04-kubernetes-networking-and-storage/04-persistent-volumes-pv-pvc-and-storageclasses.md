# 04. Persistent Volumes (PV), Claims (PVC) & StorageClasses

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [03. ConfigMaps, Secrets & Security](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/03-configmaps-secrets-and-volume-mounts.md).
- **Module hiện tại**: [Module 04: Kubernetes Networking & Storage](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [Module 05: CI/CD & GitOps](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/README.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Ứng Dụng Không Trạng Thái (Stateless) vs Có Trạng Thái (Stateful)
- Hầu hết Web API và Microservices là **Stateless**: Có thể chết, sinh ra trên node khác mà không mất dữ liệu người dùng.
- Cơ sở dữ liệu (PostgreSQL, MongoDB, Kafka, Elasticsearch) là **Stateful**: Dữ liệu phải tồn tại độc lập với vòng đời của Pod.
- Nếu bạn mount volume tạm thời `emptyDir`, khi Pod khởi động lại hoặc chuyển sang node khác, toàn bộ dữ liệu database sẽ bị xóa sạch!

### 2.2 Kiến Trúc Lưu Trữ 3 Tầng Trong Kubernetes
Kubernetes tách biệt vai trò giữa Quản trị viên Cluster (Admin) và Lập trình viên (Developer):

```
[ StorageClass (Admin cấu hình loại ổ cứng: SSD/HDD, AWS EBS CSI, Azure Disk) ]
                                      ↓ (Dynamic Provisioning)
[ PersistentVolume - PV (Miếng ổ cứng vật lý thật sự được cấp phát) ]
                                      ↑ (Binding 1-1)
[ PersistentVolumeClaim - PVC (Yêu cầu cấp phát của Developer: "Cần 20Gi RWO") ]
                                      ↑ (Volume Mount)
[ Pod (Container sử dụng thư mục dữ liệu) ]
```

### 2.3 Ba Chế Độ Truy Cập (Access Modes)
| Access Mode | Ký Hiệu | Ý Nghĩa | Công Nghệ Điển Hình |
| :--- | :--- | :--- | :--- |
| **`ReadWriteOnce`** | `RWO` | Đọc và ghi bởi **duy nhất 1 Node** tại một thời điểm | Block Storage: AWS EBS, GCP Persistent Disk, Azure Disk |
| **`ReadOnlyMany`** | `ROX` | Đọc bởi **nhiều Node** đồng thời (không được ghi) | Shared File Storage, Docker Registry mirrors |
| **`ReadWriteMany`** | `RWX` | Đọc và ghi đồng thời bởi **nhiều Node** cùng lúc | Network File Storage: NFS, AWS EFS, CephFS, Azure Files |

### 2.4 Chính Sách Thu Hồi (Reclaim Policies)
- **`Retain` (Khuyên dùng cho Production Database)**: Khi PVC bị xóa, PV và dữ liệu vật lý trên ổ đĩa **vẫn được giữ nguyên vẹn**. Trạng thái của PV chuyển sang `Released`, giúp tránh mất dữ liệu do sơ suất.
- **`Delete` (Mặc định khi cấp phát động)**: Khi PVC bị xóa, Kubernetes tự động ra lệnh cho Cloud Provider **xóa vĩnh viễn ổ đĩa vật lý** trên đám mây.

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Không Thể Gắn Volume Block Storage (RWO) Khi Pod Sang Node Khác (Multi-Attach Error)**
> Nếu một Pod sử dụng ổ đĩa AWS EBS (chế độ RWO) đang chạy ở Node A, khi Node A bị ngắt mạng và K8s tạo Pod mới ở Node B, Pod mới sẽ bị kẹt ở trạng thái `ContainerCreating` với lỗi:
> `Multi-Attach error for volume: Volume is already exclusively attached to one node`.
> - **Nguyên nhân**: AWS EBS chỉ cho phép gắn vào 1 EC2 instance duy nhất. Cần đợi AWS dettach xong ổ đĩa khỏi Node A mới attach được vào Node B.

> [!WARNING]
> **Bẫy 2: Dùng Deployment Cho Cơ Sở Dữ Liệu Cụm (Database Cluster)**
> Triển khai cơ sở dữ liệu phân tán (như MongoDB ReplicaSet, Elasticsearch, Kafka) bằng `Deployment` thông thường sẽ khiến các Pod tranh chấp cùng một PVC hoặc mất định danh network cố định.
> - **Quy tắc**: Các ứng dụng Stateful có cơ chế cluster **bắt buộc phải sử dụng `StatefulSet`** kết hợp với `volumeClaimTemplates`.

---

## 4. Manifest Mẫu Chuẩn Mực: PVC Cấp Phát Động Cho Database

```yaml
# 1. Yêu cầu cấp phát lưu trữ bền vững (PVC)
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-storage-claim
  namespace: production
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp3-ebs # Tên StorageClass hỗ trợ Dynamic Provisioning
  resources:
    requests:
      storage: 20Gi
---
# 2. Gắn PVC vào Pod PostgreSQL
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-database
  namespace: production
spec:
  replicas: 1 # RWO chỉ chạy an toàn với 1 replica
  strategy:
    type: Recreate # Bắt buộc Recreate để detach volume cũ trước khi attach pod mới
  selector:
    matchLabels:
      app: postgres-db
  template:
    metadata:
      labels:
        app: postgres-db
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: data-volume
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: data-volume
        persistentVolumeClaim:
          claimName: postgres-storage-claim
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Dynamic Volume Provisioning hoạt động như thế nào khi Developer nộp một file PVC?**
   - *Trả lời*: Khi PVC được áp dụng, Kubernetes đọc trường `storageClassName`. API Server gọi tới driver CSI (Container Storage Interface) tương ứng (vd: AWS EBS CSI driver). Driver này gửi API tới AWS để tạo một ổ đĩa EBS mới đúng dung lượng 20Gi. Sau đó, K8s tự động tạo một đối tượng PersistentVolume (PV) tương ứng và bind nó với PVC của developer. Toàn bộ quy trình diễn ra tự động mà admin không cần can thiệp.
2. **Tại sao triển khai Stateful database với chế độ RWO lại bắt buộc phải đặt `strategy.type: Recreate` thay vì `RollingUpdate`?**
   - *Trả lời*: Vì ổ đĩa RWO chỉ có thể gắn vào 1 node duy nhất tại một thời điểm. Nếu dùng `RollingUpdate`, Pod mới sẽ sinh ra trước khi Pod cũ bị kill. Nếu Pod mới rơi vào một Worker Node khác, nó sẽ bị lỗi không thể mount ổ đĩa (Multi-Attach Error) và treo vô tận. `Recreate` đảm bảo kill hoàn toàn Pod cũ và giải phóng ổ đĩa trước khi khởi động Pod mới.
3. **Khi nào bạn bắt buộc phải dùng Access Mode `ReadWriteMany` (RWX)?**
   - *Trả lời*: Khi bạn có nhiều bản sao Pods chạy trên nhiều Worker Nodes khác nhau cùng cần đọc và ghi vào chung một thư mục chia sẻ (vd: Hệ thống CMS WordPress lưu trữ thư mục upload ảnh `/wp-content/uploads`, hoặc ứng dụng xử lý file PDF cần chia sẻ thư mục đệm chung).
