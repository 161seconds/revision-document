# 03. CloudTrail, AWS Config & Cloud Governance

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [02. CloudWatch Metrics, Alarms & Logs](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/02-cloudwatch-metrics-alarms-and-logs.md).
- **Module hiện tại**: [Module 05: Messaging, Observability & IaC](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [04. IaC: AWS CDK, CloudFormation & Terraform](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/04-infrastructure-as-code-cdk-and-terraform.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Tam Giác Giám Sát Cốt Lõi Trên AWS (So Sánh Ba Trụ Cột)
Đây là câu hỏi phỏng vấn bắt buộc để phân biệt rạch ròi 3 dịch vụ:

```
                  +-----------------------------------+
                  |     HỆ THỐNG ĐÁM MÂY DOANH NGHIỆP |
                  +-----------------+-----------------+
                                    |
         +--------------------------+--------------------------+
         |                          |                          |
+--------v--------+        +--------v--------+        +--------v--------+
| AMAZON          |        | AWS             |        | AWS             |
| CLOUDWATCH      |        | CLOUDTRAIL      |        | CONFIG          |
| "Hệ thống đang  |        | "Ai đã làm gì,  |        | "Hạ tầng có tuân|
|  chạy ra sao?"  |        |  lúc nào, ở đâu?"|        |  thủ luật không?"|
+-----------------+        +-----------------+        +-----------------+
| Đo CPU, RAM,    |        | Ghi nhật ký     |        | So sánh trạng   |
| Latency, Logs   |        | mọi lệnh gọi    |        | thái cấu hình   |
| hiệu năng       |        | AWS API Calls   |        | với Compliance  |
+-----------------+        +-----------------+        +-----------------+
```

---

## 3. AWS CloudTrail - Nhật Ký Kiểm Toán (Audit Logging)

- **Nguyên lý hoạt động**: Bất kỳ hành động nào trong AWS (Click chuột trên Console, chạy lệnh AWS CLI, thực thi code SDK, dịch vụ AWS tự động gọi nhau) đều là một **lệnh gọi API (REST API Call)**.
- CloudTrail ghi lại chi tiết: Danh tính người gọi (`userIdentity`), Thời gian (`eventTime`), IP nguồn (`sourceIPAddress`), Tên hàm API (`eventName`), và Mã phản hồi (`responseElements`).

### 3.1 Ba Loại Sự Kiện Trong CloudTrail
1. **Management Events (Sự kiện quản trị)**:
   - Các thao tác trên tầng Control Plane: Tạo EC2, xóa Security Group, cấu hình IAM policy.
   - Mặc định lưu lịch sử 90 ngày miễn phí trong Event History.
2. **Data Events (Sự kiện dữ liệu)**:
   - Các thao tác trên tầng Data Plane dung lượng cực lớn: S3 `GetObject`/`PutObject`, Lambda `Invoke`. Mặc định tắt để tránh tốn phí.
3. **CloudTrail Insights**:
   - Sử dụng trí tuệ nhân tạo (Machine Learning) để phát hiện các hành vi bất thường (vd: Một IAM user đột ngột xóa hàng loạt tài nguyên hoặc có số lần gọi API bị lỗi `Access Denied` tăng vọt bất thường).

### 3.2 Tính Năng Log File Integrity Validation
- Sử dụng thuật toán băm mật mã học **SHA-256** và chữ ký số RSA.
- Cung cấp bằng chứng pháp lý trước tòa án và các tổ chức kiểm toán quốc tế (PCI-DSS, SOC 2, ISO 27001) chứng minh rằng **các file log lưu trữ trên S3 chưa từng bị chỉnh sửa, chèn thêm hay xóa bớt**.

---

## 4. AWS Config - Quản Lý Tuân Thủ & Tự Động Khắc Phục (Auto-Remediation)

- Liên tục ghi nhận lịch sử thay đổi cấu hình của tài nguyên theo dòng thời gian (Configuration History Timeline).
- **Đánh giá tuân thủ theo các Quy Tắc (Config Rules)**:
  - *Ví dụ về Managed Rules*:
    - `s3-bucket-public-read-prohibited`: Kiểm tra xem có Bucket nào bị mở public không.
    - `encrypted-volumes`: Kiểm tra xem có ổ đĩa EBS nào quên mã hóa không.
    - `iam-root-mfa-enabled`: Kiểm tra tài khoản Root đã bật MFA chưa.
- **Tính Năng Auto-Remediation (Tự Động Sửa Lỗi Tức Thì)**:
  - Khi AWS Config phát hiện một tài nguyên ở trạng thái `NON_COMPLIANT` (Không tuân thủ), nó tự động kích hoạt một kịch bản **AWS Systems Manager (SSM) Automation Runbook**.
  - *Kịch bản*: Ai đó vừa cố tình gỡ Block Public Access của một S3 Bucket $\rightarrow$ AWS Config phát hiện $\rightarrow$ SSM Runbook chạy ngay lập tức và **tự động khóa chặt bucket lại về trạng thái Private chỉ trong vài giây**!

---

## 5. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Chỉ Bật CloudTrail Trên Một Region Đơn Lẻ (Single-Region Trail)**
> Hacker sau khi chiếm được Access Key sẽ không phá hoại tại Region bạn đang dùng (`ap-southeast-1`), mà chúng sẽ bí mật nhảy sang Region xa xôi (vd: `eu-central-1` Frankfurt) để bật máy ảo đào coin!
> - Nếu CloudTrail chỉ ghi log ở Singapore, bạn sẽ **hoàn toàn mù thông tin** và không biết vì sao hóa đơn hàng chục nghìn USD phát sinh!
> - **Quy tắc vàng**: Luôn bật **Multi-Region Trail** áp dụng cho toàn bộ các Regions trên thế giới.

> [!WARNING]
> **Bẫy 2: Chi Phí Khủng Khiếp Khi Bật Data Events Cho Toàn Bộ S3 Buckets**
> Nếu một bucket chứa ảnh người dùng có 1 tỷ requests mỗi tháng, việc bật Data Events trên bucket đó có thể khiến chi phí CloudTrail tăng vọt hàng ngàn USD!
> - **Giải pháp**: Chỉ bật Data Events cho các Bucket chứa tài liệu tuyệt mật (Sensitive / Compliance buckets).

---

## 6. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Một nhân viên bị nghi ngờ đã vô tình xóa một cơ sở dữ liệu RDS Production vào chiều hôm qua. Bạn dùng dịch vụ nào để tìm ra thủ phạm chính xác trong 1 phút?**
   - *Trả lời*: Vào **AWS CloudTrail Event History**. Lọc theo trường `Event name: DeleteDBInstance`. CloudTrail sẽ hiển thị chính xác tên IAM User, địa chỉ IP nguồn, thời điểm chính xác và thông số của lệnh xóa đó.
2. **Sự khác biệt cốt lõi giữa AWS Config và CloudWatch là gì?**
   - *Trả lời*: CloudWatch tập trung vào **hiệu năng và số liệu vận hành thời gian thực** (máy ảo CPU bao nhiêu %, RAM còn bao nhiêu, có lỗi 500 không). AWS Config tập trung vào **trạng thái cấu hình và tính tuân thủ bảo mật** (máy ảo đang gắn security group nào, ổ đĩa có được mã hóa KMS không, cấu hình này có vi phạm chính sách của doanh nghiệp không).
3. **AWS Config tự động phát hiện Configuration Drift như thế nào?**
   - *Trả lời*: Mỗi khi một tài nguyên AWS được tạo mới, chỉnh sửa thuộc tính hoặc xóa bỏ, một sự kiện thay đổi cấu hình được phát ra. AWS Config chụp lại ảnh chụp cấu hình (Configuration Item - CI) mới nhất, so sánh với các Config Rules đã định nghĩa và cập nhật trạng thái của tài nguyên là `COMPLIANT` hoặc `NON_COMPLIANT`.
