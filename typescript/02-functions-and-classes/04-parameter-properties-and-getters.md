# 04. Parameter Properties & Getters

Kỹ thuật viết tắt hàm khởi tạo (Parameter Properties), kiểm soát truy cập qua Getters/Setters và các thành viên tĩnh (Static) trong TypeScript.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Abstract Classes & Implements](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/03-abstract-classes-and-implements.md)
- **Tiếp theo:** [Module 03: Generics & Utility Types](file:///d:/my-project/revision-document/typescript/03-generics-and-utility-types/README.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Parameter Properties (Constructor Shorthand)
Trong JavaScript/TypeScript truyền thống, việc khai báo thuộc tính và gán lại trong constructor thường lặp đi lặp lại rất tốn dòng:
```typescript
// CÁCH TRUYỀN THỐNG: 3 lần lặp lại tên trường
class ServiceVerbose {
    public endpoint: string;
    private retries: number;
    constructor(endpoint: string, retries: number) {
        this.endpoint = endpoint;
        this.retries = retries;
    }
}
```

TypeScript cung cấp cú pháp **Parameter Properties**: Chỉ cần gắn `public`, `private`, `protected` hoặc `readonly` ngay trước tham số của `constructor`. Trình biên dịch sẽ **tự động khai báo trường trên class** và **tự động gán `this.prop = prop`** trong thân hàm:
```typescript
// CÁCH SHORTHAND TINH GỌN:
class ServiceClean {
    constructor(
        public endpoint: string,
        private retries: number = 3,
        public readonly apiKey: string = "secret"
    ) {}
}
```

### 2.2 Getters & Setters (Accessors)
- TypeScript hỗ trợ cú pháp `get` và `set` để bọc lớp bảo vệ nghiệp vụ xung quanh việc đọc/ghi thuộc tính.
- **Bản chất Under the Hood:** Bộ biên dịch sinh ra `Object.defineProperty(...)` khi target xuống ES5 hoặc dùng native accessor trong ES6+.
- **Quy tắc Type Inference:** Nếu một thuộc tính chỉ có `get` mà không có `set`, TypeScript sẽ **tự động suy luận trường đó là `readonly`**!

```typescript
class Temperature {
    private _celsius: number = 0;

    get celsius(): number {
        return this._celsius;
    }

    set celsius(value: number) {
        if (value < -273.15) {
            throw new RangeError("Temperature below absolute zero is impossible!");
        }
        this._celsius = value;
    }

    // Chỉ có get -> tự động là readonly
    get fahrenheit(): number {
        return (this._celsius * 9) / 5 + 32;
    }
}
```

### 2.3 Static Members & Static Blocks
- Thành viên `static` thuộc về chính Constructor Function/Class chứ không thuộc về từng instance riêng lẻ.
- **Static Blocks (ES2022 / TS 4.4+):** Khối mã chạy một lần duy nhất khi Class được load vào bộ nhớ, cho phép khởi tạo logic phức tạp hoặc bắt ngoại lệ cho các biến tĩnh:
  ```typescript
  class DatabaseDriver {
      static defaultPoolSize: number;

      static {
          try {
              DatabaseDriver.defaultPoolSize = 20;
          } catch {
              DatabaseDriver.defaultPoolSize = 5;
          }
      }
  }
  ```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên `super(...)` trong lớp con khi dùng Parameter Properties
Khi kế thừa một lớp cha có constructor nhận tham số, nếu lớp con dùng Parameter Properties mà quên gọi `super(...)`, TypeScript sẽ báo lỗi cú pháp ngay:
```typescript
class Parent {
    constructor(public id: string) {}
}

class Child extends Parent {
    // ❌ Lỗi nếu thiếu super(id)
    constructor(id: string, public extra: number) {
        super(id); // BẮT BUỘC phải gọi đầu tiên
    }
}
```

### Bẫy 2: Kiểu dữ liệu của Getter và Setter không đồng nhất
Trong TypeScript < 4.3, kiểu của `get` và `set` bắt buộc phải giống hệt nhau. Từ TS 4.3+, Setter có thể nhận kiểu rộng hơn Getter, nhưng Getter phải gán được vào kiểu của Setter.

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern: Dependency Injection Controller với Parameter Properties & Static Factory
export interface Logger {
    info(msg: string): void;
}

export class OrderController {
    // Shorthand tiêm phụ thuộc dependency injection
    constructor(
        private readonly logger: Logger,
        private readonly maxOrdersPerUser: number = 10
    ) {}

    // Static Factory Method
    public static createDefault(logger: Logger): OrderController {
        return new OrderController(logger, 5);
    }

    public process(userId: string): boolean {
        this.logger.info(`Processing order for user: ${userId}`);
        return true;
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Parameter Properties trong TypeScript là gì và trình biên dịch sinh ra mã gì tương ứng trong JavaScript?
   - *Trả lời:* Parameter Properties là cú pháp viết tắt cho phép khai báo trực tiếp access modifier (`public`, `private`, `protected`, `readonly`) vào danh sách tham số của `constructor`. Trình biên dịch TypeScript sẽ tự động sinh ra hai việc trong file JS: (1) Khai báo thuộc tính trên lớp đối tượng, và (2) Thêm lệnh gán `this.paramName = paramName;` vào đầu thân hàm constructor.

2. **Câu hỏi:** Khi một thuộc tính chỉ khai báo `get` mà không có `set`, TypeScript áp dụng quy tắc gì cho thuộc tính đó?
   - *Trả lời:* TypeScript tự động suy luận thuộc tính đó có tính chất `readonly`. Mọi thao tác gán giá trị từ bên ngoài (ví dụ `instance.prop = value`) sẽ bị trình biên dịch chặn lại và báo lỗi `Cannot assign to 'prop' because it is a read-only property`.
