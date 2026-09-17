# Thao Tác DOM & Thay Đổi Kiểu Dáng (DOM Manipulation & Style Management)

Tài liệu chuyên sâu về kỹ thuật chỉnh sửa cây DOM và quản lý kiểu dáng CSS trong JavaScript: So sánh chi tiết `innerHTML` vs `textContent` vs `innerText`, phòng chống lỗ hổng Cross-Site Scripting (XSS), bộ công cụ `classList` API, các phương thức chèn hiện đại (`append`, `insertAdjacentHTML`), và kỹ thuật gom cụm `DocumentFragment`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-html-dom-architecture-and-selectors.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/01-html-dom-architecture-and-selectors.md) (Cây DOM và các phương thức truy vấn).
- **Mở rộng tiếp theo (Next Steps):**
  - [03-html-events-and-delegation.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/03-html-events-and-delegation.md) (Lắng nghe sự kiện và tương tác người dùng).
  - [05-dom-animations-and-raf.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/05-dom-animations-and-raf.md) (Hoạt ảnh DOM và luồng 60 FPS).
- **Khái niệm liên quan (Related):**
  - Lỗ hổng bảo mật Cross-Site Scripting (XSS - CWE-79).
  - Tránh Layout Reflow với CSS Class Toggling.
  - HTML5 Custom Data Attributes (`dataset`).

---

## 2. Bản Chất Hoạt Động (Mental Model: Nội Dung, Thuộc Tính & Kiểu Dáng)

### 1. Tam Giác So Sánh: `innerHTML` vs `textContent` vs `innerText`

| Tiêu chí | `innerHTML` | `textContent` | `innerText` |
| :--- | :--- | :--- | :--- |
| **Bản chất** | Phân tích chuỗi thành **thẻ HTML thật** | Lấy hoặc ghi **văn bản thô** (Raw Text) | Lấy văn bản theo **giao diện hiển thị thực** |
| **Xử lý mã HTML** | Biên dịch thẻ `<p>`, `<b>`, `<img>` | Giữ nguyên thẻ dưới dạng chữ (Escape) | Giữ nguyên thẻ dưới dạng chữ |
| **Nguy cơ XSS?** | **RẤT CAO** (Lỗ hổng tiêm mã độc) | **AN TOÀN TUYỆT ĐỐI** | **AN TOÀN** |
| **Kích hoạt Reflow?**| Tái phân tích HTML parser | **Không** (rất nhẹ và nhanh) | **Có** (phải tính toán CSS `display`) |
| **Nhận diện phần tử ẩn**| Lấy hết | Lấy hết cả phần tử `display: none` | **Bỏ qua** phần tử bị ẩn bằng CSS |

---

### 2. Bộ Công Cụ Quản Lý Class: `element.classList`
Tuyệt đối không thao tác gán chuỗi trực tiếp qua `element.className += " active"` vì dễ gây lỗi trùng lặp khoảng trắng. Hãy sử dụng chuẩn **`classList`**:

```javascript
const box = document.querySelector(".box");

box.classList.add("active", "visible"); // Thêm nhiều class
box.classList.remove("loading");        // Xóa class
box.classList.toggle("dark-mode");      // Bật/tắt class (trả về boolean trạng thái)
box.classList.contains("active");       // Kiểm tra class có tồn tại không (boolean)
box.classList.replace("old", "new");    // Thay thế class cũ bằng class mới
```

---

### 3. Phương Thức Chèn Phần Tử Hiện Đại vs Cổ Điển

| Thao tác | Cổ điển (ES3/ES5) | Hiện đại (DOM Living Standard) | Ưu thế của cú pháp hiện đại |
| :--- | :--- | :--- | :--- |
| Chèn vào cuối | `parent.appendChild(el)` | **`parent.append(...nodesOrStrings)`** | Nhận nhiều phần tử cùng lúc; nhận trực tiếp chuỗi văn bản |
| Chèn vào đầu | `parent.insertBefore(el, first)` | **`parent.prepend(...)`** | Cực kỳ ngắn gọn |
| Chèn anh em | Phải gọi qua `parentElement` | **`el.before(...)`** và **`el.after(...)`** | Gọi trực tiếp từ phần tử mốc |
| Tự xóa chính mình | `el.parentNode.removeChild(el)` | **`el.remove()`** | Không cần thông qua cha |
| Chèn HTML nhanh | Gán lại `innerHTML` (mất event!) | **`el.insertAdjacentHTML(pos, html)`** | Không phân tích lại toàn bộ DOM cha |

