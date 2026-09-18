# C# / .NET Master Cheat Sheet

Bản tóm tắt toàn diện nền tảng .NET Platform, hệ thống kiểu Common Type System (CTS), ngôn ngữ C# hiện đại (C# 10 - 13), kiến trúc bộ nhớ CLR, Lập trình hướng đối tượng OOP, Generics, Collections, Delegates & Events, LINQ toàn tập, Lập trình bất đồng bộ Async/Await và cơ chế Garbage Collection.

---

## 1. Common Type System (CTS) & Phân Bổ Bộ Nhớ

| C# Type | .NET CLR Type | Byte | Phân loại | Giá trị mặc định |
| :--- | :--- | :---: | :--- | :--- |
| `bool` | `System.Boolean` | 1 | Value Type (Stack / Inline) | `false` |
| `byte` / `sbyte` | `System.Byte` / `SByte` | 1 | Value Type (Stack / Inline) | `0` |
| `short` / `ushort` | `System.Int16` / `UInt16` | 2 | Value Type (Stack / Inline) | `0` |
| `int` / `uint` | `System.Int32` / `UInt32` | 4 | Value Type (Stack / Inline) | `0` |
| `long` / `ulong` | `System.Int64` / `UInt64` | 8 | Value Type (Stack / Inline) | `0L` |
| `float` | `System.Single` | 4 | Value Type (7 chữ số chính xác) | `0.0f` |
| `double` | `System.Double` | 8 | Value Type (15-17 chữ số chính xác) | `0.0d` |
| `decimal` | `System.Decimal` | 16 | Value Type (28-29 chữ số chính xác - Tài chính) | `0.0m` |
| `char` | `System.Char` | 2 | Value Type (UTF-16 code point) | `'\0'` |
| `string` | `System.String` | Heap | Reference Type (Bất biến - Immutable) | `null` |
| `object` | `System.Object` | Heap | Reference Type (Gốc của mọi kiểu) | `null` |

---

## 2. Value Type vs Reference Type (Bản Đồ Ô Nhớ)

```
        STACK (Nhanh, Tự giải phóng khi hết Frame)         HEAP (Quản lý bởi GC)
       ┌────────────────────────────────────────┐       ┌────────────────────────────┐
       │ int age = 25;                          │       │                            │
       │ Point p = new Point(10, 20); (struct)  │       │ Object Data                │
       │ User u ────────────────────────────────┼──────>│ { Name = "Alice", ... }    │
       └────────────────────────────────────────┘       └────────────────────────────┘
```

- **Value Types (`struct`, `enum`, primitives):** Lưu trữ trực tiếp giá trị thực tế tại vị trí khai báo (thường trên Stack hoặc nằm lọt trong đối tượng cha trên Heap). Khi gán biến hoặc truyền qua hàm, **dữ liệu được sao chép nguyên khối (Copy by Value)**.
- **Reference Types (`class`, `record class`, `interface`, `delegate`, `string`):** Lưu trữ con trỏ địa chỉ tham chiếu trên Stack, trỏ tới khối dữ liệu thực tế được cấp phát trên Heap. Khi gán biến, **chỉ có con trỏ tham chiếu được sao chép**.

---

## 3. Class vs Struct vs Record

| Đặc tính | `class` | `struct` | `record class` | `record struct` |
| :--- | :--- | :--- | :--- | :--- |
| **Phân loại bộ nhớ** | Reference Type (Heap) | Value Type (Stack) | Reference Type (Heap) | Value Type (Stack) |
| **So sánh bằng (`==`)** | Referential (Địa chỉ) | Value (Mặc định Reflection) | Value (So sánh giá trị trường) | Value (So sánh giá trị trường) |
| **Kế thừa (`extends`)** | Đơn kế thừa | ❌ Không hỗ trợ | Kế thừa record khác | ❌ Không hỗ trợ |
| **Khả năng đột biến** | Mutable | Thường mutable/readonly | Thường Immutable (`init`) | Mutable hoặc `readonly` |
| **Biểu thức `with`** | ❌ Không hỗ trợ | ❌ Không hỗ trợ |  Có (Non-destructive mutation)|  Có |
| **Khuyên dùng khi** | Đối tượng nghiệp vụ có vòng đời riêng (Domain Entity) | Dữ liệu hình học nhẹ (< 16 byte), tuổi thọ ngắn (Point, Vector) | DTO, Event Payload, State bất biến | DTO nhẹ cần hiệu năng cao không cấp phát Heap |

