# Module 04: Performance & Advanced

Chào mừng bạn đến với **Module 04: Performance & Advanced**. Đây là chặng đỉnh cao trong kho tàng kiến thức React, nơi bạn vén bức màn bí mật bên trong bộ máy kiến trúc Fiber Reconciler, cơ chế Double Buffering, tách nhỏ gói mã nguồn (Code Splitting) với `React.lazy` và `Suspense`, thiết kế hàng rào hứng lỗi (Error Boundaries) chống sập ứng dụng, và các đột phá công nghệ mới nhất trong React 18 & 19 (Concurrent Transitions, `useTransition`, `useDeferredValue`, React Server Components và Server Actions).

---

## Bản Đồ Học Tập (Learning Roadmap)

| Bài học | Nội dung cốt lõi | Mục tiêu đạt được |
| :--- | :--- | :--- |
| **[01. Reconciliation & Fiber](file:///d:/my-project/revision-document/react/04-performance-and-advanced/01-reconciliation-and-fiber.md)** | Fiber Architecture, Đơn vị công việc (Unit of Work), Con trỏ `child`/`sibling`/`return`, Thuật toán Diffing $O(n)$, Kỹ thuật Double Buffering | Hiểu tường tận cách React phân mảnh thời gian (Time-slicing) để không làm đơ giao diện. |
| **[02. Code Splitting & Suspense](file:///d:/my-project/revision-document/react/04-performance-and-advanced/02-code-splitting-and-suspense.md)** | Dynamic Import `import()`, `React.lazy`, Thẻ `<Suspense>`, Fallback UI, Tối ưu hóa First Contentful Paint (FCP) | Giảm thiểu 60-80% dung lượng Bundle ban đầu bằng cách tải trang theo nhu cầu thực tế. |
| **[03. Error Boundaries & Resilience](file:///d:/my-project/revision-document/react/04-performance-and-advanced/03-error-boundaries-and-resilience.md)** | Error Boundary Class Component, `componentDidCatch`, `getDerivedStateFromError`, Cách bắt lỗi Async và Event Handlers | Bảo vệ ứng dụng khỏi màn hình trắng chết chóc (White Screen of Death) khi có lỗi render. |
| **[04. React 18 & 19 Modern Features](file:///d:/my-project/revision-document/react/04-performance-and-advanced/04-react18-19-modern-features.md)** | `useTransition`, `useDeferredValue`, Server Components (RSC) vs Client Components, Actions trong React 19 | Làm chủ các mẫu hình phát triển Fullstack React hiện đại chuẩn tương lai. |

---

## File Thực Hành & Kiểm Thử Tự Động

- **File Demo Tổng Hợp**: [advanced_demo.mjs](file:///d:/my-project/revision-document/react/04-performance-and-advanced/advanced_demo.mjs) — Mô phỏng Fiber Tree Traversal, Lazy Suspense Promise và Error Boundary trên Node.js v22.
- **File Tự Luyện & Chấm Điểm**: [practice.mjs](file:///d:/my-project/revision-document/react/04-performance-and-advanced/practice.mjs) — Bộ 5 bài tập thuật toán Reconciler & Transitions kèm assertions tự động chấm qua `node:assert`.

---

## 3 Bẫy Phỏng Vấn Kinh Điển Cần Nhớ

1. **Error Boundary không bắt được lỗi trong Event Handlers**: Error Boundary chỉ bắt các lỗi xảy ra trong quá trình **Render Phase, Lifecycle methods, và Constructors**. Các lỗi xảy ra khi click button (`onClick`) hay trong `setTimeout` phải được bắt bằng `try-catch` truyền thống.
2. **`useTransition` vs `debounce`**: Debounce làm trì hoãn việc gửi yêu cầu cập nhật sau một khoảng thời gian cố định. `useTransition` bắt đầu thực hiện cập nhật ngay lập tức nhưng với mức độ ưu tiên thấp (Interruptible), sẵn sàng bị hủy hoặc nhường CPU nếu người dùng tiếp tục thao tác.
3. **Fiber Reconciler chuyển từ Call Stack sang Linked List**: Trước React 16 (Stack Reconciler), việc render là đệ quy đồng bộ không thể dừng lại giữa chừng. Fiber Reconciler chuyển đổi toàn bộ cây thành Linked List để có thể tạm dừng, ưu tiên hóa và tiếp tục công việc tại bất kỳ thời điểm nào.
