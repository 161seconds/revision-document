# Bài 11: Attributes & Reflection (Siêu Dữ Liệu & Phản Chiếu)

> **Trọng tâm bài học:** Bản chất của Metadata trong assembly .NET, tự xây dựng Custom Attributes, và sử dụng `System.Reflection` để soi cấu trúc mã nguồn, đọc thuộc tính và thực thi phương thức động tại thời điểm chạy (Runtime).

---

## 1. Attributes Là Gì?

Attribute (Thuộc tính trang trí) là các thẻ siêu dữ liệu (Metadata) được đính kèm vào các thành phần mã nguồn: Lớp (`class`), Phương thức (`method`), Thuộc tính (`property`), hoặc Tham số (`parameter`).
- Attribute không trực tiếp thay đổi cách thức hàm thực thi, nhưng nó cung cấp thông tin mô tả để các framework (ASP.NET Core, EF Core, Unit Test Runners như xUnit) đọc và ra quyết định xử lý.

```csharp
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public class StringLengthAttribute : Attribute
{
    public int MaxLength { get; }

    public StringLengthAttribute(int maxLength)
    {
        MaxLength = maxLength;
    }
}

public class UserRegistrationDto
{
    [StringLength(20)]
    public string Username { get; set; }
}
```

---

## 2. Reflection: Soi Và Thực Thi Mã Tại Runtime

Reflection (`System.Reflection`) là cơ chế cho phép chương trình tự soi rọi chính bản thân nó tại thời điểm chạy: lấy thông tin về các kiểu dữ liệu, các hàm, các thuộc tính và kích hoạt chúng động.

### Viết bộ Validator tự động dựa trên Attribute & Reflection:
```csharp
using System;
using System.Reflection;

public static class SimpleValidator
{
    public static bool Validate(object obj, out string errorMessage)
    {
        errorMessage = string.Empty;
        Type type = obj.GetType();

        // Lấy toàn bộ các thuộc tính công khai của đối tượng
        PropertyInfo[] properties = type.GetProperties();

        foreach (var prop in properties)
        {
            // Kiểm tra xem thuộc tính có gắn [StringLength] không
            var attr = prop.GetCustomAttribute<StringLengthAttribute>();
            if (attr != null)
            {
                string value = prop.GetValue(obj) as string;
                if (value != null && value.Length > attr.MaxLength)
                {
                    errorMessage = $"Thuộc tính '{prop.Name}' vượt quá độ dài tối đa cho phép là {attr.MaxLength} ký tự!";
                    return false;
                }
            }
        }

        return true;
    }
}
```

---

## 3. Cái Giá Của Reflection (Trade-offs)

> [!WARNING]
> - **Hiệu năng (Performance Cost):** Reflection chậm hơn hàng chục đến hàng trăm lần so với việc gọi hàm hoặc truy cập thuộc tính trực tiếp lúc biên dịch. Tránh dùng Reflection trong các vòng lặp xử lý triệu bản ghi mỗi giây.
> - **Mất an toàn kiểu Compile-time:** Các lỗi gõ nhầm tên phương thức qua chuỗi `"MyMethod"` chỉ bị phát hiện khi chạy ứng dụng và văng lỗi `NullReferenceException` hoặc `MissingMethodException`.
