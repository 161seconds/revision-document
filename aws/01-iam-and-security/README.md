# Module 01: IAM & Cloud Security

Chào mừng bạn đến với **Module 01** - nền tảng sống còn của toàn bộ hệ thống AWS: **Quản lý Định danh & Quyền hạn (Identity & Access Management - IAM)**, **Giải thuật Đánh giá Policy**, **IAM Roles & STS AssumeRole**, và **Mã hóa Dữ liệu với AWS KMS & Secrets Manager**.

---

## Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Linux User Model & Security](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/01-container-internals-and-linux-kernel.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [Module 02: Networking & Virtual Private Cloud (VPC)](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/README.md).

---

## Danh Mục Bài Học Chi Tiết

| Bài học | Trọng tâm kiến thức |
| :--- | :--- |
| **[01. IAM Entities & Least Privilege](file:///d:/my-project/revision-document/aws/01-iam-and-security/01-iam-entities-and-least-privilege.md)** | Root Account vs IAM Users, Quản lý quyền theo Groups, Nguyên lý đặc quyền tối thiểu (Least Privilege), Luân chuyển Access Keys. |
| **[02. IAM Policies & Evaluation Logic](file:///d:/my-project/revision-document/aws/01-iam-and-security/02-iam-policies-and-evaluation-logic.md)** | Cấu trúc JSON Policy (`Statement`, `Effect`, `Action`, `Resource`, `Condition`), Giải thuật đánh giá quyền hạn (Explicit Deny luôn thắng). |
| **[03. IAM Roles & STS AssumeRole](file:///d:/my-project/revision-document/aws/01-iam-and-security/03-iam-roles-and-sts-assumerole.md)** | Định danh tạm thời không mật khẩu, EC2 Instance Profile, Lambda Execution Role, Cross-Account Access & Confused Deputy, OIDC Federation. |
| **[04. KMS Envelope Encryption & Secrets Manager](file:///d:/my-project/revision-document/aws/01-iam-and-security/04-kms-envelope-encryption-and-secrets-manager.md)** | Cơ chế mã hóa phong bì (Envelope Encryption), Customer Managed Key (CMK), Tự động xoay vòng mật khẩu với AWS Secrets Manager vs SSM Parameter Store. |

---

## Thực Hành & Kiểm Thử Tự Động
1. **IAM Policy chuẩn Least-Privilege**: [iam-policy-production.json](file:///d:/my-project/revision-document/aws/01-iam-and-security/iam-policy-production.json)
2. **Bộ test tự động chấm điểm**: [practice.mjs](file:///d:/my-project/revision-document/aws/01-iam-and-security/practice.mjs)
   - Chạy test: `rtk node aws/01-iam-and-security/practice.mjs`
   - Vượt qua 5 bài test tự động mô phỏng giải thuật đánh giá IAM Policy, quét lỗ hổng Wildcard `*`, và kiểm tra ràng buộc điều kiện bảo mật MFA/IP.
