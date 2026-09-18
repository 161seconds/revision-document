# 04. Arrays & Memory Spans

Cấu trúc mảng trong C#, kỹ thuật xử lý bộ nhớ liên tục không cấp phát Heap với `Span<T>` và `ReadOnlySpan<T>`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Methods & Parameter Modifiers](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/03-methods-and-parameter-modifiers.md)
- **Tiếp theo:** [Module 02: OOP & Type System](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/README.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Các Loại Mảng Trong C#
1. **Mảng 1 chiều (Single-dimensional array):** `int[] arr = new int[5];`.
2. **Mảng đa chiều (Rectangular array):** `int[,] matrix = new int[3, 3];` - Cấp phát một khối bộ nhớ liên tục duy nhất trên Heap.
3. **Mảng răng cưa (Jagged array):** `int[][] jagged = new int[3][];` - Mảng chứa các mảng con khác nhau (mỗi mảng con là một đối tượng độc lập trên Heap với độ dài tùy ý).

### 2.2 Cuộc Cách Mạng `Span<T>` và `ReadOnlySpan<T>` (.NET Core 2.1+)
Trước khi có `Span<T>`, khi bạn muốn cắt một chuỗi con (`string.Substring`) hoặc lấy một đoạn mảng con, .NET bắt buộc phải **cấp phát một mảng/chuỗi mới trên Heap và sao chép dữ liệu sang**. Điều này gây áp lực khổng lồ lên Garbage Collector trong các ứng dụng web triệu request.

`Span<T>` là một **`ref struct`** hoạt động như một "cửa sổ nhìn" (Window/View) chiếu trực tiếp vào một vùng nhớ liên tục:
- Có thể trỏ vào: Mảng Heap, Bộ nhớ Stack (`stackalloc`), hoặc Bộ nhớ không quản lý Unmanaged Memory.
- Thao tác Slice (`span.Slice(start, length)`) diễn ra với độ phức tạp **$O(1)$ và 0 bytes cấp phát Heap (Zero-allocation)**!

```csharp
// Cắt chuỗi không sinh rác trên Heap:
string text = "2026-09-18";
ReadOnlySpan<char> span = text.AsSpan();

ReadOnlySpan<char> year = span.Slice(0, 4);   // "2026"
ReadOnlySpan<char> month = span.Slice(5, 2);  // "09"
ReadOnlySpan<char> day = span.Slice(8, 2);    // "18"

int yearNumber = int.Parse(year); // .NET hỗ trợ parse trực tiếp từ ReadOnlySpan<char>!
```

> **Giới hạn của `ref struct` (`Span<T>`):** Vì `Span<T>` có thể trỏ tới bộ nhớ Stack của hàm hiện tại, CLR cấm tuyệt đối việc boxing `Span<T>`, cấm dùng `Span<T>` làm trường trong `class` thông thường, và cấm dùng trong các phương thức `async/await` (vì async method sinh ra state machine lưu trên Heap).

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Cố gắng dùng `Span<T>` trong phương thức `async`
Trình biên dịch sẽ báo lỗi cú pháp: `Parameters or local variables of type 'Span<T>' cannot be declared in async methods`.
**Giải pháp:** Dùng `Memory<T>` hoặc `ReadOnlyMemory<T>` khi cần truyền buffer lát cắt qua các ranh giới bất đồng bộ (`await`).

---

## 4. Code Thực Hành (Production Patterns)

```csharp
using System;

public class SpanDemo {
    // Parser số hiệu suất cao không cấp phát chuỗi tạm
    public static bool TryParseHttpHeader(string headerLine, out int statusCode) {
        // Giả sử header: "HTTP/1.1 200 OK"
        ReadOnlySpan<char> span = headerLine.AsSpan();

        int firstSpace = span.IndexOf(' ');
        if (firstSpace == -1) {
            statusCode = 0;
            return false;
        }

        ReadOnlySpan<char> remaining = span.Slice(firstSpace + 1);
        int secondSpace = remaining.IndexOf(' ');
        ReadOnlySpan<char> codeSpan = secondSpace == -1 ? remaining : remaining.Slice(0, secondSpace);

        return int.TryParse(codeSpan, out statusCode);
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** `Span<T>` khác gì so với mảng thông thường (`T[]`)?
   - *Trả lời:* Mảng `T[]` luôn là một Reference Type được cấp phát cố định trên Managed Heap và được quản lý bởi GC. Ngược lại, `Span<T>` là một `ref struct` (Value Type thuần trên Stack) đóng vai trò là một view trỏ tới bất kỳ vùng nhớ liên tục nào (Stack, Heap, hoặc Native memory). Khi thực hiện thao tác cắt lát (Slicing), `Span<T>` chỉ điều chỉnh lại con trỏ và độ dài mà không sinh thêm bất kỳ đối tượng mới nào trên Heap, mang lại hiệu năng tối thượng cho ứng dụng.

2. **Câu hỏi:** Tại sao `Span<T>` không thể được gán cho biến kiểu `object` hay sử dụng làm thuộc tính của một `class`?
   - *Trả lời:* Vì `Span<T>` được khai báo dưới dạng `ref struct`, một loại kiểu đặc biệt được bảo đảm chỉ tồn tại trên Call Stack của luồng thực thi hiện tại. Nếu cho phép boxing thành `object` hoặc gán vào trường của một `class`, `Span<T>` sẽ bị chuyển lên Managed Heap. Lúc này, con trỏ bên trong nó có thể đang trỏ vào một vùng nhớ Stack đã bị giải phóng sau khi hàm kết thúc, dẫn đến lỗi bảo mật nghiêm trọng hoặc sập tiến trình do truy cập vùng nhớ rác.
