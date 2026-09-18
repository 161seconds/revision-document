# 01. Classes & Constructors

Định nghĩa lớp trong C# hiện đại, cú pháp Primary Constructors (C# 12), thuộc tính `init-only` và các cấp độ kiểm soát truy cập (Access Modifiers).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Arrays & Memory Spans](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/04-arrays-and-memory-spans.md)
- **Tiếp theo:** [Inheritance & Polymorphism](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/02-inheritance-and-polymorphism.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Primary Constructors Trong C# 12+
Trước C# 12, việc tiêm phụ thuộc (Dependency Injection) trong class đòi hỏi phải khai báo trường `private readonly` và gán lại trong constructor:
```csharp
// TRUYỀN THỐNG:
public class UserService {
    private readonly ILogger _logger;
    private readonly IDatabase _db;
    public UserService(ILogger logger, IDatabase db) {
        _logger = logger;
        _db = db;
    }
}
```

Từ C# 12, bạn có thể đưa trực tiếp tham số vào tên Class (**Primary Constructor**):
```csharp
// C# 12 TINH GỌN:
public class UserService(ILogger logger, IDatabase db) {
    public void DoWork() {
        logger.Log("Working...");
        db.Save();
    }
}
```
Các tham số của Primary Constructor nằm trong phạm vi toàn bộ thân class và có thể được dùng trực tiếp trong các methods, properties.

### 2.2 Thuộc Tính `init-only` (C# 9+) & Object Initializers
Thuộc tính khai báo với accessor `init` thay vì `set` cho phép gán giá trị **chỉ trong quá trình khởi tạo đối tượng**:
```csharp
public class UserDto {
    public string Id { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
}

// Hợp lệ lúc khởi tạo:
var user = new UserDto { Id = "u_1", Email = "dev@dotnet.com" };

// user.Email = "new@dotnet.com"; // ❌ LỖI BIÊN DỊCH: Init-only property chỉ có thể được gán trong object initializer!
```

### 2.3 Access Modifiers Đầy Đủ Trong C#
1. `public`: Truy cập từ bất kỳ đâu.
2. `private`: Chỉ truy cập bên trong chính class đó.
3. `protected`: Truy cập nội bộ class và các class con kế thừa.
4. `internal`: Truy cập từ bất kỳ đâu **trong cùng Assembly (.dll/.exe)**.
5. `protected internal`: Trong cùng Assembly HOẶC từ class con ở Assembly khác.
6. `private protected`: Chỉ từ class con **trong cùng Assembly**.
7. `file` (C# 11+): Giới hạn phạm vi kiểu chỉ hiển thị trong **duy nhất file mã nguồn đó** (phục vụ Source Generators).

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Nhầm lẫn Primary Constructor của Class với Record
- Trong `record Person(string Name, int Age);`: Trình biên dịch **tự động sinh ra** các thuộc tính công khai `public string Name { get; init; }`.
- Trong `class Person(string Name, int Age);`: Trình biên dịch **KHÔNG sinh ra public properties**! `Name` và `Age` chỉ là các biến tham số nội bộ. Nếu muốn biến chúng thành properties của class, bạn phải tự gán: `public string Name { get; } = Name;`.

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Dịch vụ cấu hình bất biến với Primary Constructor và Required Properties
public class DatabaseOptions {
    public required string ConnectionString { get; init; } // C# 11 required: Bắt buộc phải truyền khi khởi tạo
    public int TimeoutSeconds { get; init; } = 30;
}

public class OrderRepository(DatabaseOptions options) {
    public string GetConnection() => options.ConnectionString;
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Từ khóa `required` trong C# 11 giải quyết vấn đề gì khi khởi tạo đối tượng?
   - *Trả lời:* Trước C# 11, khi sử dụng Object Initializer (`new MyClass { Prop = val }`), trình biên dịch không thể bắt buộc người gọi phải gán một thuộc tính cụ thể nào đó (trừ khi viết constructor truyền thống có tham số). Từ khóa `required` buộc người gọi phải cung cấp giá trị cho thuộc tính đó trong object initializer hoặc constructor được đánh dấu `[SetsRequiredMembers]`, nếu không trình biên dịch sẽ ném lỗi biên dịch ngay lập tức, triệt tiêu lỗi thiếu dữ liệu bắt buộc.

2. **Câu hỏi:** Access modifier `file` trong C# 11 được thiết kế cho mục đích gì?
   - *Trả lời:* `file` modifier giới hạn phạm vi hiển thị của một kiểu (class, struct, interface) chỉ tồn tại duy nhất bên trong file mã nguồn vật lý chứa nó. Tính năng này được tạo ra chủ yếu phục vụ các bộ sinh mã tự động (Source Generators) để tránh hiện tượng xung đột tên class khi sinh code vào cùng một namespace giữa các file khác nhau trong cùng một project.
