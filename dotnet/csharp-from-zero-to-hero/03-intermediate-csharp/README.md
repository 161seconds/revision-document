# Chapter 3: Intermediate C# (C# Trung Cấp & Tính Năng Nâng Cao)

> **Mục tiêu chương:** Làm chủ các "vũ khí hạng nặng" trong ngôn ngữ C#: Từ Properties, Enums, cơ chế truyền tham chiếu (`in`, `out`, `ref`), các toán tử xử lý Null an toàn, Lập trình tổng quát Generics, Cấu trúc dữ liệu Collections, Ủy quyền & Sự kiện (Delegates & Events qua dự án mô phỏng Monster Fight), LINQ toàn tập, Extension Methods, Nạp chồng toán tử đến Serialization và Reflection.

---

## 📑 Danh Mục Bài Học

| Bài | Tên bài học | Tệp tài liệu | Nhánh Git tham chiếu | Trọng tâm kiến thức |
| :---: | :--- | :--- | :--- | :--- |
| **01** | Properties & Enums | [01-properties-and-enums.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/03-intermediate-csharp/01-properties-and-enums.md) | `Chapter3/Lesson/List-Properties-And-Enum` | Auto-properties, Backing fields, Computed properties, `init`, `[Flags]` Enums |
| **02** | Tham Số `in`, `out`, `ref` | [02-in-out-ref-parameters.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/03-intermediate-csharp/02-in-out-ref-parameters.md) | `Chapter3/Lesson/in-out-ref` | Truyền tham trị vs Tham chiếu, `ref`, `out`, `in` (Read-only ref), `ref struct` |
| **03** | Xử Lý Null & Cú Pháp Tinh Gọn | [03-null-operators-and-syntax-sugar.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/03-intermediate-csharp/03-null-operators-and-syntax-sugar.md) | `Chapter3/Lesson/Null-related-operators` | `Nullable<T>`, Elvis `?.`, Coalescing `??` và `??=`, Null-forgiving `!`, Pattern Matching |
| **04** | Generics Toàn Tập | [04-generics-in-depth.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/03-intermediate-csharp/04-generics-in-depth.md) | `Chapter3/Lesson/Generics` | Generic classes/methods, Constraints (`where T : class, new()`), Triệt tiêu Boxing |
| **05** | Mảng Đa Chiều & Dictionaries | [05-collections-arrays-and-dictionaries.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/03-intermediate-csharp/05-collections-arrays-and-dictionaries.md) | `Chapter3/Lesson/N-Arrays-And-Dictionary` | Mảng 2D `[,]`, Mảng răng cưa Jagged `[][]`, `Dictionary<K,V>`, Bảng băm & Collision |
| **06** | Delegates & Events (Monster Fight) | [06-delegates-and-events-monster-fight.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/03-intermediate-csharp/06-delegates-and-events-monster-fight.md) | `Chapter3/Lesson/Delegates` | Con trỏ hàm, `Action`, `Func`, `Predicate`, `event EventHandler<T>`, Monster Fight Game |
| **07** | LINQ Từ Cơ Bản Đến Nâng Cao | [07-linq-basics-to-advanced.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/03-intermediate-csharp/07-linq-basics-to-advanced.md) | `Chapter3/Lesson/LINQ-Basics`, `Advanced` | Deferred Execution, `Where`, `Select`, `SelectMany`, `GroupBy`, `Join`, `Aggregate` |
| **08** | Extension Methods & IEnumerable | [08-extension-methods-and-ienumerable.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/03-intermediate-csharp/08-extension-methods-and-ienumerable.md) | `Chapter3/Lesson/Extension-Enumerable` | `this` parameter, Cài đặt `IEnumerable<T>`, Máy trạng thái `yield return` |
| **09** | Nạp Chồng Toán Tử (Operator Overloading) | [09-operator-overloading.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/03-intermediate-csharp/09-operator-overloading.md) | `Chapter3/Lesson/OperatorsOverloading` | Overload `+`, `-`, `*`, `==`, `!=`, Toán tử ép kiểu ngầm định (`implicit`) và tường minh (`explicit`) |
| **10** | Tuần Tự Hóa: JSON & XML | [10-serialization-json-xml.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/03-intermediate-csharp/10-serialization-json-xml.md) | `Chapter3/Lesson/Serialization` | `System.Text.Json`, `Newtonsoft.Json`, XML Serializer, Data Contracts, Bẫy vòng lặp tham chiếu |
| **11** | Attributes & Reflection | [11-attributes-and-reflection.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/03-intermediate-csharp/11-attributes-and-reflection.md) | `Chapter3/Lesson/Attributes`, `Exotic` | Custom Attributes, Soi metadata qua `Type` và `System.Reflection`, Niche features |

