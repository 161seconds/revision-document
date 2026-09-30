# Module 07: DevSecOps, Supply Chain Security & Cloud Hardening

Chào mừng bạn đến với **Module 07: DevSecOps, Supply Chain Security & Cloud Hardening**. Module này trang bị tư duy và công cụ để bảo vệ toàn bộ vòng đời phát triển phần mềm (SDLC), từ chuỗi cung ứng mã nguồn mở (Supply Chain), bảo vệ quy trình CI/CD, đóng gói container an toàn, cho đến củng cố hạ tầng điện toán đám mây (Cloud IAM & AWS IMDSv2).

---

## 📚 Danh Mục Bài Học

1. **[01-supply-chain-security-and-sbom.md](file:///d:/my-project/revision-document/security/07-devsecops-and-cloud-security/01-supply-chain-security-and-sbom.md)**:
   - Các hình thức tấn công chuỗi cung ứng: Dependency Confusion, Typosquatting, Malicious Transitive Dependencies.
   - Danh mục thành phần phần mềm (SBOM): CycloneDX và SPDX formats.
   - Khung tiêu chuẩn an toàn build SLSA 4 cấp độ.
   - Ký số container không cần lưu khóa tĩnh (Keyless Signing) bằng Sigstore Cosign và Rekor Transparency Log.

2. **[02-secrets-management-and-secure-cicd.md](file:///d:/my-project/revision-document/security/07-devsecops-and-cloud-security/02-secrets-management-and-secure-cicd.md)**:
   - Hiểm họa rò rỉ khóa trong lịch sử Git và nguyên tắc xử lý khẩn cấp.
   - Phát hiện khóa tự động (Gitleaks, Trufflehog) dựa trên Regex và độ hỗn loạn Shannon Entropy.
   - Khử khóa tĩnh vĩnh viễn trên CI/CD bằng GitHub Actions OIDC Federation (`AssumeRoleWithWebIdentity`).
   - Quản trị khóa động (Dynamic Secrets) với HashiCorp Vault.

3. **[03-container-and-kubernetes-security.md](file:///d:/my-project/revision-document/security/07-devsecops-and-cloud-security/03-container-and-kubernetes-security.md)**:
   - Các nguyên thủy an toàn nhân Linux: Namespaces, cgroups, Seccomp, AppArmor.
   - Tước bỏ toàn bộ đặc quyền root với `cap-drop=ALL` và chạy Rootless Containers (`USER 10001`).
   - Tiêu chuẩn Pod Security Standards (Restricted) và cô lập mạng Kubernetes bằng NetworkPolicy (Default Deny).

4. **[04-cloud-security-posture-and-iam-hardening.md](file:///d:/my-project/revision-document/security/07-devsecops-and-cloud-security/04-cloud-security-posture-and-iam-hardening.md)**:
   - Triệt tiêu lỗ hổng SSRF trên Cloud với AWS IMDSv2 (Session Token & Hop Limit = 1).
   - Thắt chặt chính sách Cloud IAM theo nguyên tắc đặc quyền tối thiểu (PoLP) và Condition Blocks.
   - Cơ chế Mã hóa Phong Bì (Envelope Encryption) kết hợp KMS Master Key và Data Encryption Key (DEK).

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt thư viện DevSecOps & mô phỏng**: [cloud_devsecops.mjs](file:///d:/my-project/revision-document/security/07-devsecops-and-cloud-security/cloud_devsecops.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/security/07-devsecops-and-cloud-security/practice.mjs)

Chạy kiểm thử trực tiếp:
```bash
rtk node security/07-devsecops-and-cloud-security/practice.mjs
```
