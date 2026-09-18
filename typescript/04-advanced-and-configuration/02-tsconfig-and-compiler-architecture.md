# 02. tsconfig & Compiler Architecture

Giải phẫu kiến trúc bộ biên dịch `tsc`, các nhóm cờ `strict` sống còn và cấu hình đường dẫn Path Aliases trong `tsconfig.json`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Type Guards & Predicates](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/01-type-guards-and-predicates.md)
- **Tiếp theo:** [Declaration Files & Ambient Types](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/03-declaration-files-and-ambient.md)
- **Tổng hợp:** [TypeScript Master Cheat Sheet](file:///d:/my-project/revision-document/typescript/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Kiến Trúc 5 Giai Đoạn Của Trình Biên Dịch TypeScript (`tsc`)
```
Source (.ts) ──> [Scanner] ──> Tokens
                   │
                   ▼
               [Parser] ──> AST (Abstract Syntax Tree)
                   │
                   ▼
               [Binder] ──> Symbol Table (Ánh xạ khai báo biến/hàm)
                   │
                   ▼
              [Checker] ──> Type Validation (Kiểm tra kiểu dữ liệu)
                   │
                   ▼
              [Emitter] ──> Output (.js + .d.ts + .js.map)
```

### 2.2 Họ Cờ `strict: true` (Strict Family)
Bật `"strict": true` sẽ đồng thời kích hoạt toàn bộ các cờ an toàn sau:
1. **`noImplicitAny: true`**: Cấm suy luận ngầm một biến thành kiểu `any` nếu không thể xác định được kiểu.
2. **`strictNullChecks: true`**: Tách biệt `null` và `undefined` khỏi tất cả các kiểu khác. `string` không thể nhận giá trị `null` trừ khi khai báo rõ `string | null`.
3. **`strictFunctionTypes: true`**: Kiểm tra tham số của hàm theo luật Contra-variance thay vì Bivariance (ngăn ngừa truyền hàm nhận kiểu hẹp hơn vào nơi yêu cầu kiểu rộng hơn).
4. **`strictBindCallApply: true`**: Kiểm tra kiểu chặt chẽ khi gọi `.bind()`, `.call()`, `.apply()`.
5. **`strictPropertyInitialization: true`**: Bắt buộc mọi thuộc tính của Class phải được gán giá trị tại nơi khai báo hoặc trong `constructor`.
6. **`noImplicitThis: true`**: Báo lỗi nếu từ khóa `this` có kiểu ngầm định là `any`.
7. **`useUnknownInCatchVariables: true`**: Biến lỗi trong khối `catch(err)` tự động có kiểu `unknown` thay vì `any`.

### 2.3 Cấu Hình Path Aliases
Để tránh việc import tương đối rối rắm như `../../../components/Button`, ta cấu hình:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên rằng `paths` trong `tsconfig` không tự giải quyết ở Runtime
`tsconfig.json` chỉ thông báo cho TypeScript Compiler và IDE hiểu đường dẫn `@/*`. Khi chạy ở runtime Node.js thuần, Node sẽ không tự hiểu alias này và báo lỗi `Cannot find module '@/...'`.
**Giải pháp:** Sử dụng Bundler (Vite, Webpack, esbuild) hoặc loader như `tsconfig-paths` / subpath imports trong `package.json` (`#imports`).

### Bẫy 2: `skipLibCheck: false` làm build chậm gấp 10 lần
Nếu không bật `skipLibCheck: true`, `tsc` sẽ phân tích và kiểm tra toàn bộ file `.d.ts` của tất cả các thư viện bên thứ 3 trong `node_modules`. Nếu hai thư viện dùng các phiên bản kiểu xung đột, quá trình build sẽ thất bại ngoài ý muốn.

---

## 4. Code Thực Hành (Production Patterns)

```json
// File tsconfig.base.json chuẩn Enterprise
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "isolatedModules": true
  }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Cờ `isolatedModules: true` có ý nghĩa gì và tại sao các công cụ hiện đại như Babel, esbuild, SWC lại yêu cầu bật cờ này?
   - *Trả lời:* Các công cụ chuyển mã siêu tốc như esbuild, SWC hoặc Babel biên dịch từng file mã nguồn một cách độc lập (single-file transpilation) mà không nạp toàn bộ cây kiểu của dự án vào bộ nhớ. Do đó, các cú pháp TypeScript dựa vào kiến thức toàn cục như `const enum` hoặc `export { SomeType }` (không có từ khóa `type`) sẽ làm các công cụ này bị lỗi. Bật `isolatedModules: true` buộc `tsc` cảnh báo ngay khi bạn viết các cú pháp không thể biên dịch độc lập theo từng file.

2. **Câu hỏi:** Cờ `exactOptionalPropertyTypes: true` (TS 4.4+) giải quyết vấn đề gì giữa `{ prop?: string }` và `{ prop?: string | undefined }`?
   - *Trả lời:* Mặc định, `{ prop?: string }` cho phép bạn gán `prop: undefined`. Khi bật `exactOptionalPropertyTypes: true`, bạn chỉ có thể chọn **truyền thuộc tính kiểu chuỗi** hoặc **hoàn toàn không khai báo thuộc tính đó (vắng mặt key)**. Bạn sẽ không được phép gán tường minh `{ prop: undefined }`, giúp phản ánh chính xác ngữ nghĩa của toán tử `in` hoặc `Object.hasOwn()`.
