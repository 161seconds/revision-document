# Bài 4: Đa Hình: Virtual, Abstract & Override (Polymorphism)

> **Trọng tâm bài học:** Bản chất của Tính đa hình (Polymorphism), bảng phương thức ảo (Virtual Method Table - vtable), phân biệt `virtual` vs `abstract`, và bẫy phỏng vấn kinh điển giữa `override` (ghi đè đa hình) vs `new` (che khuất phương thức - method shadowing).

---

## 1. Tính Đa Hình (Polymorphism) Hoạt Động Như Thế Nào?

Tính đa hình cho phép bạn đối xử với các đối tượng thuộc các lớp con khác nhau như thể chúng cùng thuộc về lớp cha, nhưng khi gọi phương thức, hành vi cụ thể của **lớp con tương ứng** sẽ được kích hoạt tại thời điểm chạy (Runtime dynamic dispatch).

```csharp
Item[] inventory = new Item[]
{
    new Weapon("Excalibur", 500, 5.0f, 100),
    new Armor("Dragon Shield", 300, 10.0f, 50),
    new Potion("Healing Elixir", 50, 0.5f, 200)
};

// Gọi cùng một phương thức Use() nhưng mỗi món đồ thực hiện một hành vi hoàn toàn khác nhau!
foreach (Item item in inventory)
{
    item.Use(); // Tính Đa Hình phát huy tác dụng!
}
```

---

## 2. Phân Biệt `virtual` và `abstract`

| Từ khóa | Định nghĩa | Có thân hàm mặc định không? | Lớp con bắt buộc phải override? |
| :--- | :--- | :---: | :---: |
| **`virtual`** | Phương thức ảo trong lớp thông thường | **Có** (Cung cấp cài đặt mặc định) | **Không bắt buộc** (Lớp con có thể ghi đè nếu muốn thay đổi) |
| **`abstract`** | Phương thức trừu tượng (chỉ có trong `abstract class`) | **Không có** (Chỉ có chữ ký hàm) | **Bắt buộc 100%** (Lớp con phải tự cài đặt) |

```csharp
namespace BootCamp.Chapter
{
    // Không thể dùng new Item() vì đây là lớp trừu tượng
    public abstract class Item
    {
        public string Name { get; }

        protected Item(string name)
        {
            Name = name;
        }

        // Phương thức trừu tượng: Mọi vật phẩm BẮT BUỘC phải tự định nghĩa cách dùng
        public abstract void Use();

        // Phương thức ảo: Có sẵn cài đặt mặc định, lớp con có quyền ghi đè hoặc giữ nguyên
        public virtual string GetDescription()
        {
            return $"Vật phẩm: {Name}";
        }
    }

    public class Weapon : Item
    {
        public int Damage { get; }

        public Weapon(string name, int damage) : base(name)
        {
            Damage = damage;
        }

        public override void Use()
        {
            Console.WriteLine($"Vung vũ khí {Name}, chém gây {Damage} sát thương!");
        }

        public override string GetDescription()
        {
            return $"{base.GetDescription()} (Sát thương: {Damage})";
        }
    }
}
```

---

## 3. Bẫy Phỏng Vấn Kinh Điển: `override` vs `new` (Shadowing)

Đây là câu hỏi thường xuyên xuất hiện trong các buổi phỏng vấn tuyển dụng C# .NET:

```csharp
public class BaseClass
{
    public virtual void Method1() => Console.WriteLine("Base Method1");
    public void Method2() => Console.WriteLine("Base Method2");
}

public class DerivedClass : BaseClass
{
    public override void Method1() => Console.WriteLine("Derived Method1");
    public new void Method2() => Console.WriteLine("Derived Method2"); // Che khuất (Hiding)
}
```

### Điều gì xảy ra khi chạy đoạn code sau?
```csharp
BaseClass obj = new DerivedClass();

obj.Method1(); // IN RA: "Derived Method1" (Do override kích hoạt tra cứu vtable theo đối tượng thực tế)
obj.Method2(); // IN RA: "Base Method2"    (Do new chỉ che khuất tại thời điểm biên dịch theo kiểu biến!)
```

> [!WARNING]
> Từ khóa `new` không tạo ra hành vi đa hình thời gian chạy. Nó chỉ che giấu phương thức khi đối tượng được tham chiếu bởi biến kiểu lớp con. Hầu như luôn luôn nên dùng `override` thay vì `new`.
