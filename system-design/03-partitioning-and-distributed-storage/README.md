# Module 03: Data Partitioning, Replication & Distributed Storage

Chào mừng bạn đến với **Module 03: Data Partitioning, Replication & Distributed Storage**. Khi dữ liệu vượt qua hàng chục Terabytes và hàng trăm nghìn truy vấn ghi mỗi giây, một máy chủ cơ sở dữ liệu đơn lẻ (kể cả cấu hình mạnh nhất) sẽ hoàn toàn bất lực. Module này trang bị kiến thức chuyên sâu về phân mảnh dữ liệu (Sharding), các mô hình nhân bản (Replication), giải quyết tranh chấp dữ liệu và giao dịch phân tán.

---

## 📚 Danh Mục Bài Học

1. **[01-database-sharding-and-partitioning.md](file:///d:/my-project/revision-document/system-design/03-partitioning-and-distributed-storage/01-database-sharding-and-partitioning.md)**:
   - Tại sao cần Sharding? Horizontal Sharding vs Vertical Partitioning.
   - Các chiến lược chọn Sharding Key: Range-based Sharding, Hash-based Sharding, Directory-based Sharding.
   - Những "nỗi đau" khi Sharding: Cross-shard Joins, Re-sharding / Celebrity Hotspots.

2. **[02-replication-models-and-consistency-lag.md](file:///d:/my-project/revision-document/system-design/03-partitioning-and-distributed-storage/02-replication-models-and-consistency-lag.md)**:
   - Single-Leader (Master-Slave): Đồng bộ (Synchronous) vs Bất đồng bộ (Asynchronous) vs Semi-sync.
   - Multi-Leader (Active-Active): Xử lý xung đột ghi (Conflict Resolution: LWW, CRDTs).
   - Leaderless Replication (Dynamo-style): Quorum Writes & Reads ($R + W > N$), Sloppy Quorums và Hinted Handoff.
   - Các hiện tượng bất thường do Replication Lag: Read-Your-Writes Consistency, Monotonic Reads.

3. **[03-distributed-transactions-2pc-and-saga.md](file:///d:/my-project/revision-document/system-design/03-partitioning-and-distributed-storage/03-distributed-transactions-2pc-and-saga.md)**:
   - Tại sao ACID truyền thống không hoạt động trên quy mô Microservices?
   - Two-Phase Commit (2PC): Prepare phase, Commit phase, và vấn đề Blocking Coordinator.
   - **Saga Pattern**: Chuỗi các giao dịch cục bộ và Giao dịch bù trừ (Compensating Transactions).
   - So sánh Saga Orchestration (Nhạc trưởng trung tâm) vs Saga Choreography (Vũ đạo phân tán).

4. **[04-distributed-locking-and-consensus.md](file:///d:/my-project/revision-document/system-design/03-partitioning-and-distributed-storage/04-distributed-locking-and-consensus.md)**:
   - Tại sao các ứng dụng phân tán cần Khóa (Distributed Lock)?
   - Thuật toán Redlock (Redis distributed lock) và tranh luận giữa Salvatore Sanfilippo & Martin Kleppmann.
   - Sự cố "Dừng cả thế giới" (Stop-the-World GC Pause) phá vỡ lock lease.
   - Giải pháp **Fencing Tokens** (Bộ mã định danh tăng dần đơn điệu).
   - Cơ chế đồng thuận Consensus: Raft & Paxos (Leader Election, Log Replication).

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt thuật toán**: [distributed_storage.mjs](file:///d:/my-project/revision-document/system-design/03-partitioning-and-distributed-storage/distributed_storage.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/system-design/03-partitioning-and-distributed-storage/practice.mjs)

Chạy lệnh kiểm thử:
```bash
rtk node system-design/03-partitioning-and-distributed-storage/practice.mjs
```
