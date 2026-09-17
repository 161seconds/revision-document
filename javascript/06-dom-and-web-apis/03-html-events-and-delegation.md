# Cơ Chế Sự Kiện & Ủy Quyền Sự Kiện (HTML Events & Event Delegation)

Tài liệu chuyên sâu về kiến trúc hướng sự kiện (Event-Driven Architecture) trong trình duyệt: 3 giai đoạn của luồng sự kiện (Capturing, Target, Bubbling), giải phẫu `addEventListener` với các cờ `passive`, `once`, `capture`, phân biệt `target` vs `currentTarget`, và mẫu thiết kế ủy quyền sự kiện (Event Delegation) tối ưu bộ nhớ.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-html-dom-architecture-and-selectors.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/01-html-dom-architecture-and-selectors.md) (Cây DOM và `closest()`).
  - [02-dom-manipulation-and-styles.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/02-dom-manipulation-and-styles.md) (Thao tác phần tử động).
- **Mở rộng tiếp theo (Next Steps):**
  - [04-html-first-and-progressive-enhancement.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/04-html-first-and-progressive-enhancement.md) (Xử lý form và Progressive Enhancement).
  - [05-dom-animations-and-raf.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/05-dom-animations-and-raf.md) (Sự kiện cuộn Scroll và requestAnimationFrame).
- **Khái niệm liên quan (Related):**
  - DOM Level 2 Event Model.
  - Mẫu thiết kế Event Delegation (Ủy quyền).
  - Khử rung (Debounce) và Giới hạn tốc độ (Throttle) cho sự kiện liên tục.

---

## 2. Bản Chất Hoạt Động (Mental Model: 3 Giai Đoạn Của Luồng Sự Kiện)

### 1. Luồng Sự Kiện (Event Flow / Event Propagation)
Khi một người dùng nhấp chuột vào một nút bấm `<button>` nằm sâu trong cây HTML:
```
Window ──► Document ──► <body> ──► <div> ──► <button>
  │                                             │
  ▼ (1. Capturing Phase - Lan truyền xuống)     ▼ (2. Target Phase)
Window ◄── Document ◄── <body> ◄── <div> ◄──────┘
  ▲
  │ (3. Bubbling Phase - Nổi bọt ngược lên)
```

1. **Giai đoạn Lan truyền xuống (Capturing Phase)**: Sự kiện đi từ `window` xuyên qua `document`, `body`, các thẻ cha xuống đến thẻ con.
2. **Giai đoạn Đích (Target Phase)**: Sự kiện chạm tới phần tử đích nơi sự kiện thực sự phát sinh (`event.target`).
3. **Giai đoạn Nổi bọt (Bubbling Phase)**: Sự kiện đi ngược từ phần tử đích lên các cấp cha, kết thúc tại `window`. Hầu hết các sự kiện mặc định đều lắng nghe ở pha này.

---

### 2. Các Cờ Tùy Chọn Của `addEventListener(type, listener, options)`

```javascript
element.addEventListener("click", handler, {
  capture: false, // true: Lắng nghe ở pha Capturing; false: Lắng nghe ở pha Bubbling (Mặc định)
  once: true,     // Tự động gỡ bỏ listener sau lần kích hoạt đầu tiên (Giải phóng bộ nhớ!)
  passive: true   // Cam kết handler KHÔNG gọi e.preventDefault(), giúp cuộn trang siêu mượt (60fps)!
});
```

---

### 3. Phân Biệt: `event.target` vs `event.currentTarget`
- **`event.target`**: Phần tử sâu nhất thực sự kích hoạt sự kiện (nơi con trỏ chuột click trúng).
- **`event.currentTarget`**: Phần tử hiện tại đang chứa trình lắng nghe `addEventListener` (tương đương con trỏ `this` trong hàm handler thông thường).

---

### 4. Bộ Ba Điều Khiển Lan Truyền Sự Kiện

| Phương thức | Tác dụng | Khi nào dùng |
| :--- | :--- | :--- |
| **`e.preventDefault()`** | **Chặn hành vi mặc định** của trình duyệt (chặn mở link `<a>`, chặn submit `<form>`). | Kiểm tra form trước khi gửi, custom context menu |
| **`e.stopPropagation()`** | **Chặn sự kiện nổi bọt** lên các phần tử cha tiếp theo. | Ngăn click vào modal con làm đóng modal cha |
| **`e.stopImmediatePropagation()`**| Chặn nổi bọt VÀ **chặn luôn các listener khác** gắn trên cùng phần tử đó. | Quản lý logic ưu tiên tuyệt đối |

