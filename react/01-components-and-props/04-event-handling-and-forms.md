# 04. Event Handling & Forms

Hệ thống sự kiện tổng hợp `SyntheticEvent`, kiến trúc Event Delegation tại Root Container và so sánh giữa Controlled Components vs Uncontrolled Components trong React.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Conditional Rendering & Lists](file:///d:/my-project/revision-document/react/01-components-and-props/03-conditional-rendering-and-lists.md)
- **Tiếp theo:** [Module 02: Hooks & State](file:///d:/my-project/revision-document/react/02-hooks-and-state/README.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Hệ Thống Sự Kiện Tổng Hợp (`SyntheticEvent`)
React không gắn trực tiếp các hàm lắng nghe sự kiện lên từng phần tử HTML DOM riêng lẻ (như `button.onclick`).
Thay vào đó, React triển khai cơ chế **Event Delegation**:
- Trong React 17+, toàn bộ sự kiện được lắng nghe tại **Root DOM Container** nơi bạn gọi `ReactDOM.createRoot(rootElement)`.
- Khi người dùng click, sự kiện nổi bọt (bubbles) lên Root. React sẽ đóng gói sự kiện gốc của trình duyệt thành một đối tượng gọi là **`SyntheticEvent`**.
- `SyntheticEvent` chuẩn hóa hành vi sự kiện đồng nhất trên mọi trình duyệt (Cross-browser Wrapper) và cung cấp các hàm quen thuộc: `e.preventDefault()`, `e.stopPropagation()`.

### 2.2 Controlled Components vs Uncontrolled Components

| Tiêu chí | Controlled Component | Uncontrolled Component |
| :--- | :--- | :--- |
| **Nguồn chân lý (Source of Truth)** | React State (`useState`) | DOM Node (`HTMLInputElement.value`) |
| **Cách đọc dữ liệu** | Đọc trực tiếp từ biến `state` | Dùng `ref.current.value` |
| **Xử lý thay đổi** | Cập nhật qua sự kiện `onChange` | Trình duyệt tự cập nhật nội bộ |
| **Validation ngay khi gõ** |  Rất dễ dàng (Disable nút Submit ngay lập tức) | ❌ Khó khăn, phải đợi submit mới kiểm tra |
| **Hiệu năng khi form cực lớn** | Có thể re-render nhiều nếu state đặt quá cao | Nhanh hơn vì không kích hoạt re-render khi gõ |

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Gọi hàm ngay lập tức thay vì truyền hàm tham chiếu trong `onClick`
```jsx
// ❌ LỖI NGHIÊM TRỌNG: Hàm handleDelete(id) bị chạy NGAY LẬP TỨC khi render!
<button onClick={handleDelete(user.id)}>Delete</button>

//  CÁCH ĐÚNG: Bọc trong một arrow function:
<button onClick={() => handleDelete(user.id)}>Delete</button>
```

### Bẫy 2: Chuyển đổi từ Uncontrolled sang Controlled ngoài ý muốn
Nếu bạn khởi tạo state bằng `undefined` hoặc `null`, input ban đầu sẽ là Uncontrolled. Khi state nhận giá trị chuỗi sau đó, React sẽ ném cảnh báo:
`A component is changing an uncontrolled input to be controlled.`
**Khắc phục:** Luôn khởi tạo chuỗi rỗng: `useState("")` thay vì `useState()`.

---

## 4. Code Thực Hành (Production Patterns)

```jsx
// Pattern: Xử lý Form nhiều trường dữ liệu gọn gàng với Controlled Component
import { useState } from "react";

export function RegisterForm({ onSubmit }) {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        agreeTerms: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Ngăn trình duyệt reload trang
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Username:</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                    />
                    I agree to terms
                </label>
            </div>
            <button type="submit" disabled={!formData.agreeTerms}>
                Register
            </button>
        </form>
    );
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Cơ chế Event Delegation trong React 17+ khác gì so với React 16 trở về trước?
   - *Trả lời:* Trong React 16, React gắn tất cả các event listener lên cấp cao nhất là đối tượng `document`. Điều này gây ra lỗi xung đột sự kiện khi nhúng nhiều phiên bản React khác nhau trên cùng một trang web (Micro-frontends). Trong React 17+, React đã dời toàn bộ event listeners từ `document` xuống chính **Root DOM Node** của cây ứng dụng (`#root`), giúp các ứng dụng React lồng ghép hoạt động hoàn toàn độc lập và không can thiệp vào sự kiện của nhau.

2. **Câu hỏi:** `e.preventDefault()` trong React có thay thế được câu lệnh `return false;` như trong HTML thuần không?
   - *Trả lời:* Không. Trong HTML thuần (`<form onsubmit="return false">`), trả về `false` sẽ chặn hành vi submit mặc định. Trong React, việc trả về `false` trong event handler hoàn toàn không có tác dụng; bạn bắt buộc phải gọi tường minh phương thức `e.preventDefault()`.
