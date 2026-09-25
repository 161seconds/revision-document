# Bài 4: Web API RESTful & Bảo Mật Thực Chiến Trong .NET

> **Trọng tâm bài học:** Xây dựng dịch vụ RESTful Web API với ASP.NET Core, so sánh Controller-based API vs Minimal APIs, cấu hình vòng đời Dependency Injection (Transient, Scoped, Singleton), cơ chế xác thực JWT Authentication, và các biện pháp bảo mật cốt tử: Hashing mật khẩu an toàn (BCrypt/Argon2), chống SQL Injection và XSS.

---

## 1. RESTful API: Controllers vs Minimal APIs

ASP.NET Core hỗ trợ 2 phong cách xây dựng API:

### 1. Minimal APIs (Siêu nhẹ, hiệu năng cực cao, phù hợp Microservices):
```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/api/users/{id}", async (int id, IUserService userService) =>
{
    var user = await userService.GetByIdAsync(id);
    return user is not null ? Results.Ok(user) : Results.NotFound();
});

app.Run();
```

### 2. Controller-based APIs (Cấu trúc phân lớp truyền thống cho hệ thống lớn):
```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService) => _userService = userService;

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        return user != null ? Ok(user) : NotFound();
    }
}
```

---

## 2. Ba Vòng Đời Dependency Injection (DI Lifetimes)

| Vòng đời (Lifetime) | Cú pháp đăng ký | Thời gian sống của đối tượng | Trường hợp sử dụng chuẩn |
| :--- | :--- | :--- | :--- |
| **`Transient`** | `AddTransient<T, U>()` | Tạo mới một thể hiện **mỗi khi có yêu cầu** (Lightweight, Stateless) | Các bộ Validator, Converter, Helper không lưu trạng thái |
| **`Scoped`** | `AddScoped<T, U>()` | Tạo 1 thể hiện duy nhất **trong suốt 1 HTTP Request**, chia sẻ giữa các service trong cùng request đó | `DbContext`, `UnitOfWork`, `Repository` |
| **`Singleton`** | `AddSingleton<T, U>()` | Tạo 1 thể hiện duy nhất **trong toàn bộ vòng đời của ứng dụng Web** | Cache trong RAM, Memory Metrics, Client kết nối bên ngoài |

> [!CAUTION]
> **Bẫy Captive Dependencies (Giam cầm phụ thuộc):**
> Tuyệt đối không bao giờ inject một dịch vụ `Scoped` (như `DbContext`) vào một dịch vụ `Singleton`! Vì Singleton sống mãi mãi, nó sẽ giữ chặt `DbContext` trong RAM khiến kết nối không bao giờ được đóng, gây rò rỉ bộ nhớ và lỗi xung đột đa luồng!

---

## 3. Bảo Mật Web API Thực Chiến

### 1. Băm Mật Khẩu (Password Hashing):
Tuyệt đối không bao giờ lưu mật khẩu dạng văn bản thô (Plain Text) hay dùng các hàm băm nhanh (MD5, SHA256) vì dễ bị tấn công bảng cầu vồng (Rainbow Table). Luôn sử dụng các thuật toán băm chậm có Salt như **Argon2id** hoặc **BCrypt**:
```csharp
// Sử dụng BCrypt.Net-Next
string passwordHash = BCrypt.Net.BCrypt.HashPassword("UserSecurePassword123!");
bool isValid = BCrypt.Net.BCrypt.Verify("UserSecurePassword123!", passwordHash);
```

### 2. Phòng Chống SQL Injection:
- EF Core sử dụng cơ chế Parameterized Queries mặc định trong LINQ, giúp loại bỏ 100% nguy cơ SQL Injection.
- Nếu phải dùng Raw SQL, luôn dùng cú pháp chuỗi nội suy tham số hóa:
  ```csharp
  // An toàn tuyệt đối: EF Core tự động biến {username} thành DbParameter!
  var user = db.Users.FromSqlInterpolated($"SELECT * FROM Users WHERE Username = {username}");
  ```
