# Dự Án 02: Phòng Thí Nghiệm Sự Kiện (Event Listener Playground)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [03-html-events-and-delegation.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/03-html-events-and-delegation.md) (Pha lan truyền sự kiện & Event Delegation).
  - [06-dom-and-events-reference.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/06-dom-and-events-reference.md) (Bảng phân loại sự kiện & Event Listener Options).
- **Khái niệm tương quan**:
  - **Main Thread Starvation & Event Dropping**: Các sự kiện tần suất cao như `mousemove` và `scroll` có thể kích hoạt hơn 100 lần mỗi giây. Nếu hàm xử lý sự kiện tính toán nặng (DOM query, regex, fetch), Main Thread sẽ bị nghẽn dẫn đến đơ lag UI.
  - **Rate Limiting Techniques**: Throttling (Giới hạn tốc độ theo thời gian) và Debouncing (Chờ khoảng lặng) là 2 kỹ thuật bắt buộc để bảo vệ hiệu năng trình duyệt.
- **Điểm đến tiếp theo**:
  - [03-production-todo-app.md](file:///d:/my-project/revision-document/javascript/07-practical-projects/03-production-todo-app.md) (Dự án Quản Lý Công Việc Todo App Chuẩn Enterprise).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Phân Biệt Các Hệ Tọa Độ Chuột Trong Trình Duyệt

```
+-------------------------------------------------------------+
| Browser Window Screen                                       |
|                                                             |
|   +-----------------------------------------------------+   |
|   | Viewport (Phần trang web hiển thị trong cửa sổ)     |   |
|   | (clientX, clientY) tính từ mép này                  |   |
|   |                                                     |   |
|   |    +------------------------+                       |   |
|   |    | Target Element         |                       |   |
|   |    | (offsetX, offsetY)     |                       |   |
|   |    | tính từ góc trên trái  |                       |   |
|   |    | của chính nó           |                       |   |
|   |    +------------------------+                       |   |
|   +-----------------------------------------------------+   |
|   |                                                         |
|   |  (Phần trang web bị cuộn khuất xuống dưới)              |
|   |  (pageX, pageY) = (clientX + scrollX, clientY + scrollY)|
+---+---------------------------------------------------------+
```

| Tọa độ | Điểm gốc quy chiếu (Origin `0, 0`) | Thay đổi khi người dùng cuộn trang (`scroll`)? |
| :--- | :--- | :---: |
| **`clientX` / `clientY`** | Góc trên cùng bên trái của **Viewport** (vùng hiển thị) | ❌ Không đổi nếu con trỏ đứng yên trên màn hình |
| **`pageX` / `pageY`** | Góc trên cùng bên trái của **Document** (toàn bộ trang web) | **CÓ** (Tăng giảm tương ứng với quãng đường cuộn) |
| **`offsetX` / `offsetY`** | Góc trên cùng bên trái của **Target Element** (sau viền border) | ❌ Phụ thuộc vào vị trí chuột so với chính phần tử đó |
| **`screenX` / `screenY`** | Góc trên cùng bên trái của **Màn hình vật lý của máy tính tính** | ❌ Tính từ góc bezel của màn hình laptop/PC |

### 2.2. So Sánh Bản Chất: Debounce vs Throttle

```
Dòng sự kiện gốc:    | | | | | | | | | | | | | | | | | | | | | (Bắn liên tục)

Sau khi Debounce:    .........................................| (Chỉ chạy 1 lần khi ngừng bắn)
(Phù hợp: Ô tìm kiếm gợi ý, Tự động lưu bản nháp)

Sau khi Throttle:    |..........|..........|..........|..........| (Chạy đều đặn mỗi chu kỳ T ms)
(Phù hợp: Vẽ Canvas bằng chuột, Tính toán thanh cuộn Scrollbar)
```

- **Debounce**: "Hãy chờ cho đến khi người dùng ngừng tương tác ít nhất $N$ mili-giây, sau đó mới thực thi hàm."
- **Throttle**: "Bất kể người dùng tương tác dồn dập bao nhiêu lần, hàm chỉ được phép thực thi tối đa một lần trong mỗi khoảng thời gian $N$ mili-giây."

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Dùng `e.keyCode` Thay Vì `e.key` hoặc `e.code`
- `e.keyCode` và `e.which` đã bị **khai tử (DEPRECATED)** trong chuẩn Web vì tính không nhất quán giữa các trình duyệt và hệ điều hành.
- Tuyệt đối dùng:
  - `e.key`: Nhận diện ký tự thực tế xuất hiện (`"a"`, `"A"`, `"Enter"`, `"Escape"`).
  - `e.code`: Nhận diện phím cứng vật lý (`"KeyA"`, `"Space"`, `"Digit1"`).

### Bẫy 2: Lưu Toàn Bộ Event Log Vào Mảng Gây Tràn Bộ Nhớ (Memory Leak)
- Trong một trang thử nghiệm (Playground) hoặc tính năng Analytics, nếu lắng nghe `mousemove` rồi thực hiện `eventsList.push(e)`, mảng sẽ phình to hàng trăm ngàn phần tử chỉ sau vài phút rê chuột.
- Giải pháp: Sử dụng **Bộ đệm vòng (Circular Buffer)** với kích thước cố định (`maxSize = 50`) để tự động loại bỏ sự kiện cũ khi đầy đĩa đệm.

### Bẫy 3: Quên Huỷ Timer Trong Debounce Dẫn Đến Thực Thi Ngoài Ý Muốn
- Nếu component bị hủy (unmount) hoặc người dùng đóng modal trong khi timer của debounce đang đếm ngược, callback vẫn sẽ kích hoạt trong tương lai gây lỗi truy cập phần tử không tồn tại (`Cannot read properties of null`).
- Hàm debounce chuẩn cần cung cấp thêm phương thức `.cancel()` để gọi `clearTimeout`.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [02-event-listener-demo.js](file:///d:/my-project/revision-document/javascript/07-practical-projects/02-event-listener-demo.js)

### Phòng Thí Nghiệm Sự Kiện Trực Quan Đầy Đủ
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Event Listener Playground</title>
  <style>
    body {
      font-family: monospace;
      background: #111827;
      color: #e5e7eb;
      padding: 2rem;
      margin: 0;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .panel {
      background: #1f2937;
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid #374151;
    }
    #interactive-pad {
      height: 200px;
      background: #0f172a;
      border: 2px dashed #60a5fa;
      border-radius: 8px;
      display: grid;
      place-items: center;
      cursor: crosshair;
      user-select: none;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      background: #3b82f6;
      color: white;
      margin-right: 0.5rem;
    }
    #log-container {
      height: 250px;
      overflow-y: auto;
      background: #030712;
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
    }
    .log-item {
      margin-bottom: 0.35rem;
      border-bottom: 1px solid #1f2937;
      padding-bottom: 0.2rem;
    }
  </style>
</head>
<body>
  <h1>🎮 Event Listener Playground</h1>
  
  <div class="grid">
    <div class="panel">
      <h3>1. Vùng Tương Tác Chuột & Phím</h3>
      <div id="interactive-pad" tabindex="0">
        Rê chuột hoặc gõ phím tại đây
      </div>
      <p>clientX: <span id="val-client" class="badge">0, 0</span></p>
      <p>offsetX: <span id="val-offset" class="badge">0, 0</span></p>
      <p>Key Pressed: <span id="val-key" class="badge">None</span></p>
    </div>

    <div class="panel">
      <h3>2. Event Audit Log (Circular Buffer)</h3>
      <div id="log-container"></div>
    </div>
  </div>

  <script>
    const pad = document.getElementById("interactive-pad");
    const valClient = document.getElementById("val-client");
    const valOffset = document.getElementById("val-offset");
    const valKey = document.getElementById("val-key");
    const logBox = document.getElementById("log-container");

    // Circular Logger
    const MAX_LOGS = 20;
    const logs = [];

    function addLog(msg) {
      if (logs.length >= MAX_LOGS) logs.shift();
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      logBox.innerHTML = logs.map(l => `<div class="log-item">${l}</div>`).join("");
      logBox.scrollTop = logBox.scrollHeight;
    }

    // Throttle cho Mousemove (tối đa 1 lần mỗi 40ms ~ 25fps cho logging)
    function throttle(fn, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          fn.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    }

    pad.addEventListener("mousemove", throttle((e) => {
      valClient.textContent = `${e.clientX}, ${e.clientY}`;
      valOffset.textContent = `${e.offsetX}, ${e.offsetY}`;
      addLog(`mousemove -> client(${e.clientX}, ${e.clientY}) | offset(${e.offsetX}, ${e.offsetY})`);
    }, 100));

    pad.addEventListener("click", (e) => {
      addLog(`🔥 CLICK tại offset(${e.offsetX}, ${e.offsetY})`);
    });

    pad.addEventListener("keydown", (e) => {
      valKey.textContent = `${e.key} (code: ${e.code})`;
      addLog(`⌨️ KEYDOWN: key="${e.key}" | code="${e.code}" | ctrl=${e.ctrlKey}`);
      if (e.key === "Escape") {
        addLog("🛑 Người dùng nhấn Escape!");
      }
    });
  </script>
</body>
</html>
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Giữa `e.key` và `e.code`, bạn nên dùng thuộc tính nào để xử lý phím tắt di chuyển trong Game Web (WASD hoặc Phím mũi tên)?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- **Bắt buộc dùng `e.code`** (ví dụ `KeyW`, `KeyA`, `KeyS`, `KeyD`).
- **Lý do**:
  - `e.code` phản ánh vị trí nút vật lý trên bàn phím phần cứng của máy tính, hoàn toàn không bị ảnh hưởng bởi bộ gõ tiếng Việt (Unikey gõ `w` thành `ư`, gõ `aa` thành `â`) hoặc các layout bàn phím khác nhau (AZERTY ở Pháp, QWERTZ ở Đức).
  - Nếu dùng `e.key`, khi người dùng bật Unikey hoặc CapsLock, ký tự trả về có thể là `"ư"` hay `"W"`, khiến nhân vật trong game bị đứng yên không di chuyển được.
</details>

### Câu 2: Trong trường hợp nào thì nên dùng Throttle thay vì Debounce khi tối ưu hóa Event Listener?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- **Nên dùng Throttle** khi bạn muốn ứng dụng **vẫn phải phản hồi và cập nhật đều đặn liên tục** trong suốt quá trình người dùng đang thực hiện thao tác:
  1. Xử lý thao tác vẽ (Drawing pad) hoặc kéo thả (Drag and Drop): Cần tọa độ chuột cập nhật mỗi 16ms để đường vẽ liền mạch.
  2. Bắt sự kiện cuộn trang (`scroll`): Để cập nhật thanh tiến trình đọc bài viết (Scroll Progress Bar) hoặc hiệu ứng Parallax mượt mà.
  3. Kiểm tra chạm đáy trang (Infinite Scrolling): Cần thăm dò định kỳ vị trí cuộn để kịp thời fetch thêm dữ liệu trước khi người dùng chạm đáy.
- **Dùng Debounce** khi bạn **không quan tâm đến quá trình trung gian** mà chỉ cần quan tâm đến kết quả cuối cùng sau khi người dùng đã kết thúc thao tác (ví dụ: gõ xong từ khóa trong ô tìm kiếm mới gửi request API).
</details>
