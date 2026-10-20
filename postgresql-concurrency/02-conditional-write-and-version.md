# 02. Conditional write và optimistic concurrency

## Đưa điều kiện vào câu ghi

Nếu nghiệp vụ chỉ cho hủy đơn đang pending, kiểm tra ngay trong UPDATE:

```sql
UPDATE orders
SET status = 'cancelled', version = version + 1
WHERE id = @id AND status = 'pending' AND version = @expected_version
RETURNING id, status, version;
```

Đây là SQL minh họa cho driver dùng named parameter; không paste nguyên `@id` vào psql. PostgreSQL prepared statement cấp server thường dùng placeholder theo vị trí.

Một hàng trả về nghĩa là transition được áp dụng. Không có hàng có thể là không tồn tại, sai tenant, sai trạng thái hoặc version cũ. Ứng dụng cần ánh xạ lỗi theo contract và chính sách authorization; không query thêm rồi làm lộ tài nguyên người khác.

## Version chỉ có ích khi mọi writer tuân thủ

Một column `version` không tự tạo optimistic concurrency. Mọi đường ghi có liên quan phải kiểm tra expected version và tăng version trong cùng statement/transaction. Script admin hoặc worker ghi bỏ qua điều kiện có thể phá cơ chế.

EF Core concurrency token tạo điều kiện trên UPDATE/DELETE và báo `DbUpdateConcurrencyException` khi số hàng không như kỳ vọng. Nó không tự chọn policy merge cho nghiệp vụ. Không giữ entity cũ rồi retry y nguyên nếu điều kiện nghiệp vụ cần đọc lại.

Không dùng `xmin` như một timestamp hoặc ID nghiệp vụ. Nếu chọn provider-specific concurrency token, hiểu lifecycle, wraparound và giới hạn của system column; column version ứng dụng thường dễ giải thích hơn.

## Đọc lại không đồng nghĩa an toàn

Nếu app nhận 0 hàng rồi SELECT lại để phân loại lỗi, trạng thái có thể tiếp tục thay đổi. Kết quả phân loại là một quan sát mới, không phải bằng chứng trạng thái ở thời điểm UPDATE thất bại. Với lỗi public, đôi khi một mã conflict ổn định đã đủ.

Trong transaction có nhiều thay đổi, rollback cả unit of work khi concurrency conflict. Không commit audit/outbox ghi trước đó như thể thao tác chính đã thành công.

## Bài tập

Có thể bỏ version và chỉ dùng `status='pending'` không? Có, nếu invariant thực sự chỉ là transition từ pending và mọi field liên quan không cần đối chiếu phiên bản. Dùng version khi cần phát hiện cả các thay đổi khác mà thao tác phụ thuộc.