---

### 5. Mẫu Thiết Kế Ủy Quyền Sự Kiện (Event Delegation)
**Bài toán:** Một danh sách `<ul>` chứa 10.000 phần tử `<li>`. Nếu bạn lặp qua 10.000 phần tử để gắn `li.addEventListener("click", ...)`, bộ nhớ RAM sẽ bị phình to và các thẻ `<li>` thêm mới bằng Ajax sẽ không nhận được sự kiện!

**Giải pháp Event Delegation:** Gắn **1 listener duy nhất** lên thẻ cha `<ul>`. Khi người dùng click vào bất kỳ `<li>` nào, sự kiện sẽ nổi bọt lên `<ul>`, ta dùng `e.target.closest("li")` để xử lý:

```javascript
const todoList = document.querySelector("#todo-list");

todoList.addEventListener("click", (e) => {
  const item = e.target.closest(".todo-item");
  if (!item || !todoList.contains(item)) return;

  if (e.target.matches(".btn-delete")) {
    item.remove();
  } else {
    item.classList.toggle("completed");
  }
});
```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy quên gỡ bỏ Event Listener khi component bị hủy (Memory Leak)
Nếu hàm handler là một hàm ẩn danh (Anonymous function):
```javascript
window.addEventListener("resize", () => doSomething());
// KHÔNG THỂ GỠ BỎ ĐƯỢC! Vì mỗi hàm ẩn danh là một tham chiếu ô nhớ mới!
```
➔ **Giải pháp:** Luôn đặt tên cho hàm handler để có thể gọi `removeEventListener(type, handler)`.

### 2. Nhầm lẫn `e.target` với `e.currentTarget` trong Event Delegation
Nếu thẻ `<button>` chứa icon `<span>`:
```html
<button id="saveBtn"><span class="icon">💾</span> Lưu</button>
```
Khi người dùng bấm trúng icon, `e.target` là thẻ `<span>`, còn `e.currentTarget` là `<button>`. Nếu bạn kiểm tra `if (e.target.id === "saveBtn")` thì điều kiện sẽ bị sai!
➔ **Giải pháp:** Dùng `e.target.closest("#saveBtn")`.

---

## 4. File Code Thực Hành

- [03-events-delegation-demo.js](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/03-events-delegation-demo.js): Code thực nghiệm mô phỏng toàn bộ luồng sự kiện 3 giai đoạn (Capturing, Target, Bubbling), kiểm chứng cờ `once`, `stopPropagation`, `preventDefault`, và cơ chế Event Delegation hiệu năng cao. Chạy bằng: `node 03-events-delegation-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Lợi ích kỹ thuật của việc thiết lập cờ `{ passive: true }` trên các sự kiện như `touchstart` và `wheel` là gì?**
   *Đáp án:* Khi người dùng chạm hoặc cuộn trang, trình duyệt bình thường phải chờ xem mã JavaScript trong event listener có gọi `e.preventDefault()` để hủy cuộn hay không trước khi thực hiện lăn màn hình, gây ra độ trễ giật lag (Scroll Jank). Bằng cách khai báo `passive: true`, lập trình viên cam kết không bao giờ gọi `preventDefault()`, cho phép trình duyệt tiến hành cuộn trang mượt mà 60 FPS trên một luồng Compositor riêng biệt ngay lập tức mà không bị chặn bởi luồng chính JavaScript.

2. **Tại sao kỹ thuật Event Delegation lại giúp hỗ trợ tốt các phần tử được thêm mới động vào cây DOM?**
   *Đáp án:* Vì trình lắng nghe sự kiện được gắn cố định trên phần tử cha tổ tiên đã tồn tại từ trước. Khi một phần tử con mới được sinh ra tại thời điểm chạy (runtime) và được người dùng tương tác, sự kiện từ phần tử con đó vẫn tự động nổi bọt (Bubble) lên phần tử cha theo đúng quy luật của DOM Event Flow, do đó phần tử cha vẫn bắt và xử lý được sự kiện của phần tử mới mà không cần phải gọi lại `addEventListener`.
