# React Master Cheat Sheet

Bản tóm tắt toàn diện kiến trúc React, JSX Mechanics, Virtual DOM, Fiber Reconciler, Hooks Catalog, State Management, Performance Optimization và các tính năng đột phá trong React 18 & 19.

---

## 1. Kiến Trúc Cốt Lõi & JSX Mechanics

```
  JSX Source Code                     Transpiler (Babel / SWC)                   Browser Runtime
 <div><Badge /></div>  ───>  jsx("div", { children: jsx(Badge, {}) })  ───>  React Element (VNode)
                                                                                  │
                                                                           Fiber Tree (DOM)
```

- **JSX không phải HTML:** JSX là cú pháp mở rộng của JavaScript (Syntactic Sugar). Mỗi thẻ JSX được chuyển đổi thành lời gọi hàm `React.createElement(...)` (classic runtime) hoặc `_jsx(...)` (modern runtime).
- **React Element là gì?** Là một JavaScript Plain Object thuần túy (bất biến - immutable) miêu tả nút giao diện:
  `{ type: "div", props: { className: "card", children: [...] }, key: null, ref: null }`.
- **Virtual DOM:** Cây biểu diễn các React Elements trong bộ nhớ RAM, cho phép React so khớp (Diffing) trước khi chạm vào Real DOM chậm chạp của trình duyệt.

---

## 2. Toàn Bộ Bảng Tra Cứu Hooks Chuẩn (Hooks Catalog)

| Hook | Cú pháp | Bản chất hoạt động & Khi nào dùng |
| :--- | :--- | :--- |
| **`useState`** | `const [s, setS] = useState(init)` | Quản lý trạng thái cục bộ của Component; kích hoạt re-render khi giá trị thay đổi |
| **`useEffect`** | `useEffect(fn, [deps])` | Xử lý hiệu ứng lề (Side Effects: API call, subscriptions, DOM mutations) sau khi DOM đã vẽ |
| **`useContext`** | `const val = useContext(MyContext)` | Tiêu thụ dữ liệu từ Context Provider mà không cần truyền prop drilling qua các tầng trung gian |
| **`useReducer`** | `const [state, dispatch] = useReducer(reducer, init)` | Quản lý trạng thái phức tạp có nhiều chuyển trạng thái liên quan nhau theo mô hình Redux |
| **`useRef`** | `const ref = useRef(initialValue)` | Lưu trữ giá trị bất biến qua các lần render **mà không kích hoạt re-render**; tham chiếu trực tiếp DOM Node |
| **`useMemo`** | `const val = useMemo(() => calc(), [deps])` | Ghi nhớ (cache) kết quả tính toán tốn kém, chỉ tính toán lại khi dependency thay đổi |
| **`useCallback`** | `const fn = useCallback(() => {}, [deps])` | Ghi nhớ định danh hàm (function reference) giữa các lần render để tránh re-render component con bọc bởi `React.memo` |
| **`useTransition`** | `const [isPending, startTransition] = useTransition()` | Đánh dấu cập nhật trạng thái là Non-Urgent (ưu tiên thấp), giữ cho UI luôn phản hồi mượt mà |
| **`useDeferredValue`** | `const deferred = useDeferredValue(value)` | Trì hoãn cập nhật một phần tử UI phức tạp cho đến khi các tác vụ ưu tiên cao hoàn tất |
| **`useId`** | `const id = useId()` | Sinh chuỗi ID độc nhất, ổn định trên cả Client và SSR, tối ưu cho Accessibility (`aria-*`) |

---

## 3. Quy Tắc Sinh Tử Của Hooks (Rules of Hooks)

1. **Chỉ gọi Hooks ở Cấp Cao Nhất (Only Call Hooks at the Top Level):**
   - ❌ Tuyệt đối KHÔNG gọi Hooks bên trong vòng lặp (`for`), câu lệnh điều kiện (`if-else`), hoặc hàm lồng nhau.
   - **Tại sao?** React lưu trữ trạng thái của các hooks dưới dạng một **Danh sách liên kết đơn (Singly Linked List of Fibers)**. Việc thay đổi thứ tự gọi giữa các lần render sẽ làm tráo đổi con trỏ hook, dẫn đến sai lệch trạng thái nghiêm trọng.
2. **Chỉ gọi Hooks từ React Functions:**
   - Chỉ gọi từ Functional Components hoặc Custom Hooks (bắt đầu bằng tiền tố `use`).

---

## 4. Vòng Đời & Chu Kỳ Render (Render & Commit Phases)

