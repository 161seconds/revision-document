# Module 02: Functions & Classes

Chào mừng bạn đến với **Module 02: Functions & Classes**. Module này tập trung vào kiến trúc thực thi logic và mô hình hóa hướng đối tượng (OOP) trong TypeScript, giải quyết các kỹ thuật nâng cao như Function Overloading, Access Modifiers (`public`, `private`, `protected`), ECMAScript Private Fields (`#private`), Parameter Properties, Lớp trừu tượng (Abstract Classes) và các quy chuẩn triển khai Interface đa tầng.

---

## Bản Đồ Học Tập (Learning Roadmap)

| Bài học | Nội dung cốt lõi | Mục tiêu đạt được |
| :--- | :--- | :--- |
| **[01. Function Types & Signatures](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/01-function-types-and-signatures.md)** | Định nghĩa kiểu hàm, Tham số tùy chọn (`?`), Tham số mặc định, Rest Parameters, Function Overloads | Thiết kế API hàm linh hoạt có thể nhận nhiều cấu trúc tham số khác nhau với 100% type safety. |
| **[02. Classes & Access Modifiers](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/02-classes-and-access-modifiers.md)** | `public`, `private`, `protected`, `readonly`, Từ khóa `override`, Đóng gói dữ liệu | Nắm vững ranh giới kế thừa và bảo mật truy cập giữa các tầng kiến trúc. |
| **[03. Abstract Classes & Implements](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/03-abstract-classes-and-implements.md)** | `abstract class`, Phương thức trừu tượng, Triển khai nhiều `interface`, Template Method Pattern | Xây dựng các lớp cơ sở (Base Repository, Base Controller) làm khung xương vững chắc cho dự án. |
| **[04. Parameter Properties & Getters](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/04-parameter-properties-and-getters.md)** | Constructor Shorthand, Getters & Setters, Static members, `#private` (Hard private) vs TS `private` | Giảm thiểu boilerplate code khi tiêm phụ thuộc (Dependency Injection) và bảo vệ trạng thái nội tại. |

---

## File Thực Hành & Kiểm Thử Tự Động

- **File Demo Tổng Hợp**: [classes_demo.ts](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/classes_demo.ts) — Chạy trực tiếp qua Node.js v22.
- **File Tự Luyện & Chấm Điểm**: [practice.ts](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/practice.ts) — Bộ 5 bài tập OOP và Function signatures kèm assertions tự động chấm qua `node:assert`.

---

## 3 Bẫy Phỏng Vấn Kinh Điển Cần Nhớ

1. **TypeScript `private` không bảo mật ở Runtime**: Từ khóa `private` của TypeScript chỉ được kiểm tra ở bước biên dịch; khi compile ra JavaScript, nó trở thành thuộc tính public thông thường. Muốn thực sự riêng tư ở runtime, phải dùng cú pháp ECMAScript `#privateField`.
2. **Function Overload phải có implementation signature tương thích**: Các chữ ký overload (`declare function f(...)`) chỉ là định nghĩa kiểu; hàm thực thi (implementation) bên dưới phải nhận một union type bao hàm được tất cả các overload signature và không xuất hiện trực tiếp trong IntelliSense của người gọi.
3. **Parameter Properties bỏ quên `super()`**: Khi kế thừa lớp cha có constructor nhận tham số, lớp con sử dụng parameter properties bắt buộc phải gọi `super(...)` trước khi truy cập bất kỳ thuộc tính nào của `this`.
