# 01. useState & Batching

Cơ chế hoạt động của `useState`, tính bất biến của trạng thái và kiến trúc Automatic Batching trong React 18.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Event Handling & Forms](file:///d:/my-project/revision-document/react/01-components-and-props/04-event-handling-and-forms.md)
- **Tiếp theo:** [useEffect & Lifecycle](file:///d:/my-project/revision-document/react/02-hooks-and-state/02-useeffect-and-lifecycle.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 State Là Gì?
Trong khi `props` là dữ liệu truyền từ ngoài vào (bất biến), thì `state` là **bộ nhớ cục bộ của component**.
Khi `state` thay đổi, React sẽ lên lịch (schedule) để kích hoạt lại hàm Component nhằm tính toán giao diện mới.

```javascript
const [count, setCount] = useState(0);
```

### 2.2 Cơ Chế Lưu Trữ Hooks Dưới Dạng Singly Linked List
React không lưu state bên trong biến cục bộ của hàm Component (vì mỗi lần render biến đó sẽ bị khai báo lại).
Thay vào đó, React lưu trữ trạng thái của từng hook trên **Fiber Node** tương ứng dưới dạng một **Danh sách liên kết đơn (Linked List)**:
```
FiberNode
  └── memoizedState ──> Hook1 (useState)
                           ├── memoizedState: 0
                           └── next ──> Hook2 (useEffect)
                                           ├── memoizedState: EffectObj
                                           └── next ──> null
```
Đây chính là lý do **Rules of Hooks** bắt buộc bạn chỉ được gọi Hook ở cấp cao nhất: Nếu thứ tự gọi hook bị thay đổi qua các khối `if`, các con trỏ `next` sẽ trỏ sai vị trí hook của lần render trước, làm sai lệch trạng thái!

### 2.3 Updater Function (Cập Nhật State Dồn Dập)
Nếu bạn gọi nhiều lần `setCount(count + 1)` liên tiếp:
```javascript
// Giả sử count đang là 0
setCount(count + 1); // setCount(0 + 1)
setCount(count + 1); // setCount(0 + 1)
setCount(count + 1); // setCount(0 + 1)
// Kết quả sau render: count chỉ tăng lên 1!
```
Vì trong lần render hiện tại, `count` là một hằng số cố định trong closure của hàm.
**Giải pháp: Dùng Updater Function**:
```javascript
setCount(prev => prev + 1); // hàng đợi: 0 -> 1
setCount(prev => prev + 1); // hàng đợi: 1 -> 2
setCount(prev => prev + 1); // hàng đợi: 2 -> 3
// Kết quả sau render: count tăng lên 3 chính xác!
```

### 2.4 React 18 Automatic Batching
- Trước React 18: Chỉ các lệnh `setState` trong React Event Handlers mới được gộp lại. Các lệnh bên trong `setTimeout` hay Promise sẽ kích hoạt re-render riêng lẻ.
- Từ React 18: **Mọi cập nhật state** dù ở bất kỳ đâu (Microtask, Macrotask, Native Listener) đều được tự động gộp (batched) thành **duy nhất 1 lần render** để tối ưu hóa hiệu năng tối đa.

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Sửa đổi trực tiếp State Đối Tượng (Object Mutation)
```javascript
const [user, setUser] = useState({ name: "Alice", score: 10 });

// ❌ SAI LẦM: Thay đổi trực tiếp thuộc tính
user.score = 20;
setUser(user); // React kiểm tra Object.is(oldUser, newUser) -> Thấy cùng địa chỉ ô nhớ -> KHÔNG RE-RENDER!

//  CÁCH ĐÚNG: Tạo đối tượng mới với Spread Operator:
setUser(prev => ({ ...prev, score: 20 }));
```

---

## 4. Code Thực Hành (Production Patterns)

```javascript
// Pattern: Quản lý danh sách phức tạp bất biến với useState
import { useState } from "react";

export function TodoApp() {
    const [todos, setTodos] = useState([
        { id: 1, text: "Learn React", done: true }
    ]);

    // Thêm mới (Immutable append)
    const addTodo = (text) => {
        const newTodo = { id: Date.now(), text, done: false };
        setTodos(prev => [...prev, newTodo]);
    };

    // Toggle trạng thái (Immutable update)
    const toggleTodo = (id) => {
        setTodos(prev => prev.map(item =>
            item.id === id ? { ...item, done: !item.done } : item
        ));
    };

    // Xóa (Immutable filter)
    const removeTodo = (id) => {
        setTodos(prev => prev.filter(item => item.id !== id));
    };

    return { todos, addTodo, toggleTodo, removeTodo };
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Tại sao React lại dựa vào tính bất biến (Immutability) của State thay vì cho phép mutate trực tiếp như Vue hay MobX?
   - *Trả lời:* React sử dụng kỹ thuật so sánh nông (Shallow Compare: `Object.is(prev, next)`) ở cấp độ địa chỉ tham chiếu ô nhớ để xác định trạng thái có thay đổi hay không với độ phức tạp $O(1)$. Nếu cho phép mutate trực tiếp, React sẽ phải so sánh đệ quy toàn bộ cây đối tượng (Deep Compare) với chi phí $O(n)$ cực kỳ chậm chạp. Tính bất biến cũng giúp các tính năng như Time Travel Debugging, Concurrency và Undo/Redo hoạt động hoàn hảo.

2. **Câu hỏi:** Trong React 18, nếu bạn thực sự muốn ép buộc một lệnh `setState` phải re-render ngay lập tức mà không bị gộp chung (Opt-out of batching), bạn làm thế nào?
   - *Trả lời:* Có thể sử dụng hàm `ReactDOM.flushSync(() => { setState(newValue); })`. Lệnh này buộc React thực thi cập nhật DOM ngay lập tức một cách đồng bộ. Tuy nhiên, nó nên được hạn chế tối đa vì có thể gây sụt giảm FPS của ứng dụng.
