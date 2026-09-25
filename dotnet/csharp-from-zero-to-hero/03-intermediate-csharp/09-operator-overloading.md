# Bài 9: Nạp Chồng Toán Tử (Operator Overloading & Conversion)

> **Trọng tâm bài học:** Cách nạp chồng các toán tử số học (`+`, `-`, `*`), toán tử so sánh (`==`, `!=`, `<`, `>`), và định nghĩa các toán tử chuyển đổi kiểu ngầm định (`implicit`) vs tường minh (`explicit`) để tạo nên các kiểu dữ liệu miền (Domain Models) mạnh mẽ, tự nhiên.

---

## 1. Nạp Chồng Toán Tử Số Học & So Sánh

Khi xây dựng các kiểu dữ liệu toán học hoặc tiền tệ (như `Money`, `Vector2D`, `Fraction`), ta muốn sử dụng các phép toán tự nhiên như `m1 + m2` thay vì phải gọi hàm thô kệch `m1.Add(m2)`.

```csharp
namespace BootCamp.Chapter
{
    public struct Money : IEquatable<Money>
    {
        public decimal Amount { get; }
        public string Currency { get; }

        public Money(decimal amount, string currency = "VND")
        {
            Amount = amount;
            Currency = currency ?? throw new ArgumentNullException(nameof(currency));
        }

        // Nạp chồng toán tử cộng (+)
        public static Money operator +(Money a, Money b)
        {
            if (a.Currency != b.Currency)
                throw new InvalidOperationException($"Không thể cộng 2 loại tiền tệ khác nhau: {a.Currency} và {b.Currency}");

            return new Money(a.Amount + b.Amount, a.Currency);
        }

        // Nạp chồng toán tử trừ (-)
        public static Money operator -(Money a, Money b)
        {
            if (a.Currency != b.Currency)
                throw new InvalidOperationException("Khác loại tiền tệ!");

            return new Money(a.Amount - b.Amount, a.Currency);
        }

        // QUY TẮC BẮT BUỘC: Khi nạp chồng == thì BẮT BUỘC phải nạp chồng !=
        public static bool operator ==(Money a, Money b) => a.Equals(b);
        public static bool operator !=(Money a, Money b) => !a.Equals(b);

        public bool Equals(Money other) => Amount == other.Amount && Currency == other.Currency;
        public override bool Equals(object obj) => obj is Money other && Equals(other);
        public override int GetHashCode() => HashCode.Combine(Amount, Currency);
        public override string ToString() => $"{Amount:N0} {Currency}";
    }
}
```

---

## 2. Toán Tử Chuyển Đổi Kiểu: `implicit` vs `explicit`

- **`implicit` (Ngầm định):** Dùng khi phép chuyển đổi an toàn 100%, không bao giờ mất mát dữ liệu hoặc gây lỗi.
- **`explicit` (Tường minh):** Dùng khi phép chuyển đổi có khả năng gây mất mát độ chính xác hoặc có thể văng ngoại lệ (bắt buộc người dùng phải gõ `(Type)value`).

```csharp
public struct Celsius
{
    public double Degrees { get; }
    public Celsius(double degrees) => Degrees = degrees;

    // Chuyển ngầm định từ double sang Celsius
    public static implicit operator Celsius(double val) => new Celsius(val);

    // Chuyển ngầm định từ Celsius sang double
    public static implicit operator double(Celsius c) => c.Degrees;
}

// Sử dụng cực kỳ thanh lịch:
Celsius c = 25.5; // Tự động gọi implicit operator
double temp = c;  // Tự động giải nén ra số double
```
