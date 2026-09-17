/**
 * 02-event-listener-demo.js
 * Chạy độc lập: node 02-event-listener-demo.js
 * Kiểm chứng kiến trúc Event Listener Playground:
 * 1. Tọa độ chuột (clientX vs pageX vs offsetX)
 * 2. Phân tích trạng thái phím (e.key, e.code, modifiers)
 * 3. Thuật toán Debounce (chờ độ trễ yên lặng)
 * 4. Thuật toán Throttle (giới hạn tần suất kích hoạt)
 * 5. Event Audit Logger với dung lượng đệm cố định (Circular Buffer)
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 02: EVENT LISTENER PLAYGROUND ===");

// -------------------------------------------------------------
// 1. TỌA ĐỘ CHUỘT: VIEWPORT VS DOCUMENT VS OFFSET
// -------------------------------------------------------------
function calculateMouseCoordinates({ clientX, clientY, scrollX, scrollY, elementRect }) {
  // clientX/Y: Tọa độ so với Viewport màn hình
  // pageX/Y: Tọa độ so với toàn bộ trang web (bao gồm phần đã cuộn)
  const pageX = clientX + scrollX;
  const pageY = clientY + scrollY;

  // offsetX/Y: Tọa độ tương đối bên trong phần tử mục tiêu (tính từ mép padding ngoài)
  const offsetX = clientX - elementRect.left;
  const offsetY = clientY - elementRect.top;

  return { clientX, clientY, pageX, pageY, offsetX, offsetY };
}

const coords = calculateMouseCoordinates({
  clientX: 150,
  clientY: 200,
  scrollX: 50,
  scrollY: 100,
  elementRect: { left: 100, top: 150 },
});

assert.equal(coords.pageX, 200, "pageX = clientX (150) + scrollX (50)");
assert.equal(coords.pageY, 300, "pageY = clientY (200) + scrollY (100)");
assert.equal(coords.offsetX, 50, "offsetX = clientX (150) - element.left (100)");
assert.equal(coords.offsetY, 50, "offsetY = clientY (200) - element.top (150)");

// -------------------------------------------------------------
// 2. PHÂN TÍCH PHÍM & TỔ HỢP PHÍM TẮT (KEY COMBINATIONS)
// -------------------------------------------------------------
function analyzeKeyboardEvent(e) {
  const isShortcutSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";
  const isEscape = e.key === "Escape";

  return {
    key: e.key,
    code: e.code,
    isPrintable: e.key.length === 1,
    isShortcutSave,
    isEscape,
    modifiers: {
      ctrl: Boolean(e.ctrlKey),
      shift: Boolean(e.shiftKey),
      alt: Boolean(e.altKey),
      meta: Boolean(e.metaKey),
    },
  };
}

const saveEvent = analyzeKeyboardEvent({
  key: "s",
  code: "KeyS",
  ctrlKey: true,
  shiftKey: false,
  altKey: false,
  metaKey: false,
});

assert.equal(saveEvent.isShortcutSave, true, "Bắt chuẩn tổ hợp Ctrl+S");
assert.equal(saveEvent.isPrintable, true);

// -------------------------------------------------------------
// 3. THUẬT TOÁN DEBOUNCE (CHỜ ĐỘ TRỄ YÊN LẶNG)
// -------------------------------------------------------------
// Thường dùng cho: Search autocomplete, Resize window, Auto-save form
function debounce(fn, delayMs) {
  let timerId = null;
  return function (...args) {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn.apply(this, args);
      timerId = null;
    }, delayMs);
  };
}

let debounceExecutedCount = 0;
let lastDebounceValue = "";
const debouncedSearch = debounce((val) => {
  debounceExecutedCount++;
  lastDebounceValue = val;
}, 50);

// Giả lập người dùng gõ liên tục trong 30ms: "a" -> "ab" -> "abc"
debouncedSearch("a");
debouncedSearch("ab");
debouncedSearch("abc");

// Ngay lập tức thì chưa hàm nào được gọi
assert.equal(debounceExecutedCount, 0, "Chưa đủ delay thì không được chạy");

// Chờ 100ms để debounce kích hoạt
await new Promise((resolve) => setTimeout(resolve, 100));

assert.equal(debounceExecutedCount, 1, "Chỉ được chạy đúng 1 lần cho cả cụm gõ");
assert.equal(lastDebounceValue, "abc", "Chỉ nhận giá trị cuối cùng");

// -------------------------------------------------------------
// 4. THUẬT TOÁN THROTTLE (GIỚI HẠN TẦN SUẤT KÍCH HOẠT)
// -------------------------------------------------------------
// Thường dùng cho: Mousemove, Scroll, Dragging
function throttle(fn, limitMs) {
  let lastRan = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastRan >= limitMs) {
      fn.apply(this, args);
      lastRan = now;
    }
  };
}

let throttleExecutedCount = 0;
const throttledMouseMove = throttle(() => {
  throttleExecutedCount++;
}, 50);

// Gọi liên tiếp 5 lần trong cùng 1 tick
throttledMouseMove();
throttledMouseMove();
throttledMouseMove();
throttledMouseMove();
throttledMouseMove();

assert.equal(throttleExecutedCount, 1, "Chỉ kích hoạt lần đầu và chặn các lần gọi dồn dập");

// -------------------------------------------------------------
// 5. CIRCULAR BUFFER EVENT AUDIT LOG (BỘ ĐỆM VÒNG AN TOÀN BỘ NHỚ)
// -------------------------------------------------------------
// Tránh việc lưu mảng vô hạn gây Memory Leak khi lắng nghe hàng ngàn sự kiện
class CircularEventLogger {
  constructor(maxSize = 5) {
    this.maxSize = maxSize;
    this.buffer = [];
  }

  log(eventSummary) {
    if (this.buffer.length >= this.maxSize) {
      this.buffer.shift(); // Loại bỏ sự kiện cũ nhất
    }
    this.buffer.push({
      timestamp: Date.now(),
      summary: eventSummary,
    });
  }

  getEntries() {
    return [...this.buffer];
  }
}

const logger = new CircularEventLogger(3);
logger.log("click:btn1");
logger.log("keydown:Enter");
logger.log("mousemove:10,20");
assert.equal(logger.getEntries().length, 3);

// Thêm sự kiện thứ 4: sự kiện cũ nhất (click:btn1) phải bị đẩy ra
logger.log("resize:800x600");
assert.equal(logger.getEntries().length, 3, "Giữ nguyên giới hạn bộ đệm");
assert.equal(logger.getEntries()[0].summary, "keydown:Enter", "Đã đẩy phần tử cũ nhất ra khỏi mảng");
assert.equal(logger.getEntries()[2].summary, "resize:800x600");

console.log("-> 100% tests cho Event Listener Playground đã pass thành công!");
