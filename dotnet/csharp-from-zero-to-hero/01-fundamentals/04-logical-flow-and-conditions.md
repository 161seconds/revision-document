# Bài 4: Luồng Logic, Điều Kiện & Rẽ Nhánh (Logical Flow)

> **Trọng tâm bài học:** Kiểm soát luồng thực thi phi tuyến tính (Non-linear flow), cấu trúc `if-else`, đoản mạch trong biểu thức logic (`&&`, `||`), kỹ thuật Guard Clauses (Thoát sớm) để loại bỏ hiện tượng lồng code hình kim tự tháp (Pyramid of Doom), và cấu trúc `switch`.

---

## 1. Bản Chất Rẽ Nhánh & Biểu Thức Boolean

Chương trình máy tính ra quyết định dựa trên các biểu thức logic trả về `true` hoặc `false`.

```csharp
if (condition)
{
    // Thực thi khi condition == true
}
else if (anotherCondition)
{
    // Thực thi khi condition == false VÀ anotherCondition == true
}
else
{
    // Thực thi khi tất cả điều kiện trên đều false
}
```

> [!NOTE]
> Không cần so sánh tường minh với `true`/`false`:
> ```csharp
> bool isValid = true;
> if (isValid == true) // Dư thừa!
> if (isValid)         // Chuẩn Clean Code
> if (!isValid)        // Kiểm tra phủ định (not)
> ```

---

## 2. Đánh Giá Đoản Mạch (Short-Circuit Evaluation)

- `&&` (Logical AND): Nếu toán hạng bên trái là `false`, C# sẽ **bỏ qua ngay lập tức** toán hạng bên phải vì toàn bộ biểu thức chắc chắn là `false`.
- `||` (Logical OR): Nếu toán hạng bên trái là `true`, C# sẽ **bỏ qua ngay lập tức** toán hạng bên phải vì toàn bộ biểu thức chắc chắn là `true`.

### Tận dụng đoản mạch để phòng ngừa ngoại lệ Null:
```csharp
string text = null;
// Nếu dùng & (không đoản mạch), text.Length sẽ bị gọi và văng NullReferenceException!
// Dùng &&: Do text != null là false, biểu thức dừng ngay, an toàn 100%!
if (text != null && text.Length > 0)
{
    Console.WriteLine(text);
}
```

---

## 3. Kỹ Thuật Guard Clauses (Early Return)

Tránh viết code lồng nhau nhiều cấp (Nested If - Arrow Anti-pattern):

### ❌ Code Xấu (Deep Nesting):
```csharp
public double CalculateBmi(double weight, double height)
{
    if (weight > 0)
    {
        if (height > 0)
        {
            double heightM = height / 100.0;
            return weight / (heightM * heightM);
        }
        else
        {
            Console.WriteLine("Chiều cao không hợp lệ!");
            return -1;
        }
    }
    else
    {
        Console.WriteLine("Cân nặng không hợp lệ!");
        return -1;
    }
}
```

### ✅ Code Tốt (Guard Clauses - Clean Code):
```csharp
public double CalculateBmi(double weight, double height)
{
    if (weight <= 0)
    {
        Console.WriteLine("Cân nặng không hợp lệ!");
        return -1;
    }

    if (height <= 0)
    {
        Console.WriteLine("Chiều cao không hợp lệ!");
        return -1;
    }

    double heightM = height / 100.0;
    return weight / (heightM * heightM);
}
```

---

## 4. Cấu Trúc `switch` & Toán Tử 3 Ngôi (Ternary Operator)

### Toán tử 3 ngôi (Ternary Operator):
```csharp
string status = bmi < 18.5 ? "Thiếu cân" : (bmi < 25 ? "Bình thường" : "Thừa cân");
```

### Cấu trúc `switch` truyền thống vs Switch Expression (C# hiện đại):
```csharp
// Switch Expression ngắn gọn, an toàn:
string category = bmi switch
{
    <= 0 => "Không hợp lệ",
    < 18.5 => "Gầy / Thiếu cân",
    < 25.0 => "Cân đối / Bình thường",
    < 30.0 => "Tiền béo phì",
    _ => "Béo phì"
};
```
