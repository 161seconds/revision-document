# .NET & C# Revision Guide

Lộ trình và kho tài liệu ôn tập .NET Platform toàn diện từ cú pháp C# hiện đại, hệ thống kiểu CTS, phân bổ bộ nhớ Stack/Heap, Lập trình hướng đối tượng OOP, Generics & Collections, Delegates & Events, LINQ toàn tập, Lập trình bất đồng bộ Task-based Asynchronous Pattern (TAP), kiến trúc bộ nhớ CLR & Garbage Collection đến Entity Framework Core & Dependency Injection.

---

## Danh Mục Các Module Học Tập

| Thư mục / Tài liệu | Nội dung trọng tâm | Trạng thái |
| :--- | :--- | :--- |
| **[summary.md](file:///d:/my-project/revision-document/dotnet/summary.md)** | **Bảng tóm tắt toàn diện (Master C# / .NET Cheat Sheet)** bao quát toàn bộ cú pháp C#, Memory Layout, Pattern Matching, LINQ, Async/Await, GC & DI | Hoàn thành |
| **[01-csharp-fundamentals/](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/README.md)** | Cú pháp C# hiện đại, Kiểu CTS, Value Types vs Reference Types, Nullable (`?`), Toán tử, Pattern Matching (`switch` expression), `ref`/`out`/`in`/`params`, Mảng & `Span<T>` | Sẵn sàng |
| **[02-oop-and-type-system/](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/README.md)** | Classes & Primary Constructors, Kế thừa (`virtual`/`override`/`sealed`), `interface` & Default Methods, `struct` vs `record class` vs `record struct`, Biểu thức `with` | Sẵn sàng |
| **[03-generics-and-collections/](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/README.md)** | Generics & Ràng buộc (`where T : ...`), Collections (`List`, `Dictionary`, `HashSet`), `yield return`, Delegates (`Action`, `Func`), Events, Xử lý ngoại lệ & `IDisposable` | Sẵn sàng |
| **[04-linq-and-functional/](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/README.md)** | LINQ Method vs Query Syntax, Thực thi trễ (Deferred Execution), Lọc & Chiếu (`Where`, `Select`, `SelectMany`), Gom nhóm & Sắp xếp, Phép toán tập hợp & Joins | Sẵn sàng |
| **[05-async-memory-and-advanced/](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/README.md)** | `async`/`await` & `Task`/`ValueTask`, `CancellationToken`, Kiến trúc CLR & Garbage Collection (Gen 0/1/2, LOH), Dependency Injection Lifetimes, Reflection & Attributes | Sẵn sàng |
| **[csharp-from-zero-to-hero/](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/README.md)** | **Toàn bộ giáo trình C# Từ Zero Đến Hero (Bootcamp Almantas Karpavicius)**: 8 Module từ Căn bản, OOP, Intermediate, TDD/Testing, SOLID, Design Patterns, EF Core đến Phỏng vấn | Hoàn thành |

---

## Chuẩn Cấu Trúc Của Từng Thư Mục Con

Mỗi module trong hệ thống ôn tập bao gồm:
1. `README.md`: Lộ trình chi tiết + **Bản đồ liên kết bài học (Knowledge Links)** + Bẫy phỏng vấn.
2. Các bài học lý thuyết `.md`: Tuân thủ 5 mục chuẩn (Bản đồ liên kết, Bản chất hoạt động, Bẫy kinh điển, Code thực hành, Câu hỏi phỏng vấn tự kiểm tra).
3. Các file demo `.cs`: Code mẫu thực nghiệm chuẩn xác, chạy trực tiếp trên .NET 10 qua `dotnet run --file <path>`.
4. `Practice.cs`: Bộ câu hỏi và thử thách tự động chấm điểm với 100% assertions tự động chấm qua `System.Diagnostics.Debug.Assert`.

---

## Bản Đồ Liên Kết
- **Tiên quyết:** Lập trình hướng đối tượng (OOP), Nền tảng tư duy lập trình.
- **Liên quan:** [Database & SQL](file:///d:/my-project/revision-document/database/), [Java Revision Guide](file:///d:/my-project/revision-document/java/) (so sánh CLR vs JVM).
