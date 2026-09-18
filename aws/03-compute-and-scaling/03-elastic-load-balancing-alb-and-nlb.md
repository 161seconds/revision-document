# 03. Elastic Load Balancing: ALB vs NLB

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [02. Auto Scaling & Launch Templates](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/02-auto-scaling-groups-and-launch-templates.md).
- **Module hiện tại**: [Module 03: Compute & Scaling](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [04. Serverless Compute: AWS Lambda](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/04-serverless-compute-aws-lambda.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Tổng Quan Về Elastic Load Balancing (ELB)
- Dịch vụ cân bằng tải được AWS quản lý hoàn toàn, tự động co giãn băng thông theo dung lượng traffic mà không lo nghẽn mạng.
- **Yêu cầu triển khai**: Đối với Load Balancer công khai (Internet-facing), bạn **bắt buộc phải chọn tối thiểu 2 Public Subnets nằm ở 2 Availability Zones khác nhau** để đảm bảo khả năng chịu lỗi thảm họa.

---

## 3. So Sánh Chi Tiết: ALB vs NLB vs GWLB

| Tiêu chí | Application Load Balancer (ALB) | Network Load Balancer (NLB) | Gateway Load Balancer (GWLB) |
| :--- | :--- | :--- | :--- |
| **Tầng OSI** | **Layer 7** (Application: HTTP/HTTPS/gRPC) | **Layer 4** (Transport: TCP/UDP/TLS) | **Layer 3** (Network Gateway + Geneve) |
| **Độ trễ (Latency)** | Khoảng $10-20\text{ ms}$ (Xử lý HTTP headers) | **Cực thấp ($< 1\text{ ms}$ - Microseconds)** | Tối ưu cho thiết bị mạng kiểm tra |
| **Throughput** | Hàng chục ngàn requests/giây | **Hàng triệu requests/giây** | Băng thông lớn |
| **Địa chỉ IP** | **IP động (Dynamic IPs)** thay đổi liên tục, trỏ qua DNS | **Cố định 1 Static Elastic IP** cho mỗi AZ | Gắn với Gateway Endpoint |
| **Tính năng định tuyến** | Rất phong phú: Host, Path, Headers, Query String | Chỉ định tuyến theo IP/Port | Chuyển toàn bộ traffic qua Firewall |
| **Xử lý SSL/TLS** | TLS Termination + Hỗ trợ **SNI** nhiều certs | TLS Offload tốc độ phần cứng | Trong suốt (Transparent) |

---

## 4. Các Tính Năng Nâng Cao Sống Còn

### 4.1 Cân Bằng Đa Vùng Khả Dụng (Cross-Zone Load Balancing)
- Nếu AZ-1a có 2 máy ảo và AZ-1b có 8 máy ảo:
  - **Khi TẮT Cross-Zone**: Traffic chia đều 50% vào AZ-1a và 50% vào AZ-1b $\rightarrow$ 2 máy ở AZ-1a mỗi máy chịu $25\%$ tải, trong khi 8 máy ở AZ-1b mỗi máy chỉ chịu $6.25\%$ tải (**Mất cân bằng tải nghiêm trọng**).
  - **Khi BẬT Cross-Zone (Mặc định bật trên ALB)**: Traffic được chia đều $10\%$ cho mỗi máy ảo trên toàn bộ các AZs.

### 4.2 Thời Gian Chờ Rút Kết Nối (Deregistration Delay / Connection Draining)
- Khi một máy ảo bị đánh dấu là `Unhealthy` hoặc chuẩn bị bị Auto Scaling thu hồi:
- Load Balancer ngừng gửi request mới tới máy ảo đó.
- Nó cho phép một khoảng thời gian chờ (mặc định là $300\text{ giây}$) để **các request đang xử lý dở dang được hoàn tất trọn vẹn**, tránh việc người dùng bị ngắt kết nối giữa chừng và nhận lỗi `502 Bad Gateway`.

### 4.3 Phân Giải Tên Miền Đa Chứng Chỉ SSL (Server Name Indication - SNI)
- Cho phép gắn hàng chục chứng chỉ SSL/TLS khác nhau vào cùng **1 con ALB duy nhất**.
- Trình duyệt gửi tên miền cần truy cập (vd: `api.domain.com` hoặc `portal.domain.com`) ngay trong gói tin TLS Handshake ban đầu. ALB đọc SNI và tự động chọn đúng chứng chỉ SSL tương ứng từ AWS Certificate Manager (ACM).

---

## 5. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Dùng Địa Chỉ IP Thay Vì CNAME / Alias Record Cho ALB**
> Địa chỉ IP của ALB liên tục thay đổi khi AWS co giãn các node cân bằng tải ngầm phía sau. Nếu bạn cấu hình DNS A-Record trỏ cứng vào một địa chỉ IP tạm thời của ALB, trang web sẽ bị sập khi AWS thu hồi node đó!
> - **Quy tắc**: Luôn sử dụng **DNS CNAME** hoặc **Route 53 Alias Record** trỏ vào DNS Name của ALB (vd: `my-alb-123456.ap-southeast-1.elb.amazonaws.com`).

> [!WARNING]
> **Bẫy 2: Khách Hàng Yêu Cầu Cung Cấp IP Tĩnh Mà Lại Chọn ALB**
> Nếu hệ thống của khách hàng yêu cầu mở tường lửa (IP Whitelisting) chỉ chấp nhận duy nhất 1 hoặc 2 địa chỉ IP tĩnh cố định, bạn **không thể dùng ALB** vì ALB không có IP tĩnh.
> - **Giải pháp**: Bắt buộc phải sử dụng **Network Load Balancer (NLB)** với Elastic IPs cố định.

---

## 6. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Target Group trong ALB có thể chứa những loại đích đến nào?**
   - *Trả lời*:
     1. Máy ảo EC2 Instances.
     2. Container Tasks (Amazon ECS / EKS).
     3. Hàm Serverless **AWS Lambda**.
     4. Địa chỉ IP nội bộ Private IPs (kể cả máy chủ đặt tại On-Premises thông qua kết nối Direct Connect/VPN).
2. **Làm thế nào để cấu hình ALB tự động chuyển hướng toàn bộ traffic HTTP (Port 80) sang HTTPS (Port 443)?**
   - *Trả lời*: Trong Listener của Port 80, tạo một Default Rule với Action là **Redirect**. Cấu hình redirect sang Protocol: `HTTPS`, Port: `443`, Status Code: `HTTP_301 (Moved Permanently)`. ALB sẽ tự động xử lý chuyển hướng ở Layer 7 mà không cần gửi request vào máy chủ backend.
3. **Sticky Sessions (Session Affinity) hoạt động như thế nào và nhược điểm của nó là gì?**
   - *Trả lời*: ALB chèn một cookie vào trình duyệt người dùng (hoặc dùng cookie ứng dụng). Mọi request tiếp theo của người dùng đó sẽ luôn được định tuyến về đúng cùng một máy ảo backend. **Nhược điểm**: Làm mất tính cân bằng tải đồng đều (một máy ảo có thể bị quá tải do phục vụ nhiều người dùng hoạt động mạnh) và gây khó khăn khi cần scale down.
