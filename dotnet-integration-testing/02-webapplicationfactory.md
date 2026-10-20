# 02. WebApplicationFactory và cấu hình test

`WebApplicationFactory<Program>` khởi động ứng dụng trong môi trường test và cung cấp `HttpClient`. Request đi qua routing, binding, middleware và DI của host. Nó không mở socket Kestrel giống deployment production.

## Điểm nối của lab

API khai báo `public partial class Program` để project test tham chiếu entry point. `LabFactory` thay `ConnectionStrings:Lab` qua `ConfigureAppConfiguration`; không chỉnh environment variable toàn process cho từng test.

Npgsql data source được đăng ký bằng factory DI để host sở hữu lifecycle và dispose pool. Repository/service scoped giữ ranh giới request. Project test tham chiếu API bằng `ProjectReference`, không copy code API sang test.

Một app lớn có thêm cache, queue và provider: thay đúng dependency bên ngoài khi cần, giữ pipeline đang muốn kiểm tra. Gỡ toàn bộ auth middleware để test được endpoint rồi gọi đó là “auth integration test” là kết luận sai.

## Authentication trong test thật

Test handler giả phù hợp để test policy/resource authorization của app với danh tính kiểm soát được. Nó không kiểm tra chữ ký token, expiry, issuer, audience hoặc cookie của hệ thống thật. Với các yêu cầu đó, thêm test của scheme thật và key riêng cho test.

Giữ `AllowAutoRedirect = false` khi cần nhìn thấy `401`, `403` hoặc redirect gốc. Đừng để client tự theo redirect rồi assert trang login `200` như thể API đã thành công.

## Lifecycle và cleanup

DB phải sẵn sàng trước khi host nhận request. Dispose `HttpClient`, host, rồi container sau khi test xong. Nếu fixture khởi tạo thất bại, không báo test “skip đạt”; đó là lỗi môi trường cần hiển thị.

Lab không có xác thực và chỉ phục vụ dữ liệu thử trong fixture. Muốn chạy API độc lập phải cấu hình DB riêng; không public endpoint mẫu này như một sản phẩm đã hoàn thiện.
