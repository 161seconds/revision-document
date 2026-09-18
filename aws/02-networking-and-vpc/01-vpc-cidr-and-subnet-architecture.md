# 01. VPC CIDR & Subnet Architecture

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 01: IAM & Cloud Security](file:///d:/my-project/revision-document/aws/01-iam-and-security/README.md).
- **Module hiện tại**: [Module 02: Networking & Virtual Private Cloud (VPC)](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [02. Internet Gateway vs NAT Gateways](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/02-internet-gateway-and-nat-gateways.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Cấu Trúc CIDR Block Của VPC
- Một **Virtual Private Cloud (VPC)** là một mạng riêng ảo được cô lập hoàn toàn logic trong một AWS Region.
- Dải địa chỉ IP được định nghĩa theo chuẩn **CIDR (Classless Inter-Domain Routing)** từ dải Private IP theo chuẩn RFC 1918:
  - `10.0.0.0/16` ($65,536\text{ IPs}$ - Chuẩn thiết kế doanh nghiệp phổ biến nhất).
  - `172.16.0.0/16` đến `172.31.0.0/16`.
  - `192.168.0.0/16`.
- Giới hạn kích thước CIDR của AWS: Từ `/16` (lớn nhất - 65,536 IPs) đến `/28` (nhỏ nhất - 16 IPs).

### 2.2 Bẫy Toán Học: 5 Địa Chỉ IP Dành Riêng Trong Mỗi Subnet
Trong bất kỳ mạng IPv4 thông thường nào, chỉ có 2 địa chỉ IP bị bảo lưu (Network Address và Broadcast Address).
Tuy nhiên, **trong AWS, mỗi Subnet luôn luôn bị AWS lấy đi 5 địa chỉ IP đầu và cuối**:
Giả sử subnet có dải `10.0.1.0/24` (Tổng cộng $2^{32-24} = 256\text{ IPs}$):
1. `10.0.1.0`: **Network Address** (Địa chỉ mạng).
2. `10.0.1.1`: **VPC Router** (Default gateway nội bộ do AWS quản lý).
3. `10.0.1.2`: **VPC DNS Server** (IP của dịch vụ AmazonProvidedDNS / Route 53 Resolver).
4. `10.0.1.3`: **Dành riêng cho AWS** sử dụng trong tương lai.
5. `10.0.1.255`: **Network Broadcast Address** (AWS không hỗ trợ broadcast trong VPC, nhưng vẫn bảo lưu địa chỉ này).
$$\Rightarrow \text{Số IP thực tế có thể gán cho máy ảo (Usable IPs)} = 256 - 5 = \mathbf{251\text{ IPs}}.$$

### 2.3 Mô Hình Kiến Trúc Phân Tầng Multi-AZ Chuẩn Mực
Để đạt chuẩn **High Availability (Sẵn sàng cao)**, một hệ thống luôn trải dài trên tối thiểu **2 Availability Zones (AZs)**, mỗi AZ gồm 3 tầng Subnet:

```
[ REGION: ap-southeast-1 (Singapore) - VPC CIDR: 10.0.0.0/16 ]
=============================================================================
             AZ-1a                                        AZ-1b
-----------------------------------------------------------------------------
[ 1. PUBLIC SUBNET: 10.0.1.0/24 ]           [ 1. PUBLIC SUBNET: 10.0.2.0/24 ]
  - Internet Gateway Route                     - Internet Gateway Route
  - Chứa: ALB (Public), NAT Gateway 1          - Chứa: ALB (Public), NAT Gateway 2
-----------------------------------------------------------------------------
[ 2. PRIVATE SUBNET: 10.0.11.0/24 ]         [ 2. PRIVATE SUBNET: 10.0.12.0/24 ]
  - Route tới NAT Gateway 1                    - Route tới NAT Gateway 2
  - Chứa: Backend API, Microservices           - Chứa: Backend API, Microservices
-----------------------------------------------------------------------------
[ 3. DATABASE ISOLATED: 10.0.21.0/24 ]      [ 3. DATABASE ISOLATED: 10.0.22.0/24 ]
  - Không có route ra Internet                 - Không có route ra Internet
  - Chứa: RDS PostgreSQL Multi-AZ (Master)     - Chứa: RDS PostgreSQL Multi-AZ (Standby)
=============================================================================
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Chọn Subnet Quá Nhỏ Dẫn Đến Cạn Kiệt IP (IP Exhaustion)**
> Nếu bạn tạo Subnet với dải `/28` ($16 - 5 = 11\text{ IPs}$ khả dụng), khi bạn bật Auto Scaling Groups, triển khai EKS (Kubernetes Pods dùng IP thật của Subnet), hoặc gắn Application Load Balancer (ALB cần tối thiểu 8 IPs khả dụng cho mỗi subnet), hệ thống sẽ **hết sạch IP** $\rightarrow$ EC2 không thể khởi động và ALB báo lỗi triển khai thất bại!
> - **Quy tắc**: Subnet cho Web và Worker nên tối thiểu là `/24` (251 IPs) hoặc `/22` (1019 IPs).

> [!WARNING]
> **Bẫy 2: Không Thể Thay Đổi Kích Thước CIDR Ban Đầu Của VPC**
> Sau khi VPC đã được tạo, bạn không thể mở rộng hay thu nhỏ khối CIDR chính ban đầu (chỉ có thể gắn thêm Secondary CIDR block). Hãy quy hoạch dải mạng cẩn thận ngay từ ngày đầu tiên, tránh trùng lặp dải IP với mạng On-Premises của công ty nếu có ý định nối VPN / Direct Connect sau này.

---

## 4. Bảng Tra Cứu Số Lượng IP Theo Độ Dài Mask

| CIDR Prefix | Tổng Số IPs | Số IP Khả Dụng Trong AWS | Mục Đích Khuyến Nghị |
| :--- | :--- | :--- | :--- |
| **/16** | 65,536 | 65,531 | Kích thước chuẩn cho **VPC chính** |
| **/20** | 4,096 | 4,091 | Subnet lớn cho Kubernetes CNI Cluster |
| **/24** | 256 | **251** | Chuẩn vàng cho Public / Private Subnets |
| **/27** | 32 | 27 | Tối thiểu an toàn cho ALB Subnet |
| **/28** | 16 | 11 | Kích thước tối thiểu AWS cho phép tạo |

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao một Subnet trong AWS chỉ nằm trong đúng 1 Availability Zone duy nhất?**
   - *Trả lời*: VPC là một khái niệm bao trùm toàn bộ Region, nhưng Subnet đại diện cho một phân vùng mạng gắn liền với ranh giới vật lý của trung tâm dữ liệu. Mỗi Subnet bị ràng buộc chặt chẽ vào một AZ cụ thể để đảm bảo tính cô lập khi có sự cố hỏng hóc vật lý xảy ra.
2. **Nếu một Subnet có CIDR `10.0.5.0/28`, có bao nhiêu địa chỉ IP khả dụng để cấp phát cho máy ảo EC2?**
   - *Trả lời*: Tổng số IP là $2^{32-28} = 16$. Trừ đi 5 địa chỉ IP dành riêng của AWS $\rightarrow$ Chỉ còn lại **$11$ IP khả dụng**.
3. **Địa chỉ IP nào trong Subnet đóng vai trò là Amazon DNS Server?**
   - *Trả lời*: Địa chỉ IP thứ hai được bảo lưu trong dải Subnet (`Base IP + 2`, ví dụ: `10.0.1.2` đối với subnet `10.0.1.0/24`). Nó phân giải các tên miền nội bộ `.ec2.internal` và bản ghi Route 53 Private Hosted Zone.
