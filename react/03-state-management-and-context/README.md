# Module 03: State Management & Context

Chào mừng bạn đến với **Module 03: State Management & Context**. Khi ứng dụng mở rộng quy mô, việc truyền dữ liệu qua nhiều tầng trung gian (Prop Drilling) và quản lý các trạng thái phức tạp với nhiều logic chuyển giao sẽ trở nên quá tải nếu chỉ dùng `useState`. Module này sẽ trang bị cho bạn mô hình Reducer chuẩn kiến trúc Flux (`useReducer`), cơ chế chia sẻ dữ liệu toàn cục với Context API, cách thiết kế các Custom Hooks tái sử dụng cao và giới thiệu kiến trúc External Store (`useSyncExternalStore`) nền tảng của Zustand và Redux.

---

## Bản Đồ Học Tập (Learning Roadmap)

| Bài học | Nội dung cốt lõi | Mục tiêu đạt được |
| :--- | :--- | :--- |
| **[01. useReducer & Complex State](file:///d:/my-project/revision-document/react/03-state-management-and-context/01-usereducer-and-complex-state.md)** | `useReducer`, Pure Reducer Function, Action Creators, Dispatcher, So sánh khi nào dùng `useState` vs `useReducer` | Gom toàn bộ logic cập nhật trạng thái phức tạp vào một hàm thuần khiết dễ kiểm thử. |
| **[02. Context API & Composition](file:///d:/my-project/revision-document/react/03-state-management-and-context/02-context-api-and-composition.md)** | `createContext`, `useContext`, Provider Pattern, Giải quyết Prop Drilling, Vấn đề Re-render toàn bộ Consumer và cách khắc phục | Chia sẻ trạng thái toàn cục (Theme, Auth, Language) an toàn, tối ưu hóa tái kết xuất. |
| **[03. Custom Hooks & Reusability](file:///d:/my-project/revision-document/react/03-state-management-and-context/03-custom-hooks-and-reusability.md)** | Nguyên lý thiết kế Custom Hook, Tách biệt UI và Business Logic, Các hook thực tế (`useFetch`, `useDebounce`, `useLocalStorage`) | Tái sử dụng logic nghiệp vụ qua nhiều component mà không làm trùng lặp mã nguồn. |
| **[04. External Store & Zustand](file:///d:/my-project/revision-document/react/03-state-management-and-context/04-external-store-and-zustand.md)** | `useSyncExternalStore`, Publish-Subscribe Pattern, Giới thiệu thư viện quản lý state nhẹ (Zustand) | Hiểu cách các thư viện Global State giao tiếp với React Concurrent Mode mà không bị rách giao diện (Tearing). |

---

## File Thực Hành & Kiểm Thử Tự Động

- **File Demo Tổng Hợp**: [state_demo.mjs](file:///d:/my-project/revision-document/react/03-state-management-and-context/state_demo.mjs) — Mô phỏng Reducer, Context Provider và Custom Hook trên Node.js v22.
- **File Tự Luyện & Chấm Điểm**: [practice.mjs](file:///d:/my-project/revision-document/react/03-state-management-and-context/practice.mjs) — Bộ 5 bài tập State Management kèm assertions tự động chấm qua `node:assert`.

---

## 3 Bẫy Phỏng Vấn Kinh Điển Cần Nhớ

1. **Context không phải là công cụ quản lý State**: Context bản chất chỉ là một "ống dẫn truyền dữ liệu" (Transport Mechanism) nhằm tránh Prop Drilling, nó không có cơ chế quản lý trạng thái riêng. Nếu giá trị truyền vào Context thay đổi, tất cả component tiêu thụ nó đều bị re-render.
2. **Reducer bắt buộc phải là Pure Function**: Không được gọi API, không dùng `Date.now()`, không dùng `Math.random()` và không mutate state trực tiếp bên trong Reducer.
3. **UI Tearing trong Concurrent React**: Khi cập nhật state từ một nguồn bên ngoài React (như Window store hoặc WebSocket), nếu không dùng `useSyncExternalStore`, các component khác nhau có thể render với dữ liệu tại các thời điểm khác nhau gây rách nát giao diện.
