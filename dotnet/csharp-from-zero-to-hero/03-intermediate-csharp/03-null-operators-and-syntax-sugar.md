# Bài 3: Xử Lý Null & Cú Pháp Tinh Gọn (Null Operators & Syntax Sugar)

> **Trọng tâm bài học:** Giải quyết "sai lầm tỷ đô" (The Billion-Dollar Mistake - `NullReferenceException`), kiểu có thể chứa null (`Nullable<T>`), bộ toán tử xử lý null tinh gọn (`?.`, `??`, `??=`, `!`), và cú pháp gộp mẫu Pattern Matching trong C# hiện đại.

---

## 1. Bộ Toán Tử Xử Lý Null Siêu Tốc Trong C#

```csharp
public class User
{
    public string Name { get; set; }
    public Address HomeAddress { get; set; }
}

public class Address
{
    public string City { get; set; }
}
```

### 1. Toán tử điều kiện Null (Elvis Operator `?.`)
Thay vì viết lồng nhau `if (user != null && user.HomeAddress != null)`:
```csharp
// Nếu user hoặc HomeAddress là null, biểu thức trả về null ngay lập tức, không bao giờ văng lỗi!
string city = user?.HomeAddress?.City;
```

### 2. Toán tử kết hợp Null (Null-Coalescing Operator `??`)
Cung cấp một giá trị mặc định fallback khi biểu thức bên trái là `null`:
```csharp
string safeCity = user?.HomeAddress?.City ?? "Không xác định";
```

### 3. Toán tử gán kết hợp Null (Null-Coalescing Assignment `??=`)
Gán giá trị cho biến nếu và chỉ nếu biến đó đang mang giá trị `null`:
```csharp
List<string> cachedData = null;
cachedData ??= LoadDataFromDatabase(); // Chỉ truy vấn DB lần đầu tiên!
```

### 4. Toán tử tha thứ Null (Null-Forgiving Operator `!`)
Báo cho trình biên dịch biết lập trình viên cam đoan biến này chắc chắn không null (dùng để tắt cảnh báo Nullable Warning của Roslyn):
```csharp
string definiteName = user!.Name;
```

---

## 2. Kiểu Giá Trị Có Thể Null (`Nullable<T>`)

Theo mặc định, Value Types (`int`, `double`, `bool`, `DateTime`) không thể nhận giá trị `null`.  
Để cho phép chúng mang giá trị null (rất phổ biến khi làm việc với cơ sở dữ liệu có các cột NULLable):

```csharp
int? optionalAge = null; // Cú pháp viết tắt của Nullable<int>

if (optionalAge.HasValue)
{
    Console.WriteLine($"Tuổi: {optionalAge.Value}");
}
else
{
    Console.WriteLine("Người dùng không cung cấp tuổi.");
}

// Lấy giá trị an toàn kèm mặc định:
int actualAge = optionalAge.GetValueOrDefault(18);
```

---

## 3. Pattern Matching Với Kiểm Tra Null

C# hỗ trợ cú pháp kiểm tra kiểu và null kết hợp cực kỳ thanh lịch:

```csharp
if (user is { HomeAddress: { City: "Hà Nội" } })
{
    Console.WriteLine("Người dùng sinh sống tại Hà Nội!");
}

if (obj is not null)
{
    // Đảm bảo đối tượng khác null
}
```
