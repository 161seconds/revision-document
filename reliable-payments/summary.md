# Tra nhanh: webhook và payment tin cậy

| Rủi ro | Cơ chế |
| --- | --- |
| Client gửi thành công giả | Lấy trạng thái từ provider/server, không tin return URL. |
| Request retry thu tiền lần hai | Operation ID, scoped idempotency key, fingerprint và kết quả bền vững. |
| Callback giả hoặc bị sửa | SDK provider, raw body, timestamp và constant-time MAC primitive. |
| Event trùng | Inbox unique theo provider/account scope và event ID. |
| Event ID khác nhưng cùng fact | State machine và business invariant, không chỉ message dedupe. |
| Commit DB nhưng mất publish | Outbox cùng transaction nghiệp vụ. |
| Publish xong nhưng chưa mark | At least once và consumer idempotency. |
| Consumer crash | Checkpoint và effect DB cùng transaction; external effect cần cơ chế riêng. |
| Timeout chưa rõ kết quả | Giữ operation identity, query/reconciliation, không tạo key mới tùy tiện. |
| Poison message | Retry có budget, quarantine/DLQ có owner và replay có audit. |

Outbox không tạo exactly-once toàn hệ thống. Chữ ký hợp lệ không thay kiểm tra amount/currency/reference/account. Lab giả không chứng minh provider integration thật.
