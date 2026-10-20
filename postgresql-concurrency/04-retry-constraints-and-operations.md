# 04. Retry, constraint và vận hành

## Retry đúng đơn vị

Với `40001` serialization failure hoặc deadlock phù hợp policy, rollback và chạy lại toàn transaction: đọc mới, kiểm tra nghiệp vụ mới, ghi mới. Không chỉ retry câu UPDATE cuối trên snapshot/entity cũ. Có giới hạn số lần thử, deadline, backoff và jitter; khi cạn budget trả lỗi có thể xử lý được.

Không retry mọi exception. Unique violation có thể là xung đột nghiệp vụ cần trả client; timeout mạng quanh commit có thể tạo trạng thái chưa biết. Idempotency và đọc lại theo operation ID giúp khôi phục khi không biết lần trước đã commit hay chưa.

Một HTTP call ra provider trong transaction có thể đã thành công dù DB rollback. Dùng [outbox và recovery](../DOCUMENTATION-ROADMAP.md) khi cần đồng bộ với dịch vụ bên ngoài.

## Đưa invariant đơn giản xuống DB

`NOT NULL`, `CHECK`, `UNIQUE`, FK và exclusion constraint bảo vệ dữ liệu trước mọi writer. Ví dụ “mỗi payment provider reference chỉ thuộc một payment” nên có unique constraint, không chỉ `SELECT` kiểm tra rồi `INSERT`.

CHECK thông thường kiểm tra giá trị của hàng, không phải cơ chế tổng quát cho invariant giữa nhiều hàng. Quy tắc tổng hạn mức có thể cần một hàng điều phối được khóa, thiết kế dữ liệu khác hoặc Serializable.

## Index và kế hoạch truy vấn

`EXPLAIN (ANALYZE, BUFFERS)` thực sự chạy statement. Không thử nó trên UPDATE/DELETE production nếu chưa kiểm soát tác động. Xem actual/estimated rows, loops, buffer và sort spill; không kết luận seq scan luôn xấu với bảng nhỏ.

Index phục vụ filter và thứ tự khóa có thể giảm phạm vi công việc nhưng tăng chi phí ghi. Đo bằng workload đại diện; không thêm index cho mọi column.

`CREATE INDEX CONCURRENTLY` giảm chặn writer nhưng không chạy bên trong transaction block thông thường và có thể để lại index invalid khi thất bại. Cần runbook kiểm tra, dọn hoặc retry đúng trạng thái; không coi migration exit code là toàn bộ bằng chứng.

## Migration và phục hồi

Thay đổi schema theo bước mở rộng, backfill, chuyển reader/writer rồi mới thu hẹp. Giữ cửa sổ tương thích giữa phiên bản cũ/mới. Backup chỉ hữu ích khi đã kiểm tra restore; replication không thay backup trước lỗi xóa dữ liệu.

Các chủ đề plan, migration và restore ở đây là hướng dẫn đọc tiếp. Lab concurrency không tự động kiểm tra backup/restore hoặc benchmark index.
