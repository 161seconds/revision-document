# AWS Cloud Architecture: Master Cheat Sheet

Tổng hợp toàn diện kiến thức cốt lõi về **Amazon Web Services (AWS)** phục vụ phỏng vấn kỹ sư Cloud / DevOps / Solutions Architect và vận hành hạ tầng điện toán đám mây thực tế.

---

## 1. Hạ Tầng Toàn Cầu (Global Infrastructure) & Shared Responsibility

### 1.1 Cấu Trúc Hạ Tầng Của AWS
- **Regions (Vùng địa lý)**: Cụm trung tâm dữ liệu độc lập trên thế giới (vd: `ap-southeast-1` Singapore, `us-east-1` N. Virginia). Mỗi Region cách nhau hàng trăm đến hàng nghìn km để đảm bảo cách ly thảm họa thiên tai.
- **Availability Zones (AZs - Vùng khả dụng)**: Mỗi Region gồm **tối thiểu 3 AZs** độc lập. Mỗi AZ gồm một hoặc nhiều Data Centers riêng biệt, được kết nối với nhau bằng mạng cáp quang băng thông cực lớn với độ trễ $< 1\text{ms}$.
- **Edge Locations (Điểm biên)**: Mạng lưới hàng trăm điểm hiện diện (PoP) toàn cầu của dịch vụ CDN **CloudFront** và **Route 53**, giúp cache nội dung gần người dùng nhất.

### 1.2 Mô Hình Trách Nhiệm Chung (Shared Responsibility Model)
- **AWS chịu trách nhiệm VỀ bảo mật đám mây (Security OF the Cloud)**:
  - Bảo vệ hạ tầng vật lý: Tòa nhà Data Center, phần cứng máy chủ, hệ thống điện, làm mát, mạng cáp quang, phần mềm ảo hóa Hypervisor (Nitro System).
- **Khách hàng chịu trách nhiệm bảo mật TRONG đám mây (Security IN the Cloud)**:
  - Cấu hình mạng: VPC, Subnet, Route Tables, Security Groups, NACLs.
  - Hệ điều hành trên EC2: Cài đặt bản vá lỗi (Patching), quản lý user SSH.
  - Quản lý định danh: IAM users, mật khẩu, MFA, IAM Roles.
  - Dữ liệu: Mã hóa dữ liệu truyền tải (In-transit) và lưu trữ (At-rest qua KMS), sao lưu (Backups).

---

## 2. Identity & Access Management (IAM) & Bảo Mật

### 2.1 Bốn Thành Phần Cốt Lõi Của IAM
1. **IAM User**: Định danh cho 1 người thật hoặc ứng dụng bên ngoài. Gồm Console Password hoặc Access Key ID + Secret Access Key.
2. **IAM Group**: Nhóm các Users để gán Policy chung (vd: Nhóm `Developers`, `Admins`). **Group không phải là Identity** và không thể được gắn vào làm Principal trong Resource Policy.
3. **IAM Role**: Định danh tạm thời không có mật khẩu/access key tĩnh. Được cấp phát thông qua **AWS STS (Security Token Service)** để gán cho EC2, Lambda, hoặc Cross-account access.
4. **IAM Policy**: Tài liệu JSON định nghĩa quyền hạn (Permissions) theo chuẩn:
   - `Effect`: `Allow` hoặc `Deny` (**Explicit Deny luôn luôn ghi đè mọi Allow**).
   - `Action`: Danh sách hành động API (vd: `"s3:GetObject"`, `"ec2:DescribeInstances"`).
   - `Resource`: Định danh tài nguyên ARN (`arn:aws:s3:::my-bucket/*`).
   - `Condition`: Điều kiện kích hoạt (vd: Bắt buộc dùng MFA, giới hạn dải IP nguồn `aws:SourceIp`).

### 2.2 Đánh Giá Quyền Hạn (Evaluation Logic)
$$\text{Default (Implicit Deny)} \longrightarrow \text{Is there an Explicit Deny?} \xrightarrow{\text{Yes}} \mathbf{DENY} \xrightarrow{\text{No}} \text{Is there an Explicit Allow?} \xrightarrow{\text{Yes}} \mathbf{ALLOW} \xrightarrow{\text{No}} \mathbf{DENY}$$

