# TypeScript Master Cheat Sheet

Bản tóm tắt toàn diện ngữ pháp, hệ thống kiểu (Type System), cơ chế suy luận (Type Inference), Generics, Utility Types, Type Manipulation và Compiler Configs trong TypeScript.

---

## 1. Hệ Thống Kiểu Nguyên Thủy & Kiểu Đặc Biệt

| Kiểu | Ví dụ | Ý nghĩa & Bản chất |
| :--- | :--- | :--- |
| `number` | `42`, `3.14`, `0xff` | IEEE-754 số thực dấu phẩy động 64-bit |
| `string` | `"hello"`, `'world'`, `` `val: ${x}` `` | Chuỗi ký tự UTF-16 |
| `boolean` | `true`, `false` | Giá trị logic |
| `bigint` | `100n`, `BigInt(100)` | Số nguyên kích thước tùy ý |
| `symbol` | `Symbol("key")` | Giá trị định danh độc nhất |
| `null` / `undefined` | `null`, `undefined` | Vắng mặt giá trị; trong `strictNullChecks` không gán được cho kiểu khác |
| `any` | `let x: any` | Tắt hoàn toàn kiểm tra kiểu của TypeScript (thoát khỏi type checker) |
| `unknown` | `let x: unknown` | Type-safe alternative của `any`; bắt buộc phải type narrowing trước khi dùng |
| `never` | `function fail(): never` | Biểu thị giá trị không bao giờ xảy ra (hàm ném lỗi vô hạn, exhaustive checking) |
| `void` | `function log(): void` | Hàm không trả về giá trị (hoặc trả về `undefined`) |

---

## 2. Arrays, Tuples & Enums

```typescript
// Arrays
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ["Alice", "Bob"];
const readonlyArr: readonly number[] = [1, 2, 3]; // Không được push, pop

// Tuples: Mảng cố định số lượng và kiểu tại mỗi vị trí
type Coordinate = [latitude: number, longitude: number];
const pos: Coordinate = [10.8231, 106.6297];

// Named Tuple với optional element
type ResponseState = [code: number, message: string, details?: object];

// Numeric Enum (Mặc định bắt đầu từ 0)
enum Direction {
    Up = 1, // 1
    Down,   // 2
    Left,   // 3
    Right   // 4
}

// String Enum (Không có reverse mapping, an toàn runtime)
enum HttpStatus {
    Ok = "OK",
    NotFound = "NOT_FOUND",
    InternalError = "INTERNAL_ERROR"
}

// Const Enum (Bị compile inlined thành hằng số, không sinh JS object)
const enum Role {
    Admin = "ADMIN",
    User = "USER"
}
```

---

## 3. Type Aliases vs Interfaces

| Tiêu chí | `type` (Type Alias) | `interface` |
| :--- | :--- | :--- |
| **Định nghĩa đối tượng** | `type User = { id: number; name: string };` | `interface User { id: number; name: string; }` |
| **Kế thừa / Mở rộng** | Dùng Intersection `&`: `type Admin = User & { role: string };` | Dùng `extends`: `interface Admin extends User { role: string; }` |
| **Declaration Merging** | ❌ Bị báo lỗi trùng tên |  Tự động gộp các interface cùng tên |
| **Primitive / Union** |  Hỗ trợ: `type ID = string \| number;` | ❌ Chỉ mô tả hình dạng Object / Function |
| **Tuple / Mapped Type** |  Hỗ trợ đầy đủ `[number, string]`, `{[K in T]: ...}` | ❌ Không hỗ trợ trực tiếp |
| **Quy ước đề xuất** | Dùng cho Unions, Primitives, Tuples, Utility transformations | Dùng cho mô tả Object models public API, class contracts |

---

## 4. Union, Intersection & Type Narrowing

```typescript
// Union: Một trong các kiểu
type Status = "pending" | "fulfilled" | "rejected";
type Input = string | number;

// Intersection: Phải thỏa mãn tất cả kiểu
type Timestamps = { createdAt: Date; updatedAt: Date };
type Product = { id: string; price: number } & Timestamps;

// Type Narrowing (Thu hẹp kiểu)
function process(val: string | number) {
    if (typeof val === "string") {
        console.log(val.toUpperCase()); // val là string
    } else {
        console.log(val.toFixed(2));    // val là number
    }
}

// Discriminated Union (Tagged Union) - Pattern chuẩn hệ thống
interface SuccessState {
    status: "success";
    data: string[];
}
interface ErrorState {
    status: "error";
    error: Error;
}
type NetworkState = SuccessState | ErrorState;

function handleState(state: NetworkState) {
    switch (state.status) {
        case "success":
            return state.data.length; // TS tự hiểu state là SuccessState
        case "error":
            return state.error.message; // TS tự hiểu state là ErrorState
    }
}
```

---

## 5. Functions & Overloads

```typescript
// Function Type Signature
type MathFn = (a: number, b: number) => number;

// Optional & Default Parameters
function greet(name: string, title: string = "Mr/Ms", prefix?: string): string {
    return `${prefix ? prefix + " " : ""}${title} ${name}`;
}

// Rest Parameters
function sum(...nums: number[]): number {
    return nums.reduce((acc, n) => acc + n, 0);
}

// Function Overloads
function parseDate(timestamp: number): Date;
function parseDate(dateStr: string): Date;
function parseDate(val: number | string): Date {
    return new Date(val);
}
```

---

## 6. Classes & Access Modifiers

