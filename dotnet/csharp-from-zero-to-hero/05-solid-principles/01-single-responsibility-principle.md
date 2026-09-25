# Bài 1: Single Responsibility Principle (Nguyên Lý Đơn Trách Nhiệm - SRP)

> **Trọng tâm bài học:** Định nghĩa chính xác về SRP của Robert C. Martin: *"A class should have one, and only one, reason to change"*. Nhận diện mùi mã "God Class" (Lớp làm quá nhiều việc), và kỹ thuật phân rã mã nguồn tách bạch nghiệp vụ, lưu trữ và hiển thị.

---

## 1. Hiểu Đúng Về SRP

Nhiều người hiểu nhầm SRP là "Mỗi class chỉ được làm đúng 1 việc duy nhất".  
Định nghĩa chuẩn xác hơn: **Một lớp chỉ nên có một tác nhân (Actor/Stakeholder) duy nhất yêu cầu nó phải thay đổi.**
- Nếu một lớp vừa chứa công thức tính lương (thuộc về phòng Kế toán), vừa chứa logic sinh báo cáo HTML (thuộc về phòng Marketing), vừa chứa lệnh SQL lưu DB (thuộc về DBA) -> Lớp đó vi phạm SRP nghiêm trọng!
- Bất kỳ thay đổi nào từ một phòng ban cũng có nguy cơ làm hỏng chức năng của các phòng ban khác.

---

## 2. Đối Chiếu Code: Vi Phạm vs Chuẩn SRP

### ❌ Code Vi Phạm SRP (God Class):
```csharp
public class UserService
{
    // Lý do thay đổi 1: Logic đăng ký người dùng thay đổi
    public void Register(string username, string password, string email)
    {
        if (!email.Contains("@")) throw new Exception("Email không hợp lệ!");

        // Lý do thay đổi 2: Thay đổi hệ quản trị CSDL (SQL Server sang MongoDB)
        using var conn = new SqlConnection("connection_string");
        conn.Execute("INSERT INTO Users VALUES (@username, @password, @email)");

        // Lý do thay đổi 3: Nhà cung cấp dịch vụ gửi Email thay đổi (SendGrid sang AWS SES)
        using var client = new SmtpClient();
        client.Send(new MailMessage("admin@app.com", email, "Chào mừng", "Đăng ký thành công!"));

        // Lý do thay đổi 4: Định dạng file log thay đổi (Text sang JSON)
        File.AppendAllText("app.log", $"[LOG] Đăng ký thành công: {username}\n");
    }
}
```

### ✅ Code Tách Rời Chuẩn SRP:
```csharp
// 1. Chuyên trách lưu trữ dữ liệu
public interface IUserRepository
{
    void Save(User user);
}

// 2. Chuyên trách gửi email thông báo
public interface IEmailSender
{
    void SendWelcomeEmail(string email);
}

// 3. Chuyên trách ghi nhật ký hoạt động
public interface IAppLogger
{
    void LogInfo(string message);
}

// 4. Lớp điều phối nghiệp vụ chính: Chỉ có 1 lý do thay đổi duy nhất là LUỒNG NGHIỆP VỤ ĐĂNG KÝ!
public class UserService
{
    private readonly IUserRepository _repo;
    private readonly IEmailSender _emailSender;
    private readonly IAppLogger _logger;

    public UserService(IUserRepository repo, IEmailSender emailSender, IAppLogger logger)
    {
        _repo = repo;
        _emailSender = emailSender;
        _logger = logger;
    }

    public void Register(UserRegistrationDto dto)
    {
        // Chỉ chứa logic nghiệp vụ thuần túy
        var user = new User(dto.Username, dto.Password, dto.Email);
        _repo.Save(user);
        _emailSender.SendWelcomeEmail(user.Email);
        _logger.LogInfo($"Người dùng mới đã đăng ký: {user.Username}");
    }
}
```
