# 01. IAM Entities & Least Privilege Principle

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Linux User Permissions & POSIX Model](file:///d:/my-project/revision-document/devops/01-docker-and-containerization/01-container-internals-and-linux-kernel.md).
- **Module hiện tại**: [Module 01: IAM & Cloud Security](file:///d:/my-project/revision-document/aws/01-iam-and-security/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [02. IAM Policies & Evaluation Logic](file:///d:/my-project/revision-document/aws/01-iam-and-security/02-iam-policies-and-evaluation-logic.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Tài Khoản Root (AWS Root Account)
- Được tạo ra khi bạn đăng ký tài khoản AWS lần đầu bằng địa chỉ Email.
- Sở hữu quyền lực tối cao tuyệt đối (Superuser), không thể bị hạn chế bởi bất kỳ IAM Policy thông thường nào (chỉ bị giới hạn bởi Service Control Policies - SCP trong AWS Organizations).
- **Quy tắc an ninh bắt buộc**:
  1. Khóa tài khoản Root ngay sau khi thiết lập ban đầu.
  2. Bật xác thực đa yếu tố bằng thiết bị phần cứng vật lý (Hardware MFA: YubiKey).
  3. **Tuyệt đối không tạo Access Keys cho Root Account** (nếu có, phải xóa ngay lập tức).
  4. Không bao giờ sử dụng Root Account cho các tác vụ quản trị hàng ngày.

### 2.2 Các Thực Thể Định Danh (IAM Entities)
1. **IAM Users**:
   - Đại diện cho một con người hoặc một hệ thống tích hợp bên ngoài cần tương tác với AWS.
   - Cơ chế xác thực:
     - Đăng nhập giao diện web (AWS Console): Tên đăng nhập + Mật khẩu + MFA.
     - Lệnh dòng lệnh hoặc API (CLI / SDK): **Access Key ID** (công khai, 20 ký tự) + **Secret Access Key** (bí mật, 40 ký tự).
2. **IAM User Groups**:
   - Tập hợp các IAM Users (vd: `Admins`, `Developers`, `Auditors`).
   - Giúp quản lý quyền hạn tập trung: Khi một kỹ sư gia nhập nhóm, họ được thừa hưởng toàn bộ Policy của nhóm. Khi rời đi, chỉ cần gỡ khỏi nhóm mà không cần sửa Policy cá nhân.
   - **Đặc tính kỹ thuật**: Group **không phải là Identity**. Bạn không thể khai báo Group vào trường `Principal` trong các Resource Policies (như S3 Bucket Policy).

### 2.3 Nguyên Lý Đặc Quyền Tối Thiểu (Principle of Least Privilege)
- Chỉ cấp phát chính xác những quyền hạn tối thiểu cần thiết để người dùng hoặc dịch vụ hoàn thành công việc được giao, trong một khoảng thời gian giới hạn.
- **Anti-pattern**: Gán quyền `AdministratorAccess` hoặc policy chứa wildcard `Action: "*"` cho lập trình viên để "cho tiện làm việc".

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Để Lộ Long-lived Access Keys Trên GitHub (Public Leak)**
> Lập trình viên vô tình commit file `.env` hoặc code chứa `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` lên public Git repo. Các bot quét của tin tặc quét GitHub trong vài giây, tự động chiếm quyền tài khoản, bật hàng nghìn máy ảo EC2 cày tiền ảo (Crypto mining), gây thiệt hại hàng chục nghìn USD chỉ sau vài giờ!
> - **Giải pháp sống còn**: Tuyệt đối không lưu Access Keys trong code. Đối với máy chủ EC2 hoặc Lambda, bắt buộc dùng **IAM Roles**. Đối với máy cá nhân, dùng công cụ mã hóa như `aws-vault` hoặc AWS IAM Identity Center (Single Sign-On).

> [!WARNING]
> **Bẫy 2: Không Bật MFA Cho Toàn Bộ IAM Users**
> Mật khẩu người dùng có thể bị lộ qua các cuộc tấn công Phishing hoặc dùng chung mật khẩu. Không có MFA, tài khoản AWS của bạn không khác gì để ngỏ cửa cho kẻ tấn công.

---

## 4. Kịch Bản AWS CLI Thiết Lập Bảo Mật Chuẩn

```bash
# 1. Kiểm tra tài khoản hiện tại (Xác minh không phải root)
aws sts get-caller-identity

# 2. Tạo IAM User chuyên dụng cho lập trình viên
aws iam create-user --user-name dev-alice

# 3. Tạo User Group 'backend-engineers'
aws iam create-group --group-name backend-engineers

# 4. Thêm user vào group
aws iam add-user-to-group --user-name dev-alice --group-name backend-engineers

# 5. Khởi tạo chính sách mật khẩu mạnh cho toàn bộ tài khoản
aws iam update-account-password-policy \
  --minimum-password-length 14 \
  --require-symbols \
  --require-numbers \
  --require-uppercase-characters \
  --require-lowercase-characters \
  --allow-users-to-change-password \
  --max-password-age 90
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao AWS khuyến cáo không bao giờ dùng tài khoản Root cho công việc hàng ngày?**
   - *Trả lời*: Tài khoản Root có toàn quyền truy cập không thể bị thu hồi (kể cả xóa tài khoản, sửa đổi thông tin thanh toán ngân hàng, đóng dịch vụ). Nếu tài khoản Root bị xâm phạm, toàn bộ doanh nghiệp sẽ mất quyền kiểm soát hạ tầng. Cần tạo các tài khoản IAM User với quyền hạn hạn chế và bật MFA bắt buộc.
2. **Access Key ID và Secret Access Key tương đương với khái niệm gì trong hệ thống xác thực web thông thường?**
   - *Trả lời*: `Access Key ID` tương đương với **Username**, còn `Secret Access Key` tương đương với **Password** dùng để ký số (Cryptographic Signature HMAC-SHA256) cho mỗi HTTP request gửi tới AWS API Endpoint.
3. **IAM User Group có thể chứa một IAM User Group khác (Nested Groups) được không?**
   - *Trả lời*: **Không**. AWS IAM không hỗ trợ nhóm lồng nhóm (Nested Groups). Group chỉ có thể chứa trực tiếp các IAM Users.