```typescript
interface Serializable {
    serialize(): string;
}

abstract class BaseEntity {
    // Parameter Properties (tự động tạo field)
    constructor(
        public readonly id: string,
        protected createdAt: Date = new Date()
    ) {}

    abstract getDisplayName(): string;
}

class UserEntity extends BaseEntity implements Serializable {
    private _email: string;
    #secureHash: string; // ECMAScript Private Field (Hard private)

    constructor(id: string, email: string, hash: string) {
        super(id);
        this._email = email;
        this.#secureHash = hash;
    }

    get email(): string {
        return this._email;
    }

    set email(val: string) {
        if (!val.includes("@")) throw new Error("Invalid email");
        this._email = val;
    }

    getDisplayName(): string {
        return `User(${this.id}): ${this._email}`;
    }

    serialize(): string {
        return JSON.stringify({ id: this.id, email: this._email });
    }
}
```

---

## 7. Generics & Constraints

```typescript
// Generic Function
function identity<T>(arg: T): T {
    return arg;
}

// Generic Interface
interface ApiResponse<TData> {
    code: number;
    payload: TData;
}

// Generic Constraint với `extends`
interface HasId {
    id: string | number;
}
function findById<T extends HasId>(items: T[], targetId: string | number): T | undefined {
    return items.find(item => item.id === targetId);
}

// `keyof` và Lookup Types `T[K]`
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}
```

---

## 8. Built-in Utility Types Catalog

| Utility Type | Cú pháp | Bản chất hoạt động |
| :--- | :--- | :--- |
| `Partial<T>` | `Partial<T>` | Biến tất cả thuộc tính của `T` thành tùy chọn (`?`) |
| `Required<T>` | `Required<T>` | Biến tất cả thuộc tính của `T` thành bắt buộc (bỏ `?`) |
| `Readonly<T>` | `Readonly<T>` | Đánh dấu tất cả thuộc tính của `T` là `readonly` |
| `Record<K, T>` | `Record<string, number>` | Tạo object có key kiểu `K` và value kiểu `T` |
| `Pick<T, K>` | `Pick<T, "id" \| "name">` | Trích xuất tập con các thuộc tính `K` từ `T` |
| `Omit<T, K>` | `Omit<T, "password">` | Loại bỏ các thuộc tính `K` ra khỏi `T` |
| `Exclude<T, U>` | `Exclude<"a"\|"b"\|"c", "a">` | Loại bỏ các union members gán được cho `U` (`"b" \| "c"`) |
| `Extract<T, U>` | `Extract<string\|number, string>` | Trích xuất các union members gán được cho `U` (`string`) |
| `NonNullable<T>` | `NonNullable<T>` | Loại bỏ `null` và `undefined` khỏi union `T` |
| `ReturnType<T>` | `ReturnType<typeof fn>` | Lấy kiểu giá trị trả về của một hàm |
| `Parameters<T>` | `Parameters<typeof fn>` | Lấy tuple các tham số của một hàm |
| `Awaited<T>` | `Awaited<Promise<string>>` | Mở gói đệ quy Promise để lấy kiểu bên trong (`string`) |

---

## 9. Type Manipulation & Type Gymnastics

```typescript
// 1. Conditional Types
type IsString<T> = T extends string ? true : false;

// 2. `infer` Keyword (Khai báo biến kiểu động)
type ElementType<T> = T extends (infer U)[] ? U : T;
type ArrElem = ElementType<string[]>; // string

type UnpackPromise<T> = T extends Promise<infer R> ? R : T;
type Val = UnpackPromise<Promise<number>>; // number

// 3. Mapped Types
type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

// 4. Template Literal Types
type EventType = "click" | "hover";
type EventHandler = `on${Capitalize<EventType>}`; // "onClick" | "onHover"

// 5. User-Defined Type Guard (is operator)
function isString(val: unknown): val is string {
    return typeof val === "string";
}

// 6. Assertion Functions (asserts operator)
function assertNonNull<T>(val: T, msg: string): asserts val is NonNullable<T> {
    if (val === null || val === undefined) {
        throw new Error(msg);
    }
}
```

---

## 10. `tsconfig.json` Compiler Options Cốt Lõi

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "declaration": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

---

## 11. Top 5 Bẫy Kinh Điển Trong TypeScript

1. **`any` vs `unknown`**: `any` hủy hoại toàn bộ hệ thống kiểm tra kiểu; hãy luôn dùng `unknown` khi nhận dữ liệu bên ngoài (API, JSON parse) và dùng Type Guard để narrow.
2. **Tuples bị suy biến thành Array**: `const arr = [1, "a"]` được TS suy luận là `(string | number)[]`. Dùng `as const` để giữ nguyên tuple: `const arr = [1, "a"] as const;` -> `readonly [1, "a"]`.
3. **Optional Property `?` vs `| undefined`**: `field?: string` cho phép bỏ qua key khi khởi tạo, trong khi `{ field: string | undefined }` bắt buộc phải truyền key với giá trị `undefined`.
4. **Casting `as` không làm thay đổi Runtime**: `const x = "123" as unknown as number;` không biến chuỗi thành số ở runtime. TS chỉ tin tưởng bạn lúc biên dịch; runtime vẫn là `"123"`.
5. **Excess Property Checking**: Khi truyền object literal trực tiếp vào hàm `printUser({ id: 1, extra: true })`, TS sẽ báo lỗi thuộc tính dư thừa. Nhưng nếu gán qua biến trung gian `const u = { id: 1, extra: true }; printUser(u);`, TS sẽ bỏ qua (Duck typing).
