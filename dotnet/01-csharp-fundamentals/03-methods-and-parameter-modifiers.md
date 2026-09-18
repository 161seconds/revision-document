# 03. Methods & Parameter Modifiers

Các bổ từ tham số chuyên sâu trong C#: `ref`, `out`, `in`, `params`, tham số tùy chọn và hàm cục bộ (Local Functions).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Control Flow & Pattern Matching](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/02-control-flow-and-pattern-matching.md)
- **Tiếp theo:** [Arrays & Memory Spans](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/04-arrays-and-memory-spans.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Bảng So Sánh Bổ Từ Tham Số

| Modifier | Yêu cầu trước khi gọi hàm | Trách nhiệm của hàm được gọi | Mục đích chính |
| :--- | :--- | :--- | :--- |
| **Mặc định (Pass-by-value)** | Biến phải được gán giá trị | Không thể thay đổi biến gốc của người gọi | Sao chép giá trị an toàn |
| **`ref`** | Biến **BẮT BUỘC** phải có giá trị trước | Có thể đọc hoặc ghi đè giá trị | Truyền tham chiếu 2 chiều |
| **`out`** | Biến **KHÔNG CẦN** gán giá trị trước | **BẮT BUỘC PHẢI GÁN** giá trị trước khi `return` | Trả về nhiều giá trị (Try Pattern) |
| **`in`** (C# 7.2+) | Biến phải có giá trị trước | **CHỈ ĐƯỢC ĐỌC**, cấm tuyệt đối sửa đổi | Tối ưu hiệu năng truyền struct lớn |
| **`params`** | Truyền mảng hoặc danh sách đối số phân tách bằng dấu phẩy | Nhận như mảng thông thường | Hàm nhận số lượng tham số tùy ý |

```csharp
// Ví dụ tổng hợp:
void Demo(ref int counter, out string status, in LargeStruct config, params int[] extraValues) {
    counter++;                               // ref: đọc & ghi
    status = counter > 10 ? "Active" : "New"; // out: bắt buộc phải gán
    // config.Value = 100;                   // ❌ LỖI: in là readonly reference
    Console.WriteLine(extraValues.Length);   // params: mảng linh hoạt
}
```

### 2.2 Local Functions (Hàm Cục Bộ Trong C# 7+)
Hàm cục bộ là các hàm được khai báo ngay bên trong thân của một phương thức khác:
- Có khả năng truy cập các biến cục bộ của hàm cha (Closure).
- Khác với Lambda Expressions (`Func<T>`), Local Function **không cấp phát đối tượng Delegate trên Heap** nếu không biến thành delegate.
- Từ C# 8+, hỗ trợ từ khóa `static` cho Local Function (`static int Add(...)`) để ngăn chặn việc bắt giữ biến ngoài ý muốn, tránh rò rỉ bộ nhớ.

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Hiện Tượng Defensive Copy Khi Dùng `in` Modifier
Nếu bạn truyền một struct thông thường bằng `in` để tối ưu hiệu năng:
```csharp
public struct NormalPoint {
    public int X;
    public int Y;
    public double GetDistance() => Math.Sqrt(X * X + Y * Y);
}

void PrintDistance(in NormalPoint pt) {
    // ❌ Vì GetDistance() không được đánh dấu readonly, CLR sợ hàm này sẽ sửa đổi X hoặc Y!
    // Trình biên dịch sẽ TỰ ĐỘNG TẠO MỘT BẢN SAO ẨN (Defensive Copy) của pt trên Stack trước khi gọi!
    Console.WriteLine(pt.GetDistance());
}
```
**Khắc phục triệt để:** Đánh dấu struct hoặc phương thức là `readonly`:
```csharp
public readonly struct ReadonlyPoint { ... }
// hoặc:
public readonly double GetDistance() => ...
```

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Xây dựng hàm TryParse chuẩn thư viện .NET với "out"
public static class SafeParser {
    public static bool TryParsePositiveInt(string? input, out int result) {
        if (int.TryParse(input, out int parsed) && parsed > 0) {
            result = parsed;
            return true;
        }
        result = 0; // Trách nhiệm của hàm: Luôn phải gán out trước khi return!
        return false;
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Phân biệt mục đích sử dụng giữa `ref` và `out`?
   - *Trả lời:* Cả hai đều truyền biến theo cơ chế tham chiếu (By Reference) thay vì sao chép giá trị. Khác biệt chính: Với `ref`, biến của người gọi **phải được khởi tạo giá trị trước** khi truyền vào, và hàm bên trong có thể đọc giá trị cũ cũng như ghi giá trị mới. Với `out`, biến truyền vào **không nhất thiết phải có giá trị trước**, nhưng hàm bên trong **bắt buộc phải gán giá trị** cho biến đó ở mọi nhánh thực thi trước khi hàm thoát ra. `out` thường dùng trong mẫu hình Try-Parse để trả về đồng thời kết quả thành công/thất bại và giá trị trích xuất.

2. **Câu hỏi:** Tại sao `in` parameter modifier lại quan trọng trong việc tối ưu hóa hiệu năng của các ứng dụng game hoặc xử lý tính toán hiệu năng cao?
   - *Trả lời:* Trong C#, khi truyền một `struct` lớn (ví dụ ma trận 4x4 gồm 16 số thực float = 64 bytes) theo cách thông thường, toàn bộ 64 bytes đó sẽ bị sao chép vào Stack Frame của hàm được gọi. Bằng cách sử dụng bổ từ `in`, trình biên dịch chỉ truyền một con trỏ tham chiếu (8 bytes) đồng thời khóa đối tượng ở chế độ chỉ đọc (Read-only), giúp tiết kiệm thời gian sao chép bộ nhớ mà vẫn bảo đảm dữ liệu gốc không bị chỉnh sửa.
