# 03. Type Aliases & Interfaces

So sánh chuyên sâu hai cơ chế định hình cấu trúc dữ liệu chủ lực trong TypeScript: `type` (Type Alias) và `interface`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Primitive & Special Types](file:///d:/my-project/revision-document/typescript/01-types-and-interfaces/01-primitive-and-special-types.md)
- **Tiếp theo:** [Union, Intersection & Narrowing](file:///d:/my-project/revision-document/typescript/01-types-and-interfaces/04-union-intersection-and-narrowing.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Bản Chất Của `type` (Type Alias)
`type` tạo ra một **bí danh (alias)** cho bất kỳ cấu trúc kiểu nào: Primitives, Unions, Intersections, Tuples, Mapped Types, hay Functions.
- `type` không tạo ra một kiểu mới độc lập; nó chỉ đặt tên cho một cấu trúc (Structural Typing).
- Không thể khai báo lại để gộp (không có declaration merging).

```typescript
type UserId = string | number;
type Callback = (data: string) => void;
type Point = { x: number; y: number };
```

### 2.2 Bản Chất Của `interface`
`interface` dùng để định nghĩa **hợp đồng cấu trúc đối tượng (Object Shape Contract)**.
- Được thiết kế tối ưu cho lập trình hướng đối tượng và kiến trúc module mở rộng.
- Hỗ trợ **Declaration Merging**: Nếu nhiều `interface` cùng tên được khai báo trong cùng namespace/scope, TypeScript sẽ tự động hợp nhất tất cả các trường dữ liệu của chúng.
- Hỗ trợ kế thừa trực tiếp bằng từ khóa `extends`.

```typescript
interface User {
    id: string;
    name: string;
}

// Declaration Merging
interface User {
    role: "admin" | "member";
}

// Đối tượng phải thỏa mãn cả 3 trường: id, name, role
const u: User = { id: "1", name: "An", role: "admin" };
```

### 2.3 Bảng So Sánh Chi Tiết

| Đặc tính | `type` Alias | `interface` |
| :--- | :--- | :--- |
| **Mô tả Object / Functions** |  Có |  Có |
| **Mô tả Primitive, Union, Tuple** |  Hỗ trợ trực tiếp (`type ID = string \| number`) | ❌ Không hỗ trợ |
| **Kế thừa / Mở rộng** | Dùng Intersection: `type B = A & { extra: string }` | Dùng `extends`: `interface B extends A { extra: string }` |
| **Declaration Merging** | ❌ Báo lỗi biên dịch trùng lặp |  Tự động gộp các thuộc tính |
| **Hiệu năng biên dịch (Compiler Cache)** | Chậm hơn đôi chút với cấu trúc `&` phức tạp | Nhanh hơn do TS lưu cache shape theo tên interface |
| **Computed Properties (`[key in ...]`)** |  Hỗ trợ trong Mapped Types | ❌ Không hỗ trợ trực tiếp |

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Xung đột kiểu khi mở rộng (Intersection vs Extends)
Khi mở rộng thuộc tính có cùng tên nhưng khác kiểu:
- `interface extends` sẽ **báo lỗi biên dịch ngay lập tức**:
  ```typescript
  interface Parent { val: string; }
  // ❌ Lỗi: Interface 'Child' incorrectly extends interface 'Parent'. Types of property 'val' are incompatible.
  // interface Child extends Parent { val: number; }
  ```
- `type &` (Intersection) sẽ không báo lỗi ngay, mà hợp nhất thành kiểu `string & number` (tương đương `never`):
  ```typescript
  type Parent = { val: string };
  type Child = Parent & { val: number }; // val trở thành kiểu 'never'!
  // const c: Child = { val: 123 }; // ❌ Lỗi: Type 'number' is not assignable to type 'never'
  ```

### Bẫy 2: Index Signatures quá rộng làm mất type-safety
```typescript
interface Dictionary {
    [key: string]: number;
    // name: string; // ❌ Lỗi: Property 'name' of type 'string' is not assignable to 'string' index type 'number'
}
```
**Khắc phục:** Dùng `Record<string, number>` hoặc chia tách dữ liệu có cấu trúc riêng biệt.

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern 1: Dùng Interface cho Public API và Data Model
export interface PaginationParams {
    page: number;
    pageSize: number;
    sortBy?: string;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    pagination: PaginationParams;
}

// Pattern 2: Dùng Type Alias cho State Machine & Event Handling
export type UIAction =
    | { type: "FETCH_START" }
    | { type: "FETCH_SUCCESS"; payload: string[] }
    | { type: "FETCH_FAILURE"; error: string };

export type Reducer = (state: { loading: boolean; data: string[] }, action: UIAction) => typeof state;
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Declaration Merging là gì? Cho ví dụ thực tế khi nào kỹ thuật này hữu ích?
   - *Trả lời:* Declaration Merging là cơ chế TypeScript tự động gộp các khai báo `interface` cùng tên trong cùng phạm vi thành một interface duy nhất chứa tất cả các thuộc tính. Ví dụ thực tế: Mở rộng kiểu dữ liệu toàn cục (Augmenting global types), ví dụ thêm thuộc tính người dùng `user` vào `Request` của Express.js:
     ```typescript
     declare global {
         namespace Express {
             interface Request {
                 currentUser?: { id: string; role: string };
             }
         }
     }
     ```

2. **Câu hỏi:** Khi nào nên dùng `type` và khi nào nên dùng `interface`?
   - *Trả lời:* Dùng `interface` khi định nghĩa hình dạng đối tượng dữ liệu (data models, API entities), hoặc hợp đồng cho các Class (`implements`), và khi phát triển thư viện để người dùng có thể mở rộng thông qua Declaration Merging. Dùng `type` khi cần Union types (`string | number`), Tuples, Primitive aliases, hoặc các phép toán biến đổi kiểu nâng cao (Mapped Types, Conditional Types).
