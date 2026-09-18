# Module 01: Types & Interfaces

Chào mừng bạn đến với **Module 01: Types & Interfaces**. Module này cung cấp nền tảng vững chắc nhất về hệ thống kiểu tĩnh (Static Type System) trong TypeScript, giải thích bản chất đằng sau các kiểu nguyên thủy, các kiểu đặc biệt (`any`, `unknown`, `never`, `void`), cách tổ chức dữ liệu mảng, Tuple, Enum, đối chiếu chuyên sâu giữa `type` và `interface`, cũng như các kỹ thuật Type Narrowing để xử lý Union & Intersection an toàn.

---

## Bản Đồ Học Tập (Learning Roadmap)

| Bài học | Nội dung cốt lõi | Mục tiêu đạt được |
| :--- | :--- | :--- |
| **[01. Primitive & Special Types](file:///d:/my-project/revision-document/typescript/01-types-and-interfaces/01-primitive-and-special-types.md)** | `number`, `string`, `boolean`, `bigint`, `symbol`, `null`, `undefined`, `any`, `unknown`, `never`, `void`, Type Assertion (`as`) | Hiểu sự khác biệt sinh tử giữa `any` vs `unknown`, cơ chế Exhaustiveness Checking với `never`. |
| **[02. Arrays, Tuples & Enums](file:///d:/my-project/revision-document/typescript/02-arrays-tuples-and-enums.md)** | `T[]`, `Array<T>`, `readonly` arrays, Fixed Tuples, Named Tuples, Numeric Enums, String Enums, `const enum` | Nắm vững cách bất biến hóa mảng với `as const`, tránh bẫy Reverse Mapping của numeric enum. |
| **[03. Type Aliases & Interfaces](file:///d:/my-project/revision-document/typescript/03-type-aliases-and-interfaces.md)** | `type` vs `interface`, Declaration Merging, Kế thừa `extends` vs Giao nhau `&`, Index Signatures | Phân biệt chính xác khi nào dùng `type` và khi nào dùng `interface` trong các dự án thực tế. |
| **[04. Union, Intersection & Narrowing](file:///d:/my-project/revision-document/typescript/04-union-intersection-and-narrowing.md)** | Union `\|`, Intersection `&`, Type Guards (`typeof`, `in`, `instanceof`), Discriminated Unions (Tagged Unions) | Thiết kế kiến trúc dữ liệu State Management với Discriminated Unions chống lỗi null/undefined. |

---

## File Thực Hành & Kiểm Thử Tự Động

- **File Demo Tổng Hợp**: [types_demo.ts](file:///d:/my-project/revision-document/typescript/01-types-and-interfaces/types_demo.ts) — Minh họa toàn bộ các khái niệm với log chi tiết.
- **File Tự Luyện & Chấm Điểm**: [practice.ts](file:///d:/my-project/revision-document/typescript/01-types-and-interfaces/practice.ts) — Bộ 5 bài tập lập trình kiểu mẫu với assertions tự động chấm qua `node:assert`.

---

## 3 Bẫy Phỏng Vấn Kinh Điển Cần Nhớ

1. **`unknown` vs `any`**: Cả hai đều chấp nhận mọi giá trị, nhưng `any` vô hiệu hóa hoàn toàn trình kiểm tra kiểu, cho phép gọi hàm hoặc thuộc tính không tồn tại gây sập runtime. Ngược lại, `unknown` buộc lập trình viên phải thu hẹp kiểu (Type Narrowing) bằng `typeof` hoặc type guard trước khi thực hiện thao tác.
2. **Declaration Merging chỉ có ở `interface`**: Nếu bạn khai báo 2 `interface` có cùng tên trong cùng scope, TypeScript sẽ gộp tất cả các thuộc tính của chúng lại làm một. `type` sẽ báo lỗi cú pháp `Duplicate identifier`.
3. **Mảng bị mất thông tin Tuple nếu không có `as const`**: `const coords = [10, 20]` sẽ được suy luận là `number[]` thay vì tuple `[number, number]`. Hãy sử dụng `as const` để bảo toàn kiểu tuple và tính bất biến.
