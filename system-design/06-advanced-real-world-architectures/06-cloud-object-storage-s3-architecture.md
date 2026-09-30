# 06. Cloud Object Storage Service (AWS S3 Architecture)

Hệ thống lưu trữ đối tượng (Object Storage như Amazon S3, Google Cloud Storage, MinIO) được thiết kế để lưu trữ hàng ngàn tỷ tệp dữ liệu phi cấu trúc (ảnh, video, bản sao lưu, tệp cài đặt) với cam kết độ bền dữ liệu lên tới **$99.999999999\%$ (11 số 9 - 11 Nines of Durability)**.

Khác với Block Storage (EBS, SAN) hay File Storage (NFS, EFS), Object Storage không tổ chức tệp theo cây thư mục thứ bậc đĩa cứng mà truy cập phẳng thông qua giao thức HTTP/REST API với cặp khóa-giá trị: `Bucket Name + Object Key -> Blob Data`.

---

## 1. Phân Tách Kiến Trúc: Tầng Siêu Dữ Liệu vs Tầng Dữ Liệu Khối

```mermaid
graph TD
    Client["Client (SDK / HTTP REST)"] --> APIProxy["API Proxy / Gateway (SSL, IAM Auth, Rate Limiter)"]
    
    subgraph Metadata Tier (Strong Consistency)
        APIProxy --> MetaSvc["Metadata Service"]
        MetaSvc --> MetaDB[("Metadata DB (Spanner / CockroachDB / Cassandra)<br/>Bucket, Object Key, ETag, Chunks Map, ACL")]
    end
    
    subgraph Data Tier (High Throughput Append-Only)
        APIProxy --> DataSvc["Data Service (Chunk Router)"]
        DataSvc --> StorageNodeA["Storage Node 1 (HDD / NVMe Chunks)"]
        DataSvc --> StorageNodeB["Storage Node 2 (HDD / NVMe Chunks)"]
        DataSvc --> StorageNodeC["Storage Node 3 (HDD / NVMe Chunks)"]
    end
```

### 1.1 Tầng Siêu Dữ Liệu (Metadata Tier)
- Quản lý thông tin định danh: `bucket_id`, `object_name`, `version_id`, `size_bytes`, `md5_etag`, `content_type`, `owner_id`, `created_at`, danh sách các con trỏ trỏ tới khối dữ liệu vật lý (`chunks_list`).
- Yêu cầu: **Nhất quán mạnh (Strong Consistency)**. Từ tháng 12/2020, AWS S3 hỗ trợ Strong Read-After-Write Consistency cho cả lệnh PUT và DELETE đối tượng mới.

### 1.2 Tầng Dữ Liệu Khối (Data Tier)
- Dữ liệu tệp không được lưu nguyên khối trên một ổ đĩa đơn lẻ mà được chia thành các mảnh (Chunks / Blocks) kích thước cố định (ví dụ 4MB - 64MB).
- Các Chunk Server chỉ thực hiện thao tác **Append-Only** (Ghi nối tiếp) vào các tệp chứa lớn để tối ưu hóa I/O tuần tự của ổ cứng (Sequential I/O), không bao giờ thực hiện ghi ngẫu nhiên (Random Write).

---

## 2. Bài Toán Độ Bền Dữ Liệu: Nhân Bản 3 Lần vs Mã Hóa Xóa (Erasure Coding)

Để đạt được độ bền 11 số 9, hệ thống phân tán có hai chiến lược lưu trữ chính:

| Tiêu chuẩn | 3-Way Replication (Nhân bản 3 bản sao) | Erasure Coding (Reed-Solomon $8 + 4$ hoặc $10 + 4$) |
| :--- | :--- | :--- |
| **Cơ chế hoạt động** | Tạo ra đúng 3 bản sao nguyên vẹn của chunk trên 3 rack/máy chủ khác nhau. | Chia chunk thành $K$ mảnh dữ liệu (Data) và tính toán thêm $M$ mảnh chẵn lẻ (Parity). |
| **Hao phí dung lượng (Storage Overhead)** | **$300\%$** (Lưu 1 TB thực tế tốn 3 TB đĩa). | **$133\% - 150\%$** (RS $8+4$: lưu 8 mảnh dữ liệu + 4 mảnh kiểm tra $\implies$ tốn 1.5 TB). |
| **Khả năng chịu lỗi** | Cho phép chết tối đa **2 ổ đĩa** cùng lúc. | Cho phép chết đồng thời bất kỳ **$M$ ổ đĩa** (ví dụ 4 ổ đĩa) mà không mất bit dữ liệu nào! |
| **Chi phí khôi phục (Reconstruction)** | Rất thấp: Chỉ cần copy bản sao nguyên vẹn từ node còn sống. | Cao: Cần đọc dữ liệu từ $K$ node còn lại và nhân ma trận để tái tạo lại mảnh bị mất. |
| **Ứng dụng tối ưu** | Tệp nhỏ truy cập thường xuyên (Hot / Warm Data). | Tệp lớn, lưu trữ dài hạn (Cold / Archive S3 Glacier). |

---

## 3. Giao Thức Tải Lên Đa Phần (Multipart Upload Protocol)

Đối với các tệp tin có dung lượng lớn (từ 100MB lên đến 5TB):
1. **Khởi tạo (Initiate Multipart Upload):** Client gửi yêu cầu, API trả về một mã `UploadId`.
2. **Tải lên song song (Upload Parts):** Client chia tệp thành hàng trăm mảnh nhỏ (tối thiểu 5MB) và gửi song song lên hệ thống kèm `PartNumber` và `UploadId`.
   - Nếu đường truyền mạng bị ngắt giữa chừng ở phần số 87, client chỉ cần gửi lại duy nhất phần số 87 mà không phải truyền lại từ đầu tệp.
3. **Hoàn tất (Complete Multipart Upload):** Client gửi danh sách các `[PartNumber, ETag]`. Metadata Service gom các con trỏ lại thành đối tượng hoàn chỉnh và công bố tệp.
