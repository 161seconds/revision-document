# Bài 5: State, Bridge & Null Object (Trạng Thái, Cầu Nối & Đối Tượng Rỗng)

> **Trọng tâm bài học:** Cách loại bỏ các câu lệnh `if-else` trạng thái cồng kềnh bằng **State Pattern**, tách rời sự phụ thuộc trực tiếp bằng **Bridge Pattern**, và kỹ thuật loại bỏ triệt để kiểm tra `if (obj != null)` bằng **Null Object Pattern**.

---

## 1. State Pattern (Mẫu Trạng Thái)

State cho phép một đối tượng thay đổi hành vi của nó khi trạng thái nội bộ thay đổi. Đối tượng dường như thay đổi cả lớp của nó.

### Case Study: Cửa soát vé tự động (Turnstile)
Cửa có 2 trạng thái: `Locked` (Khóa) và `Unlocked` (Mở khóa), và nhận 2 sự kiện: `Push` (Đẩy) và `Coin` (Bỏ tiền).

```csharp
namespace BootCamp.Chapter.Examples.State
{
    public interface ITurnstileState
    {
        void InsertCoin(Turnstile turnstile);
        void Push(Turnstile turnstile);
    }

    public class LockedState : ITurnstileState
    {
        public void InsertCoin(Turnstile turnstile)
        {
            Console.WriteLine("Nhận xu -> Mở khóa cửa!");
            turnstile.SetState(new UnlockedState());
        }

        public void Push(Turnstile turnstile)
        {
            Console.WriteLine("❌ Cửa đang khóa! Bạn cần bỏ xu để qua.");
        }
    }

    public class UnlockedState : ITurnstileState
    {
        public void InsertCoin(Turnstile turnstile)
        {
            Console.WriteLine("Cửa đã mở sẵn, trả lại xu.");
        }

        public void Push(Turnstile turnstile)
        {
            Console.WriteLine("Người đã đi qua -> Tự động khóa cửa lại!");
            turnstile.SetState(new LockedState());
        }
    }

    public class Turnstile
    {
        private ITurnstileState _state = new LockedState();

        public void SetState(ITurnstileState state) => _state = state;
        public void InsertCoin() => _state.InsertCoin(this);
        public void Push() => _state.Push(this);
    }
}
```

---

## 2. Null Object Pattern (Triệt Tiêu Kiểm Tra Null)

Thay vì trả về `null` khi không tìm thấy kết quả và buộc người gọi phải viết `if (logger != null)`, Null Object cung cấp một đối tượng "rỗng" hiện thực cùng giao diện nhưng có thân hàm không làm gì cả (`No-op`).

```csharp
public interface ILogger
{
    void Log(string message);
}

// Đối tượng rỗng (Null Object)
public class NullLogger : ILogger
{
    public static readonly NullLogger Instance = new();
    private NullLogger() { }

    public void Log(string message)
    {
        // Cố tình để trống: Không làm gì cả!
    }
}

public class OrderService
{
    private readonly ILogger _logger;

    // Nếu người dùng không truyền logger, gán mặc định là NullLogger!
    public OrderService(ILogger logger = null)
    {
        _logger = logger ?? NullLogger.Instance;
    }

    public void Process()
    {
        // An toàn 100%, không bao giờ bị NullReferenceException mà không cần kiểm tra if!
        _logger.Log("Bắt đầu xử lý đơn hàng...");
    }
}
```
