# 03. useRef & DOM Access

Cơ chế lưu trữ tham chiếu không gây re-render với `useRef`, kỹ thuật truy cập phần tử DOM trực tiếp và chuyển tiếp tham chiếu với `forwardRef`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [useEffect & Lifecycle](file:///d:/my-project/revision-document/react/02-hooks-and-state/02-useeffect-and-lifecycle.md)
- **Tiếp theo:** [useMemo & useCallback](file:///d:/my-project/revision-document/react/02-hooks-and-state/04-usememo-and-usecallback.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 `useRef` Thực Chất Là Gì?
`useRef(initialValue)` trả về một **JavaScript Plain Object bình thường** có cấu trúc:
```javascript
{ current: initialValue }
```
- Đối tượng này được React bảo toàn **duy nhất một địa chỉ tham chiếu ô nhớ** qua tất cả các chu kỳ render của Component.
- **Điểm khác biệt cốt tử với `useState`:** Việc bạn thay đổi giá trị `ref.current = newValue` **hoàn toàn KHÔNG kích hoạt re-render** Component!

### 2.2 Hai Trường Hợp Sử Dụng Chính Của `useRef`

1. **Lưu trữ biến nội bộ bất biến qua render (Instance Variables):**
   - Lưu Timer ID (`setInterval`, `setTimeout`) để dọn dẹp sau này.
   - Lưu trữ giá trị trước đó của một state (Previous State).
   - Đếm số lần render của component.
2. **Tham chiếu trực tiếp phần tử DOM:**
   - Focus con trỏ chuột vào `<input>`.
   - Đo kích thước hoặc vị trí cuộn trang (`scrollTop`, `scrollIntoView`).
   - Tích hợp các thư viện bên ngoài không dùng React (Canvas, Chart.js, video players).

```jsx
function AutoFocusInput() {
    const inputRef = useRef(null);

    const handleFocus = () => {
        // Truy cập trực tiếp node HTMLInputElement trong Real DOM
        inputRef.current?.focus();
    };

    return (
        <div>
            <input ref={inputRef} type="text" placeholder="Gõ gì đó..." />
            <button onClick={handleFocus}>Focus ô nhập</button>
        </div>
    );
}
```

### 2.3 Chuyển Tiếp Tham Chiếu Với `forwardRef`
Mặc định, bạn không thể truyền thuộc tính `ref` vào một Functional Component tùy biến của bạn (React sẽ cảnh báo: `Function components cannot be given refs`).
Để component cha có thể truy cập DOM node bên trong component con, ta dùng `forwardRef`:

```jsx
import { forwardRef } from "react";

export const CustomInput = forwardRef((props, ref) => {
    return <input ref={ref} className="custom-input-style" {...props} />;
});
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Đọc hoặc ghi `ref.current` trong quá trình Render (Render Phase)
Tuyệt đối không được đọc hoặc ghi `ref.current` trực tiếp trong thân hàm của Component (ngoại trừ khởi tạo lười `ref.current ??= ...`):
```javascript
// ❌ CẤM KỴ: Vi phạm tính thuần khiết của Render Phase
function BadComponent() {
    const renderCount = useRef(0);
    renderCount.current++; // ❌ Gây ra hiệu ứng lề không lường trước trong Concurrent React!
    return <div>{renderCount.current}</div>;
}

//  ĐÚNG: Chỉ thay đổi ref bên trong Event Handlers hoặc useEffect:
useEffect(() => {
    renderCount.current++;
});
```

---

## 4. Code Thực Hành (Production Patterns)

```javascript
// Pattern: Custom Hook theo dõi giá trị trước đó (usePrevious)
import { useRef, useEffect } from "react";

export function usePrevious(value) {
    const ref = useRef();

    useEffect(() => {
        // Chạy sau khi render đã hoàn tất, lưu lại giá trị hiện tại cho lần sau
        ref.current = value;
    }, [value]);

    // Trả về giá trị của lần render trước đó
    return ref.current;
}

// Pattern: Bộ đếm thời gian Stopwatch chuẩn mực dùng useRef
export function useStopwatch() {
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef(null);

    const start = () => {
        if (timerRef.current !== null) return;
        timerRef.current = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
    };

    const stop = () => {
        if (timerRef.current !== null) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const reset = () => {
        stop();
        setSeconds(0);
    };

    useEffect(() => {
        return () => stop(); // Dọn dẹp khi unmount
    }, []);

    return { seconds, start, stop, reset };
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Phân biệt chi tiết giữa `useState` và `useRef`? Khi nào bắt buộc phải dùng `useState` và khi nào nên dùng `useRef`?
   - *Trả lời:* Cả hai đều duy trì dữ liệu tồn tại qua các chu kỳ render. Khác biệt cốt lõi: Khi `useState` thay đổi, nó kích hoạt quy trình re-render lại component để cập nhật giao diện người dùng (UI). Khi `useRef` thay đổi (`ref.current`), nó **không** kích hoạt re-render. Dùng `useState` cho bất kỳ dữ liệu nào ảnh hưởng trực tiếp đến giao diện hiển thị trên màn hình. Dùng `useRef` cho các giá trị nội bộ hậu trường: Timer ID, cờ trạng thái kiểm tra lần đầu render (isMounted), hoặc lưu trữ node DOM thực tế.

2. **Câu hỏi:** `forwardRef` có còn cần thiết trong phiên bản React 19 không?
   - *Trả lời:* Trong React 19, `forwardRef` đã chính thức bị loại bỏ để đơn giản hóa cú pháp. Giờ đây bạn có thể truyền `ref` như một prop thông thường trực tiếp vào bất kỳ Functional Component nào: `function MyInput({ ref, ...props }) { return <input ref={ref} />; }`.
