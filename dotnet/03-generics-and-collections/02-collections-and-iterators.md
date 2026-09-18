# 02. Collections & Iterators

Hệ thống Collection trong `System.Collections.Generic`, độ phức tạp thuật toán, cơ chế sinh chuỗi lười với `yield return` và giải phẫu `IEnumerable<T>`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Generics & Constraints](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/01-generics-and-constraints.md)
- **Tiếp theo:** [Delegates, Events & Lambdas](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/03-delegates-events-and-lambdas.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Cây Phân Cấp Collections Trong .NET
```
                       IEnumerable<T> (Chỉ đọc, duyệt tuần tự qua GetEnumerator)
                            │
                       ICollection<T> (Thêm Count, Add, Remove, Contains)
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
            IList<T>              IDictionary<TKey, TVal>
     (Truy cập index [i])            (Tra cứu theo key)
```

### 2.2 So Sánh Cơ Chế Hoạt Động Của Các Collection Chủ Lực
1. **`List<T>`:** Lưu trữ trên một mảng liên tục trên Heap. Khi mảng đầy, nó cấp phát một mảng mới gấp đôi kích thước ($2 \times \text{Capacity}$) và copy toàn bộ phần tử sang. Thao tác truy cập index là $O(1)$, nhưng thêm vào giữa/đầu là $O(n)$.
2. **`Dictionary<TKey, TValue>`:** Hoạt động dựa trên Bảng băm (Hash Table). Sử dụng hàm `GetHashCode()` và modulo để tìm bucket. Xử lý xung đột băm (Collision) bằng mảng liên kết (Chaining via entries array). Thao tác đọc/ghi trung bình là $O(1)$.
3. **`HashSet<T>`:** Tương tự như `Dictionary` nhưng chỉ lưu các phần tử đơn nhất (Keys), loại bỏ trùng lặp và hỗ trợ các phép toán tập hợp (`UnionWith`, `IntersectWith`).

### 2.3 `yield return` & Bộ Máy State Machine Của Trình Biên Dịch
Khi phương thức có chứa từ khóa `yield return`:
- Phương thức đó **hoàn toàn không sinh ra toàn bộ mảng dữ liệu trong RAM**.
- Thay vào đó, trình biên dịch C# tự động sinh ra một **Class State Machine ẩn** triển khai giao diện `IEnumerator<T>`.
- Mỗi lần người gọi gọi `.MoveNext()`, state machine chạy từ điểm dừng trước đó tới lệnh `yield return` tiếp theo rồi lập tức tạm dừng (Pause), mang lại khả năng xử lý luồng dữ liệu vô hạn (Infinite Streams) với $O(1)$ bộ nhớ!

```csharp
public static IEnumerable<int> GenerateEvenNumbers(int max) {
    for (int i = 0; i <= max; i += 2) {
        yield return i; // Tạm dừng và trả từng số một khi được yêu cầu
    }
}
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Sửa đổi Collection khi đang lặp (`InvalidOperationException`)
Nếu bạn thêm hoặc xóa phần tử khỏi một `List<T>` bên trong vòng lặp `foreach`:
```csharp
// ❌ SẬP RUNTIME: Collection was modified; enumeration operation may not execute.
foreach (var item in list) {
    if (item.IsExpired) list.Remove(item);
}

//  GIẢI PHÁP:
// Cách 1: Dùng list.RemoveAll(item => item.IsExpired);
// Cách 2: Lặp trên bản sao ToList() hoặc lặp lùi từ cuối mảng bằng vòng lặp for:
for (int i = list.Count - 1; i >= 0; i--) {
    if (list[i].IsExpired) list.RemoveAt(i);
}
```

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Đọc file văn bản khổng lồ theo từng dòng mà không bị OutOfMemoryException
using System;
using System.Collections.Generic;
using System.IO;

public static class FileStreamer {
    public static IEnumerable<string> ReadLinesLazy(string filePath) {
        using var reader = new StreamReader(filePath);
        string? line;
        while ((line = reader.ReadLine()) != null) {
            yield return line; // Mỗi lần chỉ nạp đúng 1 dòng vào RAM
        }
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Điều gì xảy ra khi bạn gọi `GetHashCode()` trong một đối tượng làm Key của `Dictionary<TKey, TValue>` nếu đối tượng đó bị thay đổi (mutable)?
   - *Trả lời:* Đây là một lỗi cực kỳ nghiêm trọng. Khi thêm đối tượng vào Dictionary, bucket index được tính dựa trên giá trị `GetHashCode()` tại thời điểm đó. Nếu sau đó bạn thay đổi trạng thái của đối tượng làm mã băm thay đổi, khi gọi `dict.ContainsKey(key)` hoặc `dict[key]`, Dictionary sẽ tính toán lại mã băm mới và tìm kiếm ở một bucket hoàn toàn khác. Kết quả: Dictionary không tìm thấy đối tượng dù nó vẫn đang nằm trong bảng băm, gây rò rỉ dữ liệu hoặc lỗi logic bí ẩn. Vì vậy, Key của Dictionary phải luôn là **Bất biến (Immutable)**.

2. **Câu hỏi:** `IEnumerable<T>` khác gì so với `IQueryable<T>`?
   - *Trả lời:* `IEnumerable<T>` nằm trong bộ nhớ (In-Memory). Khi bạn gọi LINQ trên `IEnumerable<T>`, các phương thức nhận vào `Func<T>` (Delegates) và thực thi trực tiếp bằng mã C# trong RAM. `IQueryable<T>` đại diện cho một nguồn dữ liệu từ xa (Out-of-Memory, ví dụ cơ sở dữ liệu qua Entity Framework). Nó nhận vào các **Cây biểu thức (Expression Trees - `Expression<Func<T>>`)**. Thay vì thực thi bằng C#, provider sẽ phân tích cú pháp cây biểu thức này để dịch thành câu lệnh truy vấn của hệ thống đích (ví dụ câu lệnh SQL SELECT/WHERE) trước khi gửi qua mạng.
