# 02. Filtering, Sorting & Projection

Làm chủ các toán tử cốt lõi trong LINQ: Lọc dữ liệu với `Where`, chiếu dữ liệu với `Select`, làm phẳng mảng với `SelectMany`, sắp xếp đa tầng và gom nhóm dữ liệu (`GroupBy`).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [LINQ Fundamentals & Deferred Execution](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/01-linq-fundamentals-and-deferred-execution.md)
- **Tiếp theo:** [Aggregations & Set Operations](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/03-aggregations-and-set-operations.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 `Select` vs `SelectMany`
- **`Select` (Map 1-to-1):** Biến đổi mỗi phần tử đầu vào thành **đúng 1 phần tử** đầu ra:
  $$[A, B] \rightarrow [f(A), f(B)]$$
- **`SelectMany` (Map 1-to-Many & Flatten):** Biến mỗi phần tử đầu vào thành một danh sách con, sau đó "dàn phẳng" (flatten) tất cả các danh sách con thành một luồng duy nhất:
  $$[A, B] \rightarrow [\text{list}_A, \text{list}_B] \rightarrow \text{concat}(\text{list}_A, \text{list}_B)$$

```csharp
var orders = new[] {
    new { Customer = "Alice", Items = new[] { "Laptop", "Mouse" } },
    new { Customer = "Bob", Items = new[] { "Keyboard" } }
};

// Select: Trả về IEnumerable<string[]> (Mảng chứa các mảng con)
var nested = orders.Select(o => o.Items);

// SelectMany: Trả về IEnumerable<string> -> ["Laptop", "Mouse", "Keyboard"]
var allPurchasedItems = orders.SelectMany(o => o.Items);
```

### 2.2 Sắp Xếp Nhiều Tiêu Chí: `OrderBy` & `ThenBy`
Khi cần sắp xếp danh sách theo tiêu chí thứ nhất, và nếu trùng nhau thì sắp xếp theo tiêu chí thứ hai:
- Toán tử thứ nhất: `OrderBy` hoặc `OrderByDescending` (trả về kiểu `IOrderedEnumerable<T>`).
- Toán tử tiếp theo: **BẮT BUỘC DÙNG `ThenBy`** hoặc `ThenByDescending`.
> **CẢNH BÁO:** Nếu bạn viết `users.OrderBy(u => u.Role).OrderBy(u => u.Age);`, lệnh `OrderBy` thứ hai sẽ **hủy bỏ hoàn toàn** kết quả sắp xếp của lệnh thứ nhất!

### 2.3 Gom Nhóm Với `GroupBy`
Toán tử `GroupBy` phân chia tập dữ liệu thành các nhóm dựa trên một khóa chung:
- Kết quả trả về là một chuỗi các đối tượng `IGrouping<TKey, TElement>`.
- Mỗi `IGrouping` vừa có thuộc tính `.Key` vừa có thể lặp qua như một danh sách các phần tử thuộc về nhóm đó:

```csharp
var employees = new[] {
    new { Name = "Alice", Department = "IT" },
    new { Name = "Bob", Department = "HR" },
    new { Name = "Charlie", Department = "IT" }
};

var byDept = employees.GroupBy(e => e.Department);
foreach (var group in byDept) {
    Console.WriteLine($"Phòng ban: {group.Key} (Tổng: {group.Count()} người)");
    foreach (var emp in group) {
        Console.WriteLine($" - {emp.Name}");
    }
}
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên rằng `GroupBy` trong RAM phải nạp toàn bộ dữ liệu
Không giống như `Where` hay `Select` có thể chạy theo cơ chế truyền tải từng phần tử (Pure Streaming), `GroupBy` bắt buộc phải đọc qua **toàn bộ dữ liệu** của nguồn để băm và phân loại vào các nhóm trước khi có thể trả về nhóm đầu tiên.

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Phân tích báo cáo giỏ hàng với SelectMany và GroupBy
using System;
using System.Collections.Generic;
using System.Linq;

public record OrderItem(string ProductId, int Quantity, decimal Price);
public record Order(string OrderId, List<OrderItem> Items);

public static class SalesAnalytics {
    public static Dictionary<string, int> GetTopSellingProducts(IEnumerable<Order> orders) {
        return orders
            .SelectMany(o => o.Items)                     // Dàn phẳng toàn bộ OrderItems
            .GroupBy(item => item.ProductId)              // Gom nhóm theo mã sản phẩm
            .Select(g => new {
                ProductId = g.Key,
                TotalQty = g.Sum(x => x.Quantity)
            })
            .OrderByDescending(x => x.TotalQty)           // Sắp xếp sản phẩm bán chạy nhất lên đầu
            .ToDictionary(x => x.ProductId, x => x.TotalQty);
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Sự khác biệt cốt lõi giữa `Select` và `SelectMany` trong LINQ là gì? Cho ví dụ thực tế?
   - *Trả lời:* `Select` thực hiện phép chiếu 1-1: mỗi phần tử nguồn sinh ra đúng một phần tử kết quả. `SelectMany` thực hiện phép chiếu 1-nhiều và tự động làm phẳng (Flattening): mỗi phần tử nguồn sinh ra một tập hợp con, và `SelectMany` sẽ gộp tất cả các tập hợp con đó thành một chuỗi duy nhất. Ví dụ thực tế: Một đối tượng `Author` có một danh sách `Books`. Nếu dùng `authors.Select(a => a.Books)`, ta nhận về danh sách các mảng sách (`IEnumerable<List<Book>>`). Nếu dùng `authors.SelectMany(a => a.Books)`, ta nhận về danh sách toàn bộ các cuốn sách đơn lẻ (`IEnumerable<Book>`).

2. **Câu hỏi:** Tại sao lại cần có `ThenBy` thay vì gọi liên tiếp hai hàm `OrderBy`?
   - *Trả lời:* `OrderBy` sắp xếp lại toàn bộ tập hợp từ đầu dựa trên khóa được cung cấp. Nếu bạn gọi hai lần liên tiếp `OrderBy(a).OrderBy(b)`, lần sắp xếp thứ hai sẽ làm xáo trộn và phá hỏng kết quả sắp xếp của lần thứ nhất. Hàm `ThenBy` được thiết kế riêng cho kiểu `IOrderedEnumerable<T>`, nó giữ nguyên vị trí của các phần tử đã được xếp thứ tự ở `OrderBy` và chỉ tiến hành sắp xếp phụ đối với những phần tử có khóa đầu tiên bằng nhau.
