# 04. useMemo & useCallback

Tối ưu hóa hiệu năng ứng dụng, ghi nhớ phép tính phức tạp với `useMemo`, ổn định định danh hàm với `useCallback` và bản chất của `React.memo`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [useRef & DOM Access](file:///d:/my-project/revision-document/react/02-hooks-and-state/03-useref-and-dom-access.md)
- **Tiếp theo:** [Module 03: State Management & Context](file:///d:/my-project/revision-document/react/03-state-management-and-context/README.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Vấn Đề Referential Equality (Đẳng Thức Tham Chiếu)
Trong JavaScript, hai đối tượng hoặc hai hàm có cùng nội dung nhưng khác địa chỉ ô nhớ sẽ không bằng nhau:
```javascript
{ a: 1 } === { a: 1 } // false
(() => {}) === (() => {}) // false
```
Mỗi khi component cha re-render:
- Mọi hàm khai báo bên trong nó (`const handleClick = () => ...`) đều nhận một **địa chỉ ô nhớ mới tinh**.
- Mọi object literal (`const config = { theme: 'dark' }`) đều là một **đối tượng mới**.
- Nếu bạn truyền các hàm hoặc object này xuống component con đã bọc `React.memo`, component con vẫn bị re-render vì phép so sánh nông (`prevProps.onClick === nextProps.onClick`) trả về `false`!

### 2.2 `useMemo` (Ghi Nhớ Giá Trị Tính Toán)
`useMemo` ghi nhớ (cache) kết quả của một phép tính toán tốn kém tài nguyên:
```javascript
const filteredProducts = useMemo(() => {
    // Chỉ tính toán lại khi products hoặc searchQuery thay đổi
    return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
}, [products, searchQuery]);
```

### 2.3 `useCallback` (Ghi Nhớ Tham Chiếu Hàm)
`useCallback(fn, deps)` tương đương hoàn toàn với `useMemo(() => fn, deps)`. Nó trả về chính xác **định danh tham chiếu của hàm** qua các lần render:
```javascript
const handleDelete = useCallback((id) => {
    dispatch({ type: "DELETE", payload: id });
}, [dispatch]);
```

### 2.4 Bộ Ba Hoàn Hảo: `React.memo` + `useCallback` + `useMemo`
- `React.memo(Component)`: Ngăn component re-render nếu props đầu vào không thay đổi.
- `useCallback`: Bảo vệ các prop là **hàm** truyền vào `React.memo`.
- `useMemo`: Bảo vệ các prop là **object / array** truyền vào `React.memo`.

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Bọc `useCallback` nhưng không bọc `React.memo` ở component con
Nếu component con không được bọc bởi `React.memo`, nó **sẽ luôn re-render** mỗi khi component cha re-render, bất kể bạn có dùng `useCallback` cho props hàm hay không! Lúc này `useCallback` trở nên hoàn toàn vô ích và lãng phí bộ nhớ.

### Bẫy 2: Chi Phí Quá Tải Của Việc Tối Ưu Hóa (Premature Optimization)
Đừng bao giờ bọc mọi phép tính đơn giản:
```javascript
// ❌ PHẢN TÁC DỤNG: Phép cộng 1 + 2 quá nhẹ, chi phí khởi tạo closure và so sánh mảng deps của useMemo còn nặng hơn!
const sum = useMemo(() => 1 + 2, []);
```

---

## 4. Code Thực Hành (Production Patterns)

```jsx
// Pattern: Danh sách tối ưu hiệu năng không re-render item khi gõ phím vào ô tìm kiếm
import React, { useState, useMemo, useCallback } from "react";

// Component con được bảo vệ bằng React.memo
const ListItem = React.memo(({ item, onDelete }) => {
    console.log(`Render item: ${item.id}`);
    return (
        <li>
            {item.name}
            <button onClick={() => onDelete(item.id)}>Xóa</button>
        </li>
    );
});

export function OptimizedList({ rawItems }) {
    const [filter, setFilter] = useState("");
    const [items, setItems] = useState(rawItems);

    // 1. useMemo lọc mảng
    const visibleItems = useMemo(() => {
        return items.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()));
    }, [items, filter]);

    // 2. useCallback cố định hàm xóa
    const handleDelete = useCallback((id) => {
        setItems(prev => prev.filter(i => i.id !== id));
    }, []);

    return (
        <div>
            <input
                type="text"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Tìm kiếm..."
            />
            <ul>
                {visibleItems.map(item => (
                    <ListItem key={item.id} item={item} onDelete={handleDelete} />
                ))}
            </ul>
        </div>
    );
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** `useCallback(fn, deps)` và `useMemo(fn, deps)` khác nhau thế nào về mặt cấu trúc và bản chất?
   - *Trả lời:* `useMemo` thực thi hàm được truyền vào và trả về **giá trị kết quả tính toán** của hàm đó (dùng để lưu mảng, object hoặc giá trị tính toán nặng). `useCallback` **không thực thi hàm**, mà nó trả về chính **tham chiếu của hàm đó** (dùng để giữ nguyên địa chỉ ô nhớ của hàm callback khi truyền xuống component con). Bản chất: `useCallback(fn, deps)` chỉ là cú pháp viết tắt của `useMemo(() => fn, deps)`.

2. **Câu hỏi:** Khi nào ta NÊN và KHÔNG NÊN sử dụng `useMemo`?
   - *Trả lời:* 
     - **NÊN dùng:** Khi thực hiện phép tính toán đắt đỏ (vòng lặp hàng nghìn phần tử, tính toán ma trận, lọc đồ thị), hoặc khi giá trị object/array được tính toán cần được truyền làm dependency cho `useEffect` hoặc làm prop cho component con bọc bởi `React.memo`.
     - **KHÔNG NÊN dùng:** Cho các phép toán số học, nối chuỗi đơn giản, hoặc khi component con không hề được bọc bởi `React.memo`.
