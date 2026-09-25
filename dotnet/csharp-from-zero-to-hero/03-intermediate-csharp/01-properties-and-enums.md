# Bài 1: Properties & Enums (Thuộc Tính & Kiểu Liệt Kê)

> **Trọng tâm bài học:** Property thực chất là gì dưới góc nhìn CLR? Kỹ thuật đóng gói siêu tốc với Auto-implemented properties, Backing fields, toán tử gán một lần `init`, và sức mạnh của `enum` cờ bit (`[Flags]`).

---

## 1. Property Thực Chất Là Gì?

Trong C#, **Property không phải là dữ liệu - nó là hàm (Methods)**.
- Khi bạn viết `public int Age { get; set; }`, trình biên dịch C# thực chất tự động sinh ra một biến ẩn tư nhân (Backing Field) và 2 phương thức:
  - `get_Age()`
  - `set_Age(int value)`
- Property mang lại cú pháp sử dụng tiện lợi như một public field thông thường (`person.Age = 20;`), nhưng vẫn duy trì 100% tính đóng gói và an toàn của phương thức!

```csharp
public class Person
{
    // 1. Auto-implemented property
    public string Name { get; set; }

    // 2. Read-only property (Chỉ gán trong constructor hoặc tại thời điểm khai báo)
    public DateTime CreatedAt { get; } = DateTime.UtcNow;

    // 3. Init-only property (C# 9+: Chỉ cho phép gán lúc khởi tạo object initializer)
    public string SocialSecurityNumber { get; init; }

    // 4. Full property với logic validation (Sử dụng Backing Field)
    private int _age;
    public int Age
    {
        get => _age;
        set
        {
            if (value < 0) throw new ArgumentException("Tuổi không được âm!");
            _age = value;
        }
    }

    // 5. Computed Property (Thuộc tính tính toán động, không tốn bộ nhớ lưu trữ)
    public bool IsAdult => Age >= 18;
}
```

---

## 2. Kiểu Liệt Kê (Enum) & Flagged Enums

`enum` là kiểu giá trị nguyên (Value Type) gán tên dễ đọc cho các số nguyên cố định trong hệ thống:

```csharp
public enum OrderStatus
{
    Pending = 0,
    Processing = 1,
    Shipped = 2,
    Delivered = 3,
    Cancelled = 4
}
```

### Bitwise Flags Enum (`[Flags]`):
Cho phép một biến enum lưu trữ tổ hợp nhiều giá trị cùng lúc bằng phép toán nhị phân (Bitwise OR `|`):

```csharp
[Flags]
public enum FilePermissions
{
    None = 0,        // 0000
    Read = 1 << 0,   // 0001 (1)
    Write = 1 << 1,  // 0010 (2)
    Execute = 1 << 2,// 0100 (4)
    FullControl = Read | Write | Execute // 0111 (7)
}

// Sử dụng:
var permissions = FilePermissions.Read | FilePermissions.Write;

// Kiểm tra quyền (HasFlag):
bool canWrite = permissions.HasFlag(FilePermissions.Write); // true
bool canExecute = (permissions & FilePermissions.Execute) != 0; // false
```
