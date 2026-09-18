# Module 04: LINQ & Functional C#

Chào mừng bạn đến với **Module 04: LINQ & Functional C#**. Language Integrated Query (LINQ) là một trong những phát minh vĩ đại nhất của nền tảng .NET, mang phong cách lập trình hàm (Functional Programming) vào thao tác dữ liệu một cách an toàn và nhất quán. Module này mổ xẻ toàn diện cơ chế Thực thi trễ (Deferred Execution), sự khác biệt sinh tử giữa `IEnumerable<T>` và `IQueryable<T>`, toàn bộ các toán tử lọc, chiếu, sắp xếp, gom nhóm, tổng hợp, các phép toán tập hợp và các kỹ thuật kết nối dữ liệu (Inner Joins & Group Joins).

---

## Bản Đồ Học Tập (Learning Roadmap)

| Bài học | Nội dung cốt lõi | Mục tiêu đạt được |
| :--- | :--- | :--- |
| **[01. LINQ Fundamentals & Deferred Execution](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/01-linq-fundamentals-and-deferred-execution.md)** | Method Syntax vs Query Syntax, Deferred Execution vs Immediate Execution (`ToList`, `Count`), Bẫy Multiple Enumeration | Nắm vững thời điểm câu truy vấn thực sự chạy và ngăn chặn việc truy vấn lặp đi lặp lại lãng phí tài nguyên. |
| **[02. Filtering, Sorting & Projection](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/02-filtering-sorting-and-projection.md)** | `Where`, `Select`, `SelectMany` (Flattening mảng con), `OrderBy`, `OrderByDescending`, `ThenBy`, `GroupBy` | Xây dựng các pipeline lọc và sắp xếp dữ liệu phức tạp nhiều tầng với cú pháp tinh gọn. |
| **[03. Aggregations & Set Operations](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/03-aggregations-and-set-operations.md)** | `Aggregate` (Reduce), `Sum`, `Average`, `MinBy`, `MaxBy`, `DistinctBy`, `Union`, `Intersect`, `Except` | Thống kê số liệu nghiệp vụ và thực hiện các phép toán tập hợp trong bộ nhớ với hiệu năng cao. |
| **[04. Joins & Group Joins](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/04-joins-and-group-joins.md)** | Inner `Join`, `GroupJoin` (Mô phỏng SQL Left Outer Join), `Zip`, Phân vùng (`Take`, `Skip`, `Chunk`) | Kết nối các nguồn dữ liệu quan hệ độc lập và xử lý phân trang dữ liệu chuẩn hóa. |

---

## File Thực Hành & Kiểm Thử Tự Động

- **File Demo Tổng Hợp**: [LinqDemo.cs](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/LinqDemo.cs) — Chạy trực tiếp qua `dotnet run --file LinqDemo.cs`.
- **File Tự Luyện & Chấm Điểm**: [Practice.cs](file:///d:/my-project/revision-document/dotnet/04-linq-and-functional/Practice.cs) — Bộ 5 bài tập LINQ chuyên sâu kèm assertions tự động chấm qua `System.Diagnostics.Debug.Assert`.

---

## 3 Bẫy Phỏng Vấn Kinh Điển Cần Nhớ

1. **Bẫy Multiple Enumeration**: Khi một phương thức trả về `IEnumerable<T>`, nếu bạn gọi `if (query.Any()) { foreach (var item in query) { ... } }`, câu truy vấn LINQ và toàn bộ logic bên trong sẽ **bị thực thi 2 lần độc lập**! Hãy gọi `.ToList()` hoặc `.ToArray()` để cache kết quả vào RAM nếu cần duyệt nhiều lần.
2. **`Count()` vs `Count` / `Length`**: Thuộc tính `.Count` của `List<T>` hoặc `.Length` của mảng là $O(1)$ (đọc trực tiếp trường dữ liệu). Nhưng phương thức mở rộng LINQ `.Count()` trên `IEnumerable<T>` tổng quát có thể phải duyệt toàn bộ danh sách từ đầu đến cuối với chi phí $O(n)$!
3. **`Any()` nhanh hơn `Count() > 0`**: Khi kiểm tra một tập hợp có phần tử nào thỏa mãn điều kiện hay không, luôn dùng `collection.Any(predicate)` ($O(1)$ ngay khi thấy phần tử đầu tiên khớp) thay vì `collection.Count(predicate) > 0` (phải đếm hết toàn bộ mảng $O(n)$).
