# 01. JSX & Virtual DOM

Bản chất chuyển đổi của JSX, cấu trúc React Element và thuật toán Reconciliation của Virtual DOM.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [JavaScript ES6+ & DOM](file:///d:/my-project/revision-document/javascript/01-fundamentals/README.md)
- **Tiếp theo:** [Functional Components & Props](file:///d:/my-project/revision-document/react/01-components-and-props/02-functional-components-and-props.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Bản Chất Của JSX: Không Phải Phép Thuật
Trình duyệt web không thể đọc hoặc thực thi trực tiếp cú pháp JSX (`<div className="box">Hello</div>`).
Trước khi đến trình duyệt, một bộ chuyển mã (Babel, SWC, esbuild) sẽ biên dịch JSX thành các hàm JavaScript thuần túy:

1. **Cơ chế Classic (React < 17):**
   ```javascript
   // JSX:
   <h1 className="title">Hello World</h1>

   // Được biên dịch thành:
   React.createElement("h1", { className: "title" }, "Hello World");
   ```
2. **Cơ chế Modern JSX Transform (React 17+):**
   Tự động import runtime ngầm, không cần phải `import React from 'react'` ở đầu file:
   ```javascript
   import { jsx as _jsx } from "react/jsx-runtime";
   _jsx("h1", { className: "title", children: "Hello World" });
   ```

### 2.2 React Element (VNode) Là Gì?
Lời gọi `React.createElement(...)` chỉ đơn giản trả về một **JavaScript Plain Object bất biến** miêu tả nút giao diện:
```javascript
{
  $$typeof: Symbol.for("react.element"), // Dấu ấn an toàn chống XSS injection
  type: "h1",
  key: null,
  ref: null,
  props: {
    className: "title",
    children: "Hello World"
  }
}
```
> **Tại sao có `$$typeof: Symbol.for("react.element")`?**
> Nếu kẻ tấn công cố gắng nhúng mã JSON độc hại từ server vào client, JSON thuần túy không thể chứa dữ liệu kiểu `Symbol`. Nhờ có trường này, React sẽ từ chối render các đối tượng giả mạo, ngăn chặn tuyệt đối lỗ hổng bảo mật Cross-Site Scripting (XSS).

### 2.3 Virtual DOM & Thuật Toán Diffing
- Thao tác trực tiếp trên Real DOM rất tốn kém (gây ra Layout Reflow và Style Repaint trên trình duyệt).
- **Virtual DOM** là bản sao đại diện nhẹ trong bộ nhớ RAM.
- Khi có thay đổi, React tạo ra một cây Virtual DOM mới, so sánh (Diffing) với cây Virtual DOM cũ với độ phức tạp thuật toán tối ưu $O(n)$ dựa trên 2 giả định thực tế:
  1. Hai phần tử khác kiểu (`<div>` đổi thành `<span>`) sẽ tạo ra hai cây hoàn toàn khác biệt (hủy cây cũ, dựng lại cây mới).
  2. Các phần tử con trong danh sách có thể được giữ nguyên nếu chúng có cùng thuộc tính `key`.

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: JSX bắt buộc phải có duy nhất một thẻ cha (Single Root Element)
Vì mỗi hàm JavaScript chỉ có thể `return` về một giá trị duy nhất (tức một lời gọi `React.createElement`), bạn không thể trả về 2 thẻ đồng cấp mà không bọc chúng:
```jsx
// ❌ LỖI CÚ PHÁP:
return (
    <h1>Header</h1>
    <p>Content</p>
);

//  GIẢI PHÁP: Sử dụng React Fragment (<></>) để tránh sinh thêm thẻ div thừa trong DOM:
return (
    <>
        <h1>Header</h1>
        <p>Content</p>
    </>
);
```

---

## 4. Code Thực Hành (Production Patterns)

```javascript
// Mô phỏng cơ chế createElement thuần túy
export function createElement(type, props, ...children) {
    return {
        $$typeof: Symbol.for("react.element"),
        type,
        props: {
            ...props,
            children: children.length === 1 ? children[0] : children
        }
    };
}

// Xây dựng cây VNode
const vnode = createElement(
    "div",
    { className: "container", id: "app-root" },
    createElement("h1", null, "Virtual DOM Demo"),
    createElement("p", null, "React element is just a plain JS object.")
);

console.log(JSON.stringify(vnode, null, 2));
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Virtual DOM là gì và tại sao nó lại giúp tăng hiệu năng cho ứng dụng web?
   - *Trả lời:* Virtual DOM là cấu trúc dữ liệu cây dạng đối tượng JavaScript thuần trong bộ nhớ RAM, ánh xạ với cấu trúc DOM thực tế của trình duyệt. Nó tăng hiệu năng bằng cách gộp nhiều thay đổi lại với nhau (batching) và sử dụng thuật toán Reconciliation (Diffing) để chỉ tính toán ra tập hợp tối thiểu các thay đổi thực sự cần cập nhật lên Real DOM, từ đó giảm thiểu tối đa các đợt Browser Reflow và Repaint tốn kém tài nguyên.

2. **Câu hỏi:** Thuộc tính `$$typeof` trong một React Element giải quyết lỗ hổng bảo mật nào?
   - *Trả lời:* Nó giải quyết lỗ hổng XSS (Cross-Site Scripting). Nếu một API trả về payload JSON có cấu trúc giả mạo một React Element chứa mã độc trong thẻ `<script>`, React sẽ kiểm tra trường `$$typeof`. Do `Symbol.for("react.element")` không thể được tuần tự hóa qua chuỗi JSON, đối tượng JSON từ server sẽ không có Symbol hợp lệ và React sẽ từ chối render đối tượng này.
