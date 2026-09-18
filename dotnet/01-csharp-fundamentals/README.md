# Module 01: C# Fundamentals

Chào mừng bạn đến với **Module 01: C# Fundamentals**. Module này đặt nền tảng vững chắc nhất về ngôn ngữ C# hiện đại, giải thích cội nguồn bản chất của hệ thống kiểu Common Type System (CTS), sự phân tách sinh tử giữa Value Types (Stack) và Reference Types (Heap), cơ chế Nullable (`int?` và Nullable Reference Types), cú pháp Pattern Matching thế hệ mới (`switch` expression, Property/Relational/Positional/List patterns), các bổ từ tham số (`ref`, `out`, `in`, `params`), và kỹ thuật tối ưu hóa bộ nhớ với `Span<T>`.

---

## Bản Đồ Học Tập (Learning Roadmap)

| Bài học | Nội dung cốt lõi | Mục tiêu đạt được |
| :--- | :--- | :--- |
| **[01. Syntax, Types & Operators](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/01-syntax-types-and-operators.md)** | CTS Types, Value Type vs Reference Type, Nullable Types, String Immutability, `StringBuilder`, Ép kiểu an toàn (`is`, `as`) | Nắm chắc bản đồ phân bổ bộ nhớ Stack/Heap và triệt tiêu lỗi `NullReferenceException`. |
| **[02. Control Flow & Pattern Matching](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/02-control-flow-and-pattern-matching.md)** | `switch` expression, Property Pattern, Relational Pattern (`> 100 and < 500`), Positional Pattern, List Pattern | Viết các biểu thức phân nhánh rẽ nhánh súc tích, an toàn và dễ đọc thay thế `if-else` lồng nhau. |
| **[03. Methods & Parameter Modifiers](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/03-methods-and-parameter-modifiers.md)** | Method Overloading, `ref`, `out`, `in` (ReadOnly reference), `params`, Optional arguments, Local Functions | Tối ưu hóa hiệu năng truyền dữ liệu struct lớn và kiểm soát hướng đi của dữ liệu hàm. |
| **[04. Arrays & Memory Spans](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/04-arrays-and-memory-spans.md)** | Mảng 1 chiều, Đa chiều (`[,]`), Mảng răng cưa (`[][]`), `Span<T>` & `ReadOnlySpan<T>`, Tránh cấp phát Heap khi Slice chuỗi/mảng | Làm chủ cấu trúc `Span<T>` zero-allocation chuẩn hóa trong các thư viện xử lý dữ liệu tốc độ cao. |

---

## File Thực Hành & Kiểm Thử Tự Động

- **File Demo Tổng Hợp**: [FundamentalsDemo.cs](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/FundamentalsDemo.cs) — Chạy trực tiếp qua `dotnet run --file FundamentalsDemo.cs`.
- **File Tự Luyện & Chấm Điểm**: [Practice.cs](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/Practice.cs) — Bộ 5 bài tập C# Fundamentals kèm assertions tự động chấm qua `System.Diagnostics.Debug.Assert`.

---

## 3 Bẫy Phỏng Vấn Kinh Điển Cần Nhớ

1. **Boxing và Unboxing gây thắt cổ chai hiệu năng**: Boxing là quá trình chuyển đổi một Value Type (như `int`, `struct`) thành Reference Type (`object` hoặc `interface`) để lưu trên Heap. Quá trình này đòi hỏi cấp phát bộ nhớ mới trên Heap và tạo thêm áp lực cho Garbage Collection. Luôn sử dụng Generics (`List<int>` thay vì `ArrayList`) để tránh Boxing.
2. **`in` modifier bảo vệ dữ liệu nhưng có thể sinh Defensive Copy**: Nếu truyền một `struct` thông thường bằng từ khóa `in` và gọi một phương thức/thuộc tính không được đánh dấu `readonly`, trình biên dịch sẽ âm thầm tạo một bản sao ẩn (Defensive Copy) của struct đó trước khi gọi, làm giảm hiệu năng! Khắc phục: Khai báo struct là `readonly struct`.
3. **`string` là Reference Type nhưng có hành vi giống Value Type**: Phép gán chuỗi hoặc truyền chuỗi qua hàm sao chép con trỏ tham chiếu, nhưng chuỗi trong C# là **Bất biến (Immutable)**. Bất kỳ thao tác nối chuỗi (`+`) nào cũng tạo ra một vùng nhớ Heap mới. Hãy dùng `StringBuilder` hoặc `string.Create` khi nối chuỗi trong vòng lặp.
