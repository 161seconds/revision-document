# Module 02: OOP & Type System

Chào mừng bạn đến với **Module 02: OOP & Type System**. Module này đi sâu vào toàn bộ hệ thống phân cấp đối tượng trong C#, từ Class hiện đại với Primary Constructors (C# 12), kế thừa đa hình (`virtual`, `override`, `sealed`, phương thức ẩn `new`), tính năng Interface hiện đại (Default Interface Methods, Explicit Interface Implementation), đến sự phân hóa chuyên sâu giữa `struct`, `record class`, `record struct` và biểu thức biến đổi phi phá hủy `with`.

---

## Bản Đồ Học Tập (Learning Roadmap)

| Bài học | Nội dung cốt lõi | Mục tiêu đạt được |
| :--- | :--- | :--- |
| **[01. Classes & Constructors](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/01-classes-and-constructors.md)** | Classes, Primary Constructors (C# 12), Object Initializers, `init` only properties, Access Modifiers (`file`, `internal`) | Viết mã khởi tạo đối tượng ngắn gọn, an toàn bất biến mà không cần constructor boilerplate. |
| **[02. Inheritance & Polymorphism](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/02-inheritance-and-polymorphism.md)** | `virtual`, `override`, `sealed` class & method, Toán tử ẩn phương thức `new`, Chaining constructor `base()` | Làm chủ vTable và cơ chế đa hình động trong thời gian chạy (Runtime Dynamic Dispatch). |
| **[03. Interfaces & Abstract Classes](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/03-interfaces-and-abstract-classes.md)** | `interface`, Default Interface Methods (C# 8+), Explicit Interface Implementation, `abstract class` | Phân giải xung đột tên phương thức khi triển khai nhiều interface và áp dụng ISP nguyên tắc. |
| **[04. Structs, Records & Immutability](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/04-structs-records-and-immutability.md)** | `readonly struct`, `record class` vs `record struct`, Value-based Equality, Biểu thức `with`, Positional Records | Thiết kế Data Transfer Objects (DTO) và Value Objects chuẩn DDD bất biến hiệu năng cao. |

---

## File Thực Hành & Kiểm Thử Tự Động

- **File Demo Tổng Hợp**: [OopDemo.cs](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/OopDemo.cs) — Chạy trực tiếp qua `dotnet run --file OopDemo.cs`.
- **File Tự Luyện & Chấm Điểm**: [Practice.cs](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/Practice.cs) — Bộ 5 bài tập OOP & Type System kèm assertions tự động chấm qua `System.Diagnostics.Debug.Assert`.

---

## 3 Bẫy Phỏng Vấn Kinh Điển Cần Nhớ

1. **`override` vs `new` method hiding**: `override` ghi đè con trỏ trong vTable, bảo đảm dù gọi qua con trỏ lớp cha thì phương thức của lớp con vẫn được thực thi (Polymorphism). Từ khóa `new` chỉ ẩn phương thức ở lớp con; nếu gọi qua biến có kiểu khai báo là lớp cha, phương thức của lớp cha vẫn sẽ chạy!
2. **Explicit Interface Implementation không thể gọi từ Instance**: Khi triển khai interface tường minh (`void IDisposable.Dispose()`), phương thức này bị ẩn hoàn toàn khỏi instance của class và chỉ có thể gọi được khi ép kiểu đối tượng về interface đó (`((IDisposable)obj).Dispose()`).
3. **`record` mặc định so sánh theo giá trị (Value Equality)**: Hai instance `record` khác nhau được `new` độc lập trên Heap nhưng có các thuộc tính giống hệt nhau sẽ bằng nhau (`record1 == record2` trả về `true`), trong khi `class` thông thường sẽ trả về `false` (so sánh con trỏ tham chiếu).
