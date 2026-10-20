# 03. Clean, Hexagonal, Onion và Vertical Slice

## Bản đồ liên kết

Đọc sau [ranh giới .NET](02-dotnet-boundaries.md). So sánh quy mô triển khai với [System Design](../system-design/README.md).

## Chúng giải quyết những câu hỏi khác nhau

| Cách tổ chức | Câu hỏi chính | Điểm cần giữ | Chi phí hoặc bẫy |
| --- | --- | --- | --- |
| Layered / N-tier | Code chia trách nhiệm trình bày, xử lý và dữ liệu thế nào? | Trách nhiệm rõ và hướng gọi có kiểm soát. | Business layer có thể bị buộc chặt vào data layer. |
| Clean Architecture | Policy được bảo vệ khỏi detail bằng dependency nào? | Dependency mã nguồn hướng vào lõi. | Mapping và abstraction dư nếu áp dụng máy móc. |
| Hexagonal / Ports and Adapters | Ứng dụng giao tiếp với bên ngoài qua port nào? | Driver và driven adapter có thể thay thế quanh lõi. | Tạo port cho mọi method dù không có ranh giới thực. |
| Onion | Những vòng phụ thuộc nào bao quanh domain model? | Cơ chế hạ tầng ở bên ngoài, phụ thuộc hướng vào. | Nhầm vòng tròn với yêu cầu số project cố định. |
| Vertical Slice | Một feature thay đổi cùng nhau ở đâu? | Gom code theo use case; giảm coupling giữa slice. | Mỗi slice tự chọn cách xử lý nhưng vẫn cần kiểm soát policy dùng chung. |
| Modular monolith | Module nghiệp vụ được cô lập ra sao trong một đơn vị triển khai? | Ownership dữ liệu, contract và dependency giữa module. | Thư mục module nhưng truy cập bảng nội bộ của nhau. |
| Microservices | Ranh giới nào thực sự cần triển khai và vận hành độc lập? | Contract mạng, dữ liệu, khả năng chịu lỗi và ownership. | Phức tạp phân tán, consistency, giám sát và triển khai. |

Clean, Hexagonal và Onion có nhiều điểm chung nhưng không phải mọi tài liệu dùng chúng với cùng thuật ngữ. Hexagon không có nghĩa ứng dụng phải có sáu layer hoặc sáu adapter.

## Hai trục tổ chức có thể kết hợp

Clean quan tâm đến chiều phụ thuộc; Vertical Slice quan tâm đến đơn vị thay đổi. Có thể tổ chức các use case của Application theo feature trong khi vẫn giữ Domain không phụ thuộc ORM:

```text
Application/
  Orders/
    CancelOrder/
      Handler.cs
      Request.cs
    GetOrder/
      Query.cs
      Result.cs
```

Đây là một cách kết hợp, không đại diện cho mọi biến thể Vertical Slice. Bài của Jimmy Bogard cho phép mỗi slice chọn cách đáp ứng yêu cầu, kể cả bỏ bớt abstraction chia sẻ giữa các layer. Nếu slice dùng EF trực tiếp, hãy thừa nhận coupling đó thay vì gọi nó là persistence-agnostic.

Modular monolith là trục về module và triển khai. Một module trong monolith có thể dùng Clean hoặc Vertical Slice. Clean Architecture không tự biến monolith thành microservices.

## Chọn theo tình huống

| Tình huống | Điểm bắt đầu hợp lý | Dấu hiệu cần nâng cấp |
| --- | --- | --- |
| Admin CRUD nhỏ, một team | Một deployable, feature gọn, validation và integration test | Nghiệp vụ dùng lại qua nhiều driver hoặc bắt đầu khó kiểm thử. |
| Quy tắc nghiệp vụ phức tạp, nhiều I/O | Domain rõ, use case và port có chủ đích | Cần enforce bằng project reference hoặc architecture test. |
| Nhiều nhóm nghiệp vụ, vẫn deploy cùng nhau | Modular monolith với ownership và contract | Có lý do cụ thể về scale, release hoặc vận hành để tách service. |
| Feature thay đổi độc lập thường xuyên | Tổ chức theo slice trong ranh giới đã chọn | Shared code tạo coupling; đánh giá lại phần dùng chung. |
| Cần scale một phần độc lập và team sở hữu trọn vòng đời | Cân nhắc service riêng | Chỉ tách sau khi hiểu dữ liệu, giao dịch và contract mạng. |

Không có ngưỡng “đủ số entity thì phải microservices”. Đo thời gian thay đổi, lỗi tích hợp, khả năng cô lập kiểm thử và chi phí vận hành.

## Bẫy phỏng vấn

**“Clean Architecture có tốt hơn Vertical Slice không?”** Cần hỏi mục tiêu: giảm coupling công nghệ hay giảm số nơi phải sửa khi đổi feature? Một sơ đồ layer không thay thế bằng chứng từ cách hệ thống thay đổi.

**“Monolith là kiến trúc xấu?”** Một đơn vị triển khai vẫn có thể có module và ownership rõ. Chi phí phân tán là quyết định riêng.

**“Tách database cho từng module ngay?”** Có thể bắt đầu cùng database với schema/ownership và quyền truy cập rõ; khi tách vật lý phải xem lại transaction và tích hợp.

## Thực hành

Với hệ thống quản lý đơn hàng của một team, viết ba lý do giữ modular monolith và một điều kiện đo được để cân nhắc tách Shipping. Không dùng “đang thịnh hành” làm tiêu chí.

Nguồn: [CA-01](sources.md#ca-01), [CA-02](sources.md#ca-02), [CA-03](sources.md#ca-03), [CA-04](sources.md#ca-04), [CA-18](sources.md#ca-18).
