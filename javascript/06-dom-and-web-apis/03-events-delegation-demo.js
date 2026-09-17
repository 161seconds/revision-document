/**
 * JavaScript Events & Delegation Demo
 * Thực nghiệm luồng sự kiện 3 giai đoạn (Capturing, Target, Bubbling),
 * stopPropagation, preventDefault, cờ { once: true }, và mô hình Event Delegation.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: MÔ PHỎNG LUỒNG SỰ KIỆN 3 GIAI ĐOẠN (EVENT FLOW) ===");

class MockEvent {
  constructor(type, bubbles = true, cancelable = true) {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
    this.target = null;
    this.currentTarget = null;
    this.eventPhase = 0; // 1: CAPTURING, 2: AT_TARGET, 3: BUBBLING
    this.defaultPrevented = false;
    this._propagationStopped = false;
  }

  preventDefault() {
    if (this.cancelable) {
      this.defaultPrevented = true;
    }
  }

  stopPropagation() {
    this._propagationStopped = true;
  }
}

class MockEventTarget {
  constructor(name) {
    this.name = name;
    this.parent = null;
    this.listeners = { capture: [], bubble: [] };
  }

  addEventListener(type, handler, options = {}) {
    const isCapture = typeof options === "boolean" ? options : (options.capture ?? false);
    const isOnce = options.once ?? false;
    const bucket = isCapture ? this.listeners.capture : this.listeners.bubble;

    const wrapper = (e) => {
      handler(e);
      if (isOnce) {
        this.removeEventListener(type, handler, isCapture);
      }
    };
    wrapper.originalHandler = handler;

    bucket.push({ type, fn: wrapper });
  }

  removeEventListener(type, handler, isCapture = false) {
    const bucket = isCapture ? this.listeners.capture : this.listeners.bubble;
    const idx = bucket.findIndex(item => item.fn.originalHandler === handler || item.fn === handler);
    if (idx !== -1) {
      bucket.splice(idx, 1);
    }
  }

  dispatchEvent(event) {
    event.target = this;

    // Xây dựng chuỗi tổ tiên từ root -> target:
    const chain = [];
    let curr = this;
    while (curr) {
      chain.unshift(curr);
      curr = curr.parent;
    }

    // Pha 1: CAPTURING (Đi từ Root xuống trước Target)
    event.eventPhase = 1;
    for (let i = 0; i < chain.length - 1; i++) {
      if (event._propagationStopped) break;
      const node = chain[i];
      event.currentTarget = node;
      node.listeners.capture
        .filter(l => l.type === event.type)
        .forEach(l => l.fn(event));
    }

    // Pha 2: AT_TARGET (Tại chính phần tử đích)
    if (!event._propagationStopped) {
      event.eventPhase = 2;
      event.currentTarget = this;
      this.listeners.capture
        .filter(l => l.type === event.type)
        .forEach(l => l.fn(event));
      this.listeners.bubble
        .filter(l => l.type === event.type)
        .forEach(l => l.fn(event));
    }

    // Pha 3: BUBBLING (Đi ngược từ sau Target lên Root)
    if (event.bubbles && !event._propagationStopped) {
      event.eventPhase = 3;
      for (let i = chain.length - 2; i >= 0; i--) {
        if (event._propagationStopped) break;
        const node = chain[i];
        event.currentTarget = node;
        node.listeners.bubble
          .filter(l => l.type === event.type)
          .forEach(l => l.fn(event));
      }
    }

    return !event.defaultPrevented;
  }
}

// Xây dựng cây: Window -> Document -> Body -> Button
const mockWindow = new MockEventTarget("Window");
const mockDoc = new MockEventTarget("Document");
mockDoc.parent = mockWindow;
const mockBody = new MockEventTarget("Body");
mockBody.parent = mockDoc;
const mockButton = new MockEventTarget("Button");
mockButton.parent = mockBody;

const visitLog = [];

mockWindow.addEventListener("click", () => visitLog.push("1. Window Capturing"), { capture: true });
mockDoc.addEventListener("click", () => visitLog.push("2. Document Capturing"), { capture: true });
mockButton.addEventListener("click", () => visitLog.push("3. Button Target"));
mockBody.addEventListener("click", () => visitLog.push("4. Body Bubbling"));
mockDoc.addEventListener("click", () => visitLog.push("5. Document Bubbling"));
mockWindow.addEventListener("click", () => visitLog.push("6. Window Bubbling"));

const clickEvt = new MockEvent("click");
mockButton.dispatchEvent(clickEvt);

assert.deepStrictEqual(visitLog, [
  "1. Window Capturing",
  "2. Document Capturing",
  "3. Button Target",
  "4. Body Bubbling",
  "5. Document Bubbling",
  "6. Window Bubbling"
]);

console.log("Thứ tự duyệt qua 3 pha:", visitLog);
console.log("-> Kiểm chứng Event Flow 3 pha: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: STOPPROPAGATION VÀ PREVENTDEFAULT ===");
let bodyReceived = false;
mockBody.listeners.bubble.push({
  type: "submit",
  fn: () => { bodyReceived = true; }
});

const submitEvt = new MockEvent("submit");
mockButton.addEventListener("submit", (e) => {
  e.preventDefault();
  e.stopPropagation(); // Chặn nổi bọt lên Body!
});

mockButton.dispatchEvent(submitEvt);

assert.strictEqual(submitEvt.defaultPrevented, true);
assert.strictEqual(bodyReceived, false); // Body không hề nhận được do đã bị stopPropagation!
console.log("-> Kiểm chứng stopPropagation & preventDefault: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: TÙY CHỌN { ONCE: TRUE } TỰ HỦY LISTENER ===");
let triggerCount = 0;
const onceTarget = new MockEventTarget("OnceTarget");

onceTarget.addEventListener("ping", () => {
  triggerCount++;
}, { once: true });

onceTarget.dispatchEvent(new MockEvent("ping"));
onceTarget.dispatchEvent(new MockEvent("ping"));
onceTarget.dispatchEvent(new MockEvent("ping"));

// Chỉ kích hoạt đúng 1 lần duy nhất:
assert.strictEqual(triggerCount, 1);
console.log("Số lần kích hoạt sau 3 lần dispatch:", triggerCount);
console.log("-> Kiểm chứng { once: true }: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: MÔ HÌNH ỦY QUYỀN SỰ KIỆN (EVENT DELEGATION) ===");
const listContainer = new MockEventTarget("ListContainer");
let deletedTaskId = null;

// Gắn 1 listener duy nhất vào Container:
listContainer.addEventListener("click", (e) => {
  // @ts-ignore
  if (e.target && e.target.isDeleteBtn) {
    // @ts-ignore
    deletedTaskId = e.target.taskId;
  }
});

// Tạo nút con động:
const dynamicBtn = new MockEventTarget("DeleteButton");
dynamicBtn.parent = listContainer;
// @ts-ignore
dynamicBtn.isDeleteBtn = true;
// @ts-ignore
dynamicBtn.taskId = "TASK_101";

dynamicBtn.dispatchEvent(new MockEvent("click"));
assert.strictEqual(deletedTaskId, "TASK_101");

console.log("Event Delegation bắt thành công taskId từ phần tử con động:", deletedTaskId);
console.log("-> Kiểm chứng Event Delegation: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra HTML Events đã vượt qua thành công! ");
console.log("==========================================");
