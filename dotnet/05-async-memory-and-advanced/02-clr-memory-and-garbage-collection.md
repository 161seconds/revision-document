# 02. CLR Memory & Garbage Collection (GC)

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 01: Value Types vs Reference Types & Stack/Heap](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/02-data-types-and-memory-layout.md).
- **Module hiện tại**: [Module 05: Asynchronous Programming, Memory & Advanced](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/README.md).
- **Trực thuộc**: [Master C# / .NET Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md).
- **Kế tiếp**: [03. Dependency Injection & Service Lifetimes](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/03-dependency-injection-and-configuration.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Kiến trúc Phân Vùng Bộ Nhớ CLR
CLR quản lý bộ nhớ thông qua các phân vùng Heap:
1. **SOH (Small Object Heap)**: Chứa các object có kích thước nhỏ hơn 85,000 bytes. Được chia làm 3 thế hệ:
   - **Generation 0**: Nơi các object mới sinh ra được cấp phát. Quá trình thu gom diễn ra siêu nhanh (vài micro-giây) và thường xuyên nhất.
   - **Generation 1**: Vùng đệm trung gian dành cho các đối tượng sống sót sau GC Gen 0.
   - **Generation 2**: Chứa các đối tượng sống lâu (Long-lived) như Static data, Singletons, Application Cache. Thu gom Gen 2 (Full GC) rất tốn kém CPU.
2. **LOH (Large Object Heap)**: Cấp phát các object có kích thước **$\ge$ 85,000 bytes** (mảng lớn, buffer lớn). Được xếp vào Gen 2. Theo mặc định, LOH không được nén (Compact) tự động để tránh sao chép tốn kém, dễ dẫn đến phân mảnh bộ nhớ (Memory Fragmentation).
3. **POH (Pinned Object Heap - từ .NET 5)**: Dành cho các mảng/đối tượng bị pin để truyền sang C/C++ Native Code (Interop), tránh làm cản trở việc nén dọn dẹp các phân vùng khác.

### 2.2 Ba giai đoạn của Garbage Collection (Mark - Sweep - Compact)
- **Phase 1: Mark (Đánh dấu)**: GC quét từ các **GC Roots** (biến cục bộ trên Call Stack, thanh ghi CPU, biến static, GC handles) và lập đồ thị các đối tượng còn sống (Reachable).
- **Phase 2: Sweep (Quét dọn)**: Nhận diện các vùng bộ nhớ của đối tượng không còn tham chiếu (Unreachable/Dead).
- **Phase 3: Compact (Nén dồn bộ nhớ)**: Dịch chuyển các đối tượng sống lại sát nhau để tạo khoảng trống liên tục cho các lần cấp phát tiếp theo, đồng thời cập nhật lại địa chỉ con trỏ.

### 2.3 Mô Hình Thu Gom: Workstation GC vs Server GC
- **Workstation GC**: Tối ưu cho độ trễ giao diện người dùng (Desktop/UI), dùng chung 1 heap.
- **Server GC**: Tối ưu cho Throughput của Web API / Microservices. Mỗi CPU Core sở hữu một Managed Heap và một GC Thread riêng biệt, hoạt động song song.

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Memory Leak do Event Subscription & Static References**
> Trong C#, đăng ký Event (`publisher.OnEvent += subscriber.Handler`) giữ một tham chiếu mạnh (Strong Reference) từ Publisher tới Subscriber. Nếu Publisher là Singleton hoặc sống lâu hơn, Subscriber sẽ **không bao giờ được GC thu gom**, gây rò rỉ bộ nhớ nghiêm trọng.

> [!WARNING]
> **Bẫy 2: Phân Mảnh Large Object Heap (LOH)**
> Liên tục cấp phát và vứt bỏ các `byte[]` hoặc mảng lớn (>85,000 bytes) khiến LOH bị rỗ phân mảnh. Hãy sử dụng `ArrayPool<T>.Shared` để tái sử dụng buffer lớn thay vì cấp phát mới.

> [!IMPORTANT]
> **Bẫy 3: Quên gọi `GC.SuppressFinalize(this)` trong `Dispose()`**
> Nếu một class có Finalizer (Destructor) mà không gọi `GC.SuppressFinalize(this)` trong `Dispose()`, đối tượng sẽ bị đưa vào Finalization Queue, sống sót thêm ít nhất một chu kỳ GC nữa và bị thăng cấp lên Gen 1/Gen 2 trước khi được dọn dẹp thật sự.

---

## 4. Code Mẫu Chuẩn Mực: Standard Dispose Pattern

```csharp
using System;
using System.IO;

public class ResourceHolder : IDisposable {
    private FileStream? _managedFile;       // Tài nguyên Managed
    private IntPtr _unmanagedBuffer;        // Tài nguyên Unmanaged (C-pointer)
    private bool _disposed = false;

    public ResourceHolder(string path) {
        _managedFile = new FileStream(path, FileMode.OpenOrCreate);
        _unmanagedBuffer = System.Runtime.InteropServices.Marshal.AllocHGlobal(1024);
    }

    // 1. Dispose công khai để caller gọi chủ động
    public void Dispose() {
        Dispose(disposing: true);
        // Ngăn chặn Finalizer chạy vì tài nguyên đã được giải phóng sạch sẽ
        GC.SuppressFinalize(this);
    }

    // 2. Phương thức bảo vệ cốt lõi
    protected virtual void Dispose(bool disposing) {
        if (!_disposed) {
            if (disposing) {
                // Giải phóng các đối tượng Managed (chỉ an toàn khi caller chủ động gọi Dispose)
                _managedFile?.Dispose();
                _managedFile = null;
            }

            // Giải phóng tài nguyên Unmanaged (luôn chạy bất kể disposing là true hay false)
            if (_unmanagedBuffer != IntPtr.Zero) {
                System.Runtime.InteropServices.Marshal.FreeHGlobal(_unmanagedBuffer);
                _unmanagedBuffer = IntPtr.Zero;
            }

            _disposed = true;
        }
    }

    // 3. Finalizer (Chỉ cần thiết khi class trực tiếp sở hữu Unmanaged Resource)
    ~ResourceHolder() {
        Dispose(disposing: false);
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Tại sao việc chia thế hệ (Generations) lại giúp GC đạt hiệu năng vượt trội?**
   - *Trả lời*: Dựa trên "Weak Generational Hypothesis" - phần lớn các đối tượng mới tạo ra có vòng đời cực ngắn (biến cục bộ, DTOs, parameters). Thu gom tập trung ở Gen 0 chỉ tốn vài micro-giây mà dọn dẹp được 90%+ bộ nhớ rác mà không cần quét toàn bộ Heap.
2. **Ngưỡng kích thước nào khiến một đối tượng được cấp phát trên LOH?**
   - *Trả lời*: Kích thước $\ge 85,000\text{ bytes}$ (khoảng 83 KB).
3. **Tại sao `ArrayPool<T>` là vũ khí tối thượng xử lý High Throughput trong .NET?**
   - *Trả lời*: Thay vì liên tục `new byte[100_000]` gây áp lực cấp phát và phân mảnh LOH, `ArrayPool<T>.Shared.Rent()` mượn lại buffer đã có sẵn trong pool và `Return()` sau khi dùng xong, đạt zero allocation trên Heap.
