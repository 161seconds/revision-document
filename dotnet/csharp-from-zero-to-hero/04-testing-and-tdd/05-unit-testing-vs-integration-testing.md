# Bài 5: Unit Testing vs Integration Testing (Kim Tự Tháp Kiểm Thử)

> **Trọng tâm bài học:** Bản chất của Kim tự tháp kiểm thử (Test Pyramid), ranh giới giữa Kiểm thử đơn vị (Unit Test) và Kiểm thử tích hợp (Integration Test), cách thiết lập `WebApplicationFactory` để test toàn bộ một API ASP.NET Core với cơ sở dữ liệu thật/test container.

---

## 1. Kim Tự Tháp Kiểm Thử (The Test Pyramid)

```
        / \
       /   \        E2E / UI Tests (Số lượng ít nhất, chạy chậm nhất, dễ chập chờn Flaky)
      /-----\
     /       \      Integration Tests (Kiểm thử tích hợp các module: App + DB + Queue)
    /---------\
   /           \    Unit Tests (Nền móng: Số lượng nhiều nhất, chạy siêu nhanh ~mili giây, cô lập 100%)
  /-------------\
```

| Tiêu chí | Unit Testing (Kiểm thử đơn vị) | Integration Testing (Kiểm thử tích hợp) |
| :--- | :--- | :--- |
| **Phạm vi** | Kiểm tra 1 phương thức/lớp đơn lẻ trong sự cô lập tuyệt đối | Kiểm tra sự phối hợp giữa 2 hoặc nhiều thành phần (App + DB, Service + Queue) |
| **Phụ thuộc ngoài** | **Mock/Stub 100%** (Không kết nối mạng, không đĩa, không DB) | **Sử dụng tài nguyên thật** (Database test, Docker Testcontainers, Web Server) |
| **Tốc độ thực thi** | Hàng nghìn test chạy trong 1-2 giây | Hàng trăm test mất từ vài chục giây đến vài phút |
| **Độ tin cậy** | Đảm bảo logic nghiệp vụ (Business Rules) tính toán đúng | Đảm bảo câu lệnh SQL đúng cú pháp, kết nối mạng thông suốt, cấu hình DI chuẩn |

---

## 2. Kiểm Thử Tích Hợp ASP.NET Core Với `WebApplicationFactory`

Trong .NET, thư viện `Microsoft.AspNetCore.Mvc.Testing` cung cấp lớp `WebApplicationFactory<Program>` giúp khởi chạy một máy chủ Web ảo (In-Memory TestServer) hoàn chỉnh để test các HTTP Endpoints:

```csharp
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetWeatherForecast_ReturnsOkAndJsonData()
    {
        // 1. Arrange: Tạo một HttpClient kết nối vào Test Server
        var client = _factory.CreateClient();

        // 2. Act: Bắn một HTTP GET Request thật
        var response = await client.GetAsync("/weatherforecast");

        // 3. Assert: Kiểm tra mã trạng thái HTTP 200 OK
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        string json = await response.Content.ReadAsStringAsync();
        Assert.Contains("temperatureC", json);
    }
}
```
