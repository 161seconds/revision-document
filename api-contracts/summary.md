# Tra nhanh: API contract

| Quyết định | Ghi nhớ |
| --- | --- |
| Resource/DTO | Công bố field, type, nullability, ngày giờ, tiền và quyền. |
| Pagination | Sort ổn định, tie-breaker, giới hạn page size, filter trước phân trang. |
| Cursor | Base64 không phải chữ ký; keyset không tạo snapshot giữa request. |
| Input | Validate ở server; SQL parameter cho value, allowlist cho identifier. |
| Lỗi | RFC 9457; client dùng status/type/code, không parse detail. |
| Version | Giữ client cũ theo thời hạn; không thêm version cho mọi deployment. |
| Compatibility | Xem request và response theo đúng chiều; thêm enum vẫn có thể phá client. |
| Kiểm chứng | Schema diff, HTTP contract test và review ngữ nghĩa bổ sung cho nhau. |

Chạy [lab](05-lab.md) bằng `dotnet run --project api-contracts/lab -- --self-test` từ gốc repo.
