# Bài 3: Hàm & Quy Chuẩn Clean Code (Functions & Refactoring)

> **Trọng tâm bài học:** Bản chất của hàm như một hành động (Action/Verb), quy tắc đơn nhiệm (Single Responsibility ở cấp độ hàm), tránh lặp code (DRY - Don't Repeat Yourself), phạm vi biến (Variable Scope) và kỹ thuật refactoring mã nguồn.

---

## 1. Bản Chất Của Hàm (Function)

Hàm là một tập hợp các chỉ thị thực thi một hành động cụ thể. Vì là hành động, **tên hàm luôn phải bắt đầu bằng một ĐỘNG TỪ**:
- Tốt: `CalculateBmi()`, `PromptInt()`, `PrintPersonInfo()`, `IsValidAge()`.
- Xấu: `Bmi()`, `Number()`, `Data()`, `Check()`.

### Cú pháp tổng quát:
```csharp
<AccessModifier> <Static/NonStatic> <ReturnType> <FunctionName>(<Parameters>)
{
    // Thân hàm
    return <value>; // Nếu ReturnType khác void
}
```

---

## 2. Nguyên Lý DRY (Don't Repeat Yourself) & Single Responsibility

Trong Bài tập 1, ta phải nhập thông tin và tính BMI cho 2 người. Nếu viết lặp lại toàn bộ code nhập xuất 2 lần:
- Code phình to gấp đôi.
- Khi cần sửa logic (ví dụ: đổi định dạng hiển thị BMI), ta phải sửa ở nhiều nơi -> Dễ sót bug.

### Refactoring: Trích xuất các hàm tái sử dụng

```csharp
using System;
using System.Globalization;

namespace BootCamp.Chapter1
{
    public class Lesson3
    {
        public static void Demo()
        {
            ProcessPerson();
            ProcessPerson();
        }

        public static void ProcessPerson()
        {
            string name = PromptString("Nhập họ và tên: ");
            int age = PromptInt("Nhập tuổi: ");
            double weight = PromptDouble("Nhập cân nặng (kg): ");
            double height = PromptDouble("Nhập chiều cao (cm): ");

            double bmi = CalculateBmi(weight, height);

            Console.WriteLine($"{name} {age} tuổi, cân nặng {weight} kg, chiều cao {height} cm. BMI: {bmi:F2}");
        }

        public static string PromptString(string message)
        {
            Console.Write(message);
            return Console.ReadLine();
        }

        public static int PromptInt(string message)
        {
            Console.Write(message);
            return int.Parse(Console.ReadLine());
        }

        public static double PromptDouble(string message)
        {
            Console.Write(message);
            return double.Parse(Console.ReadLine(), CultureInfo.InvariantCulture);
        }

        public static double CalculateBmi(double weightKg, double heightCm)
        {
            double heightM = heightCm / 100.0;
            return weightKg / (heightM * heightM);
        }
    }
}
```

---

## 3. Lợi Ích Của Hàm Trong Unit Testing

Khi tách `CalculateBmi(double weight, double height)` thành một hàm độc lập không dính líu đến `Console.ReadLine()` hay `Console.WriteLine()`:
- Hàm trở thành **Pure Function** (Hàm thuần khiết): cùng một input luôn cho cùng một output, không gây side-effect.
- Ta có thể dễ dàng viết Unit Test để kiểm tra độ chính xác:
  ```csharp
  [Fact]
  public void CalculateBmi_WithValidInputs_ReturnsExpectedBmi()
  {
      // Arrange
      double weight = 70;
      double heightCm = 175;

      // Act
      double bmi = Lesson3.CalculateBmi(weight, heightCm);

      // Assert
      Assert.Equal(22.86, Math.Round(bmi, 2));
  }
  ```

---

## 4. Phạm Vi Biến (Variable Scope) & Vòng Đời

- Biến khai báo bên trong cặp ngoặc nhọn `{}` chỉ tồn tại và truy cập được bên trong khối lệnh đó.
- Khi hàm kết thúc, các biến cục bộ (Local Variables) trên Stack sẽ tự động được thu hồi.
- Không sử dụng biến toàn cục (Global/Static mutable state) bừa bãi vì gây khó khăn cho việc kiểm thử đồng thời (Concurrency / Race Condition).