---

## 3. Networking: Virtual Private Cloud (VPC)

```
+-------------------------------------------------------------------------------+
|                             VPC (10.0.0.0/16)                                 |
|  +-------------------------------------+  +--------------------------------+  |
|  |     PUBLIC SUBNET (10.0.1.0/24)     |  |  PRIVATE SUBNET (10.0.2.0/24)  |  |
|  |  [Bastion Host]  [NAT Gateway]      |  |  [Backend API]  [RDS Database] |  |
|  |  [Application Load Balancer]        |  |  (Không có Public IP)          |  |
|  +-------------------------------------+  +--------------------------------+  |
|                   |                                        |                  |
|          [Internet Gateway]                     [Route to NAT Gateway]        |
+-------------------|-----------------------------------------------------------+
                    |
              [ Internet ]
```

### 3.1 Các Thành Phần Mạng Cốt Lõi
- **VPC**: Mạng ảo riêng biệt của bạn trên AWS. Kích thước khuyến nghị: `10.0.0.0/16` ($65,536\text{ IPs}$).
- **Subnet (Khuyến nghị `/24`)**:
  - **Public Subnet**: Route table trỏ `0.0.0.0/0` tới **Internet Gateway (IGW)**. Tài nguyên có Public IP để giao tiếp với Internet.
  - **Private Subnet**: Không có route trực tiếp tới IGW. Để đi ra ngoài tải bản vá, traffic `0.0.0.0/0` được trỏ tới **NAT Gateway** (đặt ở Public Subnet).
- **Security Groups vs Network ACLs (NACLs)**:
  | Đặc tính | Security Group (SG) | Network ACL (NACL) |
  | :--- | :--- | :--- |
  | **Phạm vi bảo vệ** | Cấp độ **Instance/ENI** | Cấp độ **Subnet** |
  | **Trạng thái (State)**| **Stateful** (Inbound mở thì Outbound tự động mở) | **Stateless** (Phải mở cả Inbound và Outbound rules) |
  | **Thứ tự quy tắc** | Đánh giá tất cả rules cùng lúc | Duyệt tuần tự theo số thứ tự (Rule number $1-32766$) |
  | **Quy tắc chặn** | Chỉ hỗ trợ `Allow` (mọi thứ khác mặc định Deny) | Hỗ trợ cả **`Allow`** và **`Deny`** rõ ràng |

---

## 4. Compute: EC2, Auto Scaling & Load Balancing

### 4.1 Phân Loại EC2 Instance Types
- `T` (Burstable): Tối ưu chi phí, dùng CPU Credits cho môi trường Dev/Test.
- `M` (General Purpose): Cân bằng CPU và RAM (Backend Web, Microservices).
- `C` (Compute Optimized): Tỉ lệ vCPU cao, xử lý tính toán nặng, Batch jobs, Game servers.
- `R` (Memory Optimized): Tỉ lệ RAM cực cao, dùng cho In-Memory Cache (Redis) và Cơ sở dữ liệu lớn.

### 4.2 Các Mô Hình Mua EC2 (Purchasing Options)
- **On-Demand**: Trả tiền theo giây/giờ, không cam kết, đắt nhất. Dùng cho workload ngắn hạn, khó dự đoán.
- **Reserved Instances (RI) / Savings Plans**: Cam kết sử dụng 1 hoặc 3 năm, **tiết kiệm tới 72%** chi phí.
- **Spot Instances**: Đấu giá tài nguyên dư thừa của AWS, **tiết kiệm tới 90%**, nhưng AWS có quyền thu hồi sau 2 phút thông báo. Thích hợp cho Batch Processing, Big Data, CI/CD runners.

### 4.3 Elastic Load Balancing (ELB)
- **Application Load Balancer (ALB)**: Hoạt động ở **Layer 7 (HTTP/HTTPS)**. Hỗ trợ routing theo Path, Host, Query String, WebSockets, gRPC, tích hợp AWS WAF và xác thực OIDC.
- **Network Load Balancer (NLB)**: Hoạt động ở **Layer 4 (TCP/UDP/TLS)**. Xử lý hàng triệu requests/giây với độ trễ cực thấp (Ultra-low latency micro-seconds), cung cấp Static Elastic IP cố định cho mỗi AZ.

