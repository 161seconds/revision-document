# Dự Án 01: Bộ Đếm Tương Tác Chuẩn Doanh Nghiệp (Interactive Counter)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-html-dom-architecture-and-selectors.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/01-html-dom-architecture-and-selectors.md) (DOM Selection & Caching).
  - [03-html-events-and-delegation.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/03-html-events-and-delegation.md) (Click events & Event Delegation).
- **Khái niệm tương quan**:
  - **Single Source of Truth (SSOT)**: Tuyệt đối không đọc giá trị từ chuỗi text của DOM (`parseInt(display.textContent)`) để làm dữ liệu tính toán. State phải nằm hoàn toàn trong bộ nhớ JS.
  - **Web Accessibility (a11y)**: Sử dụng thuộc tính `aria-live="polite"` để phần mềm đọc màn hình cho người khiếm thị nhận biết mỗi khi số thay đổi.
- **Điểm đến tiếp theo**:
  - [02-event-listener-playground.md](file:///d:/my-project/revision-document/javascript/07-practical-projects/02-event-listener-playground.md) (Event Listener Playground).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Kiến Trúc Hướng Dữ Liệu (Data-Driven UI Architecture)
Lập trình viên sơ cấp thường lưu trạng thái ngay trên DOM HTML:
```
[DOM Text "5"] ---> Click Button ---> Đọc "5" ---> parseInt("5") + 1 ---> Ghi "6" đè vào DOM
```
Kiến trúc này cực kỳ lỏng lẻo, dễ lỗi khi text bị format tiền tệ (ví dụ `5,000 đ`) hoặc chứa icon.

Kiến trúc chuẩn Enterprise tách rời **Trạng Thái (State Engine)** và **Trình Diễn (DOM View)** qua Observer Pattern:

```
+-----------------------------------------------------------+
|                   COUNTER STATE ENGINE                    |
|  - current: number                                        |
|  - bounds: [min, max], step: number                       |
|  - history: Array<number> (Undo/Redo Memento Pattern)     |
|  - actions: increment(), decrement(), reset(), undo()    |
+-----------------------------------------------------------+
                              |
                     notify(stateSnapshot)
                              |
                              v
+-----------------------------------------------------------+
|                        DOM VIEW                           |
|  - textContent = state.value                              |
|  - btnInc.disabled = !state.canIncrement                  |
|  - btnDec.disabled = !state.canDecrement                  |
|  - aria-live="polite" thông báo Screen Reader            |
|  - localStorage.setItem() đồng bộ dữ liệu                 |
+-----------------------------------------------------------+
```

### 2.2. Kiểm Soát Biên An Toàn (Defensive Bounds Clamping)
Hàm Clamp đảm bảo số nguyên không bao giờ vượt qua phạm vi cho phép:
$$\text{clampedValue} = \max(\text{min}, \min(\text{val}, \text{max}))$$
Điều này vô hiệu hóa các lỗi nhập liệu hoặc spam click vượt ngưỡng cho phép (như số lượng mua hàng âm hoặc vượt tồn kho).

### 2.3. Mẫu Thiết Kế Memento (Lịch Sử Undo / Redo)
- Mảng `history = [v0, v1, v2, ...]` lưu giữ các snapshot giá trị.
- Con trỏ `historyIndex` trỏ vào giá trị hiện tại.
- Khi người dùng thực hiện thao tác mới sau khi Undo, toàn bộ nhánh Redo tương lai phía sau `historyIndex` sẽ bị loại bỏ (`history.slice(0, historyIndex + 1)`).

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Đồng Bộ Giá Trị Từ `localStorage` Dưới Dạng String Dẫn Đến Phép Cộng Nối Chuỗi
```javascript
// ❌ SAI LẦM KINH ĐIỂN: localStorage luôn trả về String!
let count = localStorage.getItem("counter") || 0;
count += 1; // "0" + 1 = "01" -> "011" -> "0111" (Thảm họa nối chuỗi!)

// ✅ ĐÚNG: Luôn ép kiểu qua Number() và kiểm tra Number.isFinite()
const saved = localStorage.getItem("counter");
let count = saved !== null && !isNaN(Number(saved)) ? Number(saved) : 0;
count += 1; // 1 -> 2 -> 3
```

### Bẫy 2: Không Khóa Nút Bấm (`disabled`) Dẫn Đến Trải Nghiệm Ảo
- Nếu bộ đếm chạm ngưỡng tối đa (`max = 10`), nút `+` vẫn có thể bấm được nhưng số không tăng sẽ làm người dùng tưởng ứng dụng bị đơ (frozen).
- Luôn cập nhật thuộc tính `button.disabled = true` kèm CSS style làm mờ nút (`opacity: 0.5; cursor: not-allowed;`).

### Bẫy 3: Quên Thẻ `aria-live` Khiến Người Dùng Khiếm Thị Không Biết Số Đã Đổi
- Screen Reader chỉ đọc nội dung trang web khi mới tải hoặc khi có focus. Các thay đổi text nội tại của JavaScript sẽ hoàn toàn bị bỏ qua trừ khi vùng chứa có thuộc tính `aria-live="polite"`.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [01-counter-demo.js](file:///d:/my-project/revision-document/javascript/07-practical-projects/01-counter-demo.js)

### Mã Nguồn Hoàn Chỉnh (HTML + CSS + JS) Chạy Trực Tiếp Trên Trình Duyệt
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Enterprise Counter</title>
  <style>
    :root {
      --bg: #0f172a;
      --card: #1e293b;
      --primary: #3b82f6;
      --text: #f8fafc;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: grid;
      place-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .counter-card {
      background: var(--card);
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
      text-align: center;
      width: 320px;
    }
    .counter-display {
      font-size: 5rem;
      font-weight: 800;
      margin: 1.5rem 0;
      font-variant-numeric: tabular-nums;
      transition: transform 0.15s ease;
    }
    .btn-group {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      margin-bottom: 1rem;
    }
    button {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-size: 1.25rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      transform: none !important;
    }
    button:not(:disabled):hover {
      filter: brightness(1.15);
      transform: translateY(-2px);
    }
    .secondary-btn {
      background: #475569;
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
    }
  </style>
</head>
<body>
  <div class="counter-card">
    <h2>Số Lượng Đặt Mua</h2>
    <div id="counter-value" class="counter-display" aria-live="polite" aria-atomic="true">0</div>
    
    <div class="btn-group">
      <button id="btn-dec" aria-label="Giảm số lượng">-</button>
      <button id="btn-inc" aria-label="Tăng số lượng">+</button>
    </div>

    <div class="btn-group">
      <button id="btn-undo" class="secondary-btn" disabled>Hoàn tác (Undo)</button>
      <button id="btn-reset" class="secondary-btn">Đặt lại (Reset)</button>
    </div>
  </div>

  <script>
    // State Engine
    let count = 0;
    const MIN = 0, MAX = 20, STEP = 1;
    const history = [count];
    let historyIdx = 0;

    // DOM Elements
    const display = document.getElementById("counter-value");
    const btnInc = document.getElementById("btn-inc");
    const btnDec = document.getElementById("btn-dec");
    const btnUndo = document.getElementById("btn-undo");
    const btnReset = document.getElementById("btn-reset");

    function render() {
      display.textContent = count;
      btnInc.disabled = count >= MAX;
      btnDec.disabled = count <= MIN;
      btnUndo.disabled = historyIdx <= 0;
      localStorage.setItem("app_counter", count);

      // Micro-animation khi số thay đổi
      display.style.transform = "scale(1.15)";
      setTimeout(() => (display.style.transform = "scale(1)"), 150);
    }

    function updateCount(newVal) {
      count = Math.max(MIN, Math.min(newVal, MAX));
      history.splice(historyIdx + 1);
      history.push(count);
      historyIdx++;
      render();
    }

    btnInc.addEventListener("click", () => updateCount(count + STEP));
    btnDec.addEventListener("click", () => updateCount(count - STEP));
    btnReset.addEventListener("click", () => updateCount(0));
    btnUndo.addEventListener("click", () => {
      if (historyIdx > 0) {
        historyIdx--;
        count = history[historyIdx];
        render();
      }
    });

    // Phục hồi từ LocalStorage
    const saved = localStorage.getItem("app_counter");
    if (saved !== null && !isNaN(Number(saved))) {
      updateCount(Number(saved));
    } else {
      render();
    }
  </script>
</body>
</html>
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao việc đọc giá trị số từ thẻ hiển thị của DOM (`parseInt(display.textContent)`) lại là một Anti-Pattern tai hại?
<details>
<summary><b>Lời giải chi tiết</b></summary>

1. **DOM chỉ là View (Giao diện hiển thị), không phải Model (Cơ sở dữ liệu)**: Khi giao diện được làm đẹp (ví dụ định dạng tiền tệ `"1,000,000 đ"` hoặc có icon kèm theo), việc dùng `parseInt` sẽ phân tích sai giá trị (chỉ lấy được số 1 thay vì 1 triệu).
2. **Ép buộc Reflow/Tốn hiệu năng**: Đọc liên tục từ DOM khiến trình duyệt phải duyệt qua cây đối tượng C++ thay vì truy cập biến số nguyên (Smi - Small Integer) nằm sẵn trong thanh ghi CPU hoặc Memory Heap của V8 Engine.
3. **Phá vỡ nguyên tắc phân tách trách nhiệm (Separation of Concerns)**: Khiến logic nghiệp vụ bị gắn chặt với cấu trúc hiển thị HTML, không thể viết Unit Test tự động cho logic tăng giảm độc lập với DOM.
</details>

### Câu 2: Thuộc tính `aria-live="polite"` và `aria-atomic="true"` có vai trò gì trong việc đáp ứng tiêu chuẩn tiếp cận Web (WCAG)?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- `aria-live="polite"`: Báo cho các phần mềm đọc màn hình (Screen Reader như NVDA, VoiceOver) biết vùng nội dung này là một "Live Region" có thể thay đổi động. Khi số thay đổi, Screen Reader sẽ chờ người dùng đọc xong tác vụ hiện tại rồi mới thông báo số mới một cách lịch sự, không cắt ngang âm thanh của người dùng (khác với `aria-live="assertive"` sẽ ngắt lời ngay lập tức).
- `aria-atomic="true"`: Đảm bảo phần mềm đọc màn hình sẽ **đọc toàn bộ cụm nội dung** trong thẻ đó thay vì chỉ đọc mẩu ký tự vừa thay đổi.
</details>
