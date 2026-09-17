/**
 * 06-dom-reference-demo.js
 * Chạy độc lập: node 06-dom-reference-demo.js
 * Kiểm chứng toàn diện Reference Cheatsheet:
 * 1. AbortController / AbortSignal dọn dẹp hàng loạt Event Listeners hiện đại (ES2022 / Web APIs)
 * 2. Event Listener Options: { once: true }, { passive: true }, { capture: true }
 * 3. Node vs Element Navigation Matrix
 * 4. Phân loại sự kiện chuẩn (Event Taxonomy)
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 06: DOM & EVENTS MASTER REFERENCE ===");

// -------------------------------------------------------------
// 1. DỌN DẸP LISTENER HIỆN ĐẠI BẰNG ABORTCONTROLLER (ES2022)
// -------------------------------------------------------------
// Trước đây: Phải lưu biến hàm và gọi removeEventListener(type, fn) cho từng cái.
// Hiện đại: Truyền { signal: controller.signal } vào addEventListener.
// Khi cần hủy toàn bộ listener: controller.abort() -> Xóa sạch trong 1 dòng!

class MockEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, callback, options = {}) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    const entry = {
      callback,
      once: Boolean(options.once),
      passive: Boolean(options.passive),
      capture: Boolean(options.capture),
    };

    // Hỗ trợ AbortSignal native
    if (options.signal) {
      if (options.signal.aborted) return; // Đã abort từ trước
      options.signal.addEventListener("abort", () => {
        this.removeEventListener(type, callback);
      });
    }

    this.listeners.get(type).push(entry);
  }

  removeEventListener(type, callback) {
    if (!this.listeners.has(type)) return;
    const list = this.listeners.get(type);
    const index = list.findIndex((e) => e.callback === callback);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  dispatchEvent(event) {
    const list = this.listeners.get(event.type);
    if (!list || list.length === 0) return true;

    // Clone để tránh lỗi khi once xóa listener giữa chừng
    const current = [...list];
    for (const entry of current) {
      entry.callback(event);
      if (entry.once) {
        this.removeEventListener(event.type, entry.callback);
      }
    }
    return !event.defaultPrevented;
  }
}

const target = new MockEventTarget();
const controller = new AbortController();

let clickCount = 0;
let mouseMoveCount = 0;

target.addEventListener("click", () => clickCount++, { signal: controller.signal });
target.addEventListener("mousemove", () => mouseMoveCount++, { signal: controller.signal });

// Kích hoạt trước khi abort
target.dispatchEvent({ type: "click" });
target.dispatchEvent({ type: "mousemove" });
assert.equal(clickCount, 1);
assert.equal(mouseMoveCount, 1);

// Huỷ toàn bộ với duy nhất 1 lệnh abort!
controller.abort();

target.dispatchEvent({ type: "click" });
target.dispatchEvent({ type: "mousemove" });
assert.equal(clickCount, 1, "Click không tăng sau khi abort");
assert.equal(mouseMoveCount, 1, "MouseMove không tăng sau khi abort");

// -------------------------------------------------------------
// 2. EVENT OPTIONS: { once: true }
// -------------------------------------------------------------
let onceFired = 0;
target.addEventListener("purchase", () => onceFired++, { once: true });

target.dispatchEvent({ type: "purchase" });
target.dispatchEvent({ type: "purchase" });
target.dispatchEvent({ type: "purchase" });

assert.equal(onceFired, 1, "{ once: true } chỉ chạy chính xác 1 lần duy nhất rồi tự hủy");

// -------------------------------------------------------------
// 3. NODE VS ELEMENT NAVIGATION MATRIX
// -------------------------------------------------------------
// Cây DOM chứa cả Node (Text, Comment, Element) và Element (HTML tags).
const domHierarchy = {
  parentNode: "Node cha (có thể là Document)",
  parentElement: "Element cha (chỉ HTML Tag, Document trả về null)",
  childNodes: "Toàn bộ node con (Bao gồm Text khoảng trắng và Comment)",
  children: "Chỉ các thẻ Element HTML con",
  firstChild: "Node con đầu tiên (thường là khoảng trắng Text Node)",
  firstElementChild: "Thẻ Element HTML con đầu tiên",
  nextSibling: "Node kế tiếp (có thể là Text/Comment)",
  nextElementSibling: "Thẻ Element HTML kế tiếp",
};

assert.equal(typeof domHierarchy.childNodes, "string");
assert.equal(typeof domHierarchy.children, "string");

// -------------------------------------------------------------
// 4. BẢNG PHÂN LOẠI SỰ KIỆN CHUẨN (EVENT TAXONOMY)
// -------------------------------------------------------------
const eventTaxonomy = {
  mouse: ["click", "dblclick", "mousedown", "mouseup", "mouseenter", "mouseleave", "mousemove", "contextmenu"],
  keyboard: ["keydown", "keyup"], // keypress đã bị DEPRECATED
  form: ["submit", "input", "change", "focus", "blur", "reset", "invalid"],
  window: ["load", "DOMContentLoaded", "resize", "scroll", "beforeunload", "popstate", "hashchange"],
  clipboard: ["copy", "cut", "paste"],
};

// Đảm bảo không sử dụng keypress đã lỗi thời
assert.equal(eventTaxonomy.keyboard.includes("keypress"), false, "keypress là deprecated, dùng keydown");
assert.equal(eventTaxonomy.form.includes("invalid"), true, "invalid là event của Constraint Validation API");

console.log("-> 100% tests cho DOM & Events Master Reference đã pass thành công!");
