# Chapter 5: SOLID Principles (5 Nguyên Lý SOLID Thực Chiến)

> **Mục tiêu chương:** Giải mã tường tận 5 nguyên lý thiết kế hướng đối tượng SOLID kinh điển của Robert C. Martin (Uncle Bob) thông qua các case study thực tế, đối chiếu trực diện mã nguồn "Xấu" (Bad Code - Vi phạm) và "Tốt" (Good Code - Tái cấu trúc) từ các nhánh Git `Chapter5/Lesson/*` của repo `Almantask/CSharp-From-Zero-To-Hero`.

---

## 📑 Danh Mục Bài Học

| Bài | Tên bài học | Tệp tài liệu | Nhánh Git tham chiếu | Trọng tâm kiến thức |
| :---: | :--- | :--- | :--- | :--- |
| **01** | SRP: Đơn Trách Nhiệm | [01-single-responsibility-principle.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/05-solid-principles/01-single-responsibility-principle.md) | `Chapter5/Lesson/SRP` | "Một lớp chỉ nên có một lý do duy nhất để thay đổi", Phân rã God Class, Tách biệt I/O và Logic |
| **02** | OCP: Đóng Mở | [02-open-closed-principle.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/05-solid-principles/02-open-closed-principle.md) | `Chapter5/Lesson/OCP` | "Mở rộng tính năng mới mà không sửa mã cũ", Case study TaxesCalculator, Chiến lược Đa hình |
| **03** | LSP: Thay Thế Liskov | [03-liskov-substitution-principle.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/05-solid-principles/03-liskov-substitution-principle.md) | `Chapter5/Lesson/LSP` | "Lớp con phải thay thế được lớp cha mà không phá vỡ tính đúng đắn", Bài toán Hình chữ nhật - Hình vuông |
| **04** | ISP: Phân Tách Giao Diện | [04-interface-segregation-principle.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/05-solid-principles/04-interface-segregation-principle.md) | `Chapter5/Lesson/ISP` | "Không bắt client phụ thuộc vào phương thức nó không dùng", Chia nhỏ Fat Interface thành Role Interfaces |
| **05** | DIP: Đảo Ngược Phụ Thuộc & IoC | [05-dependency-inversion-and-ioc.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/05-solid-principles/05-dependency-inversion-and-ioc.md) | `Chapter5/Lesson/DIP` | "Phụ thuộc vào trừu tượng, không phụ thuộc cụ thể", Composition Root, IoC Containers (Autofac, Ninject, MS DI) |

---

## 🎥 Tài Nguyên Video & Slides Chính Thức

- **Lesson 1 (Single Responsibility):** [Slides](https://docs.google.com/presentation/d/1TLrozvrn6briqE9DKboitZwewFbJSxVlq7pIzfI_0fc/edit?usp=sharing) | [Video](https://youtu.be/-yTzh_BxZAs)
- **Lesson 2 (Open-Closed):** [Slides](https://docs.google.com/presentation/d/1B-q2UL2s7SMzi5P7hU_sJSpSsZ-0G8ZQJgqALEdxMjk/edit?usp=sharing) | [Video](https://youtu.be/HcMRjJKvF7g)
- **Lesson 3 (Liskov Substitution):** [Slides](https://docs.google.com/presentation/d/1aqnqX55dp_gSxJNrYNGTtqz_vi_Z_aKV7xpSf5wPuJg/edit?usp=drivesdk) | [Video](https://youtu.be/y4C0Wedi114)
- **Lesson 4 (Interface Segregation):** [Slides](https://docs.google.com/presentation/d/1tPKvQ7AFRSz94zK3FUF1eDErnQ4oMQgwsfdrNTKw9U4/edit?usp=sharing) | [Video](https://youtu.be/HkvmcLUKgzw)
- **Lesson 5 (Dependency Inversion):** [Slides](https://docs.google.com/presentation/d/1hiSKCULC_kqfbAvT9F61AIRbfEJ4bIvDg8iaxnVIJxQ/edit#slide=id.p) | [Video](https://youtu.be/vwZdC7mHAJg)
