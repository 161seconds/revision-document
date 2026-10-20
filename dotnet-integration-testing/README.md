# Integration testing backend .NET với tài nguyên thật

Bộ này nối kiểm thử hành vi API với dữ liệu PostgreSQL thật. Lab có lớp API, service, repository và project xUnit; `WebApplicationFactory` dựng host ASP.NET Core, Testcontainers cấp DB dùng riêng rồi thu hồi.

| Bài | Kết quả |
| --- | --- |
| [01. Chọn loại test](01-test-boundaries.md) | Biết mỗi loại test chứng minh và bỏ sót điều gì. |
| [02. Dựng host và thay cấu hình](02-webapplicationfactory.md) | Test pipeline HTTP với composition root thật. |
| [03. Database và dữ liệu cách ly](03-database-isolation.md) | Không dùng chung DB làm việc, không phụ thuộc thứ tự test. |
| [04. Concurrency, lỗi và CI](04-concurrency-and-ci.md) | Kiểm tra đường thất bại, race và báo đúng lỗi setup. |
| [05. Lab API–Service–Repository](05-lab.md) | Chạy xUnit và xác nhận dữ liệu qua connection độc lập. |

Tra nhanh: [summary.md](summary.md). Nguồn: [sources.md](sources.md).

## Chạy ngay

Cần .NET SDK 10+, Docker daemon đang chạy và mạng cho NuGet/image lần đầu. Không cần cài PostgreSQL trên máy hoặc chạy compose của bộ khác.

```powershell
rtk proxy dotnet test dotnet-integration-testing/lab/Tests/Tests.csproj --configuration Release
```

Chạy từ gốc repo. Testcontainers dùng port host được cấp tự động, password sinh cho từng fixture và DB `integration_lab` dùng riêng. Không lấy connection string từ DB của người dùng.

`WebApplicationFactory` dùng TestServer trong tiến trình; đây là integration test HTTP pipeline và PostgreSQL qua mạng, không phải browser E2E hay test reverse proxy/TLS. [Lab API contract](../api-contracts/05-lab.md) bổ sung kiểm tra HTTP qua Kestrel/TCP.
