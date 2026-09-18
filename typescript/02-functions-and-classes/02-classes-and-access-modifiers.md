# 02. Classes & Access Modifiers

Mô hình hóa lớp đối tượng, kiểm soát phạm vi truy cập và bảo vệ trạng thái với Access Modifiers trong TypeScript.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Function Types & Signatures](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/01-function-types-and-signatures.md)
- **Tiếp theo:** [Abstract Classes & Implements](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/03-abstract-classes-and-implements.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Bảng Access Modifiers

| Modifier | Truy cập nội bộ Class | Truy cập từ Lớp con kế thừa | Truy cập từ bên ngoài (Instance) |
| :--- | :---: | :---: | :---: |
| **`public`** (mặc định) |  Có |  Có |  Có |
| **`protected`** |  Có |  Có | ❌ Không |
| **`private`** |  Có | ❌ Không | ❌ Không |
| **`#field`** (ES Private) |  Có (Hard private) | ❌ Không | ❌ Không |

### 2.2 So Sánh TypeScript `private` vs ECMAScript `#private`
- **TypeScript `private` (Soft private):** Chỉ tồn tại ở bước biên dịch. Khi biên dịch sang JavaScript, trường này trở thành thuộc tính thông thường. Bất kỳ ai cũng có thể truy cập lén qua `(obj as any).secret` hoặc dùng `obj["secret"]`.
- **ECMAScript `#field` (Hard private):** Được hỗ trợ trực tiếp bởi JavaScript runtime (V8, SpiderMonkey) thông qua cơ chế WeakMap nội tại của engine. Thậm chí dùng `any` hay duyệt `Object.keys()` cũng **hoàn toàn không thể chạm tới**, ném lỗi `SyntaxError` nếu truy cập ngoài phạm vi lớp.

```typescript
class Vault {
    private softSecret = "ts-private";
    #hardSecret = "es-private";

    reveal() {
        return `${this.softSecret} - ${this.#hardSecret}`;
    }
}
```

### 2.3 Thuộc Tính `readonly`
- Thuộc tính được đánh dấu `readonly` chỉ có thể được gán giá trị **duy nhất một lần** tại nơi khai báo hoặc bên trong `constructor`.
- Sau khi `constructor` kết thúc, mọi phép gán `this.prop = ...` đều bị compiler chặn đứng.

### 2.4 Từ Khóa `override` (TS 4.3+)
Khi cờ `noImplicitOverride: true` được bật trong `tsconfig.json`, mọi phương thức ở lớp con muốn ghi đè phương thức của lớp cha bắt buộc phải có từ khóa `override`. Nếu phương thức của lớp cha bị đổi tên, TypeScript sẽ cảnh báo lỗi ngay lập tức, ngăn ngừa lỗi âm thầm (silent regression).

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên rằng `readonly` chỉ nông (Shallow Readonly)
Nếu thuộc tính `readonly` là một mảng hoặc đối tượng tham chiếu, nội dung bên trong nó vẫn có thể bị chỉnh sửa (mutated):
```typescript
class ConfigHolder {
    readonly items: string[] = ["a", "b"];
}
const holder = new ConfigHolder();
// holder.items = []; // ❌ Compile error: Cannot assign to 'items'
holder.items.push("c"); //  VẪN CHẠY BÌNH THƯỜNG!
```
**Khắc phục:** Khai báo kiểu là `readonly string[]` hoặc `ReadonlyArray<string>`.

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern: Xây dựng Domain Model chuẩn OOP với Protected và Readonly
export class BankAccount {
    public readonly accountNumber: string;
    protected balance: number;
    #pinHash: string; // Hard private

    constructor(accNo: string, initialBalance: number, pin: string) {
        if (initialBalance < 0) throw new Error("Initial balance cannot be negative");
        this.accountNumber = accNo;
        this.balance = initialBalance;
        this.#pinHash = this.hashPin(pin);
    }

    private hashPin(pin: string): string {
        return `hash_${pin}`;
    }

    public getBalance(): number {
        return this.balance;
    }

    public deposit(amount: number): void {
        if (amount <= 0) throw new Error("Deposit amount must be positive");
        this.balance += amount;
    }
}

export class SavingsAccount extends BankAccount {
    private interestRate: number;

    constructor(accNo: string, balance: number, pin: string, rate: number) {
        super(accNo, balance, pin);
        this.interestRate = rate;
    }

    public applyInterest(): void {
        // Truy cập được protected this.balance từ lớp cha
        const interest = this.balance * this.interestRate;
        this.balance += interest;
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Phân biệt cơ chế bảo mật giữa `private` của TypeScript và `#private` của JavaScript hiện đại?
   - *Trả lời:* `private` của TypeScript là "compile-time soft privacy", chỉ phục vụ type checker trong quá trình phát triển và hoàn toàn biến mất sau khi transpile sang JS. Bất kỳ ai cũng có thể truy cập bằng `obj['privateProp']`. `#private` của ECMAScript là "runtime hard privacy" được engine JavaScript thực thi ở cấp độ máy ảo, đảm bảo tính đóng gói tuyệt đối ngay cả khi chạy code ngoài trình thông dịch.

2. **Câu hỏi:** Mục đích của từ khóa `override` trong TypeScript là gì?
   - *Trả lời:* Từ khóa `override` đánh dấu rõ ràng rằng phương thức này cố tình ghi đè phương thức cùng tên ở lớp cha. Nếu phương thức ở lớp cha bị xóa hoặc đổi tên trong quá trình bảo trì, compiler sẽ báo lỗi `This member cannot have an 'override' modifier because it is not declared in the base class`, tránh việc phương thức ở lớp con vô tình trở thành một hàm mới độc lập.
