# 08. Bài tập và case study: Cancel Order

## Bản đồ liên kết

Dùng [cheat sheet](summary.md) để tra nhanh; đọc [nguồn và repo mẫu](sources.md) khi cần đối chiếu. Đáp án bên dưới là hướng phân tích, không thay thế test trên hệ thống thật.

## Case study

Một ứng dụng cho phép hủy đơn Pending. Đơn Shipped không được hủy. Hủy lại đơn Cancelled phải có hành vi xác định. HTTP và worker đều gọi được nghiệp vụ này; lỗi lưu không được trả thành công.

Ví dụ [example.cs](example.cs) chọn giữ nguyên đối tượng khi hủy lại và dùng entity bất biến. Nó không triển khai HTTP, authorization, database hoặc refund.

```powershell
rtk proxy dotnet run --file clean-architecture/example.cs
```

## Bài 1: đặt trách nhiệm

Phân loại tám việc sau: parse ID từ route, xác định người gọi có quyền, kiểm tra Shipped, tải đơn, ghi SQL, chọn status HTTP, đăng ký adapter, điều phối tải–hủy–lưu.

<details>
<summary>Đáp án và tiêu chí đạt</summary>

- API: parse dữ liệu giao thức và biểu diễn HTTP.
- Policy tại ranh giới use case/API: quyền với tài nguyên, áp dụng nhất quán cho các driver.
- Domain: invariant Shipped không được hủy.
- Infrastructure: tải/lưu bằng SQL theo port.
- Application: điều phối use case qua port.
- Composition root: đăng ký adapter.

Đạt khi worker không thể bỏ qua invariant và không cần tạo `HttpContext` để chạy nghiệp vụ.

</details>

## Bài 2: tìm dependency bị lộ

Port trả `IQueryable<Order>`; handler gọi `.Include(...)` rồi trả entity cho controller serialize. Ranh giới persistence và response công khai có rủi ro gì?

<details>
<summary>Đáp án và tiêu chí đạt</summary>

Query provider, thời điểm thực thi, tracking và lifetime có thể rò qua port. Entity có thể làm lộ trường nội bộ hoặc graph ngoài hợp đồng API. Chọn phương án rõ ràng: port trả dữ liệu theo use case, query projection riêng, hoặc chấp nhận EF coupling trong slice và ghi lại quyết định.

Đạt khi giải thích được trade-off; không bắt buộc tạo repository cho từng bảng.

</details>

## Bài 3: thiết kế kiểm thử conflict

Hai request cùng đọc Pending. Một request ship đơn, request còn lại hủy. Viết lịch chạy và điều kiện để test bắt được lost update.

<details>
<summary>Đáp án và tiêu chí đạt</summary>

Hai transaction phải đọc cùng version trước khi cho một transaction ghi và commit. Transaction còn lại thử cập nhật theo version cũ, phải nhận conflict hoặc kết quả nghiệp vụ phù hợp khi đọc lại. Trạng thái cuối không được bị bản cũ ghi đè.

Đạt khi test điều khiển được thời điểm đọc/ghi và dùng provider thật; `Task.Delay` đơn thuần chưa đủ.

</details>

## Bài 4: phát hiện cửa sổ mất thông báo

Đơn đã commit Cancelled. Tiến trình chết trước lời gọi gửi email. Thiết kế nào lưu được ý định gửi, và tình huống phát lặp nào vẫn còn?

<details>
<summary>Đáp án và tiêu chí đạt</summary>

Lưu bản ghi outbox cùng transaction nghiệp vụ. Relay xử lý sau commit. Relay vẫn có thể chết sau khi gửi nhưng trước khi đánh dấu thành công; receiver/consumer cần idempotency hoặc provider hỗ trợ cơ chế chống gửi lặp thích hợp.

Đạt khi không hứa exactly-once bằng bảng outbox và chỉ ra cách theo dõi message lỗi.

</details>

## Bài 5: bỏ bớt abstraction

Một ứng dụng có hai endpoint CRUD, chưa có invariant chung. Template đưa vào generic repository, unit of work, service base, mediator và event bus. Chọn phần giữ lại và điều kiện để bổ sung từng phần sau này.

<details>
<summary>Đáp án và tiêu chí đạt</summary>

Có thể bắt đầu bằng handler/endpoint rõ, validation, `DbContext` và integration test. Chỉ thêm port khi cần cô lập I/O hoặc một contract riêng; mediator khi dispatch/pipeline đem lại lợi ích; outbox khi cần bảo đảm ý định tích hợp sau commit. Không bỏ bảo mật, transaction hoặc xử lý lỗi dữ liệu để làm code ngắn.

Đạt khi mỗi abstraction có một vấn đề cụ thể cần giải quyết.

</details>

## Đọc repo thực tế theo một use case

Chọn một trong [ba repo mẫu](sources.md#repo-mẫu), dùng đúng snapshot được ghi nguồn. Theo dấu từ entry point đến use case, domain behavior, persistence và test. Ghi lại:

1. File nào giữ invariant? File nào quyết định transaction commit?
2. Port thuộc layer nào, có lộ kiểu ORM không?
3. Query đọc dùng aggregate hay projection riêng?
4. Test nào dùng database thật, test nào dùng fake?
5. Dependency nào được chấp nhận vì composition root hoặc trade-off có chủ đích?

Không đánh giá template bằng số package hoặc áp dụng nguyên xi công nghệ của nó. Mỗi repo là một thiết kế tham khảo có giả định riêng.

Nguồn: [CA-01](sources.md#ca-01), [CA-09](sources.md#ca-09), [CA-10](sources.md#ca-10), [CA-16](sources.md#ca-16), [CA-17](sources.md#ca-17), [CA-18](sources.md#ca-18).
