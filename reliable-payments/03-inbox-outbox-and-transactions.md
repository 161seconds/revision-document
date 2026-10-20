# 03. Inbox, outbox và transaction

## Cửa sổ lỗi cần đóng

Nếu commit order rồi publish event, process có thể chết giữa hai bước. Nếu publish trước commit, consumer có thể xử lý fact của transaction sau đó rollback. Outbox lưu thay đổi nghiệp vụ và event cần phát trong cùng transaction DB cục bộ.

Inbox lưu message/event đã tiếp nhận hoặc xử lý với unique key có scope phù hợp. Consumer chỉ ghi dấu “đã xử lý” atomic với side effect DB của nó; đánh dấu trước rồi crash có thể làm mất tác động, đánh dấu sau ở transaction khác có thể lặp tác động.

## Transaction của lab

Receiver xác minh chữ ký rồi mở transaction:

```text
Khóa order qua provider reference và kiểm tra amount/currency.
Insert inbox với unique (provider, event_id), kiểm tra fingerprint nếu trùng.
Nếu order pending: chuyển paid và insert một outbox order.paid.
Commit tất cả hoặc rollback tất cả.
```

Khóa order phối hợp các event ID khác nhau cùng payment. Unique `(order_id, event_type)` của outbox còn bảo vệ effect business không lặp trong mô hình lab.

Hai event có cùng ID nhưng financial field khác bị từ chối; JSON khác whitespace vẫn là cùng fingerprint sau parse/validate. Không dùng fingerprint thay signature, hai cơ chế giải quyết hai vấn đề khác nhau.

## Publisher và consumer

Publisher đọc pending, gửi và chỉ đánh dấu sent sau khi nhận xác nhận phù hợp từ hệ thống nhận. Với broker, đó thường là xác nhận publish/durable acceptance, không phải chờ mọi consumer hoàn tất nghiệp vụ.

Crash sau publish nhưng trước mark sent vẫn tạo delivery trùng. Consumer cần deduplication theo message ID và invariant business. “At least once delivery + consumer idempotent” không phải bảo đảm exactly-once ở mọi hệ thống bên ngoài.

Lab gọi consumer trực tiếp, consumer commit `consumed_messages` và `fulfilments` cùng transaction. Nó cố ý bỏ checkpoint publisher ở lần đầu rồi gửi lại cùng message ID. Đây là failpoint mô phỏng cửa sổ crash, không có broker hoặc process kill thật.

## Nhiều worker và retention

Worker thực tế cần claim/lease, giới hạn batch, retry budget và quan sát tuổi pending. `SKIP LOCKED` chỉ phối hợp trong thời gian lock được giữ; nếu commit claim trước khi gửi, phải có trạng thái/lease bền vững và policy khi lease hết hạn.

Đừng giữ lock DB xuyên qua mạng chậm mà không tính chi phí. Đừng xóa dedupe record trước cửa sổ replay cần hỗ trợ. Nếu side effect là provider/email bên ngoài, transaction local không bao trùm được nó; cần idempotency phía đích hoặc workflow recovery riêng.
