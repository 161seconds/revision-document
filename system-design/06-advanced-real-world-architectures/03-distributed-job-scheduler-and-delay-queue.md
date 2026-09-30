# 03. Distributed Job Scheduler & Delay Queue (Quartz, Celery, BullMQ)

Hệ thống lập lịch phân tán (Distributed Job Scheduler) và hàng đợi trễ (Delay Queue) xử lý hai bài toán then chốt:
1. **Lập lịch định kỳ (Recurring Cron Jobs):** Chạy tác vụ vào thời điểm định sẵn (ví dụ gửi email tổng kết vào 08:00 sáng mỗi thứ Hai, sao lưu DB lúc 02:00 sáng).
2. **Tác vụ trễ theo thời gian (Delayed Tasks):** "Hủy đơn hàng nếu người dùng không thanh toán sau 30 phút", "Gửi thông báo nhắc nhở sau 24 giờ kể từ khi đăng ký".

---

## 1. Kiến Trúc Hai Tầng (Two-Tier Architecture)

```mermaid
graph TD
    subgraph Control Tier (Coordinator / Scheduler Master)
        ZK["ZooKeeper / Etcd / Raft<br/>(Leader Election)"]
        Leader["Scheduler Leader Node"]
        Follower["Scheduler Standby Node"]
        Leader -.->|Lease / Heartbeat| ZK
    end

    subgraph Storage Tier
        TaskStore[("Distributed Database / Redis<br/>(Task State & Schedules)")]
    end

    subgraph Execution Tier (Worker Pool)
        Queue["Distributed Message Queue / Delay Queue<br/>(Kafka / Redis ZSET / RabbitMQ DLX)"]
        W1["Worker Node 1"]
        W2["Worker Node 2"]
        W3["Worker Node 3"]
    end

    Leader -->|Quét tác vụ đến hạn| TaskStore
    Leader -->|Đẩy tác vụ thực thi| Queue
    Queue --> W1
    Queue --> W2
    Queue --> W3
```

- **Leader Election:** Sử dụng Etcd hoặc Redis Redlock để chọn 1 Leader duy nhất chịu trách nhiệm quét các tác vụ đến hạn. Tránh hiện tượng Split-Brain (hai scheduler cùng bắn một tác vụ).
- **Phân tách Điều phối vs Thực thi:** Scheduler không trực tiếp chạy tác vụ nặng (như render video hay gửi 10 triệu email). Scheduler chỉ phát tín hiệu (Job Event) vào hàng đợi để Worker Pool tự động kéo về xử lý.

---

## 2. Các Cơ Chế Cài Đặt Hàng Đợi Trễ (Delay Queue Implementation)

### 2.1 Cơ chế Redis Sorted Set (`ZSET`)
- Lưu trữ tác vụ với cấu trúc:
  - `key`: ID hoặc payload của tác vụ.
  - `score`: Unix timestamp tại thời điểm tác vụ cần được thực thi (`execution_time = now + delay`).
- **Worker Poller:**
  ```bash
  # Lấy các tác vụ có execution_time <= thời điểm hiện tại
  ZRANGEBYSCORE delay_queue 0 <current_timestamp> LIMIT 0 100
  # Xóa khỏi hàng đợi trễ sau khi đã lấy thành công
  ZREM delay_queue <task_id>
  ```
- **Tối ưu tính nguyên tử:** Đóng gói thao tác lấy và xóa trong một **Lua script** duy nhất để không bị nhiều worker tranh chấp cùng 1 tác vụ.

### 2.2 Bánh Xe Thời Gian Băm (Hashed Timing Wheel)
- Cấu trúc dữ liệu hình tròn mô phỏng mặt đồng hồ chia thành $N$ khe (slots), mỗi khe đại diện cho 1 khoảng thời gian (tick, ví dụ 1 giây).
- Con trỏ (Pointer) di chuyển 1 nấc sau mỗi tick.
- Mỗi khe chứa một danh sách liên kết kép (Doubly Linked List) các tác vụ cần chạy tại thời điểm đó.
- Độ phức tạp thời gian:
  - Thêm tác vụ trễ: $O(1)$.
  - Hủy tác vụ trễ: $O(1)$.
  - Kích hoạt tác vụ khi con trỏ quét tới: $O(1)$ cho việc tìm kiếm khe.

```
       [Slot 0] ---> [Task A (round=0)] -> [Task B (round=1)]
     /          \
[Slot 7]       [Slot 1]
   |    ^ (Pointer) |
[Slot 6]       [Slot 2]
     \          /
       [Slot 3]
```

### 2.3 RabbitMQ Dead Letter Exchange (DLX) + Message TTL
- Gửi tin nhắn vào một Queue tạm thời không có Consumer, đặt thuộc tính `x-message-ttl = delay_ms`.
- Cấu hình `x-dead-letter-exchange` trỏ về Queue chính thức.
- Khi hết thời gian TTL, RabbitMQ tự động đẩy tin nhắn vào Queue chính để Worker tiêu thụ.

---

## 3. Quản Lý Trạng Thái Tác Vụ & Khả Năng Chống Chịu Lỗi (Fault Tolerance)

| Trạng thái | Ý nghĩa | Hành động khi gặp sự cố |
| :--- | :--- | :--- |
| `PENDING` | Tác vụ đã được lên lịch, chưa tới hạn | Đợi đến hạn |
| `DISPATCHED` | Đã đưa vào hàng đợi thực thi | Nếu quá thời gian timeout mà chưa sang `RUNNING`, đưa lại vào hàng đợi |
| `RUNNING` | Worker đang thực hiện tác vụ | Worker gửi heartbeat định kỳ; nếu mất heartbeat $\rightarrow$ Re-queue |
| `COMPLETED` | Tác vụ thành công | Lưu log và cập nhật lịch cho lần tiếp theo |
| `FAILED` | Tác vụ bị ném ngoại lệ | Thử lại theo Exponential Backoff $\rightarrow$ chuyển vào Dead Letter Queue (DLQ) |

---

## 4. Tác Vụ Bất Khả Thi (At-least-once vs Idempotency)

Trong hệ thống phân tán, việc cam kết tác vụ chạy **đúng một lần duy nhất (Exactly-Once Execution)** trên tầng mạng là bất khả thi.
- Một worker có thể thực thi xong tác vụ gửi email hoặc trừ tiền, nhưng bị mất điện ngay trước khi gửi ACK về scheduler.
- Scheduler sẽ nghi ngờ worker bị chết và phân phối lại tác vụ đó cho worker khác.
- **Giải pháp:** Mọi công việc của worker bắt buộc phải có tính chất **Idempotent (Bảo toàn kết quả khi chạy lại)** bằng cách kiểm tra trạng thái khóa trong cơ sở dữ liệu trước khi thực thi.
