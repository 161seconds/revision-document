# Browser Rendering Pipeline, Reflow & requestAnimationFrame

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [02-dom-manipulation-and-styles.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/02-dom-manipulation-and-styles.md) (DOM/CSSOM manipulation, `classList` vs inline styles).
  - [03-html-events-and-delegation.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/03-html-events-and-delegation.md) (Event Loop, Macrotask vs Microtask).
- **Khái niệm tương quan**:
  - **V-Sync & Frame Budget**: Màn hình 60Hz làm mới mỗi `16.67ms` (1000ms / 60), màn hình 120Hz làm mới mỗi `8.33ms`. Mọi tác vụ JS và Render phải gói gọn trong khoảng thời gian này để tránh rớt khung hình (Jank/Stutter).
  - **Compositor Thread & Hardware Acceleration**: Tách layer riêng biệt lên GPU thông qua `transform: translateZ(0)` hoặc `will-change: transform`.
- **Điểm đến tiếp theo**:
  - [06-dom-and-events-reference.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/06-dom-and-events-reference.md) (Master Reference Cheatsheet cho DOM & Events).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Chu Trình Hiển Thị Của Trình Duyệt (Critical Rendering Path)
Để hiển thị một pixel lên màn hình, Browser Engine (Blink/WebKit/Gecko) trải qua 5 bước tuần tự:

```
HTML --------> DOM Tree \
                         +--> Render Tree --> Layout (Reflow) --> Paint (Repaint) --> Composite (GPU)
CSS ---------> CSSOM   /
```

1. **DOM & CSSOM Tree**: Phân tích mã nguồn HTML và CSS thành các cây đối tượng C++.
2. **Render Tree**: Kết hợp DOM và CSSOM, loại bỏ các node ẩn (`display: none` không xuất hiện trong Render Tree, nhưng `visibility: hidden` vẫn tồn tại vì chiếm không gian).
3. **Layout (Reflow)**: Tính toán hình học chính xác (kích thước hình hộp `width`, `height` và vị trí tọa độ `x`, `y` trên viewport).
4. **Paint (Repaint)**: Điền các pixel màu sắc, viền, đổ bóng (shadow), văn bản vào các lớp bitmap (layers).
5. **Composite**: GPU hòa trộn các layers lại với nhau để xuất ra frame cuối cùng trên màn hình.

### 2.2. Chi Phí Hiệu Năng Của Thay Đổi Style

| Thuộc tính thay đổi | Reflow? | Repaint? | Composite? | Đánh giá hiệu năng |
| :--- | :---: | :---: | :---: | :--- |
| `width`, `height`, `top`, `margin`, `padding` | **CÓ** | **CÓ** | **CÓ** | 🔴 Cực kỳ nặng (Ép tính toán lại toàn trang) |
| `color`, `background-color`, `box-shadow` | ❌ | **CÓ** | **CÓ** | 🟡 Trung bình (Tô lại pixel mà không đổi vị trí) |
| `transform` (`translate`, `scale`), `opacity` | ❌ | ❌ | **CÓ** | 🟢 Siêu nhanh (GPU Compositor xử lý độc lập) |

### 2.3. Hiện Tượng Layout Thrashing (Forced Synchronous Layout)
Bình thường, trình duyệt rất thông minh: nó gom (batch) các thao tác sửa DOM lại và chỉ Reflow một lần duy nhất vào cuối frame.
Tuy nhiên, nếu bạn vừa **GHI (Write style)** rồi lập tức **ĐỌC (Read layout metric)** trong một vòng lặp:
```javascript
// ❌ Anti-Pattern: Layout Thrashing
for (let i = 0; i < elements.length; i++) {
  elements[i].style.width = elements[i].offsetWidth + 10 + "px";
  // elements[i].style.width = ... -> Ghi (Đánh dấu Dirty)
  // elements[i].offsetWidth        -> Đọc ngay -> Ép trình duyệt Reflow tức thì!
}
```
Mỗi lần đọc `offsetWidth`, trình duyệt không thể chờ đến cuối frame mà **bắt buộc phải dừng toàn bộ luồng JS để Reflow lại toàn trang ngay lập tức**. Nếu lặp 100 lần, trang web sẽ bị Reflow 100 lần liên tiếp gây đơ lag màn hình (Jank).

### 2.4. requestAnimationFrame (rAF) vs setInterval / setTimeout
- **Sự thất bại của `setInterval(fn, 16.6)`**:
  - `setInterval` là Macrotask, bị trễ bởi hàng đợi sự kiện (Timer Jitter).
  - Không khớp với nhịp quét dọc của màn hình (V-Sync).
  - Vẫn chạy đều đặn ngay cả khi người dùng thu nhỏ trình duyệt hoặc mở tab khác -> Lãng phí pin và CPU.
