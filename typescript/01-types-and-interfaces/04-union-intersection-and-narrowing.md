# 04. Union, Intersection & Narrowing

Kỹ thuật kết hợp kiểu dữ liệu và các phương pháp thu hẹp kiểu (Type Narrowing) an toàn tuyệt đối trong TypeScript.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Type Aliases & Interfaces](file:///d:/my-project/revision-document/typescript/01-types-and-interfaces/03-type-aliases-and-interfaces.md)
- **Tiếp theo:** [Module 02: Functions & Classes](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/README.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Hợp Kiểu (Union: `|`)
Union thể hiện giá trị có thể là một trong nhiều kiểu: `A | B`.
- Khi chưa kiểm tra kiểu, TypeScript **chỉ cho phép truy cập các thuộc tính chung (Intersection of properties)** mà cả `A` và `B` đều sở hữu.
- Để sử dụng các thuộc tính riêng, lập trình viên bắt buộc phải thực hiện **Type Narrowing**.

### 2.2 Giao Kiểu (Intersection: `&`)
Intersection kết hợp nhiều kiểu lại với nhau: `A & B`.
- Đối tượng kết quả phải thỏa mãn đồng thời tất cả các thuộc tính của cả `A` và `B`.
- Thường dùng để gộp các cấu trúc đặc tính (Mixins, Base Metadata).

### 2.3 Các Cơ Chế Thu Hẹp Kiểu (Type Narrowing)

1. **`typeof` Type Guard:** Thu hẹp các kiểu nguyên thủy (`"string"`, `"number"`, `"boolean"`, `"symbol"`, `"bigint"`, `"undefined"`, `"object"`, `"function"`).
2. **`instanceof` Type Guard:** Kiểm tra đối tượng có được khởi tạo từ một Class / Constructor Function hay không:
   ```typescript
   if (err instanceof TypeError) { ... }
   ```
3. **Toán tử `in`:** Kiểm tra sự tồn tại của một key trong đối tượng:
   ```typescript
   if ("swim" in pet) { pet.swim(); }
   ```
4. **Kiểm tra đẳng thức (Equality Narrowing):** Dùng `===`, `!==`, `==`, `!=`:
   ```typescript
   function example(x: string | number, y: string | boolean) {
       if (x === y) {
           // x và y chắc chắn là string!
           x.toUpperCase();
       }
   }
   ```
5. **Discriminated Unions (Tagged Unions):** Kỹ thuật mạnh mẽ nhất trong thiết kế dữ liệu. Mỗi interface thành viên có một thuộc tính chung cố định (thường là `type`, `kind`, hoặc `status`) chứa **Literal Type**. Trình biên dịch sẽ dựa vào thuộc tính tag này để tự động thu hẹp toàn bộ đối tượng.

```
       ┌─────────────────────────────────────────────────┐
       │             type Result<T> =                    │
       │     Success { status: "success", data: T }      │
       │                        |                        │
       │     Failure { status: "failure", error: string }│
       └────────────────────────┬────────────────────────┘
                                │
                    switch (result.status)
                                │
             ┌──────────────────┴──────────────────┐
             ▼                                     ▼
     case "success":                       case "failure":
   TS hiểu là Success                    TS hiểu là Failure
  (Truy cập được data)                  (Truy cập được error)
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: `typeof null === "object"` trong JavaScript
Khi dùng `typeof val === "object"` để thu hẹp kiểu cho đối tượng có thể là `null`, TypeScript sẽ cảnh báo hoặc bạn sẽ gặp lỗi runtime nếu truy cập thuộc tính mà không loại trừ `null`:
```typescript
function printLength(val: { length: number } | null) {
    if (typeof val === "object") {
        // ❌ NGUY HIỂM: val vẫn có thể là null!
        // console.log(val.length); // Sập runtime nếu val === null!
    }
    //  ĐÚNG:
    if (typeof val === "object" && val !== null) {
        console.log(val.length);
    }
}
```

### Bẫy 2: Union không có discriminator gây khó kiểm tra
Nếu định nghĩa 2 kiểu có cấu trúc giống hệt nhau hoặc không có trường phân biệt tường minh, việc thu hẹp kiểu bằng `in` sẽ rất dễ sai sót khi cập nhật schema.
Luôn chủ động thêm một trường phân biệt (Discriminator) như `type: "A"` và `type: "B"`.

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern: Xây dựng kiểu Result Monad chuẩn doanh nghiệp
export type Result<T, E = Error> =
    | { success: true; value: T }
    | { success: false; error: E };

export function ok<T>(value: T): Result<T, never> {
    return { success: true, value };
}

export function err<E>(error: E): Result<never, E> {
    return { success: false, error };
}

// Hàm tiêu thụ an toàn tuyệt đối
export function handleResult(res: Result<number, string>): string {
    if (res.success) {
        return `Value: ${res.value.toFixed(2)}`;
    } else {
        return `Error occurred: ${res.error.toUpperCase()}`;
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Discriminated Union là gì? Điều kiện cần và đủ để TypeScript thực hiện Discriminated Union Narrowing?
   - *Trả lời:* Discriminated Union (hay Tagged Union) là một tập hợp Union gồm các kiểu đối tượng, trong đó mỗi kiểu đều chia sẻ một trường thuộc tính chung có giá trị là Literal Type (ví dụ string literal, boolean literal, hoặc number literal). Điều kiện: (1) Các kiểu thành viên phải có cùng một tên thuộc tính phân biệt (discriminant property), (2) Kiểu của thuộc tính đó ở mỗi thành viên phải là các literal độc lập không trùng lặp, (3) Lập trình viên kiểm tra giá trị của thuộc tính phân biệt qua `if` hoặc `switch-case`.

2. **Câu hỏi:** Phép toán Intersection `type C = A & B` hoạt động thế nào nếu cả `A` và `B` có cùng một thuộc tính `id` nhưng `A.id` là `string` còn `B.id` là `number`?
   - *Trả lời:* Thuộc tính `id` của `C` sẽ có kiểu là `string & number`. Vì không có bất kỳ giá trị nào trong JavaScript vừa là chuỗi vừa là số, nên kiểu của `id` sẽ suy biến thành `never`. Nếu khởi tạo đối tượng cho kiểu `C`, bạn sẽ không thể gán bất kỳ giá trị nào cho thuộc tính `id`.
