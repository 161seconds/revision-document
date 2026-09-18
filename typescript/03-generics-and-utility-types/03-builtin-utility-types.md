# 03. Built-in Utility Types

Phân tích cấu trúc nội tại và cách ứng dụng của các Utility Types tích hợp sẵn trong thư viện chuẩn của TypeScript.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Generic Constraints & Keyof](file:///d:/my-project/revision-document/typescript/03-generics-and-utility-types/02-generic-constraints-and-keyof.md)
- **Tiếp theo:** [Conditional & Mapped Types](file:///d:/my-project/revision-document/typescript/03-generics-and-utility-types/04-conditional-and-mapped-types.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

Dưới đây là mã nguồn định nghĩa thực tế của các Utility Types trong file `lib.es5.d.ts` của trình biên dịch TypeScript:

### 2.1 Nhóm Thao Tác Trên Object
1. **`Partial<T>`**: Biến mọi thuộc tính thành tùy chọn (`?`):
   ```typescript
   type Partial<T> = {
       [P in keyof T]?: T[P];
   };
   ```
2. **`Required<T>`**: Loại bỏ dấu `?`, biến mọi thuộc tính thành bắt buộc:
   ```typescript
   type Required<T> = {
       [P in keyof T]-?: T[P];
   };
   ```
3. **`Readonly<T>`**: Gắn thêm cờ `readonly` vào mọi thuộc tính:
   ```typescript
   type Readonly<T> = {
       readonly [P in keyof T]: T[P];
   };
   ```
4. **`Record<K, T>`**: Tạo đối tượng với keys thuộc tập `K` và value là `T`:
   ```typescript
   type Record<K extends keyof any, T> = {
       [P in K]: T;
   };
   ```
5. **`Pick<T, K>`**: Chọn ra một tập con các thuộc tính:
   ```typescript
   type Pick<T, K extends keyof T> = {
       [P in K]: T[P];
   };
   ```
6. **`Omit<T, K>`**: Loại trừ các thuộc tính `K` ra khỏi `T`:
   ```typescript
   type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
   ```

### 2.2 Nhóm Thao Tác Trên Union
1. **`Exclude<T, U>`**: Loại bỏ khỏi union `T` những kiểu gán được cho `U`:
   ```typescript
   type Exclude<T, U> = T extends U ? never : T;
   // Ví dụ: Exclude<"a" | "b" | "c", "a"> -> "b" | "c"
   ```
2. **`Extract<T, U>`**: Trích xuất từ union `T` những kiểu gán được cho `U`:
   ```typescript
   type Extract<T, U> = T extends U ? T : never;
   // Ví dụ: Extract<string | number | boolean, number> -> number
   ```
3. **`NonNullable<T>`**: Loại bỏ `null` và `undefined` khỏi `T`:
   ```typescript
   type NonNullable<T> = T & {}; // hoặc T extends null | undefined ? never : T
   ```

### 2.3 Nhóm Thao Tác Trên Function & Promise
1. **`ReturnType<T>`**: Lấy kiểu giá trị trả về của hàm:
   ```typescript
   type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
   ```
2. **`Parameters<T>`**: Lấy tuple các tham số của hàm:
   ```typescript
   type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
   ```
3. **`Awaited<T>`**: Mở gói Promise đệ quy:
   ```typescript
   type P = Promise<Promise<string>>;
   type Unwrapped = Awaited<P>; // string
   ```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: `Partial<T>` và `Readonly<T>` chỉ nông (Shallow)
Cả `Partial` và `Readonly` đều không áp dụng đệ quy cho các object con bên trong:
```typescript
interface Company {
    name: string;
    details: { address: string; established: number };
}
type ReadonlyCompany = Readonly<Company>;
const c: ReadonlyCompany = { name: "Acme", details: { address: "HN", established: 2020 } };
// c.name = "New"; // ❌ Bị chặn
c.details.address = "HCM"; //  VẪN SỬA ĐƯỢC vì details chỉ là readonly reference!
```
**Khắc phục:** Tự xây dựng kiểu đệ quy `DeepReadonly<T>` bằng Conditional & Mapped Types.

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern: Dùng Pick và Omit để tái cấu trúc Data Transfer Object (DTO)
export interface DatabaseUser {
    id: string;
    email: string;
    passwordHash: string;
    role: "admin" | "user";
    createdAt: Date;
}

// Client API không bao giờ được phép thấy passwordHash
export type SafeUserDTO = Omit<DatabaseUser, "passwordHash">;

// Payload khi tạo người dùng mới (chưa có id và createdAt)
export type CreateUserDTO = Pick<DatabaseUser, "email"> & { rawPassword: string };

// Payload cập nhật người dùng (cho phép cập nhật một phần)
export type UpdateUserDTO = Partial<Pick<DatabaseUser, "email" | "role">>;
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Phân biệt cơ chế hoạt động của `Exclude<T, U>` và `Omit<T, K>`?
   - *Trả lời:* `Exclude` thao tác trên **Union Types**; nó sử dụng Distributive Conditional Type để lọc bỏ các thành viên của union khớp với `U`. Ngược lại, `Omit` thao tác trên **Object Types**; nó nhận một đối tượng `T` và danh sách keys `K`, sau đó dùng `Pick` kết hợp với `Exclude<keyof T, K>` để loại bỏ các trường đó ra khỏi hình dạng của đối tượng.

2. **Câu hỏi:** Làm thế nào để trích xuất kiểu dữ liệu của một phần tử trong mảng sử dụng Utility Types hoặc Indexed Access?
   - *Trả lời:* Có thể dùng Indexed Access Type với index kiểu `number`: `type ElementType = MyArray[number];`. Nếu là Tuple: `type First = MyTuple[0];`.
