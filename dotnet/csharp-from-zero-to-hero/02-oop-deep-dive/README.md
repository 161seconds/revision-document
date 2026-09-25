# Chapter 2: Object-Oriented Programming (OOP) Deep Dive

> **Triết lý của tác giả Almantas Karpavicius:**  
> *"Lập trình hướng đối tượng (OOP) phát triển từ lập trình thủ tục (Procedural). Mục tiêu tối thượng của OOP là **thu hẹp phạm vi mà bộ não lập trình viên cần quan tâm tại một thời điểm** (Reduce the cognitive scope). Vì con người càng được tự do thì càng dễ mắc sai lầm, do đó ta phải che giấu dữ liệu tối đa, chỉ cho phép đột biến trạng thái qua các hàm công khai có kiểm soát chặt chẽ."*

---

## 📑 Danh Mục Bài Học

| Bài | Tên bài học | Tệp tài liệu | Nhánh Git tham chiếu | Trọng tâm kiến thức |
| :---: | :--- | :--- | :--- | :--- |
| **01** | Đóng gói & Che giấu dữ liệu | [01-encapsulation-and-data-hiding.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/02-oop-deep-dive/01-encapsulation-and-data-hiding.md) | `Chapter2/Lesson/Encapsulation` | Class vs Object, Fields tư nhân (`private`), Phương thức công khai (`public`), Bất biến trạng thái |
| **02** | Kế thừa & Tái sử dụng mã nguồn | [02-inheritance-and-code-reuse.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/02-oop-deep-dive/02-inheritance-and-code-reuse.md) | `Chapter2/Lesson/Inheritance` | Lớp cha (`base`), Lớp con (`derived`), Từ khóa `protected`, Constructor chaining (`: base()`) |
| **03** | Composition vs Inheritance | [03-composition-over-inheritance.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/02-oop-deep-dive/03-composition-over-inheritance.md) | `Chapter2/Lesson/Inheritance`, `Chapter5/Lesson/OCP` | Nguyên tắc "Ưu tiên hợp thành hơn kế thừa", Quan hệ HAS-A vs IS-A, Tránh bùng nổ lớp (Class explosion) |
| **04** | Đa hình: Virtual, Abstract & Override | [04-virtual-abstract-and-polymorphism.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/02-oop-deep-dive/04-virtual-abstract-and-polymorphism.md) | `Chapter2/Lesson/Virtual-And-Abstract` | Phương thức ảo (`virtual`), Lớp trừu tượng (`abstract`), `override` vs `new` (Shadowing vs Polymorphic dispatch) |
| **05** | Interface: Đỉnh cao trừu tượng hóa | [05-interfaces-the-ultimate-abstraction.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/02-oop-deep-dive/05-interfaces-the-ultimate-abstraction.md) | `Chapter2/Lesson/Interface-The-Ultimate-Abstraction` | Hợp đồng (Contract), Đa hiện thực interface, Loose Coupling, Nền tảng cho Unit Testing & DI |
| **06** | Bài tập: Game Inventory & Shop Simulator | [06-homework-shop-and-inventory-simulator.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/02-oop-deep-dive/06-homework-shop-and-inventory-simulator.md) | `Chapter2/Homework/1,2,3,4` | Mô phỏng hệ thống Cửa hàng bán đồ & Túi đồ người chơi, Thử thách Milkshakes Simulator |

---

## 🎥 Tài Nguyên Video & Slides Chính Thức

- **Lesson 1 (OOP & Encapsulation):** [Slides](https://docs.google.com/presentation/d/1gp-qFGU24h1DHQzuaCycp6HtvpJmw7-WPjki04ETtrk/edit?usp=sharing) | [Video](https://youtu.be/GHteKkvP4nU)
- **Lesson 2 (Inheritance):** [Slides](https://docs.google.com/presentation/d/1fS_QJbaOtOY-KIo8G99vBqhur4r4DQqxnVtlG-G0Wu0/edit?usp=sharing) | [Video](https://youtu.be/cJd2J8aYbwI)
- **Lesson 3 (Abstract and Virtual):** [Slides](https://docs.google.com/presentation/d/1QOO8SHC8KL8TrnnxD3Y-VL38Mkkk80-myY8jpmQwT1Y/edit?usp=sharing) | [Video](https://youtu.be/BT6VJykKYt4)
- **Lesson 4 (Interface - The Ultimate Abstraction):** [Slides](https://docs.google.com/presentation/d/1-mH8nZwtcZonV30kA-MQgf7kTe-pxfJNsHMpNfqpZ-E/edit?usp=sharing) | [Video](https://youtu.be/qwovnjTdObI)
- **Bài kiểm tra tốt nghiệp Chapter 2 (Google Forms Exam):** [Làm bài thi Chapter 2](https://forms.gle/zBrEekeT54MD3WcK7)
