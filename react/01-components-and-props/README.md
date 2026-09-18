# Module 01: Components & Props

Chào mừng bạn đến với **Module 01: Components & Props**. Đây là viên gạch nền tảng đầu tiên cấu thành mọi ứng dụng React hiện đại, giải thích cội nguồn bản chất của JSX, cơ chế hoạt động của Virtual DOM, tính thuần khiết (Purity) của Functional Components, hợp đồng truyền dữ liệu Props một chiều (One-way Data Binding), các kỹ thuật kết xuất có điều kiện (Conditional Rendering), vòng lặp danh sách kèm thuộc tính `key` chuẩn xác và hệ thống sự kiện tổng hợp SyntheticEvent.

---

## Bản Đồ Học Tập (Learning Roadmap)

| Bài học | Nội dung cốt lõi | Mục tiêu đạt được |
| :--- | :--- | :--- |
| **[01. JSX & Virtual DOM](file:///d:/my-project/revision-document/react/01-components-and-props/01-jsx-and-virtual-dom.md)** | JSX Syntactic Sugar, `React.createElement` vs Modern `_jsx`, Cấu trúc VNode, Thuật toán Diffing Virtual DOM | Hiểu rõ vì sao JSX trả về Plain Object và cách React tối ưu hóa thao tác DOM thực tế. |
| **[02. Functional Components & Props](file:///d:/my-project/revision-document/react/02-components-and-props/02-functional-components-and-props.md)** | Pure Functions, Props Destructuring, Default Props, Thuộc tính `children`, Tính bất biến (Immutability) của Props | Xây dựng các UI components tái sử dụng, tuân thủ nghiêm ngặt tính thuần khiết (Pure Functions). |
| **[03. Conditional Rendering & Lists](file:///d:/my-project/revision-document/react/01-components-and-props/03-conditional-rendering-and-lists.md)** | Ternary `? :`, Short-circuit `&&` và bẫy số 0, Render danh sách bằng `.map()`, Thuộc tính `key` và bẫy dùng Array Index | Triệt tiêu hoàn toàn lỗi hiển thị số 0 ngoài ý muốn và lỗi tráo đổi state khi xóa/thêm phần tử danh sách. |
| **[04. Event Handling & Forms](file:///d:/my-project/revision-document/react/01-components-and-props/04-event-handling-and-forms.md)** | `SyntheticEvent`, Event Delegation tại Root, Controlled Components vs Uncontrolled Components (`ref`) | Nắm vững kỹ thuật thu thập và kiểm thực dữ liệu Form chuẩn doanh nghiệp. |

---

## File Thực Hành & Kiểm Thử Tự Động

- **File Demo Tổng Hợp**: [components_demo.mjs](file:///d:/my-project/revision-document/react/01-components-and-props/components_demo.mjs) — Mô phỏng cơ chế Render Tree và VNode của React trên Node.js v22.
- **File Tự Luyện & Chấm Điểm**: [practice.mjs](file:///d:/my-project/revision-document/react/01-components-and-props/practice.mjs) — Bộ 5 bài tập cấu trúc Component & Props kèm assertions tự động chấm qua `node:assert`.

---

## 3 Bẫy Phỏng Vấn Kinh Điển Cần Nhớ

1. **Bẫy `0 && <Component />`**: Trong JavaScript, `0 && anything` lượng giá thành số `0`. Do đó trong JSX, `{items.length && <List />}` sẽ in trực tiếp ký tự `0` lên màn hình thay vì ẩn đi nếu mảng rỗng! Luôn viết: `{items.length > 0 && <List />}`.
2. **Không bao giờ dùng mảng index làm `key` cho danh sách biến động**: Khi danh sách bị đảo thứ tự hoặc xóa phần tử ở giữa, React dựa vào index sẽ tái sử dụng nhầm các DOM node và Component state cũ, gây lỗi sai lệch dữ liệu nhập trong các thẻ `<input>`.
3. **Props là Readonly**: Bên trong Component, tuyệt đối không được gán lại `props.value = newValue`. Hành động này vi phạm nguyên lý dữ liệu một chiều và tính thuần khiết của hàm trong React.