---

## 5. Serverless Compute: AWS Lambda

- **Mô hình tính giá**: Trả tiền theo số lượng invocations và thời gian thực thi tính bằng mili-giây (GB-seconds).
- **Cấu hình**: Cấp phát RAM từ $128\text{ MB}$ đến $10,240\text{ MB}$ (CPU được tự động scale tỉ lệ thuận với lượng RAM). Thời gian chạy tối đa (Timeout): **15 phút**.
- **Cold Start (Khởi động lạnh)**: Thời gian khởi tạo container và nạp runtime mới.
  - *Giải pháp*: Dùng ngôn ngữ biên dịch nhẹ (Go, Rust, Node.js), tối ưu kích thước gói code, hoặc kích hoạt **Provisioned Concurrency**.

---

## 6. Lưu Trữ: S3 & EBS

### 6.1 Amazon S3 (Simple Storage Service) - Object Storage
- Độ bền dữ liệu (Durability): **$99.999999999\%$ (11 con số 9)**, dữ liệu tự động nhân bản qua ít nhất 3 AZs.
- **Các phân hạng lưu trữ (Storage Classes)**:
  - `S3 Standard`: Truy cập thường xuyên, độ trễ mili-giây.
  - `S3 Intelligent-Tiering`: Tự động di chuyển dữ liệu giữa các tầng dựa trên mẫu truy cập mà không tính phí chuyển tầng.
  - `S3 Standard-IA (Infrequent Access)`: Lưu trữ rẻ hơn, nhưng tính phí khi đọc dữ liệu.
  - `S3 Glacier Flexible / Deep Archive`: Dùng lưu trữ dữ liệu lưu trữ dài hạn (Archival/Compliance), chi phí siêu rẻ ($1\text{ USD/TB/tháng}$), thời gian lấy dữ liệu từ vài phút đến vài giờ.
- **Presigned URLs**: Cho phép người dùng tải lên hoặc tải xuống file trực tiếp từ S3 bằng một URL an toàn có thời hạn sử dụng xác định mà không cần cấp quyền IAM.

### 6.2 Amazon EBS (Elastic Block Store) - Block Storage
- Ổ cứng gắn trực tiếp vào một EC2 Instance trong **cùng 1 Availability Zone**.
- **gp3 (General Purpose SSD)**: Mặc định, cho phép tăng độc lập IOPS và Throughput mà không cần tăng dung lượng đĩa.
- **io2 (Provisioned IOPS SSD)**: Dành cho cơ sở dữ liệu quan trọng đòi hỏi IOPS cực cao và độ bền $99.999\%$.

---

## 7. Cơ Sở Dữ Liệu: RDS, Aurora & DynamoDB

### 7.1 Amazon RDS & Aurora
- **RDS Multi-AZ**: Tự động nhân bản đồng bộ (Synchronous Replication) sang một Standby Instance ở AZ khác. Khi AZ chính bị sập, hệ thống **tự động failover trong 60-120 giây** với cùng một DNS Endpoint (Đảm bảo High Availability).
- **RDS Read Replicas**: Nhân bản bất đồng bộ (Asynchronous Replication) để giảm tải đọc (Read scaling). Hỗ trợ tối đa 15 Read Replicas (có thể khác Region).
- **Amazon Aurora**: Engine cơ sở dữ liệu cloud-native tương thích PostgreSQL/MySQL của AWS. Tốc độ gấp 3-5 lần RDS truyền thống, lưu trữ 6 bản sao dữ liệu trải dài trên 3 AZs, tự động phục hồi và mở rộng dung lượng đĩa lên tới 128 TiB.

### 7.2 Amazon DynamoDB (NoSQL Key-Value & Document)
- Phân tán, không máy chủ (Serverless), độ trễ ổn định ở mức **vài mili-giây đơn vị (Single-digit millisecond)** ở mọi quy mô.
- **Khóa chính (Primary Key)**:
  - **Partition Key (PK)**: Băm dữ liệu để phân phối lên các phân vùng vật lý.
  - **Sort Key (SK)**: Sắp xếp các mục có cùng Partition Key.
