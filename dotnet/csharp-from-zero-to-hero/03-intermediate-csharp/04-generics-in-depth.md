# Bài 4: Generics Toàn Tập & Ràng Buộc Kiểu (Generics In-Depth)

> **Trọng tâm bài học:** Lập trình tổng quát Generics giải quyết vấn đề gì? Triệt tiêu chi phí Boxing/Unboxing và nguy cơ `InvalidCastException` của `ArrayList`, cách thiết kế Generic Classes, Methods, và các từ khóa ràng buộc kiểu (`where T : ...`).

---

## 1. Vấn Đề Lịch Sử Trước Thời Kỳ Generics

Trước .NET 2.0 (thời kỳ của `ArrayList`):
Mọi phần tử đưa vào danh sách đều bị ép về kiểu `object`:
```csharp
// Thời kỳ C# 1.0 (Trước Generics)
ArrayList list = new ArrayList();
list.Add(42);         // BOXING: Chuyển int (Value Type) thành object trên Heap!
list.Add("Hello");    // Lưu chuỗi

// Khi lấy ra: Bắt buộc phải ép kiểu (Cast) thủ công:
int number = (int)list[0]; // UNBOXING
int error = (int)list[1];  // BÙM! Văng InvalidCastException tại thời điểm chạy!
```

### Chi phí nặng nề:
1. **Mất an toàn kiểu (Type Safety):** Trình biên dịch không thể phát hiện lỗi nhầm kiểu.
2. **Suy giảm hiệu năng nghiêm trọng:** Thao tác Boxing và Unboxing liên tục gây áp lực phân bổ bộ nhớ lên Garbage Collector.

---

## 2. Giải Pháp: Generics (`List<T>`)

Generics cho phép bạn định nghĩa các lớp, giao diện hoặc hàm với một "tham số kiểu" (`Type Parameter - T`) chưa được xác định.  
Tại thời điểm sử dụng, bạn truyền vào một kiểu cụ thể (ví dụ `List<int>`), và JIT Compiler sẽ sinh ra mã máy được tối ưu riêng biệt cho kiểu đó:

```csharp
// Không tốn bất kỳ chi phí Boxing nào! Hoàn toàn an toàn kiểu lúc compile-time!
List<int> numbers = new List<int>();
numbers.Add(42);
// numbers.Add("Hello"); // LỖI BIÊN DỊCH NGAY LẬP TỨC!
```

---

## 3. Các Ràng Buộc Kiểu (Generic Constraints - `where T : ...`)

Nếu không có ràng buộc, `T` được xem như `object` (bạn không thể gọi `new T()`, không thể gọi các phương thức nghiệp vụ).  
Để mở khóa tính năng cho `T`, ta sử dụng mệnh đề `where`:

| Ràng buộc | Ý nghĩa cú pháp | Khả năng mở khóa |
| :--- | :--- | :--- |
| `where T : class` | `T` phải là kiểu tham chiếu (Reference Type) | Cho phép gán `T = null` |
| `where T : struct` | `T` phải là kiểu giá trị không null (Value Type) | Đảm bảo cấp phát trên Stack |
| `where T : new()` | `T` phải có một constructor không tham số công khai | Cho phép gọi `new T()` |
| `where T : IEntity` | `T` phải kế thừa hoặc hiện thực interface `IEntity` | Cho phép truy cập `item.Id` |
| `where T : BaseClass` | `T` phải là lớp con của `BaseClass` | Gọi các phương thức của lớp cha |

---

## 4. Xây Dựng Generic Repository Thực Chiến (Trích Từ Repo)

```csharp
namespace BootCamp.Chapter
{
    public interface IEntity
    {
        int Id { get; set; }
    }

    // Lớp Generic Repository với nhiều ràng buộc kết hợp
    public class Repository<T> where T : class, IEntity, new()
    {
        private readonly List<T> _database = new();

        public void Add(T entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            _database.Add(entity);
        }

        public T GetById(int id)
        {
            return _database.FirstOrDefault(item => item.Id == id);
        }

        public T CreateDefault()
        {
            // Được phép gọi new T() nhờ ràng buộc "new()"
            var instance = new T();
            instance.Id = -1;
            return instance;
        }

        public IReadOnlyList<T> GetAll() => _database.AsReadOnly();
    }
}
```
