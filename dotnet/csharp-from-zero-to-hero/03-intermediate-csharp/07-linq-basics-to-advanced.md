# Bài 7: LINQ Từ Cơ Bản Đến Nâng Cao (Language Integrated Query)

> **Trọng tâm bài học:** Bản chất của LINQ (`System.Linq`), cơ chế thực thi trễ (Deferred Execution) vs Thực thi ngay (Immediate Execution), các toán tử cốt lõi (`Where`, `Select`, `SelectMany`, `GroupBy`, `OrderBy`, `Join`, `Aggregate`) và bẫy lặp kép (Multiple Enumeration).

---

## 1. LINQ Là Gì?

LINQ (Language Integrated Query) là tập hợp các phương thức mở rộng (Extension Methods) hoạt động trên bất kỳ đối tượng nào hiện thực giao diện `IEnumerable<T>`.
- LINQ thay thế các vòng lặp `for`/`foreach` lồng nhau phức tạp bằng cú pháp khai báo (Declarative Syntax) ngắn gọn, trực quan và ít lỗi.

---

## 2. Deferred Execution (Thực Thi Trễ) - Khái Niệm Quan Trọng Nhất Của LINQ

> [!IMPORTANT]
> Câu lệnh LINQ **KHÔNG** thực thi ngay tại dòng bạn viết nó!
> Nó chỉ tạo ra một kế hoạch truy vấn (Query Pipeline). Phép tính chỉ thực sự diễn ra khi bạn duyệt qua kết quả (ví dụ dùng `foreach`) hoặc gọi các phương thức ép thực thi ngay: `.ToList()`, `.ToArray()`, `.Count()`, `.First()`.

```csharp
var numbers = new List<int> { 1, 2, 3, 4, 5 };

// 1. Chỉ mới khai báo truy vấn, CHƯA hề duyệt qua numbers!
var evenNumbersQuery = numbers.Where(n => n % 2 == 0);

// Thêm phần tử mới vào danh sách gốc
numbers.Add(6);

// 2. Bây giờ mới thực thi (Duyệt kết quả):
foreach (var num in evenNumbersQuery)
{
    Console.WriteLine(num); // IN RA: 2, 4, VÀ CẢ 6!
}
```

---

## 3. Các Toán Tử LINQ Cốt Lõi Phổ Biến

### 1. Lọc và Chiếu (`Where` & `Select`)
```csharp
var adultNames = users
    .Where(u => u.Age >= 18)
    .Select(u => u.FullName.ToUpper())
    .ToList();
```

### 2. Trải phẳng danh sách con (`SelectMany`)
Dùng khi mỗi phần tử lại chứa một danh sách con bên trong (Quan hệ 1-N):
```csharp
// Lấy ra toàn bộ tất cả số điện thoại của mọi khách hàng vào 1 danh sách duy nhất
var allPhones = customers.SelectMany(c => c.PhoneNumbers).ToList();
```

### 3. Gom nhóm (`GroupBy`)
```csharp
// Gom sinh viên theo từng lớp học
var studentsByClass = students
    .GroupBy(s => s.ClassId)
    .Select(g => new
    {
        ClassId = g.Key,
        Count = g.Count(),
        TopStudent = g.OrderByDescending(s => s.Gpa).First()
    });
```

### 4. Thu gọn dữ liệu tùy biến (`Aggregate`)
Hoạt động tương tự `reduce` trong các ngôn ngữ hàm:
```csharp
int[] numbers = { 1, 2, 3, 4, 5 };
// Tính giai thừa hoặc tích các số:
int product = numbers.Aggregate(1, (acc, next) => acc * next); // 120
```

---

## 4. Bẫy Hiệu Năng Kinh Điển: Multiple Enumeration

```csharp
// ❌ NGUY HIỂM: Query bị thực thi lặp lại 2 lần (Truy vấn DB hoặc duyệt bộ nhớ 2 lần!)
IEnumerable<User> users = GetUsersFromDatabase();

if (users.Any()) // Lần duyệt 1
{
    foreach (var u in users) // Lần duyệt 2!
    {
        Process(u);
    }
}

// ✅ GIẢI PHÁP: Cache kết quả vào RAM bằng .ToList() nếu cần duyệt nhiều lần
var userList = GetUsersFromDatabase().ToList();
if (userList.Any())
{
    foreach (var u in userList) Process(u);
}
```
