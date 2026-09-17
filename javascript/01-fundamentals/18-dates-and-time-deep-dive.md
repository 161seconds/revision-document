# Ngày Giờ, Định Dạng & Chuẩn Thời Gian (JavaScript Dates & Time Deep Dive)

Tài liệu ôn tập toàn diện về đối tượng `Date` trong JavaScript: Epoch Unix Milliseconds, cạm bẫy tháng đánh số từ 0 (0-indexed months), cạm bẫy lệch múi giờ khi parse chuỗi ISO, tính đột biến (Date Mutability), và giải pháp định dạng chuẩn quốc tế `Intl.DateTimeFormat`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [09-data-types-deep-dive.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/09-data-types-deep-dive.md) (Đối tượng tham chiếu `Date`).
  - [17-numbers-bitwise-and-bigint.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/17-numbers-bitwise-and-bigint.md) (Unix Timestamps dạng Integer).
- **Mở rộng tiếp theo (Next Steps):**
  - [04-async-javascript/](file:///d:/my-project/revision-document/javascript/04-async-javascript/) (`setTimeout`, `setInterval`, Event Loop timers).
  - Chuẩn mới **Temporal API** (Đặc tả thay thế toàn diện đối tượng Date trong tương lai của ECMAScript).
- **Khái niệm liên quan (Related):**
  - Giờ phối hợp quốc tế (UTC) vs Giờ cục bộ (Local Timezone Offset).
  - Chuẩn ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).

---

## 2. Bản Chất Hoạt Động (Mental Model: Unix Epoch & Lưu Trữ Millisecond)

### 1. Bản Chất Dưới Tầng Động Cơ Của Đối Tượng `Date`
Đối tượng `Date` trong JavaScript về bản chất **chỉ lưu trữ duy nhất một con số nguyên 64-bit**:
- Số mili-giây (milliseconds) trôi qua kể từ thời điểm **Unix Epoch**: `00:00:00 UTC ngày 01/01/1970`.
- Mọi thông tin ngày, tháng, năm, giờ, phút, giây chỉ là **cách hiển thị được tính toán theo múi giờ** (Local hoặc UTC) dựa trên con số mili-giây này.

### 2. Các Cách Khởi Tạo `Date`
```javascript
new Date();                         // Thời điểm hiện tại
new Date(timestampMs);              // Số ms từ Unix Epoch
new Date("2026-09-17T14:30:00Z");   // Chuỗi chuẩn ISO 8601
new Date(year, monthIndex, day);    // BẪY: monthIndex bắt đầu từ 0!
```

### 3. Phân Biệt Các Nhóm Phương Thức Getters
| Thông tin | Phương thức Giờ Cục Bộ (Local) | Phương thức Chuẩn (UTC) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Năm** | `getFullYear()` | `getUTCFullYear()` | **Không bao giờ dùng `getYear()`** (bị deprecated) |
| **Tháng** | `getMonth()` | `getUTCMonth()` | **`0` = Tháng 1, `11` = Tháng 12** |
| **Ngày trong tháng** | `getDate()` | `getUTCDate()` | Từ 1 đến 31 |
| **Thứ trong tuần** | `getDay()` | `getUTCDay()` | **`0` = Chủ Nhật, `6` = Thứ 7** |
| **Timestamp (ms)** | `getTime()` hoặc `+date` | `Date.now()` | Trả về số ms Unix Epoch |

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Bẫy Tháng Bắt Đầu Từ 0 (0-Indexed Month)
```javascript
// Bạn muốn tạo ngày 15 tháng 10 năm 2026:
const d = new Date(2026, 10, 15);
// KẾT QUẢ: 15 THÁNG 11 NĂM 2026! Vì tháng 10 là số 9!
```

### 2. Bẫy Múi Giờ Lệch 1 Ngày Khi Parse Chuỗi Ngày (Date-Only ISO String)
- Theo chuẩn ECMAScript:
  - `new Date("2026-09-17")` (Chỉ có ngày) được coi là **UTC 00:00:00**. Tại Việt Nam (UTC+7), hiển thị là `07:00:00` sáng ngày 17. Nhưng tại New York (UTC-4), thời điểm này là `20:00:00` ngày 16! ➔ **Bị lùi 1 ngày!**
  - `new Date("2026-09-17T00:00:00")` (Có giờ) lại được hiểu là **Local Time**!
  - ➔ **Giải pháp:** Luôn chỉ định rõ múi giờ với hậu tố `Z` hoặc offset `+07:00`.

### 3. Bẫy Đột Biến (Date Mutability)
- `Date` là một Mutable Object:
  ```javascript
  const start = new Date("2026-01-01");
  const end = start;
  end.setMonth(start.getMonth() + 1); // CẢ start VÀ end ĐỀU BỊ ĐỔI THÀNH THÁNG 2!
  // Cách an toàn: Tạo bản sao mới: const end = new Date(start.getTime());
  ```

---

## 4. Giải Pháp Hiện Đại: `Intl.DateTimeFormat` (Không Cần Thư Viện Ngoài)
Không cần cài đặt Moment.js hay Day.js cho các tác vụ format cơ bản, JavaScript đã tích hợp sẵn API quốc tế hóa cực mạnh:
```javascript
const now = new Date("2026-09-17T14:30:00Z");

const formatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

console.log(formatter.format(now));
// In ra: "Thứ Năm, 17 tháng 9, 2026 lúc 21:30"
```

---

## 5. File Code Thực Hành

- [18-dates-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/18-dates-demo.js): Code thực nghiệm Epoch ms, cạm bẫy tháng 0-indexed, mutate date, và định dạng chuẩn quốc tế `Intl.DateTimeFormat`. Chạy bằng: `node 18-dates-demo.js`.

---

## 6. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Phương thức `date.getMonth()` trả về giá trị gì cho tháng 1? Và `date.getDay()` trả về gì cho Chủ Nhật?**
   *Đáp án:* `date.getMonth()` trả về `0` cho tháng 1. `date.getDay()` trả về `0` cho Chủ Nhật.
2. **Tại sao đối tượng `Date` cũ trong JavaScript bị đánh giá là có thiết kế kém và TC39 đang chuẩn hóa Temporal API?**
   *Đáp án:* Vì `Date` có tính đột biến (mutable) dễ gây bug, tháng đánh số từ 0 phản trực giác, parse chuỗi ngày không nhất quán về múi giờ, và không hỗ trợ xử lý múi giờ trực tiếp mà không đổi timestamp.
