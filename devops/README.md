# DevOps, Docker & Kubernetes Revision Guide

Kho tài liệu ôn tập toàn diện về **DevOps**, **Containerization (Docker)**, **Container Orchestration (Kubernetes)**, và **CI/CD Automation & GitOps**.

---

## Danh Mục Các Module Học Tập

| Thư mục / Tài liệu | Nội dung trọng tâm | Trạng thái |
| :--- | :--- | :--- |
| **[summary.md](file:///d:/my-project/revision-document/devops/summary.md)** | **Master DevOps & Kubernetes Cheat Sheet** bao quát toàn bộ Linux Kernel (cgroups/namespaces), Dockerfile, Compose, K8s Architecture, Workloads, Networking, Probes, Storage, CI/CD & GitOps | Hoàn thành |
| **[01-docker-and-containerization/](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/README.md)** | Bản chất Containerization, Namespaces & cgroups, Dockerfile tối ưu, Multi-stage Builds, Layer Caching, Docker Storage & Networking | Sẵn sàng |
| **[02-docker-compose-and-orchestration/](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/README.md)** | Docker Compose Specs v3, Multi-container Microservices, Service Dependencies, Healthchecks, Named Volumes, Bridge Network Isolation | Sẵn sàng |
| **[03-kubernetes-core-workloads/](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/README.md)** | K8s Architecture (Control Plane vs Worker Nodes), Pod Lifecycle, Deployments & ReplicaSets, RollingUpdate Zero-Downtime, Health Probes, QoS | Sẵn sàng |
| **[04-kubernetes-networking-and-storage/](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/README.md)** | K8s Services (ClusterIP, NodePort, LoadBalancer), Ingress Nginx Layer 7 Routing, ConfigMaps & Secrets, PersistentVolumes (PV) & Claims (PVC) | Sẵn sàng |
| **[05-cicd-and-gitops/](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/README.md)** | GitHub Actions Workflows, Automated Build & Test Matrix, Container Registry Push (GHCR), ArgoCD GitOps Continuous Deployment, Blue/Green & Canary | Sẵn sàng |

---

## Chuẩn Cấu Trúc Của Từng Thư Mục Con

Mỗi module bao gồm:
1. `README.md`: Lộ trình chi tiết + **Bản đồ liên kết bài học (Knowledge Links)** + Bẫy phỏng vấn.
2. Các bài học lý thuyết `.md`: Tuân thủ chuẩn 5 mục (Bản đồ liên kết, Bản chất hoạt động, Bẫy kinh điển, Code/Manifest mẫu thực hành, Câu hỏi phỏng vấn tự kiểm tra).
3. Các file cấu hình mẫu & kịch bản thực thi: Dockerfile, `docker-compose.yml`, K8s manifests (`deployment.yaml`, `service.yaml`, `ingress.yaml`).
4. Bộ công cụ kiểm thử tự động `practice.*` với 100% assertions tự động xác minh cấu hình, cú pháp và tính toàn vẹn của container/k8s manifests.

---

## Bản Đồ Liên Kết
- **Tiên quyết**: [Linux & Shell Scripting](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md), [Database Architecture](file:///d:/my-project/revision-document/database/).
- **Ngôn ngữ triển khai**: [JavaScript / Node.js](file:///d:/my-project/revision-document/javascript/), [TypeScript](file:///d:/my-project/revision-document/typescript/), [.NET](file:///d:/my-project/revision-document/dotnet/), [Java](file:///d:/my-project/revision-document/java/).
