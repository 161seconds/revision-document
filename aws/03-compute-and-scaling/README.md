# Module 03: Compute & Scaling (EC2, ASG, ALB & Lambda)

Chào mừng bạn đến với **Module 03** - trái tim xử lý tính toán của AWS: **Máy ảo EC2 & Các mô hình tối ưu chi phí (Spot, Savings Plans)**, **Nhóm co giãn tự động Auto Scaling Groups (ASG)**, **Bộ cân bằng tải Elastic Load Balancing (ALB vs NLB)**, và **Điện toán Không Máy Chủ (Serverless) AWS Lambda**.

---

## Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 02: Networking & Virtual Private Cloud (VPC)](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [Module 04: Storage & Databases (S3, EBS, RDS, DynamoDB)](file:///d:/my-project/revision-document/aws/04-storage-and-databases/README.md).

---

## Danh Mục Bài Học Chi Tiết

| Bài học | Trọng tâm kiến thức |
| :--- | :--- |
| **[01. EC2 Types & Pricing Models](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/01-ec2-instance-types-and-pricing-models.md)** | Phân loại dòng máy ảo (C, M, R, T, Graviton ARM), Mô hình mua sắm: On-Demand, Spot (thông báo thu hồi 2 phút), Savings Plans (tiết kiệm 72%). |
| **[02. Auto Scaling & Launch Templates](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/02-auto-scaling-groups-and-launch-templates.md)** | Bản mẫu khởi tạo Launch Template, Auto Scaling Groups (Min/Desired/Max), Target Tracking Scaling Policy, Vòng đời Lifecycle Hooks. |
| **[03. Elastic Load Balancing (ALB vs NLB)](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/03-elastic-load-balancing-alb-and-nlb.md)** | Cân bằng tải Layer 7 (ALB: Path/Host routing, SSL offload) vs Layer 4 (NLB: Ultra-low latency, Static IP), Target Groups & Health Checks. |
| **[04. Serverless Compute: AWS Lambda](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/04-serverless-compute-aws-lambda.md)** | Kiến trúc Serverless, Vòng đời Cold Start, Provisioned Concurrency, Bộ nhớ đệm `/tmp`, Ba mô hình kích hoạt (Sync, Async, Polling Stream). |

---

## Thực Hành & Kiểm Thử Tự Động
1. **Manifest hạ tầng HA Compute**: [compute-asg-alb.yaml](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/compute-asg-alb.yaml)
2. **Bộ test tự động chấm điểm**: [practice.mjs](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/practice.mjs)
   - Chạy test: `rtk node aws/03-compute-and-scaling/practice.mjs`
   - Vượt qua 5 bài test tự động xác thực cấu hình Launch Template, giải thuật co giãn Target Tracking, cơ chế kiểm tra sức khỏe ALB và tính toán chi phí GB-s của Lambda.
