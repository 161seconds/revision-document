# AWS Cloud Architecture Revision Guide

Kho tài liệu ôn tập toàn diện về **Amazon Web Services (AWS)** từ nền tảng **Định danh & Bảo mật (IAM)**, **Mạng ảo hóa VPC**, **Tính toán máy chủ & Serverless (EC2, Lambda, Auto Scaling)**, **Lưu trữ & Cơ sở dữ liệu (S3, EBS, RDS, DynamoDB)** đến **Kiến trúc Hàng đợi Tin nhắn, Giám sát (CloudWatch, CloudTrail)** và **Hạ tầng dưới dạng Mã nguồn (Infrastructure as Code - Terraform / AWS CDK)**.

---

## Danh Mục Các Module Học Tập

| Thư mục / Tài liệu | Nội dung trọng tâm | Trạng thái |
| :--- | :--- | :--- |
| **[summary.md](file:///d:/my-project/revision-document/aws/summary.md)** | **Master AWS Architecture Cheat Sheet** bao quát toàn bộ Hạ tầng toàn cầu, IAM Evaluation, VPC, EC2, ALB/NLB, Lambda, S3, RDS, DynamoDB, SQS/SNS, CloudWatch & IaC | Hoàn thành |
| **[01-iam-and-security/](file:///d:/my-project/revision-document/aws/01-iam-and-security/README.md)** | IAM Users, Groups, Roles, Policies JSON, Đánh giá quyền hạn (Explicit Deny), STS AssumeRole, AWS KMS Envelope Encryption & Secrets Manager | Sẵn sàng |
| **[02-networking-and-vpc/](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/README.md)** | VPC CIDR, Public & Private Subnets, Route Tables, Internet Gateway, NAT Gateway, Security Groups vs NACLs, VPC Endpoints & PrivateLink | Sẵn sàng |
| **[03-compute-and-scaling/](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/README.md)** | EC2 Instance Types & Pricing (Spot/RI), Launch Templates & Auto Scaling Groups (ASG), Application & Network Load Balancer (ALB/NLB), AWS Lambda | Sẵn sàng |
| **[04-storage-and-databases/](file:///d:/my-project/revision-document/aws/04-storage-and-databases/README.md)** | S3 Storage Classes, Lifecycle Rules, Presigned URLs & Bucket Policies, EBS Volumes & Snapshots, RDS Multi-AZ vs Read Replicas, DynamoDB PK/SK & GSI | Sẵn sàng |
| **[05-messaging-observability-and-iac/](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/README.md)** | SQS Standard vs FIFO, SNS Pub/Sub & Fanout Pattern, EventBridge, CloudWatch Metrics/Alarms/Logs Insights, CloudTrail Audit, Terraform & AWS CDK | Sẵn sàng |

---

## Chuẩn Cấu Trúc Của Từng Thư Mục Con

Mỗi module bao gồm:
1. `README.md`: Lộ trình chi tiết + **Bản đồ liên kết bài học (Knowledge Links)** + Bẫy phỏng vấn đám mây.
2. Các bài học lý thuyết `.md`: Tuân thủ chuẩn 5 mục (Bản đồ liên kết, Bản chất hoạt động, Bẫy kinh điển, Code / Policy / IaC mẫu thực hành, Câu hỏi phỏng vấn tự kiểm tra).
3. Các file cấu hình mẫu & kịch bản thực thi: IAM JSON Policies, CloudFormation / Terraform manifests, AWS CLI commands.
4. Bộ công cụ kiểm thử tự động `practice.mjs` với 100% assertions tự động xác minh cấu hình, tính toán CIDR/Subnetting và phân giải logic IAM.

---

## Bản Đồ Liên Kết
- **Tiên quyết**: [DevOps, Docker & Kubernetes](file:///d:/my-project/revision-document/devops/), [Database Architecture](file:///d:/my-project/revision-document/database/).
- **Mở rộng**: Kiến trúc Microservices phân tán, High-Availability Cloud Enterprise Architecture.
