# Bài 2: Repository Pattern & Unit of Work (Kiến Trúc Truy Cập Dữ Liệu)

> **Trọng tâm bài học:** Bản chất của mẫu thiết kế **Repository** (Trừu tượng hóa việc truy xuất dữ liệu giống như một tập hợp trong RAM) và **Unit of Work** (Quản lý các giao dịch ACID nguyên tử qua nhiều bảng), và cách giải quyết tranh cãi "EF Core đã là Repository & Unit of Work rồi, tại sao vẫn cần bọc ngoài?".

---

## 1. Tranh Luận: EF Core Có Cần Thêm Repository Pattern Không?

Bản thân `DbContext` trong EF Core đã là một **Unit of Work**, và `DbSet<T>` đã là một **Repository**.  
Tuy nhiên, trong các hệ thống doanh nghiệp lớn:
- Ta bọc ngoài một tầng Repository trừu tượng để **cách ly hoàn toàn tầng nghiệp vụ (Domain Layer) khỏi EF Core**.
- Nhờ đó, ta có thể viết Unit Test cho tầng Service cực kỳ nhanh bằng cách inject `Mock<IRepository<T>>` mà không cần dựng SQLite In-Memory hay test container.
- Giữ các câu truy vấn phức tạp (complex specifications) tập trung tại một nơi thay vì rải rác khắp các Controller.

---

## 2. Cài Đặt Khung Chuẩn Generic Repository & Unit of Work

### 1. Interface Repository & Unit of Work
```csharp
public interface IRepository<T> where T : class
{
    Task<T> GetByIdAsync(int id);
    Task<IReadOnlyList<T>> GetAllAsync();
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}

public interface IUnitOfWork : IDisposable
{
    IRepository<Person> People { get; }
    IRepository<Pet> Pets { get; }
    Task<int> CommitAsync(); // Đảm bảo toàn bộ thay đổi được lưu thành 1 giao dịch ACID duy nhất!
}
```

### 2. Triển Khai Với EF Core
```csharp
public class UnitOfWork : IUnitOfWork
{
    private readonly PeopleAndPetsDbContext _context;
    private IRepository<Person> _people;
    private IRepository<Pet> _pets;

    public UnitOfWork(PeopleAndPetsDbContext context)
    {
        _context = context;
    }

    public IRepository<Person> People => _people ??= new EfRepository<Person>(_context);
    public IRepository<Pet> Pets => _pets ??= new EfRepository<Pet>(_context);

    public async Task<int> CommitAsync()
    {
        // Thực thi toàn bộ các câu lệnh INSERT/UPDATE/DELETE trong cùng 1 Transaction
        return await _context.SaveChangesAsync();
    }

    public void Dispose() => _context.Dispose();
}
```

### 3. Sử dụng trong Service Nghiệp Vụ:
```csharp
public class AdoptionService
{
    private readonly IUnitOfWork _uow;

    public AdoptionService(IUnitOfWork uow) => _uow = uow;

    public async Task AdoptPetAsync(int personId, int petId)
    {
        var person = await _uow.People.GetByIdAsync(personId);
        var pet = await _uow.Pets.GetByIdAsync(petId);

        pet.PersonId = person.Id;
        _uow.Pets.Update(pet);

        // Lưu toàn bộ giao dịch: Nếu xảy ra lỗi giữa chừng, CSDL tự rollback 100%!
        await _uow.CommitAsync();
    }
}
```
