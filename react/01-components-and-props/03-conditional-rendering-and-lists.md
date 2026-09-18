# 03. Conditional Rendering & Lists

Các kỹ thuật kết xuất giao diện theo điều kiện, xử lý danh sách động với hàm `.map()` và bản chất của thuộc tính `key` trong React.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Functional Components & Props](file:///d:/my-project/revision-document/react/01-components-and-props/02-functional-components-and-props.md)
- **Tiếp theo:** [Event Handling & Forms](file:///d:/my-project/revision-document/react/01-components-and-props/04-event-handling-and-forms.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Kết Xuất Có Điều Kiện (Conditional Rendering)
Trong JSX, có 3 cách kết xuất theo điều kiện phổ biến:
1. **Câu lệnh `if-else` truyền thống:** Phù hợp khi muốn return một nhánh giao diện hoàn toàn khác (ví dụ màn hình Loading hoặc Error).
2. **Toán tử 3 ngôi (`condition ? <True /> : <False />`):** Phù hợp khi cần chuyển đổi giữa hai trạng thái UI trực tiếp trong biểu thức JSX.
3. **Toán tử logic AND (`condition && <Element />`):** Phù hợp khi chỉ muốn hiển thị nếu điều kiện đúng, và không hiển thị gì (`null`) nếu điều kiện sai.

### 2.2 Hiển Thị Danh Sách Với `.map()`
Trong React, danh sách được tạo ra bằng cách biến đổi mảng dữ liệu thành mảng các React Elements thông qua phương thức thuần khiết `Array.prototype.map`:
```jsx
const users = [
    { id: "u_1", name: "Alice" },
    { id: "u_2", name: "Bob" }
];

function UserList() {
    return (
        <ul>
            {users.map(user => (
                <li key={user.id}>{user.name}</li>
            ))}
        </ul>
    );
}
```

### 2.3 Bản Chất Sâu Sắc Của Thuộc Tính `key`
Thuộc tính `key` là một chuỗi định danh đặc biệt mà React sử dụng trong quá trình **Reconciliation (Diffing)** để nhận diện các phần tử trong danh sách:
- Khi một danh sách thay đổi (thêm mới, xóa bỏ, đảo thứ tự sắp xếp), React cần biết phần tử nào là cũ để giữ nguyên DOM node, và phần tử nào thực sự mới để tạo mới.
- **Nếu không có `key`:** React phải so sánh theo thứ tự vị trí mảng (Index). Nếu bạn chèn một phần tử vào đầu danh sách, React sẽ tưởng rằng tất cả các phần tử đều bị thay đổi nội dung, dẫn tới việc vẽ lại (re-render) toàn bộ danh sách, gây sụt giảm nghiêm trọng về hiệu năng!

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Bẫy Số 0 Trong Toán Tử Logic AND (`&&`)
Trong JavaScript, biểu thức `0 && anything` sẽ trả về `0` chứ không phải `false`.
React coi `false`, `null`, `undefined` là các giá trị không cần vẽ gì ra màn hình, nhưng **số `0` là một giá trị hợp lệ** và sẽ được in trực tiếp ra HTML!
```jsx
// ❌ LỖI PHỔ BIẾN:
const unreadMessages = [];
return (
    <div>
        {/* Nếu unreadMessages rỗng (length === 0), màn hình sẽ hiển thị số "0" trơ trọi! */}
        {unreadMessages.length && <Badge count={unreadMessages.length} />}
    </div>
);

//  CÁCH KHẮC PHỤC TRIỆT ĐỂ:
// Cách 1: So sánh lớn hơn 0
{unreadMessages.length > 0 && <Badge count={unreadMessages.length} />}

// Cách 2: Ép kiểu sang boolean rõ ràng
{Boolean(unreadMessages.length) && <Badge count={unreadMessages.length} />}
```

### Bẫy 2: Dùng Array Index làm `key`
```jsx
// ❌ NGUY HIỂM VỚI DANH SÁCH BIẾN ĐỘNG:
{items.map((item, index) => (
    <TodoItem key={index} text={item.text} />
))}
```
Khi bạn xóa phần tử đầu tiên:
- Phần tử thứ hai được đôn lên vị trí `index = 0`.
- React thấy `key = 0` vẫn tồn tại, nên nó tái sử dụng lại DOM node và **Component State nội bộ của phần tử cũ** cho phần tử mới! Kết quả: Checkbox hoặc input text sẽ hiển thị sai dữ liệu của item đã bị xóa.

---

## 4. Code Thực Hành (Production Patterns)

```jsx
// Pattern: Render danh sách với xử lý Empty State & Loading State chuẩn mực
export function ProductCatalog({ products, isLoading, error }) {
    if (isLoading) {
        return <div className="skeleton-loader">Đang tải sản phẩm...</div>;
    }

    if (error) {
        return <div className="alert-error">Lỗi tải dữ liệu: {error.message}</div>;
    }

    if (!products || products.length === 0) {
        return <div className="empty-state">Không tìm thấy sản phẩm nào phù hợp.</div>;
    }

    return (
        <div className="product-grid">
            {products.map(product => (
                <article key={product.id} className="product-card">
                    <h4>{product.title}</h4>
                    <p className="price">${product.price.toFixed(2)}</p>
                    {product.isFeatured && <span className="badge">Nổi bật</span>}
                </article>
            ))}
        </div>
    );
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Tại sao không nên dùng `Math.random()` để sinh `key` cho các phần tử trong danh sách?
   - *Trả lời:* Mỗi khi component re-render, `Math.random()` sẽ sinh ra một chuỗi `key` hoàn toàn mới cho từng phần tử. React sẽ so sánh key cũ và key mới, kết luận rằng tất cả các phần tử cũ đã bị xóa sạch và tất cả các phần tử hiện tại là mới tinh. Hệ quả: React sẽ phá hủy toàn bộ DOM tree cũ và dựng lại từ đầu ở mỗi lần render, làm mất toàn bộ focus của input, mất trạng thái nội bộ của component và làm sụt giảm nghiêm trọng hiệu năng ứng dụng.

2. **Câu hỏi:** Trong những trường hợp cụ thể nào thì việc sử dụng Array `index` làm `key` được coi là an toàn và chấp nhận được?
   - *Trả lời:* Dùng `index` làm key chỉ an toàn khi thỏa mãn đồng thời 3 điều kiện: (1) Danh sách là tĩnh (không bao giờ được thêm, xóa hoặc sắp xếp lại thứ tự), (2) Các phần tử trong danh sách không có ID độc nhất tự nhiên từ database, và (3) Component con không chứa trạng thái nội bộ (Uncontrolled State) như input field hay checkbox.
