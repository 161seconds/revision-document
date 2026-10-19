# Module 01: Next.js App Router & File-System Routing

Chuyên đề đi sâu vào cơ chế hoạt động của hệ thống định tuyến dựa trên hệ thống tệp (File-System Based Router), các phân đoạn động (Dynamic Segments), lồng Layouts phân cấp và các mô hình định tuyến nâng cao trong Next.js App Router.

---

## 📌 Nội Dung Trọng Tâm

1. **Kiến Trúc File Quy Ước Trong App Router:**
   - `app/layout.tsx`: Root Layout (bắt buộc phải có `<html>` và `<body>`).
   - `app/page.tsx`: Giao diện tương ứng với đường dẫn URL `/`.
   - `app/loading.tsx`: Tự động bọc `page.tsx` trong một React `<Suspense />` boundary.
   - `app/error.tsx`: Phải khai báo `"use client"`, tự động bọc trong Error Boundary.
   - `app/not-found.tsx`: UI hiển thị khi gọi hàm `notFound()`.

2. **Các Dạng Phân Đoạn Động (Dynamic Segments):**
   - Phân đoạn động đơn: `app/blog/[slug]/page.tsx` $\rightarrow$ `/blog/nextjs-routing` (`params: { slug: "nextjs-routing" }`).
   - Phân đoạn gom tất cả (Catch-all): `app/shop/[...categories]/page.tsx` $\rightarrow$ `/shop/clothing/shirts` (`params: { categories: ["clothing", "shirts"] }`).
   - Gom tùy chọn (Optional Catch-all): `app/docs/[[...slug]]/page.tsx` $\rightarrow$ Khớp cả `/docs` (`params: { slug: undefined }`) lẫn `/docs/api/v1` (`params: { slug: ["api", "v1"] }`).

3. **Nhóm Định Tuyến (Route Groups):**
   - Đặt tên thư mục trong ngoặc đơn, ví dụ: `app/(marketing)/about/page.tsx` $\rightarrow$ URL vẫn là `/about`.
   - Mục đích: Gom nhóm các trang có cùng mục đích hoặc áp dụng các layout hoàn toàn khác nhau cho từng nhóm mà không làm biến đổi cấu trúc URL.

4. **Kỹ Thuật Định Tuyến Nâng Cao:**
   - **Parallel Routes (`@analytics`, `@team`):** Cho phép render nhiều trang đồng thời trong cùng một layout mà độc lập về trạng thái load.
   - **Intercepting Routes (`(.)photo/[id]`):** Chặn điều hướng để mở modal xem ảnh ngay tại feed, nhưng khi người dùng chia sẻ link hoặc refresh thì mở toàn trang.

---

## 💻 Thực Hành & Chạy Thử

- Chạy file demo mô phỏng bộ định tuyến:
  ```bash
  node nextjs/01-app-router-and-routing/demo.mjs
  ```
- Chạy bộ bài tập tự động chấm điểm:
  ```bash
  node nextjs/01-app-router-and-routing/practice.mjs
  ```