- **Secondary Indexes**:
  - `Local Secondary Index (LSI)`: Cùng PK, khác SK. Phải tạo lúc khởi tạo bảng.
  - `Global Secondary Index (GSI)`: Khác PK, khác SK. Có thể tạo hoặc xóa bất kỳ lúc nào.
- **DynamoDB Accelerator (DAX)**: In-memory cache chuyên dụng cho DynamoDB, giảm độ trễ đọc xuống **micro-giây**.

---

## 8. Asynchronous Messaging: SQS, SNS & EventBridge

```
                       +-------------------+
                       |    SNS TOPIC      |
                       +---------+---------+
                                 | (Fanout Pattern)
            +--------------------+--------------------+
            |                                         |
+-----------v-----------+                 +-----------v-----------+
|    SQS Queue: Email   |                 |   SQS Queue: Order    |
|    Processing Worker  |                 |   Analytics Worker    |
+-----------------------+                 +-----------------------+
```

### 8.1 So Sánh Các Dịch Vụ Messaging
| Tiêu chí | Amazon SQS | Amazon SNS | Amazon EventBridge |
| :--- | :--- | :--- | :--- |
| **Mô hình** | **Pull (Queue polling)** | **Push (Pub/Sub)** | **Push (Event Bus)** |
| **Mục đích** | Đệm hàng đợi (Decoupling), xử lý bất đồng bộ | Gửi thông báo tới nhiều người đăng ký (Fanout, SMS, Email) | Định tuyến sự kiện đa nguồn (AWS Services, SaaS, Custom apps) |
| **Thứ tự** | Standard (Không đảm bảo), FIFO (Đảm bảo chính xác 100%) | Không đảm bảo thứ tự (trừ khi dùng SNS FIFO) | Hỗ trợ Schema Registry và lọc sự kiện nâng cao |

---

## 9. Observability: CloudWatch & CloudTrail

- **Amazon CloudWatch**:
  - **Metrics**: Đo lường hiệu năng hệ thống (CPUUtilization, DiskReadOps, NetworkIn).
  - **Alarms**: Kích hoạt hành động tự động khi chỉ số vượt ngưỡng (gửi cảnh báo SNS, kích hoạt Auto Scaling).
  - **Logs**: Thu thập, theo dõi và tìm kiếm log tập trung (CloudWatch Logs Insights).
- **AWS CloudTrail**:
  - **Audit Logging**: Ghi lại lịch sử **mọi lệnh gọi API** trên tài khoản AWS ("Ai đã làm gì, vào thời điểm nào, từ địa chỉ IP nào?").

---

## 10. Infrastructure as Code (IaC): Terraform & AWS CDK

```
[ Lập trình viên viết Code TypeScript / Python (AWS CDK) ]
                             ↓ (cdk synth)
[ CloudFormation Template (JSON/YAML Khai báo hạ tầng) ]
                             ↓ (CloudFormation Engine)
[ AWS Provisioning: VPC, Subnets, EC2, RDS, IAM ]
```

---

## 11. Bảng Tra Cứu AWS CLI (CLI Fast Reference)

```bash
# IAM & STS
aws sts get-caller-identity                # Kiểm tra thông tin tài khoản hiện tại
aws iam list-users                         # Liệt kê người dùng IAM

# S3
aws s3 ls                                  # Liệt kê danh sách buckets
aws s3 cp file.txt s3://my-bucket/path/    # Upload file lên S3
aws s3 sync ./dist s3://my-frontend-bucket # Đồng bộ thư mục tĩnh lên S3

# EC2 & VPC
aws ec2 describe-instances                 # Xem trạng thái máy ảo EC2
aws ec2 describe-vpcs                      # Xem danh sách VPC

# Lambda & Logs
aws lambda list-functions                  # Liệt kê các hàm serverless
aws logs tail /aws/lambda/my-func --follow # Xem live logs của Lambda
```
