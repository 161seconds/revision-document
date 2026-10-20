# Tra nhanh: Integration testing .NET

| Việc | Quy tắc |
| --- | --- |
| API test | Giữ routing/middleware/DI thật, thay đúng dependency bên ngoài. |
| DB semantics | Dùng cùng DB engine/major khi hành vi phụ thuộc provider. |
| Dữ liệu | Reset trước từng test; biết rõ collection và parallelism. |
| Xác nhận commit | Đọc bằng connection độc lập, không chỉ entity tracked. |
| Rollback | Transaction của test không tự bao trùm request HTTP. |
| Race | Task chạy đồng thời chưa chứng minh lịch snapshot; cần tín hiệu đúng điểm. |
| Auth | Test identity giả không kiểm chứng signature/token scheme thật. |
| Kết luận | WAF không phải browser/TLS; local PASS không phải CI PASS. |

Lệnh: `dotnet test dotnet-integration-testing/lab/Tests/Tests.csproj --configuration Release`.
