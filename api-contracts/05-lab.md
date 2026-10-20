# 05. Lab: kiểm tra API contract bằng HTTP thật

## Chuẩn bị

Cần .NET SDK 10+. Lab gồm [Api.csproj](lab/Api.csproj) và [Program.cs](lab/Program.cs), dùng ASP.NET Core có sẵn trong SDK, không thêm package.

```powershell
rtk proxy dotnet run --project api-contracts/lab -- --self-test
```

Self-check khởi động Kestrel tại loopback với cổng tự cấp, gọi API bằng `HttpClient`, sau đó dừng server kể cả khi assertion thất bại. Assertion ném exception nên vẫn hoạt động trong Release.

```powershell
rtk proxy dotnet run --project api-contracts/lab --configuration Release -- --self-test
```

## Thử thủ công

Terminal thứ nhất:

```powershell
rtk proxy dotnet run --project api-contracts/lab -- --urls http://127.0.0.1:5088
```

Terminal thứ hai:

```powershell
rtk proxy curl.exe -i "http://127.0.0.1:5088/api/v1/orders?limit=2"
rtk proxy curl.exe -i "http://127.0.0.1:5088/api/v1/orders?limit=2&after=2"
rtk proxy curl.exe -i "http://127.0.0.1:5088/api/v1/orders?limit=0"
```

Trang đầu có ID 1, 2 và `nextCursor: 2`. Trang tiếp có 3, 4. `limit=0` trả `400` với `application/problem+json`. Nếu cổng bận, đổi port ở cả hai terminal.

## Bộ check chứng minh gì?

- Status `200`, schema trường chính, thứ tự ID, cursor không lặp trên dataset cố định.
- Trang cuối và trang rỗng có cursor null; filter status hoạt động trước pagination.
- Limit ngoài khoảng, chuỗi không phải số, input rỗng, số vượt `Int32`, cursor âm, enum lạ và query lặp bị từ chối.
- Lỗi query có HTTP status, media type, `type` và `status` trong body đúng contract.

Lab không có OpenAPI generator hoặc compatibility engine. Nó không chứng minh auth, persistence, dữ liệu thay đổi giữa các trang, hoặc response tương thích với mọi client.

## Bằng chứng của snapshot

Ngày 2026-10-20: chạy baseline endpoint chưa có pagination, self-check thất bại đúng tại `First page must contain IDs 1 and 2`. Sau triển khai, lệnh Release ở trên đạt **21 HTTP contract checks**. Không đo coverage phần trăm; đây là kiểm tra hành vi của lab, không phải production test suite.

## Bài tập có thể kiểm chứng

1. Trong worktree lab, đổi `nextCursor` thành `cursor`: check phải lỗi thay vì âm thầm đạt.
2. Bỏ tie-breaker của một dataset có thời gian trùng: viết thêm test cho thứ tự, giải thích vì sao lab hiện tại chưa bắt được case đó.
3. Thêm response field `totalCount`: định nghĩa nó là tổng trước hay sau filter, không dùng “total” mơ hồ.
4. Đổi `status=shipped` thành enum số: liệt kê client cần migration và cách giữ contract cũ.
