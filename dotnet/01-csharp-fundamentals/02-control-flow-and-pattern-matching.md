# 02. Control Flow & Pattern Matching

Cấu trúc điều khiển hiện đại, biểu thức rẽ nhánh `switch` expression và toàn bộ hệ thống mẫu hình Pattern Matching trong C#.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Syntax, Types & Operators](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/01-syntax-types-and-operators.md)
- **Tiếp theo:** [Methods & Parameter Modifiers](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/03-methods-and-parameter-modifiers.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Từ `switch` Statement Đến `switch` Expression (C# 8+)
- Câu lệnh `switch` truyền thống mang tính mệnh lệnh (imperative), dài dòng với các từ khóa `case`, `break`, `return`.
- **`switch` Expression:** Là một biểu thức hàm (expression-bodied) trả về trực tiếp giá trị, cú pháp tinh gọn và bắt buộc phải bao quát hết các trường hợp (hoặc có fallback `_`):

```csharp
int status = 200;
string message = status switch {
    200 => "OK",
    400 => "Bad Request",
    404 => "Not Found",
    500 => "Internal Error",
    _ => "Unknown Status" // Mẫu hình mặc định (Discard pattern)
};
```

### 2.2 Các Loại Pattern Matching Nâng Cao

1. **Type Pattern:** Kiểm tra và gán kiểu đồng thời:
   ```csharp
   if (obj is string s) Console.WriteLine(s.Length);
   ```
2. **Relational Pattern & Logical Pattern (`and`, `or`, `not`):**
   ```csharp
   string GetGrade(int score) => score switch {
       >= 90 => "A",
       >= 80 and < 90 => "B",
       >= 70 and < 80 => "C",
       < 70 and >= 0 => "F",
       _ => throw new ArgumentOutOfRangeException()
   };
   ```
3. **Property Pattern:** Khớp dữ liệu dựa trên thuộc tính bên trong đối tượng:
   ```csharp
   decimal CalculateDiscount(Order order) => order switch {
       { Customer.IsVip: true, Total: > 1000m } => 0.20m,
       { Customer.IsVip: true } => 0.10m,
       { Total: > 500m } => 0.05m,
       _ => 0m
   };
   ```
4. **Positional Pattern:** Kết hợp với hàm `Deconstruct` của Tuple hoặc Record:
   ```csharp
   string GetQuadrant((int X, int Y) point) => point switch {
       (0, 0) => "Origin",
       ( > 0, > 0) => "Quadrant 1",
       ( < 0, > 0) => "Quadrant 2",
       _ => "Other"
   };
   ```
5. **List Pattern (C# 11+):** Khớp cấu trúc mảng hoặc danh sách bằng toán tử lát cắt `..` (Slice Pattern):
   ```csharp
   int EvaluateScores(int[] scores) => scores switch {
       [] => 0,
       [var single] => single,
       [var first, .., var last] => first + last,
   };
   ```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Thứ tự các nhánh Pattern từ hẹp tới rộng
Trình biên dịch kiểm tra các nhánh trong `switch` expression theo thứ tự từ trên xuống dưới:
```csharp
// ❌ LỖI LOGIC: Nhánh trên quá rộng sẽ nuốt chửng nhánh dưới
string CheckNumber(int n) => n switch {
    > 0 => "Positive",
    > 100 => "Large Positive", // ❌ Nhánh này không bao giờ được chạm tới (Unreachable code)!
    _ => "Zero or Negative"
};
```
**Quy tắc:** Luôn đặt điều kiện chặt chẽ, đặc thù nhất lên trên cùng.

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Xử lý State Machine của giao dịch ngân hàng bằng Pattern Matching
public enum PaymentStatus { Created, Authorized, Captured, Refunded, Failed }

public record Transaction(string Id, decimal Amount, PaymentStatus Status, bool IsRiskFlagged);

public static class TransactionProcessor {
    public static string Process(Transaction tx) => tx switch {
        { IsRiskFlagged: true } => "HOLD_FOR_FRAUD_REVIEW",
        { Status: PaymentStatus.Authorized, Amount: > 10000m } => "REQUIRE_MANAGER_APPROVAL",
        { Status: PaymentStatus.Authorized } => "AUTO_CAPTURE",
        { Status: PaymentStatus.Captured } => "SETTLED",
        { Status: PaymentStatus.Failed } => "NOTIFY_CUSTOMER",
        _ => "NO_ACTION"
    };
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Pattern Matching trong C# khác gì so với khối `if-else` truyền thống?
   - *Trả lời:* Pattern Matching kết hợp việc kiểm tra điều kiện, ép kiểu (safe casting) và trích xuất dữ liệu (destructuring/deconstruction) vào làm một bước duy nhất với tính biểu đạt cực kỳ cao. Khi dùng trong `switch` expression, trình biên dịch có khả năng phân tích tính cạn kiệt (Exhaustiveness checking) để cảnh báo nếu bạn bỏ sót một trường hợp nào đó của kiểu dữ liệu hoặc enum.

2. **Câu hỏi:** Toán tử discard (`_`) trong `switch` expression có ý nghĩa gì?
   - *Trả lời:* Ký tự `_` đóng vai trò là mẫu hình mặc định (Fallback / Wildcard pattern), tương đương với `default:` trong câu lệnh `switch` truyền thống. Nó sẽ khớp với bất kỳ giá trị nào không lọt vào các nhánh phía trên, bảo đảm rằng biểu thức luôn trả về một kết quả và không ném ra ngoại lệ `SwitchExpressionException` do không khớp giá trị.
