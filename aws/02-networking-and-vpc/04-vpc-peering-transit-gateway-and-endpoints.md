# 04. VPC Peering, Transit Gateway & VPC Endpoints (PrivateLink)

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [03. Route Tables, Security Groups & NACLs](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/03-route-tables-security-groups-and-nacls.md).
- **Module hiện tại**: [Module 02: Networking & Virtual Private Cloud (VPC)](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [Module 03: Compute & Scaling (EC2, ASG, ALB, Lambda)](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/README.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 VPC Peering & Giới Hạn Không Bắc Cầu (Non-Transitive Routing)
- **VPC Peering** là kết nối mạng trực tiếp 1-1 giữa hai VPC (cùng Region hoặc khác Region - Cross-Region Peering) thông qua mạng cáp quang riêng của AWS.
- Lưu lượng không đi qua Internet công cộng, được mã hóa tự động và không có nút thắt cổ chai về băng thông.
- **Điều kiện tiên quyết**: Hai VPC **tuyệt đối không được trùng lặp dải địa chỉ IP (No Overlapping CIDR)**.
- **Bẫy Không Bắc Cầu (Non-Transitive Routing)**:
  $$\text{VPC A} \longleftrightarrow \text{VPC B} \quad \text{và} \quad \text{VPC B} \longleftrightarrow \text{VPC C} \quad \centernot\Longrightarrow \quad \mathbf{\text{VPC A KHÔNG THỂ gọi tới VPC C!}}$$
  - Muốn A kết nối với C, bạn bắt buộc phải tạo một Peering Connection thứ 3 trực tiếp giữa A và C.
  - Khi số lượng VPC tăng lên $N$, số kết nối cần thiết là $\frac{N(N-1)}{2}$ (Mô hình lưới Mesh quá phức tạp để quản lý khi có hàng chục VPC).

### 2.2 AWS Transit Gateway (TGW) - Kiến Trúc Ngôi Sao (Hub-and-Spoke)
- Thay thế mô hình kết nối lưới phức tạp bằng một **Bộ định tuyến đám mây trung tâm (Cloud Router)**.
- Mọi VPC và văn phòng On-Premises (qua VPN / Direct Connect) chỉ cần kết nối 1 đường duy nhất vào Transit Gateway.
- **Hỗ trợ định tuyến bắc cầu (Transitive Routing)**: VPC A có thể gửi gói tin qua Transit Gateway để tới VPC C một cách tự động và dễ dàng kiểm soát tập trung.

---

## 3. Chuyên Đề Sâu: Hai Loại VPC Endpoints

VPC Endpoints cho phép các máy ảo trong Private Subnet kết nối tới các dịch vụ của AWS (S3, DynamoDB, SQS) mà **hoàn toàn không cần Internet Gateway hay NAT Gateway**:

```
[ Private Subnet: EC2 (Không có Public IP) ]
           ├── (Qua Route Table) ────────> [ GATEWAY ENDPOINT ] ──> S3 / DynamoDB (MIỄN PHÍ)
           └── (Qua Card mạng ENI riêng) ─> [ INTERFACE ENDPOINT] ──> SQS / Secrets Manager (PrivateLink)
```

| Tiêu chí | Gateway Endpoint | Interface Endpoint (AWS PrivateLink) |
| :--- | :--- | :--- |
| **Dịch vụ hỗ trợ** | **CHỈ hỗ trợ duy nhất 2 dịch vụ: S3 và DynamoDB** | Hỗ trợ hầu như **tất cả dịch vụ AWS còn lại** (SQS, SNS, ECR, KMS, v.v.) và custom SaaS |
| **Cơ chế hoạt động** | Tự động cập nhật bảng **Route Table** với một Prefix List ID (`pl-xxxx`) | Tạo ra một **Card mạng ảo ENI (Private IP)** trực tiếp trong Subnet của bạn |
| **Chi phí** | **HOÀN TOÀN MIỄN PHÍ** ($0 phí duy trì, $0 phí xử lý dữ liệu) | Có tính phí theo giờ ($\approx \$0.01\text{/giờ/AZ}$) + Phí xử lý dữ liệu ($\$0.01\text{/GB}$) |
| **Phân giải DNS** | Không thay đổi DNS | Sử dụng tính năng **Private DNS** để trỏ domain chuẩn của AWS về Private IP của ENI |

---

## 4. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Quên Cập Nhật Route Table Của CẢ HAI VPC Khi Tạo Peering**
> Tạo xong VPC Peering Connection và Accept chưa đủ để hai VPC nói chuyện được với nhau! Bạn bắt buộc phải:
> 1. Vào Route Table của VPC A: Thêm dòng trỏ dải CIDR của VPC B tới `pcx-xxxx`.
> 2. Vào Route Table của VPC B: Thêm dòng trỏ dải CIDR của VPC A tới `pcx-xxxx`.
> 3. Cập nhật Inbound rules của Security Groups ở cả hai đầu.

> [!WARNING]
> **Bẫy 2: Lãng Phí Tiền Triển Khai Interface Endpoint Cho S3 Thay Vì Gateway Endpoint**
> S3 hiện tại hỗ trợ cả Gateway Endpoint và Interface Endpoint. Nhiều người không hiểu bản chất đã chọn tạo Interface Endpoint cho S3, dẫn đến phải trả thêm hàng trăm USD phí xử lý dữ liệu mà không nhận ra rằng Gateway Endpoint của S3 là hoàn toàn **MIỄN PHÍ 100%**.

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao VPC Peering không hỗ trợ định tuyến bắc cầu (Non-transitive)?**
   - *Trả lời*: AWS thiết kế VPC Peering theo kiến trúc điểm-điểm (Point-to-Point) thuần túy để đảm bảo cô lập an ninh tuyệt đối giữa các ranh giới mạng và tránh việc một VPC trung gian vô tình trở thành điểm trung chuyển dữ liệu ngoài ý muốn. Nếu cần bắc cầu, AWS yêu cầu sử dụng AWS Transit Gateway.
2. **Gateway Endpoint cho Amazon S3 hoạt động như thế nào trong bảng Route Table?**
   - *Trả lời*: Khi được tạo, Gateway Endpoint tự động thêm một tuyến đường vào Route Table với Destination là AWS Prefix List của S3 (tập hợp tất cả các dải IP công khai của S3 trong Region đó, vd: `pl-63a5400a`) và Target trỏ về định danh Endpoint `vpce-xxxx`. Khi EC2 gọi API S3, gói tin được định tuyến thẳng qua backbone nội bộ của AWS mà không cần ra Internet.
3. **Khi nào nên sử dụng AWS PrivateLink (Interface Endpoints)?**
   - *Trả lời*: Khi bạn muốn bảo vệ lưu lượng truy cập tới các dịch vụ AWS nhạy cảm (như Secrets Manager, KMS, SQS) hoặc chia sẻ dịch vụ nội bộ giữa các tài khoản AWS khác nhau mà không muốn mở traffic ra Internet và không muốn phải cấu hình VPC Peering phức tạp.
