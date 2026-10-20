# 06. Kiểm thử và thực thi ranh giới kiến trúc

## Bản đồ liên kết

Đọc sau [transaction và tích hợp](05-transactions-and-integration.md). Kiến thức test nền tảng ở [Testing và TDD](../dotnet/csharp-from-zero-to-hero/04-testing-and-tdd/README.md).

## Mỗi lớp test chứng minh một điều khác nhau

| Mức kiểm thử | Ví dụ cần chứng minh | Không chứng minh được |
| --- | --- | --- |
| Domain unit test | Shipped không thể chuyển thành Cancelled | Query SQL hoặc transaction đúng. |
| Application test với fake | Tải đúng đối tượng, gọi nghiệp vụ, không nuốt lỗi lưu | Database thật thực thi cùng semantics với fake. |
| Infrastructure integration test | Mapping, unique key, transaction, concurrency, query provider | Endpoint và quyền truy cập đúng. |
| API integration test | Route, status, envelope, auth và serialization | Toàn bộ thao tác trình duyệt hoạt động. |
| Architecture test | Không có dependency bị cấm giữa assembly/module | Thuật toán và nghiệp vụ đúng. |
| E2E | Hành trình người dùng xuyên qua các thành phần | Mọi edge case hoặc race đều được phủ. |

Build thành công không đồng nghĩa graph phụ thuộc đúng ý định. HTTP 200 không đồng nghĩa nghiệp vụ, phân quyền và side effect đã đúng.

## Ví dụ tự kiểm tra

Chạy [example.cs](example.cs) từ gốc repo:

```powershell
rtk proxy dotnet run --file clean-architecture/example.cs
```

| Tình huống | Điều được kiểm tra |
| --- | --- |
| Pending được hủy | Kết quả và dữ liệu adapter trở thành Cancelled; bản cũ giữ nguyên. |
| Hủy lại | Đối tượng Cancelled được giữ nguyên. |
| Shipped | Báo lỗi, không lưu trạng thái hủy. |
| ID không tồn tại | Báo lỗi thay vì tạo hoặc giả vờ thành công. |
| ID rỗng qua use case | Tiền điều kiện được kiểm tra ngoài Domain. |
| ID rỗng khi tạo entity | Không tạo domain object thiếu danh tính. |
| Giá trị enum không hợp lệ | Không tạo entity với trạng thái ngoài mô hình. |
| Adapter lưu thất bại | Lỗi đi ra và đối tượng cũ không bị sửa. |

Đây là 8 self-check có thể chạy bằng SDK, không phải bộ `dotnet test` hay integration test với database. Chúng giúp đọc ví dụ mà không cần thêm test framework hoặc project.

## Enforce dependency ở cấp project

Với solution nhiều project, `.csproj` phải thể hiện đúng graph đã chọn:

```powershell
dotnet list src/Shop.Domain/Shop.Domain.csproj reference
dotnet list src/Shop.Application/Shop.Application.csproj reference
```

Các đường dẫn trên minh họa cho một ứng dụng tên Shop, không phải project có sẵn trong kho tài liệu này. Kiểm tra cả package reference và dependency gián tiếp; chỉ tìm câu `using Infrastructure` không bắt được mọi vi phạm.

Khi graph đơn giản, kiểm tra project reference trong CI có thể đủ. Khi có nhiều module hoặc nhiều quy tắc, cân nhắc architecture test bằng công cụ đã có, chẳng hạn ArchUnitNET hoặc NetArchTest. Không thêm package chỉ để kiểm tra một quan hệ có thể nhìn rõ trong project file.

Ví dụ một quy tắc có ý nghĩa: type thuộc Domain không phụ thuộc ASP.NET Core hoặc EF Core. Quy tắc “mọi class kết thúc bằng Service” không tự bảo vệ nghiệp vụ.

## Test database bằng provider thực tế

Provider giả lập hoặc SQLite không thay thế được việc kiểm thử hành vi riêng PostgreSQL/SQL Server: kiểu dữ liệu, collation, isolation, locking, generated column và lỗi constraint có thể khác.

Nếu chạy database test bằng container, phải xác nhận container thực sự khởi động và test dùng connection đó. Thiếu Docker hoặc database thì ghi rõ chưa chạy; không tính test bị skip là đã đạt.

Test concurrency nên điều khiển được lịch đọc/ghi bằng barrier hoặc tín hiệu gắn với thao tác thực tế. Chỉ thêm `Sleep` không bảo đảm hai transaction đã đọc cùng trạng thái trước khi cạnh tranh.

## Tự kiểm tra

Một fake lưu dữ liệu bằng `Dictionary` vượt qua mọi unit test. Có thể kết luận transaction của EF Core đúng không? **Không.** Cần integration test thật với provider, schema, transaction và tình huống lỗi liên quan.

Nguồn: [CA-01](sources.md#ca-01), [CA-02](sources.md#ca-02), [CA-09](sources.md#ca-09), [CA-14](sources.md#ca-14), [CA-18](sources.md#ca-18).
