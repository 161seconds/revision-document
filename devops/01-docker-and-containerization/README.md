# Module 01: Docker & Containerization Fundamentals

Chào mừng bạn đến với **Module 01** - nền tảng về **Bản chất Containerization (Linux Kernel)**, **Kỹ thuật tối ưu Dockerfile & Multi-Stage Builds**, **Quản lý Lưu trữ (Volumes/Bind Mounts)**, và **Mạng ảo hóa trong Docker (Bridge, DNS)**.

---

## Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Linux Shell & Command Line](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [Module 02: Docker Compose & Orchestration](file:///d:/my-project/revision-document/devops/02-docker-compose-and-orchestration/README.md).

---

## Danh Mục Bài Học Chi Tiết

| Bài học | Trọng tâm kiến thức |
| :--- | :--- |
| **[01. Container Internals & Linux Kernel](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/01-container-internals-and-linux-kernel.md)** | Bản chất Container vs VM, Linux Namespaces (`pid`, `net`, `mnt`), cgroups v1/v2, OverlayFS Union File System. |
| **[02. Dockerfile & Multi-Stage Builds](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/02-dockerfile-and-multi-stage-builds.md)** | Directives chuẩn, Thứ tự layer caching, Multi-stage builds loại bỏ SDK rác, Non-root user, `.dockerignore`. |
| **[03. Docker Storage & Volumes](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/03-docker-storage-and-volumes.md)** | Named Volumes vs Bind Mounts vs `tmpfs`, Vòng đời dữ liệu, Hiệu năng I/O, Backup & Phục hồi volume. |
| **[04. Docker Networking & DNS](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/04-docker-networking-and-dns.md)** | Default bridge vs User-defined bridge, Cơ chế Embedded DNS nội bộ (`127.0.0.11`), Host & None network mode, Port binding. |

---

## Thực Hành & Kiểm Thử Tự Động
1. **Dockerfile chuẩn Multi-stage**: [Dockerfile.multistage](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/Dockerfile.multistage)
2. **File loại trừ tối ưu**: [.dockerignore](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/.dockerignore)
3. **Bộ test tự động chấm điểm**: [practice.mjs](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/practice.mjs)
   - Chạy test: `rtk node devops/01-docker-and-containerization/practice.mjs`
   - Vượt qua 5 bài test phân tích cú pháp và quy chuẩn bảo mật/hiệu năng container.
