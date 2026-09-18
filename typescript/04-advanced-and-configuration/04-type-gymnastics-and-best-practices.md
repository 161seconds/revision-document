# 04. Type Gymnastics & Best Practices

Kỹ thuật lập trình kiểu nâng cao (Type Gymnastics), Branded Types (Nominal Typing) và các thực hành tốt nhất cho dự án lớn.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Declaration Files & Ambient Types](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/03-declaration-files-and-ambient.md)
- **Tiếp theo:** [React Revision Guide](file:///d:/my-project/revision-document/react/README.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Primitive Obsession & Kỹ Thuật Branded Types (Nominal Typing)
Mặc định, TypeScript sử dụng **Structural Typing**: Hai kiểu có cùng hình dạng sẽ được coi là hoàn toàn tương đương:
```typescript
type UserId = string;
type OrderId = string;

function cancelOrder(orderId: OrderId) { ... }

const user: UserId = "usr_123";
cancelOrder(user); //  HOÀN TOÀN HỢP LỆ trong TypeScript! (Nhưng là thảm họa logic nghiệp vụ!)
```

Để giải quyết vấn đề này, ta tạo ra **Branded Type** (hay Opaque Type) bằng cách gắn thêm một dấu ấn kiểu (brand token) vô hình với runtime:
```typescript
declare const brand: unique symbol;

type Brand<T, B> = T & { readonly [brand]: B };

export type UserId = Brand<string, "UserId">;
export type OrderId = Brand<string, "OrderId">;

// Constructor helper với Type Casting có kiểm soát
export function createUserId(id: string): UserId {
    return id as UserId;
}
export function createOrderId(id: string): OrderId {
    return id as OrderId;
}

const u = createUserId("u_1");
const o = createOrderId("o_100");

// cancelOrder(u); // ❌ LỖI BIÊN DỊCH: Type 'UserId' is not assignable to type 'OrderId'!
cancelOrder(o);    //  Chính xác 100%!
```

### 2.2 Các Thực Hành Tốt Nhất (Best Practices)
1. **Tuyệt đối cấm `any` trong production code:** Thay thế bằng `unknown`, Generic `<T>`, hoặc discriminated unions. Nếu tạm thời chưa rõ kiểu, hãy dùng `Record<string, unknown>`.
2. **Ưu tiên `unknown` cho `catch(err)`:** Không bao giờ giả định `err` là `Error` vì trong JS, bất kỳ thứ gì cũng có thể bị `throw` (`throw "string"`, `throw 404`).
3. **Bất biến hóa dữ liệu (Immutability by default):** Tận dụng `readonly`, `ReadonlyArray`, và `as const` để ngăn chặn hiệu ứng lề (Side Effects).
4. **Sử dụng Type-Only Imports:**
   ```typescript
   import type { UserDto } from "./types";
   ```
   Giúp Bundler (Vite, Rollup) dễ dàng loại bỏ hoàn toàn câu lệnh import khỏi bundle, tránh circular dependency issues.

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên bắt ngoại lệ cho `catch (err: unknown)`
Trong chế độ `strict: true` (hoặc `useUnknownInCatchVariables: true`), biến trong catch mang kiểu `unknown`:
```typescript
try {
    fetchData();
} catch (err: unknown) {
    // console.log(err.message); // ❌ Lỗi: 'err' is of type 'unknown'
    if (err instanceof Error) {
        console.log(err.message); //  An toàn
    } else {
        console.log("Unknown error:", String(err));
    }
}
```

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern: Xây dựng Currency & Unit of Measurement an toàn bằng Branded Types
declare const currencyBrand: unique symbol;
export type USD = number & { readonly [currencyBrand]: "USD" };
export type EUR = number & { readonly [currencyBrand]: "EUR" };

export function makeUSD(amount: number): USD {
    if (amount < 0) throw new Error("Invalid currency amount");
    return amount as USD;
}

export function makeEUR(amount: number): EUR {
    if (amount < 0) throw new Error("Invalid currency amount");
    return amount as EUR;
}

export function calculateUsdTax(subtotal: USD, rate: number): USD {
    return (subtotal * rate) as USD;
}

const price = makeUSD(100);
const tax = calculateUsdTax(price, 0.08); //  Hợp lệ

const euroPrice = makeEUR(100);
// calculateUsdTax(euroPrice, 0.08); // ❌ LỖI BIÊN DỊCH: Argument of type 'EUR' is not assignable to parameter of type 'USD'
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Structural Typing (Duck Typing) trong TypeScript khác gì so với Nominal Typing trong Java hay C#?
   - *Trả lời:* Trong Nominal Typing (Java, C#), hai kiểu chỉ tương thích với nhau nếu chúng có cùng tên khai báo hoặc có quan hệ kế thừa rõ ràng, ngay cả khi chúng có các trường giống hệt nhau. Trong Structural Typing của TypeScript, hai kiểu hoàn toàn tương thích và gán được cho nhau miễn là chúng có cùng hình dạng cấu trúc (thuộc tính và kiểu của từng thuộc tính), bất kể tên định danh của chúng là gì.

2. **Câu hỏi:** Làm thế nào để mô phỏng Nominal Typing trong TypeScript?
   - *Trả lời:* Dùng kỹ thuật Branded Types (hay Flavored Types). Ta dùng toán tử Intersection `&` để kết hợp kiểu dữ liệu gốc với một đối tượng chứa một thuộc tính độc nhất (thường sử dụng `unique symbol` hoặc chuỗi định danh đặc biệt làm key). Do đối tượng khác không có thuộc tính brand tương ứng, TypeScript sẽ từ chối phép gán giữa các kiểu dữ liệu khác nhau dù chúng có cùng kiểu nguyên thủy nền tảng.
