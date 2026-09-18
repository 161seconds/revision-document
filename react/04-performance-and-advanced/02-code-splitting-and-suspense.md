# 02. Code Splitting & Suspense

Tối ưu dung lượng gói ứng dụng với Dynamic Imports, tải lười linh hoạt qua `React.lazy` và giao diện chờ với thẻ `<Suspense>`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Reconciliation & Fiber Architecture](file:///d:/my-project/revision-document/react/04-performance-and-advanced/01-reconciliation-and-fiber.md)
- **Tiếp theo:** [Error Boundaries & Resilience](file:///d:/my-project/revision-document/react/04-performance-and-advanced/03-error-boundaries-and-resilience.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Vấn Đề Monolithic Bundle
Trong các ứng dụng Single Page Application (SPA), mặc định tất cả các file mã nguồn, thư viện bên thứ 3 và hình ảnh sẽ được Bundler (Webpack, Vite) gom lại thành một file JavaScript duy nhất (`bundle.js`).
- Khi người dùng truy cập trang chủ, họ phải tải toàn bộ mã nguồn của cả trang Admin, trang Thanh toán, trang Cài đặt...
- Dẫn tới dung lượng file lên tới vài Megabytes, làm chỉ số **First Contentful Paint (FCP)** và **Time to Interactive (TTI)** cực kỳ chậm chạp trên mạng 3G/4G.

### 2.2 Dynamic Import `import()` & `React.lazy`
- **Dynamic Import:** Cú pháp chuẩn của ECMAScript trả về một Promise giải quyết thành Module:
  ```javascript
  import("./AnalyticsWidget").then(module => ...);
  ```
- **`React.lazy`:** Nhận vào một hàm trả về Dynamic Import và biến nó thành một Component có thể render bình thường:
  ```javascript
  const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
  ```

### 2.3 Thẻ `<Suspense>` & Fallback UI
Vì component lazy tải bất đồng bộ qua mạng, nó cần một khoảng thời gian trước khi có mã nguồn để vẽ.
Thẻ `<Suspense>` bao bọc component lazy và cung cấp thuộc tính `fallback` hiển thị giao diện tạm thời (Spinner, Skeleton) trong lúc chờ đợi:

```jsx
import React, { Suspense } from "react";

const HeavyChart = React.lazy(() => import("./HeavyChart"));

function AnalyticsPage() {
    return (
        <div>
            <h1>Thống Kê Doanh Thu</h1>
            <Suspense fallback={<div className="chart-skeleton">Đang tải biểu đồ...</div>}>
                <HeavyChart />
            </Suspense>
        </div>
    );
}
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Khai báo `React.lazy` bên trong hàm Component
```javascript
// ❌ CẤM KỴ: Mỗi lần Parent render, một lazy component mới lại được khởi tạo!
function Parent() {
    const LazyChild = React.lazy(() => import("./Child")); // ❌ Gây tải lại module và mất state!
    return <Suspense fallback={<p>Loading</p>}><LazyChild /></Suspense>;
}

//  ĐÚNG: Luôn khai báo React.lazy ở cấp độ module (ngoài cùng file):
const LazyChild = React.lazy(() => import("./Child"));
function Parent() { ... }
```

### Bẫy 2: Quên xử lý lỗi mạng khi tải Chunk
Nếu người dùng bị rớt mạng đúng lúc trình duyệt đang tải file chunk của component lazy, Promise của `import()` sẽ bị reject. Nếu không có **Error Boundary** bọc bên ngoài thẻ `<Suspense>`, toàn bộ ứng dụng sẽ bị sập trắng màn hình!

---

## 4. Code Thực Hành (Production Patterns)

```jsx
// Pattern: Phân chia mã nguồn theo Route (Route-based Code Splitting)
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const HomePage = lazy(() => import("./pages/Home"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const SettingsPage = lazy(() => import("./pages/Settings"));

export function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div className="global-spinner">Loading page...</div>}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Cơ chế hoạt động ngầm bên dưới của thẻ `<Suspense>` khi một component ném ra một Promise là gì?
   - *Trả lời:* Khi một component lazy đang tải (chưa resolved), nó sẽ **ném ra (throw) một Promise** thay vì return JSX. Thẻ `<Suspense>` gần nhất nằm phía trên cây sẽ đóng vai trò như một khối `try-catch` đặc biệt của React. Khi bắt được Promise bị throw, Suspense sẽ tạm hoãn việc render component con đó và chuyển sang render cây con trong thuộc tính `fallback`. Khi Promise hoàn tất (resolved), React sẽ tự động kích hoạt lại việc render component con với dữ liệu đã tải xong.

2. **Câu hỏi:** Route-based Code Splitting và Component-based Code Splitting khác nhau ở điểm nào?
   - *Trả lời:* Route-based Code Splitting chia nhỏ bundle theo các trang URL (chỉ tải mã nguồn của trang tương ứng khi người dùng truy cập route đó). Component-based Code Splitting chia nhỏ mã nguồn ở mức độ chi tiết hơn bên trong một trang cụ thể (ví dụ: Modal popups, Rich Text Editors, biểu đồ 3D chỉ được tải về khi người dùng bấm nút mở modal hoặc cuộn màn hình tới vị trí của biểu đồ).
