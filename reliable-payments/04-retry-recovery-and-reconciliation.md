# 04. Retry, recovery và reconciliation

## Phân loại trước khi retry

| Kết quả | Hướng xử lý |
| --- | --- |
| Input/currency/reference không hợp lệ | Reject/quarantine theo policy, không retry vô hạn cùng dữ liệu. |
| Timeout hoặc lỗi mạng quanh thao tác tiền | Kết quả có thể chưa biết; giữ operation ID/key và đối soát. |
| Rate limit hoặc lỗi transient đã xác định | Retry có deadline, backoff/jitter và `Retry-After` nếu phù hợp. |
| `40001` hoặc deadlock trong DB | Rollback, đọc mới và retry toàn transaction theo budget. |
| Provider và DB khác trạng thái | Reconciliation, audit và xử lý ngoại lệ. |

Không gộp tất cả thành “failed” rồi cho người dùng thanh toán lại. Cần trạng thái `pending/unknown` thích hợp để recovery không tạo tác động tiền trùng.

## Reconciliation là một phần workflow

Lưu provider reference, operation ID và dữ liệu giao dịch đủ đối chiếu. Job định kỳ truy vấn nguồn provider/server có thẩm quyền, tìm attempt chưa rõ kết quả hoặc webhook thiếu, rồi áp dụng cùng state machine và idempotency rules.

Một event cũ `payment.succeeded` không được xóa fact refund/dispute đã xảy ra. Với tài chính, lưu lịch sử hoặc ledger phù hợp và thêm correction/compensation; không tùy tiện viết đè lịch sử để làm hai bảng trông giống nhau.

Các trường hợp ngoài policy tự động cần hàng đợi xử lý thủ công có audit, quyền và chứng cứ. Đối soát là quá trình kiểm tra thực tế, không phải một cron chỉ đổi mọi `pending` thành `failed` sau một khoảng thời gian.

## DLQ và replay

Ghi message ID, lý do lỗi, số lần thử, thời điểm cuối và version handler. Không lưu secret trong lỗi. Replay giữ identity đã dùng để dedupe và ghi người/lý do thao tác. Thay đổi handler có thể đổi outcome; cần test trên mẫu lỗi trước khi replay hàng loạt.

DLQ không phải thùng rác: phải có owner, cảnh báo và quy trình đóng sự cố. Xóa message mà không giải quyết nghiệp vụ có thể làm mất giao dịch đã được provider xử lý.

## Chỉ số và runbook tối thiểu

Theo dõi tuổi outbox pending, số retry, event bị reject, reconciliation mismatch và attempt unknown quá lâu. Correlate request, operation, provider reference và message ID; tránh ghi thông tin nhạy cảm vào metric label.

Runbook cần câu truy vấn/read-only để tìm trạng thái, tiêu chí retry/replay, đường escalation và cách xác nhận tác động cuối cùng. Lab chưa dựng scheduler, dashboard, DLQ hay provider reconciliation thật.