```
[Trigger] (Initial Mount / State Update)
   │
   ▼
[1. Render Phase] (Pure & No Side Effects)
   - Chạy hàm Component.
   - Tính toán JSX và sinh Virtual DOM.
   - Diffing / Reconciliation tìm ra các thay đổi (Fiber work loop).
   - Có thể bị tạm dừng, hủy bỏ hoặc tính toán lại (Concurrent React).
   │
   ▼
[2. Commit Phase] (DOM Mutation & Side Effects)
   - Ghi các thay đổi trực tiếp vào Real DOM (đồng bộ).
   - Chạy `useLayoutEffect` (trước khi trình duyệt vẽ paint).
   - Trình duyệt vẽ giao diện lên màn hình (Browser Paint).
   - Chạy `useEffect` bất đồng bộ (sau khi người dùng đã thấy màn hình).
```

---

## 5. React 18 Automatic Batching

Trước React 18, React chỉ tự động gộp (batch) các lệnh `setState` bên trong React Event Handlers. Các lệnh bên trong `setTimeout`, `Promise.then` hay native event listeners đều kích hoạt re-render riêng lẻ:
```javascript
// React 18+: TỰ ĐỘNG GỘP TẤT CẢ
setTimeout(() => {
    setCount(c => c + 1);
    setFlag(f => !f);
    // Chỉ kích hoạt DUY NHẤT 1 lần re-render cho cả 2 cập nhật!
}, 1000);
```

---

## 6. Kiến Trúc Fiber Reconciler

- **Fiber Node:** Đơn vị công việc (unit of work) độc lập trong React, biểu diễn một Component với các con trỏ:
  - `child`: Trỏ tới node con đầu tiên.
  - `sibling`: Trỏ tới node anh/chị em kế tiếp.
  - `return`: Trỏ về node cha.
- **Double Buffering:** React duy trì 2 cây Fiber song song:
  - `current`: Cây đang hiển thị trên màn hình.
  - `workInProgress`: Cây đang được tính toán ngầm trong RAM.
  Khi Render Phase hoàn tất, React chỉ cần tráo con trỏ gốc (`current = workInProgress`) để hiển thị giao diện mới tức thì.

---

## 7. Performance Optimization Checklist

1. **`React.memo`:** Bọc component con để ngăn re-render nếu props không đổi (so sánh shallow).
2. **`useCallback`:** Bảo toàn tham chiếu hàm khi truyền qua component con đã bọc `React.memo`.
3. **`useMemo`:** Tránh chạy lại các phép toán nặng (lọc, sắp xếp mảng lớn) nếu dữ liệu nguồn chưa đổi.
4. **Tránh bẫy Inline Objects/Functions trong JSX:**
   ```jsx
   // ❌ Tạo object mới mỗi lần render -> phá vỡ React.memo
   <Child style={{ color: "red" }} onClick={() => doSomething()} />
   ```
5. **Key Prop trong List:**
   - ❌ Tuyệt đối không dùng `index` làm key cho danh sách có sắp xếp, lọc, thêm, xóa.
   -  Luôn dùng định danh duy nhất ổn định (`item.id`).

---

## 8. Top 5 Bẫy Phỏng Vấn Kinh Điển Trong React

1. **State Updates là Asynchronous / Batched:** Gọi `setCount(count + 1); console.log(count);` sẽ in ra giá trị cũ vì state chưa được cập nhật ngay lập tức. Muốn tính toán dựa trên state trước đó, phải dùng Updater Function: `setCount(prev => prev + 1)`.
2. **Bẫy `useEffect` Dependency Array rỗng (`[]`):** Closure giữ giá trị state của lần render đầu tiên (Stale Closure). Nếu dùng `setInterval` bên trong, phải dùng updater function `setCount(c => c + 1)` thay vì `setCount(count + 1)`.
3. **Short-circuit `&&` với số 0:** `{count && <Component />}`: Nếu `count === 0`, React sẽ in số `0` trực tiếp ra màn hình thay vì ẩn component! Khắc phục: `{count > 0 && <Component />}` hoặc `{Boolean(count) && <Component />}`.
4. **Context API kích hoạt Re-render toàn bộ Consumer:** Khi Context Value thay đổi, mọi component gọi `useContext(MyContext)` đều bị re-render, ngay cả khi chúng chỉ quan tâm tới một trường không đổi trong Context. Giải pháp: Chia nhỏ Context hoặc dùng Zustand.
5. **Clean-up Function trong `useEffect` chạy khi nào?** Chạy **trước** khi Effect tiếp theo được thực thi và khi Component unmount khỏi DOM, dùng để hủy subscription, dọn dẹp timer hoặc abort Fetch controller.
