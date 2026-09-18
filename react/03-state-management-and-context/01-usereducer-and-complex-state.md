# 01. useReducer & Complex State

Kiến trúc quản lý trạng thái phức tạp với `useReducer`, hàm thuần khiết Reducer, các hành động Action và cơ chế Dispatch trong React.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [useState & Batching](file:///d:/my-project/revision-document/react/02-hooks-and-state/01-usestate-and-batching.md)
- **Tiếp theo:** [Context API & Composition](file:///d:/my-project/revision-document/react/03-state-management-and-context/02-context-api-and-composition.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Tại Sao Cần `useReducer`?
Khi một Component có trạng thái gồm nhiều trường dữ liệu phụ thuộc lẫn nhau, hoặc khi bước chuyển trạng thái tiếp theo phụ thuộc vào trạng thái trước đó kèm logic nghiệp vụ rẽ nhánh phức tạp, việc dùng nhiều hàm `useState` riêng lẻ sẽ khiến mã nguồn bị phân mảnh và khó kiểm thử.

`useReducer` tách biệt rành mạch:
- **State:** Dữ liệu hiện tại của hệ thống.
- **Action:** Đối tượng mô tả "sự việc gì vừa xảy ra" (`{ type: "DEPOSIT", payload: 100 }`).
- **Reducer Function:** Hàm thuần khiết nhận `(state, action)` và tính toán ra `newState`:
  $$\text{Reducer}: (\text{State}, \text{Action}) \rightarrow \text{NewState}$$
- **Dispatch:** Hàm gửi action tới Reducer.

```javascript
const [state, dispatch] = useReducer(reducer, initialState);
```

### 2.2 So Sánh `useState` vs `useReducer`

| Tiêu chí | `useState` | `useReducer` |
| :--- | :--- | :--- |
| **Độ phức tạp dữ liệu** | Phù hợp giá trị đơn giản (number, string, boolean) | Phù hợp Object/Array nhiều trường phụ thuộc nhau |
| **Logic chuyển trạng thái** | Viết rải rác bên trong các event handler của Component | Gom tập trung 100% vào một hàm Reducer duy nhất |
| **Khả năng Unit Test** | Khó test logic riêng biệt vì dính vào UI Component | Cực kỳ dễ test vì Reducer chỉ là hàm JS thuần |
| **Tính ổn định của hàm cập nhật** | `setState` có identity ổn định | `dispatch` cũng có identity vĩnh viễn không đổi |

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Chứa Side Effects hoặc tính ngẫu nhiên bên trong Reducer
```javascript
// ❌ SAI LẦM: Reducer không còn thuần khiết!
function badReducer(state, action) {
    switch (action.type) {
        case "ADD":
            fetch("/api/save"); // ❌ Không được gọi API bên trong Reducer!
            return { ...state, time: Date.now() }; // ❌ Không dùng Date.now()!
    }
}
```
**Quy tắc vàng:** Reducer phải 100% Deterministic (cùng state và action truyền vào phải luôn cho ra đúng một kết quả duy nhất).

---

## 4. Code Thực Hành (Production Patterns)

```javascript
// Pattern: Shopping Cart Reducer hoàn chỉnh
const cartInitialState = {
    items: [],
    totalPrice: 0
};

export function cartReducer(state, action) {
    switch (action.type) {
        case "ADD_ITEM": {
            const existingIndex = state.items.findIndex(i => i.id === action.payload.id);
            let updatedItems;

            if (existingIndex >= 0) {
                updatedItems = state.items.map((item, idx) =>
                    idx === existingIndex ? { ...item, qty: item.qty + 1 } : item
                );
            } else {
                updatedItems = [...state.items, { ...action.payload, qty: 1 }];
            }

            const totalPrice = updatedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
            return { items: updatedItems, totalPrice };
        }

        case "REMOVE_ITEM": {
            const updatedItems = state.items.filter(i => i.id !== action.payload.id);
            const totalPrice = updatedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
            return { items: updatedItems, totalPrice };
        }

        case "CLEAR_CART":
            return cartInitialState;

        default:
            return state;
    }
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** `dispatch` trả về từ `useReducer` có bao giờ bị thay đổi địa chỉ tham chiếu giữa các lần re-render không?
   - *Trả lời:* Không bao giờ. React bảo đảm rằng danh tính của hàm `dispatch` luôn ổn định vĩnh viễn trong suốt vòng đời của Component. Do đó, bạn có thể truyền `dispatch` xuống các component con hoặc đưa vào dependency array của `useEffect`/`useCallback` mà không bao giờ kích hoạt re-render ngoài ý muốn.

2. **Câu hỏi:** Làm thế nào để khởi tạo State một cách lười biếng (Lazy Initialization) trong `useReducer`?
   - *Trả lời:* `useReducer` hỗ trợ tham số thứ 3 là hàm `init`: `useReducer(reducer, initialArg, init)`. Hàm `init(initialArg)` sẽ chỉ được gọi một lần duy nhất khi Component mount để tính toán trạng thái ban đầu, rất hữu ích khi cần đọc dữ liệu từ `localStorage` hoặc giải mã chuỗi cấu hình phức tạp mà không làm nghẽn các lần re-render tiếp theo.
