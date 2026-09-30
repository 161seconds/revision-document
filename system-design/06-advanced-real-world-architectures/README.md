# Module 06: Advanced Real-World Architectures

Chào mừng bạn đến với **Module 06: Advanced Real-World Architectures**. Module này mở rộng kiến thức thiết kế hệ thống cấp độ Staff / Principal Architect, đi sâu vào các hệ thống chuyên biệt và phức tạp nhất theo giáo trình ByteByteGo Volume 2 và các kiến trúc thực tế tại các tập đoàn công nghệ hàng đầu thế giới (Google, Amazon, Uber, Stripe, Netflix, Elasticsearch).

---

## 📚 Danh Mục Bài Học

1. **[01-proximity-service-and-geohashing.md](file:///d:/my-project/revision-document/system-design/06-advanced-real-world-architectures/01-proximity-service-and-geohashing.md)**:
   - Dịch vụ định vị lân cận (Yelp, Uber, Nearby Friends).
   - So sánh 3 cấu trúc chỉ mục không gian: Geohash (Base32), QuadTree (Auto-split theo mật độ), Google S2 (Hilbert curve 64-bit).
   - Xử lý bài toán đối tượng di động (High Write TPS) vs đối tượng tĩnh (Read-Heavy).

2. **[02-payment-system-and-digital-wallet.md](file:///d:/my-project/revision-document/system-design/06-advanced-real-world-architectures/02-payment-system-and-digital-wallet.md)**:
   - Nguyên tắc kế toán kép (Double-Entry Bookkeeping Ledger: $\sum \text{Debit} = \sum \text{Credit}$).
   - Xử lý xung đột số dư (Race Condition: Optimistic Locking vs Append-Only Log).
   - Khóa bất biến Idempotency Key chống charge tiền trùng lặp khi mạng timeout.
   - Tiến trình đối soát ngân hàng (Reconciliation Service) và chuẩn bảo mật PCI-DSS Tokenization.

3. **[03-distributed-job-scheduler-and-delay-queue.md](file:///d:/my-project/revision-document/system-design/06-advanced-real-world-architectures/03-distributed-job-scheduler-and-delay-queue.md)**:
   - Kiến trúc hai tầng (Two-Tier): Coordinator Leader Election vs Worker Pool.
   - Cài đặt hàng đợi trễ (Delay Queue): Redis Sorted Set (`ZSET`) Lua script, Bánh xe thời gian băm (Hashed Timing Wheel), RabbitMQ DLX.
   - Chu kỳ trạng thái tác vụ và cam kết At-least-once với Idempotent Workers.

4. **[04-distributed-search-engine-inverted-index.md](file:///d:/my-project/revision-document/system-design/06-advanced-real-world-architectures/04-distributed-search-engine-inverted-index.md)**:
   - Cấu trúc chỉ mục đảo (Inverted Index): Term Dictionary, Term Index (FST), Postings List.
   - Tính bất biến của phân đoạn (Segment Immutability), Write-Ahead Translog và tiến trình Segment Merge.
   - Hai pha thực thi truy vấn phân tán (Query-Then-Fetch) và công thức chấm điểm phù hợp Okapi BM25.

5. **[05-realtime-gaming-leaderboard-top-k.md](file:///d:/my-project/revision-document/system-design/06-advanced-real-world-architectures/05-realtime-gaming-leaderboard-top-k.md)**:
   - Bảng xếp hạng thời gian thực bằng Redis Sorted Set (`ZSET` Skip List $O(\log N)$).
   - Kỹ thuật phân mảnh theo khoảng điểm (Score Range Partitioning) cho 50M+ người chơi.
   - Đếm xác suất Top-K Heavy Hitters trên luồng dữ liệu lớn bằng Count-Min Sketch và HeavyKeeper.

6. **[06-cloud-object-storage-s3-architecture.md](file:///d:/my-project/revision-document/system-design/06-advanced-real-world-architectures/06-cloud-object-storage-s3-architecture.md)**:
   - Phân tách kiến trúc: Tầng siêu dữ liệu (Metadata Tier) vs Tầng khối nhị phân (Data Node Chunks).
   - Đạt độ bền dữ liệu 11 số 9 ($99.999999999\%$): 3-Way Replication vs Mã hóa xóa Erasure Coding (Reed-Solomon $8+4$).
   - Giao thức tải lên song song đa phần (Multipart Upload Protocol).

7. **[07-metrics-monitoring-alerting-tsdb.md](file:///d:/my-project/revision-document/system-design/06-advanced-real-world-architectures/07-metrics-monitoring-alerting-tsdb.md)**:
   - Mô hình dữ liệu chuỗi thời gian (TSDB): Metric, Labels, Timestamp, Float64 value.
   - So sánh kiến trúc Kéo (Pull - Prometheus) vs Đẩy (Push - StatsD / OpenTelemetry).
   - Thuật toán nén Facebook Gorilla: Delta-of-Delta Timestamp và XOR Float64.
   - Chiến lược giảm mẫu phân tầng (Downsampling & Rollups).

8. **[08-ad-click-event-aggregation-stream-processing.md](file:///d:/my-project/revision-document/system-design/06-advanced-real-world-architectures/08-ad-click-event-aggregation-stream-processing.md)**:
   - Luồng sự kiện quảng cáo phân tán (Kafka + Flink + ClickHouse).
   - Các loại cửa sổ thời gian (Tumbling vs Sliding vs Session Windows).
   - Phân biệt Event Time vs Processing Time và cơ chế Watermarks xử lý dữ liệu đến trễ.
   - So sánh kiến trúc dữ liệu Lambda vs Kappa.

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt thuật toán & mô phỏng**: [advanced_architectures.mjs](file:///d:/my-project/revision-document/system-design/06-advanced-real-world-architectures/advanced_architectures.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/system-design/06-advanced-real-world-architectures/practice.mjs)

Chạy kiểm thử trực tiếp:
```bash
rtk node system-design/06-advanced-real-world-architectures/practice.mjs
```
