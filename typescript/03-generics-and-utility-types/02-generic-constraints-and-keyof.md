# 02. Generic Constraints & Keyof

Thiết lập giới hạn kiểu với từ khóa `extends`, truy xuất danh sách thuộc tính qua `keyof` và kỹ thuật Indexed Access Types (`T[K]`).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Generic Functions & Classes](file:///d:/my-project/revision-document/typescript/03-generics-and-utility-types/01-generic-functions-and-classes.md)
- **Tiếp theo:** [Built-in Utility Types](file:///d:/my-project/revision-document/typescript/03-generics-and-utility-types/03-builtin-utility-types.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Generic Constraints (`T extends Constraint`)
Mặc định, biến kiểu `T` có thể đại diện cho bất kỳ thứ gì (`unknown`). Khi cần truy cập các thuộc tính cụ thể trên `T` (như `.length`, `.id`), ta phải dùng từ khóa `extends` để giới hạn (constrain) tập hợp kiểu hợp lệ:

```typescript
interface HasLength {
    length: number;
}

function countElements<T extends HasLength>(collection: T): number {
    return collection.length; //  Hợp lệ vì T được đảm bảo luôn có thuộc tính length
}

countElements("hello"); // 5 (string có length)
countElements([1, 2, 3]); // 3 (array có length)
// countElements(123); // ❌ Lỗi biên dịch: Type 'number' has no property 'length'
```

### 2.2 Toán Tử `keyof` (Index Type Query)
Toán tử `keyof` nhận vào một kiểu Object và trả về một **Union của các tên thuộc tính (Keys)** của kiểu đó:

```typescript
interface User {
    id: string;
    username: string;
    age: number;
}

type UserKeys = keyof User; // "id" | "username" | "age"
```

### 2.3 Indexed Access Types (`T[K]`) & Generic Key Lookup
Kết hợp `T extends object` và `K extends keyof T`, ta tạo ra hàm truy xuất thuộc tính an toàn tuyệt đối chống lỗi gõ nhầm tên trường (Property Typos):

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const dev = { id: 1, name: "Alice", isSenior: true };
const nameVal = getProperty(dev, "name"); // Type: string
const ageVal = getProperty(dev, "isSenior"); // Type: boolean
// getProperty(dev, "email"); // ❌ Compile error: Argument of type '"email"' is not assignable to parameter of type '"id" | "name" | "isSenior"'.
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên rằng `keyof any` chứa cả `symbol`
Khi thao tác với generic record `Record<K, T>`, nếu không giới hạn `K extends string`, key có thể mang kiểu `number` hoặc `symbol`, gây lỗi khi truyền vào các hàm xử lý chuỗi như `key.toLowerCase()`:
```typescript
// ❌ LỖI: K có thể là symbol hoặc number
function formatKey<K extends keyof any>(key: K): string {
    // return key.toUpperCase(); // ❌ Property 'toUpperCase' does not exist on type 'number | symbol'
    return String(key).toUpperCase(); //  An toàn
}
```

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern: Hàm trích xuất mảng thuộc tính an toàn (Pluck Pattern)
export function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
    return items.map(item => item[key]);
}

interface Product {
    id: number;
    title: string;
    price: number;
}

const inventory: Product[] = [
    { id: 1, title: "Laptop", price: 1200 },
    { id: 2, title: "Mouse", price: 25 }
];

const titles = pluck(inventory, "title"); // Type: string[] -> ["Laptop", "Mouse"]
const prices = pluck(inventory, "price"); // Type: number[] -> [1200, 25]
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Toán tử `keyof` hoạt động thế nào khi áp dụng lên một kiểu có Index Signature `interface Dict { [key: string]: number }`?
   - *Trả lời:* Khi interface có string index signature `[key: string]: number`, `keyof Dict` sẽ có kiểu là `string | number`. Lý do là trong JavaScript, khi bạn truy cập thuộc tính bằng số (`obj[0]`), engine JS sẽ tự động ép số đó thành chuỗi (`obj["0"]`). Do đó, TypeScript coi cả số nguyên là key hợp lệ.

2. **Câu hỏi:** Giải thích ý nghĩa của chữ ký hàm: `function update<T, K extends keyof T>(target: T, key: K, value: T[K]): void`?
   - *Trả lời:* Chữ ký này đảm bảo: (1) `target` là một đối tượng kiểu `T`, (2) `key` bắt buộc phải là một tên thuộc tính thực sự tồn tại trên `T`, và (3) `value` truyền vào phải có kiểu dữ liệu khớp chính xác 100% với kiểu thuộc tính tương ứng `T[K]`. Ví dụ nếu cập nhật trường `age` (kiểu `number`), compiler sẽ từ chối nếu bạn truyền chuỗi `"30"`.
