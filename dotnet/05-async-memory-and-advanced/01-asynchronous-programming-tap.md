# 01. Asynchronous Programming (Task-based Asynchronous Pattern - TAP)

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 03: Delegates & Events](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/03-delegates-func-action-and-events.md).
- **Module hiện tại**: [Module 05: Asynchronous Programming, Memory & Advanced](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/README.md).
- **Trực thuộc**: [Master C# / .NET Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md).
- **Kế tiếp**: [02. CLR Memory & Garbage Collection](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/02-clr-memory-and-garbage-collection.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Async/Await không tạo Thread mới
- C# sử dụng mô hình **Task-based Asynchronous Pattern (TAP)** dựa trên I/O Completion Ports (IOCP) của hệ điều hành.
- Khi gặp lệnh `await`, luồng hiện tại (Thread) **không bị block (chặn đứng)**. Thay vào đó:
  1. Roslyn Compiler chuyển đổi toàn bộ hàm `async` thành một **State Machine Struct** (`IAsyncStateMachine`).
  2. Nếu tác vụ chưa hoàn thành, State Machine đăng ký một callback nối tiếp (`continuation`) và trả Thread hiện tại về **ThreadPool** để phục vụ request khác.
  3. Khi I/O hoàn thành (network packet về, disk read xong), OS báo IOCP đánh thức một worker thread bất kỳ trong ThreadPool để tiếp tục thực thi State Machine từ vị trí dừng.

### 2.2 Task vs ValueTask
| Đặc tính | `Task` / `Task<T>` | `ValueTask` / `ValueTask<T>` |
| :--- | :--- | :--- |
| **Kiểu dữ liệu** | `class` (Reference Type trên Heap) | `readonly struct` (Value Type trên Stack) |
| **Mục đích** | Mặc định cho hầu hết tác vụ bất đồng bộ | Tối ưu đường dẫn hoàn thành đồng bộ (Synchronous hot path) |
| **Cấp phát bộ nhớ** | Luôn cấp phát 1 Task Object trên Heap | **Zero Allocation** nếu kết quả có sẵn trong Cache |
| **Hạn chế** | Có thể `await` nhiều lần, `Task.WhenAll` an toàn | **Tuyệt đối không được `await` 2 lần** hoặc gọi song song |

### 2.3 Cooperative Cancellation với CancellationToken
- Không bao giờ được ép dừng Thread một cách đột ngột (như `Thread.Abort` đã bị cấm).
- C# sử dụng mô hình hủy bỏ hợp tác:
  - Caller tạo `CancellationTokenSource (CTS)`.
  - Truyền `cts.Token` vào các hàm async.
  - Hàm nhận kiểm tra định kỳ bằng `token.ThrowIfCancellationRequested()` hoặc chuyển token cho các API I/O (như `HttpClient.GetAsync(url, token)`).

### 2.4 ConfigureAwait(false) & SynchronizationContext
- Trong ứng dụng UI (WPF, WinForms), `await` mặc định ghi nhớ `SynchronizationContext` để nhảy về UI Thread khi hoàn tất.
- Trong Backend / Class Library, không có UI Thread. Gọi `.ConfigureAwait(false)` giúp bỏ qua context, giảm overhead chuyển đổi context và phòng ngừa triệt để Deadlock.

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!WARNING]
> **Bẫy 1: Async Void (Ngoại trừ UI Event Handlers)**
> `async void` không trả về `Task`. Nếu có ngoại lệ ném ra bên trong hàm `async void`, nó không thể bị bắt bởi khối `try-catch` của caller và sẽ làm sập toàn bộ tiến trình ứng dụng (`AppDomain UnhandledException`). Luôn dùng `async Task`.

> [!CAUTION]
> **Bẫy 2: Sync-over-Async dẫn đến Deadlock (`.Result` hoặc `.Wait()`)**
> Gọi `task.Result` hoặc `task.Wait()` trên một async task đang chờ đợi SynchronizationContext sẽ gây ra hiện tượng Thread A đợi Task, Task đợi Thread A -> **Deadlock hoàn toàn**. Luôn dùng `await`.

> [!IMPORTANT]
> **Bẫy 3: Quên tái sử dụng ValueTask**
> `ValueTask` được thiết kế để `await` chính xác một lần. Nếu bạn lưu nó vào biến và `await` hai lần, hoặc chuyển đổi không đúng cách, hành vi là không xác định (Undefined Behavior).

---

## 4. Code Mẫu Thực Hành Chuẩn Mực

```csharp
using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

public class AsyncService {
    private readonly HttpClient _httpClient = new();

    // 1. ValueTask tối ưu bộ nhớ khi dữ liệu có trong cache
    private string? _cachedToken;
    public ValueTask<string> GetAuthTokenAsync() {
        if (_cachedToken != null) {
            // Hoàn thành đồng bộ -> ZERO Heap Allocation!
            return ValueTask.FromResult(_cachedToken);
        }
        return new ValueTask<string>(FetchRemoteTokenAsync());
    }

    private async Task<string> FetchRemoteTokenAsync() {
        await Task.Delay(50); // Giả lập call server
        _cachedToken = "token_xyz_999";
        return _cachedToken;
    }

    // 2. Cooperative Cancellation và Task.WhenAll
    public async Task ProcessDataWithTimeoutAsync() {
        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(2));

        try {
            var task1 = FetchDataAsync("Service A", 100, cts.Token);
            var task2 = FetchDataAsync("Service B", 150, cts.Token);

            // Chờ đồng thời cả 2 tác vụ
            string[] results = await Task.WhenAll(task1, task2).ConfigureAwait(false);
            Console.WriteLine($"Result: {string.Join(" & ", results)}");
        }
        catch (OperationCanceledException) {
            Console.WriteLine("[Cancelled] Operation aborted due to timeout token.");
        }
    }

    private async Task<string> FetchDataAsync(string serviceName, int delayMs, CancellationToken token) {
        await Task.Delay(delayMs, token).ConfigureAwait(false);
        return $"{serviceName}_OK";
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao `async void` là một anti-pattern trong C# Backend?**
   - *Trả lời*: Caller không có `Task` để `await` hoặc bắt Exception. Mọi unhandled exception trong `async void` đẩy thẳng ra SynchronizationContext hoặc ThreadPool, gây crash toàn bộ tiến trình.
2. **Khi nào nên sử dụng `ValueTask<T>` thay cho `Task<T>`?**
   - *Trả lời*: Khi hàm async thường xuyên hoàn thành đồng bộ (như đọc dữ liệu từ In-Memory Cache, Buffer có sẵn), giúp loại bỏ chi phí cấp phát đối tượng `Task` trên Managed Heap.
3. **Cơ chế hoạt động của `CancellationToken` là gì? Có cưỡng chế hủy luồng không?**
   - *Trả lời*: Không cưỡng chế luồng. Nó là cơ chế cooperative (hợp tác): caller phát tín hiệu qua `CancellationTokenSource.Cancel()`, các phương thức nhận token chủ động kiểm tra cờ `IsCancellationRequested` hoặc gọi `ThrowIfCancellationRequested()` để dừng lại và dọn dẹp tài nguyên.
