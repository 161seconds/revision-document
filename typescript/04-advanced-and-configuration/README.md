# Module 04: Advanced & Configuration

Chào mừng bạn đến với **Module 04: Advanced & Configuration**. Đây là chặng cuối trong hành trình làm chủ TypeScript, nơi bạn tiếp cận các kỹ thuật phòng thủ kiểu ở mức độ chuyên gia: User-Defined Type Guards (`arg is Type`), Assertion Functions (`asserts condition`), kiến trúc bộ biên dịch qua file cấu hình `tsconfig.json` chuẩn doanh nghiệp, cách viết file khai báo ambient (`.d.ts`), và các mẫu hình thể dục kiểu (Type Gymnastics: Branded Types, Nominal Typing) giúp ngăn chặn lỗi nghiệp vụ ngay từ cấp độ kiểu dữ liệu.

---

## Bản Đồ Học Tập (Learning Roadmap)

| Bài học | Nội dung cốt lõi | Mục tiêu đạt được |
| :--- | :--- | :--- |
| **[01. Type Guards & Predicates](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/01-type-guards-and-predicates.md)** | User-defined Type Guards (`val is Type`), Assertion Signatures (`asserts val is Type`), Exhaustiveness checking với `never` | Viết các hàm kiểm tra logic nghiệp vụ tại runtime và tự động narrow kiểu dữ liệu cho toàn bộ block code phía sau. |
| **[02. tsconfig & Compiler Architecture](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/02-tsconfig-and-compiler-architecture.md)** | Cấu trúc file `tsconfig.json`, `strict` family (`noImplicitAny`, `strictNullChecks`, `exactOptionalPropertyTypes`), Path Aliases (`@/*`) | Tối ưu hóa cấu hình build dự án chuẩn Production, cân bằng giữa độ chặt chẽ của kiểu và tốc độ biên dịch. |
| **[03. Declaration Files & Ambient Types](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/03-declaration-files-and-ambient.md)** | `.d.ts`, Từ khóa `declare`, Module Augmentation, Ambient Namespaces, Typing cho thư viện JavaScript thuần | Tự viết type definition cho các thư viện cũ không có TypeScript hoặc mở rộng các types toàn cục (Window, Express). |
| **[04. Type Gymnastics & Best Practices](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/04-type-gymnastics-and-best-practices.md)** | Branded/Nominal Types (chống nhầm UserId và OrderId), Opaque Types, Tuyệt đối tránh `any`, Chiến lược di chuyển dự án từ JS sang TS | Áp dụng các mẫu hình thiết kế nâng cao giúp code base tự chứng minh tính đúng đắn về mặt logic. |

---

## File Thực Hành & Kiểm Thử Tự Động

- **File Demo Tổng Hợp**: [advanced_demo.ts](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/advanced_demo.ts) — Chạy trực tiếp qua Node.js v22.
- **File Tự Luyện & Chấm Điểm**: [practice.ts](file:///d:/my-project/revision-document/typescript/04-advanced-and-configuration/practice.ts) — Bộ 5 bài tập Type Guards & Nominal Types kèm assertions tự động chấm qua `node:assert`.

---

## 3 Bẫy Phỏng Vấn Kinh Điển Cần Nhớ

1. **User-Defined Type Guard nói dối Compiler**: Nếu trong hàm `function isString(x: any): x is string { return true; }`, bạn trả về `true` cho một số, TypeScript vẫn tin bạn 100% và coi nó là chuỗi. Trình biên dịch không thể kiểm tra tính đúng đắn logic của thân hàm type guard.
2. **`skipLibCheck: true`**: Cờ này giúp tăng tốc độ biên dịch gấp nhiều lần bằng cách bỏ qua việc kiểm tra kiểu của các file `.d.ts` trong `node_modules`. Đây là tiêu chuẩn vàng cho mọi dự án lớn.
3. **Branded Types giải quyết Primitive Obsession**: TypeScript sử dụng Structural Typing (hai kiểu có cùng cấu trúc thì tương thích với nhau). Do đó `UserId` (`string`) và `PostId` (`string`) có thể vô tình gán lẫn lộn cho nhau. Dùng Branded Type (`string & { readonly __brand: unique symbol }`) biến chúng thành Nominal Types không thể gán chéo.
