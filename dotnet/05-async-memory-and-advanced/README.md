# Module 05: Asynchronous Programming, CLR Memory & Advanced C#

Chào mừng bạn đến với **Module 05** - chuyên đề nâng cao về **Lập trình Bất đồng bộ (TAP)**, **Kiến trúc Quản lý Bộ nhớ CLR & Garbage Collection**, **Dependency Injection Lifetimes**, và **Reflection & Custom Attributes** trong .NET hiện đại.

---

## Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**:
  - [Module 01: C# Fundamentals](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/README.md) (Value vs Reference Types, Memory Stack/Heap).
  - [Module 02: OOP & Type System](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/README.md) (Classes, Structs, Interfaces).
  - [Module 03: Generics & Collections](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/README.md) (`IDisposable`, Exception Handling, Delegates).
- **Trực thuộc**: [Master C# / .NET Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md).
- **Ứng dụng kế tiếp**: ASP.NET Core Web API, Entity Framework Core, Microservices High-Performance Architecture.

---

## Danh Mục Bài Học Chi Tiết

| Bài học | Trọng tâm kiến thức |
| :--- | :--- |
| **[01. Asynchronous Programming (TAP)](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/01-asynchronous-programming-tap.md)** | `async`/`await`, compiler state machine, `Task` vs `ValueTask`, `Task.WhenAll`, `CancellationToken`, `ConfigureAwait(false)`. |
| **[02. CLR Memory & Garbage Collection](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/02-clr-memory-and-garbage-collection.md)** | Quản lý bộ nhớ CLR, Thế hệ GC (Gen 0, 1, 2), SOH vs LOH vs POH, `IDisposable` pattern chuẩn mực, `GC.SuppressFinalize`. |
| **[03. Dependency Injection & Service Lifetimes](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/03-dependency-injection-and-configuration.md)** | Inversion of Control, Service Lifetimes (Transient, Scoped, Singleton), Bẫy Captive Dependency, `IServiceScopeFactory`. |
| **[04. Reflection & Attributes](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/04-reflection-and-attributes.md)** | Kiểm tra metadata thời gian chạy, `Type`, Custom Attributes, Dynamic Validation Engine, Source Generators vs Reflection. |

---

## Thực Hành & Kiểm Thử
1. **File demo tổng hợp**: [AdvancedDemo.cs](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/AdvancedDemo.cs)
   - Chạy kiểm tra: `rtk dotnet run --file dotnet/05-async-memory-and-advanced/AdvancedDemo.cs`
2. **Bộ thử thách tự chấm điểm**: [Practice.cs](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/Practice.cs)
   - Chạy test suite: `rtk dotnet run --file dotnet/05-async-memory-and-advanced/Practice.cs`
   - Vượt qua 5 thử thách khắt khe: TAP Concurrent Pipeline, ValueTask Zero-Allocation Cache, Standard Dispose Pattern, DI Container Lifetime Resolution, Custom Attribute Validation Engine.
