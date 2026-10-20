# DDD và modular monolith thực chiến

DDD giúp mô hình hóa phần nghiệp vụ khó bằng ngôn ngữ và ranh giới rõ ràng. Modular monolith giúp tổ chức các phần đó trong một đơn vị triển khai. Có thể dùng một phần DDD trong monolith; không cần microservice, mediator hoặc event sourcing để bắt đầu.

| Bài | Nội dung |
| --- | --- |
| [01. Domain và bounded context](01-domain-and-contexts.md) | Ngôn ngữ, context map, ownership và phân biệt module/service. |
| [02. Aggregate và invariant](02-aggregates-and-invariants.md) | Entity, value object, transaction boundary và quy tắc nhất quán. |
| [03. Contract giữa module](03-module-contracts-and-events.md) | Public API, DTO, synchronous call, event và dữ liệu riêng. |
| [04. CRUD, refactor và quyết định](04-crud-and-migration.md) | Khi nào mô hình đơn giản đủ, tách dần một feature và ADR. |
| [05. Lab Ordering–Billing](05-lab.md) | Invariant khi xác nhận đơn và snapshot công khai cho module khác. |

Tra nhanh: [summary.md](summary.md). Nguồn: [sources.md](sources.md). Nên đọc [Clean Architecture](../clean-architecture/README.md) trước hoặc song song.

## Chạy lab

Cần .NET SDK 10+, không thêm package:

```powershell
rtk proxy dotnet run --file ddd-modular-monolith/lab/Orders.cs --configuration Release
```

Lab kiểm tra aggregate trong một assembly. Nó không dựng hệ thống đặt hàng hoàn chỉnh, không lưu DB, không enforce dependency giữa project và không xử lý cạnh tranh nhiều request. Xem [integration testing](../dotnet-integration-testing/README.md) và [PostgreSQL concurrency](../postgresql-concurrency/README.md) cho các ranh giới đó.
