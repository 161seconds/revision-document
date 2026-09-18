# 02. Inheritance & Polymorphism

Kế thừa đơn, cơ chế đa hình động vTable, từ khóa `virtual`/`override`/`sealed` và sự khác biệt với phương thức ẩn `new`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Classes & Constructors](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/01-classes-and-constructors.md)
- **Tiếp theo:** [Interfaces & Abstract Classes](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/03-interfaces-and-abstract-classes.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Bảng Phương Thức Ảo (vTable) Trong CLR
Khi một phương thức được đánh dấu là `virtual`:
- CLR sẽ tạo ra một ô nhớ chứa con trỏ hàm trong **Bảng phương thức ảo (Virtual Method Table - vTable)** của Class.
- Khi lớp con ghi đè bằng từ khóa `override`, con trỏ hàm trong vTable của lớp con sẽ được trỏ tới địa chỉ của phương thức mới ở lớp con.
- Tại runtime, lời gọi hàm sẽ tra cứu vào vTable của đối tượng thực tế trên Heap (Dynamic Dispatch) $\rightarrow$ Đạt được tính đa hình.

### 2.2 `override` vs `new` (Method Hiding)

```csharp
public class Parent {
    public virtual void Speak() => Console.WriteLine("Parent");
}

public class ChildOverride : Parent {
    public override void Speak() => Console.WriteLine("Child Override");
}

public class ChildNew : Parent {
    public new void Speak() => Console.WriteLine("Child New");
}
```

Hãy quan sát sự khác biệt chí mạng khi gọi thông qua biến kiểu `Parent`:
```csharp
Parent p1 = new ChildOverride();
p1.Speak(); // In ra: "Child Override" (vTable điều hướng chính xác tới lớp con)

Parent p2 = new ChildNew();
p2.Speak(); // In ra: "Parent" (BỊ BẪY! Từ khóa "new" chỉ ẩn phương thức lúc gọi trực tiếp, không sửa vTable!)
```

### 2.3 Từ Khóa `sealed`
- Áp dụng trên Class: Ngăn cấm tuyệt đối việc kế thừa (`public sealed class FinalClass`).
- Áp dụng trên Phương thức: Khi kết hợp với `override`, nó ngăn chặn các lớp con phía dưới tiếp tục ghi đè phương thức đó:
  ```csharp
  public override sealed void SecureMethod() { ... }
  ```
- **Tối ưu hóa hiệu năng (JIT Devirtualization):** Khi một class hoặc method được đánh dấu `sealed`, JIT Compiler có thể loại bỏ hoàn toàn việc tra cứu vTable và biến lời gọi hàm thành gọi trực tiếp (Direct call / Inlining), tăng tốc độ thực thi đáng kể.

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên từ khóa `override` hoặc vô tình dùng `new`
Nếu lớp con khai báo một phương thức trùng tên với phương thức `virtual` của lớp cha mà không có từ khóa nào, compiler sẽ cảnh báo và ngầm áp dụng `new`, phá vỡ tính đa hình toàn cục của hệ thống.

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Template Method Pattern trong Game Engine
public abstract class GameEntity {
    public int Health { get; protected set; } = 100;

    // Non-virtual Template Method (Khung điều khiển cố định)
    public void TakeDamage(int damage) {
        int actualDamage = CalculateMitigatedDamage(damage);
        Health = Math.Max(0, Health - actualDamage);
        OnHealthChanged();
    }

    // Virtual hook cho lớp con ghi đè cách giảm sát thương
    protected virtual int CalculateMitigatedDamage(int rawDamage) => rawDamage;

    // Abstract hook bắt buộc lớp con phải triển khai
    protected abstract void OnHealthChanged();
}

public class ArmoredHero : GameEntity {
    public int ArmorDefense { get; init; } = 10;

    protected override int CalculateMitigatedDamage(int rawDamage) {
        return Math.Max(1, rawDamage - ArmorDefense);
    }

    protected override void OnHealthChanged() {
        Console.WriteLine($"Hero health updated: {Health}");
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Phân biệt cơ chế đa hình khi dùng `override` và phương thức ẩn khi dùng `new`?
   - *Trả lời:* `override` can thiệp trực tiếp vào Bảng phương thức ảo (vTable) của CLR, thay thế con trỏ hàm của phương thức ảo từ lớp cha bằng phương thức của lớp con. Do đó, dù gọi qua tham chiếu kiểu lớp cha hay lớp con, phương thức của lớp con vẫn luôn được thực thi. Ngược lại, `new` chỉ tạo ra một phương thức hoàn toàn độc lập ở lớp con và ẩn phương thức của lớp cha đi (không sửa vTable). Nếu gọi qua tham chiếu kiểu lớp cha, phương thức ban đầu của lớp cha vẫn được gọi.

2. **Câu hỏi:** Tại sao nên cân nhắc đánh dấu `sealed` cho các lớp không có chủ đích kế thừa?
   - *Trả lời:* Về mặt kiến trúc, `sealed` bảo đảm tính toàn vẹn nghiệp vụ, ngăn chặn việc phá vỡ nguyên lý Liskov Substitution (LSP) bởi các lớp con không mong muốn. Về mặt hiệu năng, JIT Compiler của .NET có thể áp dụng kỹ thuật Devirtualization: biến các lời gọi phương thức ảo thành lời gọi trực tiếp (Direct Call) hoặc thậm chí nhúng thẳng mã nguồn (Inlining), loại bỏ hoàn toàn chi phí tra cứu vTable lúc chạy.
