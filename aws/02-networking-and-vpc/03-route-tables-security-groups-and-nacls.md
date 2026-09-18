# 03. Route Tables, Security Groups & Network ACLs (NACLs)

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [02. Internet Gateway vs NAT Gateways](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/02-internet-gateway-and-nat-gateways.md).
- **Module hiện tại**: [Module 02: Networking & Virtual Private Cloud (VPC)](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [04. VPC Peering & VPC Endpoints (PrivateLink)](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/04-vpc-peering-transit-gateway-and-endpoints.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Bảng Định Tuyến (Route Tables) & Nguyên Tắc Khớp Tiền Tố Dài Nhất
- Mỗi Subnet trong VPC phải được liên kết với **duy nhất 1 Route Table**.
- Một Route Table có thể gắn vào nhiều Subnet khác nhau.
- **Nguyên tắc Longest Prefix Match (Khớp tiền tố dài nhất)**:
  Khi một gói tin cần tìm đường đi, router sẽ chọn rule có độ dài subnet mask `/` lớn nhất (chính xác nhất) để định tuyến.
  - *Ví dụ*: Bảng có 2 rule:
    1. `10.0.0.0/16 -> local`
    2. `10.0.1.0/24 -> pcx-peering-connection`
  - Gói tin gửi tới `10.0.1.50` sẽ khớp với rule 2 (độ dài `/24` cụ thể hơn `/16`).

---

## 3. So Sánh Chi Tiết: Security Groups vs Network ACLs

Hầu như mọi buổi phỏng vấn AWS Solutions Architect đều kiểm tra bảng so sánh cốt lõi này:

```
[ Gói tin từ Internet ]
          ↓
[ 1. Chốt chặn vòng ngoài: Network ACL (NACL) - Kiểm tra tại ranh giới Subnet ]
          ↓
[ 2. Chốt chặn vòng trong: Security Group (SG) - Kiểm tra tại card mạng ảo ENI ]
          ↓
[ Máy ảo EC2 / Container ]
```

| Tiêu chí so sánh | Security Group (SG) | Network Access Control List (NACL) |
| :--- | :--- | :--- |
| **Phạm vi tác động** | Gắn vào từng **Card mạng ảo (ENI / Instance)** | Gắn vào toàn bộ **Subnet** |
| **Trạng thái lưu trữ (State)** | **STATEFUL (Có trạng thái)** | **STATELESS (Không trạng thái)** |
| **Cơ chế phản hồi** | Nếu Inbound được phép đi vào, **traffic phản hồi tự động được phép đi ra** bất kể luật Outbound | **Không nhớ trạng thái**. Phải tự cấu hình tường minh cả luật Inbound VÀ luật Outbound |
| **Loại quy tắc** | **Chỉ hỗ trợ ALLOW** (mọi thứ khác mặc định Deny) | Hỗ trợ cả **ALLOW** và **DENY** rõ ràng |
| **Thứ tự thực thi** | Đánh giá **toàn bộ các rules** cùng lúc | Duyệt **tuần tự theo số thứ tự (Rule #)** từ nhỏ đến lớn, khớp là dừng |
| **Tham chiếu (Chaining)** | Cho phép tham chiếu tới **Security Group ID khác** | Chỉ cho phép chỉ định dải địa chỉ IP (CIDR block) |

---

## 4. Kỹ Thuật Xâu Chuỗi Security Group (SG Chaining - Zero IP Hardcoding)

Thay vì phải gõ cứng địa chỉ IP tĩnh vào rule tường lửa (dễ vỡ khi máy ảo co giãn Auto Scaling), kiến trúc chuẩn mực sử dụng kỹ thuật **Security Group Chaining**:

```
[ Internet: 0.0.0.0/0 ]
          ↓ (Port 80/443)
[ ALB Security Group: sg-alb ]
          ↓ (Port 8080 - Chỉ cho phép nguồn từ 'sg-alb')
[ App Server Security Group: sg-app ]
          ↓ (Port 5432 - Chỉ cho phép nguồn từ 'sg-app')
[ Database Security Group: sg-database ]
```

- **Lợi ích**: Dù Auto Scaling thêm 10 máy ảo mới với các IP khác nhau, toàn bộ máy ảo mới tự động kế thừa quyền truy cập vào Database mà không cần ai phải chỉnh sửa cấu hình firewall!
- Kẻ tấn công trên Internet dù có biết IP nội bộ của Database cũng không thể kết nối tới port 5432 vì request không xuất phát từ card mạng mang nhãn `sg-app`.

---

## 5. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Bẫy Cổng Tạm Thời (Ephemeral Ports) Trong NACL**
> Do NACL là **Stateless**, khi máy ảo EC2 gửi request ra ngoài web (Port 80/443), web server phản hồi về máy ảo thông qua một cổng ngẫu nhiên gọi là **Ephemeral Port (dải cổng `1024-65535`)**.
> - Nếu Inbound NACL của bạn chỉ mở port 80/443 mà quên mở dải cổng `1024-65535`, **toàn bộ gói tin phản hồi từ bên ngoài sẽ bị NACL chặn sạch**, khiến lệnh `curl` hoặc `apt update` bị treo timeout vĩnh viễn!

> [!WARNING]
> **Bẫy 2: Chặn IP Tấn Công Bằng Security Group (Nhiệm Vụ Bất Khả Thi)**
> Security Group **chỉ hỗ trợ Allow rules**, không hỗ trợ Deny. Bạn không thể dùng Security Group để block một địa chỉ IP độc hại cụ thể đang spam DDoS.
> - **Giải pháp**: Phải sử dụng **Network ACL** với rule Deny có số thứ tự ưu tiên cao (vd: `Rule 50: Deny 203.0.113.50/32`), hoặc sử dụng dịch vụ **AWS WAF** (Web Application Firewall).

---

## 6. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao khi một kết nối SSH (Port 22) đi vào thành công qua Security Group, gói tin trả về không bị chặn dù Outbound Rule của Security Group bị xóa sạch?**
   - *Trả lời*: Vì Security Group là **Stateful**. Bộ theo dõi kết nối (Connection Tracker) tự động ghi nhớ phiên TCP đã được chấp thuận ở chiều Inbound và tự động cho phép lưu lượng phản hồi đi ra ngoài mà không cần xem xét các Outbound rules.
2. **NACL có một Rule 100 Allow HTTP từ 0.0.0.0/0 và Rule 50 Deny IP 1.2.3.4/32. IP 1.2.3.4 có truy cập được không?**
   - *Trả lời*: **Không truy cập được**. NACL đánh giá các rules tuần tự theo số thứ tự từ nhỏ đến lớn. Rule 50 được đánh giá trước Rule 100. Gói tin từ IP 1.2.3.4 khớp với Rule 50 (Deny) và lập tức bị drop ngay tại chỗ mà không bao giờ được duyệt tới Rule 100.
3. **Kỹ thuật Security Group Chaining giải quyết bài toán gì trong môi trường Auto Scaling?**
   - *Trả lời*: Loại bỏ hoàn toàn việc phải cấu hình IP thủ công. Bằng cách cho phép `sg-db` chấp nhận traffic đến từ `sg-app`, bất kỳ máy ảo nào được sinh ra bởi Auto Scaling mang `sg-app` đều nghiễm nhiên có quyền kết nối vào cơ sở dữ liệu, đảm bảo bảo mật chặt chẽ và tính co giãn linh hoạt tuyệt đối.
