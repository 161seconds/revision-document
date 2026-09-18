# 03. Dependency Injection & Service Lifetimes

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 02: Interfaces & Dependency Inversion Principle](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/03-interfaces-and-abstract-classes.md).
- **Module hiện tại**: [Module 05: Asynchronous Programming, Memory & Advanced](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/README.md).
- **Trực thuộc**: [Master C# / .NET Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md).
- **Kế tiếp**: [04. Reflection & Attributes](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/04-reflection-and-attributes.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Ba Vòng Đời Dịch Vụ (Service Lifetimes)
Hệ thống DI nguyên bản của .NET (`Microsoft.Extensions.DependencyInjection`) quản lý vòng đời object qua 3 chế độ:

| Lifetime | Thời điểm tạo mới | Phạm vi tồn tại (Scope) | Trường hợp sử dụng điển hình |
| :--- | :--- | :--- | :--- |
| **`Transient`** | **Mỗi lần Resolve** | Độc lập hoàn toàn, dùng xong bỏ | Lightweight, stateless services, processors |
| **`Scoped`** | **1 lần duy nhất trong 1 Scope** | Tồn tại suốt vòng đời 1 HTTP Request hoặc 1 Scope thủ công | `DbContext`, Unit of Work, Current User State |
| **`Singleton`** | **1 lần duy nhất khi gọi đầu tiên** | Tồn tại suốt toàn bộ vòng đời ứng dụng | Memory Cache, Logging, Configuration, HTTP Client Factory |

### 2.2 Quản Lý Giải Phóng Tài Nguyên (Disposal) bởi Container
- Bất kỳ service nào được đăng ký vào DI Container có triển khai `IDisposable` hoặc `IAsyncDisposable` sẽ được **Container tự động gọi `Dispose()`** khi Scope tương ứng kết thúc:
  - `Scoped`: Được giải phóng ngay khi Scope đóng (`scope.Dispose()`).
  - `Singleton`: Được giải phóng khi Root Container đóng (ứng dụng tắt).
  - `Transient`: Nếu resolve từ Scope, giải phóng theo Scope. **Cực kỳ nguy hiểm nếu resolve Transient từ Root Container vì nó sẽ nằm trên Heap mãi mãi đến khi app tắt!**

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy Tử Huyệt: Captive Dependency (Phụ thuộc bị giam cầm)**
> Xảy ra khi một dịch vụ có vòng đời dài hơn (vd: **`Singleton`**) tiêm trực tiếp một dịch vụ có vòng đời ngắn hơn (vd: **`Scoped`** như `DbContext`).
> - **Hậu quả**: Đối tượng `Scoped` bị găm vào Singleton, không bao giờ được giải phóng sau mỗi HTTP Request.
> - **Nguy cơ**: Gây xung đột luồng (Multi-threading concurrency violation trên DbContext) và rò rỉ bộ nhớ nghiêm trọng.

> [!TIP]
> **Giải pháp chuẩn hóa cho Captive Dependency: `IServiceScopeFactory`**
> Trong Singleton, không tiêm trực tiếp Scoped Service. Hãy tiêm `IServiceScopeFactory`, sau đó tạo Scope chủ động:
> ```csharp
> using var scope = _scopeFactory.CreateScope();
> var db = scope.ServiceProvider.GetRequiredService<MyDbContext>();
> ```

---

## 4. Code Mẫu Thực Hành Chuẩn Mực

```csharp
using System;

// Định nghĩa các interface và dịch vụ
public interface ITransientOperation { Guid Id { get; } }
public interface IScopedOperation { Guid Id { get; } }
public interface ISingletonOperation { Guid Id { get; } }

public class OperationService : ITransientOperation, IScopedOperation, ISingletonOperation {
    public Guid Id { get; } = Guid.NewGuid();
}

// Minh họa cơ chế tạo Scope thủ công (Background Worker / Queue Consumer)
public class WorkerConsumer {
    // Giả lập DI Container đơn giản
    public static void DemonstrateScopeResolution() {
        Console.WriteLine("--- SIMULATING SCOPES ---");
        
        // Scope 1 (HTTP Request 1)
        var scope1_scoped = new OperationService();
        var scope1_transientA = new OperationService();
        var scope1_transientB = new OperationService();

        // Scope 2 (HTTP Request 2)
        var scope2_scoped = new OperationService();

        Console.WriteLine($"Scope 1 Scoped Id: {scope1_scoped.Id}");
        Console.WriteLine($"Scope 2 Scoped Id: {scope2_scoped.Id} (Khác Scope 1)");
        Console.WriteLine($"Transient A vs B: {scope1_transientA.Id != scope1_transientB.Id} (Luôn tạo mới)");
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Captive Dependency là gì? Làm thế nào để phát hiện trong môi trường Development?**
   - *Trả lời*: Là hiện tượng Singleton phụ thuộc vào Scoped service, biến Scoped service thành Singleton trên thực tế. Trong ASP.NET Core, bật `builder.Host.UseDefaultServiceProvider(o => o.ValidateScopes = true)` sẽ phát hiện và ném ngoại lệ ngay khi khởi động.
2. **Khi nào nên dùng `Transient` thay vì `Scoped`?**
   - *Trả lời*: Dùng `Transient` cho các helper nhẹ, không lưu trữ trạng thái (Stateless), không cần đồng bộ trạng thái qua nhiều lớp trong cùng một request.
3. **Tại sao việc giải quyết một `Transient` có `IDisposable` từ Root Container lại gây Memory Leak?**
   - *Trả lời*: DI Container giữ tham chiếu tới tất cả các disposable instance nó tạo ra để gọi `Dispose()` sau này. Vì Root Container không bao giờ dispose cho tới khi app tắt, các instance Transient đó không bao giờ được GC thu gom.