---

## 4. Parameter Modifiers: `ref`, `out`, `in`, `params`

```csharp
// 1. ref: Truyền tham chiếu 2 chiều (Biến phải được khởi tạo trước khi truyền)
void Swap(ref int a, ref int b) {
    int temp = a; a = b; b = temp;
}

// 2. out: Truyền tham chiếu để nhận kết quả trả về (Hàm BẮT BUỘC phải gán giá trị trước khi return)
bool TryParseNumber(string s, out int result) {
    return int.TryParse(s, out result);
}

// 3. in: Truyền tham chiếu nhưng ở chế độ READ-ONLY (Tránh copy struct lớn, không cho hàm sửa đổi)
double CalculateDistance(in Point3D p1, in Point3D p2) {
    // p1.X = 10; // ❌ Lỗi biên dịch: Cannot assign to variable 'in'
    return Math.Sqrt(Math.Pow(p1.X - p2.X, 2) + Math.Pow(p1.Y - p2.Y, 2));
}

// 4. params: Cho phép truyền số lượng đối số tùy ý
int SumAll(params int[] numbers) => numbers.Sum();
```

---

## 5. Pattern Matching Đột Phá (C# 9 - 12)

```csharp
// Switch Expression với Property Pattern & Relational Pattern
string ClassifyOrder(Order order) => order switch {
    { TotalAmount: > 1000, Customer.IsVip: true } => "VIP Express",
    { TotalAmount: > 500 } => "Standard Priority",
    { Items.Count: 0 } => "Empty Order",
    _ => "Regular"
};

// Positional Pattern với Deconstruct
string CheckQuadrant(Point p) => p switch {
    (0, 0) => "Origin",
    ( > 0, > 0) => "Quadrant 1",
    ( < 0, > 0) => "Quadrant 2",
    _ => "Boundary"
};

// List Pattern (C# 11)
bool IsHttpSecure(string[] parts) => parts is ["https", .., "api", _];
```

---

## 6. Collections & Bảng Độ Phức Tạp (Time Complexity)

| Collection | Namespace | Indexing | Lookup / Search | Insert | Delete | Cơ chế bên dưới |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `List<T>` | `System.Collections.Generic` | $O(1)$ | $O(n)$ | $O(1)$ amortized | $O(n)$ | Mảng nội bộ tự động tăng kích thước x2 |
| `Dictionary<TKey, TVal>`| `System.Collections.Generic` | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ | Bảng băm (Hash Table) với Buckets & Chaining |
| `HashSet<T>` | `System.Collections.Generic` | N/A | $O(1)$ | $O(1)$ | $O(1)$ | Hash Table chỉ lưu keys, không trùng lặp |
| `Queue<T>` | `System.Collections.Generic` | N/A | $O(n)$ | $O(1)$ (Enqueue)| $O(1)$ (Dequeue)| Circular Array FIFO |
| `Stack<T>` | `System.Collections.Generic` | N/A | $O(n)$ | $O(1)$ (Push) | $O(1)$ (Pop) | Mảng LIFO |
| `LinkedList<T>` | `System.Collections.Generic` | $O(n)$ | $O(n)$ | $O(1)$ | $O(1)$ | Doubly Linked List (Node con trỏ trước/sau) |

---

## 7. Toàn Bộ Toán Tử LINQ (LINQ Operators Catalog)

```csharp
// 1. Projection & Filtering
var names = users.Where(u => u.IsActive).Select(u => u.Name);
var allSkills = users.SelectMany(u => u.Skills); // Flatten mảng con

// 2. Sorting
var sorted = users.OrderByDescending(u => u.Score).ThenBy(u => u.Name);

// 3. Grouping
var byDept = users.GroupBy(u => u.DepartmentId);

// 4. Aggregations
int total = users.Sum(u => u.OrdersCount);
double avg = users.Average(u => u.Score);
var highest = users.MaxBy(u => u.Score); // C# 10+

// 5. Partitioning
var page = users.Skip(20).Take(10); // Phân trang
var chunks = users.Chunk(5); // Chia mảng thành các mảng con 5 phần tử (C# 10+)

// 6. Set Operations
var common = listA.Intersect(listB);
var unique = listA.Union(listB);
var diff = listA.Except(listB);

// 7. Joins
var innerJoin = users.Join(
    orders,
    u => u.Id,
    o => o.UserId,
    (u, o) => new { u.Name, o.Amount }
);
```

