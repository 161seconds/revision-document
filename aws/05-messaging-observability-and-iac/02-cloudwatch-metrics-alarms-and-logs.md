# 02. CloudWatch Metrics, Alarms & Logs Insights

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. SQS, SNS & Event-Driven Architecture](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/01-sqs-sns-and-event-driven-architecture.md).
- **Module hiện tại**: [Module 05: Messaging, Observability & IaC](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [03. CloudTrail, AWS Config & Governance](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/03-cloudtrail-aws-config-and-governance.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Amazon CloudWatch Metrics
- Lưu trữ dữ liệu chuỗi thời gian (Time-Series Data) đo lường hiệu năng của mọi dịch vụ AWS.
- **Tần số thu thập (Resolution)**:
  - **Basic Monitoring (Mặc định)**: Cập nhật mỗi **5 phút một lần** (Miễn phí).
  - **Detailed Monitoring**: Cập nhật mỗi **1 phút một lần** (Có tính phí bổ sung, cần thiết cho Auto Scaling phản ứng nhanh).
  - **High-Resolution Custom Metrics**: Hỗ trợ tần số siêu nhỏ: 1 giây, 5 giây, 10 giây.
- **Metric Dimensions**: Cặp Key-Value dùng để lọc và phân nhóm số liệu (vd: `InstanceId=i-123456`, `AutoScalingGroupName=prod-asg`).

### 2.2 CloudWatch Alarms (Cảnh Báo Tự Động)
- Theo dõi một Metric cụ thể qua các chu kỳ (Evaluation Periods).
- **Ba trạng thái của Alarm**:
  1. **`OK`**: Chỉ số nằm trong ngưỡng bình thường.
  2. **`ALARM`**: Chỉ số đã vượt quá ngưỡng cấu hình trong số chu kỳ quy định (vd: CPU $> 80\%$ trong $3$ chu kỳ liên tiếp $5\text{ phút}$).
  3. **`INSUFFICIENT_DATA`**: Không có đủ dữ liệu để đánh giá (máy ảo mới bật hoặc bị tắt).
- **Hành động khi rơi vào trạng thái ALARM**:
  - Gửi thông báo khẩn cấp tới **Amazon SNS Topic** (bắn thông báo về Slack / PagerDuty / Email).
  - Kích hoạt chính sách mở rộng hoặc thu hẹp máy ảo trong **EC2 Auto Scaling Group**.
  - Tự động khởi động lại (Reboot) hoặc phục hồi máy ảo EC2 bị hỏng phần cứng.

---

## 3. CloudWatch Logs & Công Cụ Truy Vấn Logs Insights

### 3.1 Cấu Trúc Quản Lý Log
- **Log Group**: Tập hợp các dòng log có cùng tính chất chia sẻ chung cấu hình lưu trữ và phân quyền IAM (vd: `/aws/lambda/payment-api`, `/ec2/nginx/access.log`).
- **Log Stream**: Luồng log đại diện cho một nguồn phát cụ thể trong Log Group (mỗi container Docker hoặc mỗi máy ảo EC2 sở hữu một Log Stream riêng).
- **Metric Filters (Bộ lọc trích xuất chỉ số)**:
  - Lắng nghe log theo thời gian thực và trích xuất thành chỉ số định lượng.
  - *Ví dụ*: Quét pattern `[..., status = 5*, size, url]` để đếm số lượng lỗi HTTP 5xx và biến nó thành một Metric để tạo Alarm cảnh báo.

### 3.2 Cú Pháp Truy Vấn Siêu Tốc: CloudWatch Logs Insights
Công cụ truy vấn tương tác mạnh mẽ cho phép quét hàng gigabyte log chỉ trong vài giây:

```sql
fields @timestamp, @message, statusCode, path
| filter statusCode >= 500
| stats count(*) as ErrorCount by bin(5m), path
| sort ErrorCount desc
| limit 20
```

---

## 4. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Không Cấu Hình Thời Hạn Hết Hạn Log (Retention Period)**
> Theo mặc định, CloudWatch Log Groups được tạo với cấu hình **`Never Expire` (Không bao giờ xóa)**. Sau vài năm, hàng chục terabyte log rác tích tụ sẽ tiêu tốn hàng nghìn USD chi phí lưu trữ mỗi tháng!
> - **Quy tắc bắt buộc**: Luôn thiết lập Retention Period rõ ràng (vd: 7 ngày cho môi trường Dev, 30-90 ngày cho môi trường Production).

> [!WARNING]
> **Bẫy 2: Lầm Tưởng CloudWatch Giám Sát Được Mức Sử Dụng RAM Của EC2**
> Mặc định, CloudWatch **KHÔNG THỂ đo lường được Memory Utilization hay Disk Space** của máy ảo EC2!
> - **Lý do**: Hypervisor của AWS chỉ nhìn thấy tài nguyên từ bên ngoài (CPU, Network In/Out, Disk I/O). Bộ nhớ RAM nằm bên trong quyền quản lý riêng của Hệ điều hành máy ảo (Guest OS).
> - **Giải pháp**: Phải cài đặt **CloudWatch Unified Agent** bên trong máy ảo EC2 để thu thập số liệu RAM và Disk rồi đẩy về dưới dạng Custom Metric.

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Composite Alarms trong CloudWatch có tác dụng gì?**
   - *Trả lời*: Cho phép kết hợp nhiều Alarm độc lập bằng biểu thức logic Boolean (`AND`, `OR`, `NOT`). Giúp giảm thiểu tối đa hiện tượng "bão cảnh báo" (Alarm Fatigue) gây nhiễu loạn cho kỹ sư trực on-call. Ví dụ: Chỉ phát cảnh báo khi: `ALARM(HighCPU) AND ALARM(HighNetworkIn) AND NOT ALARM(DatabaseMaintenance)`.
2. **Sự khác biệt giữa CloudWatch Logs Standard và CloudWatch Logs Infrequent Access (IA) là gì?**
   - *Trả lời*: Logs Infrequent Access có chi phí nạp log rẻ hơn $50\%$ so với Standard, phù hợp cho việc lưu trữ các bản ghi log chỉ dùng để kiểm toán hoặc phân tích hồi cứu thỉnh thoảng, nhưng không hỗ trợ các tính năng cao cấp như Live Tail, Metric Filters hay gửi cảnh báo Alarm thời gian thực.
3. **Làm thế nào để tạo một Billing Alarm cảnh báo khi hóa đơn AWS vượt quá 100 USD?**
   - *Trả lời*: Bật tính năng "Receive Billing Alerts" trong phần Billing Preferences. Sau đó, vào CloudWatch tại Region **`us-east-1`** (Region duy nhất lưu trữ số liệu thanh toán toàn cầu), tạo một Alarm trên Metric `EstimatedCharges` với Currency: `USD`, ngưỡng `Statistic: Maximum`, `Threshold: 100`, và gửi thông báo tới một SNS Topic.
