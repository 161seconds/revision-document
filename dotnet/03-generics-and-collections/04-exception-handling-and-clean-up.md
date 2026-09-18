# 04. Exception Handling & Clean-up

Cây phân cấp ngoại lệ trong .NET, bộ lọc ngoại lệ `when`, cơ chế giải phóng tài nguyên sống còn với `IDisposable` và cú pháp `using` declaration trong C#.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Delegates, Events & Lambdas](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/03-delegates-events-and-lambdas.md)
- **Tiếp theo:** [Module 04: LINQ & Functional C#](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/README.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Cây Phân Cấp Ngoại Lệ
Mọi ngoại lệ trong .NET đều kế thừa từ `System.Exception`:
- `SystemException`: Lỗi do hệ thống CLR phát sinh (`NullReferenceException`, `IndexOutOfRangeException`, `StackOverflowException`).
- `ApplicationException`: Trước đây dùng cho ứng dụng, nay được khuyến nghị kế thừa trực tiếp từ `System.Exception` khi tự viết Custom Exception.

### 2.2 Exception Filters Với Mệnh Đề `when` (C# 6+)
Cho phép bắt ngoại lệ dựa trên điều kiện logic mà **không cần phải Unwind Stack**:
```csharp
try {
    ProcessPayment(order);
} catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.GatewayTimeout) {
    // Chỉ bắt khi đúng mã lỗi 504
    RetryPayment(order);
} catch (HttpRequestException ex) {
    // Các lỗi HTTP khác
    LogError(ex);
}
```
> **Tại sao `when` tốt hơn `if` bên trong catch?**
> Nếu bạn bắt `catch (Exception ex)` rồi kiểm tra `if (condition) ... else throw;`, CLR đã hoàn tất việc dỡ bỏ Call Stack (Stack Unwinding) tới khối catch đó. Với mệnh đề `when`, nếu điều kiện trả về `false`, Call Stack **hoàn toàn được giữ nguyên**, giúp việc điều tra sự cố qua Crash Dumps chính xác 100%.

### 2.3 `IDisposable` & Cú Pháp `using var`
Garbage Collector chỉ tự động dọn dẹp bộ nhớ Managed Heap. Nó **hoàn toàn không biết** cách đóng một tệp tin của hệ điều hành, một Socket mạng hay một kết nối cơ sở dữ liệu (Unmanaged Resources).
Giao diện `IDisposable` cung cấp phương thức `Dispose()` để giải phóng các tài nguyên này ngay lập tức khi không dùng nữa:

```csharp
// C# 8+ Using Declaration: Tự động gọi Dispose() khi luồng ra khỏi phạm vi khối lệnh
public void ProcessData(string path) {
    using var fileStream = new FileStream(path, FileMode.Open);
    using var reader = new StreamReader(fileStream);

    string? content = reader.ReadToEnd();
    Console.WriteLine(content);
} // Tự động đóng reader và fileStream an toàn tại đây!
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Dùng `throw ex;` thay vì `throw;`
```csharp
try {
    DoRiskyTask();
} catch (Exception ex) {
    Log(ex);
    // ❌ TAI HỌA: throw ex; thiết lập lại điểm gốc của Stack Trace tại chính dòng này!
    // throw ex;

    //  ĐÚNG: Bảo toàn nguyên vẹn Call Stack từ nơi lỗi thực sự xảy ra:
    throw;
}
```

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Chuẩn triển khai Dispose Pattern đầy đủ (Full Dispose Pattern)
using System;

public class CustomResourceHolder : IDisposable {
    private bool _disposed = false;

    public void DoWork() {
        ObjectDisposedException.ThrowIf(_disposed, this);
        Console.WriteLine("Executing operations...");
    }

    public void Dispose() {
        Dispose(true);
        GC.SuppressFinalize(this); // Báo cho GC không cần gọi Finalizer nữa!
    }

    protected virtual void Dispose(bool disposing) {
        if (!_disposed) {
            if (disposing) {
                // Giải phóng các managed resources ở đây
            }
            // Giải phóng các unmanaged resources ở đây (nếu có)
            _disposed = true;
        }
    }

    ~CustomResourceHolder() {
        Dispose(false); // Phòng hộ trường hợp người dùng quên gọi Dispose()
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Lệnh `GC.SuppressFinalize(this)` bên trong phương thức `Dispose()` có tác dụng gì?
   - *Trả lời:* Nếu một lớp có khai báo Finalizer (hàm hủy `~ClassName()`), CLR sẽ đưa đối tượng đó vào danh sách Finalization Queue khi cấp phát. Khi đối tượng không còn được tham chiếu, Garbage Collector không thể thu gom nó ngay trong đợt quét đầu tiên mà phải đẩy nó sang thế hệ tiếp theo (Gen 1 hoặc Gen 2) và đưa vào hàng đợi chạy Finalizer, gây lãng phí bộ nhớ lớn. Khi lập trình viên đã chủ động gọi `Dispose()`, gọi `GC.SuppressFinalize(this)` sẽ báo cho CLR gạch tên đối tượng khỏi Finalization Queue, cho phép GC thu gom đối tượng ngay lập tức ở thế hệ Gen 0.

2. **Câu hỏi:** Khối lệnh `finally` có trường hợp nào KHÔNG được thực thi không?
   - *Trả lời:* Có. Khối `finally` sẽ không chạy trong các trường hợp cực đoan: (1) Tiến trình bị kết thúc đột ngột qua lệnh `Environment.FailFast()` hoặc `Environment.Exit()`, (2) Xảy ra ngoại lệ tràn bộ nhớ ngăn xếp không thể bắt giữ (`StackOverflowException`), hoặc (3) Mất nguồn điện đột ngột hoặc tiến trình bị giết bởi Task Manager / `kill -9`.
