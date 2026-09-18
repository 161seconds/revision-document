# 03. Abstract Classes & Implements

Thiết kế kiến trúc hệ thống đa tầng với Abstract Classes, phương thức trừu tượng và hợp đồng Interface trong TypeScript.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Classes & Access Modifiers](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/02-classes-and-access-modifiers.md)
- **Tiếp theo:** [Parameter Properties & Getters](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/04-parameter-properties-and-getters.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 So Sánh `abstract class` vs `interface`

| Tiêu chí | `abstract class` | `interface` |
| :--- | :--- | :--- |
| **Mã sinh ra ở Runtime** |  Sinh ra JavaScript Class | ❌ 0 bytes (bị compiler xóa sạch) |
| **Chứa logic thực thi** |  Có thể chứa method có thân hàm, constructor | ❌ Chỉ chứa chữ ký kiểu (signatures) |
| **Khởi tạo trực tiếp (`new`)** | ❌ Không thể `new BaseClass()` | ❌ Không thể `new IInterface()` |
| **Số lượng kế thừa** | Đơn kế thừa (`extends` đúng 1 lớp) | Đa kế thừa (`implements` nhiều interfaces) |
| **Access Modifiers** | Hỗ trợ `public`, `protected`, `private` | Chỉ mô tả cấu trúc `public` |

### 2.2 Template Method Pattern với Abstract Class
Một trong những ứng dụng kinh điển nhất của Abstract Class là định hình **khung thuật toán cố định** ở lớp cha và để các bước cụ thể cho các lớp con triển khai:

```typescript
abstract class ReportGenerator {
    // Template Method (cố định thứ tự thực thi)
    public generate(): string {
        const raw = this.fetchData();
        const formatted = this.formatData(raw);
        return this.wrapHeaderFooter(formatted);
    }

    protected abstract fetchData(): string[];
    protected abstract formatData(data: string[]): string;

    private wrapHeaderFooter(content: string): string {
        return `=== REPORT START ===\n${content}\n=== REPORT END ===`;
    }
}
```

### 2.3 Triển Khai Nhiều Interface (`implements`)
Một Class có thể thực thi nhiều Interface khác nhau, tạo nên tính đa hình (Polymorphism) mạnh mẽ theo nguyên lý ISP (Interface Segregation Principle):

```typescript
interface Loggable {
    log(): void;
}

interface Serializable {
    toJSON(): string;
}

class SystemEvent implements Loggable, Serializable {
    constructor(public eventName: string, public timestamp: number) {}

    log(): void {
        console.log(`[EVENT ${this.timestamp}]: ${this.eventName}`);
    }

    toJSON(): string {
        return JSON.stringify({ name: this.eventName, time: this.timestamp });
    }
}
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Cố gắng `new` một Abstract Class
```typescript
abstract class Animal {}
// const a = new Animal(); // ❌ Compile error: Cannot create an instance of an abstract class.
```

### Bẫy 2: Thiếu sót phương thức bắt buộc khi `implements`
Nếu một class `implements InterfaceA`, nó phải triển khai đầy đủ 100% các trường và phương thức của `InterfaceA` dưới dạng **`public`**:
```typescript
interface Guard {
    check(): boolean;
}

class MyGuard implements Guard {
    // private check(): boolean { ... } // ❌ Lỗi: Class member 'check' cannot be private because it implements public interface member.
    public check(): boolean { return true; } //  Hợp lệ
}
```

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern: Base Repository chuẩn kiến trúc Clean Architecture
export interface Entity {
    id: string;
}

export abstract class BaseRepository<T extends Entity> {
    protected items: Map<string, T> = new Map();

    public save(item: T): void {
        this.items.set(item.id, item);
    }

    public findById(id: string): T | undefined {
        return this.items.get(id);
    }

    public count(): number {
        return this.items.size;
    }

    // Phương thức trừu tượng buộc lớp con phải định nghĩa quy tắc xác thực
    public abstract validate(item: T): boolean;
}

export interface UserAccount extends Entity {
    id: string;
    username: string;
}

export class UserRepository extends BaseRepository<UserAccount> {
    public validate(user: UserAccount): boolean {
        return user.username.length >= 3;
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Khi nào nên dùng `abstract class` thay vì `interface`?
   - *Trả lời:* Sử dụng `abstract class` khi các lớp con có chung mã nguồn thực thi (shared implementation logic), cần chia sẻ trạng thái qua constructor chung, hoặc muốn kiểm soát phạm vi truy cập với `protected`. Sử dụng `interface` khi chỉ cần định nghĩa hợp đồng kiểm tra kiểu thuần túy mà không cần chia sẻ code thực thi, hoặc khi một class cần kế thừa nhiều hợp đồng độc lập khác nhau (đa kế thừa).

2. **Câu hỏi:** Interface có thể mô tả Constructor Function (hàm khởi tạo) để kiểm tra một Class hay không?
   - *Trả lời:* Có. Interface có thể sử dụng cú pháp Construct Signature `new (...args): ReturnType` để mô tả hàm khởi tạo. Kỹ thuật này thường được sử dụng trong Factory Pattern hoặc Dependency Injection Containers để kiểm tra xem một Class có đúng constructor mong muốn trước khi gọi `new`.
