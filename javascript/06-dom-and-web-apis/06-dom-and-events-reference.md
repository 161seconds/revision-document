# Sổ Tay Tra Cứu Toàn Diện DOM & Web Events (Master Reference)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-html-dom-architecture-and-selectors.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/01-html-dom-architecture-and-selectors.md) (DOM Hierarchy & Selectors).
  - [02-dom-manipulation-and-styles.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/02-dom-manipulation-and-styles.md) (Thao tác Element & Attributes).
  - [03-html-events-and-delegation.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/03-html-events-and-delegation.md) (Event Propagation & Delegation).
  - [04-html-first-and-progressive-enhancement.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/04-html-first-and-progressive-enhancement.md) (Constraint Validation API).
  - [05-dom-animations-and-raf.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/05-dom-animations-and-raf.md) (Render Pipeline & rAF).
- **Điểm đến tiếp theo**:
  - Module 07: Dự án thực hành DOM & Web APIs (`07-practical-projects/`).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Cấu Trúc Phân Cấp DOM Nodes (Inheritance Chain)
Mọi đối tượng trên cây DOM đều kế thừa theo chuỗi prototype trong Browser C++ Engine:

```
EventTarget
   └── Node
        ├── Document (document)
        ├── CharacterData
        │    ├── Text (chứa văn bản thô)
        │    └── Comment (chứa <!-- comment -->)
        └── Element
             └── HTMLElement
                  ├── HTMLInputElement
                  ├── HTMLButtonElement
                  └── HTMLDivElement...
```

### 2.2. Ma Trận Điều Hướng DOM (Node Navigation vs Element Navigation)

| Vị trí | Node Level (Gồm cả Text & Comment) | Element Level (Chỉ thẻ HTML) | Ghi chú quan trọng |
| :--- | :--- | :--- | :--- |
| **Node cha** | `node.parentNode` | `element.parentElement` | `document.documentElement.parentElement` là `null` |
| **Danh sách con** | `node.childNodes` (NodeList) | `element.children` (HTMLCollection) | `childNodes` chứa các khoảng trắng enter xuống dòng! |
| **Con đầu tiên** | `node.firstChild` | `element.firstElementChild` | Hạn chế dùng `firstChild` vì dễ bắt nhầm Text node |
| **Con cuối cùng** | `node.lastChild` | `element.lastElementChild` | `lastElementChild` an toàn khi duyệt HTML tags |
| **Anh chị em trước** | `node.previousSibling` | `element.previousElementSibling` | Bỏ qua comment và text node |
| **Anh chị em sau** | `node.nextSibling` | `element.nextElementSibling` | Cực kỳ phổ biến khi duyệt danh sách bảng biểu |

### 2.3. Bảng Tra Cứu Sự Kiện Toàn Diện (Comprehensive Event Taxonomy)

#### A. Chuột (Mouse Events) & Con Trỏ (Pointer Events)
| Event Name | Bubbles? | Cancelable? | Bản chất & Ứng dụng |
| :--- | :---: | :---: | :--- |
| `click` | **CÓ** | **CÓ** | Nhấn và nhả chuột trên cùng 1 element |
| `dblclick` | **CÓ** | **CÓ** | Nhấp đúp 2 lần liên tiếp |
| `mousedown` / `mouseup` | **CÓ** | **CÓ** | Nhấn chuột xuống / nhả chuột ra (Drag and Drop) |
| `mousemove` | **CÓ** | **CÓ** | Chuột di chuyển (cần throttle/debounce) |
| `mouseenter` / `mouseleave` | ❌ **KHÔNG** | ❌ | Đi vào / ra element (Không bubble lên cha, an toàn cho Dropdown) |
| `mouseover` / `mouseout` | **CÓ** | **CÓ** | Đi vào / ra element (Có bubble, dễ kích hoạt nhầm khi lướt qua con) |
| `contextmenu` | **CÓ** | **CÓ** | Nhấp chuột phải (dùng `e.preventDefault()` để làm Custom Menu) |