> **Nguyên tắc vàng:** LINQ sử dụng **Thực thi trễ (Deferred Execution)** với `IEnumerable<T>`. Phép tính chỉ thực sự chạy khi bạn duyệt qua nó (`foreach`) hoặc gọi các toán tử thực thi tức thì (`ToList()`, `ToArray()`, `Count()`, `First()`).

---

## 8. Lập Trình Bất Đồng Bộ: `async` / `await` (TAP)

```csharp
public async Task<UserProfile> GetProfileAsync(int userId, CancellationToken ct = default) {
    // Không bao giờ dùng Task.Wait() hoặc Task.Result (Gây Deadlock thread pool!)
    var response = await _httpClient.GetAsync($"/users/{userId}", ct);
    response.EnsureSuccessStatusCode();

    var profile = await response.Content.ReadFromJsonAsync<UserProfile>(cancellationToken: ct);
    return profile ?? throw new InvalidOperationException();
}

// Chạy song song nhiều tác vụ độc lập
var task1 = FetchOrdersAsync();
var task2 = FetchNotificationsAsync();
await Task.WhenAll(task1, task2);
```

- **`Task` vs `ValueTask`:** Dùng `ValueTask<T>` cho các hàm bất đồng bộ có tần suất gọi cực cao và hầu hết các trường hợp đều hoàn thành đồng bộ ngay lập tức (ví dụ đọc dữ liệu từ Cache RAM), giúp triệt tiêu 100% việc cấp phát đối tượng `Task` trên Heap.

---

## 9. CLR Memory Management & Garbage Collection (GC)

- **3 Thế Hệ GC (Generations):**
  - **Generation 0:** Nơi chứa các đối tượng mới sinh ra có tuổi thọ siêu ngắn (biến cục bộ, chuỗi tạm). Thu gom cực nhanh (< 1ms).
  - **Generation 1:** Vùng đệm trung gian chuyển tiếp từ Gen 0 sang Gen 2.
  - **Generation 2:** Nơi chứa các đối tượng sống lâu (Static instances, Cache toàn cục, Connection Pools). Thu gom tốn kém (Full GC).
- **Large Object Heap (LOH):** Đối tượng có kích thước $\ge 85,000$ bytes sẽ được đưa thẳng vào LOH mà không qua Gen 0. Không được tự động nén (compact) mặc định để tránh chi phí copy RAM lớn.
- **Chuẩn Dọn Dẹp Tài Nguyên (`IDisposable` & `using`):**
  ```csharp
  // C# 8+ using declaration: Tự động gọi Dispose() khi ra khỏi scope hiện tại
  using var stream = new FileStream("data.bin", FileMode.Open);
  // Thực hiện đọc ghi an toàn...
  ```

---

## 10. Dependency Injection Lifetimes Trong .NET Core

| Lifetime | Cú pháp đăng ký | Thời điểm tạo Instance | Ứng dụng tiêu biểu |
| :--- | :--- | :--- | :--- |
| **Transient** | `AddTransient<T, U>()` | Tạo **instance mới mỗi lần** được yêu cầu | Dịch vụ nhẹ, không lưu trạng thái (Calculators, Validators) |
| **Scoped** | `AddScoped<T, U>()` | Tạo **1 instance duy nhất cho mỗi HTTP Request** | `DbContext`, Repositories, Unit of Work |
| **Singleton** | `AddSingleton<T, U>()` | Tạo **1 instance duy nhất dùng chung cho toàn bộ app** | Caching, Loggers, Application State |

> **Bẫy Captive Dependency:** Không bao giờ tiêm một `Scoped` service vào trong một `Singleton` service. Service scoped đó sẽ bị kẹt vĩnh viễn trong singleton và không bao giờ được dọn dẹp theo từng request!
