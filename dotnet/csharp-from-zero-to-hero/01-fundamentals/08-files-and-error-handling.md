# Bài 8: Xử Lý Tập Tin & Bắt Lỗi Ngoại Lệ (Files & Error Handling)

> **Trọng tâm bài học:** Thao tác đọc/ghi tập tin qua `System.IO.File`, cơ chế xử lý ngoại lệ (Exception Handling) với khối `try-catch-finally`, phân cấp ngoại lệ và quy tắc không nuốt lỗi (Don't Swallow Exceptions).

---

## 1. Cơ Chế Bắt Lỗi Ngoại Lệ (Exception Handling)

Trong C#, khi một lỗi thời gian chạy xảy ra (ví dụ: chia cho 0, mở file không tồn tại, định dạng chuỗi không hợp lệ), CLR sẽ tạo và "ném" ra một đối tượng kế thừa từ `System.Exception`.

### Cấu trúc chuẩn của khối `try-catch-finally`:
```csharp
try
{
    // Đoạn code có khả năng phát sinh lỗi
    string content = System.IO.File.ReadAllText("data.txt");
}
catch (System.IO.FileNotFoundException ex)
{
    // Bắt đúng loại ngoại lệ cụ thể (Specific Exception)
    Console.WriteLine($"Không tìm thấy file: {ex.FileName}");
}
catch (System.IO.IOException ex)
{
    // Bắt lỗi I/O tổng quát khác
    Console.WriteLine($"Lỗi truy cập đĩa: {ex.Message}");
}
catch (Exception ex)
{
    // Bắt các ngoại lệ ngoài dự tính (Catch-all)
    Console.WriteLine($"Lỗi không xác định: {ex.Message}");
    // throw; // Ném lại nếu cần tầng trên xử lý
}
finally
{
    // Luôn luôn thực thi dù có lỗi hay không (Dùng để giải phóng tài nguyên: đóng file, ngắt kết nối)
    Console.WriteLine("Khối dọn dẹp hoàn tất.");
}
```

> [!CAUTION]
> **Anti-Pattern "Nuốt Lỗi" (Pokemon Exception Handling - Gotta catch 'em all):**
> ```csharp
> try { DoSomething(); }
> catch (Exception) { /* Để trống, không log, không làm gì */ }
> ```
> Việc nuốt lỗi khiến hệ thống chết âm thầm, biến bug thành "bóng ma" không thể gỡ lỗi hoặc giám sát trong môi trường sản phẩm.

---

## 2. Thao Tác Đọc & Ghi File (`System.IO.File`)

Lớp `System.IO.File` cung cấp các phương thức tĩnh tiện dụng nhất để thao tác với file văn bản:

```csharp
using System.IO;

string filePath = "students.txt";

// 1. Kiểm tra file tồn tại
if (File.Exists(filePath))
{
    // 2. Đọc toàn bộ các dòng vào mảng chuỗi
    string[] lines = File.ReadAllLines(filePath);
    foreach (var line in lines)
    {
        Console.WriteLine(line);
    }
}

// 3. Ghi mảng các chuỗi ra file (Ghi đè - Overwrite)
string[] outputLines = { "Alice,20,50", "Bob,22,65" };
File.WriteAllLines("output.txt", outputLines);

// 4. Ghi nối tiếp vào cuối file (Append)
File.AppendAllText("logs.txt", $"[LOG] Chương trình khởi động lúc {DateTime.Now}\n");
```
