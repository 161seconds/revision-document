# 01. Generic Functions & Classes

Cơ chế trừu tượng hóa kiểu dữ liệu, tái sử dụng logic với Generic Parameters trong hàm và lớp đối tượng.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Parameter Properties & Getters](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/04-parameter-properties-and-getters.md)
- **Tiếp theo:** [Generic Constraints & Keyof](file:///d:/my-project/revision-document/typescript/03-generics-and-utility-types/02-generic-constraints-and-keyof.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Tại Sao Cần Generics?
Nếu không có Generics, để viết một hàm hoạt động trên nhiều kiểu dữ liệu, ta chỉ có hai lựa chọn tồi:
1. Dùng kiểu cụ thể (`number`, `string`) $\rightarrow$ Phải nhân bản mã nguồn (Duplicate code).
2. Dùng `any` $\rightarrow$ Mất toàn bộ Type Safety, không thể bắt trình biên dịch nhớ được kiểu dữ liệu trả về tương ứng với kiểu truyền vào.

Generics giải quyết bài toán này bằng cách giới thiệu **Biến kiểu (Type Variable)**, thường ký hiệu là `T`, `U`, `V` hoặc tên có ý nghĩa như `TData`, `TError`. Biến kiểu này đóng vai trò như một placeholder lưu giữ thông tin kiểu dữ liệu chính xác khi hàm hoặc lớp được sử dụng.

### 2.2 Generic Functions & Suy Luận Tham Số Kiểu (Type Argument Inference)
```typescript
function wrapInBox<T>(item: T): { value: T; createdAt: number } {
    return {
        value: item,
        createdAt: Date.now()
    };
}

// Gọi tường minh
const b1 = wrapInBox<string>("hello"); // { value: string; ... }

// Gọi dựa trên suy luận tự động của TypeScript (Type Argument Inference)
const b2 = wrapInBox(42); // TypeScript tự suy luận T là number!
```

### 2.3 Generic Classes & Interfaces
Generics có thể áp dụng lên Class để xây dựng các cấu trúc dữ liệu kinh điển (Stack, Queue, Cache) hoạt động với bất kỳ kiểu dữ liệu nào:

```typescript
export class GenericStack<T> {
    private elements: T[] = [];

    public push(item: T): void {
        this.elements.push(item);
    }

    public pop(): T | undefined {
        return this.elements.pop();
    }

    public peek(): T | undefined {
        return this.elements[this.elements.length - 1];
    }

    public get size(): number {
        return this.elements.length;
    }
}
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Quá lạm dụng Generics khi không cần thiết (Over-engineering)
Nhiều lập trình viên lạm dụng Generics cho những nơi chỉ cần tham số thông thường, làm mã nguồn trở nên khó đọc và làm chậm trình kiểm tra kiểu:
```typescript
// ❌ RƯỜM RÀ: Tham số T chỉ xuất hiện duy nhất 1 lần
function logLength<T extends { length: number }>(arg: T): void {
    console.log(arg.length);
}

//  TINH GỌN: Dùng trực tiếp interface/union
function logLength(arg: { length: number }): void {
    console.log(arg.length);
}
```
**Quy tắc:** Chỉ sử dụng Generics khi có **mối liên hệ kiểu giữa 2 hoặc nhiều vị trí** (ví dụ giữa tham số và giá trị trả về, hoặc giữa 2 tham số với nhau).

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern: Generic Result Monad & Pipeline Adapter
export interface ApiResponse<TData, TMeta = Record<string, unknown>> {
    status: number;
    payload: TData;
    meta?: TMeta;
}

export function createResponse<T>(data: T, status: number = 200): ApiResponse<T> {
    return {
        status,
        payload: data
    };
}

// Sử dụng
const userRes = createResponse({ id: "u_1", name: "Bob" });
console.log(userRes.payload.name); // TS nhận diện chính xác kiểu { id: string; name: string }
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Type Argument Inference trong Generic Function hoạt động như thế nào?
   - *Trả lời:* Khi gọi một Generic Function mà không truyền tham số kiểu tường minh (ví dụ `fn(x)` thay vì `fn<string>(x)`), TypeScript Compiler sẽ nhìn vào kiểu thực tế của các đối số truyền vào tại runtime signature để tự động suy luận kiểu phù hợp nhất gán cho `T`. Nếu các đối số mâu thuẫn (ví dụ `pair(1, "a")` trong `pair<T>(a: T, b: T)`), TypeScript sẽ suy luận `T` thành Union (`number | string`) hoặc báo lỗi tùy theo ngữ cảnh.

2. **Câu hỏi:** Static members trong Generic Class có thể truy cập tham số kiểu `T` của Class không? Tại sao?
   - *Trả lời:* Không thể. Thành viên `static` thuộc về bản thân Class/Constructor Function và tồn tại độc lập với bất kỳ instance nào, trong khi tham số kiểu `T` chỉ được xác định khi một instance cụ thể được khởi tạo (`new MyClass<string>()`). Do đó, khai báo `static val: T;` sẽ bị TypeScript ném lỗi biên dịch: `Static members cannot reference class type arguments`. Nếu muốn static method dùng generic, method đó phải tự khai báo tham số kiểu riêng: `static create<U>(item: U): MyClass<U>`.
