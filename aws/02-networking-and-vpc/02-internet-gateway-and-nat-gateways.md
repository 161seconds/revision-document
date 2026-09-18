# 02. Internet Gateway vs NAT Gateways

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. VPC CIDR & Subnet Architecture](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/01-vpc-cidr-and-subnet-architecture.md).
- **Module hiện tại**: [Module 02: Networking & Virtual Private Cloud (VPC)](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [03. Route Tables, Security Groups & NACLs](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/03-route-tables-security-groups-and-nacls.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Internet Gateway (IGW) - Cửa Khẩu Hai Chiều
- **Internet Gateway** là một thành phần phần mềm phân tán của AWS, co giãn tự động theo chiều ngang (Horizontally Scaled), có tính sẵn sàng cao tuyệt đối và **không có nút thắt cổ chai về băng thông**.
- **Nguyên lý hoạt động**:
  - Thực hiện biên dịch địa chỉ 1-1 (1-to-1 NAT) giữa địa chỉ IPv4 Private của máy ảo và địa chỉ IPv4 Public của nó.
  - Hỗ trợ **giao tiếp 2 chiều (Bi-directional)**: Máy ảo trong Public Subnet có thể gọi ra ngoài Internet, và người dùng ngoài Internet có thể chủ động kết nối vào máy ảo (nếu Security Group cho phép).
  - Mỗi VPC chỉ có thể gắn kết (Attach) với **tối đa duy nhất 1 Internet Gateway**.

### 2.2 NAT Gateway (Network Address Translation) - Cửa Khẩu Một Chiều
- **Mục đích**: Cho phép các máy chủ trong **Private Subnet** có thể kết nối ra ngoài Internet (để tải bản vá bảo mật OS, cập nhật thư viện npm/nuget, gọi API bên thứ ba như Stripe/Twilio), **nhưng ngăn chặn tuyệt đối chiều ngược lại (Internet không thể chủ động gửi kết nối vào máy ảo)**.
- **Quy tắc triển khai**:
  1. NAT Gateway **bắt buộc phải nằm trong một PUBLIC Subnet**.
  2. Bắt buộc phải gắn với một địa chỉ IP tĩnh công khai (**Elastic IP - EIP**).
  3. Bảng Route Table của Private Subnet thiết lập luật: `0.0.0.0/0 -> nat-xxxxxx`.
  4. Máy chủ trong Private Subnet không cần và **không được có Public IP**.

### 2.3 So Sánh NAT Gateway vs NAT Instance (Di Sản Cũ)
| Đặc tính | AWS NAT Gateway (Khuyên dùng) | NAT Instance (Máy ảo EC2 tự dựng) |
| :--- | :--- | :--- |
| **Quản lý hạ tầng** | Hoàn toàn tự động (AWS Managed Service) | Phải tự cấu hình Linux, iptables, tự vá lỗi kernel |
| **Tính sẵn sàng cao** | Tự động nhân bản trong Availability Zone | Không (Là Single Point of Failure, phải tự viết script failover) |
| **Băng thông (Throughput)** | Co giãn tự động từ $5\text{ Gbps}$ lên tới $100\text{ Gbps}$ | Bị giới hạn bởi kích thước EC2 Instance Type (Network Performance) |
| **Bảo mật** | Không thể SSH vào, do AWS quản trị | Có nguy cơ bị chiếm quyền nếu quên cập nhật bản vá |

---

## 3. Thiết Kế High Availability & Tối Ưu Chi Phí NAT

### 3.1 Bẫy High Availability Của NAT Gateway
- **NAT Gateway là tài nguyên bị giới hạn trong 1 Availability Zone (AZ-specific resource)**.
- Nếu bạn chỉ tạo 1 NAT Gateway ở AZ-1a và cấu hình tất cả Private Subnets ở cả AZ-1a và AZ-1b cùng trỏ về nó:
  - Khi trung tâm dữ liệu AZ-1a bị sự cố mất điện, **toàn bộ Private Subnets ở cả 2 AZs sẽ lập tức mất hoàn toàn kết nối Internet**!
  - **Thiết kế chuẩn Production**: Tạo **1 NAT Gateway riêng biệt cho mỗi Availability Zone**.

### 3.2 Cơn Ác Mộng Chi Phí: NAT Gateway Data Processing Fee
- Chi phí NAT Gateway gồm 2 phần:
  1. Phí duy trì theo giờ: $\approx \$0.045\text{/giờ/gateway}$ (khoảng $\$32\text{/tháng/gateway}$).
  2. **Phí xử lý dữ liệu (Data Processing Fee)**: **$\$0.045\text{ cho mỗi 1 GB}$** dữ liệu đi qua!
- *Ví dụ thảm họa*: Nếu ứng dụng backend trong Private Subnet tải $20\text{ TB}$ dữ liệu từ S3 mỗi tháng thông qua NAT Gateway, hóa đơn sẽ bị đội thêm:
  $$20,000\text{ GB} \times \$0.045 = \mathbf{\$900\text{ USD tiền phí vô nghĩa!}}$$
- **Giải pháp tối ưu hóa**: Bật **S3 Gateway Endpoint** (hoàn toàn **MIỄN PHÍ**) để traffic giữa Private Subnet và S3 đi qua mạng nội bộ AWS, không bao giờ chạy qua NAT Gateway!

---

## 4. Bảng Route Tables Mẫu Cho Public & Private Subnets

### Public Route Table (Gắn với Public Subnets):
| Destination (Đích đến) | Target (Cổng chuyển tiếp) | Ghi Chú |
| :--- | :--- | :--- |
| `10.0.0.0/16` | `local` | Giao tiếp nội bộ giữa tất cả subnets trong VPC |
| `0.0.0.0/0` | `igw-0123456789abcdef0` | Mọi traffic Internet đi qua Internet Gateway |

### Private Route Table (Gắn với Private Subnets AZ-1a):
| Destination (Đích đến) | Target (Cổng chuyển tiếp) | Ghi Chú |
| :--- | :--- | :--- |
| `10.0.0.0/16` | `local` | Giao tiếp nội bộ VPC |
| `0.0.0.0/0` | `nat-0123456789abcdef0` | Ra ngoài Internet qua NAT Gateway đặt ở AZ-1a |
| `pl-63a5400a (S3 Prefix List)` | `vpce-0123456789abcdef0` | **Tối ưu chi phí: Miễn phí traffic vào S3 qua VPC Endpoint** |

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao NAT Gateway bắt buộc phải được đặt trong Public Subnet mà không thể đặt trong Private Subnet?**
   - *Trả lời*: Bản thân NAT Gateway cần phải gửi gói tin ra Internet và nhận gói tin phản hồi về thông qua Internet Gateway (IGW). Muốn đi tới IGW, nó phải nằm trong một Subnet có Route Table trỏ `0.0.0.0/0 -> igw-xxxx` (tức là Public Subnet). Nếu đặt trong Private Subnet, bản thân NAT Gateway cũng không có đường ra Internet.
2. **Một máy ảo trong Private Subnet có thể nhận cuộc gọi khởi tạo kết nối từ người dùng ngoài Internet không?**
   - *Trả lời*: **Tuyệt đối không**. NAT Gateway là cơ chế chuyển dịch địa chỉ nguồn (Source NAT). Nó chỉ cho phép thiết lập phiên kết nối một chiều đi ra (Egress-only). Các gói tin từ Internet cố gắng gửi vào mà không có phiên kết nối đã mở sẵn trước đó sẽ bị NAT Gateway loại bỏ hoàn toàn.
3. **Làm thế nào để giảm chi phí xử lý dữ liệu qua NAT Gateway cho các ứng dụng tải dữ liệu lớn?**
   - *Trả lời*: Kích hoạt **VPC Gateway Endpoints** cho Amazon S3 và Amazon DynamoDB (hoàn toàn miễn phí). Đối với các dịch vụ AWS khác (như SQS, Secrets Manager, ECR), sử dụng **VPC Interface Endpoints (PrivateLink)** để giữ lưu lượng hoàn toàn trong mạng backbone của AWS thay vì đi vòng qua NAT Gateway ra Internet công cộng.