- **Sức mạnh của `requestAnimationFrame(callback)`**:
  - Trình duyệt tự động gọi hàm callback **ngay trước khi màn hình chuẩn bị Paint frame tiếp theo**.
  - Tự động đồng bộ với tốc độ làm tươi màn hình (60Hz, 120Hz ProMotion, 144Hz Gaming).
  - Tự động tạm dừng (pause) khi tab bị ẩn hoặc thu nhỏ.
  - Cung cấp `DOMHighResTimeStamp` chính xác (microsecond) để tính **Delta Time** ($\Delta t$).

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Làm Hoạt Họa Không Phụ Thuộc Vào Delta Time (FPS Lock Trap)
```javascript
// ❌ SAI LẦM: Tăng khoảng cách cố định mỗi frame
let pos = 0;
function animate() {
  pos += 5; // Màn hình 60Hz sẽ đi 300px/giây, nhưng màn hình 120Hz sẽ đi 600px/giây!
  box.style.transform = `translateX(${pos}px)`;
  requestAnimationFrame(animate);
}

// ✅ ĐÚNG: Tính toán quãng đường dựa trên Delta Time thực tế
let lastTime = null;
let pos = 0;
const speed = 200; // 200 pixels trên mỗi giây

function animate(currentTime) {
  if (lastTime === null) lastTime = currentTime;
  const deltaTime = (currentTime - lastTime) / 1000; // Chuyển sang giây
  pos += speed * deltaTime;
  box.style.transform = `translateX(${pos}px)`;
  lastTime = currentTime;

  if (pos < 500) {
    requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);
```

### Bẫy 2: Animate Bằng `top`, `left`, `margin` Thay Vì `transform`
- `top` / `left` kích hoạt chu trình **Layout -> Paint -> Composite**. CPU phải tính toán lại khung hình, gây giật lag ở thiết bị yếu.
- `transform` kích hoạt duy nhất tầng **Composite** trên GPU, đạt 60fps/120fps mượt như nhung.

### Bẫy 3: Quên Huỷ Hoạt Họa Bằng `cancelAnimationFrame` Khi Component Bị Unmount
- Trong ứng dụng SPA (React, Vue) hoặc Web Component, nếu bắt đầu vòng lặp rAF mà không lưu `animationId` để `cancelAnimationFrame(id)` khi hủy giao diện, hàm rAF sẽ tiếp tục chạy ngầm trong bộ nhớ vĩnh viễn gây memory leak và nóng máy.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [05-dom-animations-demo.js](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/05-dom-animations-demo.js)

### Mẫu FastDOM: Tách Biệt Tuyệt Đối Pha Đọc & Pha Ghi
```javascript
// Thay vì xen kẽ đọc-ghi gây Layout Thrashing:
const cards = document.querySelectorAll(".card");

// PHA 1: READ ONLY (Trình duyệt không cần reflow lại giữa chừng)
const targetWidths = Array.from(cards).map(card => {
  return card.parentElement.offsetWidth * 0.5;
});

// PHA 2: WRITE ONLY (Trình duyệt gom toàn bộ lại và chỉ Reflow 1 lần duy nhất)
cards.forEach((card, index) => {
  card.style.width = `${targetWidths[index]}px`;
});
```

### Sử Dụng Web Animations API (WAAPI)
```javascript
// WAAPI: Khởi tạo animation trực tiếp trên Compositor Thread
const element = document.getElementById("flying-box");

const animation = element.animate(
  [
    { transform: "translateX(0px) scale(1)", opacity: 1 },
    { transform: "translateX(300px) scale(1.2)", opacity: 0.8 },
    { transform: "translateX(600px) scale(1)", opacity: 0 }
  ],
  {
    duration: 1000,
    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    fill: "forwards"
  }
);

// Điều khiển qua code JS cực kỳ trực quan:
animation.pause();
animation.playbackRate = 2.0; // Tăng tốc độ gấp đôi
animation.play();
await animation.finished; // Promise hoàn tất native!
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Layout Thrashing là gì và các phương thức/thuộc tính nào của DOM sẽ ép buộc trình duyệt kích hoạt Forced Synchronous Layout?
<details>
<summary><b>Lời giải chi tiết</b></summary>

1. **Khái niệm**: Layout Thrashing là hiện tượng trình duyệt bị ép phải liên tục tính toán lại vị trí và kích thước hình học (Reflow) nhiều lần trong cùng một frame do code JavaScript xen kẽ giữa thao tác thay đổi style và thao tác đọc thông số layout.
2. **Các thuộc tính/phương thức gây Reflow tức thì khi đọc**:
   - Thuộc tính hình hộp: `offsetWidth`, `offsetHeight`, `offsetTop`, `offsetLeft`, `clientWidth`, `clientHeight`, `scrollWidth`, `scrollHeight`, `scrollTop`, `scrollLeft`.
   - Phương thức đo lường: `getBoundingClientRect()`, `getClientRects()`.
   - Phương thức truy vấn style tính toán: `window.getComputedStyle(element)`.
</details>

### Câu 2: Tại sao hoạt họa sử dụng thuộc tính `transform: translate()` lại mượt mà hơn rất nhiều so với `top` / `left`?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Khi thay đổi `top` hoặc `left`, trình duyệt bắt buộc phải chạy qua toàn bộ chu trình render: **Layout (Reflow) -> Paint (Tô pixel) -> Composite**. Quá trình này chạy trên Main Thread của CPU và ảnh hưởng tới vị trí của các phần tử xung quanh.
- Khi thay đổi `transform`, trình duyệt đưa phần tử lên một layer riêng biệt trên bộ nhớ VRAM của Card màn hình (GPU). Thao tác dịch chuyển được xử lý trực tiếp bởi **Compositor Thread** trên GPU mà **bỏ qua hoàn toàn bước Layout và Paint**, giải phóng 100% Main Thread của CPU, giúp frame rate đạt 60fps/120fps ổn định ngay cả khi Main Thread đang bận.
</details>
