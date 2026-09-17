# Cấu Trúc Cây HTML DOM & Bộ Chọn Phần Tử (HTML DOM Architecture & Selectors)

Tài liệu chuyên sâu về mô hình tài liệu đối tượng (DOM - Document Object Model) trong trình duyệt: Bản chất cây DOM lồng nhau, phân biệt ranh giới giữa `Node` và `Element`, so sánh chi tiết Live `HTMLCollection` vs Static `NodeList`, và chiến lược truy vấn phần tử với `querySelector` / `querySelectorAll`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [05-style-guide-and-best-practices/04-performance-optimization-and-v8.md](file:///d:/my-project/revision-document/javascript/05-style-guide-and-best-practices/04-performance-optimization-and-v8.md) (Chi phí cầu nối C++ Blink sang V8 Heap).
- **Mở rộng tiếp theo (Next Steps):**
  - [02-dom-manipulation-and-styles.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/02-dom-manipulation-and-styles.md) (Thao tác nội dung, thuộc tính và CSS Class).
  - [03-html-events-and-delegation.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/03-html-events-and-delegation.md) (Mô hình xử lý sự kiện và Event Delegation).
- **Khái niệm liên quan (Related):**
  - Cây DOM Tree & Cây Render Tree.
  - Phân cấp kế thừa: `EventTarget` -> `Node` -> `Element` -> `HTMLElement`.
  - CSS Selectors Level 4.

---

## 2. Bản Chất Hoạt Động (Mental Model: Cây DOM & Phân Cấp Đối Tượng)

### 1. Phân Cấp Kế Thừa Của DOM Node Trong C++ Blink Engine

Mọi phần tử trong giao diện web đều là một đối tượng kế thừa từ chuỗi Prototype sâu trong trình duyệt:
```
EventTarget (Có addEventListener, removeEventListener, dispatchEvent)
    └── Node (Có parentNode, childNodes, firstChild, nodeType)
          ├── Document (Toàn bộ trang web - document)
          ├── CharacterData / Text (Các đoạn văn bản thô)
          ├── Comment (Các chú thích HTML)
          └── Element (Có id, className, querySelector, getAttribute)
                └── HTMLElement (Thẻ HTML cụ thể: HTMLDivElement, HTMLButtonElement)
```

- **`Node`**: Là đơn vị cơ bản nhất trên cây DOM. Bao gồm cả Element Node (thẻ HTML), Text Node (khoảng trắng, dòng chữ), và Comment Node.
- **`Element`**: Là một Node đặc biệt đại diện cho một thẻ HTML thực thụ (như `<div>`, `<p>`).

---

### 2. Live `HTMLCollection` vs Static `NodeList`

Sự khác biệt giữa hai tập hợp trả về từ các phương thức DOM là nguồn gốc của hàng loạt bug hiệu năng và logic:

| Tiêu chí | `HTMLCollection` | `NodeList` (từ `querySelectorAll`) |
| :--- | :--- | :--- |
| **Phương thức sinh ra** | `getElementsByTagName`, `getElementsByClassName` | `document.querySelectorAll()` |
| **Tính chất (Nature)** | **Live (Động theo thời gian thực)** | **Static (Tĩnh - Ảnh chụp Snapshot)** |
| **Phần tử bên trong** | Chỉ chứa `Element` | Có thể chứa cả `Element`, `Text`, `Comment` |
| **Hỗ trợ `forEach`?** | **Không** (phải ép kiểu qua `Array.from`) | **Có** (`NodeList.prototype.forEach`) |
| **Cạm bẫy vòng lặp** | Nếu thêm/xóa phần tử trong lúc lặp, `length` tự động nhảy số gây vòng lặp vô tận | An toàn khi thêm/xóa phần tử trong khi lặp |

---

### 3. Bảng Ma Trận So Sánh Các Phương Thức Truy Vấn DOM

| Phương thức | Cú pháp | Trả về | Tốc độ | Khuyên dùng khi |
| :--- | :--- | :--- | :--- | :--- |
| **`getElementById(id)`** | `document.getElementById("btn")` | 1 `Element` hoặc `null` | **Cực nhanh** (Băm ID trực tiếp) | Tìm phần tử duy nhất có ID |
| **`querySelector(selector)`** | `document.querySelector(".card > h2")` | `Element` đầu tiên khớp mẫu hoặc `null` | Nhanh | Tìm phần tử đầu tiên theo CSS selector phức tạp |
| **`querySelectorAll(selector)`**| `document.querySelectorAll(".item")` | **Static `NodeList`** | Nhanh | Tìm danh sách phần tử tĩnh, an toàn để lặp |
| **`getElementsByClassName()`**| `document.getElementsByClassName("box")`| **Live `HTMLCollection`** | Nhanh | Cần danh sách tự động cập nhật khi DOM thay đổi |

---

### 4. Điều Hướng Cây DOM (DOM Traversal)
Thay vì truy vấn lại từ `document`, hãy điều hướng trực tiếp từ phần tử hiện tại:
- **Hướng lên cha**: `el.parentElement` (an toàn hơn `el.parentNode` vì chỉ trả về Element).
- **Hướng xuống con**: `el.children` (chỉ lấy Element con, bỏ qua khoảng trắng/Text Nodes).
- **Hướng sang anh em**: `el.nextElementSibling` và `el.previousElementSibling`.
- **Tìm tổ tiên gần nhất**: `el.closest(".container")` (cực kỳ hữu ích cho Event Delegation).

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy lặp qua Live `HTMLCollection` khi đang xóa phần tử
```javascript
const items = document.getElementsByClassName("delete-me"); // Live!
for (let i = 0; i < items.length; i++) {
  items[i].remove(); // BẪY: Mỗi lần xóa, items.length giảm đi 1 và chỉ mục dồn lại!
  // Kết quả: Chỉ xóa được 50% số phần tử (các phần tử số lẻ bị sót lại)!
}
```
➔ **Giải pháp:** Dùng `document.querySelectorAll(".delete-me")` (Static NodeList) hoặc duyệt ngược từ cuối về đầu `for (let i = items.length - 1; i >= 0; i--)`.

### 2. Nhầm lẫn giữa `childNodes` và `children`
- `el.childNodes` chứa cả các Text Node khoảng trắng xuống dòng `\n`.
- `el.children` chỉ chứa các thẻ HTML con. Luôn ưu tiên dùng `el.children`!

---

## 4. File Code Thực Hành

- [01-dom-selectors-demo.js](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/01-dom-selectors-demo.js): Code thực nghiệm mô phỏng cấu trúc cây DOM, kiểm chứng Live HTMLCollection vs Static NodeList, duyệt cây DOM với `closest()`, `children`, và thuật toán tìm kiếm selector. Chạy bằng: `node 01-dom-selectors-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao `document.querySelectorAll()` trả về một Static NodeList thay vì Live NodeList?**
   *Đáp án:* Để bảo đảm tính nhất quán (deterministic) và an toàn hiệu năng. Static NodeList đóng vai trò như một bản chụp nhanh (Snapshot) tại thời điểm gọi hàm. Nếu nó là Live, mỗi khi DOM thay đổi dù là nhỏ nhất, trình duyệt sẽ phải chạy lại toàn bộ bộ phân tích cú pháp CSS Selector phức tạp, gây sụt giảm FPS nghiêm trọng và dễ dẫn đến vòng lặp vô hạn khi lập trình viên sửa DOM trong thân vòng lặp.

2. **Phương thức `element.closest(selector)` hoạt động như thế nào và tại sao nó lại được ưa chuộng trong kiến trúc hiện đại?**
   *Đáp án:* `closest()` bắt đầu kiểm tra từ chính phần tử đó, sau đó duyệt ngược lên trên từng cấp cha (Ancestors) cho đến khi tìm thấy phần tử đầu tiên khớp với CSS selector chỉ định (hoặc trả về `null` nếu lên tới root). Nó loại bỏ nhu cầu phải viết các chuỗi `parentElement.parentElement` thủ công và là nền tảng cốt lõi của kỹ thuật Event Delegation.
