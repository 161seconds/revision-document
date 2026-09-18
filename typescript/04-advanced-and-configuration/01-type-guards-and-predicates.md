# 01. Type Guards & Predicates

Xây dựng bộ kiểm tra kiểu tự định nghĩa (User-Defined Type Guards), hàm xác thực bắt buộc (Assertion Functions) và kỹ thuật kiểm tra cạn kiệt với `never`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Union, Intersection & Narrowing](file:///d:/my-project/revision-document/typescript/01-types-and-interfaces/04-union-intersection-and-narrowing.md)
- **Tiếp theo:** [tsconfig & Compiler Architecture](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/02-tsconfig-and-compiler-architecture.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Type Predicates (`parameterName is Type`)
Khi các cơ chế built-in (`typeof`, `instanceof`) không đủ để nhận diện các interface hoặc object phức tạp, ta định nghĩa một hàm kiểm tra trả về một **Type Predicate**:
```typescript
interface AdminUser {
    id: string;
    role: "admin";
    permissions: string[];
}

// Type Predicate: user is AdminUser
function isAdmin(user: unknown): user is AdminUser {
    return (
        typeof user === "object" &&
        user !== null &&
        "role" in user &&
        (user as any).role === "admin" &&
        Array.isArray((user as any).permissions)
    );
}

function handleAccess(user: unknown) {
    if (isAdmin(user)) {
        // TypeScript tự động thu hẹp kiểu user thành AdminUser!
        console.log(user.permissions.join(", "));
    }
}
```

### 2.2 Assertion Functions (`asserts condition`) (TS 3.7+)
Assertion functions là các hàm sẽ ném ra lỗi ngoại lệ (throw Exception) nếu một điều kiện không được thỏa mãn. Nếu hàm chạy qua bình thường mà không ném lỗi, TypeScript sẽ thu hẹp kiểu cho phần code tiếp theo:

```typescript
function assertIsDefined<T>(val: T, message: string): asserts val is NonNullable<T> {
    if (val === null || val === undefined) {
        throw new Error(message);
    }
}

function processPayload(payload: string | null) {
    assertIsDefined(payload, "Payload must not be null");
    // Từ dòng này trở xuống, payload chắc chắn là string!
    console.log(payload.toUpperCase());
}
```

### 2.3 Exhaustiveness Checking với `never`
Khi xử lý Union, nếu tất cả các trường hợp đã được kiểm tra đầy đủ, biến còn lại ở nhánh `default` sẽ có kiểu `never`. Nếu có ai đó thêm một thành viên mới vào Union mà quên xử lý ở `switch`, TypeScript sẽ báo lỗi biên dịch ngay lập tức:

```typescript
type Action = { type: "LOGIN" } | { type: "LOGOUT" } | { type: "REFRESH" };

function handleAction(act: Action) {
    switch (act.type) {
        case "LOGIN": return "Logging in";
        case "LOGOUT": return "Logging out";
        case "REFRESH": return "Refreshing";
        default: {
            const _exhaustive: never = act;
            throw new Error(`Unhandled action: ${_exhaustive}`);
        }
    }
}
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Type Guard trả về `true` giả dối
TypeScript không thể kiểm tra tính đúng đắn bên trong thân hàm Type Guard; nó phụ thuộc 100% vào lập trình viên:
```typescript
function isNumber(x: any): x is number {
    return true; // ❌ Nói dối compiler!
}
const val: any = "text";
if (isNumber(val)) {
    val.toFixed(2); // Sập runtime: val.toFixed is not a function
}
```
**Quy tắc:** Thân hàm Type Guard phải kiểm tra chặt chẽ mọi điều kiện runtime trước khi `return true`.

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern: Custom Type Guard kiểm tra mảng chuỗi
export function isStringArray(val: unknown): val is string[] {
    return Array.isArray(val) && val.every(item => typeof item === "string");
}

// Pattern: Type Guard kiểm tra Error instance chuẩn
export function isAppError(err: unknown): err is { code: number; message: string } {
    return (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        "message" in err &&
        typeof (err as any).code === "number" &&
        typeof (err as any).message === "string"
    );
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Cú pháp `val is Type` khác gì so với kiểu trả về `boolean` thông thường?
   - *Trả lời:* Một hàm trả về `boolean` chỉ cung cấp một giá trị `true` hoặc `false` ở runtime; trình biên dịch TypeScript không học được gì thêm về kiểu của biến sau khối `if`. Ngược lại, cú pháp `val is Type` kích hoạt cơ chế Type Narrowing của trình biên dịch: nếu hàm trả về `true`, trong phạm vi của khối `if` đó, biến `val` sẽ được ép sang kiểu `Type` một cách an toàn mà không cần toán tử ép kiểu `as`.

2. **Câu hỏi:** Assertion Signature `asserts val is NonNullable<T>` hoạt động như thế nào trong luồng điều khiển của TypeScript?
   - *Trả lời:* TypeScript sử dụng phân tích luồng điều khiển (Control Flow Analysis). Khi gặp một hàm có chữ ký `asserts val is ...`, compiler hiểu rằng nếu hàm này không ném ra exception mà tiếp tục chạy qua, thì điều kiện assertion đã đúng. Từ dòng lệnh đó trở đi trong cùng scope, biến `val` sẽ được loại bỏ `null` và `undefined` mà không cần phải viết khối `if-else`.
