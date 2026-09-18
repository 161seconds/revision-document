# 02. Arrays, Tuples & Enums

Các cấu trúc dữ liệu tuần tự và tập hợp hằng số có tên trong TypeScript.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Primitive & Special Types](file:///d:/my-project/revision-document/typescript/01-types-and-interfaces/01-primitive-and-special-types.md)
- **Tiếp theo:** [Type Aliases & Interfaces](file:///d:/my-project/revision-document/typescript/01-types-and-interfaces/03-type-aliases-and-interfaces.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Mảng (Arrays) & Tính Bất Biến (Readonly)
Trong TypeScript, mảng có thể khai báo bằng cú pháp `T[]` hoặc generic `Array<T>`.
- Mặc định, mảng trong JS/TS có tính biến đổi (mutable).
- Để bảo vệ dữ liệu không bị sửa đổi ngoài ý muốn, TypeScript cung cấp:
  - `readonly T[]` hoặc `ReadonlyArray<T>`.
  - Từ khóa `as const` (Const Assertions) biến mảng thành readonly tuple với các phần tử là Literal Types.

```typescript
const normalArr: number[] = [1, 2];
normalArr.push(3); // Hợp lệ

const locked: readonly number[] = [1, 2];
// locked.push(3); // ❌ Lỗi biên dịch: Property 'push' does not exist on type 'readonly number[]'

const literalTuple = [10, "USD"] as const; // readonly [10, "USD"]
```

### 2.2 Tuples (Mảng có cấu trúc cố định)
Tuple là một mảng có số lượng phần tử cố định và kiểu dữ liệu tại từng vị trí được định nghĩa rõ ràng.
- **Named Tuples (TS 4.0+):** Cho phép đặt tên nhãn cho từng phần tử giúp tăng tính dễ đọc (self-documenting):
  ```typescript
  type GeoPoint = [latitude: number, longitude: number, altitude?: number];
  ```
- **Rest Elements trong Tuple:** Cho phép tạo tuple có độ dài linh hoạt ở cuối:
  ```typescript
  type StringAndNumbers = [string, ...number[]];
  const item: StringAndNumbers = ["ID_1", 10, 20, 30];
  ```

### 2.3 Enums & Mã Sinh Ra (Compilation Artifacts)
1. **Numeric Enum:**
   ```typescript
   enum Direction { Up = 0, Down = 1 }
   ```
   Biên dịch ra JS thành đối tượng 2 chiều (Reverse Mapping):
   ```javascript
   var Direction;
   (function (Direction) {
       Direction[Direction["Up"] = 0] = "Up";
       Direction[Direction["Down"] = 1] = "Down";
   })(Direction || (Direction = {}));
   ```
   Do đó: `Direction.Up === 0` và `Direction[0] === "Up"`.

2. **String Enum:** Không có reverse mapping, giá trị tường minh, an toàn khi gỡ lỗi hoặc truyền qua network:
   ```typescript
   enum LogLevel { Info = "INFO", Warn = "WARN", Error = "ERROR" }
   ```

3. **Const Enum:** Bị compiler loại bỏ hoàn toàn khỏi output JS, thay thế trực tiếp giá trị inline tại nơi gọi để tối ưu dung lượng bundle:
   ```typescript
   const enum Status { Active = 1, Inactive = 0 }
   const current = Status.Active; // Biên dịch thành: const current = 1;
   ```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Numeric Enum chấp nhận mọi con số tùy tiện
Trong TypeScript, numeric enum không kiểm tra chặt chẽ giá trị số ngoài biên:
```typescript
enum StatusCode { Success = 200, NotFound = 404 }
let code: StatusCode = 9999; //  HỢP LỆ trong TS mà không báo lỗi!
```
**Giải pháp:** Sử dụng **String Enums** hoặc **Union của String Literals**:
```typescript
type StatusCode = 200 | 404;
// let code: StatusCode = 9999; // ❌ Báo lỗi biên dịch ngay lập tức!
```

### Bẫy 2: Tuples vẫn có thể bị `push` làm tràn bộ nhớ runtime
Do tuple trong JS thuần vẫn là mảng thông thường, hàm `push` có thể lách qua kiểm tra nếu không dùng `readonly`:
```typescript
const point: [number, number] = [10, 20];
point.push(30); // ❌ Vẫn chạy được ở runtime, làm hỏng độ dài 2 phần tử của tuple!

//  Giải pháp triệt để:
const safePoint: readonly [number, number] = [10, 20];
// safePoint.push(30); // ❌ Compile error: push does not exist
```

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern 1: Bảng mã trạng thái bất biến với "as const" (Thay thế hoàn hảo cho Enum)
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
} as const;

// Trích xuất Type an toàn từ Object hằng số
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
// Kiểu kết quả: 200 | 201 | 400 | 401 | 404 | 500

function handleResponse(code: HttpStatusCode) {
    if (code === HTTP_STATUS.OK) {
        return "Success";
    }
    return "Error";
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** So sánh giữa `enum` và `Union of String Literals` (`type Status = "ACTIVE" | "INACTIVE"`). Tại sao cộng đồng TS hiện đại thường ưu tiên Union literals?
   - *Trả lời:* `enum` sinh thêm mã JS runtime (IIFE closure cho numeric enum), làm tăng kích thước bundle và gây khó khăn cho việc Tree-Shaking. Numeric enum còn gặp lỗi chấp nhận số tùy ý ngoài tập giá trị. Ngược lại, Union of String Literals hoàn toàn là type-only (0 bytes runtime output), kiểm tra chặt chẽ 100% lúc biên dịch và tương thích hoàn hảo với JSON serialization.

2. **Câu hỏi:** Toán tử `as const` hoạt động như thế nào khi áp dụng lên mảng hoặc đối tượng?
   - *Trả lời:* `as const` khóa toàn bộ thuộc tính của đối tượng/mảng thành `readonly`, đồng thời hạ bậc suy luận kiểu từ kiểu mở rộng (`string`, `number`) xuống chính xác giá trị cụ thể (Literal Types). Ví dụ: `[1, "ok"]` trở thành `readonly [1, "ok"]`.
