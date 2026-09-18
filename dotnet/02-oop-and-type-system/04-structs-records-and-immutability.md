# 04. Structs, Records & Immutability

Cấu trúc Value Type với `struct`, `readonly struct`, kiến trúc Record (`record class` vs `record struct`), tính bằng nhau theo giá trị và biểu thức biến đổi `with`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Interfaces & Abstract Classes](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/03-interfaces-and-abstract-classes.md)
- **Tiếp theo:** [Module 03: Generics & Collections](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/README.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Struct & `readonly struct`
- `struct` là Value Type, cấp phát trên Stack.
- Khi một struct được đánh dấu là `readonly struct`, **mọi trường dữ liệu bên trong nó bắt buộc phải là `readonly`**.
- Trình biên dịch bảo đảm rằng không có bất kỳ phương thức nào có thể đột biến (mutate) trạng thái của struct, cho phép CLR loại bỏ hoàn toàn việc tạo bản sao phòng vệ (Defensive Copy) khi truyền qua tham số `in`.

```csharp
public readonly struct Vector2D(double x, double y) {
    public double X { get; } = x;
    public double Y { get; } = y;
    public double Magnitude => Math.Sqrt(X * X + Y * Y);
}
```

### 2.2 Record Class vs Record Struct (C# 9 - 10)
`record` là một cú pháp đặc biệt của C# được thiết kế tối ưu cho **Dữ liệu bất biến (Immutability)** và **Bằng nhau theo giá trị (Value-based Equality)**:
- **`record` hoặc `record class`:** Bản chất là một **Reference Type** trên Heap, nhưng trình biên dịch tự động sinh ra các phương thức: `Equals`, `GetHashCode`, toán tử `==`, `!=`, phương thức `ToString()` đẹp mắt, và hàm phân rã `Deconstruct`.
- **`record struct` (C# 10+):** Là một **Value Type** trên Stack, kết hợp ưu điểm không cấp phát Heap của struct với các phương thức so sánh tự động của record.

```csharp
// Positional Record (Tự động sinh constructor, properties init-only, Deconstruct)
public record UserRecord(int Id, string Username, string Role);

var u1 = new UserRecord(1, "Alice", "Admin");
var u2 = new UserRecord(1, "Alice", "Admin");

// Value-based Equality: So sánh bằng giá trị các trường
Console.WriteLine(u1 == u2); // TRUE! (Trong khi class thông thường sẽ là FALSE)
```

### 2.3 Biến Đổi Phi Phá Hủy Với Biểu Thức `with`
Trong lập trình hướng dữ liệu bất biến, thay vì sửa trực tiếp một thuộc tính, ta tạo ra một bản sao mới với một vài trường được cập nhật:

```csharp
var original = new UserRecord(1, "Alice", "Admin");

// Biểu thức "with": Copy toàn bộ các trường, chỉ thay đổi Role
var promoted = original with { Role = "SuperAdmin" };

Console.WriteLine(promoted.Role);      // "SuperAdmin"
Console.WriteLine(original.Role);      // "Admin" (Dữ liệu gốc hoàn toàn nguyên vẹn)
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Dùng Struct có kích thước quá lớn (> 16 bytes)
Struct được truyền qua hàm theo cơ chế sao chép giá trị (Copy by value). Nếu struct chứa quá nhiều trường dữ liệu (ví dụ > 32 bytes), chi phí sao chép bộ nhớ trên Stack qua các lời gọi hàm sẽ lớn hơn rất nhiều so với chi phí cấp phát một con trỏ tham chiếu của Class!
**Khuyên dùng từ Microsoft:** Chỉ dùng `struct` khi kích thước $\le 16$ bytes và có vòng đời ngắn.

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Value Object Money chuẩn Domain-Driven Design (DDD)
public readonly record struct Money(decimal Amount, string Currency) {
    public Money Add(Money other) {
        if (Currency != other.Currency) {
            throw new InvalidOperationException($"Cannot add different currencies: {Currency} and {other.Currency}");
        }
        return this with { Amount = Amount + other.Amount };
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Phân biệt cơ chế so sánh bằng (`==` và `.Equals()`) giữa `class` và `record` trong C#?
   - *Trả lời:* Mặc định trong `class`, toán tử `==` thực hiện so sánh tham chiếu (Reference Equality): hai biến chỉ bằng nhau nếu chúng cùng trỏ tới một địa chỉ ô nhớ duy nhất trên Heap. Ngược lại, trong `record`, trình biên dịch tự động ghi đè phương thức `Equals` và toán tử `==` để thực hiện so sánh theo giá trị (Value-based Equality): hai instance record khác nhau được tạo ra độc lập trên Heap vẫn được coi là bằng nhau nếu tất cả các thuộc tính tương ứng của chúng có giá trị bằng nhau.

2. **Câu hỏi:** `readonly struct` giúp cải thiện hiệu năng như thế nào khi kết hợp với bổ từ tham số `in`?
   - *Trả lời:* Khi truyền một struct thông thường bằng từ khóa `in`, do struct đó có thể bị đột biến trạng thái từ bên trong, trình biên dịch phải tạo một bản sao ẩn (Defensive Copy) trên Stack trước khi gọi bất kỳ phương thức nào để bảo đảm tính an toàn. Khi struct được khai báo là `readonly struct`, trình biên dịch biết chắc 100% rằng không có phương thức nào có thể thay đổi dữ liệu của nó, do đó nó loại bỏ hoàn toàn bản sao phòng vệ, truyền trực tiếp con trỏ tham chiếu mà không tốn thêm bất kỳ byte bộ nhớ nào.