#### B. Bàn Phím (Keyboard Events)
| Event Name | Khuyến nghị | Ghi chú kỹ thuật |
| :--- | :---: | :--- |
| `keydown` | ✅ **DÙNG CHÍNH** | Kích hoạt ngay khi phím vừa được bấm xuống. Nhận được mọi phím (cả Shift, Ctrl, Alt). |
| `keyup` | ✅ **DÙNG** | Kích hoạt khi người dùng nhả phím. |
| `keypress` | ⛔ **BỊ KHAI TỬ (DEPRECATED)** | Không nhận các phím chức năng. Tuyệt đối không dùng trong dự án mới. |
- **`e.key` vs `e.code`**:
  - `e.key`: Giá trị ký tự tạo ra (ví dụ: `"a"`, `"A"`, `"Enter"`, `"Escape"`). Bị ảnh hưởng bởi bộ gõ Unikey/Vietkey và CapsLock.
  - `e.code`: Tên phím vật lý trên bàn phím phần cứng (ví dụ: `"KeyA"`, `"Digit1"`, `"Space"`). Không phụ thuộc layout bàn phím hay Unikey. Dành riêng cho phím tắt Game / Shortkey hệ thống.

#### C. Biểu Mẫu (Form Events)
| Event Name | Thời điểm kích hoạt | Phân biệt then chốt |
| :--- | :--- | :--- |
| `input` | Ngay khi giá trị thay đổi | Chạy realtime từng ký tự (gõ, paste, xóa). Khuyên dùng cho search box. |
| `change` | Khi giá trị đã "commit" | Chỉ kích hoạt sau khi rời focus (`blur`) đối với input text, hoặc ngay sau khi click với checkbox/radio. |
| `submit` | Khi form gửi đi | Lắng nghe trên thẻ `<form>`, chặn bằng `e.preventDefault()`. |
| `focus` / `blur` | Khi nhận / mất focus | **Không bubble**. |
| `focusin` / `focusout` | Khi nhận / mất focus | **Có bubble** (dùng được với Event Delegation trên container). |
| `invalid` | Khi kiểm tra vi phạm Constraint API | Không bubble. Kích hoạt khi `checkValidity()` trả về `false`. |

#### D. Trình Duyệt & Cửa Sổ (Window / Document Events)
| Event Name | Target | Ý nghĩa |
| :--- | :--- | :--- |
| `DOMContentLoaded` | `document` | Cây DOM đã parse xong 100%. Script có thể query DOM an toàn mà chưa cần chờ tải ảnh/css. |
| `load` | `window` | Toàn bộ trang web (bao gồm cả ảnh, font, stylesheet, iframe) đã tải xong hoàn toàn. |
| `beforeunload` | `window` | Người dùng chuẩn bị đóng tab hoặc reload. Dùng để cảnh báo mất dữ liệu chưa lưu. |
| `resize` | `window` | Cửa sổ thay đổi kích thước (bắt buộc dùng debounce). |
| `scroll` | `window`/`element` | Cuộn trang (bắt buộc dùng `{ passive: true }` hoặc IntersectionObserver). |

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Memory Leak Vì Quên Dọn Dẹp Event Listener Bằng Cú Pháp Cũ
```javascript
// ❌ SAI LẦM: Viết hàm ẩn danh (arrow function) thì KHÔNG THỂ gỡ bỏ!
window.addEventListener("resize", () => { ... });
window.removeEventListener("resize", () => { ... }); // VÔ TÁC DỤNG! Vì 2 arrow function là 2 tham chiếu khác nhau!

// ❌ CÁCH CŨ KHẮC PHỤC: Phải lưu định danh hàm
function handleResize() { ... }
window.addEventListener("resize", handleResize);
window.removeEventListener("resize", handleResize);

// ✅ CHUẨN HIỆN ĐẠI (ES2022 / Web API): Dùng AbortController để hủy hàng loạt listener
const controller = new AbortController();
window.addEventListener("resize", () => { ... }, { signal: controller.signal });
window.addEventListener("scroll", () => { ... }, { signal: controller.signal });

// Khi đóng modal hoặc unmount component: 1 LỆNH XÓA SẠCH SẼ TẤT CẢ!
controller.abort();
```

### Bẫy 2: Dùng `mouseover` Thay Vì `mouseenter` Gây Hiện Tượng Nhấp Nháy (Flickering)
- `mouseover` và `mouseout` kích hoạt và bubble mỗi khi con trỏ đi qua **bất kỳ phần tử con nào** bên trong menu. Điều này khiến dropdown menu bị đóng mở liên tục gây nhấp nháy khó chịu.
- Hãy dùng `mouseenter` và `mouseleave` vì chúng **không bubble**, chỉ kích hoạt khi con trỏ thực sự rời khỏi đường biên ngoài cùng của phần tử.

