# 01. EC2 Instance Types & Pricing Models

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 02: Networking & Virtual Private Cloud (VPC)](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/README.md).
- **Module hiện tại**: [Module 03: Compute & Scaling](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [02. Auto Scaling & Launch Templates](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/02-auto-scaling-groups-and-launch-templates.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Quy Ước Đặt Tên EC2 Instance Type
Ví dụ: `m7g.2xlarge`
- `m`: **Dòng máy (Instance Family)**. `m` là General Purpose.
- `7`: **Thế hệ phần cứng (Generation)**. Số càng cao nghĩa là phần cứng càng mới và hiệu năng trên giá thành càng tốt.
- `g`: **Tính năng bổ sung (Additional Capabilities)**. `g` đại diện cho chip xử lý **AWS Graviton (Kiến trúc ARM 64-bit)** do AWS tự thiết kế, tiết kiệm $20\%-40\%$ chi phí so với Intel/AMD (`i`/`a`).
- `2xlarge`: **Kích thước (Size)**. Cứ lên một bậc size (vd: `xlarge` $\rightarrow$ `2xlarge`), số lượng vCPU và RAM sẽ nhân đôi tương ứng.

### 2.2 Năm Họ Máy Ảo Chủ Lực
1. **General Purpose (`M`, `T`)**: Tỉ lệ cân bằng $1\text{ vCPU} : 4\text{ GB RAM}$. Thích hợp cho Web servers, Microservices, môi trường phát triển.
   - Dòng `T` (Burstable): Sử dụng cơ chế CPU Credits. Khi nhàn rỗi tích lũy credits, khi traffic tăng đột biến tiêu thụ credits để vượt ngưỡng $100\%$ CPU.
2. **Compute Optimized (`C`)**: Tỉ lệ $1\text{ vCPU} : 2\text{ GB RAM}$. Tối ưu xử lý tính toán chuyên sâu, mã hóa video, thuật toán AI, game servers.
3. **Memory Optimized (`R`, `X`)**: Tỉ lệ $1\text{ vCPU} : 8\text{ GB RAM}$. Dành riêng cho In-Memory Caching (Redis/Memcached) và cơ sở dữ liệu quan hệ dung lượng lớn.
4. **Storage Optimized (`I`, `D`)**: Đi kèm ổ đĩa NVMe SSD trực tiếp (Instance Store) với tốc độ đọc ghi IOPS hàng trăm nghìn lần/giây, dùng cho NoSQL (Cassandra, ScyllaDB) và Data Warehousing.
5. **Accelerated Computing (`P`, `G`)**: Tích hợp phần cứng GPU (NVIDIA H100/A100) phục vụ huấn luyện Machine Learning và đồ họa 3D.

---

## 3. Bốn Mô Hình Định Giá (Purchasing Models)

| Mô hình mua | Mức giảm giá | Ràng buộc cam kết | Trường hợp sử dụng tối ưu |
| :--- | :--- | :--- | :--- |
| **On-Demand** | $0\%$ (Giá gốc) | Không cam kết, thanh toán theo giây | Ứng dụng mới ra mắt, lưu lượng thất thường, chạy thử nghiệm ngắn hạn |
| **Savings Plans** | **Lên tới $72\%$** | Cam kết chi tiêu tối thiểu (vd: $\$10\text{/giờ}$) trong **1 hoặc 3 năm** | Workload ổn định, chạy liên tục 24/7 (Cơ sở dữ liệu, core services) |
| **Reserved Instances (RI)** | **Lên tới $72\%$** | Cam kết sử dụng loại máy ảo cụ thể trong **1 hoặc 3 năm** | Hệ thống truyền thống cần đặt trước dung lượng (Capacity Reservation) |
| **Spot Instances** | **Lên tới $90\%$** | Không cam kết, **AWS có quyền thu hồi bất kỳ lúc nào sau 2 phút thông báo** | Xử lý hàng loạt (Batch processing), CI/CD runners, Big Data (EMR) |

---

## 4. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Chạy Cơ Sở Dữ Liệu Hoặc Stateful App Trên Spot Instances**
> Do giá thành rẻ hơn tới $90\%$, nhiều người ham rẻ dùng Spot cho Production Database. Khi nhu cầu thị trường tăng, AWS phát tín hiệu ngắt kết nối (Interruption Warning) và **thu hồi máy ảo chỉ sau đúng 2 phút**, khiến Database bị ngắt đột ngột và hỏng dữ liệu!
> - **Quy tắc**: Spot chỉ được dùng cho ứng dụng Stateless, có thể chịu lỗi (Fault-tolerant), hoặc kiến trúc phân tán có cơ chế tự phục hồi.

> [!WARNING]
> **Bẫy 2: Dữ Liệu Bị Biến Mất Khi Dùng Ổ Cứng Instance Store**
> Nhiều dòng máy ảo đi kèm ổ đĩa cực nhanh gọi là **Instance Store (Ephemeral Storage)**. Ổ cứng này gắn trực tiếp vào khe cắm của máy chủ vật lý.
> - **Bản chất**: Khi bạn lệnh `Stop` máy ảo và `Start` lại, EC2 chuyển sang máy chủ vật lý khác $\rightarrow$ **Toàn bộ dữ liệu trên Instance Store biến mất vĩnh viễn**!
> - **Giải pháp**: Chỉ dùng Instance Store làm buffer tạm thời/cache; dữ liệu quan trọng bắt buộc phải lưu trên **Amazon EBS**.

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Làm thế nào để ứng dụng xử lý thông báo thu hồi Spot Instance (Spot Interruption Notice) trong 2 phút?**
   - *Trả lời*: Lắng nghe sự kiện thông qua **Amazon EventBridge** (`EC2 Spot Instance Interruption Warning`) hoặc liên tục thăm dò URL Metadata của máy ảo: `http://169.254.169.254/latest/meta-data/spot/instance-action`. Khi phát hiện tín hiệu, ứng dụng có 120 giây để hoàn tất các request đang dở dang (Drain connections), lưu lại checkpoint trạng thái lên S3/Database và thoát an toàn.
2. **Compute Savings Plans khác gì so với EC2 Instance Savings Plans?**
   - *Trả lời*: **Compute Savings Plans** linh hoạt nhất: Áp dụng giảm giá tự động bất kể thay đổi dòng máy (từ C sang M), thay đổi OS (Linux sang Windows), thay đổi Region, hoặc thậm chí chuyển workload sang AWS Fargate và AWS Lambda. **EC2 Instance Savings Plans** kém linh hoạt hơn (chỉ áp dụng cho 1 họ máy trong 1 Region cố định) nhưng mức giảm giá sâu hơn một chút.
3. **CPU Credits trong dòng máy ảo `T` hoạt động như thế nào?**
   - *Trả lời*: Mỗi giờ máy ảo nhận được một lượng credits nhất định tùy kích thước. 1 credit tương đương với 1 vCPU chạy ở $100\%$ công suất trong 1 phút. Khi CPU chạy dưới mức cơ sở (Baseline), credits được tích lũy. Khi ứng dụng cần xử lý tải đột biến (Burst), máy ảo tiêu thụ credits tích lũy để tăng vọt công suất mà không bị giật lag.
