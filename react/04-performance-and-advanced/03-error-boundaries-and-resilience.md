# 03. Error Boundaries & Resilience

Xây dựng hàng rào hứng lỗi (Error Boundaries), bảo vệ ứng dụng khỏi hiện tượng màn hình trắng chết chóc và chiến lược phục hồi lỗi trong React.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Code Splitting & Suspense](file:///d:/my-project/revision-document/react/04-performance-and-advanced/02-code-splitting-and-suspense.md)
- **Tiếp theo:** [React 18 & 19 Modern Features](file:///d:/my-project/revision-document/react/04-performance-and-advanced/04-react18-19-modern-features.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Vấn Đề Uncaught Errors Trong React
Trước React 16, nếu một lỗi JavaScript xảy ra trong quá trình render của bất kỳ component nhỏ nào (ví dụ đọc thuộc tính `user.profile.avatar` khi `profile` bị `null`), toàn bộ cây giao diện React sẽ bị gỡ bỏ (unmount), để lại **màn hình trắng tinh (White Screen of Death)** cho người dùng.

### 2.2 Error Boundary Là Gì?
Error Boundary là một React Component đặc biệt đóng vai trò như một khối `try-catch` bao quanh các component con của nó:
- Nếu một component con bên trong ném ra lỗi lúc render, Error Boundary sẽ **bắt lấy lỗi đó**, ngăn không cho lỗi lan truyền lên làm sập toàn bộ trang.
- Nó cho phép hiển thị một **Giao diện thay thế (Fallback UI)** và gửi thông tin lỗi về hệ thống giám sát (Sentry, Datadog).

> **LƯU Ý:** Tính đến hiện tại, Error Boundary **bắt buộc phải được viết dưới dạng Class Component** vì React chưa cung cấp Hook tương đương cho `componentDidCatch`.

```javascript
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    // 1. Cập nhật state để render Fallback UI ở chu kỳ tiếp theo
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    // 2. Gửi log lỗi về dịch vụ giám sát
    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || <h2>Đã xảy ra sự cố kỹ thuật!</h2>;
        }
        return this.props.children;
    }
}
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Nghĩ rằng Error Boundary bắt được TẤT CẢ các loại lỗi
Error Boundary **KHÔNG THỂ** bắt được các loại lỗi sau:
1. **Lỗi trong Event Handlers** (`onClick`, `onSubmit`): Phải dùng `try-catch` truyền thống.
2. **Lỗi trong mã Bất đồng bộ** (`setTimeout`, `requestAnimationFrame`, `Promise.then`).
3. **Lỗi trong Server-Side Rendering (SSR)**.
4. **Lỗi xảy ra trong chính bản thân Error Boundary** (chứ không phải con của nó).

---

## 4. Code Thực Hành (Production Patterns)

```jsx
// Pattern: Tái sử dụng Error Boundary với nút Thử Lại (Reset Strategy)
import React from "react";

export class ResilientBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    reset = () => {
        this.setState({ hasError: false });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-fallback-card">
                    <h3>Khối nội dung này gặp sự cố</h3>
                    <p>Vui lòng thử tải lại hoặc liên hệ hỗ trợ.</p>
                    <button onClick={this.reset}>Thử lại</button>
                </div>
            );
        }
        return this.props.children;
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Phân biệt vai trò của hai phương thức `static getDerivedStateFromError` và `componentDidCatch` trong một Error Boundary?
   - *Trả lời:*
     - `static getDerivedStateFromError(error)` là hàm tĩnh chạy trong **Render Phase**. Nhiệm vụ duy nhất của nó là nhận lỗi ném ra từ con và trả về state mới (ví dụ `{ hasError: true }`) để React lập tức render giao diện dự phòng (Fallback UI). Vì chạy trong Render Phase nên hàm này **không được phép gây ra side effects**.
     - `componentDidCatch(error, errorInfo)` chạy trong **Commit Phase**. Đây là nơi thích hợp để thực hiện các Side Effects: gửi log báo cáo lỗi kèm Component Stack Trace về các dịch vụ giám sát như Sentry hoặc ghi vào file log máy chủ.

2. **Câu hỏi:** Nếu Error Boundary không bắt được lỗi trong Event Handler (`onClick`), làm thế nào để kích hoạt Error Boundary hiển thị Fallback UI khi hàm click bị lỗi?
   - *Trả lời:* Ta có thể lưu lỗi vào một State thông qua một hàm `setState` giả mạo bên trong khối `try-catch` của event handler:
     ```javascript
     const [, setError] = useState();
     const handleClick = () => {
         try {
             doRiskyOperation();
         } catch (e) {
             setError(() => { throw e; }); // Ném lỗi vào Render Phase tiếp theo!
         }
     };
     ```
     Khi `setState` ném ra lỗi trong quá trình render, Error Boundary bao quanh sẽ bắt được lỗi đó ngay lập tức.
