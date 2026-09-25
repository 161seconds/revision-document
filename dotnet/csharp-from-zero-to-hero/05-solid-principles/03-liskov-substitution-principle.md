# Bài 3: Liskov Substitution Principle (Nguyên Lý Thay Thế Liskov - LSP)

> **Trọng tâm bài học:** Định lý toán học của Barbara Liskov: *"Các đối tượng của lớp con phải có khả năng thay thế hoàn toàn các đối tượng của lớp cha mà không làm thay đổi tính đúng đắn của chương trình"*. Phân tích bài toán kinh điển: Tại sao Hình vuông kế thừa Hình chữ nhật lại vi phạm LSP?

---

## 1. Định Nghĩa & Ý Nghĩa Thực Tiễn Của LSP

Nếu lớp $S$ là một lớp con của lớp $T$, thì các đối tượng kiểu $T$ có thể được thay thế bằng các đối tượng kiểu $S$ mà không làm thay đổi bất kỳ thuộc tính mong muốn nào của chương trình.

### 4 Vi Phạm Phổ Biến Nhất Của LSP Trong C#:
1. **Ném ngoại lệ `NotImplementedException` trong lớp con:** Lớp cha cam kết có hành vi đó, nhưng lớp con lại ném ngoại lệ vì không hỗ trợ!
2. **Làm suy yếu tiền điều kiện (Preconditions):** Lớp con đòi hỏi tham số khắt khe hơn lớp cha.
3. **Làm suy yếu hậu điều kiện (Postconditions):** Lớp con trả về giá trị không thỏa mãn kỳ vọng của lớp cha.
4. **Phá vỡ bất biến (Invariants):** Lớp con làm thay đổi các quy tắc toàn vẹn dữ liệu của lớp cha.

---

## 2. Nghịch Lý Kinh Điển: Hình Vuông Kế Thừa Hình Chữ Nhật

Trong hình học thuần túy: "Hình vuông là một hình chữ nhật có 2 cạnh bằng nhau".  
Nhưng trong Lập trình hướng đối tượng, nếu bạn cho `Square` kế thừa `Rectangle`, bạn sẽ **phá nát mã nguồn**!

### ❌ Code Vi Phạm LSP:
```csharp
public class Rectangle
{
    public virtual int Width { get; set; }
    public virtual int Height { get; set; }

    public int GetArea() => Width * Height;
}

public class Square : Rectangle
{
    // Vì hình vuông 2 cạnh bằng nhau, nên sửa Width thì Height phải đổi theo!
    public override int Width
    {
        get => base.Width;
        set { base.Width = value; base.Height = value; }
    }

    public override int Height
    {
        get => base.Height;
        set { base.Width = value; base.Height = value; }
    }
}
```

### Hậu quả tai hại khi thay thế đối tượng:
```csharp
void ResizeAndCheckArea(Rectangle rect)
{
    rect.Width = 5;
    rect.Height = 10;

    // Lập trình viên kỳ vọng diện tích hình chữ nhật là 5 * 10 = 50:
    Assert.Equal(50, rect.GetArea()); 
    // NẾU TRUYỀN VÀO new Square():
    // rect.Height = 10 làm cho Width cũng biến thành 10!
    // GetArea() trả về 100! Bài test THẤT BẠI!
}
```

### ✅ Giải Pháp: Tách biệt qua Interface Hình Học
```csharp
public interface IShape
{
    int GetArea();
}

public class Rectangle : IShape
{
    public int Width { get; set; }
    public int Height { get; set; }
    public int GetArea() => Width * Height;
}

public class Square : IShape
{
    public int SideLength { get; set; }
    public int GetArea() => SideLength * SideLength;
}
```

---

## 3. Dấu Hiệu Vi Phạm LSP Trong Codebase
- Bất cứ khi nào bạn thấy code kiểu:
  ```csharp
  if (bird is Penguin) // Ép kiểm tra kiểu cụ thể của lớp con!
  {
      // Không cho chim cánh cụt gọi hàm Fly() vì nó không biết bay!
  }
  ```
  Nếu lớp cha `Bird` có hàm `Fly()`, mà lớp con `Penguin` kế thừa `Bird` nhưng lại ném `throw new NotSupportedException("Chim cánh cụt không biết bay!")`, thì đó là **vi phạm LSP 100%**.
