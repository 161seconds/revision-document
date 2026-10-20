# Thiết kế API và giữ contract

Một API contract gồm route, method, kiểu dữ liệu, status code, lỗi, quyền truy cập và ý nghĩa nghiệp vụ. Giữ nguyên tên endpoint nhưng đổi cách tính tiền hoặc điều kiện phân quyền vẫn có thể làm client hỏng.

Bộ này dùng API đọc danh sách đơn hàng để học pagination, validation và quản lý thay đổi. Phần [Clean Architecture](../clean-architecture/README.md) trả lời code đặt ở đâu; bộ này trả lời client được quyền trông đợi điều gì.

| Bài | Nội dung |
| --- | --- |
| [01. HTTP và tài nguyên](01-http-and-resources.md) | Method, status, DTO, lỗi và các trường hợp không có dữ liệu. |
| [02. Pagination, filter và validation](02-pagination-and-validation.md) | Keyset, thứ tự ổn định, trust boundary và giới hạn input. |
| [03. Problem Details và bảo mật](03-errors-and-security.md) | RFC 9457, mã lỗi ổn định, authorization và tránh lộ dữ liệu. |
| [04. Versioning và compatibility](04-versioning-and-compatibility.md) | Breaking change, OpenAPI review, rollout và contract test. |
| [05. Lab HTTP thật](05-lab.md) | Server .NET và bộ self-check qua TCP trên cổng tự cấp. |

Tra nhanh: [summary.md](summary.md). Nguồn: [sources.md](sources.md).

## Chạy ngay

Cần .NET SDK 10+. Không có package NuGet bổ sung.

```powershell
rtk proxy dotnet run --project api-contracts/lab -- --self-test
```

Chạy từ gốc repo. Muốn mở server để thử thủ công, xem bài lab. Dataset lab cố định trong bộ nhớ; không có dữ liệu khách hàng, xác thực, ghi DB hoặc độ bền lưu trữ. Bộ check này không thay cho kiểm tra compatibility toàn bộ OpenAPI hoặc kiểm thử authorization.
