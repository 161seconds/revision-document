# Module 04: Kubernetes Networking & Storage

Chào mừng bạn đến với **Module 04** - chuyên đề chuyên sâu về **Mạng & Lưu trữ trong Kubernetes**: **Dịch vụ Service Discovery (ClusterIP, NodePort, LoadBalancer)**, **Ingress Controller & Định tuyến Layer 7 (TLS/SSL)**, **Quản lý Cấu hình & Bí mật (ConfigMaps/Secrets)**, và **Hệ thống Lưu trữ Trạng thái Bền vững (PV, PVC, StorageClasses)**.

---

## Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 03: Kubernetes Core Workloads](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [Module 05: CI/CD & GitOps](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/README.md).

---

## Danh Mục Bài Học Chi Tiết

| Bài học | Trọng tâm kiến thức |
| :--- | :--- |
| **[01. Services & Service Discovery](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/01-services-and-service-discovery.md)** | Trừu tượng hóa Service, Phân loại `ClusterIP`, `NodePort`, `LoadBalancer`, `ExternalName`, CoreDNS & FQDN (`service.namespace.svc`). |
| **[02. Ingress & Layer 7 Routing](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/02-ingress-controllers-and-layer-7-routing.md)** | Ingress Resource vs Ingress Controller (Nginx), Host-based & Path-based routing, SSL/TLS Termination, tự động hóa TLS với cert-manager. |
| **[03. ConfigMaps, Secrets & Security](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/03-configmaps-secrets-and-volume-mounts.md)** | Tách biệt mã nguồn và cấu hình, Environment Variables vs File Volume Mounts, Nguy cơ Base64 trong Secret, External Secrets Operator. |
| **[04. PV, PVC & StorageClasses](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/04-persistent-volumes-pv-pvc-and-storageclasses.md)** | Lưu trữ Stateful trong K8s, PersistentVolume vs PersistentVolumeClaim, Dynamic Provisioning với StorageClass, Access Modes (RWO, ROX, RWX). |

---

## Thực Hành & Kiểm Thử Tự Động
1. **Manifest mạng & lưu trữ tích hợp**: [networking-and-storage.yaml](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/networking-and-storage.yaml)
2. **Bộ test tự động chấm điểm**: [practice.mjs](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/practice.mjs)
   - Chạy test: `rtk node devops/04-kubernetes-networking-and-storage/practice.mjs`
   - Vượt qua 5 bài test tự động xác thực phân giải Service, Ingress Layer 7 routing, TLS Secret, và PVC persistent storage.
