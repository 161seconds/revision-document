# Clean Architecture — cheat sheet

Lộ trình: [README](README.md). Nguồn chính: [sources.md](sources.md).

## Những điều cần nhớ

| Câu hỏi | Câu trả lời thực dụng |
| --- | --- |
| Nguyên tắc cốt lõi? | Dependency mã nguồn hướng về policy nghiệp vụ. |
| Domain giữ gì? | Invariant, hành vi nghiệp vụ và kiểu giá trị của mô hình. |
| Application giữ gì? | Use case, orchestration, tiền điều kiện và contract I/O cần thiết. |
| Infrastructure giữ gì? | ORM, mapping, migration, provider và adapter I/O. |
| API giữ gì? | Giao thức, auth adapter, request/response và composition root. |
| Port thuộc đâu? | Nơi sở hữu nhu cầu; thường Application, có trường hợp Domain. |
| Có cần đúng bốn project? | Không; chọn cách enforce theo quy mô và rủi ro. |
| Có cần interface cho mọi class? | Không. |
| CQRS có cần hai DB? | Không. |
| MediatR có phải Clean Architecture? | Không; đó là thư viện dispatch. |
| Bounded context có phải microservice? | Không bắt buộc. |
| Vertical Slice có thể cùng Clean? | Có, nếu giữ được ranh giới đã chọn; từng biến thể có trade-off riêng. |
| Một `SaveChanges` bảo vệ gì? | Tập thay đổi của lần lưu đó, với provider hỗ trợ transaction và cấu hình phù hợp. |
| Domain test có bắt lost update? | Không; cần concurrency control và integration test. |
| Outbox có exactly-once? | Không tự bảo đảm; phát lặp vẫn có thể xảy ra. |

## Graph tham chiếu phổ biến

```text
Application tham chiếu Domain.
Infrastructure tham chiếu Application và Domain khi cần.
API gọi Application; nối Infrastructure tại composition root.
Domain không tham chiếu các project ứng dụng phía ngoài.
```

Đây là graph minh họa, không phải yêu cầu mọi codebase phải có đủ các project.

## Review một feature

- Quy tắc nào vẫn phải đúng khi bỏ controller và gọi từ worker?
- Public response có ổn định và tránh lộ entity nội bộ không?
- Port có lộ `IQueryable`, ORM entry hoặc SDK response không?
- Điều gì phải commit cùng nhau? Điều gì cần concurrency token/constraint?
- Sau commit, side effect nào có thể mất hoặc bị lặp?
- Authorization có áp dụng cho mọi entry point liên quan không?
- Fake chứng minh được gì, còn thiếu test provider thật ở đâu?
- Có abstraction nào chỉ chuyển tiếp method mà chưa giải quyết vấn đề cụ thể?

## Chạy ví dụ

```powershell
rtk proxy dotnet run --file clean-architecture/example.cs
```

Cần .NET SDK 10+. Kỳ vọng `PASS: 8/8 self-checks`; đây là kiểm thử logic trong bộ nhớ, chưa có database hoặc HTTP.

## Khi nào đọc tiếp?

| Vấn đề | Bài |
| --- | --- |
| Chưa hiểu chiều phụ thuộc | [01](01-dependency-rule.md) |
| Chưa biết đặt file/port ở đâu | [02](02-dotnet-boundaries.md) |
| Đang chọn style kiến trúc | [03](03-comparing-architectures.md) |
| Đang cân nhắc DDD hoặc CQRS | [04](04-ddd-cqrs-and-vertical-slices.md) |
| Có race, rollback hoặc side effect | [05](05-transactions-and-integration.md) |
| Test chưa chứng minh được ranh giới | [06](06-testing-and-enforcement.md) |
| Refactor code cũ | [07](07-migration-and-decisions.md) |
| Cần bài tập tự kiểm tra | [08](08-exercises-and-case-study.md) |
