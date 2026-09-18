# 01. Amazon S3 Architecture & Lifecycle Management

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 01: IAM & Cloud Security](file:///d:/my-project/revision-document/aws/01-iam-and-security/README.md).
- **Module hiện tại**: [Module 04: Storage & Databases](file:///d:/my-project/revision-document/aws/04-storage-and-databases/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [02. EBS Volumes, Snapshots & EFS](file:///d:/my-project/revision-document/aws/04-storage-and-databases/02-ebs-volumes-snapshots-and-efs.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Bản Chất Của Object Storage (Khác Biệt Với File/Block Storage)
- **Amazon S3** là dịch vụ lưu trữ đối tượng (Object Storage):
  - Không có cấu trúc thư mục phân cấp vật lý thật sự. Dấu gạch chéo `/` trong `folder/sub/file.pdf` chỉ là một phần của chuỗi định danh **Key**.
  - Mỗi đối tượng (Object) gồm: **Key** (tên file), **Value** (dữ liệu nhị phân dung lượng từ $0\text{ bytes}$ đến $5\text{ TB}$), **Metadata** (thông tin mô tả), và **Version ID**.
- **Độ Bền Dữ Liệu $99.999999999\%$ (11 con số 9 - Durability)**:
  - Dữ liệu được tự động nhân bản qua **tối thiểu 3 Availability Zones** độc lập trong Region.
  - Về mặt lý thuyết, nếu bạn lưu 10,000,000 file trên S3, trung bình 10,000 năm mới có nguy cơ mất 1 file duy nhất!

### 2.2 Sáu Phân Hạng Lưu Trữ (S3 Storage Classes)
| Storage Class | Độ Bền | Độ Sẵn Sàng (SLA) | Chi Phí Lưu Trữ | Thời Gian Lấy Dữ Liệu | Trường Hợp Sử Dụng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S3 Standard** | 11 con số 9 | $99.99\%$ | $\$0.023\text{/GB}$ | Ngay tức thì (mili-giây) | Dữ liệu truy cập thường xuyên (Ảnh web, video streaming) |
| **S3 Intelligent-Tiering**| 11 con số 9 | $99.9\%$ | Tự động điều chỉnh | Ngay tức thì (mili-giây) | Mẫu truy cập dữ liệu không đoán trước được |
| **S3 Standard-IA** | 11 con số 9 | $99.9\%$ | Rẻ hơn $40\%$ ($\$0.0125\text{/GB}$) | Ngay tức thì (Có tính phí đọc) | Backup hàng tuần, file log sau 30 ngày |
| **S3 One Zone-IA** | 11 con số 9 (1 AZ) | $99.5\%$ | Rẻ hơn $50\%$ | Ngay tức thì (Mất nếu AZ sập) | Bản sao dự phòng có thể tạo lại được |
| **S3 Glacier Flexible** | 11 con số 9 | $99.9\%$ | Rất rẻ ($\$0.0036\text{/GB}$) | $1-5\text{ phút}$ (Expedited) hoặc $3-5\text{ giờ}$ | Lưu trữ chứng từ kế toán, audit log theo luật |
| **S3 Glacier Deep Archive**| 11 con số 9 | $99.9\%$ | **Siêu rẻ ($\$0.00099\text{/GB}$)** | **$12-48\text{ giờ}$** | Lưu trữ hồ sơ y tế, tài liệu lưu trữ $7-10\text{ năm}$ |

### 2.3 Quy Tắc Vòng Đời Tự Động (S3 Lifecycle Rules)
Cho phép tự động hóa việc tiết kiệm chi phí lưu trữ theo thời gian:
- **Transitions (Chuyển tầng)**: Chuyển object từ `Standard` sang `Standard-IA` sau 30 ngày $\rightarrow$ chuyển tiếp sang `Glacier` sau 90 ngày.
- **Expiration (Xóa bỏ)**: Tự động xóa vĩnh viễn các file log sau 365 ngày, hoặc xóa các phiên bản cũ không còn dùng (Noncurrent Version Expiration).

---

## 3. Bảo Mật S3 & Presigned URLs

### 3.1 Chốt Chặn Bảo Mật: S3 Block Public Access
- Tính năng tập hợp 4 cờ chặn ở cấp độ Tài khoản và cấp độ Bucket, ngăn chặn tuyệt đối việc người dùng vô tình cấp quyền công khai (Public Read) cho cả thế giới.
- Trừ khi bạn làm website tĩnh công khai (Static Website Hosting), **luôn bật 100% S3 Block Public Access**.

### 3.2 Presigned URLs: Tải Lên / Xuống An Toàn Tuyệt Đối
- *Bài toán*: Người dùng cần upload video 2GB lên ứng dụng của bạn.
  - **Cách sai lầm**: Client upload video lên máy chủ Backend $\rightarrow$ Backend upload tiếp lên S3 (Làm nghẽn CPU và băng thông server backend).
  - **Cách chuẩn mực (Presigned URL)**:
    1. Client gửi request nhẹ tới Backend xin upload.
    2. Backend dùng IAM Role của mình tạo một **Presigned URL** với phương thức `PUT` và thời hạn sống $15\text{ phút}$.
    3. Client nhận URL và **upload trực tiếp file 2GB từ trình duyệt thẳng lên S3**!

---

## 4. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Tốn Thêm Tiền Khi Chuyển File Quá Nhỏ Sang S3 Glacier**
> S3 Glacier tính toán chi phí tối thiểu cho mỗi object là $128\text{ KB}$ và thời gian lưu tối thiểu 90 ngày. Nếu bạn chuyển hàng triệu file icon nhỏ $2\text{ KB}$ vào Glacier, bạn sẽ phải trả tiền cho $128\text{ KB}$ cho mỗi file, khiến hóa đơn Glacier đắt hơn cả lưu trên S3 Standard!
> - **Giải pháp**: Nén các file nhỏ thành 1 file zip/tar lớn trước khi đưa vào kho lưu trữ Glacier.

> [!WARNING]
> **Bẫy 2: Phí Lấy Dữ Liệu Bất Ngờ (Data Retrieval Fee) Trong Standard-IA**
> Standard-IA có chi phí lưu trữ rẻ hơn Standard, nhưng mỗi gigabyte dữ liệu đọc ra đều bị tính thêm phí Retrieval Fee. Nếu một ứng dụng thường xuyên đọc lại các file trong Standard-IA, tổng chi phí sẽ đắt gấp đôi so với để nguyên ở Standard!

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Sự khác biệt giữa Tính Bền Vững (Durability) và Tính Sẵn Sàng (Availability) của S3 là gì?**
   - *Trả lời*: **Durability (Độ bền - 11 con số 9)** cam kết dữ liệu không bao giờ bị mất hoặc bị hư hỏng bit vật lý trên đĩa. **Availability (Độ sẵn sàng - 99.99%)** cam kết thời gian hệ thống hoạt động để bạn có thể gửi API đọc/ghi dữ liệu (cho phép tối đa khoảng 53 phút gián đoạn dịch vụ mỗi năm do bảo trì mạng).
2. **S3 Object Lock giải quyết bài toán tuân thủ pháp lý (Compliance) như thế nào?**
   - *Trả lời*: Triển khai mô hình **WORM (Write Once, Read Many)**. Khi được bật ở chế độ `Compliance Mode`, **không một ai (kể cả tài khoản AWS Root Account)** có thể chỉnh sửa hay xóa object đó trong suốt thời hạn lưu trữ quy định, ngăn ngừa hoàn toàn nguy cơ bị mã độc tống tiền (Ransomware) xóa dữ liệu.
3. **Tại sao nên bật S3 Versioning khi cấu hình Lifecycle Rules?**
   - *Trả lời*: S3 Versioning lưu giữ toàn bộ lịch sử khi file bị ghi đè hoặc bị xóa (tạo Delete Marker). Kết hợp với Lifecycle Rules, bạn có thể tự động chuyển các bản ghi lịch sử cũ (Noncurrent versions) sang Glacier để tiết kiệm chi phí mà vẫn đảm bảo khả năng phục hồi dữ liệu 100% khi có sự cố xóa nhầm.
