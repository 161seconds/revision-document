# Module 04: Asynchronous Messaging & Event-Driven Architecture

Chào mừng bạn đến với **Module 04: Asynchronous Messaging & Event-Driven Architecture**. Giao tiếp đồng bộ (Synchronous HTTP/REST) khiến các dịch vụ bị gắn kết chặt chẽ (Tight Coupling), dẫn đến lỗi xếp tầng (Cascading Failures) và độ trễ tăng vọt theo chuỗi phụ thuộc. Module này trang bị toàn diện về kiến trúc hướng sự kiện (EDA), cơ chế luồng sự kiện (Kafka), các cam kết phân phối tin nhắn và điều tiết lưu lượng.

---

## 📚 Danh Mục Bài Học

1. **[01-message-queues-vs-event-streams.md](file:///d:/my-project/revision-document/system-design/04-messaging-and-event-driven/01-message-queues-vs-event-streams.md)**:
   - Message Queues (RabbitMQ, ActiveMQ) vs Event Streams (Apache Kafka, Pulsar).
   - "Smart Broker, Dumb Consumer" vs "Dumb Broker, Smart Consumer".
   - Khả năng Replay sự kiện và mô hình lưu trữ Append-Only Commit Log.

2. **[02-kafka-deep-dive-partitions-and-consumer-groups.md](file:///d:/my-project/revision-document/system-design/04-messaging-and-event-driven/02-kafka-deep-dive-partitions-and-consumer-groups.md)**:
   - Cấu trúc Topic, Partitions và Segment Files.
   - Consumer Groups và thuật toán phân bổ Partition Rebalance.
   - Đảm bảo thứ tự nghiêm ngặt theo Partition Key.
   - Cơ chế chịu lỗi: In-Sync Replicas (ISR), Producer `acks=all`, `min.insync.replicas`.

3. **[03-delivery-guarantees-outbox-and-idempotency.md](file:///d:/my-project/revision-document/system-design/04-messaging-and-event-driven/03-delivery-guarantees-outbox-and-idempotency.md)**:
   - Ba mức cam kết phân phối: At-most-once, At-least-once, Exactly-once.
   - Vấn đề phân tán kép: Lưu DB thành công nhưng publish message thất bại (hoặc ngược lại).
   - **Transactional Outbox Pattern** & Change Data Capture (Debezium / Kafka Connect).
   - Thiết kế Consumer Idempotent với Idempotency Keys và Unique Constraints.

4. **[04-event-sourcing-cqrs-and-backpressure.md](file:///d:/my-project/revision-document/system-design/04-messaging-and-event-driven/04-event-sourcing-cqrs-and-backpressure.md)**:
   - **Event Sourcing**: Trạng thái hiện tại là tổng tích lũy của toàn bộ chuỗi sự kiện trong quá khứ.
   - **CQRS (Command Query Responsibility Segregation)**: Tách riêng mô hình Ghi (Command) và mô hình Đọc (Query View).
   - Backpressure & Điều tiết lưu lượng: Token Bucket, Leaky Bucket, và **Circuit Breaker Pattern** (Closed, Open, Half-Open).

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt thuật toán**: [event_stream_simulator.mjs](file:///d:/my-project/revision-document/system-design/04-messaging-and-event-driven/event_stream_simulator.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/system-design/04-messaging-and-event-driven/practice.mjs)

Chạy lệnh kiểm thử:
```bash
rtk node system-design/04-messaging-and-event-driven/practice.mjs
```
