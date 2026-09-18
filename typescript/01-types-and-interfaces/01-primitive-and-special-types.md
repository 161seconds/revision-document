# 01. Primitive & Special Types

Hệ thống kiểu nguyên thủy và các kiểu đặc biệt cốt lõi tạo nên nền móng an toàn dữ liệu của TypeScript.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [JavaScript Data Types](file:///d:/my-project/revision-document/javascript/01-fundamentals/README.md)
- **Tiếp theo:** [Arrays, Tuples & Enums](file:///d:/my-project/revision-document/typescript/01-types-and-interfaces/02-arrays-tuples-and-enums.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Các Kiểu Nguyên Thủy (Primitives)
TypeScript ánh xạ trực tiếp các kiểu nguyên thủy của JavaScript:
- `number`: Số thực 64-bit IEEE 754.
- `string`: Chuỗi ký tự Unicode UTF-16.
- `boolean`: `true` hoặc `false`.
- `bigint`: Số nguyên tùy ý, hậu tố `n` (ES2020+).
- `symbol`: Định danh bất biến và độc nhất qua `Symbol()`.
- `null` & `undefined`: Trong chế độ `strictNullChecks: true`, chúng không thể gán tự do cho các kiểu khác mà phải dùng Union (`string | null`).

### 2.2 Các Kiểu Đặc Biệt: `any`, `unknown`, `never`, `void`

```
           ┌──────────────┐
           │     any      │ (Thoát khỏi hệ thống kiểu - Top & Bottom)
           └──────┬───────┘
                  │
           ┌──────▼───────┐
           │   unknown    │ (Top Type - Mọi thứ đều gán được vào unknown)
           └──────┬───────┘
                  │
        ┌─────────┴─────────┐
        │   Concrete Types   │ (number, string, boolean, objects...)
        └─────────┬─────────┘
                  │
           ┌──────▼───────┐
           │    never     │ (Bottom Type - Không có giá trị nào thuộc về never)
           └──────────────┘
```

1. **`any`**: Tắt toàn bộ quá trình type checking. Trình biên dịch tin tưởng hoàn toàn mọi thao tác: `x.foo().bar[0]++`. Là mầm mống gây sập runtime `TypeError: x is not a function`.
2. **`unknown`**: Top type an toàn. Bất kỳ giá trị nào cũng gán được vào `unknown`, nhưng bạn **không thể** thực hiện bất kỳ thao tác nào lên nó cho đến khi kiểm tra kiểu (Type Narrowing) hoặc ép kiểu rõ ràng.
3. **`void`**: Đại diện cho sự vắng mặt của giá trị trả về trong một hàm. Trong JS runtime, hàm đó thực tế trả về `undefined`.
4. **`never`**: Bottom type. Đại diện cho trạng thái tính toán không bao giờ hoàn thành hoặc nhánh code không thể chạm tới (Unreachable code).

### 2.3 Ép Kiểu (Type Assertions: `as`)
Toán tử `as` thông báo cho TypeScript Compiler: *"Tôi biết rõ kiểu dữ liệu này hơn bạn"*. Nó **hoàn toàn không sinh mã chuyển đổi runtime**. Nếu ép sai kiểu (`"hello" as unknown as number`), chương trình vẫn chạy với chuỗi nhưng TypeScript tưởng là số.

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Dùng `any` làm tê liệt Type Safety lan truyền
Khi một hàm trả về `any`, bất kỳ biến nào hứng kết quả từ nó cũng có thể bị lây nhiễm `any`, khiến toàn bộ ứng dụng mất đi sự bảo vệ tĩnh.
```typescript
// ❌ NGUY HIỂM: JSON.parse trả về any
const data = JSON.parse('{"price": 100}');
data.pice.toFixed(); // Không báo lỗi lúc compile! Sập runtime: Cannot read properties of undefined

//  AN TOÀN: Gán về unknown và kiểm tra
const raw: unknown = JSON.parse('{"price": 100}');
if (typeof raw === "object" && raw !== null && "price" in raw) {
    console.log((raw as { price: number }).price.toFixed(2));
}
```

### Bẫy 2: Exhaustiveness Checking bị lọt nhánh
Nếu không dùng `never` trong khối `switch-case`, khi thêm kiểu mới vào Union, TypeScript sẽ không cảnh báo những nơi chưa xử lý:
```typescript
type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape) {
    switch (shape) {
        case "circle": return Math.PI;
        case "square": return 1;
        // Quên xử lý "triangle"
        default:
            const _exhaustiveCheck: never = shape; // ❌ Compile error! "triangle" không gán được vào never
            return _exhaustiveCheck;
    }
}
```

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern 1: Xử lý dữ liệu ngoại lai (API Input) an toàn với unknown
function parseApiResponse(rawPayload: unknown): string {
    if (typeof rawPayload === "string") {
        return rawPayload.trim();
    }
    if (typeof rawPayload === "object" && rawPayload !== null && "message" in rawPayload) {
        const msg = (rawPayload as { message: unknown }).message;
        if (typeof msg === "string") return msg;
    }
    throw new Error("Invalid payload format");
}

// Pattern 2: Hàm ném ngoại lệ trả về never
function fail(message: string): never {
    throw new Error(`[CRITICAL SYSTEM FAULT]: ${message}`);
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Phân biệt chi tiết giữa `unknown` và `any`? Khi nào bắt buộc phải dùng `unknown`?
   - *Trả lời:* `any` tắt mọi kiểm tra kiểu; bạn có thể truy cập thuộc tính hoặc gọi hàm tùy ý, dẫn tới lỗi runtime. `unknown` chấp nhận mọi kiểu dữ liệu nhưng ngăn cấm mọi thao tác cho đến khi bạn thực hiện Type Narrowing (bằng `typeof`, `instanceof`...). Luôn dùng `unknown` khi làm việc với dữ liệu đầu vào không rõ ràng từ bên ngoài: API payload, `JSON.parse`, hoặc third-party libraries không có typing.

2. **Câu hỏi:** `void` khác `undefined` như thế nào khi làm kiểu trả về của hàm?
   - *Trả lời:* `undefined` là một giá trị cụ thể. Một hàm khai báo `(): undefined` bắt buộc phải có câu lệnh `return undefined;` hoặc `return;`. Hàm khai báo `(): void` có thể không có câu lệnh `return`, hoặc có thể return giá trị nhưng người gọi sẽ bị TypeScript bỏ qua và coi như không trả về giá trị (thường gặp trong callback handlers).
