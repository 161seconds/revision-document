# 02. Thiết kế ranh giới trong .NET

## Bản đồ liên kết

Tiếp nối [Dependency Rule](01-dependency-rule.md). Phần persistence được phân tích thêm ở [transaction và tích hợp](05-transactions-and-integration.md).

## Một cấu trúc tham khảo

```text
src/
  Shop.Domain/          Order, OrderStatus, quy tắc chuyển trạng thái
  Shop.Application/     CancelOrder, IOrderRepository, kết quả use case
  Shop.Infrastructure/  AppDbContext, mapping, migration, adapter repository
  Shop.Api/             endpoint, auth, request/response, composition root
tests/
  Shop.Domain.Tests/
  Shop.Application.Tests/
  Shop.Infrastructure.Tests/
  Shop.Api.Tests/
```

Đây là phương án khi cần ranh giới biên dịch rõ. Ứng dụng nhỏ có thể bắt đầu bằng một project, tổ chức theo feature và giữ cùng quy tắc phụ thuộc.

| Project | Được tham chiếu project nào? | Tránh đưa vào |
| --- | --- | --- |
| Domain | Không cần project ứng dụng khác | ASP.NET Core, EF Core, SDK bên ngoài. |
| Application | Domain | Kiểu controller, implementation repository. |
| Infrastructure | Application và Domain khi cần | Logic quyết định chính sách nghiệp vụ. |
| API | Application; Infrastructure tại composition root | SQL, transaction rải trong controller. |

API tham chiếu Infrastructure để đăng ký DI là lựa chọn thực dụng được Microsoft mô tả. Điều cần hạn chế là endpoint tự tạo adapter hoặc thao tác `DbContext` nếu đã chọn ranh giới Clean chặt cho feature đó.

## Port thuộc về nơi cần nó

Port mô tả năng lực use case cần, không cần mô phỏng toàn bộ API của ORM:

```csharp
public interface IOrderRepository
{
    Order? Get(Guid id);
    void Save(Order order);
}
```

Port trong [ví dụ chạy được](example.cs) thuộc Application vì use case sở hữu nhu cầu tải và lưu. Nếu một abstraction biểu đạt chính sách domain dùng chung, nó có thể thuộc Domain. Vị trí phải theo trách nhiệm, không theo một quy tắc “mọi interface vào Domain”.

Ví dụ dùng I/O đồng bộ trong bộ nhớ. Adapter database thực tế thường cần `Task` và `CancellationToken`; không bọc lời gọi database bất đồng bộ bằng `.Result` hoặc `.Wait()`.

## Không nhân đôi Unit of Work một cách máy móc

EF Core `DbContext` đã có change tracking và cơ chế lưu một tập thay đổi. Có ba lựa chọn thường gặp:

| Lựa chọn | Phù hợp khi | Đổi lại |
| --- | --- | --- |
| Port riêng cho use case/aggregate | Cần cô lập ORM và kiểm thử orchestration bằng fake | Phải duy trì contract của port. |
| `IApplicationDbContext` | Muốn tách implementation nhưng chấp nhận contract mang hình dạng EF | Không thể tuyên bố Application hoàn toàn độc lập EF. |
| Dùng `DbContext` trực tiếp trong slice | CRUD gọn, chủ động chấp nhận coupling | Giữ Domain độc lập; ghi rõ đây không phải ranh giới persistence chặt. |

Generic repository chỉ chuyển tiếp `Add`, `Update`, `GetAll` mà không giữ invariant hay transaction boundary thường làm code dài hơn. Không cần thêm một Unit of Work bọc ngoài chỉ để đổi tên `SaveChangesAsync`.

## Validation, authorization và lỗi

| Loại kiểm tra | Ví dụ | Trách nhiệm |
| --- | --- | --- |
| Định dạng giao thức | Body JSON sai, route ID không parse được | API. |
| Tiền điều kiện use case | ID bắt buộc, đơn không tồn tại | Application; các driver khác cũng phải được bảo vệ. |
| Invariant | Đơn Shipped không được hủy | Domain. |
| Quyền truy cập tài nguyên | Chỉ chủ đơn hoặc người có policy phù hợp được hủy | Policy tại ranh giới use case/API, áp dụng cho mọi driver. |
| Ràng buộc dữ liệu cạnh tranh | Unique key, foreign key, concurrency token | Database và Infrastructure, ánh xạ thành lỗi ứng dụng thích hợp. |

JWT parsing, cookie và claims là chi tiết adapter. Quy tắc ai được thao tác dữ liệu không nên tồn tại duy nhất trong giao diện có thể bị bỏ qua. Authentication chưa chứng minh authorization trên từng tài nguyên.

Use case không trả thành công khi adapter lưu thất bại. Chỉ chuyển lỗi đã hiểu thành kết quả nghiệp vụ; lỗi hạ tầng không dự kiến cần đi đến cơ chế xử lý/log phù hợp, không biến thành danh sách rỗng hoặc `true`.

## Thực hành

Mở [example.cs](example.cs), xác định ba namespace và hai implementation của repository. Đổi adapter thành fake báo lỗi mà không sửa Domain hoặc use case. Sau đó chỉ ra phần composition root đang nằm trong chương trình console.

Nguồn: [CA-01](sources.md#ca-01), [CA-03](sources.md#ca-03), [CA-08](sources.md#ca-08), [CA-16](sources.md#ca-16), [CA-17](sources.md#ca-17).
