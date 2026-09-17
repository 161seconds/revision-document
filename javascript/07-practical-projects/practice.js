/**
 * practice.js - Module 07: Practical Projects Test Suite
 * Chạy độc lập: node practice.js
 * Bộ kiểm tra toàn diện 5 thử thách tích hợp:
 * 1. Counter Reducer with History Undo/Redo & Clamping
 * 2. High-Frequency Rate Limiting (Debounce & Throttle Engine)
 * 3. Todo App Immutable State & Defensive XSS Sanitization
 * 4. Modal Dialog Focus Trap & Backdrop Hit-Testing
 * 5. Enterprise Form Validation & FormData Transformation
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 07 - PRACTICAL PROJECTS ===");

// -------------------------------------------------------------
// THỬ THÁCH 1: COUNTER REDUCER & MEMENTO UNDO/REDO
// -------------------------------------------------------------
console.log("-> Thử thách 1: Counter Reducer & Memento History...");

function counterReducer(state, action) {
  const { value, min, max, step, history, historyIndex } = state;
  let nextValue = value;

  switch (action.type) {
    case "INCREMENT":
      nextValue = Math.min(value + step, max);
      break;
    case "DECREMENT":
      nextValue = Math.max(value - step, min);
      break;
    case "RESET":
      nextValue = Math.max(min, Math.min(action.payload || 0, max));
      break;
    case "UNDO":
      if (historyIndex > 0) {
        const prevIdx = historyIndex - 1;
        return {
          ...state,
          value: history[prevIdx],
          historyIndex: prevIdx,
        };
      }
      return state;
    case "REDO":
      if (historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        return {
          ...state,
          value: history[nextIdx],
          historyIndex: nextIdx,
        };
      }
      return state;
    default:
      return state;
  }

  if (nextValue !== value) {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextValue);
    return {
      ...state,
      value: nextValue,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    };
  }

  return state;
}

let cState = {
  value: 0,
  min: 0,
  max: 5,
  step: 1,
  history: [0],
  historyIndex: 0,
};

cState = counterReducer(cState, { type: "INCREMENT" }); // 1
cState = counterReducer(cState, { type: "INCREMENT" }); // 2
cState = counterReducer(cState, { type: "INCREMENT" }); // 3
assert.equal(cState.value, 3);
assert.equal(cState.historyIndex, 3);

// Undo về 2
cState = counterReducer(cState, { type: "UNDO" });
assert.equal(cState.value, 2);

// Redo lên 3
cState = counterReducer(cState, { type: "REDO" });
assert.equal(cState.value, 3);

// Increment chạm trần max = 5
cState = counterReducer(cState, { type: "INCREMENT" }); // 4
cState = counterReducer(cState, { type: "INCREMENT" }); // 5
cState = counterReducer(cState, { type: "INCREMENT" }); // clamp 5
assert.equal(cState.value, 5);

console.log("   ✓ Thử thách 1 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 2: RATE LIMITING ENGINE (DEBOUNCE & THROTTLE)
// -------------------------------------------------------------
console.log("-> Thử thách 2: Debounce & Throttle Engine...");

// A. Debounce Test
function testDebounce(fn, delay) {
  let timer = null;
  return function (arg) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(arg), delay);
  };
}

let debouncedResult = null;
const runDebounce = testDebounce((val) => {
  debouncedResult = val;
}, 30);

runDebounce("search-1");
runDebounce("search-2");
runDebounce("search-final");

assert.equal(debouncedResult, null, "Không kích hoạt trước khi hết thời gian chờ");

await new Promise((r) => setTimeout(r, 60));
assert.equal(debouncedResult, "search-final", "Chỉ giữ lại giá trị cuối sau debounce");

// B. Throttle Test
function testThrottle(fn, limit) {
  let last = 0;
  return function (val) {
    const now = Date.now();
    if (now - last >= limit) {
      last = now;
      fn(val);
    }
  };
}

let throttleCalls = [];
const runThrottle = testThrottle((val) => throttleCalls.push(val), 50);

runThrottle("t1");
runThrottle("t2");
runThrottle("t3");

assert.deepEqual(throttleCalls, ["t1"], "Chỉ thực hiện lần đầu và chặn các lần gọi dồn dập");

console.log("   ✓ Thử thách 2 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 3: TODO APP IMMUTABLE STORE & DEFENSIVE SANITIZATION
// -------------------------------------------------------------
console.log("-> Thử thách 3: Todo App Store & XSS Defense...");

function sanitize(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

class TodoEngine {
  constructor() {
    this.items = [];
  }
  add(raw) {
    const title = sanitize(raw.trim());
    if (!title) return;
    this.items.push({ id: "id_" + this.items.length, title, completed: false });
  }
  toggle(id) {
    this.items = this.items.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it));
  }
  clearCompleted() {
    this.items = this.items.filter((it) => !it.completed);
  }
}

const todoApp = new TodoEngine();
todoApp.add('<script>alert("hacked")</script>');
todoApp.add("Viết code chuẩn TypeScript");

assert.equal(todoApp.items.length, 2);
assert.equal(todoApp.items[0].title.includes("<script>"), false);
assert.equal(todoApp.items[0].title.includes("&lt;script&gt;"), true);

todoApp.toggle(todoApp.items[0].id);
assert.equal(todoApp.items[0].completed, true);

todoApp.clearCompleted();
assert.equal(todoApp.items.length, 1);
assert.equal(todoApp.items[0].title, "Viết code chuẩn TypeScript");

console.log("   ✓ Thử thách 3 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 4: MODAL FOCUS TRAP & BACKDROP HIT TESTING
// -------------------------------------------------------------
console.log("-> Thử thách 4: Modal Focus Trap & Backdrop Hit Testing...");

function isBackdropClicked(clickX, clickY, rect) {
  // rect: { top, left, width, height }
  const inside = (
    clickX >= rect.left &&
    clickX <= rect.left + rect.width &&
    clickY >= rect.top &&
    clickY <= rect.top + rect.height
  );
  return !inside;
}

const modalRect = { top: 100, left: 100, width: 400, height: 300 };

// Click bên trong modal (tại x=200, y=200): Không phải click backdrop
assert.equal(isBackdropClicked(200, 200, modalRect), false);

// Click ngoài modal (tại x=50, y=50): Chính là click backdrop
assert.equal(isBackdropClicked(50, 50, modalRect), true);

console.log("   ✓ Thử thách 4 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 5: ENTERPRISE FORM VALIDATION & PAYLOAD PIPELINE
// -------------------------------------------------------------
console.log("-> Thử thách 5: Enterprise Form Validation & FormData Pipeline...");

function validateEnterpriseUser({ username, email, password }) {
  const errors = {};
  if (!username || username.length < 3) errors.username = "Username too short";
  if (!email || !email.includes("@")) errors.email = "Invalid email";
  if (!password || password.length < 8) errors.password = "Password too short";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

const resFail = validateEnterpriseUser({ username: "a", email: "bad", password: "1" });
assert.equal(resFail.valid, false);
assert.equal(Object.keys(resFail.errors).length, 3);

const resSuccess = validateEnterpriseUser({
  username: "admin_dev",
  email: "dev@company.com",
  password: "StrongPassword2026!",
});
assert.equal(resSuccess.valid, true);

// Kiểm tra FormData payload
const testForm = new FormData();
testForm.append("user", "admin_dev");
testForm.append("role", "SUPERADMIN");
const finalPayload = Object.fromEntries(testForm.entries());
assert.deepEqual(finalPayload, { user: "admin_dev", role: "SUPERADMIN" });

console.log("   ✓ Thử thách 5 hoàn thành xuất sắc!");

console.log("\n=======================================================");
console.log("-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 07 ĐÃ VƯỢT QUA 100%!");
console.log("=======================================================");
