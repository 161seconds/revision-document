# 04. Conditional & Mapped Types

Kỹ thuật biến đổi kiểu dữ liệu động cao cấp: Biểu thức điều kiện kiểu, khai báo biến kiểu động với `infer`, Mapped Types và Template Literal Types.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Built-in Utility Types](file:///d:/my-project/revision-document/typescript/03-generics-and-utility-types/03-builtin-utility-types.md)
- **Tiếp theo:** [Module 04: Advanced & Configuration](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/README.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Conditional Types (`T extends U ? X : Y`)
Conditional Types hoạt động tương tự như toán tử 3 ngôi (Ternary Operator) nhưng diễn ra hoàn toàn ở **Cấp độ Kiểu lúc biên dịch**:
```typescript
type IsString<T> = T extends string ? "YES" : "NO";

type T1 = IsString<"hello">; // "YES"
type T2 = IsString<123>;     // "NO"
```

### 2.2 Từ Khóa `infer` (Type Inference in Conditional Types)
Từ khóa `infer` cho phép bạn **khai báo một biến kiểu tạm thời** để TypeScript tự động "trích xuất" kiểu thành phần nằm sâu bên trong một cấu trúc phức tạp:

```typescript
// Trích xuất kiểu phần tử của mảng
type Flatten<T> = T extends Array<infer ItemType> ? ItemType : T;

type A = Flatten<string[]>; // string
type B = Flatten<number>;   // number

// Trích xuất kiểu resolved của một Promise
type UnboxPromise<T> = T extends Promise<infer Res> ? Res : T;
type ResType = UnboxPromise<Promise<{ id: number }>>; // { id: number }
```

### 2.3 Mapped Types (`[P in Keys]: Value`)
Mapped Types cho phép lặp qua danh sách keys (thường là `keyof T`) để tạo ra một cấu trúc đối tượng mới.
- **Mapping Modifiers:**
  - `-readonly`: Bỏ cờ readonly.
  - `+readonly`: Thêm cờ readonly.
  - `-?`: Bỏ tùy chọn (biến thành bắt buộc).
  - `+?`: Thêm tùy chọn.
- **Key Remapping qua `as` (TS 4.1+):**
  ```typescript
  type Getters<T> = {
      [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
  };

  interface Person { name: string; age: number; }
  type PersonGetters = Getters<Person>;
  // Kết quả: { getName: () => string; getAge: () => number; }
  ```

### 2.4 Template Literal Types
Ghép nối các chuỗi kiểu dữ liệu tương tự như Template String trong JavaScript:
```typescript
type Protocol = "http" | "https";
type Domain = "com" | "org";
type WebUrl = `${Protocol}://api.my-app.${Domain}`;
// "http://api.my-app.com" | "http://api.my-app.org" | "https://api.my-app.com" | "https://api.my-app.org"
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Phân phối Union ngoài ý muốn (Distributive Law)
Khi `T` trong `T extends any` là một Naked Type Parameter, nếu `T` là Union `string | number`, biểu thức sẽ bị phân tách thành:
`(string extends any ? ...) | (number extends any ? ...)`.
Nếu bạn muốn so sánh **toàn bộ Union như một thực thể duy nhất**, hãy bọc trong cặp ngoặc vuông `[T] extends [any]`:
```typescript
type IsNever<T> = [T] extends [never] ? true : false;
// Nếu không dùng [T], IsNever<never> sẽ trả về never thay vì true!
```

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern: Xây dựng DeepReadonly đệ quy hoàn chỉnh
export type DeepReadonly<T> = T extends (infer R)[]
    ? ReadonlyArray<DeepReadonly<R>>
    : T extends Function
    ? T
    : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

interface ComplexConfig {
    version: number;
    database: {
        host: string;
        ports: number[];
    };
}

type LockedConfig = DeepReadonly<ComplexConfig>;
// Mọi cấp độ bên trong database và mảng ports đều bị khóa readonly hoàn toàn
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Từ khóa `infer` trong TypeScript được dùng ở đâu và giải quyết bài toán gì?
   - *Trả lời:* Từ khóa `infer` chỉ có thể được sử dụng bên trong mệnh đề `extends` của một Conditional Type (`T extends (infer U) ? ...`). Nó giải quyết bài toán trích xuất kiểu dữ liệu nội tại (unwrapping) mà không cần lập trình viên phải biết trước kiểu đó là gì, ví dụ: trích xuất kiểu trả về của hàm (`ReturnType`), kiểu tham số (`Parameters`), hoặc kiểu giá trị bên trong `Promise` (`Awaited`).

2. **Câu hỏi:** Key Remapping trong Mapped Types là gì? Cho một trường hợp ứng dụng thực tế?
   - *Trả lời:* Key Remapping cho phép đổi tên hoặc lọc các keys trong quá trình lặp của Mapped Type bằng cú pháp `[K in keyof T as NewKey]`. Ứng dụng thực tế: Tự động sinh danh sách các hàm Getter (`getName`, `getAge`) từ một interface dữ liệu, hoặc lọc bỏ các thuộc tính không phải kiểu hàm bằng cách gán `as T[K] extends Function ? K : never`.
