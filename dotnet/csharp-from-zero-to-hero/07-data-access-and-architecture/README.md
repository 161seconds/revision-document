# Chapter 7: Data Access, Enterprise Architecture & Web API

> **Mục tiêu chương:** Chuyển dịch từ lập trình ứng dụng Console đơn lẻ sang kiến trúc phần mềm doanh nghiệp (Enterprise Software Architecture). Làm chủ ORM Entity Framework Core theo trường phái Code-First, cơ chế quản lý giao dịch Repository & Unit of Work, lập trình bất đồng bộ Task-based Asynchronous Pattern (TAP), xây dựng RESTful Web API và bảo mật ứng dụng.

---

## 📑 Danh Mục Bài Học

| Bài | Tên bài học | Tệp tài liệu | Nhánh Git tham chiếu | Trọng tâm kiến thức |
| :---: | :--- | :--- | :--- | :--- |
| **01** | EF Core Code-First & Migrations | [01-ef-core-code-first-and-migrations.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/07-data-access-and-architecture/01-ef-core-code-first-and-migrations.md) | `Chapter7/Lesson/EF-Code-First` | `DbContext`, `DbSet<T>`, Fluent API vs Data Annotations, Migrations, Tracking vs AsNoTracking |
| **02** | Repository Pattern & Unit of Work | [02-repository-and-unit-of-work.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/07-data-access-and-architecture/02-repository-and-unit-of-work.md) | `Chapter5/Lesson/DIP` | Trừu tượng hóa truy cập CSDL, Quản lý giao dịch ACID nguyên tử với `IUnitOfWork` |
| **03** | Lập Trình Bất Đồng Bộ `async` / `await` | [03-async-await-concurrency.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/07-data-access-and-architecture/03-async-await-concurrency.md) | `dotnet/05-async-memory-and-advanced` | `Task`, `ValueTask`, `CancellationToken`, Tránh Deadlock với `.Result` / `.Wait()`, `IAsyncEnumerable` |
| **04** | Web API RESTful & Bảo Mật Thực Chiến | [04-web-api-and-security.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/07-data-access-and-architecture/04-web-api-and-security.md) | `Chapter10/Web-Api`, `Chapter11/Security` | Controllers vs Minimal APIs, DI Lifetimes, JWT Authentication, Hashing mật khẩu (Argon2/BCrypt) |
