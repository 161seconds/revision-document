# Module 03: Server Actions & Data Mutations

Chuyên đề đi sâu vào cơ chế đột phá **Server Actions** trong Next.js, tích hợp Hooks mới trong **React 19** (`useActionState`, `useFormStatus`, `useOptimistic`), kiểm thực dữ liệu (Form Validation với Zod) và bảo vệ an ninh ứng dụng Full-Stack.

---

## 📌 Nội Dung Trọng Tâm

1. **Bản Chất Server Actions Dưới Tầng Giao Thức (Under The Hood):**
   - Không đơn thuần là hàm JavaScript, Next.js tự động biên dịch mỗi hàm `"use server"` thành một **POST RPC Endpoint** bí mật được gán ID băm (Hash ID).
   - Khi form submit hoặc client gọi hàm, trình duyệt gửi một HTTP POST request với header `Next-Action: <hash_id>`.
   - Kết quả trả về gồm: dữ liệu trả về từ hàm + cây **RSC Payload mới** để cập nhật UI tự động mà không cần tải lại toàn bộ trang.

2. **Bộ Ba Hooks Quản Lý Form Đột Phá:**
   - **`useActionState` (Thay thế cho `useFormState` cũ):**
     - Quản lý trạng thái form (`state`), hàm dispatch (`formAction`) và cờ `isPending`.
     ```tsx
     const [state, formAction, isPending] = useActionState(updateUserAction, initialState);
     ```
   - **`useFormStatus`:**
     - Cho phép component con (như `<SubmitButton />`) đọc trạng thái `pending` của `<form>` cha gần nhất mà không cần truyền props.
   - **`useOptimistic` (Cập Nhật Lạc Quan):**
     - Cập nhật UI ngay lập tức khi người dùng click (giảm độ trễ cảm nhận về 0ms). Nếu server thất bại, React tự động hoàn tác (rollback) trạng thái cũ.

3. **Quy Trình Chuẩn Của Một Server Action Đạt Chuẩn Production:**
   ```mermaid
   flowchart TD
       Client([Người dùng Submit Form]) --> Validate{1. Validate Input bằng Zod}
       Validate -- Sai Schema --> Err([Trả về Error State cho Client UI])
       Validate -- Hợp Lệ --> Auth{2. Kiểm tra Authentication & Quyền}
       Auth -- Không có quyền --> Err403([Ném ngoại lệ / Trả lỗi Unauthorized])
       Auth -- Đã Xác Thực --> DB[(3. Thao tác Cơ Sở Dữ Liệu: Prisma / Drizzle)]
       DB --> Reval[4. Xóa Cache: revalidatePath / revalidateTag]
       Reval --> Done([5. Trả về kết quả thành công + Cập nhật UI])
   ```

4. **Bảo Mật Server Actions (Security In-Depth):**
   - **CSRF Protection:** Next.js tự động đối soát tiêu đề `Origin` và `Host`.
   - **Chống Mass Assignment:** Luôn parse dữ liệu bằng schema (như Zod/Valibot) thay vì truyền trực tiếp `Object.fromEntries(formData)` vào Database.
   - **Authentication:** Không bao giờ tin tưởng client! Luôn lấy User ID từ Cookie/Session an toàn ở phía server thay vì nhận `userId` từ form input.

---

## 💻 Thực Hành & Chạy Thử

- Chạy file demo mô phỏng Server Action và Optimistic UI:
  ```bash
  node nextjs/03-server-actions-and-mutations/demo.mjs
  ```
- Chạy bộ bài tập tự động chấm điểm:
  ```bash
  node nextjs/03-server-actions-and-mutations/practice.mjs
  ```
