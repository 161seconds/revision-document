# 02. Pagination, filtering và validation

## Offset và keyset

`OFFSET/LIMIT` đơn giản, phù hợp màn hình cần nhảy số trang. Khi dữ liệu thay đổi giữa hai request, vị trí hàng có thể dịch chuyển; offset lớn còn có thể tốn nhiều công bỏ qua hàng.

Keyset dùng giá trị cuối trang trước, chẳng hạn `WHERE id > @after ORDER BY id LIMIT @limitPlusOne`. Với thứ tự theo thời gian phải có tie-breaker: `(created_at, id) > (@time, @id)` và index tương ứng. Chỉ sort `created_at` không bảo đảm thứ tự khi nhiều hàng cùng timestamp.

Lab có contract:

| Query | Quy tắc |
| --- | --- |
| `limit` | Integer chữ số ASCII, 1–100; mặc định 2. |
| `after` | Integer chữ số ASCII không âm, trong `Int32`; mặc định 0. |
| `status` | `pending`, `shipped`, `cancelled`; so sánh phân biệt hoa/thường. |
| Query lặp | Một key đã biết xuất hiện nhiều lần bị từ chối. |
| Query lạ | Lab bỏ qua; đây là quyết định contract, không phải hành vi bắt buộc cho mọi API. |

Lọc trước, sort trước, sau đó lấy `limit + 1` hàng. Nếu có hàng dư, trả `nextCursor` là ID cuối trang thực trả. Trang cuối hoặc trang rỗng trả `nextCursor: null`.

## Keyset không tạo snapshot nhiều request

Keyset giảm vấn đề dịch chuyển vị trí nhưng không bảo đảm snapshot bất biến giữa các trang. Thay đổi status, xóa hàng hoặc sửa sort key vẫn ảnh hưởng kết quả. Muốn export nhất quán cần cơ chế snapshot/version hoặc job export có contract riêng.

Cursor có thể là chuỗi opaque chứa sort key và filter fingerprint. Base64 chỉ là encoding, không ngăn chỉnh sửa. Nếu cursor mang trạng thái phải bảo vệ, dùng chữ ký/MAC hoặc token phía server và kiểm tra tenant/filter khi đọc lại. Không đưa bí mật vào cursor.

## Trust boundary

Giới hạn page size, độ dài keyword và allowlist sort field trước khi query. Dùng tham số SQL cho giá trị; sort column phải ánh xạ qua allowlist vì parameter không thay thế được identifier. Áp dụng tenant và authorization filter trước pagination; lọc sau khi lấy dữ liệu có thể rò thông tin hoặc làm trang thiếu không nhất quán.

Xem thêm [PostgreSQL trong roadmap](../DOCUMENTATION-ROADMAP.md) để nối phần contract với index và lịch đọc/ghi.
