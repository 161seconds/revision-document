# React Revision Guide

Lộ trình và kho tài liệu ôn tập React toàn diện từ cú pháp JSX, Virtual DOM, Functional Components, Props Contract, Toàn bộ bảng tra cứu Hooks, Quản lý State nâng cao với Context & Reducer, Kiến trúc lõi Fiber Reconciler, Tối ưu hóa hiệu năng và các tính năng đột phá trong React 18 & 19.

---

## Danh Mục Các Module Học Tập

| Thư mục / Tài liệu | Nội dung trọng tâm | Trạng thái |
| :--- | :--- | :--- |
| **[summary.md](file:///d:/my-project/revision-document/react/summary.md)** | **Bảng tóm tắt toàn diện (Master React Cheat Sheet)** bao quát toàn bộ Hooks, Fiber, Render & Commit Phases, Performance Checklist | Hoàn thành |
| **[01-components-and-props/](file:///d:/my-project/revision-document/react/01-components-and-props/README.md)** | JSX & Virtual DOM, Functional Components, Props Destructuring, Conditional Rendering, List & Key, Synthetic Events | Sẵn sàng |
| **[02-hooks-and-state/](file:///d:/my-project/revision-document/react/02-hooks-and-state/README.md)** | `useState` & Batching, `useEffect` & Lifecycle Phasing, `useRef` & DOM access, `useMemo` & `useCallback`, Referential Equality | Sẵn sàng |
| **[03-state-management-and-context/](file:///d:/my-project/revision-document/react/03-state-management-and-context/README.md)** | `useReducer` cho State phức tạp, Context API & Provider Pattern, Thiết kế Custom Hooks tái sử dụng, Giới thiệu External Stores | Sẵn sàng |
| **[04-performance-and-advanced/](file:///d:/my-project/revision-document/react/04-performance-and-advanced/README.md)** | Fiber Architecture & Diffing Algorithm, Code Splitting với `React.lazy` & `Suspense`, Error Boundaries, React 18 Concurrent Transitions | Sẵn sàng |

---

## Chuẩn Cấu Trúc Của Từng Thư Mục Con

Mỗi module trong hệ thống ôn tập bao gồm:
1. `README.md`: Lộ trình chi tiết + **Bản đồ liên kết bài học (Knowledge Links)** + Bẫy phỏng vấn.
2. Các bài học lý thuyết `.md`: Tuân thủ 5 mục chuẩn (Bản đồ liên kết, Bản chất hoạt động, Bẫy kinh điển, Code thực hành, Câu hỏi phỏng vấn tự kiểm tra).
3. Các file demo `.mjs`: Mô phỏng và thực thi chính xác cơ chế React trực tiếp trên Node.js v22.
4. `practice.mjs`: Bộ câu hỏi và thử thách tự động chấm điểm với 100% assertions sử dụng thư viện chuẩn `node:assert`.

---

## Bản Đồ Liên Kết
- **Tiên quyết:** [JavaScript Fundamentals](file:///d:/my-project/revision-document/javascript/01-fundamentals/README.md), [TypeScript Guide](file:///d:/my-project/revision-document/typescript/README.md)
- **Tiếp theo:** Next.js Fullstack Framework, React Server Components (RSC), State Libraries (Zustand, TanStack Query).
