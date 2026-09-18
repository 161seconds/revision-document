# 03. Interfaces & Abstract Classes

So sánh giữa Interface và Abstract Class, tính năng Default Interface Methods (C# 8+) và kỹ thuật Explicit Interface Implementation.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Inheritance & Polymorphism](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/02-inheritance-and-polymorphism.md)
- **Tiếp theo:** [Structs, Records & Immutability](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/04-structs-records-and-immutability.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Bảng So Sánh Chi Tiết

| Tiêu chí | `interface` | `abstract class` |
| :--- | :--- | :--- |
| **Kế thừa** | Đa kế thừa (triển khai nhiều interface) | Đơn kế thừa (chỉ kế thừa 1 lớp cha) |
| **Trường dữ liệu (Fields)** | ❌ Cấm khai báo Instance Fields |  Có thể chứa trạng thái (fields) |
| **Constructors** | ❌ Không thể có constructor |  Có constructor để lớp con gọi qua `base()` |
| **Access Modifiers** | Mặc định `public` (từ C# 8 có thể `private/protected static`) | Hỗ trợ đầy đủ: `public`, `protected`, `private` |
| **Default Methods** |  Có (Default Interface Methods C# 8+) |  Có phương thức chứa logic thực thi |

### 2.2 Default Interface Methods (DIM Trong C# 8+)
Cho phép thêm phương thức có thân hàm (thực thi mặc định) vào một Interface có sẵn mà không làm vỡ các class cũ đang triển khai interface đó:

```csharp
public interface ILogger {
    void Log(string message);

    // Default Method: Lớp triển khai không bắt buộc phải viết lại
    void LogError(string error) => Log($"[ERROR]: {error}");
}
```

> **ĐIỀU CẦN NHỚ:** Để gọi Default Interface Method, bạn **bắt buộc phải gọi thông qua biến kiểu Interface**, chứ không thể gọi trực tiếp từ biến kiểu Class con:
> ```csharp
> MyLogger logger = new MyLogger();
> // logger.LogError("err"); // ❌ LỖI BIÊN DỊCH!
> ((ILogger)logger).LogError("err"); //  HỢP LỆ!
> ```

### 2.3 Explicit Interface Implementation (Triển Khai Tường Minh)
Kỹ thuật giải quyết xung đột khi một Class triển khai 2 Interface có phương thức trùng tên:

```csharp
public interface IOrderService { void Save(); }
public interface IAuditService { void Save(); }

public class MasterService : IOrderService, IAuditService {
    // Triển khai tường minh: Không có access modifier
    void IOrderService.Save() => Console.WriteLine("Saving Order to Database...");
    void IAuditService.Save() => Console.WriteLine("Saving Audit Log...");
}

// Khi sử dụng:
MasterService s = new MasterService();
// s.Save(); // ❌ Lỗi: Không thể gọi trực tiếp

((IOrderService)s).Save(); // In ra: Saving Order to Database...
((IAuditService)s).Save(); // In ra: Saving Audit Log...
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Tưởng rằng Default Interface Method tự động kế thừa vào Class instance
Nhiều lập trình viên lầm tưởng Default Interface Method hoạt động giống như phương thức của lớp cha trong kế thừa. Thực tế, nếu bạn không ép kiểu về interface, phương thức mặc định đó sẽ hoàn toàn vô hình với instance của class!

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Sử dụng Explicit Interface Implementation cho IDisposable an toàn
using System;

public class ResourceHolder : IDisposable {
    private bool _isDisposed = false;

    public void DoWork() {
        if (_isDisposed) throw new ObjectDisposedException(nameof(ResourceHolder));
        Console.WriteLine("Doing high performance work...");
    }

    // Triển khai tường minh giúp ẩn phương thức Dispose khỏi API công khai nếu muốn
    void IDisposable.Dispose() {
        if (!_isDisposed) {
            _isDisposed = true;
            Console.WriteLine("Cleaning native resources...");
        }
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Khi nào nên dùng `interface` và khi nào nên dùng `abstract class`?
   - *Trả lời:* Sử dụng `interface` khi muốn định nghĩa hợp đồng hành vi (Behavioral Contract) có thể áp dụng cho các lớp hoàn toàn khác nhau không cùng cây phả hệ (ví dụ: `IDisposable`, `IComparable`), hoặc khi cần đa kế thừa nhiều vai trò. Sử dụng `abstract class` khi các lớp con có quan hệ bản chất "Is-A" chặt chẽ, cần chia sẻ chung trạng thái (fields), constructor khởi tạo, hoặc cần kiểm soát quyền truy cập phương thức ở mức độ `protected`.

2. **Câu hỏi:** Explicit Interface Implementation mang lại những lợi ích gì trong thiết kế hướng đối tượng?
   - *Trả lời:* (1) Giải quyết triệt để xung đột khi 2 interface có phương thức cùng tên và chữ ký tham số nhưng ngữ nghĩa nghiệp vụ khác nhau. (2) Giữ cho giao diện công khai (Public API) của class được tinh gọn, ẩn đi các phương thức kỹ thuật hạ tầng (như `IEnumerable.GetEnumerator` hay `ICollection.IsReadOnly`) mà người dùng bình thường của class không cần quan tâm.
