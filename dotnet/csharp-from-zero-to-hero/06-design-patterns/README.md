# Chapter 6: Design Patterns (Các Mẫu Thiết Kế Kinh Điển Trong C#)

> **Triết lý từ tác giả Almantas Karpavicius:**  
> *"Design Patterns không phải là những phát minh mới lạ trên giấy; chúng là những giải pháp tối ưu đã được tôi luyện qua hàng thập kỷ để giải quyết các vấn đề lặp đi lặp lại trong kỹ nghệ phần mềm. Tuy nhiên, pattern không phải là cây đũa thần và không phải pattern nào cũng tốt (ví dụ Singleton thường bị biến thành Antipattern). Hiểu rõ trade-offs (đánh đổi) của từng mẫu thiết kế là thước đo của một kỹ sư phần mềm thực thụ."*

---

## 📑 Danh Mục Bài Học

| Bài | Tên bài học | Tệp tài liệu | Nhánh Git tham chiếu | Trọng tâm kiến thức |
| :---: | :--- | :--- | :--- | :--- |
| **01** | Singleton & Facade | [01-singleton-and-facade.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/06-design-patterns/01-singleton-and-facade.md) | `Chapter6/Lesson/Singleton-Facade` | Tại sao Singleton là Antipattern? Cài đặt Thread-safe `Lazy<T>`, Facade đơn giản hóa hệ thống con |
| **02** | Adapter & Chain of Responsibility | [02-adapter-and-chain-of-responsibility.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/06-design-patterns/02-adapter-and-chain-of-responsibility.md) | `Chapter6/Lesson/Adapter-ChainOfResponsibility` | Cầu nối không tương thích (Adapter), Đường ống xử lý yêu cầu nối tiếp (Pipeline / Middleware) |
| **03** | Strategy & Command | [03-strategy-and-command.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/06-design-patterns/03-strategy-and-command.md) | `Chapter6/Lesson/Strategy-Command` | Thuật toán hoán đổi (MinFinder: Raw vs Linq), Đóng gói yêu cầu thành Object (Điều khiển TV Remote có Undo) |
| **04** | Decorator & Builder | [04-decorator-and-builder.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/06-design-patterns/04-decorator-and-builder.md) | `Chapter6/Lesson/Decorator-Builder` | Chồng lớp tính năng động (Notebook ghi File, DB, Email), Xây dựng đối tượng phức tạp dạng Fluent |
| **05** | State, Bridge & Null Object | [05-state-bridge-null-object.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/06-design-patterns/05-state-bridge-null-object.md) | `Chapter6/Lesson/State-Bridge-NullObject` | Đóng gói hành vi theo trạng thái, Tách rời trừu tượng và thực thi, Triệt tiêu kiểm tra `null` |
| **06** | Mediator & Observer | [06-mediator-and-observer.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/06-design-patterns/06-mediator-and-observer.md) | `Chapter6/Lesson/Mediator-Observer` | Trung tâm điều phối liên lạc lỏng lẻo (MediatR), Mô hình Xuất bản - Đăng ký (Pub/Sub) |

---

## 🎥 Tài Nguyên Video & Slides Chính Thức

- **Lesson 1 (Strategy vs Command):** [Slides](https://docs.google.com/presentation/d/13dRZhpGZmEnl71J6xeQgtyM2I9NEdeu_qQr3HtHmlQs/edit?usp=sharing) | [Video](https://youtu.be/SCN2euakVx8)
- **Lesson 2 (Singleton and Facade):** [Slides](https://docs.google.com/presentation/d/1ypzG5xEqALrNgiIZ3O_-YUNdmiya9inZM5xqBX-WzuI/edit?usp=sharing) | [Video](https://youtu.be/ELPzM7BOb3E)
- **Lesson 3 (State, NullObject, Bridge):** [Slides](https://docs.google.com/presentation/d/11QKvmW8VBWifC9jXnsiUMu5VF4GLxKue9-Y-LjCD8s4/edit?usp=sharing) | [Video](https://youtu.be/s1wdHr1hSZU)
- **Lesson 4 (Mediator and Observer):** [Slides](https://docs.google.com/presentation/d/1sNYuqVkEwjBohUHW4fwGuE4TYDHA9k2CFGg3UacjPoo/edit?usp=sharing) | [Video](https://youtu.be/mVNg2_3Y2Ms)
- **Lesson 5 (Builder and Decorator):** [Video](https://youtu.be/e9NTdmUwjpw)
- **Lesson 6 (Adapter and Chain of Responsibility):** [Video](https://youtu.be/o4wR-JLb-KI)
