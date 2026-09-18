# 02. useEffect & Lifecycle

Quản lý hiệu ứng lề (Side Effects), cơ chế mảng phụ thuộc (Dependencies) và hàm dọn dẹp (Cleanup Function) trong React.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [useState & Batching](file:///d:/my-project/revision-document/react/02-hooks-and-state/01-usestate-and-batching.md)
- **Tiếp theo:** [useRef & DOM Access](file:///d:/my-project/revision-document/react/02-hooks-and-state/03-useref-and-dom-access.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Side Effects Là Gì?
Trong lập trình hàm (Functional Programming), hàm thuần khiết chỉ nhận input và return output. Bất kỳ hành động nào tương tác với thế giới bên ngoài ngoài việc sinh ra JSX đều được coi là **Side Effect**:
- Gọi API qua `fetch` hoặc `axios`.
- Thiết lập bộ đếm giờ (`setTimeout`, `setInterval`).
- Lắng nghe sự kiện toàn cục của trình duyệt (`window.addEventListener("resize", ...)`).
- Can thiệp trực tiếp vào DOM (`document.title = "..."`).

### 2.2 Vòng Đời Tương Đương Của `useEffect`
```javascript
useEffect(() => {
    // [Setup Phase]: Chạy sau khi component đã được vẽ lên màn hình
    console.log("Effect executed");

    return () => {
        // [Cleanup Phase]: Chạy TRƯỚC khi Effect tiếp theo chạy, hoặc khi Component Unmount
        console.log("Cleanup executed");
    };
}, [dependencies]);
```

1. **Không truyền mảng dependency (`useEffect(fn)`):** Chạy sau **mọi lần** component render.
2. **Truyền mảng rỗng (`useEffect(fn, [])`):** Chỉ chạy đúng **1 lần duy nhất** khi component Mount, và hàm cleanup chạy khi Unmount. (Tương đương `componentDidMount` + `componentWillUnmount`).
3. **Truyền danh sách biến (`useEffect(fn, [a, b])`):** Chỉ chạy lại khi giá trị của `a` hoặc `b` thay đổi qua phép so sánh `Object.is()`.

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên Hàm Dọn Dẹp (Memory Leak)
Nếu tạo `setInterval` hoặc đăng ký `addEventListener` bên trong `useEffect` mà không trả về hàm cleanup:
```javascript
// ❌ NGUY HIỂM: Mỗi lần re-render sinh ra 1 timer mới chạy vĩnh viễn ngầm trong RAM!
useEffect(() => {
    const timer = setInterval(() => {
        console.log("Tick");
    }, 1000);
    // Quên return () => clearInterval(timer);
}, []);
```

### Bẫy 2: Bẫy Stale Closure trong `setInterval`
```javascript
useEffect(() => {
    const timer = setInterval(() => {
        // ❌ Stale Closure: Biến count luôn mang giá trị 0 của lần render đầu tiên!
        setCount(count + 1);
    }, 1000);
    return () => clearInterval(timer);
}, []); // Mảng rỗng -> Effect chỉ chạy 1 lần lúc mount

//  CÁCH KHẮC PHỤC TRIỆT ĐỂ:
useEffect(() => {
    const timer = setInterval(() => {
        // Dùng updater function để luôn lấy giá trị mới nhất
        setCount(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
}, []);
```

---

## 4. Code Thực Hành (Production Patterns)

```javascript
// Pattern: Fetch dữ liệu an toàn với AbortController chống Race Condition
import { useState, useEffect } from "react";

export function useUserData(userId) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        async function loadUser() {
            try {
                const res = await fetch(`https://api.example.com/users/${userId}`, {
                    signal: controller.signal
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err);
                }
            } finally {
                setLoading(false);
            }
        }

        loadUser();

        // Cleanup: Hủy request nếu userId thay đổi hoặc component unmount
        return () => {
            controller.abort();
        };
    }, [userId]);

    return { data, loading, error };
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Phân biệt thời điểm thực thi giữa `useEffect` và `useLayoutEffect`?
   - *Trả lời:* Cả hai đều chạy sau khi React cập nhật Virtual DOM vào Real DOM. Tuy nhiên:
     - `useLayoutEffect` chạy **đồng bộ** ngay sau khi DOM được sửa đổi nhưng **trước khi trình duyệt vẽ (paint)** giao diện lên màn hình. Phù hợp khi cần đo đạc kích thước DOM (`getBoundingClientRect`) hoặc căn chỉnh vị trí để tránh hiện tượng giao diện bị giật (Flickering).
     - `useEffect` chạy **bất đồng bộ sau khi trình duyệt đã vẽ xong** (post-paint), giúp giữ cho luồng chính (Main Thread) không bị nghẽn, tăng độ mượt mà khi người dùng tương tác.

2. **Câu hỏi:** Tại sao trong React 18 Strict Mode ở môi trường Development, `useEffect` lại chạy 2 lần lúc Mount?
   - *Trả lời:* Đây là tính năng có chủ đích của React 18 nhằm kiểm tra tính tương thích với tính năng Tái sử dụng Trạng thái (Reusable State / Fast Refresh). React cố tình mô phỏng chu kỳ: **Mount $\rightarrow$ Unmount $\rightarrow$ Re-mount**. Nếu hàm cleanup của bạn được viết chuẩn xác (hủy đúng timer, dọn đúng event listener), ứng dụng sẽ không phát sinh lỗi hay rò rỉ bộ nhớ.
