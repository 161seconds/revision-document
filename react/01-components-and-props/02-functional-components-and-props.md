# 02. Functional Components & Props

Mô hình hàm thuần khiết (Pure Functions), cơ chế bóc tách Props, thuộc tính đặc biệt `children` và nguyên lý dòng dữ liệu một chiều trong React.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [JSX & Virtual DOM](file:///d:/my-project/revision-document/react/01-components-and-props/01-jsx-and-virtual-dom.md)
- **Tiếp theo:** [Conditional Rendering & Lists](file:///d:/my-project/revision-document/react/01-components-and-props/03-conditional-rendering-and-lists.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Component Là Một Hàm Thuần Khiết (Pure Function)
Một Functional Component trong React bản chất chỉ là một JavaScript Function nhận vào đối số `props` và trả về một cây React Elements:
$$f(props) \rightarrow UI$$
React áp dụng triệt để nguyên tắc **Pure Functions**:
- **Không thay đổi (mutate) đối số đầu vào:** Tuyệt đối không sửa đổi `props`.
- **Cùng một đầu vào luôn cho ra cùng một kết quả:** Với cùng một tập `props`, component phải luôn trả về cùng một cấu trúc JSX.
- **Không sinh ra hiệu ứng lề (Side Effects) trong quá trình render:** Mọi thao tác ghi log vào network, sửa đổi biến toàn cục, hay hẹn giờ phải được đẩy sang `useEffect`.

### 2.2 Props Destructuring & Giá Trị Mặc Định
```jsx
// Sử dụng Destructuring trực tiếp trên danh sách tham số
function UserCard({ name, role = "Guest", isOnline = false, onAction }) {
    return (
        <div className="card">
            <h3>{name} <small>({role})</small></h3>
            <span className={isOnline ? "badge-online" : "badge-offline"}>
                {isOnline ? "Active" : "Away"}
            </span>
            {onAction && <button onClick={onAction}>Connect</button>}
        </div>
    );
}
```

### 2.3 Thuộc Tính Đặc Biệt `props.children`
`children` là một prop đặc biệt chứa toàn bộ các phần tử con được lồng ở giữa thẻ mở và thẻ đóng của Component:
```jsx
function Modal({ title, children, onClose }) {
    return (
        <div className="modal-backdrop">
            <div className="modal-box">
                <header>
                    <h2>{title}</h2>
                    <button onClick={onClose}>&times;</button>
                </header>
                {/* children đóng vai trò như một placeholder cho bất kỳ nội dung nào */}
                <main className="modal-content">{children}</main>
            </div>
        </div>
    );
}

// Cách sử dụng:
<Modal title="Delete Account" onClose={handleClose}>
    <p>Are you sure you want to permanently delete this user?</p>
    <button className="btn-danger">Confirm Delete</button>
</Modal>
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Sửa đổi trực tiếp Props (Props Mutation)
`props` trong React là đối tượng được đóng băng (Shallow Frozen). Thao tác gán lại sẽ ném lỗi trong strict mode hoặc gây ra lỗi sai lệch giao diện:
```jsx
// ❌ CẤM KỴ:
function Counter(props) {
    props.count = props.count + 1; // ❌ TypeError: Cannot assign to read only property 'count'
    return <div>{props.count}</div>;
}
```

### Bẫy 2: Biến phụ thuộc cục bộ bị tạo mới ngoài ý muốn
Khi truyền đối tượng hoặc hàm inline qua Props (`style={{ color: "red" }}` hoặc `onClick={() => doSomething()}`), một tham chiếu mới được tạo ra ở mỗi chu kỳ render. Điều này sẽ vô hiệu hóa hoàn toàn cơ chế tối ưu hóa của `React.memo` ở component con.

---

## 4. Code Thực Hành (Production Patterns)

```jsx
// Pattern: Polymorphic Card Component với TypeScript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
    isLoading?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = "primary",
    isLoading = false,
    disabled,
    children,
    className = "",
    ...rest
}: ButtonProps) {
    const baseStyle = "px-4 py-2 rounded font-medium transition-colors";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700"
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading ? <span className="spinner">Loading...</span> : children}
        </button>
    );
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Tại sao `props` trong React lại là bất biến (Read-only / Immutable)?
   - *Trả lời:* Tính bất biến của `props` bảo đảm kiến trúc dòng dữ liệu một chiều (One-way Data Binding) từ cha xuống con. Nếu component con có thể tùy tiện sửa đổi dữ liệu của cha, trạng thái của toàn bộ ứng dụng sẽ trở nên bất định, khó truy vết nguồn gốc lỗi (debugging), và làm vô hiệu hóa khả năng so sánh nông (Shallow Compare) cực nhanh của thuật toán Reconciliation.

2. **Câu hỏi:** Phân biệt cơ chế truyền giao diện qua `props.children` và Render Props (`render={() => ...}`)?
   - *Trả lời:* `props.children` truyền trực tiếp các React Element tĩnh đã được tạo sẵn từ component cha vào component con (phù hợp cho Wrapper/Layout components). Render Props truyền một **Function** vào component con; component con sẽ gọi hàm này và truyền ngược lại trạng thái nội bộ của nó vào các tham số của hàm, giúp chia sẻ logic và dữ liệu từ con ngược lên hàm render của cha.
