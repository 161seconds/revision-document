# Nguồn API contract

Kiểm tra ngày **2026-10-20**. Ví dụ là tổng hợp tiếng Việt; các quy tắc RFC và framework xem ở nguồn gốc.

- [Microsoft: Web API design](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design): resource, HTTP, pagination và versioning.
- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html): semantics, safe/idempotent method, status và conditional requests.
- [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html): Problem Details; thay thế RFC 7807.
- [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html): cấu trúc spec và schema.
- [ASP.NET Core error handling](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling?view=aspnetcore-10.0): `AddProblemDetails`, exception handler và các giới hạn cấu hình.
- [EF Core pagination](https://learn.microsoft.com/en-us/ef/core/querying/pagination): offset, keyset và fully unique ordering.
- [OWASP REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html): validation, access control và thông tin lỗi.

Không có tool diff OpenAPI nào được cài cho lab. Passing self-check không phải tuyên bố toàn bộ API đạt RFC hoặc an toàn để public.
