# 03. Aggregations & Set Operations

Các toán tử tính toán tổng hợp (`Aggregate`, `Sum`, `Average`, `MinBy`, `MaxBy`), khử trùng lặp và các phép toán lý thuyết tập hợp trong LINQ.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Filtering, Sorting & Projection](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/02-filtering-sorting-and-projection.md)
- **Tiếp theo:** [Joins & Group Joins](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/04-joins-and-group-joins.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Toán Tử `Aggregate` (Tương Đương `Reduce` Trong Lập Trình Hàm)
`Aggregate` là toán tử tổng hợp tổng quát và mạnh mẽ nhất của LINQ:
- Nhận vào một giá trị khởi tạo (Seed/Accumulator) và một hàm tích lũy.
- Lần lượt kết hợp từng phần tử của danh sách vào biến tích lũy:

```csharp
// Ví dụ tính giai thừa 5! = 1 * 2 * 3 * 4 * 5:
int factorial = Enumerable.Range(1, 5).Aggregate(1, (acc, next) => acc * next); // 120

// Ví dụ ghép chuỗi CSV có định dạng:
var words = new[] { "apple", "banana", "orange" };
string csv = words.Aggregate((current, next) => $"{current}, {next}"); // "apple, banana, orange"
```

### 2.2 Các Toán Tử Mới Trong .NET 6+ (`MinBy`, `MaxBy`, `DistinctBy`)
Trước .NET 6, để lấy ra đối tượng có giá trị lớn nhất, bạn phải sắp xếp rồi lấy phần tử đầu (`OrderByDescending().First()`) với chi phí $O(n \log n)$.
Từ .NET 6, các toán tử `By` giúp thao tác này đạt tốc độ $O(n)$ tối đa:

```csharp
var employees = new[] {
    new { Name = "Alice", Salary = 5000 },
    new { Name = "Bob", Salary = 8000 },
    new { Name = "Charlie", Salary = 6500 }
};

// Tìm đối tượng có lương cao nhất (O(n)):
var highestEarner = employees.MaxBy(e => e.Salary); // Bob

// Lọc các bản ghi duy nhất dựa trên một trường cụ thể:
var uniqueDepts = employees.DistinctBy(e => e.Department);
```

### 2.3 Các Phép Toán Lý Thuyết Tập Hợp (Set Operations)
1. **`Distinct`:** Khử các phần tử trùng lặp dựa trên `IEqualityComparer<T>` hoặc `Equals`.
2. **`Union`:** Hợp hai tập hợp (tự động loại bỏ trùng lặp).
3. **`Intersect`:** Giao hai tập hợp (chỉ lấy các phần tử cùng xuất hiện ở cả hai bên).
4. **`Except`:** Hiệu hai tập hợp (lấy các phần tử có trong tập A nhưng KHÔNG có trong tập B).

```
   Tập A: [1, 2, 3, 4]       Tập B: [3, 4, 5, 6]
   ─────────────────────────────────────────────
   A.Union(B)      ──> [1, 2, 3, 4, 5, 6]
   A.Intersect(B)  ──> [3, 4]
   A.Except(B)     ──> [1, 2]
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Gọi `Min()` hoặc `Max()` trên danh sách rỗng
Nếu gọi `list.Max()` hoặc `list.Min()` trên một tập hợp rỗng (`list.Count == 0`), .NET sẽ ném ra ngoại lệ:
`System.InvalidOperationException: Sequence contains no elements`.
**Khắc phục:** Luôn kiểm tra `list.Any()` trước, hoặc dùng toán tử gán giá trị mặc định `DefaultIfEmpty()`.

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Tìm danh sách quyền hạn bổ sung (Delta Permission) bằng Except
using System;
using System.Collections.Generic;
using System.Linq;

public static class SecurityAudit {
    public static IEnumerable<string> FindRevokedPermissions(
        IEnumerable<string> previousRolePermissions,
        IEnumerable<string> currentRolePermissions) 
    {
        // Những quyền có trong bản cũ nhưng bị gỡ ở bản mới
        return previousRolePermissions.Except(currentRolePermissions);
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Toán tử `Aggregate` trong LINQ hoạt động như thế nào? Nêu sự khác biệt giữa phiên bản có seed và không có seed?
   - *Trả lời:* `Aggregate` duyệt qua từng phần tử và áp dụng một hàm tích lũy để gộp toàn bộ danh sách thành một giá trị đơn lẻ duy nhất. Khi có giá trị khởi tạo (Seed), giá trị biến tích lũy ban đầu được gán bằng Seed, và kiểu trả về có thể khác hoàn toàn với kiểu phần tử của mảng. Khi không có Seed, phần tử đầu tiên của danh sách được lấy làm giá trị khởi tạo; nếu danh sách rỗng, phương thức không seed sẽ ném ra ngoại lệ `InvalidOperationException`.

2. **Câu hỏi:** `DistinctBy` trong .NET 6 hoạt động theo cơ chế nào để tối ưu hóa hiệu năng?
   - *Trả lời:* `DistinctBy` sử dụng một cấu trúc dữ liệu `HashSet<TKey>` nội bộ để ghi nhớ các khóa đã xuất hiện trong quá trình duyệt luồng. Khi duyệt qua từng phần tử, nó tính toán khóa phân loại (`keySelector`) và cố gắng chèn khóa đó vào HashSet. Nhờ tính chất $O(1)$ của HashSet, `DistinctBy` có thể lọc bỏ các phần tử trùng lặp ngay lập tức và truyền trực tiếp phần tử duy nhất đầu tiên ra ngoài luồng (Streaming) mà không cần phải nạp toàn bộ danh sách vào RAM.
