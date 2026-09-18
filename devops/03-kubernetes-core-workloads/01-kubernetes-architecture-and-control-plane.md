# 01. Kubernetes Architecture & Control Plane

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 02: Docker Compose & Orchestration](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/README.md).
- **Module hiện tại**: [Module 03: Kubernetes Core Workloads](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [02. Pods & Multi-Container Patterns](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/02-pods-and-multi-container-patterns.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Mô Hình Khai Báo (Declarative Model) vs Vòng Lặp Điều Khiển (Reconciliation Loop)
- Kubernetes không hoạt động theo mệnh lệnh (Imperative: "Hãy tạo 1 container trên máy A").
- Kubernetes hoạt động theo mô hình **Khai Báo Trạng Thái Mong Muốn (Declarative Desired State)**:
  - Bạn nộp file YAML mô tả: "Tôi muốn hệ thống duy trì 3 bản sao của ứng dụng X".
  - **Reconciliation Loop (Vòng lặp tự phục hồi)** liên tục so sánh:
    $$\text{Current State (Thực tế)} \longleftrightarrow \text{Desired State (Mong muốn)}$$
  - Nếu một Worker Node chết kéo theo 1 Pod bị mất, Controller Manager lập tức phát hiện $\text{Current} = 2 < \text{Desired} = 3$ và yêu cầu Scheduler tạo ngay 1 Pod mới trên Node còn sống khác.

### 2.2 Các Thành Phần Control Plane (Master Node)
1. **`kube-apiserver`**:
   - Trung tâm thần kinh của toàn bộ Cluster.
   - Thành phần duy nhất có quyền đọc/ghi trực tiếp vào cơ sở dữ liệu `etcd`.
   - Mọi lệnh từ `kubectl`, mọi giao tiếp giữa Scheduler, Controllers và Node Agents đều đi qua API Server.
   - Xử lý các bước: Xác thực (Authentication) $\rightarrow$ Phân quyền (Authorization - RBAC) $\rightarrow$ Kiểm soát thu nhận (Admission Controllers).
2. **`etcd`**:
   - Cơ sở dữ liệu phân tán Key-Value, nhất quán cao (Strong consistency qua thuật toán đồng thuận Raft).
   - Lưu trữ toàn bộ trạng thái sống còn của Cluster (Pods, Services, Secrets, ConfigMaps).
3. **`kube-scheduler`**:
   - Lựa chọn Node phù hợp để xếp Pod dựa trên 2 giai đoạn:
     - **Filtering (Predicates)**: Lọc ra các Node có đủ CPU/RAM, thỏa mãn NodeSelector, Taints & Tolerations.
     - **Scoring (Priorities)**: Chấm điểm các Node vượt qua vòng lọc để chọn Node có điểm số tối ưu nhất.
4. **`kube-controller-manager`**:
   - Tập hợp các tiến trình điều khiển: Node Controller, Deployment/ReplicaSet Controller, EndpointSlice Controller, ServiceAccount Controller.

### 2.3 Các Thành Phần Worker Node
1. **`kubelet`**:
   - Agent chạy trực tiếp trên hệ điều hành của Worker Node.
   - Nhận PodSpecs từ API Server và chỉ thị cho Container Runtime (CRI) tải image, chạy/dừng containers.
   - Theo dõi trạng thái container và gửi báo cáo định kỳ về API Server.
2. **`kube-proxy`**:
   - Network proxy chạy trên mỗi node, duy trì các quy tắc mạng trong `iptables` hoặc `IPVS` để chuyển tiếp traffic từ IP của Service tới đúng IP của các Pods phía sau.
3. **Container Runtime Interface (CRI)**:
   - Tầng trừu tượng hóa cho phép K8s tích hợp với bất kỳ runtime chuẩn OCI nào (`containerd`, `CRI-O`).

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: etcd Bị Chậm Ổ Đĩa Gây Sập Toàn Bộ Cluster (Disk I/O Latency)**
> `etcd` cực kỳ nhạy cảm với độ trễ ghi đĩa (Fsync latency). Nếu ổ đĩa của Master Node có độ trễ fsync $> 10\text{ms}$, etcd sẽ bị timeout bầu chọn Leader (Leader Election Timeout), gây hiện tượng Split-brain hoặc tê liệt hoàn toàn API Server.
> - **Quy tắc**: Luôn chạy `etcd` trên ổ đĩa SSD NVMe chuyên dụng, không dùng chung với ổ đĩa chứa log ứng dụng.

> [!WARNING]
> **Bẫy 2: Lầm Tưởng Master Node Không Thể Chạy Pod Ứng Dụng**
> Mặc định, Master Node có một cơ chế đánh dấu gọi là **Taint**: `node-role.kubernetes.io/control-plane:NoSchedule`. Nhờ đó, Scheduler sẽ từ chối xếp Pod người dùng lên Master để bảo vệ tài nguyên hệ thống. Tuy nhiên, nếu bạn cấu hình `tolerations` phù hợp trong PodSpec, Pod vẫn có thể chạy trên Master Node.

---

## 4. Các Lệnh Điều Tra Trạng Thái Cluster Cốt Lõi

```bash
# 1. Kiểm tra trạng thái các node và vai trò
kubectl get nodes -o wide

# 2. Xem chi tiết các tiến trình Control Plane trong namespace kube-system
kubectl get pods -n kube-system

# 3. Xem etcd cluster health
kubectl exec -it etcd-master-node -n kube-system -- \
  etcdctl endpoint health --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key

# 4. Kiểm tra sự kiện (Events) của Cluster để phát hiện lỗi xếp lịch
kubectl get events --sort-by='.metadata.creationTimestamp'
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Thành phần nào trong Kubernetes có quyền đọc và ghi trực tiếp vào `etcd`?**
   - *Trả lời*: Duy nhất `kube-apiserver`. Không có bất kỳ thành phần nào khác (kể cả Controller Manager hay Scheduler) được phép kết nối trực tiếp vào etcd. Điều này đảm bảo tính toàn vẹn, xác thực và nhất quán dữ liệu.
2. **Khi một Node đột ngột mất kết nối (NotReady), Controller nào chịu trách nhiệm xử lý và hành động gì sẽ xảy ra?**
   - *Trả lời*: `Node Controller` trong `kube-controller-manager` sẽ theo dõi node heartbeat. Sau khoảng thời gian cấu hình (mặc định 5 phút - `pod-eviction-timeout`), nó sẽ đánh dấu xóa các Pod trên node chết đó và tạo bản sao thay thế trên các node khỏe mạnh khác.
3. **Sự khác nhau cơ bản giữa `kube-proxy` chế độ `iptables` và `IPVS` là gì?**
   - *Trả lời*: `iptables` duyệt các rule tuần tự $O(N)$. Khi cluster có hàng chục nghìn Services và Pods, bảng iptables phình to gây nghẽn CPU và tăng độ trễ gói tin. `IPVS` sử dụng bảng băm (Hash table) đạt độ phức tạp $O(1)$, hỗ trợ tải lớn với hiệu năng vượt trội trên các cluster quy mô lớn.
