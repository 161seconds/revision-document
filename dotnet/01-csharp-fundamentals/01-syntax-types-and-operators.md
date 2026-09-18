# 01. Syntax, Types & Operators

Hệ thống kiểu Common Type System (CTS), phân biệt Value Types vs Reference Types, cơ chế Nullable và quản lý chuỗi trong C#.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** Lập trình hướng đối tượng cơ bản
- **Tiếp theo:** [Control Flow & Pattern Matching](file:///d:/my-project/revision-document/dotnet/01-csharp-fundamentals/02-control-flow-and-pattern-matching.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Value Types vs Reference Types
Mọi kiểu trong C# đều kế thừa từ `System.Object`. Tuy nhiên, CLR phân chia thành hai nhánh lớn:
1. **Value Types (`System.ValueType`):**
   - Bao gồm primitives (`int`, `float`, `bool`, `char`), `struct`, và `enum`.
   - Được cấp phát trực tiếp trên **Stack** (khi là biến cục bộ) hoặc nằm gọn bên trong bộ nhớ của đối tượng cha.
   - Không cần Garbage Collector thu dọn; tự động giải phóng khi Stack Frame kết thúc.
   - Sao chép giá trị (Copy by value).
2. **Reference Types:**
   - Bao gồm `class`, `interface`, `record class`, `delegate`, `string`, `object`.
   - Vùng nhớ dữ liệu thực tế luôn nằm trên **Managed Heap**, được quản lý bởi Garbage Collector.
   - Biến trên Stack chỉ giữ một con trỏ địa chỉ ô nhớ (4 bytes trên OS 32-bit, 8 bytes trên OS 64-bit).

### 2.2 Boxing & Unboxing
```csharp
int val = 42;
object boxed = val;        // BOXING: Cấp phát vùng nhớ mới trên Heap, copy 42 vào Heap
int unboxed = (int)boxed;  // UNBOXING: Trích xuất giá trị 42 từ Heap về lại Stack
```
- **Hệ quả:** Boxing tiêu tốn chu kỳ CPU để cấp phát và giải phóng Heap.
- **Giải pháp:** Sử dụng Generics (`List<T>`) thay cho các collection không định kiểu thời C# 1.0 (`ArrayList`).

### 2.3 Nullable Types & Nullable Reference Types (NRT)
1. **Nullable Value Types (`Nullable<T>` hay `T?`):**
   - Cho phép Value Type nhận giá trị `null`: `int? age = null;`.
   - Bản chất là một `struct Nullable<T>` có 2 trường: `bool hasValue` và `T value`.
2. **Nullable Reference Types (C# 8+ `#nullable enable`):**
   - Không thay đổi runtime! Trình biên dịch sẽ phát sinh cảnh báo tĩnh nếu một biến `string` (non-null) có nguy cơ bị gán `null`.
   - Toán tử Null-forgiving (`!`): Báo với compiler "Tôi cam đoan biến này không null": `user!.Name`.
   - Toán tử Null-coalescing (`??` và `??=`):
     ```csharp
     string displayName = user.Nickname ?? user.FullName ?? "Anonymous";
     cache ??= new Dictionary<string, object>();
     ```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Nối chuỗi trong vòng lặp gây bùng nổ ô nhớ Heap
Chuỗi trong .NET là bất biến (Immutable). Khi bạn viết:
```csharp
// ❌ THẢM HỌA HIỆU NĂNG:
string result = "";
for (int i = 0; i < 10000; i++) {
    result += i.ToString(); // Mỗi vòng lặp tạo ra một đối tượng string mới trên Heap!
}

//  CÁCH ĐÚNG: Dùng StringBuilder với bộ đệm tự co giãn:
var sb = new StringBuilder(10000);
for (int i = 0; i < 10000; i++) {
    sb.Append(i);
}
string result = sb.ToString();
```

---

## 4. Code Thực Hành (Production Patterns)

```csharp
using System;
using System.Text;

public class TypeDemo {
    public static void Run() {
        // Safe Casting với "is" pattern
        object data = "Hello C# 13";
        if (data is string text && text.Length > 5) {
            Console.WriteLine($"Upper: {text.ToUpper()}");
        }

        // Nullable coalescing assignment
        string? config = null;
        config ??= "Default-Config";
        Console.WriteLine($"Config: {config}");
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Phân biệt cơ chế lưu trữ bộ nhớ giữa một `struct` và một `class` khi được khởi tạo bằng từ khóa `new`?
   - *Trả lời:* Từ khóa `new` trong C# có ý nghĩa gọi Constructor chứ không đồng nghĩa với việc cấp phát trên Heap. Khi gọi `new MyClass()`, một đối tượng mới được cấp phát trên Managed Heap và trả về một con trỏ tham chiếu. Khi gọi `new MyStruct()`, nếu biến được khai báo cục bộ trong hàm, toàn bộ bộ nhớ của struct được cấp phát ngay trên Stack của luồng hiện tại. Nếu struct là một thuộc tính nằm trong một Class, bộ nhớ của nó sẽ nằm lọt bên trong khối ô nhớ của Class đó trên Heap (inlined), không sinh thêm con trỏ gián tiếp.

2. **Câu hỏi:** Tại sao `decimal` lại được khuyến nghị dùng trong các phép toán tài chính thay vì `double` hay `float`?
   - *Trả lời:* `float` và `double` biểu diễn số thực dấu phẩy động dưới dạng hệ nhị phân (cơ số 2) theo chuẩn IEEE 754, khiến các số thập phân thông thường như `0.1` không thể biểu diễn chính xác tuyệt đối, dẫn đến lỗi làm tròn tích lũy. Ngược lại, `decimal` biểu diễn số dưới dạng cơ số 10 (thập phân) với độ chính xác cao (28-29 chữ số có nghĩa), giúp triệt tiêu hoàn toàn sai số làm tròn số học, đặc biệt quan trọng trong các giao dịch kế toán, ngân hàng và tiền tệ.
