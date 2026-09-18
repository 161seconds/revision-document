# 03. IAM Roles & STS AssumeRole

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [02. IAM Policies & Evaluation Logic](file:///d:/my-project/revision-document/aws/01-iam-and-security/02-iam-policies-and-evaluation-logic.md).
- **Module hiện tại**: [Module 01: IAM & Cloud Security](file:///d:/my-project/revision-document/aws/01-iam-and-security/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [04. KMS Envelope Encryption & Secrets Manager](file:///d:/my-project/revision-document/aws/01-iam-and-security/04-kms-envelope-encryption-and-secrets-manager.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Bản Chất Của IAM Role
- IAM Role **không có thông tin xác thực tĩnh dài hạn** (Không có mật khẩu, không có Access Keys cố định).
- Thay vào đó, Role được một dịch vụ hoặc người dùng "đảm nhận" tạm thời thông qua **AWS Security Token Service (STS)**.
- Khi gọi lệnh `sts:AssumeRole`, STS trả về một bộ thông tin xác thực tạm thời:
  1. `AccessKeyId` (bắt đầu bằng tiền tố `ASIA...` thay vì `AKIA...` của IAM User).
  2. `SecretAccessKey`.
  3. `SessionToken`.
  4. `Expiration` (Thời hạn sống từ 15 phút đến 12 giờ).
- Hết thời hạn, token tự động vô hiệu hóa mà không cần can thiệp thủ công.

### 2.2 Hai Loại Policy Trong Một IAM Role
Mỗi Role luôn luôn bao gồm 2 phần tách biệt:
1. **Trust Policy (Chính sách tin cậy - "Ai được phép khoác áo Role này?")**:
   - Được gắn vào `AssumeRolePolicyDocument`. Khai báo `Principal` (vd: Dịch vụ `ec2.amazonaws.com`, `lambda.amazonaws.com`, hoặc Account ID của đối tác).
2. **Permissions Policy (Chính sách quyền hạn - "Sau khi khoác áo, được làm những gì?")**:
   - Khai báo các Action và Resource được phép thực thi (vd: Đọc S3, ghi DynamoDB).

### 2.3 EC2 Instance Profile & IMDSv2
- Khi bạn gán IAM Role cho máy ảo EC2, AWS tạo một đối tượng trung gian gọi là **Instance Profile**.
- Ứng dụng chạy trên EC2 không cần cấu hình bất kỳ API Key nào. SDK của AWS tự động truy vấn địa chỉ Link-Local IP:
  `http://169.254.169.254/latest/meta-data/iam/security-credentials/<role-name>`
- **IMDSv2 (Instance Metadata Service Version 2)**:
  - Yêu cầu tạo phiên làm việc với token qua HTTP `PUT` trước khi `GET`.
  - Giúp phòng thủ triệt để trước các cuộc tấn công **SSRF (Server-Side Request Forgery)** và WAF bypass.

### 2.4 Truy Cập Giữa Các Tài Khoản (Cross-Account) & Lỗi Confused Deputy
- Khi cho phép một bên thứ ba (Công ty đối tác SaaS) truy cập tài khoản AWS của bạn qua `AssumeRole`:
- Kẻ xấu có thể lợi dụng đối tác SaaS đó để tấn công tài khoản của bạn (Confused Deputy Problem).
- **Giải pháp bắt buộc**: Bắt buộc đối tác truyền thêm một chuỗi định danh bí mật duy nhất gọi là **`ExternalId`** trong khối `Condition` của Trust Policy.

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Cấu Hình Cứng Access Key Trong Ứng Dụng Chạy Trên EC2 / ECS**
> Lưu Access Key tĩnh trong code chạy trên máy ảo là anti-pattern nghiêm trọng nhất trong Cloud. Nếu máy ảo bị chiếm quyền hoặc bị dump bộ nhớ, hacker sẽ lấy được key vĩnh viễn.
> - **Giải pháp**: Luôn dùng **IAM Role** cho EC2 (Instance Profile), ECS (Task Role), và Lambda (Execution Role).

> [!WARNING]
> **Bẫy 2: Nhầm Lẫn Giữa ECS Task Execution Role và ECS Task Role**
> - **Task Execution Role**: Dành cho **ECS Container Agent** chạy hạ tầng (Kéo image từ private ECR, gửi log về CloudWatch).
> - **Task Role**: Dành cho **chính mã nguồn ứng dụng** của bạn bên trong container (gọi S3, DynamoDB, SQS).

---

## 4. Manifest Mẫu Chuẩn Mực: Trust Policy Cho Cross-Account với ExternalId

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "enterprise-client-unique-secret-token-9988"
        }
      }
    }
  ]
}
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Làm thế nào để nhận biết một Access Key thuộc về IAM User tĩnh hay phiên tạm thời của IAM Role?**
   - *Trả lời*: Nhìn vào 4 ký tự tiền tố của `AccessKeyId`:
     - `AKIA...`: Là Long-lived credential của **IAM User** tĩnh.
     - `ASIA...`: Là Temporary credential được cấp phát bởi **AWS STS** thông qua IAM Role hoặc Federation.
2. **Confused Deputy Problem là gì và AWS giải quyết bằng cơ chế nào?**
   - *Trả lời*: Là cuộc tấn công bảo mật trong đó một bên thứ ba có đặc quyền (Deputy) bị kẻ tấn công lừa gạt để thực hiện các hành động trên tài khoản của nạn nhân mà kẻ tấn công không có quyền. AWS giải quyết bằng cách yêu cầu cung cấp **`ExternalId`** trong Trust Policy, đảm bảo bên thứ ba chỉ gọi AssumeRole khi có sự ủy quyền chính xác từ chính khách hàng đó.
3. **IMDSv2 có điểm gì vượt trội so với IMDSv1 trong việc bảo vệ EC2?**
   - *Trả lời*: IMDSv1 cho phép gửi thẳng HTTP GET request để lấy token, khiến các ứng dụng dính lỗ hổng SSRF dễ dàng bị hacker trích xuất IAM Role credentials. IMDSv2 bắt buộc phải tạo session token qua HTTP PUT kèm header `X-aws-ec2-metadata-token-ttl-seconds`, ngăn chặn hầu hết các payload tấn công SSRF thông thường.
