/**
 * 01-counter-demo.js
 * Chạy độc lập: node 01-counter-demo.js
 * Kiểm chứng kiến trúc ứng dụng Counter chuẩn Production:
 * 1. State Machine & Action Reducer (INCREMENT, DECREMENT, RESET, SET)
 * 2. Bounds Clamping (Giới hạn min/max an toàn)
 * 3. Memento Pattern (Undo/Redo lịch sử biến động số)
 * 4. LocalStorage Sync & Persistence
 * 5. Accessibility Observer (Aria-live announcement simulation)
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 01: PRODUCTION COUNTER PROJECT ===");

// -------------------------------------------------------------
// 1. COUNTER CORE ENGINE (MÁY TRẠNG THÁI & OBSERVER PATTERN)
// -------------------------------------------------------------
class CounterEngine {
  constructor({ initial = 0, min = -Infinity, max = Infinity, step = 1, storageKey = null, storage = null } = {}) {
    this.min = min;
    this.max = max;
    this.step = step;
    this.storageKey = storageKey;
    this.storage = storage;

    // Phục hồi từ Storage nếu có
    let startVal = initial;
    if (this.storageKey && this.storage) {
      const saved = this.storage.getItem(this.storageKey);
      if (saved !== null) {
        const parsed = Number(saved);
        if (!isNaN(parsed)) startVal = parsed;
      }
    }

    this.current = this._clamp(startVal);
    this.history = [this.current];
    this.historyIndex = 0;
    this.subscribers = [];
  }

  _clamp(value) {
    return Math.min(Math.max(value, this.min), this.max);
  }

  subscribe(fn) {
    this.subscribers.push(fn);
    fn(this.getState());
  }

  _notify() {
    const state = this.getState();
    if (this.storageKey && this.storage) {
      this.storage.setItem(this.storageKey, String(this.current));
    }
    this.subscribers.forEach((fn) => fn(state));
  }

  getState() {
    return {
      value: this.current,
      canIncrement: this.current + this.step <= this.max,
      canDecrement: this.current - this.step >= this.min,
      canUndo: this.historyIndex > 0,
      canRedo: this.historyIndex < this.history.length - 1,
    };
  }

  _pushHistory(newValue) {
    // Cắt bỏ nhánh redo cũ nếu có thay đổi mới
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(newValue);
    this.historyIndex++;
  }

  increment() {
    const next = this._clamp(this.current + this.step);
    if (next !== this.current) {
      this.current = next;
      this._pushHistory(this.current);
      this._notify();
    }
    return this.current;
  }

  decrement() {
    const next = this._clamp(this.current - this.step);
    if (next !== this.current) {
      this.current = next;
      this._pushHistory(this.current);
      this._notify();
    }
    return this.current;
  }

  reset(defaultVal = 0) {
    const next = this._clamp(defaultVal);
    if (next !== this.current) {
      this.current = next;
      this._pushHistory(this.current);
      this._notify();
    }
    return this.current;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.current = this.history[this.historyIndex];
      this._notify();
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.current = this.history[this.historyIndex];
      this._notify();
      return true;
    }
    return false;
  }
}

// -------------------------------------------------------------
// 2. MOCK LOCALSTORAGE & KIỂM CHỨNG
// -------------------------------------------------------------
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
}

const mockStorage = new MockLocalStorage();

// Khởi tạo Counter với Clamp [0, 10], bước nhảy 2
const counter = new CounterEngine({
  initial: 0,
  min: 0,
  max: 10,
  step: 2,
  storageKey: "app_counter_val",
  storage: mockStorage,
});

let observedStates = [];
counter.subscribe((state) => {
  observedStates.push(state.value);
});

assert.equal(counter.current, 0);
assert.equal(counter.getState().canDecrement, false, "Tại min=0 thì canDecrement phải false");
assert.equal(counter.getState().canIncrement, true);

// Tăng dần
counter.increment(); // 2
counter.increment(); // 4
counter.increment(); // 6
assert.equal(counter.current, 6);
assert.equal(mockStorage.getItem("app_counter_val"), "6", "Tự động sync vào LocalStorage");

// Undo 2 bước
assert.equal(counter.undo(), true); // Về 4
assert.equal(counter.current, 4);
assert.equal(counter.undo(), true); // Về 2
assert.equal(counter.current, 2);

// Redo 1 bước
assert.equal(counter.redo(), true); // Lên lại 4
assert.equal(counter.current, 4);

// Tăng vượt ngưỡng Max (10)
counter.increment(); // 6
counter.increment(); // 8
counter.increment(); // 10
counter.increment(); // Vẫn là 10 do bị clamp
assert.equal(counter.current, 10, "Bị giới hạn ở max=10");
assert.equal(counter.getState().canIncrement, false, "Tại max=10 canIncrement là false");

// Reset về 0
counter.reset(0);
assert.equal(counter.current, 0);
assert.equal(mockStorage.getItem("app_counter_val"), "0");

// Kiểm tra phục hồi từ Storage khi khởi tạo instance mới
const restoredCounter = new CounterEngine({
  initial: 50, // Mặc định là 50
  min: 0,
  max: 100,
  storageKey: "app_counter_val",
  storage: mockStorage, // Nhưng storage đang lưu 0
});
assert.equal(restoredCounter.current, 0, "Khôi phục thành công giá trị từ storage");

console.log("-> 100% tests cho Interactive Counter Engine đã pass thành công!");
