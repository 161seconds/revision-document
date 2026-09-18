# Module 04: Storage & Databases (S3, EBS, RDS, DynamoDB)

Chào mừng bạn đến với **Module 04** - nền tảng lưu trữ và quản trị dữ liệu trên AWS: **Amazon S3 Object Storage & Vòng đời Lifecycle**, **EBS Block Storage vs EFS Network File System**, **Cơ sở dữ liệu quan hệ RDS Multi-AZ & Amazon Aurora**, và **Cơ sở dữ liệu NoSQL Amazon DynamoDB**.

---

## Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 02: Networking & VPC](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/README.md), [Database Architecture](file:///d:/my-project/revision-document/database/).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [Module 05: Messaging, Observability & IaC](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/README.md).

---

## Danh Mục Bài Học Chi Tiết

| Bài học | Trọng tâm kiến thức |
| :--- | :--- |
| **[01. Amazon S3 & Lifecycle Management](file:///d:/my-project/revision-document/aws/04-storage-and-databases/01-amazon-s3-architecture-and-lifecycle.md)** | Độ bền 11 con số 9, 6 phân hạng lưu trữ S3, Quy tắc chuyển tầng Lifecycle Rules, Presigned URLs, Block Public Access & Object Lock. |
| **[02. EBS Volumes, Snapshots & EFS](file:///d:/my-project/revision-document/aws/04-storage-and-databases/02-ebs-volumes-snapshots-and-efs.md)** | Block Storage gp3/io2, Tách rời IOPS khỏi dung lượng, Snapshots sao lưu gia tăng (Incremental), Amazon EFS chia sẻ file ReadWriteMany. |
| **[03. RDS, Aurora & Database Scaling](file:///d:/my-project/revision-document/aws/04-storage-and-databases/03-rds-aurora-and-database-scaling.md)** | RDS Multi-AZ (Đồng bộ, Standby Failover) vs Read Replicas (Bất đồng bộ, Scale đọc), Kiến trúc lưu trữ 6 bản sao của Amazon Aurora. |
| **[04. NoSQL: Amazon DynamoDB & Caching](file:///d:/my-project/revision-document/aws/04-storage-and-databases/04-nosql-dynamodb-and-caching.md)** | Thiết kế Partition Key & Sort Key, LSI vs GSI, Chế độ On-Demand vs Provisioned (Toán học RCU/WCU), DynamoDB Streams, Caching DAX vs ElastiCache. |

---

## Thực Hành & Kiểm Thử Tự Động
1. **Manifest lưu trữ & cơ sở dữ liệu mẫu**: [storage-and-database.yaml](file:///d:/my-project/revision-document/aws/04-storage-and-databases/storage-and-database.yaml)
2. **Bộ test tự động chấm điểm**: [practice.mjs](file:///d:/my-project/revision-document/aws/04-storage-and-databases/practice.mjs)
   - Chạy test: `rtk node aws/04-storage-and-databases/practice.mjs`
   - Vượt qua 5 bài test tự động xác thực quy tắc vòng đời S3 Lifecycle, RDS Multi-AZ High Availability, cấu trúc DynamoDB GSI và giải thuật tính toán RCU/WCU.
