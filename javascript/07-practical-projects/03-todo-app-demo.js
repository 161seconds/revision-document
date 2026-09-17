/**
 * 03-todo-app-demo.js
 * Chạy độc lập: node 03-todo-app-demo.js
 * Kiểm chứng kiến trúc ứng dụng Todo App chuẩn Enterprise:
 * 1. Immutable State Management & Action Reducer
 * 2. Ngăn chặn triệt để XSS khi render nội dung do người dùng nhập
 * 3. Bộ lọc trạng thái (Filter: all, active, completed)
 * 4. Đồng bộ LocalStorage có bảo vệ (JSON schema defensive parsing)
 * 5. Batch Operations (Toggle All, Clear Completed)
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 03: PRODUCTION TODO APP ===");

// -------------------------------------------------------------
// 1. SANITIZATION ENGINE (PHÒNG CHỐNG XSS CHO NỘI DUNG NGƯỜI DÙNG)
// -------------------------------------------------------------
function sanitizeInput(dirty) {
  if (typeof dirty !== "string") return "";
  return dirty
    .trim()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const xssPayload = '<img src=x onerror=alert("Hacked")>';
const cleanText = sanitizeInput(xssPayload);
assert.equal(cleanText.includes("<img"), false, "Thẻ HTML độc hại đã bị vô hiệu hóa");
assert.equal(cleanText.includes("&lt;img"), true);

// -------------------------------------------------------------
// 2. TODO STORE (IMMUTABLE STATE PATTERN)
// -------------------------------------------------------------
class TodoStore {
  constructor({ storageKey = "todos_db", storage = null } = {}) {
    this.storageKey = storageKey;
    this.storage = storage;
    this.filter = "all"; // 'all' | 'active' | 'completed'
    this.todos = this._loadFromStorage();
  }

  _loadFromStorage() {
    if (!this.storage) return [];
    try {
      const raw = this.storage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      // Phòng thủ: Kiểm tra định dạng mảng hợp lệ
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (t) => t && typeof t.id === "string" && typeof t.title === "string" && typeof t.completed === "boolean"
        );
      }
    } catch {
      // Dữ liệu JSON bị hỏng -> fallback mảng rỗng
      return [];
    }
    return [];
  }

  _saveToStorage() {
    if (this.storage) {
      this.storage.setItem(this.storageKey, JSON.stringify(this.todos));
    }
  }

  // --- ACTIONS ---
  addTodo(rawTitle) {
    const title = sanitizeInput(rawTitle);
    if (!title) return null; // Từ chối chuỗi rỗng

    const newTodo = {
      id: "todo_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      title,
      completed: false,
      createdAt: Date.now(),
    };

    // Immutable update
    this.todos = [newTodo, ...this.todos];
    this._saveToStorage();
    return newTodo;
  }

  toggleTodo(id) {
    this.todos = this.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    this._saveToStorage();
  }

  editTodo(id, newRawTitle) {
    const title = sanitizeInput(newRawTitle);
    if (!title) {
      // Tiêu đề rỗng -> xóa luôn todo theo chuẩn TodoMVC
      return this.deleteTodo(id);
    }
    this.todos = this.todos.map((t) => (t.id === id ? { ...t, title } : t));
    this._saveToStorage();
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((t) => t.id !== id);
    this._saveToStorage();
  }

  setFilter(filter) {
    if (["all", "active", "completed"].includes(filter)) {
      this.filter = filter;
    }
  }

  clearCompleted() {
    this.todos = this.todos.filter((t) => !t.completed);
    this._saveToStorage();
  }

  toggleAll(targetState) {
    this.todos = this.todos.map((t) => ({ ...t, completed: targetState }));
    this._saveToStorage();
  }

  // --- GETTERS (COMPUTED DATA) ---
  get filteredTodos() {
    if (this.filter === "active") return this.todos.filter((t) => !t.completed);
    if (this.filter === "completed") return this.todos.filter((t) => t.completed);
    return this.todos;
  }

  get activeCount() {
    return this.todos.filter((t) => !t.completed).length;
  }

  get completedCount() {
    return this.todos.filter((t) => t.completed).length;
  }
}

// -------------------------------------------------------------
// 3. MOCK STORAGE & TEST SUITE
// -------------------------------------------------------------
class MockStorage {
  constructor() {
    this.data = new Map();
  }
  getItem(k) {
    return this.data.has(k) ? this.data.get(k) : null;
  }
  setItem(k, v) {
    this.data.set(k, String(v));
  }
}

const storeStorage = new MockStorage();
const store = new TodoStore({ storageKey: "enterprise_todos", storage: storeStorage });

// 1. Thêm công việc
const t1 = store.addTodo("Học kỹ thuật V8 Hidden Classes");
const t2 = store.addTodo("Viết unit tests cho Event Delegation");
const t3 = store.addTodo("Refactor UI tối ưu INP");

assert.equal(store.todos.length, 3);
assert.equal(store.activeCount, 3);
assert.equal(store.completedCount, 0);

// Thử thêm công việc rỗng hoặc toàn dấu cách
assert.equal(store.addTodo("   "), null, "Chặn chuỗi khoảng trắng");
assert.equal(store.todos.length, 3);

// 2. Đánh dấu hoàn thành
store.toggleTodo(t2.id);
assert.equal(store.activeCount, 2);
assert.equal(store.completedCount, 1);

// 3. Bộ lọc
store.setFilter("active");
assert.equal(store.filteredTodos.length, 2);
assert.equal(store.filteredTodos.some((t) => t.id === t2.id), false);

store.setFilter("completed");
assert.equal(store.filteredTodos.length, 1);
assert.equal(store.filteredTodos[0].id, t2.id);

store.setFilter("all");
assert.equal(store.filteredTodos.length, 3);

// 4. Chỉnh sửa công việc
store.editTodo(t1.id, "Nắm chắc Hidden Classes & Inline Caches");
assert.equal(store.todos.find((t) => t.id === t1.id).title, "Nắm chắc Hidden Classes &amp; Inline Caches");

// 5. Xóa completed
store.clearCompleted();
assert.equal(store.todos.length, 2, "Đã xóa 1 việc đã xong");
assert.equal(store.activeCount, 2);

// 6. Toggle All
store.toggleAll(true);
assert.equal(store.completedCount, 2);
assert.equal(store.activeCount, 0);

// 7. Khôi phục từ MockStorage
const newSessionStore = new TodoStore({ storageKey: "enterprise_todos", storage: storeStorage });
assert.equal(newSessionStore.todos.length, 2, "Khôi phục chính xác 2 công việc từ storage");

console.log("-> 100% tests cho Production Todo App đã pass thành công!");
