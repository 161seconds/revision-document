# 04. Reflection & Custom Attributes

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 02: OOP & Type System](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/README.md).
- **Module hiện tại**: [Module 05: Asynchronous Programming, Memory & Advanced](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/README.md).
- **Trực thuộc**: [Master C# / .NET Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md).
- **Ứng dụng kế tiếp**: Kiến trúc ORM (Entity Framework), Serializers, Validation Frameworks.

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Metadata trong CLR Assembly
- Khi Roslyn Compiler biên dịch mã nguồn C#, nó tạo ra file PE (Portable Executable - `.dll` hoặc `.exe`) chứa:
  1. **CIL Code (Common Intermediate Language)**: Mã byte-code thực thi.
  2. **Metadata Tables**: Bảng mô tả chi tiết từng Type, Method, Property, Parameter và Attributes được đính kèm.
- **Reflection (`System.Reflection`)** là API cho phép chương trình đọc và truy vấn các Metadata Tables này trực tiếp tại thời gian chạy (Runtime).

### 2.2 Custom Attributes
- Attribute trong C# là một `class` kế thừa từ `System.Attribute`.
- Được cấu hình bằng attribute `[AttributeUsage]` để giới hạn phạm vi áp dụng (`AttributeTargets.Class`, `Property`, `Method`, v.v.) và cấu hình `AllowMultiple`.

```csharp
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class StringRangeAttribute : Attribute {
    public int MinLength { get; }
    public int MaxLength { get; }

    public StringRangeAttribute(int minLength, int maxLength) {
        MinLength = minLength;
        MaxLength = maxLength;
    }
}
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Suy giảm hiệu năng nghiêm trọng (Performance Overhead)**
> Gọi Reflection liên tục trong vòng lặp (vd: đọc property value qua `PropertyInfo.GetValue`) làm mất khả năng Inlining của JIT và phát sinh Boxing/Unboxing. Hãy cache kết quả Reflection hoặc dùng `Delegate.CreateDelegate` / `Expression Trees`.

> [!IMPORTANT]
> **Bẫy 2: Phá vỡ tính đóng gói (Bypassing Encapsulation)**
> Reflection có thể đọc và ghi đè các `private` fields qua `BindingFlags.NonPublic | BindingFlags.Instance`. Tuy nhiên, việc phụ thuộc vào private implementation details sẽ khiến code dễ sập khi thư viện bên thứ ba cập nhật nội bộ.

> [!TIP]
> **Xu hướng hiện đại trong .NET: Roslyn Source Generators**
> Thay vì sử dụng Reflection lúc Runtime (chậm, tốn RAM), .NET hiện đại sử dụng **Source Generators** để sinh code C# tĩnh ngay tại thời điểm biên dịch (Compile-time) như `[GeneratedRegex]`, `[JsonSerializable]`.

---

## 4. Code Mẫu Thực Hành: Bộ Kiểm Tra Dữ Liệu Tự Động (Validation Engine)

```csharp
using System;
using System.Collections.Generic;
using System.Reflection;

// 1. Custom Attribute
[AttributeUsage(AttributeTargets.Property)]
public class NotEmptyAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Property)]
public class NumberRangeAttribute(int min, int max) : Attribute {
    public int Min { get; } = min;
    public int Max { get; } = max;
}

// 2. Class dữ liệu mẫu
public class CreateUserDto {
    [NotEmpty]
    public string Username { get; set; } = "";

    [NumberRange(18, 65)]
    public int Age { get; set; }
}

// 3. Engine kiểm tra bằng Reflection
public static class ModelValidator {
    public static List<string> Validate(object model) {
        var errors = new List<string>();
        var type = model.GetType();

        foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance)) {
            var value = prop.GetValue(model);

            // Kiểm tra NotEmpty
            if (prop.GetCustomAttribute<NotEmptyAttribute>() != null) {
                if (value is string s && string.IsNullOrWhiteSpace(s)) {
                    errors.Add($"Property '{prop.Name}' cannot be empty.");
                }
            }

            // Kiểm tra NumberRange
            var rangeAttr = prop.GetCustomAttribute<NumberRangeAttribute>();
            if (rangeAttr != null && value is int number) {
                if (number < rangeAttr.Min || number > rangeAttr.Max) {
                    errors.Add($"Property '{prop.Name}' must be between {rangeAttr.Min} and {rangeAttr.Max}.");
                }
            }
        }

        return errors;
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Sự khác biệt giữa `typeof(T)` và `obj.GetType()` là gì?**
   - *Trả lời*: `typeof(T)` được phân giải tĩnh tại thời điểm biên dịch (Compile-time) dựa trên định danh kiểu. `obj.GetType()` kiểm tra con trỏ Type Handle của đối tượng thực tế trên Heap tại thời điểm chạy (Runtime), hữu ích khi làm việc với đa hình (Polymorphism).
2. **Làm thế nào để tối ưu hiệu năng khi buộc phải đọc metadata nhiều lần?**
   - *Trả lời*: Cache lại danh sách `PropertyInfo` vào một `ConcurrentDictionary<Type, PropertyInfo[]>`, hoặc biên dịch các thuộc tính thành các Delegates hoặc Expression Trees thay vì gọi trực tiếp `GetValue()`.
3. **Source Generators trong .NET mang lại lợi thế gì so với Reflection truyền thống?**
   - *Trả lời*: Hoạt động hoàn toàn lúc Compile-time, không gây chi phí khởi động (Startup time), zero allocation lúc runtime, hỗ trợ AOT (Ahead-Of-Time compilation) và phát hiện lỗi trực tiếp trong IDE.
