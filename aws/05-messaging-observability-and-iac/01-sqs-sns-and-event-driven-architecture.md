# 01. SQS, SNS & Event-Driven Architecture

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 03: Compute & Scaling](file:///d:/my-project/revision-document/aws/03-compute-and-scaling/README.md).
- **Module hiện tại**: [Module 05: Messaging, Observability & IaC](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/README.md).
- **Trực thuộc**: [Master AWS Cheat Sheet](file:///d:/my-project/revision-document/aws/summary.md).
- **Kế tiếp**: [02. CloudWatch Metrics, Alarms & Logs](file:///d:/my-project/revision-document/aws/05-messaging-observability-and-iac/02-cloudwatch-metrics-alarms-and-logs.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Amazon SQS (Simple Queue Service) - Cơ Chế Hàng Đợi (Pull Model)
- **Mô hình Pull**: Consumer (máy chủ worker hoặc Lambda) chủ động gửi request `ReceiveMessage` để kéo tin nhắn về xử lý.
- **Thời Gian Ẩn Tin Nhắn (Visibility Timeout - Mặc định 30 giây)**:
  - Khi Consumer A kéo một message về, tin nhắn đó **không bị xóa ngay**, mà chỉ bị ẩn đi đối với các Consumer khác trong 30 giây.
  - Nếu Consumer A xử lý thành công: Nó gọi API `DeleteMessage` để xóa vĩnh viễn tin nhắn.
  - Nếu Consumer A bị crash (mất điện, ném exception): Sau 30 giây, tin nhắn tự động xuất hiện trở lại trong hàng đợi để Consumer B khác kéo về xử lý lại!

### 2.2 So Sánh SQS Standard vs SQS FIFO
| Tiêu chí | SQS Standard Queue | SQS FIFO Queue |
| :--- | :--- | :--- |
| **Thứ tự tin nhắn** | Thứ tự tương đối (Best-effort ordering) | **Đảm bảo chính xác 100% First-In-First-Out** |
| **Số lần gửi** | At-least-once (Có thể nhận trùng lặp tin nhắn) | **Exactly-once processing** (Chống trùng lặp tuyệt đối) |
| **Throughput** | **Không giới hạn** số tin nhắn/giây | Tối đa $300\text{ msgs/s}$ (hoặc $3,000\text{ msgs/s}$ nếu dùng batching) |
| **Quy ước đặt tên** | Bất kỳ tên hợp lệ nào | **Bắt buộc phải kết thúc bằng đuôi `.fifo`** |
| **Tham số bắt buộc**| Không | Bắt buộc `MessageGroupId` và `MessageDeduplicationId` |

### 2.3 Dead Letter Queue (DLQ) & Redrive Policy
- Nếu một tin nhắn chứa dữ liệu hỏng (Poison Pill Message) khiến mọi Consumer xử lý đều bị crash:
- Tin nhắn sẽ liên tục xuất hiện lại trong hàng đợi vô tận, làm tê liệt toàn bộ worker!
- **Giải pháp**: Thiết lập **Redrive Policy** với `maxReceiveCount: 3`. Nếu tin nhắn bị nhận thất bại quá 3 lần, SQS tự động chuyển tin nhắn đó sang một hàng đợi riêng biệt gọi là **Dead Letter Queue (DLQ)** để kỹ sư điều tra thủ công mà không làm nghẽn luồng xử lý chính.

---

## 3. Amazon SNS (Simple Notification Service) - Cơ Chế Xuất Bản (Push Model)

- **Mô hình Pub/Sub (Publish/Subscribe)**: Producer gửi 1 tin nhắn vào **SNS Topic**. SNS tự động đẩy (Push) đồng loạt tin nhắn đó tới tất cả các Subscriber đã đăng ký (Email, SMS, HTTPS Webhook, Lambda, SQS).
- **Mẫu Thiết Kế Fanout Pattern (Kinh Điển Trong Microservices)**:

```
                                +-----------------------+
                                |   SNS TOPIC: ORDERS   |
                                +-----------+-----------+
                                            |
         +----------------------------------+----------------------------------+
         |                                  |                                  |
+--------v--------+                +--------v--------+                +--------v--------+
| SQS: Payment    |                | SQS: Warehouse  |                | SQS: Analytics  |
| Processing      |                | Shipping        |                | Realtime        |
+-----------------+                +-----------------+                +-----------------+
```
- Khi đơn hàng được tạo, Producer chỉ gửi 1 event duy nhất vào SNS Topic.
- Cả 3 dịch vụ con (Payment, Warehouse, Analytics) đều nhận được bản sao tin nhắn thông qua các hàng đợi SQS riêng biệt của mình, xử lý bất đồng bộ hoàn toàn độc lập và chịu lỗi tuyệt đối (Decoupled Microservices).

---

## 4. Amazon EventBridge - Xe Buýt Sự Kiện Hiện Đại (Event Bus)
- Phát triển nâng cao từ CloudWatch Events:
  - Cho phép lọc và định tuyến sự kiện dựa trên cấu trúc JSON payload sâu bên trong (Content-based filtering).
  - Tích hợp nguyên bản với hơn 200 dịch vụ AWS và các đối tác SaaS bên thứ ba (Shopify, Datadog, Zendesk, Auth0).
  - Tích hợp **Schema Registry**: Tự động sinh mã nguồn TypeScript/Java/Python models từ cấu trúc sự kiện.

---

## 5. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Quên Xóa Message Sau Khi Xử Lý Thành Công Trong SQS**
> Nhiều lập trình viên quen dùng RabbitMQ lầm tưởng SQS tự xóa message sau khi đọc. Nếu worker của bạn không gọi lệnh `sqs.deleteMessage({ ReceiptHandle })`, khi hết Visibility Timeout, **tin nhắn sẽ được gửi lại cho worker khác xử lý tiếp**, gây hiện tượng trừ tiền ngân hàng hoặc gửi email 2 lần!

> [!WARNING]
> **Bẫy 2: Chi Phí Bất Ngờ Khi Thăm Dò SQS Bằng Short Polling**
> - **Short Polling (`WaitTimeSeconds: 0`)**: Trả về kết quả ngay lập tức kể cả khi hàng đợi trống. Worker chạy vòng lặp liên tục sẽ gửi hàng triệu request rỗng mỗi ngày, tiêu tốn nhiều tiền API.
> - **Long Polling (`WaitTimeSeconds: 20`)**: SQS giữ kết nối mở tối đa 20 giây để chờ có tin nhắn mới tới mới trả về, **giảm $90\%$ số lượng API calls rác và tiết kiệm tối đa chi phí**.

---

## 6. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Khi nào nên chọn SQS Standard thay vì SQS FIFO?**
   - *Trả lời*: Chọn **SQS Standard** khi hệ thống đòi hỏi throughput cực lớn (hàng chục ngàn đến hàng triệu messages/giây) và ứng dụng có khả năng chịu được việc xử lý tin nhắn không theo thứ tự hoặc xử lý trùng lặp (Idempotent consumers). Chọn **SQS FIFO** khi thứ tự là yếu tố sống còn bắt buộc phải tuần tự (vd: Giao dịch khớp lệnh tài chính chứng khoán, theo dõi số dư ngân hàng).
2. **Message Deduplication ID trong SQS FIFO hoạt động như thế nào?**
   - *Trả lời*: Là chuỗi định danh duy nhất của tin nhắn. Trong khoảng thời gian chống trùng lặp **$5\text{ phút}$ (Deduplication Interval)**, nếu Producer gửi liên tiếp nhiều tin nhắn có cùng `MessageDeduplicationId`, SQS FIFO sẽ chấp nhận tin nhắn đầu tiên và âm thầm từ chối các tin nhắn trùng lặp phía sau mà không ném lỗi.
3. **Mô hình Fanout giải quyết bài toán gì so với việc Producer gọi trực tiếp từng Microservice?**
   - *Trả lời*: Giải quyết triệt để sự phụ thuộc chặt chẽ (Tight Coupling). Producer không cần biết và không cần quan tâm có bao nhiêu dịch vụ đang tiêu thụ sự kiện. Khi hệ thống có thêm một Microservice thứ 4 cần nhận dữ liệu, ta chỉ cần tạo một hàng đợi SQS mới và subscribe vào SNS Topic mà không cần phải chỉnh sửa hay deploy lại một dòng code nào của Producer.
