# TypeScript Revision Guide

Lộ trình và kho tài liệu ôn tập TypeScript toàn diện từ cú pháp cơ bản, hệ thống kiểu tĩnh (Static Typing), Type Inference, Object Modeling với `interface` & `type`, Lập trình hướng đối tượng OOP, Generics, Utility Types, Type Gymnastics đến tối ưu cấu hình `tsconfig.json`.

---

## Danh Mục Các Module Học Tập

| Thư mục / Tài liệu | Nội dung trọng tâm | Trạng thái |
| :--- | :--- | :--- |
| **[summary.md](file:///d:/my-project/revision-document/typescript/summary.md)** | **Bảng tóm tắt toàn diện (Master TypeScript Cheat Sheet)** bao quát toàn bộ cú pháp, type operators, utility types và tsconfig | Hoàn thành |
| **[01-types-and-interfaces/](file:///d:/my-project/revision-document/typescript/01-types-and-interfaces/README.md)** | Primitive types, `any` vs `unknown` vs `never`, Tuples & Enums, `type` vs `interface`, Union & Intersection, Type Narrowing | Sẵn sàng |
| **[02-functions-and-classes/](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/README.md)** | Function signatures, Overloads, Classes, Access Modifiers (`public`/`private`/`protected`), Abstract classes, Parameter properties | Sẵn sàng |
| **[03-generics-and-utility-types/](file:///d:/my-project/revision-document/typescript/03-generics-and-utility-types/README.md)** | Generics (`<T>`), Constraints (`extends`), `keyof`, Lookup types `T[K]`, Built-in Utility Types (`Partial`, `Pick`, `Omit`, `Record`, `ReturnType`, ...), Conditional & Mapped Types | Sẵn sàng |
| **[04-advanced-and-configuration/](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/README.md)** | User-defined Type Guards (`is`, `asserts`), `infer`, Template Literal Types, Declaration Files (`.d.ts`), `tsconfig.json` flags | Sẵn sàng |

---

## Chuẩn Cấu Trúc Của Từng Thư Mục Con

Mỗi module trong hệ thống ôn tập bao gồm:
1. `README.md`: Lộ trình chi tiết + **Bản đồ liên kết bài học (Knowledge Links)** + Bẫy phỏng vấn.
2. Các bài học lý thuyết `.md`: Tuân thủ 5 mục chuẩn (Bản đồ liên kết, Bản chất hoạt động, Bẫy kinh điển, Code thực hành, Câu hỏi phỏng vấn tự kiểm tra).
3. Các file demo `.ts`: Code mẫu thực nghiệm chuẩn xác, chạy trực tiếp trên Node.js v22.
4. `practice.ts`: Bộ câu hỏi và thử thách tự động chấm điểm với 100% assertions sử dụng thư viện chuẩn `node:assert`.

---

## Bản Đồ Liên Kết
- **Tiên quyết:** [JavaScript Fundamentals](file:///d:/my-project/revision-document/javascript/01-fundamentals/README.md), [JS Functions & Scope](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/)
- **Tiếp theo:** [React with TypeScript](file:///d:/my-project/revision-document/react/)
