# Bài 2: Cơ Sở Dữ Liệu & Lưu Trữ Phân Tán (Databases & Storage)

> **Trực quan hóa từ ByteByteGo:** Bản chất so sánh SQL vs NoSQL; Cấu trúc chỉ mục lưu trữ: B-Tree (Tối ưu Đọc) vs LSM-Tree (Tối ưu Ghi); Các chiến lược Sharding cơ sở dữ liệu; Mô hình nhân bản (Replication Topologies); và sự đánh đổi giữa ACID vs BASE.

---

## 1. B-Tree vs LSM-Tree: Trái Tim Của Các Hệ Quản Trị CSDL

Tại sao MySQL/PostgreSQL lại dùng B-Tree, trong khi Cassandra, RocksDB, ClickHouse lại dùng LSM-Tree?

```
+--------------------------------------------------------------------------+
| B-Tree (RDBMS: MySQL, Postgres, Oracle)                                 |
| - Cấu trúc: Cây cân bằng lưu trữ trên đĩa theo các trang (Pages 8KB-16KB)|
| - Cơ chế ghi: Ghi ngẫu nhiên (Random Disk I/O) -> Chậm hơn               |
| - Cơ chế đọc: Tìm kiếm nhị phân cực nhanh O(log N) -> ĐỌC SIÊU TỐC      |
+--------------------------------------------------------------------------+
| LSM-Tree (Log-Structured Merge-Tree: Cassandra, RocksDB, ScyllaDB)       |
| - Cơ chế ghi: Ghi tuần tự liên tiếp vào RAM (MemTable) và đĩa (WAL)     |
|   -> Append-only Sequential I/O -> GHI CỰC NHANH (Write-Heavy)         |
| - Cơ chế đọc: Phải tra cứu MemTable -> Bloom Filters -> Nhiều SSTables   |
|   -> Đọc chậm hơn B-Tree (Compaction liên tục để dọn dẹp)                |
+--------------------------------------------------------------------------+
```

| Tiêu chí | B-Tree Index | LSM-Tree (Log-Structured) |
| :--- | :--- | :--- |
| **Phù hợp với** | Hệ thống **Đọc nhiều (Read-heavy)** | Hệ thống **Ghi nhiều (Write-heavy)**, Log dữ liệu thời gian thực |
| **Thao tác Ghi** | Chậm (Ghi ngẫu nhiên vào các leaf pages) | Siêu tốc (Ghi tuần tự liên tiếp vào đĩa) |
| **Thao tác Đọc** | Ổn định và cực nhanh | Phức tạp hơn (Dùng Bloom Filter để tăng tốc) |
| **Hệ thống tiêu biểu** | PostgreSQL, MySQL InnoDB, SQL Server | Cassandra, Bigtable, ScyllaDB, RocksDB, InfluxDB |

---

## 2. Chiến Lược Phân Mảnh Dữ Liệu (Database Sharding)

Khi dữ liệu vượt quá dung lượng ổ đĩa của 1 máy chủ đơn lẻ (Terabytes -> Petabytes), ta phải phân chia các hàng của bảng vào nhiều máy chủ CSDL khác nhau (Sharding):

1. **Range-Based Sharding (Theo khoảng giá trị):**
   - Ví dụ: Shard 1 chứa ID từ 1 đến 1,000,000; Shard 2 chứa ID từ 1,000,001 đến 2,000,000.
   - *Ưu điểm:* Dễ truy vấn theo dải ngày tháng (`WHERE created_at BETWEEN ...`).
   - *Nhược điểm:* Dễ tạo ra **Hotspot Shard** (Shard chứa ngày hiện tại bị quá tải, trong khi các shard cũ bị đóng băng).
2. **Hash-Based Sharding (Theo hàm băm):**
   - Áp dụng công thức: $\text{ShardId} = \text{Hash}(\text{UserId}) \% N$.
   - *Ưu điểm:* Dữ liệu được phân bổ đồng đều tuyệt đối giữa các máy chủ.
   - *Nhược điểm:* Khi cần mở rộng thêm máy chủ (thay đổi $N$), phần lớn dữ liệu phải được di dời (Rehashing). Giải quyết bằng **Consistent Hashing Ring**.

---

## 3. Các Mô Hình Nhân Bản Dữ Liệu (Replication Topologies)

- **Single-Leader (Master-Slave):** Mọi thao tác Ghi (`WRITE`) đều đi vào Leader. Leader gửi luồng thay đổi (Replication Log) tới các Followers để phục vụ Đọc (`READ`). Phù hợp với hệ thống đọc nhiều ghi ít.
- **Multi-Leader:** Nhiều máy chủ có quyền nhận lệnh Ghi (ví dụ mỗi Data Center một Leader). Yêu cầu thuật toán xử lý xung đột ghi (Conflict Resolution: Last-Write-Wins, CRDTs).
- **Leaderless (Amazon Dynamo / Cassandra):** Không có Leader cố định. Client ghi thẳng tới $W$ nodes và đọc từ $R$ nodes. Hệ thống đảm bảo tính nhất quán mạnh nếu thỏa mãn công thức Quorum:
  $$R + W > N$$
  *(Trong đó $N$ là tổng số node bản sao).*
