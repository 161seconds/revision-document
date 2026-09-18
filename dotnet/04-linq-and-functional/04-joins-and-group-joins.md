# 04. Joins & Group Joins

Kỹ thuật kết hợp nhiều nguồn dữ liệu độc lập với `Join`, mô phỏng SQL Left Outer Join bằng `GroupJoin` và phân chia phân trang dữ liệu (`Skip`, `Take`, `Chunk`).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Aggregations & Set Operations](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/03-aggregations-and-set-operations.md)
- **Tiếp theo:** [Module 05: Async, Memory & Advanced](file:///d:/my-project/revision-document/dotnet/05-async-memory-and-advanced/README.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Inner Join Trong LINQ
Kết hợp hai danh sách dựa trên cặp khóa trùng khớp (Equi-join). Các phần tử không có khóa khớp ở một trong hai bên sẽ bị loại bỏ:

```csharp
var users = new[] {
    new { Id = 1, Name = "Alice" },
    new { Id = 2, Name = "Bob" }
};

var orders = new[] {
    new { OrderId = 101, UserId = 1, Amount = 250m },
    new { OrderId = 102, UserId = 1, Amount = 120m },
    new { OrderId = 103, UserId = 3, Amount = 999m } // Không khớp user nào
};

var query = users.Join(
    orders,
    u => u.Id,          // Khóa ngoài bảng Users
    o => o.UserId,      // Khóa ngoài bảng Orders
    (u, o) => new { u.Name, o.OrderId, o.Amount }
);
```

### 2.2 `GroupJoin` & Mô Phỏng SQL Left Outer Join
`GroupJoin` nhóm tất cả các phần tử khớp ở danh sách thứ hai thành một `IEnumerable` con gắn liền với từng phần tử của danh sách thứ nhất (Phép nối 1-nhiều).
Để biến `GroupJoin` thành **Left Outer Join** (vẫn giữ lại bản ghi bên trái dù không có bản ghi nào bên phải khớp), ta kết hợp với `DefaultIfEmpty()` và `SelectMany`:

```csharp
var leftJoinQuery = users.GroupJoin(
    orders,
    u => u.Id,
    o => o.UserId,
    (u, matchingOrders) => new { User = u, Orders = matchingOrders }
).SelectMany(
    x => x.Orders.DefaultIfEmpty(), // Nếu không có order nào, trả về null mặc định
    (x, order) => new {
        UserName = x.User.Name,
        OrderId = order?.OrderId ?? -1,
        Amount = order?.Amount ?? 0m
    }
);
```

### 2.3 Phân Vùng Dữ Liệu: `Skip`, `Take` & `Chunk` (.NET 6+)
1. **Phân trang truyền thống:**
   ```csharp
   int pageIndex = 2; // Trang 2
   int pageSize = 10;
   var pageData = items.Skip((pageIndex - 1) * pageSize).Take(pageSize);
   ```
2. **Toán tử `Chunk` (C# 10 / .NET 6+):** Chia mảng dữ liệu lớn thành các gói nhỏ để xử lý theo đợt (Batch Processing) mà không cần tự viết vòng lặp:
   ```csharp
   IEnumerable<int[]> batches = largeList.Chunk(100); // Mỗi batch chứa đúng 100 phần tử
   ```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Khóa so sánh trong `Join` không so sánh theo giá trị
Nếu bạn sử dụng một đối tượng tự định nghĩa làm khóa nối (`keySelector`) mà không ghi đè `Equals` và `GetHashCode` (hoặc không dùng `record` / Anonymous Type), thuật toán Hash Join của LINQ sẽ so sánh theo địa chỉ tham chiếu ô nhớ và kết quả nối sẽ bị rỗng!

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Ghép nối dữ liệu từ 2 cảm biến song song bằng toán tử Zip
using System;
using System.Linq;

public class SensorMetrics {
    public static void MergeMetrics() {
        var timestamps = new[] { 1000, 2000, 3000 };
        var temperatures = new[] { 24.5, 25.1, 26.0 };

        // Zip kết hợp từng cặp phần tử có cùng vị trí index
        var merged = timestamps.Zip(temperatures, (time, temp) => new {
            Timestamp = time,
            TempCelsius = temp
        });

        foreach (var m in merged) {
            Console.WriteLine($"At {m.Timestamp}ms: {m.TempCelsius}°C");
        }
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Thuật toán nối (Join Algorithm) được LINQ thực thi trong bộ nhớ như thế nào?
   - *Trả lời:* LINQ sử dụng thuật toán **Hash Join**. Đầu tiên, nó duyệt qua danh sách bên phải (Inner sequence) và xây dựng một bảng băm trong bộ nhớ RAM, trong đó khóa là giá trị trích xuất từ `innerKeySelector`. Sau đó, nó duyệt tuần tự qua danh sách bên trái (Outer sequence), trích xuất khóa và tra cứu tức thì ($O(1)$) vào bảng băm để tìm các phần tử tương ứng. Nhờ vậy, độ phức tạp của phép nối chỉ là $O(n + m)$ thay vì thuật toán lồng nhau hai vòng lặp chậm chạp $O(n \times m)$.

2. **Câu hỏi:** Phân biệt `GroupJoin` và `GroupBy` trong LINQ?
   - *Trả lời:* `GroupBy` hoạt động trên **duy nhất 1 tập dữ liệu**; nó phân chia các phần tử của chính tập dữ liệu đó vào các nhóm dựa trên một khóa phân loại. Ngược lại, `GroupJoin` hoạt động trên **2 tập dữ liệu độc lập khác nhau**; nó thực hiện phép kết hợp dữ liệu (Join) tương quan dựa trên khóa chung giữa hai bảng và gom các phần tử khớp của bảng thứ hai thành một danh sách con gắn vào từng phần tử của bảng thứ nhất.
