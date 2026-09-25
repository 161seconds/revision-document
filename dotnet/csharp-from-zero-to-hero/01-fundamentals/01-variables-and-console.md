# Bài 1: Biến, Kiểu Dữ Liệu CTS & Nhập Xuất Console

> **Trọng tâm bài học:** Khám phá cấu trúc chương trình C#, hàm `Main`, hệ thống kiểu dữ liệu nguyên thủy (CTS Primitives), phân biệt độ chính xác số học (`float`, `double`, `decimal`), chuyển đổi kiểu (`cast`, `Parse`) và nhập/xuất Console chuẩn.

---

## 1. Cấu Trúc Cơ Bản Của Chương Trình C#

Mọi chương trình Console C# đều bắt đầu thực thi từ điểm vào (Entry Point): phương thức `Main`.

```csharp
using System;

namespace BootCamp.Chapter1
{
    class Program
    {
        static void Main(string[] args)
        {
            // Điểm bắt đầu thực thi mã lệnh
            Console.WriteLine("Hello, World!");
        }
    }
}
```

- **Semicolon (`;`):** Mọi câu lệnh trong C# kết thúc bằng dấu chấm phẩy.
- **Quy ước đặt tên biến:**
  - `camelCase`: Dành cho biến cục bộ (local variables) và tham số phương thức (`myAge`, `firstName`).
  - `PascalCase`: Dành cho tên lớp, tên phương thức, thuộc tính (`Program`, `Main`, `CalculateBmi`).
  - Tên biến hợp lệ: Ký tự chữ `[a-zA-Z]`, số `[0-9]` (không đứng đầu), và dấu gạch dưới `_`.

---

## 2. Hệ Thống Kiểu Dữ Liệu Nguyên Thủy (Primitive Types)

| Kiểu C# | Kiểu .NET CTS | Kích thước | Khoảng giá trị / Mục đích sử dụng | Ví dụ khai báo |
| :--- | :--- | :---: | :--- | :--- |
| `int` | `System.Int32` | 4 bytes (32-bit) | Số nguyên có dấu (-2,147,483,648 đến 2,147,483,647) | `int age = 25;` |
| `long` | `System.Int64` | 8 bytes (64-bit) | Số nguyên lớn | `long distance = 999999999999L;` |
| `float` | `System.Single` | 4 bytes (32-bit) | Số thực dấu phẩy động (độ chính xác ~7 chữ số) | `float weight = 80.5f;` |
| `double` | `System.Double` | 8 bytes (64-bit) | Số thực dấu phẩy động tiêu chuẩn (~15-17 chữ số) | `double pi = 3.1415926535;` |
| `decimal` | `System.Decimal` | 16 bytes (128-bit) | **Độ chính xác cao tuyệt đối** (tài chính, tiền tệ) | `decimal balance = 10500.50m;` |
| `string` | `System.String` | Biến đổi | Chuỗi văn bản (dấu ngoặc kép `""`) | `string name = "Alice";` |
| `char` | `System.Char` | 2 bytes (UTF-16) | Ký tự đơn lẻ (dấu ngoặc đơn `''`) | `char grade = 'A';` |
| `bool` | `System.Boolean` | 1 byte | Giá trị logic: `true` hoặc `false` | `bool isActive = true;` |

> [!IMPORTANT]
> **Quy tắc vàng về số học số thực:**
> - Tuyệt đối **không** dùng `float` hoặc `double` cho các phép tính tài chính, tiền tệ vì lỗi sai số nhị phân (Floating-point precision issue). Luôn dùng `decimal`.
> - Phép chia số nguyên `int / int` sẽ tự động cắt bỏ phần thập phân:
>   ```csharp
>   int divInt = 1 / 100;     // Kết quả: 0 (bị cắt phần thập phân)
>   double divDouble = 1 / 100.0; // Kết quả: 0.01 (chính xác)
>   ```

---

## 3. Bản Chất Ký Tự (`char`) & Bảng Mã ASCII

Trong C#, kiểu `char` thực chất là một số nguyên không âm đại diện cho mã ký tự Unicode/ASCII:

```csharp
char letter = 'A';
int asciiCode = (int)letter; // 65

char nextLetter = Convert.ToChar('Z' + 1); // '[' trong bảng mã ASCII

// Tính số lượng chữ cái trong bảng mã Alphabet
int alphabetLength = ('z' - 'a') + 1; // 26
```

---

## 4. Từ Khóa `var` & Hằng Số `const`

- **`var` (Type Inference):** Trình biên dịch tự suy luận kiểu tại thời điểm biên dịch dựa vào giá trị khởi tạo. `var` vẫn có kiểu tĩnh tuyệt đối (Strongly Typed), không phải kiểu động (dynamic).
  ```csharp
  var count = 10;        // Tự động suy luận kiểu int
  var message = "Hello"; // Tự động suy luận kiểu string
  // var unknown;        // LỖI: Bắt buộc phải có giá trị khởi tạo để suy luận kiểu!
  ```
- **`const` (Compile-time Constant):** Biến không thể thay đổi giá trị sau khi khai báo và phải được gán giá trị trực tiếp tại thời điểm biên dịch.
  ```csharp
  const double Pi = 3.141592653589793;
  // Pi = 3.14; // LỖI biên dịch!
  ```

---

## 5. Nhập Xuất Console & Chuyển Đổi Kiểu (Parsing)

Khi đọc dữ liệu từ bàn phím qua `Console.ReadLine()`, kết quả luôn là kiểu `string`. Để thực hiện tính toán, cần chuyển đổi sang số qua các hàm `Parse` hoặc `TryParse`:

```csharp
Console.Write("Nhập họ và tên: ");
string fullName = Console.ReadLine();

Console.Write("Nhập tuổi: ");
int age = int.Parse(Console.ReadLine());

Console.Write("Nhập cân nặng (kg): ");
double weight = double.Parse(Console.ReadLine());

Console.Write("Nhập chiều cao (cm): ");
double heightCm = double.Parse(Console.ReadLine());

// Tính chỉ số BMI = Cân nặng (kg) / (Chiều cao (m) * Chiều cao (m))
double heightM = heightCm / 100.0;
double bmi = weight / (heightM * heightM);

Console.WriteLine($"{fullName} {age} tuổi, cân nặng {weight} kg, chiều cao {heightCm} cm. BMI: {bmi:F2}");
```

---

## 6. Bẫy Kinh Điển Cần Tránh

1. **Bẫy `int.Parse` khi nhập sai định dạng:** Nhập chữ vào `int.Parse` sẽ văng ngay ngoại lệ `FormatException`. Trong môi trường sản phẩm thực tế, hãy dùng `int.TryParse`:
   ```csharp
   if (int.TryParse(input, out int validAge)) { /* Hợp lệ */ }
   ```
2. **Bẫy định dạng dấu phẩy thập phân theo vùng miền (Culture):** Ở một số quốc gia, số thực viết dạng `156,5` thay vì `156.5`. Để an toàn tuyệt đối, sử dụng `CultureInfo.InvariantCulture`.
