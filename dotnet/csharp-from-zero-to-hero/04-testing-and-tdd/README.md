# Chapter 4: Automated Testing & TDD (Kiểm Thử Tự Động & Lập Trình Hướng Kiểm Thử)

> **Triết lý kiểm thử của tác giả Almantas Karpavicius:**  
> *"Kiểm thử không chỉ là cách để kiểm tra xem code của bạn có chạy được hay không. Tests chính là **tài liệu sống (Living Documentation)** của hệ thống, là bằng chứng chứng minh bạn đã hoàn thành công việc, và là chiếc phao cứu sinh giúp bạn tự tin tái cấu trúc hệ thống mà không sợ làm gãy đổ bất kỳ tính năng nào."*

---

## 📑 Danh Mục Bài Học

| Bài | Tên bài học | Tệp tài liệu | Nhánh Git tham chiếu | Trọng tâm kiến thức |
| :---: | :--- | :--- | :--- | :--- |
| **01** | Mô hình 3A: Arrange - Act - Assert | [01-arrange-act-assert-pattern.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/04-testing-and-tdd/01-arrange-act-assert-pattern.md) | `Chapter4/Lesson/Arrange-Act-Assert` | Cấu trúc chuẩn 3A, Framework xUnit, Quy ước đặt tên test case, Kiểm tra điều kiện biên |
| **02** | Quy Trình TDD: Red - Green - Refactor | [02-test-driven-development-tdd.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/04-testing-and-tdd/02-test-driven-development-tdd.md) | `Chapter4/Lesson/TDD` | Chu trình TDD, Case Study AppointmentService, Thiết kế mã nguồn phát sinh từ test |
| **03** | Thiết Kế Dễ Test & Kỹ Thuật Mocking | [03-design-for-testability-and-mocking.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/04-testing-and-tdd/03-design-for-testability-and-mocking.md) | `Chapter4/Lesson/Design-For-Testability-And-Mocking` | Phân loại Test Doubles (Dummies, Stubs, Mocks, Spies), Thư viện Moq, Dependency Injection |
| **04** | AutoFixture & FluentAssertions | [04-autofixture-and-fluentassertions.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/04-testing-and-tdd/04-autofixture-and-fluentassertions.md) | `Chapter4/Lesson/AutofixtureAndFluentAssertions` | Sinh dữ liệu test ngẫu nhiên tự động, Viết assertion đọc như văn tự nhiên (`Should().Be(...)`) |
| **05** | Unit Testing vs Integration Testing | [05-unit-testing-vs-integration-testing.md](file:///d:/my-project/revision-document/dotnet/csharp-from-zero-to-hero/04-testing-and-tdd/05-unit-testing-vs-integration-testing.md) | `Chapter4/Lesson/Integration-Vs-UnitTesting` | Tháp kiểm thử (Test Pyramid), Test cô lập vs Test tích hợp DB/API, Chi phí & độ tin cậy |

---

## 🎥 Tài Nguyên Video & Slides Chính Thức

- **Lesson 1 (Arrange, Act, Assert; xUnit):** [Slides](https://docs.google.com/presentation/d/10WL9Xs2wHXMJnFw1E_2ycT4LALMvi3GgK50CsMuTO4U/edit?usp=sharing) | [Video](https://youtu.be/OeelG_Z7lM8)
- **Lesson 2 (Mocking and Testability):** [Slides](https://docs.google.com/presentation/d/1mwfRR9vtwnG1UnRUI8pjhwP00mFc0DXeQwnhTrO5yYA/edit?usp=sharing) | [Video](https://youtu.be/APrsvDn7j24)
- **Lesson 3 (TDD in Action):** [Slides](https://docs.google.com/presentation/d/1E9oLbLYKC_3yv5DFDzl9edzRt766D5awPr46Lp6lpKY/edit?usp=sharing) | [Video](https://youtu.be/NMaMjt9S30g)
- **Lesson 4 (Integration vs Unit Tests):** [Slides](https://docs.google.com/presentation/d/18yuCaldVBMAQYqGoRV7btf4lg_sCUJ1uWIv_OrxZ59M/edit?usp=sharing) | [Video](https://youtu.be/iZXw3KLbAmw)
- **Lesson 5 (FluentAssertions & AutoFixture):** [Slides](https://docs.google.com/presentation/d/1nO6DvOY2Mjd3w9NaQFMzG8rEmv8ePtPOiR4VBsDCg7Q/edit?usp=sharing) | [Video](https://youtu.be/b3qMg4pXJVs)
- **Lesson 6 (Other Types of Testing):** [Slides](https://docs.google.com/presentation/d/1ByTOer7jl0kF2mAvdayUuNBtyYJxkYj_q0N0vIYgVJc/edit?usp=sharing) | [Video](https://youtu.be/-3dIhz-eMoo)
