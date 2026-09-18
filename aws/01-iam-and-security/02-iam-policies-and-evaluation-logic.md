# 02. IAM Policies & Evaluation Logic

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. IAM Entities & Least Privilege](file:///d:/my-project/revision-document/aws/01-iam-and-security/01-iam-entities-and-least-privilege.md).
- **Module hiện tại**: [Module 01: IAM & Cloud Security](file:///d:/my-project/revision-document/aws/01-iam-and-security/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [03. IAM Roles & STS AssumeRole](file:///d:/my-project/revision-document/aws/01-iam-and-security/03-iam-roles-and-sts-assumerole.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Cấu Trúc Giải Phẫu JSON IAM Policy
Một tài liệu IAM Policy chuẩn mực bao gồm:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowSpecificS3BucketRead",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-company-reports",
        "arn:aws:s3:::my-company-reports/*"
      ],
      "Condition": {
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"
        },
        "IpAddress": {
          "aws:SourceIp": "198.51.100.0/24"
        }
      }
    }
  ]
}
```

- **`Version`**: Luôn luôn là `"2012-10-17"` (phiên bản ngữ pháp của IAM policy engine). **Không bao giờ điền ngày hôm nay!**
- **`Effect`**: `Allow` hoặc `Deny`.
- **`Action`**: Danh sách các API calls được phép hoặc bị cấm.
- **`Resource`**: Định danh tài nguyên ARN (Amazon Resource Name) chịu tác động.
- **`Condition`**: Ràng buộc bổ sung (yêu cầu MFA, kiểm tra IP văn phòng, thẻ tag).

### 2.2 Identity-based Policy vs Resource-based Policy
- **Identity-based Policies (Gắn vào Người/Role)**:
  - Gắn vào IAM User, Group hoặc Role.
  - Xác định "Thực thể này được phép làm gì?".
- **Resource-based Policies (Gắn vào Tài nguyên)**:
  - Gắn trực tiếp vào bản thân dịch vụ: S3 Bucket Policy, SQS Queue Policy, KMS Key Policy.
  - **Bắt buộc phải khai báo trường `Principal`** để chỉ định "Ai (tài khoản nào, role nào) được phép truy cập vào tài nguyên này?".

### 2.3 Giải Thuật Đánh Giá Quyền Hạn (Policy Evaluation Flowchart)

```
[ Bắt đầu: Mặc định luôn là Từ chối (Implicit Deny) ]
                         ↓
[ Có bất kỳ điều kiện EXPLICIT DENY nào khớp không? ]
       ├── CÓ ──> [ QUYẾT ĐỊNH: TỪ CHỐI (DENY) ] (Dừng đánh giá ngay lập tức)
       └── KHÔNG
             ↓
[ Có bất kỳ điều kiện EXPLICIT ALLOW nào khớp không? ]
       ├── CÓ ──> [ QUYẾT ĐỊNH: CHO PHÉP (ALLOW) ]
       └── KHÔNG ─> [ QUYẾT ĐỊNH: TỪ CHỐI (IMPLICIT DENY) ]
```

> [!IMPORTANT]
> **Quy Tắc Tối Cao**: Một lệnh `Deny` rõ ràng (**Explicit Deny**) luôn luôn đè bẹp bất kỳ lệnh `Allow` nào khác, bất kể lệnh `Allow` đó đến từ AdministratorAccess hay Resource Policy!

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Quên Phân Biệt Bucket ARN và Object ARN Trong S3**
> - `arn:aws:s3:::my-bucket`: Trỏ tới **chính chiếc Bucket** (Cần thiết cho các lệnh cấp độ bucket như `s3:ListBucket`).
> - `arn:aws:s3:::my-bucket/*`: Trỏ tới **tất cả các Object bên trong** (Cần thiết cho `s3:GetObject`, `s3:PutObject`).
> - Nếu bạn chỉ khai báo `arn:aws:s3:::my-bucket/*`, lệnh `aws s3 ls s3://my-bucket` sẽ bị lỗi `Access Denied` vì `s3:ListBucket` đòi hỏi ARN của chính bucket!

> [!WARNING]
> **Bẫy 2: Dùng Nhầm Dấu Phẩy Giữa Các Điều Kiện Trong `Condition`**
> - Nếu nhiều key nằm trong cùng 1 khối condition: Quan hệ logic là **AND** (Mọi điều kiện đều phải thỏa mãn).
> - Nếu một key chứa mảng nhiều giá trị: Quan hệ logic là **OR** (Chỉ cần khớp 1 trong các giá trị).

---

## 4. Manifest Mẫu Chuẩn Mực: Policy Bắt Buộc MFA & Giới Hạn IP

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyAllWithoutMFA",
      "Effect": "Deny",
      "NotAction": [
        "iam:CreateVirtualMFADevice",
        "iam:EnableMFADevice",
        "iam:GetUser",
        "iam:ListMFADevices",
        "iam:ResyncMFADevice"
      ],
      "Resource": "*",
      "Condition": {
        "BoolIfExists": {
          "aws:MultiFactorAuthPresent": "false"
        }
      }
    }
  ]
}
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Nếu một User có Policy Allow truy cập DynamoDB nhưng Sếp gắn thêm một Policy Deny trên bảng đó, User có đọc được dữ liệu không?**
   - *Trả lời*: **Không bao giờ**. Theo giải thuật đánh giá của IAM, Explicit Deny có mức độ ưu tiên cao nhất tuyệt đối. Bất kể có bao nhiêu Policy Allow, chỉ cần tồn tại 1 điều kiện Deny thỏa mãn là request bị chặn đứng ngay lập tức.
2. **Tại sao `Version` trong IAM policy lại là `"2012-10-17"`? Điền `"2026-09-19"` có được không?**
   - *Trả lời*: Tuyệt đối không. `"2012-10-17"` là định danh phiên bản của ngôn ngữ Policy do AWS phát hành vào ngày 17/10/2012 (hỗ trợ đầy đủ các tính năng nâng cao như Policy Variables). Điền ngày khác sẽ bị báo lỗi cú pháp `Invalid Version`.
3. **Sự khác biệt giữa Managed Policy và Inline Policy là gì?**
   - *Trả lời*: **Managed Policy** là tài liệu độc lập có thể tái sử dụng và gắn vào nhiều Users, Groups, Roles khác nhau, hỗ trợ quản lý phiên bản (Versioning). **Inline Policy** được nhúng cứng trực tiếp vào 1 thực thể duy nhất, bị xóa theo khi thực thể đó bị xóa, khó quản trị tập trung.
