# 03. Custom Hooks & Reusability

Tách biệt logic nghiệp vụ khỏi giao diện người dùng, nguyên lý đóng gói trạng thái và các mẫu hình Custom Hooks kinh điển trong React.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Context API & Composition](file:///d:/my-project/revision-document/react/03-state-management-and-context/02-context-api-and-composition.md)
- **Tiếp theo:** [External Store & Zustand](file:///d:/my-project/revision-document/react/03-state-management-and-context/04-external-store-and-zustand.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Custom Hook Là Gì?
Custom Hook bản chất là một JavaScript Function thông thường có hai đặc điểm nhận dạng:
1. Tên hàm bắt đầu bằng tiền tố **`use`** (ví dụ `useFetch`, `useDebounce`). Tiền tố này là quy ước bắt buộc để linter (ESLint plugin `react-hooks`) nhận diện và kiểm tra tuân thủ Rules of Hooks.
2. Bên trong thân hàm có gọi **ít nhất một Hook khác của React** (`useState`, `useEffect`, `useRef`, ...).

### 2.2 Trạng Thái Trong Custom Hook Có Được Chia Sẻ Không?
> **QUAN TRỌNG:** Custom Hook chia sẻ **LOGIC (CƠ CHẾ HOẠT ĐỘNG)** chứ **KHÔNG CHIA SẺ TRẠNG THÁI (STATE)**!

Mỗi khi một Component gọi một Custom Hook, nó sẽ khởi tạo một vùng bộ nhớ State hoàn toàn độc lập trên Fiber Node của riêng component đó:
```javascript
function ComponentA() {
    const { count, inc } = useCounter(); // State count_A độc lập
}

function ComponentB() {
    const { count, inc } = useCounter(); // State count_B độc lập
}
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên tiền tố `use` trong tên hàm
Nếu bạn đặt tên hàm là `fetchUserData()` mà bên trong gọi `useState` hoặc `useEffect`:
- React Linter sẽ không thể phân tích hàm này.
- Trình kiểm tra sẽ không cảnh báo khi bạn vô tình gọi hàm đó bên trong vòng lặp hay câu lệnh `if`, dẫn đến sập ứng dụng lúc chạy.

---

## 4. Code Thực Hành (Production Patterns)

```javascript
// Pattern 1: useDebounce - Trì hoãn giá trị nhập để giảm tải API Search
import { useState, useEffect } from "react";

export function useDebounce(value, delayMs = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delayMs);

        return () => clearTimeout(handler); // Xóa timer cũ nếu người dùng gõ phím tiếp
    }, [value, delayMs]);

    return debouncedValue;
}

// Pattern 2: useLocalStorage - Đồng bộ trạng thái React với LocalStorage
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Khi hai component khác nhau cùng gọi chung một Custom Hook, trạng thái giữa chúng có bị đồng bộ hóa không? Nếu muốn đồng bộ trạng thái giữa 2 component, ta phải làm thế nào?
   - *Trả lời:* Không đồng bộ. Mỗi component khi gọi Custom Hook sẽ được cấp phát các slot hook độc lập trên Fiber Node của riêng nó. Nếu muốn đồng bộ trạng thái giữa nhiều component, bạn phải: (1) Nâng trạng thái lên component cha chung (Lifting State Up), (2) Kết hợp Custom Hook với Context API, hoặc (3) Kết nối Custom Hook với một External Store toàn cục.

2. **Câu hỏi:** Sự khác biệt giữa việc tách hàm tiện ích (Utility Function) thông thường và việc viết Custom Hook là gì?
   - *Trả lời:* Utility Function là hàm JavaScript thuần túy không chứa trạng thái hay vòng đời (không gọi bất kỳ Hook nào của React), chỉ nhận đầu vào và biến đổi trả về đầu ra (ví dụ: format tiền tệ, parse URL). Custom Hook là hàm có khả năng sử dụng các tính năng nội tại của React (`useState`, `useEffect`, `useRef`), cho phép đóng gói cả logic tính toán lẫn vòng đời và trạng thái phản ứng (reactive state).
