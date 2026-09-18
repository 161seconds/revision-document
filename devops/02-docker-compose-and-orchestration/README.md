# Module 02: Docker Compose & Local Orchestration

Chào mừng bạn đến với **Module 02** - chuyên đề về **Điều phối đa Container cục bộ với Docker Compose**, **Quản lý phụ thuộc dịch vụ & Healthchecks**, **Kiến trúc mạng phân tầng đa lớp (Multi-tier Networking)**, và **Cấu hình môi trường bảo mật**.

---

## Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 01: Docker & Containerization](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [Module 03: Kubernetes Core Workloads](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/README.md).

---

## Danh Mục Bài Học Chi Tiết

| Bài học | Trọng tâm kiến thức |
| :--- | :--- |
| **[01. Compose File Specification v3](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/01-compose-file-specification-v3.md)** | Cấu trúc phân cấp Compose: `services`, `networks`, `volumes`, `build` context, `ports` vs `expose`, `deploy.resources`. |
| **[02. Service Dependencies & Healthchecks](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/02-service-dependencies-and-healthchecks.md)** | Bẫy `depends_on` truyền thống, chuẩn `condition: service_healthy`, cấu hình `healthcheck` (`test`, `interval`, `retries`). |
| **[03. Multi-tier Networking & Isolation](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/03-multi-tier-networking-and-isolation.md)** | Phân lập mạng 3 tầng (Frontend, Backend, Database), ngăn chặn expose cổng DB ra ngoài, Built-in Service Discovery. |
| **[04. Environment Variables & Overrides](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/04-environment-variables-and-configuration.md)** | Thứ tự ưu tiên nạp biến môi trường, Phép nội suy biến (`${VAR:-default}`), File override (`docker-compose.override.yml`). |

---

## Thực Hành & Kiểm Thử Tự Động
1. **Stack microservices mẫu**: [docker-compose.yml](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/docker-compose.yml)
2. **File mẫu biến môi trường**: [.env.example](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/.env.example)
3. **Bộ test tự động chấm điểm**: [practice.mjs](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/practice.mjs)
   - Chạy test: `rtk node devops/02-docker-compose-and-orchestration/practice.mjs`
   - Vượt qua 5 bài test phân tích cấu trúc Docker Compose, quan hệ phụ thuộc, cơ chế healthcheck và kiến trúc mạng cô lập.