---

## 🎥 Tài Nguyên Video & Slides Chính Thức

- **Lesson 1 (Properties & Enum):** [Slides](https://docs.google.com/presentation/d/15Sd-iMnULTtne0gRNYi3hhfxJiI-CUmh6jl-LzIR0Qg/edit?usp=sharing) | [Video](https://youtu.be/5z4wb1FX7E4?t=312)
- **Lesson 2 (in, out, ref):** [Slides](https://docs.google.com/presentation/d/1lvb51XOQuaAsPYIIabQUZwZSOArgkepDtxUHbDkF2nA/edit?usp=sharing) | [Video](https://youtu.be/0kA9a8Odbz0)
- **Lesson 3 (Null-related operators):** [Slides](https://docs.google.com/presentation/d/1lemZ1Pz23wag-oZb4V6O813rVyavxiNGa3_RKXDQmb8/edit?usp=sharing) | [Video Part 1](https://youtu.be/fTl4u89-WIk) - [Part 2](https://youtu.be/mh0w2T7-5KM)
- **Lesson 4 (Generics):** [Slides](https://docs.google.com/presentation/d/1jwmbf0IAhLgV_s1LxZQSGL9YCAwqz1pIinZPxVsoVP4/edit?usp=sharing) | [Video Part 1](https://youtu.be/pxx-2oqDqT8) - [Part 2](https://youtu.be/qaMqVn0-Irg)
- **Lesson 5 (N-Arrays & Dictionary):** [Slides](https://docs.google.com/presentation/d/1oUrQ5uR9viG32FjV4mLiXWdGsdCLhsXBx-QVEm0DlpI/edit?usp=sharing) | [Video](https://youtu.be/BBZlLA4ezxU)
- **Lesson 6 (Delegates & Events):** [Slides](https://docs.google.com/presentation/d/1GYaK-CvUjeU7RMgt3ZfoFdqmm99p4RokXR_z1gkzzBM/edit?usp=sharing) | [Video Part 1](https://youtu.be/J5FsEzpvRaU) - [Part 2](https://youtu.be/oH9vq1Y6UvU)
- **Lesson 7 (Extension & IEnumerable):** [Slides](https://docs.google.com/presentation/d/1CrTcaE6G2JTMz-ZpojHBM0PpZsIIqN26ynLqSctvREY/edit?usp=sharing) | [Video](https://youtu.be/UHSg6HJ45TQ)
- **Lesson 8 (LINQ Basics):** [Slides](https://docs.google.com/presentation/d/1CJYaPmmtoYHeh7DnOzZ1aneN0gJmPdgu1lrThDf47nk/edit?usp=sharing) | [Video](https://youtu.be/61o36caHTQM)
- **Lesson 9 (Advanced LINQ):** [Slides](https://docs.google.com/presentation/d/1NwLmMH72Q-Ya84a9voXW9clHdQWeQBYxnre58Rv7xjg/edit?usp=sharing) | [Video](https://youtu.be/_P5FlpcQ27E)
- **Lesson 10 (Attributes):** [Slides](https://docs.google.com/presentation/d/1g4dOcJSJrQeioBL_9KIoQAsp9-LwF7hMX0QpZKVOyQE/edit?usp=sharing) | [Video](https://www.youtube.com/watch?v=TrhYtKQXQos)
- **Lesson 11 (Serialization):** [Slides](https://docs.google.com/presentation/d/1aBuXCsi2myuYO2chE1ZL-iFqz_eDHgC3P4l-4DI4PR0/edit?usp=sharing) | [Video](https://youtu.be/IAqfI70E75o)
- **Lesson 12 (Operators Overloading):** [Slides](https://docs.google.com/presentation/d/1aZp2sjYo5YvqcI6uBprOeH5dyJLwYFNY9wCwafx3K0w/edit?usp=sharing) | [Video](https://youtu.be/1cNb3AqM7_s)
- **Lesson 13 (Exotic C# Features):** [Slides](https://docs.google.com/presentation/d/1vvp5qDh6_cr4lD7rG4zmKzdv4jyQVjeRU77EVk3VIEg/edit?usp=sharing) | [Video Part 1](https://youtu.be/VcoylinL8Rg) - [Part 2](https://youtu.be/y-QGBRRmeRE)
