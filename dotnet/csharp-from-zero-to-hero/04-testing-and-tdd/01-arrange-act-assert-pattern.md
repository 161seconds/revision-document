# Bài 1: Mô Hình 3A: Arrange - Act - Assert Trong Unit Testing

> **Trọng tâm bài học:** Giải phẫu cấu trúc một bài kiểm thử đơn vị chuẩn mực theo mô hình 3A (Arrange, Act, Assert), quy ước đặt tên bài test mang tính tài liệu (Self-documenting tests), sử dụng xUnit và kiểm thử các kịch bản ngoại lệ (`Assert.Throws`).

---

## 1. Cấu Trúc 3A Trong Kiểm Thử Đơn Vị

Mỗi Unit Test chuyên nghiệp luôn được phân tách rõ ràng thành 3 giai đoạn:

```mermaid
graph LR
    Arrange["1. Arrange (Chuẩn bị)<br/>Khởi tạo dữ liệu đầu vào & đối tượng"] --> Act["2. Act (Hành động)<br/>Gọi phương thức cần kiểm thử"]
    Act --> Assert["3. Assert (Khẳng định)<br/>So khớp kết quả thực tế với kỳ vọng"]
```

1. **Arrange (Thiết lập):** Khởi tạo đối tượng cần kiểm tra (SUT - System Under Test), chuẩn bị dữ liệu giả định, cấu hình các tham số đầu vào.
2. **Act (Kích hoạt):** Gọi chính xác phương thức nghiệp vụ cần kiểm tra với các tham số đã chuẩn bị.
3. **Assert (Khẳng định):** Kiểm tra xem kết quả trả về hoặc trạng thái của hệ thống có khớp 100% với kỳ vọng ban đầu hay không.

---

## 2. Quy Ước Đặt Tên Test Case Chuẩn Mực

Một hàm test phải đóng vai trò như một câu văn mô tả nghiệp vụ hoàn chỉnh theo cấu trúc:  
`[TênHàmCầnTest]_[TrườngHợpKiểmThử]_[KếtQuảKỳVọng]`

- ✅ Tốt: `CalculateBmi_WhenWeightAndHeightArePositive_ReturnsCorrectBmi()`
- ✅ Tốt: `Withdraw_WhenAmountExceedsBalance_ReturnsFalse()`
- ❌ Xấu: `Test1()`, `CheckBmi()`, `TestWithdraw()` (Không cho biết mục đích test là gì khi xem log CI/CD bị fail).

---

## 3. Code Mẫu xUnit Thực Tế (Trích Từ Repo)

```csharp
using System;
using Xunit;

namespace BootCamp.Chapter.Tests
{
    public class CalculatorTests
    {
        [Fact]
        public void Divide_WithValidNumbers_ReturnsCorrectQuotient()
        {
            // 1. Arrange
            var calculator = new Calculator();
            int numerator = 10;
            int denominator = 2;

            // 2. Act
            double result = calculator.Divide(numerator, denominator);

            // 3. Assert
            Assert.Equal(5.0, result);
        }

        [Fact]
        public void Divide_ByZero_ThrowsDivideByZeroException()
        {
            // 1. Arrange
            var calculator = new Calculator();

            // 2. Act & 3. Assert (Kiểm tra ngoại lệ mong đợi)
            Assert.Throws<DivideByZeroException>(() =>
            {
                calculator.Divide(10, 0);
            });
        }

        // Kiểm tra nhiều bộ dữ liệu khác nhau với [Theory] và [InlineData]
        [Theory]
        [InlineData(70, 1.75, 22.86)]
        [InlineData(50, 1.565, 20.41)]
        [InlineData(85, 1.80, 26.23)]
        public void CalculateBmi_WithMultipleInputs_ReturnsExpectedBmi(double weight, double heightM, double expectedBmi)
        {
            // Act
            double actualBmi = BmiCalculator.Calculate(weight, heightM);

            // Assert
            Assert.Equal(expectedBmi, Math.Round(actualBmi, 2));
        }
    }
}
```
