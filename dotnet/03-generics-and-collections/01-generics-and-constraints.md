# 01. Generics & Constraints

Cơ chế Generic Type Parameters, các loại ràng buộc kiểu dữ liệu (`where T : ...`), và tính biến thiên Hiệp biến (Covariance) & Phản biến (Contravariance) trong C#.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Structs, Records & Immutability](file:///d:/my-project/revision-document/dotnet/02-oop-and-type-system/04-structs-records-and-immutability.md)
- **Tiếp theo:** [Collections & Iterators](file:///d:/my-project/revision-document/dotnet/03-generics-and-collections/02-collections-and-iterators.md)
- **Tổng hợp:** [C# / .NET Master Cheat Sheet](file:///d:/my-project/revision-document/dotnet/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Cơ Chế JIT Specialization Của Generics Trong .NET
Không giống như Java sử dụng cơ chế xóa kiểu (Type Erasure), .NET CLR bảo toàn đầy đủ siêu dữ liệu kiểu (Reified Generics) trong thời gian chạy:
- **Với Reference Types (`List<string>`, `List<Customer>`):** Vì mọi con trỏ tham chiếu trên 64-bit đều có kích thước 8 bytes như nhau, JIT Compiler chia sẻ chung một phiên bản mã máy thực thi (Shared JIT Code), giúp tiết kiệm bộ nhớ RAM.
- **Với Value Types (`List<int>`, `List<double>`):** Do mỗi Value Type có kích thước byte và cấu trúc ô nhớ khác biệt, JIT Compiler sẽ biên dịch ra một phiên bản mã máy chuyên biệt độc lập (Specialized Native Code) cho từng kiểu dữ liệu, loại bỏ 100% Boxing/Unboxing và mang lại tốc độ thực thi ngang ngửa C++ Templates!

### 2.2 Các Loại Ràng Buộc (Generic Constraints)

```csharp
// Tổng hợp các ràng buộc:
public class Repository<TEntity, TKey>
    where TEntity : class, IEntity<TKey>, new() // TEntity phải là Reference Type, implement IEntity, và có parameterless constructor
    where TKey : struct                         // TKey phải là Value Type
{
    public TEntity Create() => new TEntity();
}
```

- `where T : struct`: Bắt buộc là Value Type (không thể null).
- `where T : class`: Bắt buộc là Reference Type.
- `where T : notnull`: Không được phép là null (C# 8+).
- `where T : new()`: Phải có constructor mặc định không tham số.
- `where T : unmanaged`: Phải là struct thuần túy không chứa bất kỳ trường reference type nào (có thể lấy con trỏ `unsafe`).
- `where T : BaseClass` hoặc `where T : IInterface`.

### 2.3 Hiệp Biến (Covariance: `out`) & Phản Biến (Contravariance: `in`)
Áp dụng trên Generic Interface và Delegate:
1. **Covariance (`out T`):** Cho phép gán một interface có tham số kiểu con cho một interface có tham số kiểu cha (Chỉ dùng `T` làm giá trị trả về output):
   ```csharp
   IEnumerable<Dog> dogs = new List<Dog>();
   IEnumerable<Animal> animals = dogs; //  HỢP LỆ nhờ "out T" trong IEnumerable<out T>
   ```
2. **Contravariance (`in T`):** Cho phép gán kiểu cha cho kiểu con (Chỉ dùng `T` làm tham số đầu vào input):
   ```csharp
   Action<Animal> feedAnimal = a => a.Eat();
   Action<Dog> feedDog = feedAnimal; //  HỢP LỆ nhờ "in T" trong Action<in T>
   ```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Dùng `new T()` chậm hơn so với giải pháp Factory
Toán tử `new T()` bên dưới sử dụng `Activator.CreateInstance<T>()` thông qua Reflection, chậm hơn đáng kể so với việc truyền một Delegate Factory `Func<T>`:
```csharp
//  Nhanh gấp 10 lần:
public class FastFactory<T>(Func<T> factory) {
    public T Create() => factory();
}
```

---

## 4. Code Thực Hành (Production Patterns)

```csharp
// Pattern: Generic Result Pattern chuẩn Clean Architecture
public class Result<T> {
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }

    private Result(T value) {
        IsSuccess = true;
        Value = value;
        Error = null;
    }

    private Result(string error) {
        IsSuccess = false;
        Value = default;
        Error = error;
    }

    public static Result<T> Success(T val) => new(val);
    public static Result<T> Failure(string err) => new(err);
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Reified Generics trong .NET khác gì so với Type Erasure trong Java?
   - *Trả lời:* Trong Java, Generics chỉ tồn tại ở bước biên dịch; compiler xóa bỏ mọi thông tin kiểu và ép về `Object` (Type Erasure), khiến Java không thể phân biệt `List<String>` và `List<Integer>` lúc runtime và bắt buộc phải boxing các kiểu nguyên thủy (`int` thành `Integer`). Trong .NET, thông tin kiểu Generic được lưu giữ nguyên vẹn trong Metadata của Assembly (.dll) và được CLR nhận biết lúc runtime (Reified Generics). Nhờ đó, .NET có thể sinh mã máy tối ưu riêng cho từng Value Type, phản chiếu kiểu chính xác qua Reflection và hỗ trợ `typeof(List<int>) != typeof(List<string>)`.

2. **Câu hỏi:** Tại sao `List<Dog>` không thể gán trực tiếp cho `List<Animal>` dù `Dog` kế thừa từ `Animal`?
   - *Trả lời:* `List<T>` là một cấu trúc dữ liệu có cả đọc (output) và ghi (input). Nếu cho phép `List<Animal> animals = dogs;`, bạn có thể thực hiện lệnh `animals.Add(new Cat());` (vì `Cat` cũng là một `Animal`), điều này sẽ làm hỏng tính toàn vẹn kiểu của mảng `dogs` ban đầu (một con mèo bị nhét vào danh sách chó!). Do đó, chỉ những interface chỉ-đọc (Read-only) được đánh dấu `out` (như `IEnumerable<out T>` hoặc `IReadOnlyList<out T>`) mới hỗ trợ tính Hiệp biến (Covariance).
