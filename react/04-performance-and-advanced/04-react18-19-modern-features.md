# 04. React 18 & 19 Modern Features

Các tính năng đột phá của React hiện đại: Đột phá tính đồng thời (Concurrent React), `useTransition`, `useDeferredValue`, React Server Components (RSC) và Server Actions trong React 19.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [Error Boundaries & Resilience](file:///d:/my-project/revision-document/react/04-performance-and-advanced/03-error-boundaries-and-resilience.md)
- **Tiếp theo:** [React Revision Guide (Summary)](file:///d:/my-project/revision-document/react/summary.md)
- **Tổng hợp:** [Developer Revision Documents (Master Index)](file:///d:/my-project/revision-document/README.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Concurrent React (Xử Lý Đồng Thời)
Trước React 18, quá trình render là **đơn luồng chặn (blocking)**: Một khi React đã bắt đầu render, không gì có thể ngăn cản nó cho đến khi hoàn thành toàn bộ cây.
Trong **Concurrent React**, quá trình render là **có thể bị gián đoạn (interruptible)**. React có thể:
- Tạm dừng một quá trình render nặng đang diễn ra.
- Nhường luồng chính (Main Thread) cho trình duyệt phản hồi sự kiện người dùng gõ phím.
- Sau đó quay lại tiếp tục render tác vụ nặng hoặc bỏ luôn nếu dữ liệu đã lỗi thời.

### 2.2 `useTransition` (Phân Cấp Ưu Tiên Trạng Thái)
Chia các cập nhật trạng thái thành 2 loại:
1. **Urgent Updates (Khẩn cấp):** Phản ánh tương tác trực tiếp (gõ phím vào input, click, di chuột).
2. **Transition Updates (Không khẩn cấp):** Chuyển đổi giao diện (lọc danh sách 10.000 sản phẩm, chuyển tab).

```jsx
import { useState, useTransition } from "react";

function SearchPage() {
    const [query, setQuery] = useState("");
    const [filteredList, setFilteredList] = useState([]);
    const [isPending, startTransition] = useTransition();

    const handleInput = (e) => {
        // 1. Urgent: Cập nhật ô gõ phím ngay lập tức
        setQuery(e.target.value);

        // 2. Non-urgent: Cho phép tạm dừng nếu người dùng tiếp tục gõ
        startTransition(() => {
            setFilteredList(filterHeavyData(e.target.value));
        });
    };

    return (
        <div>
            <input value={query} onChange={handleInput} />
            {isPending && <span className="spinner">Đang lọc...</span>}
            <ItemList items={filteredList} />
        </div>
    );
}
```

### 2.3 `useDeferredValue`
Tương tự như `useTransition`, nhưng áp dụng trực tiếp lên một **giá trị (value)** thay vì một hành động setState:
```jsx
const deferredQuery = useDeferredValue(query);
// deferredQuery sẽ giữ giá trị cũ cho đến khi các tác vụ ưu tiên cao hoàn tất
```

### 2.4 React Server Components (RSC) vs Client Components
- **Server Components (`.server.jsx` hoặc mặc định trong Next.js App Router):**
  - Chạy **100% trên Server**.
  - Không gửi bất kỳ mã JavaScript nào về Client (0 KB Client Bundle).
  - Có thể truy cập trực tiếp Database, File System, Private API Keys.
  - Không thể dùng Hooks (`useState`, `useEffect`) hay Event Handlers (`onClick`).
- **Client Components (`"use client"`):**
  - Chạy trên cả Server (SSR) và Hydrate trên Client.
  - Chứa tính tương tác: Hooks, Events, Browser APIs.

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Bọc Controlled Input vào `startTransition`
```javascript
// ❌ SAI LẦM: Làm ô nhập bị khựng (lag) vì việc gõ phím bị coi là không khẩn cấp!
startTransition(() => {
    setText(e.target.value);
});
```
**Quy tắc:** Giá trị của thẻ `<input>` phải luôn là Urgent Update (`setText(e.target.value)` trực tiếp). Chỉ bọc các tác vụ tính toán kết quả phái sinh vào `startTransition`.

---

## 4. Code Thực Hành (Production Patterns)

```jsx
// Pattern: Chuyển đổi Tab mượt mà không chặn UI với useTransition
import { useState, useTransition } from "react";

export function TabContainer() {
    const [activeTab, setActiveTab] = useState("feed");
    const [isPending, startTransition] = useTransition();

    const selectTab = (tabName) => {
        startTransition(() => {
            setActiveTab(tabName);
        });
    };

    return (
        <div>
            <div className="tabs-header">
                <button onClick={() => selectTab("feed")} className={activeTab === "feed" ? "active" : ""}>
                    Bảng Tin
                </button>
                <button onClick={() => selectTab("analytics")} className={activeTab === "analytics" ? "active" : ""}>
                    Thống Kê Nặng
                </button>
            </div>

            <div style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}>
                {activeTab === "feed" && <FeedView />}
                {activeTab === "analytics" && <HeavyAnalyticsView />}
            </div>
        </div>
    );
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** Sự khác biệt cốt lõi giữa Debounce/Throttle và `useTransition` trong React 18 là gì?
   - *Trả lời:* Debounce và Throttle là các kỹ thuật dựa vào bộ đếm thời gian cố định (Fixed Timer, ví dụ đợi 300ms sau khi ngừng gõ mới bắt đầu tính toán). Điều này khiến các máy tính cấu hình cao vẫn phải chịu một độ trễ nhân tạo 300ms. `useTransition` không sử dụng timer; nó bắt đầu thực hiện tính toán ngay lập tức trên luồng nền. Nếu thiết bị của người dùng mạnh, nó render xong trong 5ms. Nếu người dùng tiếp tục gõ phím trong lúc đang render dở, React sẽ hủy đợt render đó ngay tức thì mà không làm nghẽn giao diện.

2. **Câu hỏi:** React Server Components (RSC) khác gì so với Server-Side Rendering (SSR) truyền thống?
   - *Trả lời:* SSR truyền thống render mã HTML trên server nhưng vẫn bắt buộc phải gửi toàn bộ mã JavaScript của các component đó xuống client để thực hiện quá trình Hydration (gắn event listeners và nạp state). Với React Server Components, mã nguồn và các thư viện nặng của Server Component (như thư viện đọc Markdown hay DB driver) **hoàn toàn không được gửi xuống client** (0 KB JS transfer), và client chỉ nhận về một luồng dữ liệu cấu trúc dạng JSON mô tả cây UI (RSC Payload), giúp giảm đáng kể kích thước tải về của trang web.
