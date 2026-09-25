# Chapter 1: Fundamentals (Nền Tảng C# & Tư Duy Lập Trình)

> **Mục tiêu chương:** Xây dựng nền tảng vững chắc về cú pháp C#, hệ thống kiểu dữ liệu CTS, xử lý I/O Console, luồng điều khiển, cấu trúc dữ liệu cơ bản (mảng, chuỗi), kỹ năng gỡ lỗi (Debugging) và quy trình làm việc chuẩn mực trên Git/GitHub.

---

## 📑 Danh Mục Bài Học

| Bài | Tên bài học | Tệp tài liệu | Nhánh Git tham chiếu | Trọng tâm kiến thức |
| :---: | :--- | :--- | :--- | :--- |
| **01** | Biến, Kiểu dữ liệu & Console | [01-variables-and-console.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/01-fundamentals/01-variables-and-console.md) | `Chapter1/Lesson/Variables-And-Console` | `int`, `long`, `float`, `double`, `decimal`, `string`, `char`, `bool`, `var`, `Console.ReadLine`, `Parse` |
| **02** | Git & Quy trình Open Source | [02-git-and-github-workflow.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/01-fundamentals/02-git-and-github-workflow.md) | `Chapter1/Lesson/Git` | Fork, Clone, Branching, Commit, Push, Pull Request, Review, Visual Studio Team Explorer & GitKraken |
| **03** | Hàm & Quy chuẩn Clean Code | [03-functions-and-clean-code.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/01-fundamentals/03-functions-and-clean-code.md) | `Chapter1/Lesson/Functions` | Đặt tên động từ, Tham số, Giá trị trả về, Single Responsibility, Phạm vi biến (Scope) |
| **04** | Luồng logic & Rẽ nhánh | [04-logical-flow-and-conditions.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/01-fundamentals/04-logical-flow-and-conditions.md) | `Chapter1/Lesson/Logical-Flow` | `if`/`else if`/`else`, `switch`, Đoản mạch (`&&`, `||`), Guard Clauses |
| **05** | Vòng lặp & Mảng 1 chiều | [05-loops-and-arrays.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/01-fundamentals/05-loops-and-arrays.md) | `Chapter1/Lesson/Arrays-And-Loops` | `for`, `while`, `do-while`, `foreach`, Cấp phát mảng `T[]`, Indexing, Lỗi Off-by-one |
| **06** | Kỹ năng Debugging chuyên nghiệp | [06-debugging-and-troubleshooting.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/01-fundamentals/06-debugging-and-troubleshooting.md) | `Chapter1/Lesson/Debugging` | Breakpoint, Step Over (F10), Step Into (F11), Step Out, Watch, Call Stack, Immediate Window |
| **07** | Chuỗi & Mã hóa ký tự | [07-strings-and-encoding.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/01-fundamentals/07-strings-and-encoding.md) | `Chapter1/Lesson/String`, `Encoding` | Immutability, `StringBuilder`, String Interpolation, ASCII, UTF-8, Phép toán ký tự (`'z' - 'a'`) |
| **08** | Xử lý File & Bắt lỗi Ngoại lệ | [08-files-and-error-handling.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/01-fundamentals/08-files-and-error-handling.md) | `Chapter1/Lesson/Files-And-Errors` | `System.IO.File`, Đọc/Ghi file, `try-catch-finally`, Bắt đúng loại ngoại lệ (Specific Catch) |
| **09** | Số ngẫu nhiên & Phép toán Modulo | [09-random-and-math-mod.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/01-fundamentals/09-random-and-math-mod.md) | `Chapter1/Lesson/Random` | `System.Random`, Seed ngẫu nhiên, Phép chia lấy dư `%`, Phân bổ giá trị |
| **10** | Bài tập & Thử thách toàn diện | [10-challenges-and-homework.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/01-fundamentals/10-challenges-and-homework.md) | `Chapter1/Homework/*`, `Challenges/*` | 10 bài tập lớn + Game Hangman + Thử thách Exterminator |

---

## 🎥 Tài Nguyên Video & Slides Chính Thức (Tác giả Almantas Karpavicius)

- **Lesson 1 (Variables & Console):** [Slides](https://docs.google.com/presentation/d/1k3hNBxZSCWA2uAF8XA5mBVM-zgG7UcFi_0t2nN1Zaak/edit?usp=sharing) | [Video](https://youtu.be/wwnDtE6Z-ic)
- **Lesson 2 (Git & VS):** [Slides](https://docs.google.com/presentation/d/1wmfYL9QZR2amAVHCrbeObsJ5MQkk9buWDDJHqZbcbdM/edit?usp=sharing) | [Video](https://www.youtube.com/watch?v=PNOSbXjQD9o)
- **Lesson 3 (Functions):** [Slides](https://docs.google.com/presentation/d/1p5SWHATsSFk7WQlm183JLFFDUa9xV64ZhIwYJnfCxKs/edit?usp=sharing) | [Video](https://youtu.be/oEkjT56I_fk)
- **Lesson 4 (Logical Flow):** [Slides](https://docs.google.com/presentation/d/1UBuFbvh4H7CtyCP9NnWOa3cTOZmb8zjDJjZCxhG-D2I/edit?usp=sharing) | [Video](https://youtu.be/uuCx4T3NqmU)
- **Lesson 5 (Loops & Arrays):** [Slides](https://docs.google.com/presentation/d/1drg2UNGkh2SypFR5MH7pcNbUYlii-tQXqVkh1qQh_Z0/edit?usp=sharing) | [Video](https://youtu.be/9ujXBUQx3Ns)
- **Lesson 6 (Debugging):** [Slides](https://docs.google.com/presentation/d/1lZIrCHTiHfWRxeP1X9upnayI0TtVmeYut0-Z13z_FpQ/edit?usp=sharing) | [Video](https://youtu.be/dNe6-lPN6OE)
- **Lesson 7 (String):** [Video](https://youtu.be/SWMxiZyl9H0)
- **Lesson 8 (Files & Errors):** [Slides](https://docs.google.com/presentation/d/11jD_TazdFlS6sUA4w2yZYgPZc8UK9aV0i0X5S-Ck_xY/edit?usp=sharing) | [Video](https://youtu.be/K-ca77WPkAY)
- **Lesson 9 (Encoding):** [Slides](https://docs.google.com/presentation/d/1xLch_r4sAV47Eek8fzDh2tY9DMgTVGoMe2Sb6CP_3hk/edit?usp=sharing) | [Video](https://youtu.be/SykWr2LAr0s)
- **Lesson 10 (Random):** [Slides](https://docs.google.com/presentation/d/1qG7JcR2hWir_mml4y6ndw1WeNe7QJcIvc-iv-bAoSeY/edit?usp=sharing) | [Video](https://youtu.be/2ZhiQ4lCHsA)
- **Bài kiểm tra tốt nghiệp Chapter 1 (Google Forms Exam):** [Làm bài thi Chapter 1](https://forms.gle/TRZFX12DKJQJcFSV9)
