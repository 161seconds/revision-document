# Roadmap mở rộng kho tài liệu

Mục tiêu là có tài liệu giúp thiết kế, sửa lỗi và vận hành phần mềm thực tế. Ưu tiên phần nối giữa lý thuyết đã có và một bài thực hành có kết quả kiểm tra được, thay vì thêm nhiều chủ đề cùng nhắc lại khái niệm.

Lộ trình này thiên về backend/.NET, database và kiến trúc ứng dụng. Các mục được đánh dấu đề xuất chưa đồng nghĩa đã có giáo trình hoặc lab hoàn chỉnh.

## Đã bổ sung

**[Clean Architecture](clean-architecture/README.md)**: 8 bài, cheat sheet, 18 nguồn tham khảo và ví dụ .NET có 8 self-check. Bao gồm phần nhập môn DDD/CQRS, transaction, kiểm thử ranh giới, ADR và migration; chưa thay thế giáo trình chuyên sâu cho từng chủ đề.

## Thứ tự ưu tiên

| Ưu tiên | Chủ đề nên thêm | Kho hiện có | Phần còn thiếu nên viết |
| --- | --- | --- | --- |
| P1 | **DDD và modular monolith thực chiến** | [Nhập môn trong Clean Architecture](clean-architecture/04-ddd-cqrs-and-vertical-slices.md) | Context map, aggregate design, ownership dữ liệu, contract giữa module và bài refactor một feature. |
| P1 | **Thiết kế API và quản lý contract** | [.NET Web API](dotnet/csharp-from-zero-to-hero/07-data-access-and-architecture/04-web-api-and-security.md), [API security](security/06-api-security-and-zero-trust/README.md) | Pagination/cursor, filtering, Problem Details, versioning, OpenAPI compatibility và contract test. |
| P1 | **PostgreSQL chuyên sâu** | [SQL và transaction nền tảng](database/README.md) | `EXPLAIN (ANALYZE, BUFFERS)`, MVCC, deadlock, indexing, migration không gián đoạn, backup và phục hồi thực tế. |
| P1 | **Testing backend với tài nguyên thật** | [Unit/integration testing nhập môn](dotnet/csharp-from-zero-to-hero/04-testing-and-tdd/README.md) | xUnit, `WebApplicationFactory`, Testcontainers, test dữ liệu cách ly, transaction và race có lịch chạy kiểm soát. |
| P1 | **Tích hợp tin cậy và payment workflow** | [Outbox/idempotency](system-design/04-messaging-and-event-driven/03-delivery-guarantees-outbox-and-idempotency.md), [webhook security](security/06-api-security-and-zero-trust/04-secure-api-design-cors-and-webhooks.md) | Inbox/outbox lab, duplicate webhook, replay, reconciliation, retry và recovery sau crash. |
| P2 | **Observability có thể vận hành** | [Tracing và reliability](system-design/07-reliability-resilience-observability/README.md) | Trace xuyên API–DB–worker, correlation, redaction, dashboard, SLO và runbook điều tra một incident. |
| P2 | **Deploy và migration an toàn cho .NET** | [Docker/Kubernetes/CI](devops/README.md) | Health/readiness, graceful shutdown, cấu hình/secrets, rollout/rollback và tương thích schema giữa hai phiên bản. |
| P2 | **Application security theo tình huống** | [OWASP, auth, JWT và Zero Trust](security/README.md) | BOLA/IDOR lab, resource authorization, multi-tenant isolation, session revocation và kiểm thử rò dữ liệu. |
| P2 | **Hiệu năng và chẩn đoán .NET** | [Async, GC và memory](dotnet/05-async-memory-and-advanced/README.md) | Đọc counters/trace/dump, thread-pool starvation, allocation, N+1 và benchmark trước/sau bằng workload xác định. |
| P2 | **Tài liệu thiết kế và làm việc nhóm** | [ADR/C4 nhập môn](clean-architecture/07-migration-and-decisions.md), [Git](git/README.md) | Một case study xuyên suốt: yêu cầu, acceptance criteria, C4, ADR, API contract, test plan và release checklist. |

