# Module 03: Generics & Utility Types

Chào mừng bạn đến với **Module 03: Generics & Utility Types**. Generics là trái tim tạo nên sức mạnh tái sử dụng và trừu tượng hóa kiểu dữ liệu linh hoạt nhất trong TypeScript mà vẫn bảo toàn 100% Type Safety. Module này sẽ đi sâu từ khai báo tham số kiểu (`<T>`), áp đặt ràng buộc (`extends`), truy vấn thuộc tính (`keyof`, `T[K]`), khám phá toàn diện kho Utility Types chuẩn (`Partial`, `Required`, `Readonly`, `Record`, `Pick`, `Omit`, `Exclude`, `Extract`, `ReturnType`), đến các kỹ thuật biến đổi kiểu động (Conditional Types & Mapped Types).

---

## Bản Đồ Học Tập (Learning Roadmap)

| Bài học | Nội dung cốt lõi | Mục tiêu đạt được |
| :--- | :--- | :--- |
| **[01. Generic Functions & Classes](file:///d:/my-project/revision-document/typescript/03-generics-and-utility-types/01-generic-functions-and-classes.md)** | Cú pháp `<T>`, Generic Functions, Generic Interfaces, Generic Classes, Type Argument Inference | Xây dựng các cấu trúc dữ liệu tổng quát (Stack, Queue, LinkedList, Cache) dùng chung cho mọi kiểu. |
| **[02. Generic Constraints & Keyof](file:///d:/my-project/revision-document/typescript/03-generics-and-utility-types/02-generic-constraints-and-keyof.md)** | Ràng buộc `T extends Interface`, Toán tử `keyof`, Indexed Access Types (`T[K]`), Nhiều tham số kiểu | Viết hàm truy xuất thuộc tính an toàn tuyệt đối chống lỗi chính tả tên trường (Property Typos). |
| **[03. Built-in Utility Types](file:///d:/my-project/revision-document/typescript/03-generics-and-utility-types/03-builtin-utility-types.md)** | `Partial`, `Required`, `Readonly`, `Record`, `Pick`, `Omit`, `Exclude`, `Extract`, `ReturnType`, `Awaited` | Nắm vững mã nguồn nội tại và sử dụng thành thạo các tiện ích biến đổi kiểu phổ biến nhất. |
| **[04. Conditional & Mapped Types](file:///d:/my-project/revision-document/typescript/04-conditional-and-mapped-types.md)** | `T extends U ? X : Y`, Từ khóa `infer`, Mapped Types `[P in keyof T]`, Modifiers (`+readonly`, `-?`), Template Literal Types | Tự xây dựng các tiện ích kiểu phức tạp (DeepReadonly, DeepPartial, EventName mapping). |

---

## File Thực Hành & Kiểm Thử Tự Động

- **File Demo Tổng Hợp**: [generics_demo.ts](file:///d:/my-project/revision-document/typescript/03-generics-and-utility-types/generics_demo.ts) — Chạy trực tiếp qua Node.js v22.
- **File Tự Luyện & Chấm Điểm**: [practice.ts](file:///d:/my-project/revision-document/typescript/03-generics-and-utility-types/practice.ts) — Bộ 5 bài tập Generics & Utility Types kèm assertions tự động chấm qua `node:assert`.

---

## 3 Bẫy Phỏng Vấn Kinh Điển Cần Nhớ

1. **`keyof any` là gì?**: `keyof any` tương đương với `string | number | symbol`, vì đây là 3 kiểu dữ liệu hợp lệ duy nhất có thể làm key của object trong JavaScript.
2. **Phân biệt `Exclude<T, U>` vs `Omit<T, K>`**: `Exclude` hoạt động trên **Union Types** để loại bỏ các phần tử union. `Omit` hoạt động trên **Object Types** để loại bỏ các thuộc tính (keys) ra khỏi hình dạng object.
3. **Distributive Conditional Types**: Khi áp dụng Conditional Type lên một naked type parameter `T`, nếu `T` là một Union, biểu thức sẽ tự động phân phối (distribute) qua từng thành viên: `(A | B) extends U ? X : Y` tương đương `(A extends U ? X : Y) | (B extends U ? X : Y)`. Để tắt tính năng phân phối này, ta bọc kiểu trong ngoặc vuông `[T] extends [U]`.
