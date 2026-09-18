# Module 05: CI/CD Pipelines & GitOps Continuous Deployment

Chào mừng bạn đến với **Module 05** - chuyên đề cao cấp về **Tự động hóa CI/CD với GitHub Actions**, **Matrix Testing & Quét lỗ hổng bảo mật Container**, **Xác thực Đám mây Không Mật Khẩu (OIDC)**, và **Triển khai Liên tục theo triết lý GitOps (ArgoCD)**.

---

## Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 01: Dockerfile & Multi-Stage](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/README.md), [Module 03: Kubernetes Core Workloads](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Ứng dụng thực tế**: Sản xuất phần mềm tự động hóa cấp doanh nghiệp, Production Release Engineering, SRE.

---

## Danh Mục Bài Học Chi Tiết

| Bài học | Trọng tâm kiến thức |
| :--- | :--- |
| **[01. CI/CD & GitHub Actions](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/01-cicd-fundamentals-and-github-actions.md)** | Vòng đời CI/CD (Lint $\rightarrow$ Test $\rightarrow$ Build $\rightarrow$ Scan $\rightarrow$ Deploy), Cấu trúc Workflow, Triggers, Jobs song song, Quản lý Secrets. |
| **[02. Matrix Testing & Caching](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/02-automated-testing-and-matrix-builds.md)** | Chiến lược Matrix đa nền tảng, Tối ưu hóa Cache tăng tốc độ build 5x, Concurrency Cancel-in-progress chống lãng phí runner. |
| **[03. Registry & Security Scanning](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/03-container-registry-and-security-scanning.md)** | Đẩy image lên GitHub Container Registry (GHCR), Xác thực bảo mật OIDC, Quét lỗ hổng tự động với Trivy (Chặn CVE Critical). |
| **[04. GitOps & Continuous Deployment](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/04-gitops-and-continuous-deployment.md)** | Triết lý GitOps, Push-based vs Pull-based CD, Vòng lặp đồng bộ ArgoCD & Flux, Chiến lược Blue/Green & Canary với Argo Rollouts. |

---

## Thực Hành & Kiểm Thử Tự Động
1. **Pipeline CI/CD hoàn chỉnh**: [pipeline-workflow.yaml](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/pipeline-workflow.yaml)
2. **Bộ test tự động chấm điểm**: [practice.mjs](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/practice.mjs)
   - Chạy test: `rtk node devops/05-cicd-and-gitops/practice.mjs`
   - Vượt qua 5 bài test tự động xác thực cú pháp pipeline, ma trận kiểm thử, bảo mật OIDC và bộ quét CVE.
