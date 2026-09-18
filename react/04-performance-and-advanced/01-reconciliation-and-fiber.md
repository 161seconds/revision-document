# 01. Reconciliation & Fiber Architecture

Kiến trúc bộ điều phối Fiber Reconciler, kỹ thuật Double Buffering và thuật toán phân mảnh thời gian (Time Slicing) trong React.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [JSX & Virtual DOM](file:///d:/my-project/revision-document/react/01-components-and-props/01-jsx-and-virtual-dom.md)
- **Tiếp theo:** [Code Splitting & Suspense](file:///d:/my-project/revision-document/react/04-performance-and-advanced/02-code-splitting-and-suspense.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Từ Stack Reconciler Đến Fiber Reconciler
- **Stack Reconciler (React 15 trở về trước):** Sử dụng các lời gọi hàm đệ quy đồng bộ duyệt qua cây Virtual DOM. Khi cây giao diện quá sâu và phức tạp, Call Stack bị chiếm dụng trong thời gian dài (> 16.6ms), khiến trình duyệt không thể xử lý các sự kiện click, gõ phím hay vẽ khung hình (Frame Drop, gây lag giật giao diện).
- **Fiber Reconciler (React 16+):** Viết lại hoàn toàn bộ máy Reconciler. Biến cây Virtual DOM thành một cấu trúc **Danh sách liên kết (Singly Linked List of Fibers)**. Điều này cho phép React phân tách việc render thành các lát cắt thời gian nhỏ (Time-slicing) có thể **tạm dừng (pause), hủy bỏ (abort), hoặc ưu tiên hóa (prioritize)**.

### 2.2 Cấu Trúc Của Một Fiber Node
Mỗi Fiber Node là một đơn vị công việc (Unit of Work) đại diện cho một Component hoặc DOM element:
```javascript
function FiberNode(tag, key, type) {
    this.tag = tag;          // Định danh kiểu: FunctionComponent, HostComponent (div/p)...
    this.key = key;          // Khóa nhận diện
    this.type = type;        // Hàm Component hoặc tên thẻ HTML ("div")
    this.stateNode = null;   // Tham chiếu tới DOM node thực tế hoặc class instance

    // CẤU TRÚC LIÊN KẾT CÂY (TREE POINTERS):
    this.return = null;      // Trỏ về node cha
    this.child = null;       // Trỏ về node con ĐẦU TIÊN
    this.sibling = null;     // Trỏ về node anh/chị em KẾ TIẾP

    // BỘ NHỚ TRẠNG THÁI:
    this.memoizedState = null; // Linked list chứa các Hooks (useState, useEffect)
    this.memoizedProps = null; // Props của lần render trước

    // DOUBLE BUFFERING:
    this.alternate = null;   // Trỏ tới Fiber tương ứng ở cây đối xứng
}
```

```
           [App Fiber]
               │ (child)
               ▼
          [Nav Fiber] ──(sibling)──> [Content Fiber]
               │                          │ (child)
           (return)                       ▼
               └────────────────── [Article Fiber]
```

### 2.3 Kỹ Thuật Double Buffering (Đệm Đôi)
Tương tự như trong lập trình đồ họa game 3D, React duy trì song song 2 cây Fiber:
1. **`current` Tree:** Đại diện cho những gì đang hiển thị thực tế trên màn hình người dùng.
2. **`workInProgress` Tree:** Cây đang được tính toán, diffing ngầm trong bộ nhớ RAM mà không chạm vào DOM.
Khi toàn bộ Render Phase hoàn tất và sẵn sàng cho Commit Phase, React chỉ cần tráo con trỏ gốc:
`root.current = workInProgress;`
Giao diện mới lập tức xuất hiện mà không bao giờ bị hiện tượng nhấp nháy hoặc hiển thị dở dang.

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Nghĩ rằng Render Phase đã thay đổi DOM
Nhiều lập trình viên lầm tưởng khi hàm Component chạy (Render Phase) là DOM đã được cập nhật. Thực tế, Render Phase hoàn toàn chỉ là tính toán pure JS. Chỉ khi bước vào **Commit Phase** thì Real DOM mới bị can thiệp.

---

## 4. Code Thực Hành (Production Patterns)

```javascript
// Mô phỏng thuật toán duyệt cây Fiber bằng Work Loop (Không đệ quy)
export function performUnitOfWork(unitOfWork) {
    console.log(`Processing Fiber: <${unitOfWork.type}>`);

    // 1. Nếu có con, duyệt xuống con đầu tiên
    if (unitOfWork.child) {
        return unitOfWork.child;
    }

    // 2. Nếu không có con, duyệt sang anh chị em
    let current = unitOfWork;
    while (current) {
        if (current.sibling) {
            return current.sibling;
        }
        // 3. Quay ngược về cha để tìm anh chị em của cha
        current = current.return;
    }

    return null; // Đã duyệt hết toàn bộ cây!
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Tại sao Fiber Reconciler lại chuyển từ cấu trúc cây thông thường sang cấu trúc 3 con trỏ `child`, `sibling`, `return`?
   - *Trả lời:* Với cấu trúc cây thông thường, việc duyệt cây bắt buộc phải dùng đệ quy hoặc một mảng ngăn xếp (Call Stack) của JavaScript engine, điều này không thể dừng lại giữa chừng được. Với 3 con trỏ `child`, `sibling`, `return`, toàn bộ cây trở thành một danh sách liên kết. Trình điều phối của React chỉ cần lưu lại **duy nhất một con trỏ tới node hiện tại (`workInProgress`)**. Nếu hết thời gian của khung hình (16ms), React lưu con trỏ này lại, trả quyền điều khiển cho trình duyệt vẽ giao diện, và sau đó quay lại tiếp tục đúng vị trí đó từ con trỏ mà không cần tính toán lại từ đầu.

2. **Câu hỏi:** Phân biệt hai giai đoạn Render Phase và Commit Phase trong kiến trúc Fiber?
   - *Trả lời:* 
     - **Render Phase:** Chạy component functions, tính toán Virtual DOM, tạo ra cây `workInProgress` và gắn các cờ hiệu ứng (Flags/Effects). Giai đoạn này là bất đồng bộ (Asynchronous), có thể bị ngắt quãng hoặc tính toán lại nhiều lần, và tuyệt đối không được gây ra side effects.
     - **Commit Phase:** Nhận kết quả từ Render Phase và thực hiện ghi các thay đổi lên Real DOM, gọi các lifecycle/effects. Giai đoạn này luôn diễn ra **đồng bộ (Synchronous)** trong một lần duy nhất để bảo đảm người dùng không bao giờ thấy giao diện bị dở dang.
