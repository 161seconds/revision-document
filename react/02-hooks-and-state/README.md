# Module 02: Hooks & State

Chào mừng bạn đến với **Module 02: Hooks & State**. Đây là trái tim điều phối hành vi động của mọi ứng dụng React, giải quyết triệt để cơ chế bất biến của State, thuật toán Automatic Batching trong React 18, các giai đoạn vòng đời với `useEffect` (Mount, Update, Unmount, Cleanup), lưu trữ tham chiếu không gây re-render với `useRef`, và kỹ thuật ghi nhớ tối ưu hóa hiệu năng chuyên sâu với `useMemo` và `useCallback`.

---

## Bản Đồ Học Tập (Learning Roadmap)

| Bài học | Nội dung cốt lõi | Mục tiêu đạt được |
| :--- | :--- | :--- |
| **[01. useState & Batching](file:///d:/my-project/revision-document/react/02-hooks-and-state/01-usestate-and-batching.md)** | `useState`, Updater Function `prev => prev + 1`, Tính bất biến của Object State, React 18 Automatic Batching | Hiểu rõ vì sao `setCount` không cập nhật ngay và cách tránh bẫy Stale State khi cập nhật liên tiếp. |
| **[02. useEffect & Lifecycle](file:///d:/my-project/revision-document/react/02-hooks-and-state/02-useeffect-and-lifecycle.md)** | `useEffect`, Mảng phụ thuộc `[]`, Hàm dọn dẹp (Cleanup Function), Tránh vòng lặp vô hạn, AbortController | Nắm vững chu kỳ dọn dẹp timer/subscriptions và ngăn ngừa memory leak khi component unmount. |
| **[03. useRef & DOM Access](file:///d:/my-project/revision-document/react/02-hooks-and-state/03-useref-and-dom-access.md)** | `useRef`, Lưu trữ biến thay đổi mà không kích hoạt re-render, Thao tác DOM trực tiếp (Focus, Scroll), `forwardRef` | Phân biệt chính xác khi nào dùng `useState` (gây re-render) và khi nào dùng `useRef` (không re-render). |
| **[04. useMemo & useCallback](file:///d:/my-project/revision-document/react/02-hooks-and-state/04-usememo-and-usecallback.md)** | Caching phép tính tốn kém (`useMemo`), Cố định tham chiếu hàm (`useCallback`), `React.memo`, Referential Equality | Làm chủ kỹ thuật tối ưu hóa hiệu năng, bảo vệ component con khỏi các đợt re-render lãng phí. |

---

## File Thực Hành & Kiểm Thử Tự Động

- **File Demo Tổng Hợp**: [hooks_demo.mjs](file:///d:/my-project/revision-document/react/02-hooks-and-state/hooks_demo.mjs) — Mô phỏng cơ chế lưu trữ Hook Linked List và batching trên Node.js v22.
- **File Tự Luyện & Chấm Điểm**: [practice.mjs](file:///d:/my-project/revision-document/react/02-hooks-and-state/practice.mjs) — Bộ 5 bài tập Hooks chuyên sâu kèm assertions tự động chấm qua `node:assert`.

---

## 3 Bẫy Phỏng Vấn Kinh Điển Cần Nhớ

1. **State Updates là Bất Đồng Bộ (Asynchronous)**: Khi gọi `setCount(count + 1)`, giá trị của `count` ở dòng tiếp theo vẫn là giá trị cũ của lần render hiện tại. Để cập nhật dồn dập, bắt buộc dùng Updater Function: `setCount(prev => prev + 1)`.
2. **Quên mảng dependencies trong `useEffect`**: Nếu bỏ qua tham số thứ hai `useEffect(fn)`, Effect sẽ chạy lại sau **mọi chu kỳ render**, rất dễ dẫn đến vòng lặp vô tận (Infinite Loop) nếu bên trong có gọi `setState`.
3. **Lạm dụng `useMemo` và `useCallback` quá mức**: Việc bọc mọi hàm và phép tính đơn giản vào `useMemo`/`useCallback` làm tốn thêm bộ nhớ RAM để lưu trữ mảng dependency và chi phí so sánh shallow ở mỗi lần render, làm ứng dụng chạy chậm hơn thay vì nhanh hơn.