P1 là nhóm nên làm trước vì lấp khoảng trống khi đưa một API từ code chạy được thành code có thể kiểm thử và thay đổi an toàn. P2 đào sâu vận hành, tối ưu và quy trình khi đã có ứng dụng nền.

## Nên bắt đầu bằng bộ nào?

Nếu muốn tập trung vào dự án backend, chọn chuỗi sau:

1. Clean Architecture để xác định trách nhiệm và dependency.
2. API contract để giữ hành vi ổn định với frontend/mobile.
3. PostgreSQL và integration testing để kiểm chứng dữ liệu, transaction và concurrency.
4. Outbox, webhook và recovery để xử lý tích hợp có retry.
5. Observability và deployment để theo dõi, phát hành và khôi phục.

Học DDD song song khi nghiệp vụ bắt đầu có invariant hoặc nhiều ngôn ngữ/context; chưa cần áp dụng mọi tactical pattern ngay từ CRUD đầu tiên.

## Mẫu đầu ra cho mỗi chủ đề mới

| Tệp hoặc phần | Nội dung tối thiểu |
| --- | --- |
| `README.md` | Mục tiêu, tiên quyết, thứ tự đọc, lệnh chạy và giới hạn. |
| Các bài học | Mô hình hoạt động, trade-off, lỗi thường gặp, tình huống và câu hỏi tự kiểm tra. |
| `summary.md` | Kiến thức tra nhanh và quyết định chọn phương án. |
| Ví dụ/lab | Một tình huống có đầu vào, kết quả và lệnh kiểm tra được; không cần app scaffold cho tài liệu thuần lý thuyết. |
| Nguồn | Tài liệu chính thức/bài gốc, ngày kiểm tra, commit khi phân tích repo. |

Với database hoặc vận hành, mô phỏng trong bộ nhớ chỉ là bước đầu. Tài liệu phải phân biệt ví dụ, self-check, integration test thật và phần chưa được chạy.

## Các lab đầu tiên có thể viết

| Lab | Kịch bản | Tiêu chí hoàn thành |
| --- | --- | --- |
| API contract | Đổi backend nhưng giữ endpoint và payload cho client | Contract test bắt thay đổi không tương thích. |
| PostgreSQL race | Hủy đơn cạnh tranh với thao tác ship | Test tái hiện lịch đọc/ghi và không có lost update. |
| Outbox crash recovery | Tiến trình chết giữa publish và đánh dấu đã gửi | Retry không tạo tác động nghiệp vụ lặp. |
| Authorization | Người dùng đoán ID tài nguyên của người khác | API từ chối và không rò dữ liệu qua query/log. |
| OpenTelemetry | Một request chậm vì query trong worker | Trace/correlation giúp xác định component và truy vấn gây chậm. |
| Rollback deployment | Phiên bản mới chạy cùng schema chuyển tiếp | Phiên bản cũ vẫn đọc/ghi được trong khoảng tương thích đã định. |

## Nguồn học ưu tiên

- Kiến trúc: [nguồn gốc và ba repo mẫu](clean-architecture/sources.md).
- API design: [Azure RESTful web API design](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design).
- PostgreSQL: [tài liệu chính thức](https://www.postgresql.org/docs/current/).
- Testing: [Microsoft .NET testing](https://learn.microsoft.com/en-us/dotnet/core/testing/), [ASP.NET Core integration tests](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests), [Testcontainers for .NET](https://dotnet.testcontainers.org/).
- Observability: [OpenTelemetry .NET](https://opentelemetry.io/docs/languages/dotnet/).
- Authorization: [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
- Tích hợp có retry: [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests), [Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html).
- Hiệu năng: [Microsoft .NET diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/).

## Khi nào nên mở rộng sang nhóm khác?

Frontend có thể bổ sung accessibility, form architecture, state/data fetching và E2E; nền tảng có thể bổ sung OS, networking và DSA theo dạng bài tập. Chọn khi chúng phục vụ mục tiêu học hoặc dự án cụ thể, tránh tạo thư mục trống chỉ để danh mục dài hơn.
