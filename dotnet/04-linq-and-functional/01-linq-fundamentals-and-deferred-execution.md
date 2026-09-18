# 01. LINQ Fundamentals & Deferred Execution

Nền tảng Language Integrated Query (LINQ), đối chiếu cú pháp Method Syntax vs Query Syntax và bản chất của cơ chế Thực thi trễ (Deferred Execution).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Collections & Iterators](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/02-collections-and-iterators.md)
- **Tiếp theo:** [Filtering, Sorting & Projection](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/02-filtering-sorting-and-projection.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Hai Trường Phái Cú Pháp LINQ
1. **Method Syntax (Fluent API / Lambda Syntax):** Được sử dụng phổ biến nhất trong thực tế (> 90%), chuỗi các phương thức nối tiếp nhau dễ đọc:
   ```csharp
   var activeAdmins = users.Where(u => u.IsActive && u.Role == "Admin")
                           .OrderBy(u => u.Name)
                           .Select(u => u.Email);
   ```
2. **Query Syntax (SQL-like):** Trình biên dịch sẽ tự động chuyển đổi (transpile) về Method Syntax lúc biên dịch:
   ```csharp
   var activeAdmins = from u in users
                      where u.IsActive && u.Role == "Admin"
                      orderby u.Name
                      select u.Email;
   ```

### 2.2 Thực Thi Trễ (Deferred Execution) Là Gì?
Khi bạn định nghĩa một câu truy vấn LINQ:
```csharp
var query = users.Where(u => u.Age >= 18);
```
> **ĐIỀU KỲ DIỆU:** Dòng lệnh trên **HOÀN TOÀN CHƯA THỰC THI BẤT KỲ VÒNG LẶP NÀO!**
> Nó chỉ tạo ra một đối tượng đại diện cho câu truy vấn trong bộ nhớ.

Phép toán lọc thực sự chỉ bắt đầu chạy khi bạn:
1. Duyệt qua nó bằng vòng lặp: `foreach (var u in query)`.
2. Gọi các toán tử **Thực thi tức thì (Immediate Execution)**:
   - Chuyển đổi sang Collection: `.ToList()`, `.ToArray()`, `.ToDictionary()`.
   - Lấy một phần tử duy nhất: `.First()`, `.FirstOrDefault()`, `.Single()`, `.Last()`.
   - Tính toán giá trị tổng hợp: `.Count()`, `.Sum()`, `.Average()`, `.Any()`.

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Bẫy Duyệt Nhiều Lần (Multiple Enumeration)
```csharp
public void ProcessUsers(IEnumerable<User> usersQuery) {
    // ❌ Lần 1: Chạy vòng lặp để kiểm tra Any()
    if (usersQuery.Any()) {
        // ❌ Lần 2: Chạy lại toàn bộ vòng lặp từ đầu để lấy Count()
        Console.WriteLine($"Found {usersQuery.Count()} users");

        // ❌ Lần 3: Chạy lại toàn bộ vòng lặp lần thứ ba để xử lý dữ liệu!
        foreach (var u in usersQuery) {
            SendEmail(u);
        }
    }
}
```
Nếu `usersQuery` bên dưới là một câu truy vấn Database qua Entity Framework hoặc một thuật toán tính toán nặng, ứng dụng sẽ thực hiện 3 chuyến bay (Round-trips) tới database hoặc tính toán lại 3 lần!
**Khắc phục triệt để:** Ngay đầu hàm, materialize câu truy vấn vào RAM nếu cần dùng nhiều lần:
```csharp
var usersList = usersQuery.ToList();
```

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Xây dựng câu truy vấn lọc động nhiều điều kiện nhờ Deferred Execution
using System;
using System.Collections.Generic;
using System.Linq;

public record Product(string Name, string Category, decimal Price, bool InStock);

public static class ProductFilterService {
    public static IEnumerable<Product> FilterProducts(
        IEnumerable<Product> source,
        string? categoryFilter,
        decimal? maxPrice,
        bool? inStockOnly) 
    {
        // Bắt đầu với câu truy vấn gốc (chưa chạy)
        var query = source;

        // Ghép nối các điều kiện một cách lười biếng
        if (!string.IsNullOrEmpty(categoryFilter)) {
            query = query.Where(p => p.Category == categoryFilter);
        }

        if (maxPrice.HasValue) {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }

        if (inStockOnly.HasValue && inStockOnly.Value) {
            query = query.Where(p => p.InStock);
        }

        return query; // Chỉ thực thi khi người gọi bắt đầu tiêu thụ dữ liệu!
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Phân biệt cơ chế hoạt động của Deferred Execution (Thực thi trễ) và Immediate Execution (Thực thi tức thì) trong LINQ?
   - *Trả lời:* Deferred Execution (như `Where`, `Select`, `Take`) chỉ xây dựng kế hoạch thực thi mà không tính toán dữ liệu ngay lập tức. Dữ liệu được trích xuất từng phần tử một (Streaming / On-demand) khi người dùng lặp qua `IEnumerable`. Ngược lại, Immediate Execution (như `ToList`, `ToArray`, `Count`, `Max`) buộc câu truy vấn phải duyệt qua toàn bộ dữ liệu ngay tại thời điểm gọi hàm và đóng băng kết quả thành một mảng/danh sách hoặc một giá trị vô hướng cụ thể trong bộ nhớ RAM.

2. **Câu hỏi:** Tại sao `Any()` lại được ưa chuộng hơn `Count() > 0` khi kiểm tra sự tồn tại của phần tử?
   - *Trả lời:* `Count() > 0` bắt buộc phải duyệt qua từng phần tử một từ đầu đến tận cuối cùng của toàn bộ danh sách để đếm tổng số lượng (độ phức tạp luôn là $O(n)$). Trong khi đó, `Any()` chỉ cần gọi `.MoveNext()` một lần duy nhất; ngay khi phát hiện có ít nhất một phần tử thỏa mãn điều kiện, nó lập tức trả về `true` và dừng vòng lặp ngay lập tức (độ phức tạp tốt nhất là $O(1)$).
