# 05. Lab API–Service–Repository và xUnit

## Chạy bộ test

```powershell
rtk proxy dotnet test dotnet-integration-testing/lab/Tests/Tests.csproj --configuration Release
```

Testcontainers tự dựng PostgreSQL 18, tạo schema tối thiểu, cấp cấu hình cho host và dọn container khi fixture kết thúc. Không cần chạy compose của bộ concurrency.

| File | Trách nhiệm |
| --- | --- |
| [Program.cs](lab/Api/Program.cs) | Routing, input boundary, status và Problem Details. |
| [OrderService.cs](lab/Api/OrderService.cs) | Use case và phân loại kết quả nghiệp vụ. |
| [OrderRepository.cs](lab/Api/OrderRepository.cs) | SQL có parameter, constraint và conditional UPDATE. |
| [DatabaseFixture.cs](lab/Tests/DatabaseFixture.cs) | Container, host config, schema và lifecycle. |
| [OrderTests.cs](lab/Tests/OrderTests.cs) | Request thật qua pipeline và assertion DB độc lập. |

## Chín bảo đảm được kiểm tra

1. Create trả `201`, `Location` đúng ID và hàng được lưu `pending`.
2. GET không tồn tại trả `404` với Problem Details.
3. ID rỗng trả `400` và không insert.
4. ID trùng trả `409`, không tạo thêm hàng.
5. Cancel lần đầu `204`, lần sau `409`, dữ liệu cuối không đổi sai.
6. Hai request cancel có đúng một winner trong lịch chạy đã thực hiện.
7. INSERT rollback không hiện ra qua GET hoặc connection khác.
8. Đơn `shipped` không thể bị cancel.
9. Reset fixture cho mỗi test bắt đầu với DB trống.

Các HTTP response và connection được dispose. Chỉ map unique violation của constraint `pk_orders` thành conflict đã định nghĩa; không biến mọi lỗi DB thành `409`.

## Bài tập

Bằng chứng ngày 2026-10-20: test `Post_creates_persisted_order` đã RED với `Expected: pending`, `Actual: null` khi endpoint chỉ trả thành công mà chưa INSERT. Sau triển khai service/repository, lệnh Release đạt **9/9 test, 0 skipped** trên PostgreSQL Testcontainers. Kết quả local không phải kết quả GitHub Actions.

- Bỏ điều kiện `status='pending'` trong UPDATE: test cancel lặp hoặc shipped phải bắt lỗi.
- Xóa INSERT nhưng vẫn trả `201`: test kiểm tra DB phải thất bại.
- Thêm audit/outbox rồi gây lỗi trước commit: viết integration test kiểm tra mọi bảng rollback cùng nhau.
- Thêm class test chạy song song: trước tiên đổi chiến lược dữ liệu cách ly, không chỉ tắt assertion.

Lab cố ý không có auth, provider, EF Core hay migration runner. Không có kết quả benchmark hoặc tuyên bố coverage phần trăm. Khi đưa vào ứng dụng thật, thay schema fixture bằng migration và thêm các ranh giới còn thiếu.
