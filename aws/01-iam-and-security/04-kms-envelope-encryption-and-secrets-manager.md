# 04. AWS KMS Envelope Encryption & Secrets Manager

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [03. IAM Roles & STS AssumeRole](file:///d:/my-project/revision-document/aws/01-iam-and-security/03-iam-roles-and-sts-assumerole.md).
- **Module hiện tại**: [Module 01: IAM & Cloud Security](file:///d:/my-project/revision-document/aws/01-iam-and-security/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [Module 02: Networking & Virtual Private Cloud (VPC)](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/README.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 AWS Key Management Service (KMS) & Giới Hạn 4KB
- AWS KMS quản lý các khóa mã hóa bảo vệ phần cứng (Hardware Security Modules - HSM đạt chuẩn FIPS 140-2 Level 3).
- **Giới hạn quan trọng**: API `kms:Encrypt` **chỉ cho phép mã hóa trực tiếp dữ liệu có kích thước tối đa $4\text{ KB}$**.
- Để mã hóa các file lớn hàng gigabyte trên S3, EBS, hoặc Database, AWS bắt buộc sử dụng cơ chế **Mã Hóa Phong Bì (Envelope Encryption)**.

### 2.2 Quy Trình Mã Hóa Phong Bì (Envelope Encryption Workflow)

```
[ BƯỚC 1: MÃ HÓA ]
Ứng dụng gọi KMS API: kms:GenerateDataKey(KMS_Key_Id)
     ↓
KMS trả về 2 chìa khóa:
  1. Plaintext Data Key (DEK thô - 256 bit)
  2. Ciphertext Data Key (DEK đã bị KMS mã hóa)
     ↓
Ứng dụng dùng Plaintext DEK để mã hóa file 10GB cục bộ trên RAM
     ↓
Ứng dụng XÓA SẠCH Plaintext DEK khỏi bộ nhớ RAM!
     ↓
Lưu file đã mã hóa cùng với Ciphertext Data Key (Đính kèm như phong bì thư)

-------------------------------------------------------------------------
[ BƯỚC 2: GIẢI MÃ ]
Ứng dụng gửi Ciphertext Data Key lên KMS API: kms:Decrypt
     ↓
KMS giải mã và trả về Plaintext Data Key
     ↓
Ứng dụng giải mã file 10GB và xóa lại Plaintext DEK khỏi RAM
```

### 2.3 So Sánh AWS Secrets Manager vs SSM Parameter Store
| Tiêu chí | AWS Secrets Manager | AWS SSM Parameter Store |
| :--- | :--- | :--- |
| **Mục đích chính** | Quản lý mật khẩu, khóa bí mật có vòng đời | Quản lý tham số cấu hình hệ thống & Secrets nhẹ |
| **Chi phí** | $\$0.40\text{/secret/tháng}$ + $\$0.05$ mỗi 10,000 API calls | **Miễn phí** (Standard Tier) |
| **Tự động đổi mật khẩu (Rotation)** | **Tích hợp sẵn qua AWS Lambda** (tự động đổi mật khẩu RDS, Redshift không downtime) | Không hỗ trợ tự động (phải tự viết custom automation) |
| **Loại dữ liệu** | Secret JSON / Plain text | `String`, `StringList`, `SecureString` (qua KMS) |

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Khóa KMS Bị "Mồ Côi" (KMS Key Lockout)**
> Một khóa KMS bắt buộc phải có **Key Policy**. Nếu bạn tạo một Customer Managed Key mà vô tình xóa đi quyền của Root Account (`arn:aws:iam::<account-id>:root`) trong Key Policy, **không một ai trong tài khoản (kể cả Administrator) có thể truy cập, sửa đổi hay xóa khóa đó nữa**! Luôn đảm bảo Root Account được phép quản trị Key Policy.

> [!WARNING]
> **Bẫy 2: Chi Phí API Gọi Secrets Manager Trong Vòng Lặp Vô Tận**
> Mỗi lần ứng dụng gọi API `GetSecretValue` đều bị tính tiền. Nếu ứng dụng của bạn không cache mật khẩu mà gọi Secrets Manager trong mỗi HTTP request người dùng (vd: 100 requests/giây), bạn sẽ phải trả hàng nghìn USD hóa đơn API!
> - **Quy tắc**: Luôn sử dụng thư viện client-side caching (vd: AWS Secrets Manager Caching Library) để cache mật khẩu trong RAM từ 5-15 phút.

---

## 4. Code Mẫu Chuẩn Mực: Policy Cho Phép Giải Mã KMS Có Điều Kiện

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowScopedKmsDecrypt",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:DescribeKey"
      ],
      "Resource": "arn:aws:kms:ap-southeast-1:123456789012:key/7a9b1c3d-e4f5-4a6b-8c9d-0e1f2a3b4c5d",
      "Condition": {
        "StringEquals": {
          "kms:ViaService": "s3.ap-southeast-1.amazonaws.com"
        }
      }
    }
  ]
}
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao Envelope Encryption lại tối ưu hiệu năng vượt trội so với việc gửi toàn bộ file qua KMS API?**
   - *Trả lời*: Nếu gửi file hàng gigabyte qua mạng lên KMS để mã hóa, hệ thống sẽ gặp tắc nghẽn băng thông mạng nghiêm trọng và bị giới hạn bởi giới hạn payload 4KB của KMS. Envelope Encryption chỉ gửi duy nhất một chiếc chìa khóa Data Key siêu nhỏ (vài chục bytes) qua KMS, trong khi dữ liệu lớn được mã hóa trực tiếp trên CPU của máy chủ cục bộ với tốc độ phần cứng cực đại.
2. **KMS Key Policy khác gì so với IAM Policy? Có thể bỏ qua Key Policy nếu đã có IAM Policy không?**
   - *Trả lời*: **Tuyệt đối không thể bỏ qua**. Key Policy là chốt chặn bảo mật chính của KMS Key. Mặc định, một IAM Policy cho phép `kms:Decrypt` sẽ hoàn toàn vô hiệu nếu chính bản thân Key Policy của chiếc chìa khóa đó không ủy quyền cho tài khoản (`Principal: { "AWS": "arn:aws:iam::account:root" }`).
3. **Khi nào nên chọn SSM Parameter Store thay vì Secrets Manager?**
   - *Trả lời*: Nên chọn Parameter Store khi lưu trữ các biến cấu hình ứng dụng không nhạy cảm (URLs, flags), hoặc các secrets đơn giản không đòi hỏi tính năng tự động xoay vòng mật khẩu (Auto-rotation), nhằm tiết kiệm tối đa chi phí vì Standard tier của SSM Parameter Store là hoàn toàn miễn phí.
