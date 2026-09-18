# 03. Delegates, Events & Lambdas

Cơ chế con trỏ hàm an toàn kiểu (Delegates), các Delegate chuẩn của .NET (`Action`, `Func`, `Predicate`), biểu thức Lambda và mô hình xuất bản sự kiện (Events).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Collections & Iterators](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/02-collections-and-iterators.md)
- **Tiếp theo:** [Exception Handling & Clean-up](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/04-exception-handling-and-clean-up.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Bản Chất Của `delegate`
Trong C#, `delegate` là một kiểu dữ liệu tham chiếu (Reference Type) kế thừa từ `System.MulticastDelegate`.
- Nó bao bọc một hoặc nhiều con trỏ hàm (Method Pointers) kèm theo tham chiếu tới đối tượng chứa phương thức đó (`Target`).
- An toàn kiểu 100%: Chữ ký của phương thức gán vào delegate phải khớp chính xác với định nghĩa của delegate.

### 2.2 Bộ Ba Delegate Chuẩn Trong .NET
Hầu hết các trường hợp trong C# hiện đại không cần phải tự khai báo `delegate` tùy biến, mà sử dụng 3 kiểu generic có sẵn trong namespace `System`:
1. **`Action<T1, T2, ...>`:** Đại diện cho hàm **không trả về giá trị** (`void`). Có tối đa 16 tham số kiểu.
2. **`Func<T1, T2, ..., TResult>`:** Đại diện cho hàm **có trả về giá trị**. Tham số kiểu cuối cùng `TResult` luôn là kiểu trả về.
3. **`Predicate<T>`:** Tương đương với `Func<T, bool>`, trả về `true` hoặc `false` để kiểm tra điều kiện.

```csharp
Action<string> print = msg => Console.WriteLine(msg);
Func<int, int, int> add = (a, b) => a + b;
Predicate<int> isEven = n => n % 2 == 0;
```

### 2.3 `event` Trong C#
Từ khóa `event` là một lớp bảo vệ (Encapsulation Wrapper) bao bọc xung quanh một Delegate:
- Ngăn chặn người bên ngoài tự ý gọi hàm phát sự kiện (`event.Invoke()` từ ngoài class là phi pháp).
- Ngăn chặn người bên ngoài gán đè xóa sạch danh sách lắng nghe (`publisher.MyEvent = null` bị cấm).
- **Chỉ cho phép** bên ngoài đăng ký (`+=`) hoặc hủy đăng ký (`-=`).

```csharp
// Chuẩn thiết kế Event Pattern trong .NET:
public class OrderEventArgs(string orderId, decimal amount) : EventArgs {
    public string OrderId { get; } = orderId;
    public decimal Amount { get; } = amount;
}

public class OrderService {
    // Khai báo event chuẩn EventHandler<T>
    public event EventHandler<OrderEventArgs>? OrderCompleted;

    public void CompleteOrder(string id, decimal total) {
        // Thực hiện xử lý nghiệp vụ...

        // Phát sự kiện an toàn luồng với toán tử ?.Invoke
        OrderCompleted?.Invoke(this, new OrderEventArgs(id, total));
    }
}
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Rò Rỉ Bộ Nhớ Do Quên Hủy Đăng Ký Event (Event Memory Leak)
Khi bạn viết `publisher.MyEvent += OnSomethingHappened;`:
- Đối tượng `publisher` sẽ ngầm giữ một tham chiếu mạnh tới phương thức và instance của subscriber.
- Nếu subscriber là một trang UI hoặc đối tượng tạm thời, nó **sẽ không bao giờ được Garbage Collector thu gom** chừng nào `publisher` vẫn còn sống!
**Khắc phục:** Luôn hủy đăng ký `publisher.MyEvent -= OnSomethingHappened;` trong hàm `Dispose()` hoặc unmount.

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Pipeline xử lý dữ liệu với Multicast Delegate
using System;

public class PipelineDemo {
    public static void Run() {
        Func<string, string> pipeline = text => text.Trim();
        pipeline += text => text.ToUpper();
        pipeline += text => $"[LOG]: {text}";

        // Khi gọi multicast Func có trả về giá trị, kết quả của hàm cuối cùng sẽ được trả về
        Console.WriteLine(pipeline("   order_created_123   "));
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Tại sao lại cần từ khóa `event` khi mà một biến `public Action` hoặc `public delegate` cũng có thể làm được việc đăng ký hàm lắng nghe?
   - *Trả lời:* Nếu dùng một biến delegate thông thường (`public Action OnClick;`), bất kỳ đoạn code bên ngoài nào cũng có thể: (1) Vô tình gán đè `OnClick = newAction`, xóa sạch toàn bộ các hàm lắng nghe mà những đối tượng khác đã đăng ký trước đó, hoặc (2) Tự ý gọi kích hoạt `OnClick()` ngoài tầm kiểm soát của đối tượng sở hữu. Từ khóa `event` áp dụng nguyên lý đóng gói (Encapsulation): nó chỉ cho phép các đối tượng bên ngoài đăng ký (`+=`) hoặc hủy đăng ký (`-=`), và chỉ có chính class khai báo mới có quyền gọi `.Invoke()` để phát sóng sự kiện.

2. **Câu hỏi:** Toán tử `?.Invoke(this, e)` khi phát sự kiện giải quyết vấn đề tương tranh (Race Condition) nào?
   - *Trả lời:* Trong môi trường đa luồng, nếu viết theo kiểu truyền thống: `if (MyEvent != null) MyEvent(this, e);`, một luồng khác có thể hủy đăng ký (`-=`) ngay giữa lệnh `if` và lệnh gọi hàm, khiến `MyEvent` trở thành `null` tại thời điểm gọi và ném ra ngoại lệ `NullReferenceException`. Toán tử `MyEvent?.Invoke(this, e)` đọc giá trị của `MyEvent` vào một biến tạm thời trên Stack trước khi kiểm tra null và thực thi trong một thao tác nguyên tử an toàn (Atomic/Thread-safe).
