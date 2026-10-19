# Module 02: React Server Components (RSC) & Rendering Strategies

Chuyên đề đào sâu vào cơ chế cốt lõi của **React Server Components (RSC)**, giao thức **RSC Payload**, ranh giới Client-Server Boundary, các chiến lược xuất bản trang (**SSR, SSG, ISR**) và kỹ thuật **Streaming với Suspense**.

---

## 📌 Nội Dung Trọng Tâm

1. **Bản Chất React Server Components (RSC):**
   - Server Components chạy và kết thúc vòng đời hoàn toàn trên Server.
   - Kết quả trả về cho trình duyệt không phải là file JavaScript chứa logic, mà là một định dạng dữ liệu đặc biệt gọi là **RSC Payload** (dạng text stream mô tả cây UI ảo).
   - **Zero-Bundle-Size**: Toàn bộ các thư viện nặng dùng trong Server Component (như `markdown-it`, `lodash`, `moment`) không bao giờ bị tải về trình duyệt của người dùng.

2. **Ranh Giới Client Boundary (`"use client"`):**
   - Không phải biến file thành "Client-only", mà là khai báo **điểm phân tách (Boundary)** giữa Server Code và Client Code.
   - Dữ liệu truyền từ Server Component xuống Client Component thông qua Props bắt buộc phải **tuần tự hóa được (Serializable)**:
     - ✅ Chấp nhận: Chuỗi, số, boolean, mảng, Plain Objects, JSX Elements.
     - ❌ Bị chặn / Lỗi: Hàm (Functions - trừ Server Actions), Symbol, Instance của Class phức tạp.

3. **Mô Hình Lồng Ghép (Interleaving Pattern):**
   - Không được import trực tiếp Server Component vào Client Component:
     ```tsx
     // ❌ SAI: Biến ServerComponent thành Client Component ngầm!
     "use client";
     import ServerComponent from "./ServerComponent";
     ```
   - Giải pháp chuẩn: Truyền Server Component dưới dạng `children` hoặc props:
     ```tsx
     // ✅ ĐÚNG: Server Component vẫn giữ nguyên Zero-Bundle-Size
     // ClientWrapper.tsx ("use client")
     export default function ClientWrapper({ children }: { children: React.ReactNode }) {
       return <div className="interactive-modal">{children}</div>;
     }

     // page.tsx (Server Component)
     export default function Page() {
       return (
         <ClientWrapper>
           <HeavyServerComponent />
         </ClientWrapper>
       );
     }
     ```

4. **4 Chiến Lược Rendering Trong Next.js:**
   - **Static Site Generation (SSG)**: Dựng sẵn toàn bộ tại `next build`.
   - **Server-Side Rendering (SSR)**: Tự động kích hoạt khi có dynamic functions (`cookies()`, `headers()`).
   - **Incremental Static Regeneration (ISR)**: Tái tạo trang tĩnh ngầm theo chu kỳ (`revalidate = 3600`) hoặc theo tag (`revalidateTag`).
   - **Streaming SSR**: Gửi khung HTML ban đầu ngay lập tức, sau đó truyền tiếp dữ liệu chậm qua HTTP chunked transfer nhờ `<Suspense fallback={<Skeleton />} />`.

---

## 💻 Thực Hành & Chạy Thử

- Chạy file demo mô phỏng tuần tự hóa RSC và Streaming:
  ```bash
  node nextjs/02-rsc-and-rendering-strategies/demo.mjs
  ```
- Chạy bộ bài tập tự động chấm điểm:
  ```bash
  node nextjs/02-rsc-and-rendering-strategies/practice.mjs
  ```
