# Bài 1: Entity Framework Core: Code-First & Migrations

> **Trọng tâm bài học:** Triết lý Object-Relational Mapping (ORM) với Entity Framework Core, phương pháp Code-First (Code C# sinh ra Database Schema), quản lý phiên bản CSDL qua Migrations, cấu hình quan hệ 1-Nhiều và tối ưu hóa hiệu năng với `AsNoTracking()`.

---

## 1. Triết Lý Code-First Của EF Core

Thay vì phải tự viết các câu lệnh SQL `CREATE TABLE` thủ công:
- Lập trình viên định nghĩa các thực thể nghiệp vụ bằng các lớp C# thông thường (POCO - Plain Old CLR Objects).
- Lớp `DbContext` đại diện cho một phiên làm việc với cơ sở dữ liệu.
- Công cụ EF Core Migrations sẽ tự động phân tích các lớp C# và sinh ra các kịch bản chuyển đổi CSDL (SQL Migration Scripts) hoàn toàn tự động!

---

## 2. Code Mẫu Thực Tế (Trích Nhánh `Chapter7/Lesson/EF-Code-First`)

### 1. Định nghĩa các Entity Models
```csharp
using System.Collections.Generic;

namespace BootCamp.Chapter.Models
{
    public class Person
    {
        public int Id { get; set; } // EF Core tự động nhận diện là Khóa chính (Primary Key)
        public string Name { get; set; }
        public int Age { get; set; }

        // Quan hệ 1 - Nhiều (1 Person sở hữu nhiều Pets)
        public List<Pet> Pets { get; set; } = new();
    }

    public class Pet
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Species { get; set; }

        // Khóa ngoại trỏ về Person (Foreign Key)
        public int PersonId { get; set; }
        public Person Owner { get; set; }
    }
}
```

### 2. Định nghĩa Lớp Ngữ Cảnh Cơ Sở Dữ Liệu (`DbContext`)
```csharp
using Microsoft.EntityFrameworkCore;
using BootCamp.Chapter.Models;

namespace BootCamp.Chapter
{
    public class PeopleAndPetsDbContext : DbContext
    {
        public DbSet<Person> People { get; set; }
        public DbSet<Pet> Pets { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // Sử dụng SQL Server hoặc SQLite
            optionsBuilder.UseSqlServer("Server=.;Database=BootcampDb;Trusted_Connection=True;TrustServerCertificate=True;");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Cấu hình ràng buộc nâng cao qua Fluent API
            modelBuilder.Entity<Person>()
                .Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Pet>()
                .HasOne(p => p.Owner)
                .WithMany(o => o.Pets)
                .HasForeignKey(p => p.PersonId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
```

---

## 3. Các Lệnh CLI Quản Lý Migrations
```bash
# 1. Tạo bản ghi migration đầu tiên
dotnet ef migrations add InitialCreate

# 2. Áp dụng toàn bộ migration vào máy chủ Database thật
dotnet ef database update

# 3. Tạo file script SQL thuần túy để đưa cho đội DevOps triển khai CI/CD
dotnet ef migrations script -o migration.sql
```

---

## 4. Tối Ưu Hóa Hiệu Năng EF Core: `AsNoTracking()`

Mặc định, EF Core theo dõi trạng thái của tất cả các thực thể được truy vấn (Change Tracker).  
Khi bạn chỉ cần đọc dữ liệu để hiển thị (Read-only queries):
```csharp
// Tắt Change Tracker: Nhanh hơn 30-50% và tiết kiệm hàng megabyte RAM!
var people = await db.People
                     .AsNoTracking()
                     .Where(p => p.Age >= 18)
                     .ToListAsync();
```
