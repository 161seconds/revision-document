# Module 03: Generics & Collections

Chào mừng bạn đến với **Module 03: Generics & Collections**. Module này bao quát các cấu trúc dữ liệu và mô hình thực thi chức năng trong .NET: Cơ chế Generic Type Parameters với các ràng buộc (`where T : ...`), các Collection chủ lực trong `System.Collections.Generic` (`List`, `Dictionary`, `HashSet`, `Queue`, `Stack`), từ khóa sinh chuỗi lười `yield return`, Delegates chuẩn (`Action`, `Func`, `Predicate`), cơ chế xuất bản sự kiện (Events & Event Pattern), cùng kỹ thuật quản lý tài nguyên sống còn với `IDisposable` và `using`.

---

## Bản Đồ Học Tập (Learning Roadmap)

| Bài học | Nội dung cốt lõi | Mục tiêu đạt được |
| :--- | :--- | :--- |
| **[01. Generics & Constraints](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/01-generics-and-constraints.md)** | Generic Types, Ràng buộc `class`, `struct`, `notnull`, `new()`, `unmanaged`, Hiệp biến `out` & Phản biến `in` | Xây dựng các thuật toán tổng quát không tốn chi phí Boxing/Unboxing và bảo toàn Type Safety. |
| **[02. Collections & Iterators](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/02-collections-and-iterators.md)** | `List<T>`, `Dictionary<TKey, TVal>`, `HashSet<T>`, `IEnumerable<T>`, `yield return`, Tránh Collection Mutation lúc duyệt | Lựa chọn cấu trúc dữ liệu tối ưu theo độ phức tạp thuật toán và sinh luồng dữ liệu lười (Lazy Streaming). |
| **[03. Delegates, Events & Lambdas](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/03-delegates-events-and-lambdas.md)** | `delegate`, `Action<T>`, `Func<T, TResult>`, Multicast Delegates, `event EventHandler<T>`, Tránh rò rỉ bộ nhớ Event | Xây dựng kiến trúc giao tiếp lỏng lẻo (Loosely Coupled) theo mẫu thiết kế Observer. |
| **[04. Exception Handling & Clean-up](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/04-exception-handling-and-clean-up.md)** | `try-catch-finally`, Bộ lọc ngoại lệ `when`, Phân cấp `Exception`, Giao diện `IDisposable`, Cú pháp `using var` (C# 8+) | Dọn dẹp tài nguyên unmanaged (Files, Sockets, DB Connections) an toàn tuyệt đối. |

---

## File Thực Hành & Kiểm Thử Tự Động

- **File Demo Tổng Hợp**: [GenericsDemo.cs](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/GenericsDemo.cs) — Chạy trực tiếp qua `dotnet run --file GenericsDemo.cs`.
- **File Tự Luyện & Chấm Điểm**: [Practice.cs](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/Practice.cs) — Bộ 5 bài tập Generics, Collections & Events kèm assertions tự động chấm qua `System.Diagnostics.Debug.Assert`.

---

## 3 Bẫy Phỏng Vấn Kinh Điển Cần Nhớ

1. **Rò rỉ bộ nhớ do không hủy đăng ký Event (Unsubscribe Event Leak)**: Khi một đối tượng sống ngắn (ví dụ View) đăng ký lắng nghe sự kiện của một đối tượng sống lâu (như Singleton Service), đối tượng sống lâu sẽ giữ một tham chiếu mạnh tới delegate của View. Kết quả là Garbage Collector không bao giờ thu gom được View đó! Luôn gọi `-=` hoặc dùng Weak Event pattern.
2. **`yield return` trì hoãn thực thi (Deferred Execution)**: Mã nguồn bên trong hàm có `yield return` hoàn toàn KHÔNG chạy khi bạn gọi hàm đó. Nó chỉ thực sự chạy từng bước khi có ai đó gọi `.MoveNext()` (thông qua vòng lặp `foreach` hoặc LINQ).
3. **`throw ex;` xóa sạch Stack Trace gốc**: Trong khối `catch (Exception ex)`, nếu viết `throw ex;`, CLR sẽ thiết lập lại điểm bắt đầu của Stack Trace tại chính dòng lệnh đó, làm mất hoàn toàn thông tin file và dòng code gốc nơi lỗi thực sự phát sinh. Luôn viết `throw;` (không có biến) để bảo toàn Call Stack!
