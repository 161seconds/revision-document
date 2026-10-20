# 04. DDD, CQRS và tổ chức theo use case

## Bản đồ liên kết

Đọc cùng [so sánh kiến trúc](03-comparing-architectures.md). Kiến thức nền về messaging có ở [Event Sourcing và CQRS](../system-design/04-messaging-and-event-driven/04-event-sourcing-cqrs-and-backpressure.md); bài này làm rõ chúng không bắt buộc đi cùng nhau.

## DDD bắt đầu từ ngôn ngữ nghiệp vụ

Domain-Driven Design không bắt đầu bằng một lớp `BaseEntity`. Trước hết phải thống nhất các thuật ngữ và ranh giới mà mô hình có nghĩa.

| Khái niệm | Ví dụ | Câu hỏi cần trả lời |
| --- | --- | --- |
| Ubiquitous language | “Hủy đơn”, “đã giao”, “hoàn tiền” | Người làm nghiệp vụ và code có dùng cùng nghĩa không? |
| Bounded context | Ordering, Shipping, Billing | Trong phạm vi nào mô hình và thuật ngữ này nhất quán? |
| Entity | Một đơn hàng có danh tính riêng | Đối tượng nào vẫn là chính nó khi thuộc tính thay đổi? |
| Value object | Địa chỉ giao hàng hoặc giá trị tiền tệ | Các thuộc tính nào cùng tạo một giá trị và invariant? |
| Aggregate | Order và các thành phần cần nhất quán cùng nó | Những quy tắc nào phải đúng trong một lần thay đổi? |
| Domain service | Policy không thuộc tự nhiên vào một entity | Có quy tắc nghiệp vụ thực sự, hay chỉ đang điều phối I/O? |

`Customer` trong Billing có thể mang nghĩa khác `Customer` trong Support. Không buộc tất cả context dùng một entity dùng chung; ánh xạ qua contract phù hợp.

Bounded context không bắt buộc là một microservice. Có thể triển khai nhiều context thành các module trong monolith.

## Aggregate không phải toàn bộ graph ORM

Aggregate xác định ranh giới bảo vệ invariant. Một navigation property không chứng minh hai đối tượng phải nằm chung aggregate.

Ví dụ: trạng thái đơn và quy tắc hủy có thể thuộc Order. Việc hoàn tiền qua ngân hàng thuộc một luồng tích hợp khác, có thời gian và lỗi riêng. Đừng làm Order giữ connection HTTP hoặc gọi payment gateway.

Trong [example.cs](example.cs), `Order.Cancel()` giữ quy tắc trạng thái. `CancelOrder.Execute()` điều phối tải, gọi hành vi và lưu. Đây là phạm vi mô hình nhỏ, không phải thiết kế hoàn chỉnh cho thương mại điện tử.

## CQRS có thể rất nhỏ

CQRS tách trách nhiệm/mô hình xử lý ghi và đọc. Nó không bắt buộc hai database, broker, Event Sourcing hoặc MediatR.

```text
Command: CancelOrder(id) thực thi quy tắc rồi ghi thay đổi.
Query: GetOrder(id) chiếu dữ liệu thành kết quả đọc.
Hai đường có thể dùng cùng một database.
```

Khi tách read store riêng, độ trễ đồng bộ trở thành vấn đề cần xử lý. Giao diện phải biết cách hiển thị thao tác đã được nhận nhưng projection chưa cập nhật; không mặc định dữ liệu đọc luôn mới ngay sau command.

| Thuật ngữ | Vai trò | Không suy ra |
| --- | --- | --- |
| CQRS | Tách command và query | Hai database hoặc broker. |
| MediatR | Dispatch request đến handler trong ứng dụng | Ranh giới module, durable delivery hoặc Clean Architecture. |
| Domain event | Sự kiện có ý nghĩa trong domain | Đã được publish ra ngoài hay đã commit. |
| Integration event | Contract truyền qua ranh giới hệ thống/module | Là entity nội bộ hoặc được giao đúng một lần. |
| Event Sourcing | Lưu lịch sử sự kiện làm nguồn tái tạo trạng thái | Bắt buộc để dùng CQRS. |

Fowler cảnh báo CQRS có thể thêm rủi ro và độ phức tạp không đáng có. Chọn nó khi khác biệt giữa mô hình đọc và ghi tạo giá trị đủ rõ.

## Vertical Slice giữ thay đổi gần nhau

Một slice có thể chứa request, validation, handler, mapping và test cho `CancelOrder`. Chia sẻ Domain khi invariant thực sự dùng chung; không tạo `CommonService` chứa mọi nghiệp vụ để tránh trùng vài dòng.

Query chỉ phục vụ hiển thị thường không cần tải toàn bộ aggregate rồi gọi repository tổng quát. Có thể tạo query adapter chuyên dụng trả projection, với contract và quyền truy cập rõ.

## Tự kiểm tra

1. Tách `CreateOrder` và `GetOrder`, dùng một PostgreSQL: **có thể là CQRS; không cần read database riêng.**
2. Gọi `Publish()` trong memory sau `SaveChanges`: **không chứng minh integration event được giao bền vững.**
3. Hai module dùng cùng ID khách hàng: **không buộc chia sẻ toàn bộ entity Customer.**
4. CRUD catalog nhỏ: **có thể giữ cách xử lý đơn giản; DDD tactical pattern cần lợi ích cụ thể.**

Nguồn: [CA-04](sources.md#ca-04), [CA-05](sources.md#ca-05), [CA-06](sources.md#ca-06), [CA-07](sources.md#ca-07), [CA-15](sources.md#ca-15).