### Bẫy 3: Không Đặt `{ passive: true }` Khi Bắt Sự Kiện `scroll` / `touchmove`
- Mặc định trình duyệt phải chờ hàm listener chạy xong để kiểm tra xem có gọi `e.preventDefault()` hay không rồi mới cuộn trang. Việc này làm giật lag thao tác vuốt màn hình trên điện thoại di động.
- Đặt `{ passive: true }` báo trước cho trình duyệt rằng bạn sẽ không bao giờ chặn cuộn, giúp giao diện lướt mượt 60fps/120fps.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [06-dom-reference-demo.js](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/06-dom-reference-demo.js)

### Pattern Production: Quản Lý Vòng Đời Event Listener Bằng AbortController
```javascript
class ComponentLifecycleManager {
  constructor() {
    this.abortController = new AbortController();
  }

  mount() {
    const { signal } = this.abortController;

    // Gắn hàng loạt listener phức tạp vào nhiều target khác nhau
    window.addEventListener("keydown", this.handleShortcuts.bind(this), { signal });
    window.addEventListener("resize", this.handleResize.bind(this), { signal });
    document.addEventListener("click", this.handleGlobalClick.bind(this), { signal });

    // Sử dụng tùy chọn { once: true } cho sự kiện chỉ xảy ra 1 lần
    const submitBtn = document.getElementById("submit-btn");
    submitBtn?.addEventListener("click", this.handleSubmitOnce.bind(this), {
      signal,
      once: true,
    });
  }

  unmount() {
    // 1 lệnh duy nhất giải phóng toàn bộ bộ nhớ và loại bỏ tất cả listeners!
    this.abortController.abort();
    console.log("Component unmounted: Toàn bộ listeners đã được giải phóng sạch sẽ.");
  }

  handleShortcuts(e) {
    if (e.key === "Escape") this.unmount();
  }
  handleResize() { /* responsive logic */ }
  handleGlobalClick() { /* click outside logic */ }
  handleSubmitOnce() { /* submit 1 lần duy nhất */ }
}
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao `AbortController` lại được xem là giải pháp tối ưu thay thế cho `removeEventListener` truyền thống trong kiến trúc SPA hiện đại?
<details>
<summary><b>Lời giải chi tiết</b></summary>

1. **Không cần giữ tham chiếu hàm**: Trước đây bắt buộc phải tạo biến hàm có tên để truyền cùng một tham chiếu vào cả `addEventListener` và `removeEventListener`. Với `AbortController`, bạn có thể dùng arrow function hoặc inline callback thoải mái mà vẫn dọn dẹp được hoàn toàn.
2. **Hủy hàng loạt (Batch Cleanup)**: Chỉ cần khởi tạo 1 `AbortController`, truyền `{ signal: controller.signal }` vào 10 hoặc 100 listener ở khắp mọi nơi (window, document, button). Khi unmount component, chỉ cần gọi `controller.abort()` là toàn bộ 100 listeners tự động bị tháo gỡ cùng một lúc, triệt tiêu 100% rủi ro rò rỉ bộ nhớ (Memory Leak).
3. **Tích hợp đồng bộ với Fetch API**: Cùng một `signal` có thể vừa dùng để hủy các sự kiện DOM vừa dùng để hủy các HTTP Request (`fetch`) đang chờ xử lý khi người dùng rời trang.
</details>

### Câu 2: Phân biệt sự khác nhau giữa sự kiện `DOMContentLoaded` và sự kiện `load` của đối tượng Window?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- `DOMContentLoaded` (trên `document`): Kích hoạt ngay khi trình duyệt đã tải xong và phân tích xong toàn bộ cấu trúc HTML thành cây DOM Tree. Tại thời điểm này, các tài nguyên ngoại vi như hình ảnh (`<img>`), video, stylesheets (`<link rel="stylesheet">`) có thể **chưa tải xong**. Đây là thời điểm vàng để chạy code khởi tạo DOM vì tốc độ nhanh nhất.
- `load` (trên `window`): Kích hoạt muộn hơn rất nhiều, chỉ sau khi **toàn bộ tài nguyên phụ thuộc** (bao gồm toàn bộ hình ảnh kích thước lớn, font chữ, CSS, file nhạc, iframe...) đã được tải xuống và giải mã hoàn tất 100%.
</details>
