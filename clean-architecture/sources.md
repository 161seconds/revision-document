# Nguồn gốc và thứ tự đọc

Các bài trong thư mục này là tài liệu tổng hợp tiếng Việt và ví dụ tự viết, không phải bản sao đầy đủ của bài gốc hoặc template. Đã kiểm tra truy cập các nguồn dưới đây ngày **2026-10-20**.

Đọc nền tảng theo thứ tự CA-01, CA-02, CA-03; sau đó chọn CQRS/DDD, transaction hoặc repo mẫu theo nhu cầu. Link nguồn chính giúp kiểm tra lại lập luận khi công nghệ hoặc hướng dẫn thay đổi.

## CA-01

**Robert C. Martin — The Clean Architecture (2012).**

<https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html>

Nguồn gốc cho Dependency Rule, entities, use cases, interface adapters và phân biệt luồng điều khiển với phụ thuộc mã nguồn. Bài viết không bắt buộc đúng bốn vòng hoặc bốn project.

## CA-02

**Alistair Cockburn — Hexagonal Architecture / Ports and Adapters (bài gốc 2005).**

<https://alistair.cockburn.us/hexagonal-architecture>

Đọc để hiểu ứng dụng có thể được điều khiển bằng UI, test hoặc batch và không bị buộc chặt vào database hay thiết bị bên ngoài. Hình lục giác không biểu thị sáu layer bắt buộc.

## CA-03

**Microsoft — Common web application architectures.**

<https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures>

Đối chiếu layered application, Application Core, Infrastructure, UI và composition root. Có giải thích lựa chọn cho UI project tham chiếu Infrastructure để đăng ký DI.

## CA-04

**Jimmy Bogard — Vertical Slice Architecture.**

<https://www.jimmybogard.com/vertical-slice-architecture/>

Nguồn cho cách gom coupling theo đơn vị thay đổi và giảm abstraction chia sẻ giữa slice. Đừng suy ra mọi biến thể Vertical Slice giữ cùng graph dependency như Clean Architecture.

## CA-05

**Martin Fowler — CQRS.**

<https://martinfowler.com/bliki/CQRS.html>

Đọc cả lợi ích lẫn cảnh báo về độ phức tạp và rủi ro của CQRS khi áp dụng không đúng bài toán.

## CA-06

**Microsoft Azure Architecture Center — CQRS pattern.**

<https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs>

Phân biệt tách mô hình đọc/ghi trên cùng database với tách read/write store; xem trade-off về consistency và quan hệ với Event Sourcing.

## CA-07

**Microsoft — Design a DDD-oriented microservice.**

<https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice>

Nguồn cho entity, value object, aggregate, invariant và persistence ignorance. Tài liệu ở ngữ cảnh microservices; không suy ra mọi bounded context trong mọi hệ thống phải deploy thành service riêng.

## CA-08

**Microsoft EF Core — Using Transactions.**

<https://learn.microsoft.com/en-us/ef/core/saving/transactions>

Kiểm tra semantics của một lần `SaveChanges`, transaction thủ công, savepoint, provider và execution strategy. Transaction database không tự bao phủ HTTP hoặc broker.

## CA-09

**Microsoft EF Core — Handling Concurrency Conflicts.**

<https://learn.microsoft.com/en-us/ef/core/saving/concurrency>

Đọc cách cấu hình concurrency token, xử lý `DbUpdateConcurrencyException` và khác biệt giữa token do database sinh với token do ứng dụng quản lý.

## CA-10

**Chris Richardson / Microservices.io — Transactional Outbox.**

<https://microservices.io/patterns/data/transactional-outbox.html>

Nguồn cho việc lưu dữ liệu và ý định gửi message trong cùng transaction, cơ chế relay và khả năng phát lặp khiến consumer cần idempotency.

## CA-11

**Martin Fowler — Strangler Fig Application.**

<https://martinfowler.com/bliki/StranglerFigApplication.html>

Tham khảo cách hiện đại hóa dần qua các điểm phân tách, thay cho việc giả định có thể viết lại toàn bộ rồi chuyển hệ thống một lần.

## CA-12

**Simon Brown — The C4 model.**

<https://c4model.com/>

Nguồn cho bốn cấp System Context, Container, Component và Code. Dùng cấp độ giúp giải thích hệ thống và quyết định hiện tại.

## CA-13

**ADR GitHub organization — Architectural Decision Records.**

<https://adr.github.io/>

Giới thiệu mục tiêu ghi nhận quyết định, bối cảnh, lý do và trade-off; tập hợp template cùng tài liệu về decision log.

## CA-14

**Microsoft — File-based apps.**

<https://learn.microsoft.com/en-us/dotnet/core/sdk/file-based-apps>

Tài liệu chính thức cho ví dụ một file C# chạy bằng .NET SDK 10+. Cờ `--file` tránh nhầm với việc chạy project hiện tại và truyền tên file thành argument.

## CA-15

**Martin Fowler — Bounded Context.**

<https://martinfowler.com/bliki/BoundedContext.html>

Nguồn cho việc chia mô hình lớn thành những phạm vi ngôn ngữ nhất quán, mô tả quan hệ giữa context và tránh ép toàn bộ tổ chức vào một domain model duy nhất.

## Repo mẫu

Ba repo dưới đây đã kiểm tra metadata, commit và README. Các repo có giấy phép **MIT** tại thời điểm kiểm tra. Kho tài liệu chỉ liên kết và phân tích; chưa cài template, build hoặc chạy toàn bộ solution của chúng.

## CA-16

**Jason Taylor — Clean Architecture Solution Template.**

<https://github.com/jasontaylordev/CleanArchitecture/tree/1bc2b07ce75864b0c399e8e3d481de5e17aad509>

Snapshot: `1bc2b07ce75864b0c399e8e3d481de5e17aad509`.

Đọc graph solution, cách tổ chức use case, persistence và test. README của snapshot yêu cầu .NET SDK 10+, có biến thể Web API hoặc frontend và tài liệu ADR. Không cần sao chép mọi dependency của template để học nguyên tắc.

## CA-17

**Steve Smith / Ardalis — Clean Architecture.**

<https://github.com/ardalis/CleanArchitecture/tree/e7c79be54ba0b001a5b332c1efe935f520b9db4b>

Snapshot: `e7c79be54ba0b001a5b332c1efe935f520b9db4b`.

Đối chiếu cách đặt tên Core, Use Cases, Infrastructure và các biến thể template. README tại snapshot còn mô tả nhánh chính dùng .NET 9; kiểm tra project file và hướng dẫn tương ứng trước khi chạy, tránh suy ra framework từ tên hoặc số phiên bản package.

## CA-18

**Kamil Grzybek — Modular Monolith with DDD.**

<https://github.com/kgrzybek/modular-monolith-with-ddd/tree/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8>

Snapshot: `91c8ef24b4cb6ef558c95d8267fa07d68c7059f8`.

Đọc ownership module, context, CQRS, outbox, architecture test, integration test, C4 và decision log. Đây là ví dụ nhiều kỹ thuật, phù hợp để phân tích từng phần sau khi hiểu nền tảng; không phải bộ tối thiểu cho mọi ứng dụng.
