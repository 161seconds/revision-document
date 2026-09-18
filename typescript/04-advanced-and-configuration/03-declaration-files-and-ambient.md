# 03. Declaration Files & Ambient Types

Kỹ thuật viết file khai báo kiểu `.d.ts`, từ khóa `declare`, mở rộng kiểu toàn cục (Module Augmentation) và tích hợp thư viện JavaScript thuần.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [tsconfig & Compiler Architecture](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/02-tsconfig-and-compiler-architecture.md)
- **Tiếp theo:** [Type Gymnastics & Best Practices](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/04-type-gymnastics-and-best-practices.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 File Khai Báo `.d.ts` Là Gì?
File `.d.ts` (Declaration File) là file chứa **100% siêu dữ liệu kiểu (Type Metadata)** mà không chứa bất kỳ dòng mã thực thi nào.
- Trình biên dịch TypeScript không sinh ra file JS từ các file `.d.ts`.
- Chúng đóng vai trò như một "hợp đồng giao tiếp", giúp TypeScript hiểu được kiểu dữ liệu của các thư viện viết bằng JavaScript thuần (như Lodash, jQuery) hoặc các biến môi trường toàn cục được nhúng ngoài HTML (`window.analytics`).

### 2.2 Từ Khóa `declare`
Từ khóa `declare` thông báo với TypeScript: *"Biến/Hàm/Lớp này đã tồn tại ở Runtime do một bên thứ ba cung cấp, đừng báo lỗi không tìm thấy tên!"*:

```typescript
// Khai báo biến toàn cục từ thẻ <script>
declare const __APP_VERSION__: string;
declare function trackMetric(metricName: string, value: number): void;
```

### 2.3 Module Augmentation (Mở Rộng Module Có Sẵn)
Một trong những ứng dụng phổ biến nhất của `.d.ts` là bổ sung thêm thuộc tính vào các thư viện bên ngoài mà không cần sửa mã nguồn gốc của thư viện đó:

```typescript
// file: express-custom.d.ts
import "express";

declare module "express-serve-static-core" {
    interface Request {
        user?: {
            id: string;
            role: "admin" | "user";
        };
    }
}
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Biến file `.d.ts` thành Module ngoài ý muốn
Trong TypeScript, nếu một file `.d.ts` có chứa bất kỳ câu lệnh `import` hoặc `export` ở cấp cao nhất (top-level), file đó sẽ lập tức được coi là một **Module File** thay vì **Ambient Script**.
Hệ quả: Mọi khai báo `declare const` toàn cục bên trong nó sẽ không còn mang tính toàn cục nữa!
**Giải pháp:** Dùng cú pháp `declare global { ... }` nếu file có chứa `import`:
```typescript
import { User } from "./models";

declare global {
    interface Window {
        currentUser?: User;
    }
}
```

---

## 4. Code Thực Hành (Production Patterns)

```typescript
// Pattern: Khai báo Types cho các tài nguyên không phải code (Static Assets)
// file: env-declarations.d.ts
declare module "*.svg" {
    const content: string;
    export default content;
}

declare module "*.png" {
    const content: string;
    export default content;
}

declare module "*.css" {
    const classes: { readonly [key: string]: string };
    export default classes;
}

// Khai báo biến môi trường Node.js ProcessEnv
declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "development" | "production" | "test";
        PORT?: string;
        DATABASE_URL: string;
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Declaration File (`.d.ts`) khác gì so with file mã nguồn TypeScript thông thường (`.ts`)?
   - *Trả lời:* File `.ts` chứa cả định nghĩa kiểu lẫn mã thực thi (logic, hàm, class) và sẽ được biên dịch thành mã JavaScript tương ứng. File `.d.ts` chỉ chứa khai báo kiểu thuần túy (interfaces, type aliases, declare function/var), hoàn toàn không sinh ra mã thực thi và bị loại bỏ khỏi luồng output JS, phục vụ riêng cho IDE autocomplete và trình kiểm tra kiểu lúc biên dịch.

2. **Câu hỏi:** Cơ chế hoạt động của kho lưu trữ `@types` (DefinitelyTyped) trên npm là gì?
   - *Trả lời:* Khi một thư viện JavaScript không được viết bằng TypeScript và tác giả không đính kèm file `.d.ts`, cộng đồng sẽ đóng góp các định nghĩa kiểu vào kho DefinitelyTyped. Khi cài đặt qua `npm i -D @types/library-name`, các file `.d.ts` sẽ được đặt trong thư mục `node_modules/@types/`. TypeScript Compiler mặc định tự động quét thư mục `@types` này để gán kiểu dữ liệu cho thư viện tương ứng.
