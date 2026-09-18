# 03. Amazon RDS, Aurora & Database Scaling

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 02: Networking & VPC](file:///d:/my-project/revision-document/aws/02-networking-and-vpc/README.md), [Database Architecture](file:///d:/my-project/revision-document/database/).
- **Module hiện tại**: [Module 04: Storage & Databases](file:///d:/my-project/revision-document/aws/04-storage-and-databases/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [04. NoSQL: Amazon DynamoDB & Caching](file:///d:/my-project/revision-document/aws/04-storage-and-databases/04-nosql-dynamodb-and-caching.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Amazon RDS Multi-AZ vs Read Replicas (So Sánh Sống Còn)

```
[ KIẾN TRÚC RDS MULTI-AZ (Mục đích: High Availability & Disaster Recovery) ]
+----------------------------+        Nhân bản ĐỒNG BỘ        +----------------------------+
|  AZ-1a: Primary Instance   | ═════════════════════════════> |  AZ-1b: Standby Instance   |
|  (Nhận Read & Write)       |    (Synchronous Replication)   |  (KHÔNG ĐƯỢC PHÉP TRUY CẬP)|
+----------------------------+                                +----------------------------+
               ▲                                                             ▲
               └───────────────── CÙNG MỘT DNS ENDPOINT ─────────────────────┘
                                  (Tự động đổi DNS khi failover)

--------------------------------------------------------------------------------------------
[ KIẾN TRÚC READ REPLICAS (Mục đích: Scale tải đọc - Read Performance) ]
+----------------------------+       Nhân bản BẤT ĐỒNG BỘ      +----------------------------+
|  Primary Master Database   | ─────────────────────────────> |  Read Replica (Tối đa 15)  |
|  (Nhận Write & Read)       |   (Asynchronous Replication)   |  (Chỉ nhận truy vấn SELECT)|
+----------------------------+                                +----------------------------+
               ▲                                                             ▲
      [Endpoint Ghi Master]                                         [Endpoint Đọc Riêng Biệt]
```

| Tiêu chí | RDS Multi-AZ | RDS Read Replicas |
| :--- | :--- | :--- |
| **Mục đích chính** | **Khả năng sẵn sàng cao (High Availability / DR)** | **Mở rộng năng lực đọc (Read Scaling)** |
| **Cơ chế nhân bản** | **Đồng bộ (Synchronous)** - Zero data loss | **Bất đồng bộ (Asynchronous)** - Có độ trễ (Replication Lag) |
| **Khả năng truy cập** | **Standby không thể truy cập** (chờ failover) | **Được truy cập đọc dữ liệu bình thường (SELECT)** |
| **Điểm kết nối (DNS)**| **Duy nhất 1 DNS Endpoint** (Tự động trỏ sang Standby trong 60-120s khi Master chết) | **Mỗi Replica sở hữu một DNS Endpoint riêng biệt** |
| **Vị trí địa lý** | Nằm ở AZ khác trong cùng 1 Region | Có thể nằm trong cùng AZ, khác AZ, hoặc **Khác Region** |
| **Số lượng bản sao** | Tối đa 1 Standby instance | **Tối đa 15 Read Replicas** |

---

## 3. Kiến Trúc Đột Phá Của Amazon Aurora

Amazon Aurora là engine cơ sở dữ liệu quan hệ cloud-native tương thích hoàn toàn với PostgreSQL và MySQL do AWS thiết kế lại từ đầu:

### 3.1 Tách Rời Compute và Storage
- Trong RDS truyền thống, máy tính và ổ đĩa EBS gắn chặt với nhau.
- Trong Aurora, tầng **Compute (Instance xử lý SQL)** tách rời hoàn toàn khỏi tầng **Storage (Lưu trữ phân tán)**:
  - Tầng lưu trữ tự động **nhân bản 6 bản sao dữ liệu trải dài trên 3 Availability Zones** (mỗi AZ chứa 2 bản sao).
  - Tự động sửa chữa khối hỏng (Self-healing): Ổ đĩa liên tục được quét và phục hồi trong nền mà không ảnh hưởng tới hiệu năng query.
  - Tự động tăng dung lượng theo từng khối $10\text{ GB}$ lên tới **$128\text{ TiB}$**.

### 3.2 Cơ Chế Đồng Thuận Quorum (Write & Read Quorum)
- **Ghi dữ liệu (Write Quorum: 4/6)**: Chỉ cần $4$ trong số $6$ bản sao lưu thành công là giao dịch được xác nhận (Commit), giúp loại bỏ hoàn toàn độ trễ chờ đợi từ các node chậm chạp.
- **Đọc dữ liệu (Read Quorum: 3/6)**: Chỉ cần $3$ trong số $6$ bản sao để xác nhận tính nhất quán.

### 3.3 Aurora Serverless v2
- Tự động co giãn tài nguyên CPU và RAM theo đơn vị **ACU (Aurora Capacity Units)** chỉ trong vòng **vài phần trăm giây** (Fraction of a second) mà không ngắt kết nối client, tối ưu chi phí cho ứng dụng có lưu lượng thất thường.

---

## 4. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Quên Phân Luồng Connection String Khi Sử Dụng Read Replicas**
> Nếu bạn tạo 5 Read Replicas nhưng ứng dụng backend vẫn tiếp tục gửi toàn bộ câu lệnh `SELECT` vào Endpoint của Master:
> - Master vẫn bị quá tải CPU như cũ, trong khi các Read Replicas hoàn toàn nhàn rỗi!
> - **Giải pháp**: Ứng dụng phải cấu hình 2 connection pools: **Write Pool** trỏ về Master Endpoint (hoặc Aurora Writer Endpoint) và **Read Pool** trỏ về Read Replicas (hoặc Aurora Reader Endpoint với bộ cân bằng tải round-robin tích hợp sẵn).

> [!WARNING]
> **Bẫy 2: Hiện Tượng Đọc Dữ Liệu Cũ (Stale Read do Replication Lag)**
> Do Read Replica nhân bản bất đồng bộ, sau khi người dùng vừa cập nhật thông tin cá nhân (ghi vào Master), trang web lập tức tải lại và query vào Read Replica:
> - Bản sao chưa kịp nhận dữ liệu mới $\rightarrow$ Người dùng vẫn thấy dữ liệu cũ, lầm tưởng hệ thống bị lỗi!
> - **Giải pháp**: Đối với các thao tác đòi hỏi tính nhất quán tức thì (Read-your-own-writes), bắt buộc phải định tuyến truy vấn đó về Master.

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Khi RDS Multi-AZ thực hiện Failover, ứng dụng backend có cần phải cấu hình lại IP hoặc khởi động lại không?**
   - *Trả lời*: **Hoàn toàn không**. Amazon RDS tự động cập nhật bản ghi CNAME của DNS Endpoint chuyển từ địa chỉ IP của Primary cũ sang địa chỉ IP của Standby trong vòng 60-120 giây. Ứng dụng chỉ cần có cơ chế tự động thử lại kết nối (Connection Retry Logic) khi kết nối cũ bị đứt đoạn.
2. **Tại sao Aurora Read Replicas lại có độ trễ nhân bản (Replication Lag) siêu thấp ($< 10\text{ ms}$) so với RDS Read Replicas truyền thống?**
   - *Trả lời*: RDS truyền thống phải gửi lại toàn bộ file binary log (binlog/WAL) qua mạng cho Replica chạy lại các câu lệnh (Replay). Trong Aurora, Master và tất cả Replicas **dùng chung một tầng lưu trữ Storage Cluster phân tán duy nhất**. Master chỉ cần gửi thông tin ghi log cực nhỏ để cập nhật buffer cache của Replica trong RAM, loại bỏ việc ghi đĩa trùng lặp.
3. **Aurora Reader Endpoint có vai trò gì?**
   - *Trả lời*: Là một DNS Endpoint duy nhất đại diện cho toàn bộ các Read Replicas hiện có trong cụm Aurora. Nó tự động cân bằng tải các kết nối đọc (Round-Robin) giữa các Replicas và tự động bổ sung hoặc loại bỏ node khi cụm co giãn Auto Scaling.
