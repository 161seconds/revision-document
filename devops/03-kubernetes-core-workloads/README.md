# Module 03: Kubernetes Core Workloads

Chào mừng bạn đến với **Module 03** - chuyên sâu về **Kiến trúc phân tán Kubernetes**, **Vòng đời Pods & Multi-container Patterns**, **Deployments & Rolling Update Không Gián Đoạn (Zero-Downtime)**, và **Bộ 3 Health Probes kết hợp Quản lý Tài nguyên QoS**.

---

## Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 02: Docker Compose & Orchestration](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [Module 04: Kubernetes Networking & Storage](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/README.md).

---

## Danh Mục Bài Học Chi Tiết

| Bài học | Trọng tâm kiến thức |
| :--- | :--- |
| **[01. Kubernetes Architecture & Control Plane](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/01-kubernetes-architecture-and-control-plane.md)** | Control Plane (`kube-apiserver`, `etcd`, `kube-scheduler`, `controller-manager`), Worker Node (`kubelet`, `kube-proxy`, CRI), Reconciliation Loop. |
| **[02. Pods & Multi-Container Patterns](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/02-pods-and-multi-container-patterns.md)** | Pod Anatomy, Chia sẻ network stack `localhost`, Sidecar Pattern, Init Containers chuẩn bị dữ liệu, Adapter & Ambassador patterns. |
| **[03. Deployments, ReplicaSets & Rollouts](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/03-deployments-replicasets-and-rollouts.md)** | Phân cấp Deployment $\rightarrow$ ReplicaSet $\rightarrow$ Pods, Chiến lược RollingUpdate (`maxSurge`, `maxUnavailable: 0`), Rollback lịch sử tức thì. |
| **[04. Pod Health Probes & QoS](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/04-pod-health-probes-and-qos.md)** | Bộ ba `startupProbe`, `readinessProbe`, `livenessProbe`, Resource `requests` vs `limits`, Ba phân hạng QoS (`Guaranteed`, `Burstable`, `BestEffort`). |

---

## Thực Hành & Kiểm Thử Tự Động
1. **Manifest chuẩn Production**: [deployment.yaml](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/deployment.yaml)
2. **Bộ test tự động chấm điểm**: [practice.mjs](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/practice.mjs)
   - Chạy test: `rtk node devops/03-kubernetes-core-workloads/practice.mjs`
   - Vượt qua 5 bài test tự động xác thực chuẩn manifest, toán học zero-downtime, bộ 3 probes và bảo mật securityContext.
