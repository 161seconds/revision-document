# Clean Architecture và kiến trúc ứng dụng

Bộ tài liệu tiếng Việt về cách giữ nghiệp vụ độc lập với HTTP, ORM và dịch vụ bên ngoài. Ví dụ dùng .NET; các nguyên tắc áp dụng được cho Java, TypeScript và Python.

Mục tiêu là biết **đặt quy tắc ở đâu, kiểm tra ranh giới thế nào và khi nào nên giữ thiết kế đơn giản**. Số project, interface hoặc package không phải thước đo chất lượng kiến trúc.

## Lộ trình đọc

| Bài | Nội dung | Kết quả cần đạt |
| --- | --- | --- |
| [01. Dependency Rule](01-dependency-rule.md) | Policy, detail, chiều phụ thuộc và luồng chạy | Giải thích vì sao gọi database không buộc Domain phụ thuộc ORM. |
| [02. Ranh giới trong .NET](02-dotnet-boundaries.md) | Domain, Application, Infrastructure, API và composition root | Đặt entity, port, DTO, validation và DI đúng chỗ. |
| [03. So sánh kiến trúc](03-comparing-architectures.md) | Layered, Clean, Hexagonal, Onion, Vertical Slice, modular monolith | Chọn theo vấn đề và chi phí thay đổi. |
| [04. DDD, CQRS và Vertical Slice](04-ddd-cqrs-and-vertical-slices.md) | Bounded context, aggregate, command/query, tổ chức theo feature | Dùng từng khái niệm độc lập, tránh gắn cả bộ vào mọi CRUD. |
| [05. Transaction và tích hợp](05-transactions-and-integration.md) | EF Core, concurrency, outbox, retry và idempotency | Chỉ ra cửa sổ mất dữ liệu và xử lý tranh chấp cập nhật. |
| [06. Kiểm thử ranh giới](06-testing-and-enforcement.md) | Domain test, application test, integration, architecture test | Biết test nào chứng minh được điều gì. |
| [07. Migration và quyết định](07-migration-and-decisions.md) | Refactor từng use case, ADR và C4 | Cải tổ code cũ mà giữ hợp đồng với người dùng. |
| [08. Bài tập và case study](08-exercises-and-case-study.md) | Hủy đơn hàng, phân loại trách nhiệm, đọc repo thực tế | Tự đánh giá bằng tiêu chí cụ thể. |

Tài liệu tra nhanh: [summary.md](summary.md). Nguồn gốc, repo mẫu và thứ tự đọc: [sources.md](sources.md).

## Kiến thức tiên quyết

- [SOLID và Dependency Inversion](../dotnet/csharp-from-zero-to-hero/05-solid-principles/README.md).
- [Repository, Unit of Work và EF Core](../dotnet/csharp-from-zero-to-hero/07-data-access-and-architecture/README.md).
- [Transaction và ACID](../database/06-indexes-transactions-and-security/02-transactions-and-acid.md).

Nếu chưa biết các phần này, vẫn có thể đọc bài 01–03 trước; học chi tiết persistence khi đến bài 05.

## Ví dụ chạy được

[example.cs](example.cs) mô phỏng use case `CancelOrder` với Domain, Application, adapter lưu trữ trong bộ nhớ và adapter báo lỗi. Cần **.NET SDK 10 trở lên**; không có package NuGet bổ sung.

Chạy từ thư mục gốc repo:

```powershell
rtk proxy dotnet run --file clean-architecture/example.cs
```

Nếu không cài RTK, dùng `dotnet run --file clean-architecture/example.cs`.

Ví dụ tự kiểm tra 8 tình huống: hủy thành công, hủy lại, đơn đã giao, đơn không tồn tại, ID rỗng ở use case, ID rỗng ở Domain, trạng thái không hợp lệ và lỗi lưu. Lỗi kiểm tra làm tiến trình thất bại; không dùng `Debug.Assert` vốn có thể bị loại khỏi bản Release.

Đây là ví dụ ranh giới logic trong một assembly. Nó chưa chứng minh khả năng cô lập dependency ở mức `.csproj`, giao dịch database, phân quyền HTTP hoặc xử lý request đồng thời. Các phần đó có tiêu chí kiểm thử riêng ở bài 05–06.

## Học trong bốn buổi

1. Đọc bài 01–03, vẽ graph phụ thuộc của một feature trong dự án đang làm.
2. Đọc bài 04, chỉ ra invariant và bounded context của feature đó.
3. Chạy ví dụ, đọc bài 05–06, liệt kê những điều fake repository không thể chứng minh.
4. Làm bài 07–08, viết một ADR ngắn và kế hoạch refactor một use case.

Muốn bổ sung tài liệu ngoài kiến trúc: xem [roadmap của kho](../DOCUMENTATION-ROADMAP.md).
