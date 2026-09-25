# Bài 2: Open-Closed Principle (Nguyên Lý Đóng - Mở - OCP)

> **Trọng tâm bài học:** Triết lý cốt lõi của OCP: *"Software entities should be open for extension, but closed for modification"*. Phân tích Case Study kinh điển `TaxesCalculator` từ nhánh `Chapter5/Lesson/OCP`: Chuyển đổi từ chuỗi `if-else / switch` bẫy rập sang Đa hình giao diện (Interface Polymorphism).

---

## 1. Bản Chất Của OCP

- **Mở cho mở rộng (Open for extension):** Khi yêu cầu nghiệp vụ mới xuất hiện (ví dụ: luật thuế mới, phương thức thanh toán mới), bạn có thể bổ sung hành vi mới cho hệ thống.
- **Đóng cho sửa đổi (Closed for modification):** Bạn bổ sung tính năng mới bằng cách **viết thêm mã mới** (lớp mới), chứ **tuyệt đối không được can thiệp sửa đổi các lớp mã nguồn cũ đã chạy ổn định và đã được kiểm thử**.

```mermaid
graph TD
    Calculator["TaxesCalculator<br/>(CLOSED: Không bao giờ bị sửa lại)"] --> ITaxes["<<interface>><br/>ITaxes"]
    ITaxes <|.. VatTax["VatTax<br/>(OPEN: Thêm mới)"]
    ITaxes <|.. IncomeTax["IncomeTax<br/>(OPEN: Thêm mới)"]
    ITaxes <|.. LuxuryTax["LuxuryTax<br/>(OPEN: Thêm mới)"]
```

---

## 2. Case Study: Hệ Thống Tính Thuế `TaxesCalculator` (Trích Từ Repo)

### ❌ Code Vi Phạm OCP Nghiêm Trọng (`BadProps/TaxesCalculator.cs`):
```csharp
namespace BootCamp.Chapter.Examples.Polymorphism.BadProps
{
    public enum TaxType { Tax1, Tax2, Tax3 }

    public class Taxes
    {
        public TaxType Type { get; set; }
        public decimal Value { get; set; }
    }

    public static class TaxesCalculator1
    {
        // Mỗi khi quốc hội thông qua 1 loại thuế mới (Tax4, Tax5...):
        // 1. Phải sửa enum TaxType
        // 2. Phải mở file này ra, chèn thêm câu lệnh if-else!
        // -> Cực kỳ dễ gây hồi quy lỗi (Regression Bugs) cho các loại thuế cũ!
        public static decimal Calculate(Taxes taxes, decimal money)
        {
            if (taxes.Type == TaxType.Tax1)
            {
                return ComplexCalculation1(money, taxes.Value);
            }
            if (taxes.Type == TaxType.Tax2)
            {
                return ComplexCalculation2(money, taxes.Value);
            }
            if (taxes.Type == TaxType.Tax3)
            {
                return ComplexCalculation3(money, taxes.Value);
            }
            else
            {
                return money;
            }
        }
    }
}
```

### ✅ Code Tái Cấu Trúc Đạt Chuẩn OCP Tuyệt Đối (`Good/TaxesCalculator.cs`):

#### Bước 1: Trừu tượng hóa hợp đồng tính thuế qua `ITaxes`
```csharp
namespace BootCamp.Chapter.Examples.Polymorphism.Good
{
    public interface ITaxes
    {
        decimal DoComplexCalculation(decimal money);
    }
}
```

#### Bước 2: Mỗi loại thuế là một lớp độc lập tự đóng gói công thức của mình
```csharp
public class VatTax : ITaxes
{
    public decimal Rate { get; }
    public VatTax(decimal rate) => Rate = rate;

    public decimal DoComplexCalculation(decimal money) => money * (1 + Rate);
}

public class LuxuryTax : ITaxes
{
    public decimal DoComplexCalculation(decimal money) => money * 1.5m + 50000;
}
```

#### Bước 3: Lớp tính toán hoàn toàn đóng trước mọi sự thay đổi trong tương lai!
```csharp
namespace BootCamp.Chapter.Examples.Polymorphism.Good
{
    public static class TaxesCalculator3
    {
        // Hàm này ĐÓNG HOÀN TOÀN: Dù tương lai có 100 loại thuế mới,
        // hàm này vẫn giữ nguyên vẹn 1 dòng duy nhất, không bao giờ cần sửa!
        public static decimal Calculate(ITaxes taxes, decimal money)
        {
            return taxes.DoComplexCalculation(money);
        }
    }
}
```

---

## 3. Dấu Hiệu Nhận Biết Mã Nguồn Vi Phạm OCP
- Xuất hiện các khối `switch (type)` hoặc chuỗi dài `if (obj is TypeA) ... else if (obj is TypeB)` kiểm tra kiểu dữ liệu hoặc enum.
- Mỗi lần có thêm trường hợp mới, bạn phải tìm kiếm khắp codebase để thêm case tương ứng.
- **Biện pháp khắc phục:** Thay thế câu lệnh điều kiện bằng Đa hình (Replace Conditional with Polymorphism) hoặc áp dụng Strategy Pattern.
