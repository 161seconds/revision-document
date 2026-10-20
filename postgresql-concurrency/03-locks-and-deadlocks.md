# 03. Row lock, deadlock và timeout

## Khóa rồi mới quyết định

```sql
BEGIN;
SELECT id, status FROM orders WHERE id = 42 FOR UPDATE;
-- Kiểm tra lại trạng thái vừa đọc dưới lock.
UPDATE orders SET status = 'cancelled' WHERE id = 42 AND status = 'pending';
COMMIT;
```

Row lock được giữ đến khi transaction kết thúc, trừ các chi tiết rollback savepoint có liên quan. Reader SELECT thông thường vẫn có thể đọc phiên bản đã commit; writer hoặc locker xung đột phải chờ.

Ở Read Committed, một UPDATE chờ writer khác có thể kiểm tra lại điều kiện WHERE trên phiên bản hàng mới sau khi writer đó kết thúc. Điều này giúp `WHERE status='pending'` từ chối transition đã hết hợp lệ. Đọc trước ở app không thay được điều kiện tại statement ghi.

## Không chứng minh race bằng sleep

Lab cho A giữ row lock, cho B bắt đầu UPDATE, rồi dùng connection thứ ba quan sát `pg_stat_activity.wait_event_type = 'Lock'` của B. Chỉ khi đã thấy B chờ, A mới đổi trạng thái và commit. Polling có deadline chỉ để đợi một điều kiện thật; không dùng một khoảng ngủ cố định làm bằng chứng.

Production cần quyền quan sát phù hợp, thường dùng role giám sát với phạm vi tối thiểu. Không cấp superuser cho app để tiện đọc thống kê.

## Deadlock

A khóa hàng 1 rồi muốn hàng 2; B khóa hàng 2 rồi muốn hàng 1. PostgreSQL phát hiện vòng chờ và hủy một transaction với SQLSTATE `40P01`. Giảm nguy cơ bằng thứ tự khóa nhất quán, transaction ngắn, index phù hợp và không gọi mạng chậm khi giữ lock. Những cách này không chứng minh mọi deadlock đều biến mất.

`NOWAIT` báo lỗi ngay nếu không lấy được lock; `SKIP LOCKED` bỏ qua hàng đang bị khóa và hữu ích cho queue worker. Nó tạo góc nhìn không đầy đủ, không thích hợp để tính tổng chính xác hoặc kết luận “không có việc”.

## Timeout và cancellation

Đặt `lock_timeout`, `statement_timeout` và command timeout có chủ đích. Sau lỗi trong transaction, thường phải rollback hoặc xử lý savepoint phù hợp trước khi tiếp tục. Không trả kết quả thành công khi query bị timeout và chưa rõ commit có xảy ra hay không.

Bài tập thêm: mở hai session khóa hai ID theo thứ tự ngược nhau; ghi nhận SQLSTATE của bên bị hủy. Đây là bài thực hành bổ sung, không nằm trong bộ self-check tự động của lab.
