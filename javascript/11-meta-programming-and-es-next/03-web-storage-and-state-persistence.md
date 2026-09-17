# Web Storage & Quản Lý Trạng Thái Bền Vững (State Persistence)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-fundamentals/03-data-types.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/03-data-types.md) (Kiểu dữ liệu và tuần tự hóa chuỗi).
  - [06-dom-and-web-apis/03-dom-events-and-delegation.md](file:///d:/my-project/revision-document/javascript/06-dom-and-web-apis/03-dom-events-and-delegation.md) (Cơ chế lắng nghe sự kiện trên Window).
- **Khái niệm tương quan**:
  - **Storage Hierarchy**: Cookies (4KB, tự động gửi kèm mọi HTTP Request) $\to$ Web Storage (`localStorage` / `sessionStorage`, 5-10MB, thuần Client) $\to$ IndexedDB (hàng trăm MB/GB, bất đồng bộ, hỗ trợ binary & transaction).
  - **Cross-Tab Communication**: Đồng bộ dữ liệu đa tab thông qua sự kiện `window.onstorage`, `BroadcastChannel`, hoặc `SharedWorker`.
- **Điểm đến tiếp theo**:
  - [practice.js](file:///d:/my-project/revision-document/javascript/11-meta-programming-and-es-next/practice.js) (Thử thách tổng hợp Module 11).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Ma Trận So Sánh Các Cơ Chế Lưu Trữ Client

| Tiêu chí | `localStorage` | `sessionStorage` | Cookie | `IndexedDB` |
| :--- | :--- | :--- | :--- | :--- |
| **Dung lượng tối đa** | ~5MB - 10MB | ~5MB | ~4KB | Dung lượng ổ đĩa khả dụng (>= 50MB) |
| **Vòng đời (Lifetime)** | Vĩnh viễn (cho tới khi xóa) | Đóng Tab/Window hiện tại | Cấu hình qua `Max-Age` / `Expires` | Vĩnh viễn |
| **Phạm vi (Scope)** | Cùng Origin (Protocol + Host + Port) | Cùng Tab + Cùng Origin | Cấu hình qua `Domain` + `Path` | Cùng Origin |
| **Truy cập từ Server** | Không | Không | Tự động gửi qua Header `Cookie` | Không |
| **Mô hình I/O** | **Đồng bộ (Synchronous)** | **Đồng bộ (Synchronous)** | Đồng bộ (Document.cookie) | **Bất đồng bộ (Asynchronous)** |

### 2.2. Bản Chất Đồng Bộ (Synchronous Disk I/O Block)
Cả `localStorage` và `sessionStorage` đều hoạt động **hoàn toàn đồng bộ (Synchronous)** trên Main Thread:
- Khi đọc hoặc ghi các JSON payload dung lượng lớn (vài megabytes), trình duyệt sẽ block toàn bộ Rendering Pipeline và Event Loop cho đến khi dữ liệu được ghi xuống đĩa cứng.
- **Khuyến nghị**: Chỉ dùng Web Storage cho các cấu hình nhẹ (User Theme, UI Settings, Filter State). Dữ liệu lớn hoặc nhạy cảm về hiệu năng bắt buộc phải chuyển sang `IndexedDB`.

### 2.3. Cơ Chế Đồng Bộ Đa Tab Qua Sự Kiện `storage`

```
 [Tab A (Người dùng click Đăng xuất)]            [Tab B (Đang mở trên màn hình khác)]
                 |                                                 |
  localStorage.setItem('auth_token', '')                           |
                 |                                                 |
                 +----(Trình duyệt bắn sự kiện 'storage')---------->|
                                                                   |
                                                      window.addEventListener('storage', (e) => {
                                                        // e.key === 'auth_token'
                                                        // e.oldValue !== e.newValue
                                                        // Tab B tự động redirect về trang Login!
                                                      })
```

> [!IMPORTANT]
> Sự kiện `storage` **chỉ được kích hoạt trên các Tab KHÁC** cùng Origin. Tab vừa thực hiện lệnh ghi (`setItem`/`removeItem`) sẽ **không** nhận được sự kiện này.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Ép Kiểu Chuỗi Ngầm Định (The "false" is Truthy Trap)
Web Storage chỉ lưu trữ chuỗi văn bản (`DOMString`). Nếu bạn truyền kiểu Boolean hoặc Number:
```javascript
localStorage.setItem('isAuthenticated', false);
const isAuth = localStorage.getItem('isAuthenticated');

if (isAuth) {
  // LỖI NGHIÊM TRỌNG: Chuỗi "false" là truthy trong JavaScript!
  console.log("Đã đăng nhập!"); // Đoạn mã này VẪN CHẠY!
}
// Đúng chuẩn:
const isAuth = localStorage.getItem('isAuthenticated') === 'true';
```

### Bẫy 2: Lưu Object Mà Quên `JSON.stringify()`
```javascript
const profile = { name: "Nam", role: "admin" };
localStorage.setItem('user', profile);
console.log(localStorage.getItem('user')); // "[object Object]" -> Dữ liệu bị hủy hoại vĩnh viễn!
```

### Bẫy 3: Tràn Bộ Nhớ (`QuotaExceededError`)
Khi dung lượng vượt quá giới hạn hoặc khi người dùng duyệt web ở chế độ ẩn danh (Private Browsing trên một số thiết bị/trình duyệt cũ), lệnh `setItem` sẽ ném `DOMException: QuotaExceededError`.
- Nếu không bọc trong `try...catch`, toàn bộ luồng thực thi JavaScript của ứng dụng sẽ bị sập.

### Bẫy 4: Lỗ Hổng Bảo Mật XSS Với JWT Token
Bất kỳ đoạn mã JavaScript độc hại nào chạy trên trang (do tấn công Cross-Site Scripting - XSS) đều có thể đọc toàn bộ `localStorage` thông qua `Object.entries(localStorage)`.
- **Bảo mật chuẩn**: Access Token / Refresh Token nên được lưu trong **HttpOnly, Secure, SameSite Cookie** để JavaScript hoàn toàn không thể chạm tới.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn chạy trực tiếp tại file [03-storage-demo.js](file:///d:/my-project/revision-document/javascript/11-meta-programming-and-es-next/03-storage-demo.js).

Tóm tắt triển khai Production-grade Storage Wrapper:
```javascript
class SmartStorage {
  constructor(storageEngine = globalThis.localStorage) {
    this.engine = storageEngine;
  }

  set(key, value, ttlMs = null) {
    try {
      const record = {
        data: value,
        expiry: ttlMs ? Date.now() + ttlMs : null,
      };
      this.engine.setItem(key, JSON.stringify(record));
      return true;
    } catch (err) {
      console.error("Storage write failed (Quota exceeded or restricted):", err);
      return false;
    }
  }

  get(key) {
    try {
      const raw = this.engine.getItem(key);
      if (!raw) return null;

      const record = JSON.parse(raw);
      if (record.expiry && Date.now() > record.expiry) {
        this.remove(key); // Dọn dẹp key hết hạn
        return null;
      }
      return record.data;
    } catch {
      return null;
    }
  }

  remove(key) {
    this.engine.removeItem(key);
  }
}
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao `sessionStorage` không được chia sẻ giữa 2 tab khi người dùng click chuột phải chọn "Mở trong tab mới" hoặc dán URL vào tab mới?
**Đáp án chi tiết**:
- Theo đặc tả W3C Web Storage, mỗi phiên `sessionStorage` gắn liền với ngữ cảnh duyệt cấp cao nhất (Top-Level Browsing Context).
- Khi người dùng chủ động mở một Tab mới hoặc dán URL, trình duyệt tạo ra một Browsing Context hoàn toàn cô lập với `sessionStorage` trống rỗng.
- **Trường hợp ngoại lệ duy nhất**: Khi một trang web mở trang con qua mã lệnh `window.open(url)` (và không thiết lập `noopener` / `noreferrer`), tab con sẽ nhận một **bản sao sâu (deep copy)** trạng thái `sessionStorage` của tab cha tại thời điểm mở. Sau thời điểm đó, mọi thay đổi trên tab con hay tab cha đều hoàn toàn độc lập và không đồng bộ với nhau.

### Câu 2: Làm cách nào để kích hoạt kiểm tra sự kiện `storage` chạy ngay trên chính tab vừa thực hiện cập nhật dữ liệu?
**Đáp án chi tiết**:
- Theo thiết kế mặc định của trình duyệt để chống lặp vô tận (Infinite loop), sự kiện `window.onstorage` chỉ phát tán (broadcast) đến các Document khác cùng Origin.
- **Giải pháp**: Nếu muốn chính tab hiện tại cũng nhận được thông báo thống nhất, ta có thể tự dispatch một `StorageEvent` nhân tạo hoặc sử dụng `BroadcastChannel API`:
  ```javascript
  // Cách 1: Tự kích hoạt CustomEvent hoặc StorageEvent trên window
  function setItemWithEvent(key, val) {
    const oldValue = localStorage.getItem(key);
    localStorage.setItem(key, val);
    window.dispatchEvent(new StorageEvent('storage', {
      key,
      oldValue,
      newValue: val,
      storageArea: localStorage,
      url: window.location.href
    }));
  }
  ```
