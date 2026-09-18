# 02. EBS Volumes, Snapshots & Amazon EFS

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [01. Amazon S3 Architecture & Lifecycle](file:///d:/my-project/revision-document/aws/04-storage-and-databases/01-amazon-s3-architecture-and-lifecycle.md).
- **Module hiện tại**: [Module 04: Storage & Databases](file:///d:/my-project/revision-document/aws/04-storage-and-databases/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [03. RDS, Aurora & Database Scaling](file:///d:/my-project/revision-document/aws/04-storage-and-databases/03-rds-aurora-and-database-scaling.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Amazon EBS (Elastic Block Store) - Ổ Đĩa Khối Gắn Mạng
- EBS hoạt động như một ổ cứng SSD/HDD ảo được gắn vào máy ảo EC2 thông qua mạng nội bộ cáp quang tốc độ cao.
- **Ranh giới vật lý (AZ-locked)**:
  - Một EBS Volume **chỉ tồn tại trong đúng 1 Availability Zone duy nhất**.
  - Một volume tạo ở `ap-southeast-1a` **không thể gắn trực tiếp** vào một máy ảo EC2 đang chạy ở `ap-southeast-1b`.

### 2.2 Các Loại Ổ Cứng EBS
1. **`gp3` (General Purpose SSD - Tiêu chuẩn hiện đại)**:
   - Cung cấp sẵn hiệu năng cơ sở: **$3,000\text{ IOPS}$** và băng thông **$125\text{ MB/s}$** hoàn toàn miễn phí bất kể dung lượng đĩa nhỏ hay lớn.
   - **Đột phá so với `gp2`**: Cho phép tăng độc lập IOPS (lên tới $16,000$) và Throughput (lên tới $1,000\text{ MB/s}$) mà không cần phải mua thêm dung lượng đĩa lãng phí, đồng thời **tiết kiệm $20\%$ chi phí**.
2. **`io2` (Provisioned IOPS SSD)**:
   - Dành cho các hệ thống ERP, SAP, Oracle đòi hỏi độ trễ cực thấp dưới 1 mili-giây và độ bền $99.999\%$.
   - Hỗ trợ tính năng **EBS Multi-Attach**: Cho phép gắn 1 volume vào tối đa 16 máy ảo EC2 trong cùng một AZ (cần filesystem hỗ trợ clustering như GFS2).
3. **`st1` / `sc1` (Ổ đĩa HDD từ tính)**:
   - Tối ưu cho dữ liệu truy cập tuần tự dung lượng lớn (Big Data, MapReduce, Kafka, Data Warehouse).

---

## 3. EBS Snapshots & Khôi Phục Dữ Liệu Xuyên Vùng

### 3.1 Bản Chất Sao Lưu Gia Tăng (Incremental Snapshots)
- Snapshot là bản sao lưu tại một thời điểm (Point-in-time) của EBS Volume được lưu trữ an toàn trên **Amazon S3**.
- **Cơ chế sao lưu gia tăng (Incremental)**:
  - Lần chụp 1: Lưu toàn bộ $10\text{ GB}$ dữ liệu ban đầu.
  - Lần chụp 2: Chỉ ghi nhận thêm $2\text{ GB}$ dữ liệu mới bị thay đổi.
  - Bạn chỉ phải trả tiền cho phần dung lượng thay đổi thực tế!
  - Dù là gia tăng, việc xóa một Snapshot cũ bất kỳ sẽ không làm hỏng các Snapshot phía sau nhờ cơ chế tham chiếu con trỏ thông minh của AWS.

### 3.2 Di Chuyển Volume Sang AZ Hoặc Region Khác
Muốn chuyển ổ đĩa từ `AZ-1a` sang `AZ-1b` hoặc từ Singapore sang Tokyo:
$$\text{EBS Volume (AZ-1a)} \xrightarrow{\text{Take Snapshot}} \text{Snapshot trên S3} \xrightarrow{\text{Restore Volume}} \mathbf{\text{EBS Volume Mới (AZ-1b)}}$$

---

## 4. Amazon EFS (Elastic File System) - Chia Sẻ File Đa Máy Chủ

So sánh trực diện 3 dịch vụ lưu trữ cốt lõi của AWS:

| Tiêu chí | Amazon EBS (Block Storage) | Amazon S3 (Object Storage) | Amazon EFS (File Storage) |
| :--- | :--- | :--- | :--- |
| **Giao thức** | Gắn như ổ cứng (`/dev/xvdf`) | HTTP REST API (`GET`, `PUT`) | **NFSv4 (POSIX Filesystem)** |
| **Phạm vi** | **1 AZ duy nhất** | Toàn bộ **Region** | **Đa AZ (Multi-AZ)** |
| **Khả năng chia sẻ** | 1 máy ảo duy nhất (trừ `io2`) | Không giới hạn người dùng qua Web | **Hàng ngàn máy ảo cùng đọc/ghi đồng thời (ReadWriteMany)** |
| **Co giãn dung lượng**| Phải tự tăng thủ công | Không giới hạn | **Tự động mở rộng và thu nhỏ theo dung lượng file** |
| **Trường hợp sử dụng** | Ổ cài hệ điều hành, Database | Lưu ảnh, video, backups, website tĩnh | **WordPress uploads, Machine Learning training data, Shared CMS** |

---

## 5. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Quên Bật Cờ "Delete on Termination" Khiến Hóa Đơn Phình To**
> Khi tạo máy ảo EC2, cờ `DeleteOnTermination` trên các ổ đĩa phụ (Secondary EBS Volumes) mặc định là `false`. Khi bạn xóa máy ảo EC2, các ổ đĩa này **vẫn tiếp tục tồn tại ở trạng thái "available" và tiếp tục bị tính tiền hàng tháng**!
> - **Giải pháp**: Luôn kiểm tra và dọn dẹp các ổ đĩa mồ côi (Unattached EBS Volumes).

> [!WARNING]
> **Bẫy 2: Chi Phí EFS Đắt Gấp 3-5 Lần So Với EBS**
> Do EFS tự động nhân bản dữ liệu trên nhiều AZs để hỗ trợ chia sẻ file đồng thời, chi phí lưu trữ của nó ($\approx \$0.30\text{/GB/tháng}$) đắt hơn đáng kể so với EBS gp3 ($\$0.08\text{/GB/tháng}$).
> - **Giải pháp**: Bật tính năng **EFS Lifecycle Management** để tự động chuyển các file sau 30 ngày không đọc sang tầng **EFS Infrequent Access (EFS IA)**, tiết kiệm $92\%$ chi phí.

---

## 6. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao `gp3` được coi là nâng cấp bắt buộc đối với tất cả hệ thống đang chạy `gp2`?**
   - *Trả lời*: `gp2` buộc người dùng phải mua thêm dung lượng ổ đĩa chỉ để đổi lấy thêm IOPS (với tỉ lệ 3 IOPS mỗi 1 GB). `gp3` tách rời hoàn toàn hiệu năng và dung lượng: bạn có thể giữ nguyên ổ đĩa nhỏ 20GB nhưng tăng lên 10,000 IOPS với chi phí rẻ hơn 20% so với gp2.
2. **Fast Snapshot Restore (FSR) giải quyết bài toán gì khi tạo EBS Volume mới từ Snapshot?**
   - *Trả lời*: Khi tạo một Volume mới từ Snapshot, dữ liệu ban đầu chỉ được nạp lười (Lazy-loaded) từ S3 khi có lệnh đọc, gây hiện tượng độ trễ đọc (I/O Latency spike) trong lần truy cập đầu tiên. FSR nạp trước (Pre-warm) toàn bộ các khối dữ liệu vào ổ cứng vật lý ngay lập tức, đảm bảo hiệu năng tối đa ngay từ giây đầu tiên.
3. **Khi nào nên chọn EFS thay vì EBS cho cụm máy chủ web?**
   - *Trả lời*: Khi bạn có một nhóm máy ảo Auto Scaling hoặc cụm container ECS Fargate cùng cần đọc và ghi vào chung một thư mục mã nguồn hoặc dữ liệu tải lên của người dùng (vd: thư mục `/wp-content/uploads` của WordPress). EFS cho phép gắn kết đồng thời hàng trăm máy ảo với giao thức chuẩn POSIX.
