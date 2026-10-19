# Module 04: Caching & Web Performance Optimization

Chuyên đề đi sâu vào giải phẫu **hệ thống 4 tầng Caching** phức tạp trong Next.js App Router, cơ chế làm mới dữ liệu theo thẻ (**Tag-based On-Demand Revalidation**), tối ưu hóa **Core Web Vitals (LCP, INP, CLS)** và cấu hình build production.

---

## 📌 Nội Dung Trọng Tâm

1. **Hệ Thống 4 Tầng Caching Trong Next.js:**
   ```mermaid
   flowchart TD
       Req([Người Dùng Gửi Request]) --> C4[1. Router Cache (Client Memory: 30s/5m)]
       C4 -- Cache Miss / Hard Refresh --> C3[2. Full Route Cache (Server HTML + RSC)]
       C3 -- Revalidate / Dynamic --> C1[3. Request Memoization (React Component Tree)]
       C1 -- Lời gọi Fetch Độc Nhất --> C2[4. Data Cache (Persistent Storage)]
       C2 -- Cache Miss / TTL Hết Hạn --> Origin[(Database / External API)]
   ```

2. **Cách Điều Khiển Từng Tầng Cache:**
   - **Bật/Tắt Data Cache:**
     ```tsx
     // Mặc định là lưu vĩnh viễn (Force Cache)
     fetch("https://api.example.com/products", { cache: "force-cache" });

     // Tắt hoàn toàn cache cho request dữ liệu biến động
     fetch("https://api.example.com/user-cart", { cache: "no-store" });

     // Cache theo thời gian (Time-based Revalidation: 60s)
     fetch("https://api.example.com/news", { next: { revalidate: 60 } });

     // Gắn thẻ để xóa cache chủ động (On-Demand Tag-based)
     fetch("https://api.example.com/posts", { next: { tags: ["posts", "author-1"] } });
     ```
   - **Xóa Cache Trong Server Action:**
     ```tsx
     import { revalidatePath, revalidateTag } from "next/cache";

     export async function addProductAction() {
       await db.product.create(...);
       revalidateTag("products"); // Xóa toàn bộ dữ liệu có tag 'products'
       revalidatePath("/shop");   // Dựng lại HTML tĩnh của trang /shop
     }
     ```

3. **Tối Ưu Hóa Core Web Vitals:**
   - **Largest Contentful Paint (LCP < 2.5s):**
     - Luôn thêm `priority` vào ảnh đầu tiên nhìn thấy trên màn hình (`Hero image`).
     - Sử dụng `next/font` để nhúng CSS font trực tiếp vào HTML thay vì gọi Google Fonts CDN.
   - **Interaction to Next Paint (INP < 200ms):**
     - Dùng `useTransition` để đánh dấu các tác vụ nặng là non-urgent, tránh đơ khung hình.
     - Chia nhỏ các Server Components nặng bằng `<Suspense />` để stream dần.
   - **Cumulative Layout Shift (CLS < 0.1):**
     - Sử dụng `next/image` với kích thước `width`/`height` cố định hoặc `fill` kết hợp `object-fit: cover`.
     - `next/font` tự động điều chỉnh font fallback metrics tương đồng với font tùy biến, loại bỏ hoàn toàn hiện tượng dịch chuyển layout khi font tải xong.

---

## 💻 Thực Hành & Chạy Thử

- Chạy file demo mô phỏng 4 tầng Cache:
  ```bash
  node nextjs/04-caching-and-performance/demo.mjs
  ```
- Chạy bộ bài tập tự động chấm điểm:
  ```bash
  node nextjs/04-caching-and-performance/practice.mjs
  ```
