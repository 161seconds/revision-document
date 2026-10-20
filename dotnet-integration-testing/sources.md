# Nguồn integration testing .NET

Kiểm tra ngày **2026-10-20**. Package được pin trong project lab, không phải yêu cầu nâng dependency của repo khác.

- [ASP.NET Core integration tests](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0): `WebApplicationFactory`, TestServer và cấu hình host.
- [Microsoft .NET testing](https://learn.microsoft.com/en-us/dotnet/core/testing/): test platform, runner và lệnh.
- [Testcontainers PostgreSQL module](https://dotnet.testcontainers.org/modules/postgres/): builder, connection string và container lifecycle.
- [Testcontainers test best practices](https://dotnet.testcontainers.org/test_frameworks/xunit_net/): fixture với xUnit; phân biệt API xUnit v2/v3 khi áp dụng.
- [xUnit shared context](https://xunit.net/docs/shared-context): class fixture, collection và lifecycle.
- [xUnit parallelism](https://xunit.net/docs/running-tests-in-parallel): collection và chạy song song.
- [Npgsql basic usage](https://www.npgsql.org/doc/basic-usage.html): data source, parameter, transaction và disposal.
- [EF Core choosing a testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy): giới hạn fake/provider thay thế.

Lab dùng xUnit **2.9.3** và `IAsyncLifetime` trả `Task`. Không chép nguyên lifecycle signature từ ví dụ xUnit v3 nếu chưa đổi framework.