---

### 4. Thuộc Tính Tùy Biến: `data-*` & `element.dataset`
HTML5 cho phép lưu trữ dữ liệu tùy biến trên thẻ HTML thông qua tiền tố `data-`:
```html
<button id="buyBtn" data-product-id="123" data-user-role="admin">Mua ngay</button>
```
Trong JavaScript, các thuộc tính này tự động được chuyển đổi sang định dạng `camelCase` thông qua thuộc tính **`dataset`**:
```javascript
const btn = document.getElementById("buyBtn");
console.log(btn.dataset.productId); // "123"
console.log(btn.dataset.userRole);  // "admin"
btn.dataset.inStock = "true";       // Tự động sinh ra thuộc tính data-in-stock="true"!
```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy Lỗ Hổng Bảo Mật XSS Với `innerHTML`
```javascript
// BẪY CHẾT NGƯỜI: Chèn trực tiếp chuỗi do người dùng nhập:
const userComment = `<img src="x" onerror="stealCookies()">`;
container.innerHTML = userComment; // Kẻ tấn công đánh cắp toàn bộ cookie/token!
```
➔ **Quy tắc:** Nếu chỉ hiển thị nội dung người dùng nhập, **LUÔN LUÔN dùng `element.textContent`**!

### 2. Gán đè `innerHTML +=` làm mất sạch Event Listeners của phần tử con
```javascript
list.innerHTML += "<li>Mục mới</li>";
```
- **Hậu quả:** Trình duyệt sẽ hủy bỏ toàn bộ cây DOM con bên trong `list`, dịch lại toàn bộ thành chuỗi, và dựng lại các thẻ con mới. **Tất cả các sự kiện `addEventListener` đã gắn vào các `<li>` cũ trước đó đều bị bốc hơi hoàn toàn!**
- ➔ **Giải pháp:** Dùng `list.insertAdjacentHTML("beforeend", "<li>Mục mới</li>")` hoặc `list.append(newLi)`.

---

## 4. File Code Thực Hành

- [02-dom-manipulation-demo.js](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/02-dom-manipulation-demo.js): Code thực nghiệm cơ chế bảo mật `textContent` chặn đứng XSS, các thao tác `classList` (`add`, `toggle`, `replace`), truy xuất `dataset` camelCase, và kỹ thuật chèn `append`/`insertAdjacentHTML` an toàn. Chạy bằng: `node 02-dom-manipulation-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao `element.textContent` lại an toàn tuyệt đối trước các cuộc tấn công XSS trong khi `innerHTML` thì không?**
   *Đáp án:* Vì `textContent` không bao giờ chuyển giao chuỗi ký tự cho trình phân tích cú pháp HTML Parser. Nó chỉ tạo ra một Text Node thô trên cây DOM. Mọi thẻ nhúng nguy hiểm như `<script>` hoặc `<img onerror=...>` đều được hiển thị nguyên văn dưới dạng chuỗi ký tự vô hại mà không bị trình duyệt thực thi.

2. **Sự khác biệt lớn nhất giữa `list.innerHTML += "<li>Mới</li>"` và `list.insertAdjacentHTML("beforeend", "<li>Mới</li>")` là gì?**
   *Đáp án:* `list.innerHTML += ...` sẽ serialize lại toàn bộ cây DOM con hiện tại thành chuỗi rồi parse lại từ đầu, khiến toàn bộ các phần tử con cũ bị hủy diệt và tái tạo mới, làm mất sạch toàn bộ Event Listeners đã gắn trước đó. Trong khi đó, `insertAdjacentHTML` chỉ chèn thêm đúng đoạn HTML mới vào cuối mà không hề làm ảnh hưởng hay tái dựng các phần tử con cũ.
