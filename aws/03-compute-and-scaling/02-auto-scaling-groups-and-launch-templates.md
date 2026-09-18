# 02. Auto Scaling Groups & Launch Templates

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. EC2 Instance Types & Pricing Models](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/01-ec2-instance-types-and-pricing-models.md).
- **Module hiện tại**: [Module 03: Compute & Scaling](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [03. Elastic Load Balancing (ALB vs NLB)](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/03-elastic-load-balancing-alb-and-nlb.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Bản Mẫu Khởi Tạo (Launch Template)
- **Launch Template** là bản thiết kế (Blueprint) mô tả cách một máy ảo EC2 mới được sinh ra:
  - Mã định danh Image (**AMI ID**).
  - Dòng máy ảo (**Instance Type** - hỗ trợ khai báo danh sách nhiều loại máy ảo kết hợp On-Demand và Spot).
  - **Security Groups**, **Key Pair**.
  - **IAM Instance Profile** (Quyền hạn IAM của máy ảo).
  - **User Data Script**: Kịch bản bash chạy tự động lúc khởi động lần đầu (Cài đặt Docker, pull code, cấu hình service).
- **Hỗ trợ Quản lý Phiên bản (Versioning)**: Cho phép nâng cấp từ Version 1 sang Version 2 mà không làm gián đoạn hệ thống.

### 2.2 Nhóm Co Giãn Tự Động (Auto Scaling Group - ASG)
- **Ba tham số dung lượng cốt lõi**:
  - **`MinSize`**: Số lượng máy ảo tối thiểu phải duy trì (không bao giờ giảm dưới ngưỡng này).
  - **`MaxSize`**: Số lượng máy ảo tối đa cho phép co giãn (chốt chặn chi phí).
  - **`DesiredCapacity`**: Số lượng máy ảo mong muốn hoạt động ở thời điểm hiện tại.
- **Cân Bằng Đa Vùng Khả Dụng (Multi-AZ Rebalancing)**:
  - ASG luôn cố gắng duy trì số lượng máy ảo đồng đều giữa các Availability Zones.
  - Nếu bạn cấu hình ASG trên 2 AZs với 4 máy ảo, ASG sẽ tự động đặt 2 máy ở AZ-1a và 2 máy ở AZ-1b. Nếu 1 máy ở AZ-1a chết, ASG sẽ tạo máy mới đúng tại AZ-1a để tái cân bằng.

---

## 3. Bốn Chiến Lược Co Giãn (Scaling Policies)

1. **Target Tracking Scaling (Khuyên dùng nhiều nhất)**:
   - Hoạt động tương tự bộ điều nhiệt máy lạnh (Thermostat): Bạn chỉ cần đặt mục tiêu (vd: "Giữ mức sử dụng CPU trung bình ở $50\%$", hoặc "Giữ số request mỗi instance ở mức $1,000$"). ASG tự động tính toán tăng hoặc giảm số lượng máy ảo để đưa chỉ số về mục tiêu.
2. **Step Scaling**:
   - Phản ứng theo các bậc thang lỗi khi CloudWatch Alarm bị vi phạm (vd: Nếu CPU $> 60\%$ thêm 1 máy; nếu CPU $> 80\%$ thêm ngay 3 máy).
3. **Scheduled Scaling**:
   - Tự động co giãn theo lịch trình cố định đã biết trước (vd: Tự động tăng lên 20 máy vào lúc 08:00 sáng Thứ Hai và giảm về 2 máy vào 22:00 đêm).
4. **Predictive Scaling (Co giãn dự đoán bằng Machine Learning)**:
   - AWS sử dụng thuật toán AI phân tích lịch sử lưu lượng của 2 tuần trước để dự đoán trước 48 giờ và chủ động khởi động máy ảo trước khi đợt sóng traffic thực sự ập đến.

---

## 4. Kiểm Tra Sức Khỏe & Vòng Đời (Health Checks & Lifecycle Hooks)

### 4.1 Cơ Chế Tự Phục Hồi (Self-Healing với ELB Health Check)
- Mặc định, ASG chỉ dùng **EC2 Status Checks** (chỉ phát hiện lỗi phần cứng hoặc kernel panic).
- Nếu ứng dụng web của bạn bị treo hoặc crash trả về mã lỗi HTTP 500, EC2 Status Check vẫn báo `Healthy`!
- **Giải pháp**: Luôn bật **`HealthCheckType: ELB`**. Khi Load Balancer phát hiện ứng dụng không phản hồi HTTP 200 tại `/healthz`, nó báo cho ASG. ASG sẽ **tự động kill máy ảo lỗi và sinh ra máy ảo mới thay thế** hoàn toàn tự động.

### 4.2 Lifecycle Hooks (Bảo Vệ Graceful Shutdown)
- Khi ASG quyết định thu hồi (Terminate) một máy ảo:
- Máy ảo bình thường sẽ bị tắt ngay lập tức.
- Với **Lifecycle Hook (`autoscaling:EC2_INSTANCE_TERMINATING`)**:
  - Máy ảo được giữ ở trạng thái chờ `Terminating:Wait` (tối đa tới 1 giờ).
  - Cho phép ứng dụng hoàn tất việc xử lý các request đang dở dang, hoàn thành giao dịch ngân hàng, và tải log file lên S3 trước khi máy ảo chính thức bị xóa sổ.

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Sự khác biệt giữa Launch Configuration và Launch Template là gì?**
   - *Trả lời*: Launch Configuration là công nghệ di sản cũ (Legacy), không hỗ trợ quản lý phiên bản (mỗi lần sửa phải tạo file mới), không hỗ trợ kết hợp nhiều loại máy ảo On-Demand/Spot trong cùng 1 ASG. **Launch Template** là chuẩn hiện đại, hỗ trợ Versioning, hỗ trợ Spot Allocation Strategies, hỗ trợ T2/T3 Unlimited và các tính năng EC2 mới nhất.
2. **Quy tắc lựa chọn máy ảo để xóa bỏ (Termination Policy) mặc định của ASG diễn ra như thế nào?**
   - *Trả lời*:
     1. Tìm AZ có số lượng máy ảo nhiều nhất.
     2. Trong AZ đó, tìm máy ảo sử dụng Launch Template / Configuration phiên bản cũ nhất.
     3. Nếu giống nhau, chọn máy ảo gần đến mốc tính tiền của chu kỳ tiếp theo.
     4. Nếu vẫn giống nhau, chọn máy ảo được tạo ra sớm nhất (Oldest Instance).
3. **Tại sao nên kết hợp On-Demand Base và Spot Percentage trong một Auto Scaling Group?**
   - *Trả lời*: Đạt được sự cân bằng tối thượng giữa độ tin cậy và chi phí. Duy trì một số lượng máy ảo On-Demand cố định làm "xương sống" vững chắc để đảm bảo dịch vụ cốt lõi không bao giờ sập, và co giãn phần tải dư thừa đột biến bằng Spot Instances để tiết kiệm tới $90\%$ chi phí điện toán.
