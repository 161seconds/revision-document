# Module 02: Networking & Virtual Private Cloud (VPC)

Chào mừng bạn đến với **Module 02** - xương sống hạ tầng của mọi hệ thống trên AWS: **Thiết kế mạng ảo Virtual Private Cloud (VPC)**, **Toán học phân bổ Subnetting & 5 IP bảo lưu**, **Internet Gateway vs NAT Gateway**, **Tường lửa 2 lớp (Security Groups vs NACLs)**, và **VPC Endpoints (PrivateLink)**.

---

## Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 01: IAM & Cloud Security](file:///d:/my-project/revision-document/aws/01-iam-and-security/README.md), [Docker Networking](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/04-docker-networking-and-dns.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [Module 03: Compute & Scaling (EC2, ASG, ALB, Lambda)](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/README.md).

---

## Danh Mục Bài Học Chi Tiết

| Bài học | Trọng tâm kiến thức |
| :--- | :--- |
| **[01. VPC CIDR & Subnet Architecture](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/01-vpc-cidr-and-subnet-architecture.md)** | Phân bổ dải mạng CIDR `/16` và `/24`, Bẫy 5 địa chỉ IP dành riêng của AWS trong mỗi Subnet, Kiến trúc Multi-AZ High Availability (Public, Private, DB Isolated). |
| **[02. Internet Gateway vs NAT Gateways](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/02-internet-gateway-and-nat-gateways.md)** | Internet Gateway (IGW) 2 chiều, NAT Gateway 1 chiều cho Private Subnets, So sánh NAT Instance vs NAT Gateway, Tối ưu hóa chi phí NAT Data Processing. |
| **[03. Route Tables, Security Groups & NACLs](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/03-route-tables-security-groups-and-nacls.md)** | Định tuyến bảng Route Tables, So sánh chi tiết Security Groups (Stateful, Instance-level) vs Network ACLs (Stateless, Subnet-level, Ephemeral ports). |
| **[04. VPC Peering & VPC Endpoints (PrivateLink)](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/04-vpc-peering-transit-gateway-and-endpoints.md)** | Giới hạn không bắc cầu (Non-transitive) của VPC Peering, AWS Transit Gateway, Gateway Endpoints (S3/DynamoDB miễn phí) vs Interface Endpoints (PrivateLink). |

---

## Thực Hành & Kiểm Thử Tự Động
1. **Mẫu hạ tầng mạng CloudFormation**: [vpc-architecture.yaml](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/vpc-architecture.yaml)
2. **Bộ test tự động chấm điểm**: [practice.mjs](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/practice.mjs)
   - Chạy test: `rtk node aws/02-networking-and-vpc/practice.mjs`
   - Vượt qua 5 bài test tự động tính toán CIDR IP khả dụng, thẩm tra định tuyến bảng Route Tables, xâu chuỗi Security Groups (SG Chaining), và cấu hình S3 Gateway Endpoint.
