# Bài 8: Extension Methods & Giao Diện `IEnumerable<T>`

> **Trọng tâm bài học:** Cách hoạt động của Extension Methods với từ khóa `this`, cách "gắn thêm" phương thức cho các class đóng (như `string`, `int`, `DateTime`), và cơ chế máy trạng thái của `yield return` khi cài đặt `IEnumerable<T>`.

---

## 1. Bản Chất Của Extension Methods

Extension Methods cho phép bạn "bổ sung" các phương thức mới vào các kiểu dữ liệu có sẵn mà không cần kế thừa, không cần sửa đổi mã nguồn gốc, và không cần tạo wrapper class.
- **Quy tắc cú pháp:**
  1. Phải được đặt trong một `static class`.
  2. Phương thức phải là `static`.
  3. Tham số đầu tiên phải có từ khóa `this` đứng trước kiểu dữ liệu muốn mở rộng.

```csharp
namespace BootCamp.Chapter.Extensions
{
    public static class StringExtensions
    {
        // Mở rộng kiểu string với hàm IsValidEmail
        public static bool IsValidEmail(this string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return false;
            return input.Contains("@") && input.Contains(".");
        }

        // Mở rộng kiểu int để kiểm tra số nguyên tố
        public static bool IsPrime(this int number)
        {
            if (number <= 1) return false;
            for (int i = 2; i * i <= number; i++)
            {
                if (number % i == 0) return false;
            }
            return true;
        }
    }
}

// Sử dụng tự nhiên như thể phương thức thuộc về chính kiểu đó:
string email = "test@example.com";
bool valid = email.IsValidEmail(); // Gọi trực tiếp từ biến!

int n = 17;
bool prime = n.IsPrime(); // true
```

---

## 2. Giao Diện `IEnumerable<T>` & Từ Khóa `yield return`

`IEnumerable<T>` là trái tim của hệ thống tập hợp trong .NET. Mọi cấu trúc dữ liệu có thể duyệt qua bằng vòng lặp `foreach` đều hiện thực giao diện này.

### Cơ chế `yield return`:
Từ khóa `yield return` hướng dẫn C# Compiler tự động dựng lên một **Máy trạng thái ngầm (State Machine)** bên dưới:
- Thay vì phải tạo sẵn toàn bộ danh sách 1,000,000 phần tử trên RAM rồi mới trả về, `yield return` chỉ sinh ra từng phần tử một **ngay khi phía người gọi yêu cầu** (Lazy Evaluation).
- Tiết kiệm bộ nhớ RAM tuyệt đối!

```csharp
public class NumberGenerator
{
    // Sinh dãy số vô hạn mà không làm tràn bộ nhớ RAM!
    public static IEnumerable<int> GenerateEvenNumbers(int max)
    {
        for (int i = 0; i <= max; i += 2)
        {
            // Trả về giá trị hiện tại và TẠM DỪNG luồng tại đây.
            // Khi vòng lặp foreach ở caller yêu cầu phần tử tiếp theo, hàm mới chạy tiếp!
            yield return i;
        }
    }
}

// Phía gọi:
foreach (int even in NumberGenerator.GenerateEvenNumbers(10))
{
    Console.WriteLine(even); // 0, 2, 4, 6, 8, 10
}
```
