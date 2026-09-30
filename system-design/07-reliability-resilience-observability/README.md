# Module 07: Distributed Reliability, Resilience & Observability

Chào mừng bạn đến với **Module 07: Distributed Reliability, Resilience & Observability**. Một hệ thống phân tán quy mô lớn được thiết kế không phải trên giả định rằng mọi thứ luôn hoạt động hoàn hảo, mà trên định luật Murphy: **"Bất cứ điều gì có thể hỏng hóc, chắc chắn sẽ hỏng hóc" (Everything fails all the time - Werner Vogels, CTO Amazon)**.

---

## 📚 Danh Mục Bài Học

1. **[01-failure-detection-and-gossip-protocol.md](file:///d:/my-project/revision-document/system-design/07-reliability-resilience-observability/01-failure-detection-and-gossip-protocol.md)**:
   - Giới hạn của Heartbeat tập trung và bùng nổ lưu lượng mạng $O(N^2)$.
   - Giao thức SWIM Gossip: Direct Ping, Indirect Ping-Req và cơ chế Nghi ngờ (Suspicion Mechanism).
   - Bộ dò lỗi xác suất Phi Accrual Failure Detector trong Cassandra.
   - Giải quyết hiện tượng Não phân đôi (Split-Brain) bằng Fencing Tokens tuần tự.

2. **[02-resilience-patterns-circuit-breaker-bulkhead.md](file:///d:/my-project/revision-document/system-design/07-reliability-resilience-observability/02-resilience-patterns-circuit-breaker-bulkhead.md)**:
   - Mô hình ngắt mạch Circuit Breaker: 3 trạng thái Closed, Open, Half-Open.
   - Vách ngăn phân lập tài nguyên Bulkhead (Thread Pool vs Semaphore).
   - Thuật toán Exponential Backoff kết hợp Full Jitter triệt tiêu bão thử lại (Retry Storm).
   - Suy giảm duyên dáng (Graceful Degradation) và Trút bỏ tải bảo vệ CPU (Load Shedding).

3. **[03-distributed-tracing-and-opentelemetry.md](file:///d:/my-project/revision-document/system-design/07-reliability-resilience-observability/03-distributed-tracing-and-opentelemetry.md)**:
   - Ba trụ cột của khả năng quan sát (Observability): Metrics, Logs, Traces.
   - Mô hình dữ liệu Google Dapper: Traces, Spans, Cây phân cấp lời gọi và nút thắt độ trễ.
   - Chuẩn lan truyền ngữ cảnh W3C `traceparent` qua HTTP headers.
   - Chiến lược lấy mẫu Head-Based Sampling vs Tail-Based Sampling.

4. **[04-disaster-recovery-and-multiregion-active-active.md](file:///d:/my-project/revision-document/system-design/07-reliability-resilience-observability/04-disaster-recovery-and-multiregion-active-active.md)**:
   - Hai thước đo sống còn: RPO (Dữ liệu mất mát) và RTO (Thời gian chết hệ thống).
   - Ma trận 4 cấp độ DR: Backup & Restore, Pilot Light, Warm Standby, Multi-Region Active-Active.
   - Định tuyến toàn cầu Anycast BGP và GeoDNS Latency Routing.
   - Xử lý xung đột đồng bộ liên vùng: Rủi ro của Last-Write-Wins (LWW) và giải pháp tự khử xung đột CRDT (PN-Counters).

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt mô phỏng độ bền & độ tin cậy**: [resilience_simulators.mjs](file:///d:/my-project/revision-document/system-design/07-reliability-resilience-observability/resilience_simulators.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/system-design/07-reliability-resilience-observability/practice.mjs)

Chạy kiểm thử trực tiếp:
```bash
rtk node system-design/07-reliability-resilience-observability/practice.mjs
```
