# 04. External Store & Zustand

Kiến trúc quản lý trạng thái bên ngoài React với `useSyncExternalStore`, mẫu thiết kế Publish-Subscribe và nguyên lý hoạt động của các thư viện Global Store hiện đại (Zustand).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Custom Hooks & Reusability](file:///d:/my-project/revision-document/react/03-state-management-and-context/03-custom-hooks-and-reusability.md)
- **Tiếp theo:** [Module 04: Performance & Advanced](file:///d:/my-project/revision-document/react/04-performance-and-advanced/README.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Vấn Đề "Rách Giao Diện" (UI Tearing) Trong Concurrent React
Trong React 18, Render Phase có thể bị **tạm dừng (paused)** để nhường quyền xử lý cho các tác vụ khẩn cấp hơn của người dùng (như gõ phím), sau đó mới tiếp tục render.
- Nếu một ứng dụng đọc trạng thái từ một kho dữ liệu biến đổi bên ngoài React (External Store) trong khi React đang render dở dang:
- Component A đọc giá trị $X_1$ trước khi tạm dừng.
- External Store bị thay đổi thành $X_2$ trong lúc tạm dừng.
- Component B được render tiếp và đọc giá trị $X_2$.
$\rightarrow$ **Hệ quả:** Màn hình cùng lúc hiển thị 2 trạng thái mâu thuẫn ($X_1$ và $X_2$), hiện tượng này gọi là **Tearing (Rách giao diện)**.

### 2.2 Hook Cứu Cánh: `useSyncExternalStore` (React 18+)
`useSyncExternalStore` được thiết kế đặc thù để đăng ký và đọc dữ liệu an toàn từ bất kỳ nguồn bên ngoài nào mà không bao giờ bị rách giao diện:

```javascript
import { useSyncExternalStore } from "react";

const state = useSyncExternalStore(
    subscribe,     // Hàm đăng ký nhận thông báo thay đổi
    getSnapshot,   // Hàm trả về giá trị hiện tại trên Client
    getServerSnapshot // Hàm trả về giá trị khi Render trên SSR (tùy chọn)
);
```

### 2.3 Nguyên Lý Của Thư Viện Zustand
Zustand là thư viện quản lý state toàn cục phổ biến nhất hiện nay nhờ:
1. **Không cần Context Provider:** Không bị lồng thẻ rối rắm ngoài file gốc.
2. **Selector-based Subscription:** Component chỉ re-render khi phần dữ liệu nó chọn lọc (`state => state.bears`) thực sự thay đổi!
3. **Mã nguồn siêu nhẹ (< 1KB):** Dưới đáy của Zustand chính là mẫu thiết kế Pub/Sub kết hợp với `useSyncExternalStore`.

```javascript
import { create } from "zustand";

export const useStore = create((set) => ({
    count: 0,
    inc: () => set((state) => ({ count: state.count + 1 })),
    reset: () => set({ count: 0 })
}));
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Hàm `getSnapshot` trả về Object mới ở mọi lần gọi
Nếu hàm `getSnapshot` trong `useSyncExternalStore` trả về một tham chiếu đối tượng mới tinh:
```javascript
// ❌ VÒNG LẶP VÔ HẠN: Object mới khiến React tưởng store liên tục đổi!
function getSnapshot() {
    return { data: externalStore.data };
}
```
**Quy tắc:** `getSnapshot` phải trả về cùng một tham chiếu bất biến nếu dữ liệu bên trong store chưa hề thay đổi.

---

## 4. Code Thực Hành (Production Patterns)

```javascript
// Pattern: Tự xây dựng một Mini Global Store chuẩn Pub/Sub & useSyncExternalStore
export function createStore(initialState) {
    let state = initialState;
    const listeners = new Set();

    const getState = () => state;

    const setState = (updater) => {
        const nextState = typeof updater === "function" ? updater(state) : updater;
        if (!Object.is(state, nextState)) {
            state = nextState;
            listeners.forEach(listener => listener());
        }
    };

    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener); // Unsubscribe
    };

    return { getState, setState, subscribe };
}

// Sử dụng với React:
// const globalThemeStore = createStore({ theme: "light" });
// function useTheme() {
//     return useSyncExternalStore(globalThemeStore.subscribe, globalThemeStore.getState);
// }
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Hiện tượng UI Tearing là gì và tại sao React 18 lại cần hook `useSyncExternalStore`?
   - *Trả lời:* UI Tearing là hiện tượng giao diện bị không đồng nhất (rách giao diện) khi các component khác nhau trên cùng một màn hình hiển thị các giá trị khác nhau của cùng một trạng thái toàn cục. Hiện tượng này xảy ra trong Concurrent React do Render Phase có thể bị ngắt quãng, cho phép các sự kiện bên ngoài làm thay đổi External Store giữa các đợt render. Hook `useSyncExternalStore` giải quyết bằng cách buộc React đồng bộ hóa việc đọc store và tự động kích hoạt một đợt render lại đồng bộ nếu phát hiện store bị thay đổi trong lúc render dở dang.

2. **Câu hỏi:** Tại sao Zustand lại được ưa chuộng hơn Redux hoặc Context API trong các dự án React hiện đại?
   - *Trả lời:* So với Redux truyền thống, Zustand không cần boilerplate phức tạp (không cần reducers, actions types, dispatch lằng nhằng, không cần bọc `<Provider>`). So với Context API, Zustand giải quyết triệt để bài toán hiệu năng: Nó hỗ trợ **State Selectors**, cho phép component chỉ đăng ký lắng nghe một nhánh dữ liệu cụ thể và chỉ re-render khi đúng nhánh dữ liệu đó thay đổi, triệt tiêu hoàn toàn vấn đề re-render dư thừa của Context.
