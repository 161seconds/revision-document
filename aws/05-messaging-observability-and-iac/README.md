# Module 05: Messaging, Observability & Infrastructure as Code (IaC)

Chào mừng bạn đến với **Module 05** - chuyên đề hoàn thiện hệ thống đám mây: **Hàng đợi Tin nhắn & Kiến trúc Hướng Sự kiện (SQS, SNS, EventBridge)**, **Giám sát Hiệu năng Tập trung (CloudWatch Metrics, Alarms & Logs Insights)**, **Kiểm toán & Quản trị (CloudTrail, AWS Config)**, và **Hạ tầng Dưới Dạng Mã Nguồn (Infrastructure as Code - AWS CDK & Terraform)**.

---

## Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 03: Compute & Scaling](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/README.md), [CI/CD & GitOps](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Ứng dụng thực tế**: Vận hành hệ thống phân tán High-Throughput cấp doanh nghiệp, SRE, Cloud Production Operations.

---

## Danh Mục Bài Học Chi Tiết

| Bài học | Trọng tâm kiến thức |
| :--- | :--- |
| **[01. SQS, SNS & Event-Driven Architecture](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/01-sqs-sns-and-event-driven-architecture.md)** | SQS Standard vs FIFO, Visibility Timeout, Bẫy hàng đợi chết Dead Letter Queue (DLQ), SNS Pub/Sub & Fanout Pattern, Amazon EventBridge. |
| **[02. CloudWatch Metrics, Alarms & Logs](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/02-cloudwatch-metrics-alarms-and-logs.md)** | Metrics độ phân giải cao, Metric Filters trích xuất lỗi từ Log, CloudWatch Alarms kích hoạt Auto Scaling, Truy vấn Logs Insights. |
| **[03. CloudTrail, AWS Config & Governance](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/03-cloudtrail-aws-config-and-governance.md)** | Kiểm toán lịch sử API Calls toàn diện với CloudTrail, Phát hiện bất thường với CloudTrail Insights, Đánh giá tuân thủ và tự sửa lỗi với AWS Config. |
| **[04. IaC: AWS CDK, CloudFormation & Terraform](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/04-infrastructure-as-code-cdk-and-terraform.md)** | Triết lý IaC, CloudFormation Stacks & Change Sets, Lập trình hạ tầng bằng code thật với AWS CDK (L1/L2/L3 Constructs), Terraform State & S3 Locking. |

---

## Thực Hành & Kiểm Thử Tự Động
1. **Manifest hạ tầng tin nhắn & giám sát mẫu**: [messaging-and-observability.yaml](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/messaging-and-observability.yaml)
2. **Bộ test tự động chấm điểm**: [practice.mjs](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/practice.mjs)
   - Chạy test: `rtk node aws/05-messaging-observability-and-iac/practice.mjs`
   - Vượt qua 5 bài test tự động xác thực kiến trúc SQS Dead Letter Queue, mô hình Fanout SNS-SQS, ngưỡng cảnh báo CloudWatch Alarm và quy tắc đặt tên FIFO.
