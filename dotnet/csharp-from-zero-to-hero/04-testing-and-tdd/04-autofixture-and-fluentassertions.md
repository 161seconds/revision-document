# Bài 4: Tự Động Hóa Dữ Liệu Test & Assertion Thanh Lịch (AutoFixture & FluentAssertions)

> **Trọng tâm bài học:** Giải quyết nỗi ám ảnh phải viết tay hàng tá dữ liệu giả lập (Test Data Clutter) bằng `AutoFixture`, và nâng cấp các câu lệnh `Assert` khô khan thành các câu văn tiếng Anh tự nhiên, biểu cảm bằng `FluentAssertions`.

---

## 1. AutoFixture: Máy Sinh Dữ Liệu Test Tự Động

Khi một lớp có 20 thuộc tính, việc viết tay `new User { Id = 1, Name = "Alice", Email = "...", Address = "...", Phone = "..." }` làm cho phần `Arrange` dài cả trang code và gây xao nhãng khỏi mục tiêu chính của bài test.
- `AutoFixture` tự động sinh ra một đối tượng hoàn chỉnh với tất cả các thuộc tính được điền dữ liệu ngẫu nhiên hợp lệ một cách ẩn danh (Anonymous Test Data).

```csharp
using AutoFixture;
using Xunit;

public class AutoFixtureDemo
{
    [Fact]
    public void RegisterUser_GeneratesComplexUserInstantly()
    {
        // 1. Khởi tạo Fixture
        var fixture = new Fixture();

        // 2. Tự động sinh ra 1 User hoàn chỉnh cùng các object con lồng nhau!
        var user = fixture.Create<User>();

        // 3. Tự động sinh ra 1 danh sách 10 sản phẩm ngẫu nhiên
        var products = fixture.CreateMany<Product>(10);

        Assert.NotNull(user);
        Assert.NotEmpty(products);
    }
}
```

---

## 2. FluentAssertions: Khẳng Định Đọc Như Văn Xuôi

Thay vì cú pháp đảo ngược khó nhớ của `Assert.Equal(expected, actual)` trong xUnit (dễ nhầm lẫn vị trí tham số):
`FluentAssertions` cho phép bạn viết theo luồng tư duy tự nhiên: `actual.Should().Be(expected)`.

```csharp
using FluentAssertions;
using Xunit;

public class FluentAssertionsDemo
{
    [Fact]
    public void TestStringAndCollections()
    {
        string text = "C# From Zero To Hero";

        // Khẳng định chuỗi
        text.Should().StartWith("C#")
            .And.EndWith("Hero")
            .And.Contain("Zero")
            .And.HaveLength(20);

        // Khẳng định danh sách
        var numbers = new[] { 1, 2, 3, 4, 5 };
        numbers.Should().NotBeEmpty()
               .And.HaveCount(5)
               .And.ContainInOrder(1, 2, 3)
               .And.OnlyHaveUniqueItems();

        // Khẳng định thời gian (DateTime)
        DateTime now = DateTime.UtcNow;
        now.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }
}
```
