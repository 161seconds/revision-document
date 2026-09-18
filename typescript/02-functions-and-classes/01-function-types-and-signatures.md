# 01. Function Types & Signatures

Quy chuẩn định kiểu cho hàm, quản lý danh sách tham số và kỹ thuật Function Overloading trong TypeScript.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Union, Intersection & Narrowing](file:///d:/my-project/revision-document/typescript/01-types-and-interfaces/04-union-intersection-and-narrowing.md)
- **Tiếp theo:** [Classes & Access Modifiers](file:///d:/my-project/revision-document/typescript/02-functions-and-classes/02-classes-and-access-modifiers.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Cú Pháp Định Kiểu Hàm
Hàm trong TypeScript có thể định kiểu trực tiếp tại chỗ (inline) hoặc thông qua Type Alias / Interface:
```typescript
// Type Alias cho Function
type Transformer = (input: string, uppercase?: boolean) => string;

// Call Signature trong Interface
interface Comparator {
    (a: number, b: number): number;
}
```

### 2.2 Quản Lý Tham Số (Parameters)
1. **Optional Parameters (`?`):** Các tham số tùy chọn phải luôn đứng **sau** các tham số bắt buộc. Chúng tự động mang kiểu `T | undefined`.
2. **Default Parameters:** Tự động suy luận kiểu và cho phép bỏ qua khi gọi.
3. **Rest Parameters (`...rest: T[]`):** Thu thập số lượng đối số tùy ý vào một mảng định kiểu.

```typescript
function buildUrl(endpoint: string, port: number = 8080, ...queryParams: string[]): string {
    const query = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    return `http://api.local:${port}/${endpoint}${query}`;
}
```

### 2.3 Function Overloads (Nạp Chồng Hàm)
Trong JavaScript, không thể có nhiều hàm trùng tên với số lượng/kiểu tham số khác nhau như Java hay C++. TypeScript giải quyết bằng **Overload Signatures**:
- Khai báo 1 hoặc nhiều **Overload Signatures** mô tả các trường hợp gọi hợp lệ.
- Viết 1 **Implementation Signature** duy nhất để thực thi toàn bộ logic (chữ ký này bị ẩn với bên ngoài).

```
     ┌────────────────────────────────────────────────┐
     │ Overload 1: function parse(val: number): Date;  │
     ├────────────────────────────────────────────────┤
     │ Overload 2: function parse(val: string): Date;  │
     ├────────────────────────────────────────────────┤
     │ Implementation:                                │
     │ function parse(val: number | string): Date {   │
     │     return new Date(val);                      │
     │ }                                              │
     └────────────────────────────────────────────────┘
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Chữ ký Implementation không bao quát hết các Overload
Nếu kiểu tham số hoặc kiểu trả về của hàm thực thi hẹp hơn bất kỳ overload signature nào, TypeScript sẽ ném lỗi ngay:
```typescript
// ❌ LỖI BIÊN DỊCH:
function processInput(x: string): string;
function processInput(x: number): number;
function processInput(x: string): any { ... } // Lỗi: Implementation signature không tương thích với overload nhận number!
```
**Quy tắc:** Kiểu của tham số trong hàm thực thi phải là Union của tất cả các overload tương ứng: `x: string | number`.

### Bẫy 2: Thứ tự khai báo Overloads từ chung đến riêng
TypeScript duyệt danh sách overloads từ trên xuống dưới và dừng lại ở chữ ký đầu tiên khớp:
- Luôn đặt chữ ký **chuyên biệt hơn (specific)** lên trước, chữ ký **tổng quát hơn (general)** xuống dưới.

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern: Chữ ký Overload cho hàm truy vấn Database
interface User { id: string; name: string }

function queryUsers(id: string): User;
function queryUsers(limit: number, offset: number): User[];
function queryUsers(param1: string | number, param2?: number): User | User[] {
    if (typeof param1 === "string") {
        return { id: param1, name: `User_${param1}` };
    }
    const limit = param1;
    const offset = param2 ?? 0;
    return Array.from({ length: limit }, (_, i) => ({
        id: `user_${offset + i}`,
        name: `User ${offset + i}`
    }));
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Function Overloading trong TypeScript khác gì so với Function Overloading trong Java/C++?
   - *Trả lời:* Trong Java/C++, mỗi overload tạo ra một phương thức riêng biệt trong mã máy/bytecode với signature riêng, và runtime sẽ dispatch tới phương thức tương ứng. Trong TypeScript, tất cả các overload signatures biến mất hoàn toàn khi compile ra JS; chỉ còn lại **duy nhất một hàm** trong JS thực thi toàn bộ logic bằng cách kiểm tra kiểu động tại runtime.

2. **Câu hỏi:** Tại sao `void` trong callback function signature lại cho phép hàm truyền vào trả về giá trị (ví dụ: `[1, 2].forEach(x => x * 2)`)?
   - *Trả lời:* Đây là thiết kế có chủ đích của TypeScript gọi là *Substitutability*. Khai báo kiểu trả về `void` cho callback có nghĩa là: *"Người gọi hàm sẽ hoàn toàn phớt lờ giá trị trả về của bạn"*. Điều này cho phép truyền các hàm như `Array.prototype.push` làm callback mà không gây lỗi biên dịch chỉ vì hàm đó trả về một số (độ dài mảng).
