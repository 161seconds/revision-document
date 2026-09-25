# Bài 3: Thiết Kế Dễ Test & Kỹ Thuật Mocking (Test Doubles & Moq)

> **Trọng tâm bài học:** Bản chất của việc "Thiết kế hướng kiểm thử" (Design for Testability), phân loại 5 kiểu đóng thế kiểm thử (Test Doubles: Dummy, Stub, Fake, Mock, Spy) của Gerard Meszaros, và cách sử dụng thư viện `Moq` chuyên nghiệp trong .NET.

---

## 1. Phân Biệt 5 Loại Test Doubles (Đối Tượng Đóng Thế)

Khi viết Unit Test, ta cần cô lập hoàn toàn SUT (System Under Test) khỏi các phụ thuộc ngoài (Database, Network, File System, Clock). Ta thay thế các phụ thuộc thật bằng **Test Doubles**:

1. **Dummy:** Đối tượng "bù nhìn", chỉ truyền vào để thỏa mãn chữ ký hàm, không bao giờ được gọi thực sự.
2. **Stub:** Đối tượng trả về dữ liệu cứng (Hardcoded data) đã được chuẩn bị trước cho một câu hỏi nhất định (ví dụ: luôn trả về `User { Id = 1 }` khi gọi `GetUserById`).
3. **Fake:** Đối tượng có cài đặt mã nguồn thực tế nhưng được đơn giản hóa để chạy nhanh trên RAM (ví dụ: `InMemoryUserRepository` sử dụng `List<User>` thay vì kết nối SQL Server).
4. **Mock:** Đối tượng được lập trình sẵn các kỳ vọng (Expectations) về hành vi: phương thức nào phải được gọi, gọi bao nhiêu lần, với tham số nào. Nếu không thỏa mãn, bài test sẽ fail!
5. **Spy:** Ghi lại lịch sử các cuộc gọi (ví dụ: đếm xem email đã gửi bao nhiêu lần).

---

## 2. Thực Hành Thư Viện `Moq` Trong C#

`Moq` là thư viện mocking phổ biến nhất trong hệ sinh thái .NET:

```csharp
using Moq;
using Xunit;

public class OrderProcessorTests
{
    [Fact]
    public void ProcessOrder_WhenPaymentSucceeds_SendsNotificationEmail()
    {
        // 1. Arrange: Tạo Mock cho 2 phụ thuộc Interface
        var mockPaymentGateway = new Mock<IPaymentGateway>();
        var mockEmailService = new Mock<IEmailService>();

        // Thiết lập Stub: Giả lập thanh toán luôn thành công khi nhận $100
        mockPaymentGateway
            .Setup(p => p.Charge(It.IsAny<decimal>()))
            .Returns(true);

        var processor = new OrderProcessor(mockPaymentGateway.Object, mockEmailService.Object);
        var order = new Order { Id = 123, TotalAmount = 100, CustomerEmail = "alice@example.com" };

        // 2. Act
        processor.Process(order);

        // 3. Assert (Behavior Verification):
        // Xác minh rằng cổng thanh toán đã được gọi đúng 1 lần với số tiền 100
        mockPaymentGateway.Verify(p => p.Charge(100), Times.Once);

        // Xác minh rằng email thông báo đã được gửi chính xác đến khách hàng
        mockEmailService.Verify(e => e.SendEmail("alice@example.com", It.Is<string>(msg => msg.Contains("thành công"))), Times.Once);
    }
}
```
