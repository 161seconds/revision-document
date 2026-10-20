# Tra nhanh: PostgreSQL concurrency

| Vấn đề | Cơ chế cần xét |
| --- | --- |
| Chuyển trạng thái một hàng | Conditional UPDATE; kiểm tra affected rows. |
| Phát hiện writer dùng dữ liệu cũ | Version/concurrency token, mọi writer phải tuân thủ. |
| Đọc rồi quyết định dưới phối hợp | `FOR UPDATE`, transaction ngắn, đọc lại dưới lock. |
| Invariant nhiều hàng | Constraint phù hợp, điểm điều phối được khóa hoặc Serializable. |
| `40001`/`40P01` | Rollback, đọc lại và retry toàn transaction có budget. |
| Queue worker | `SKIP LOCKED` có thể hữu ích; không phải snapshot đầy đủ. |
| Test race | Pin snapshot thật, quan sát barrier/lock thật, đặt deadline. |
| Mạng đứt quanh commit | Trạng thái có thể chưa biết; dùng operation ID/idempotency để khôi phục. |

Read Committed dùng snapshot theo statement. Repeatable Read không giải quyết mọi write skew. Serializable không miễn retry. Row lock không tự khóa mọi invariant nghiệp vụ.
