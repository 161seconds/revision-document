/**
 * 03-storage-demo.js
 * Triển khai Web Storage Simulator, Smart Storage Wrapper (TTL, Quota, Auto-Serialization)
 * Chạy trực tiếp: node javascript/11-meta-programming-and-es-next/03-storage-demo.js
 */

const assert = require("node:assert/strict");

console.log("=== BẮT ĐẦU KIỂM TRA 03: WEB STORAGE & STATE PERSISTENCE ===");

// -------------------------------------------------------------
// 1. Giả Lập Chuẩn W3C Storage Interface
// -------------------------------------------------------------
class MockStorage {
  constructor(quotaBytes = 1024 * 1024) {
    this._data = new Map();
    this._quotaBytes = quotaBytes;
  }

  get length() {
    return this._data.size;
  }

  key(index) {
    const keys = Array.from(this._data.keys());
    return keys[index] ?? null;
  }

  getItem(key) {
    const stringKey = String(key);
    return this._data.has(stringKey) ? this._data.get(stringKey) : null;
  }

  setItem(key, value) {
    const stringKey = String(key);
    const stringVal = String(value);

    // Tính toán dung lượng UTF-16 (mỗi ký tự 2 bytes)
    let currentBytes = 0;
    for (const [k, v] of this._data.entries()) {
      if (k !== stringKey) {
        currentBytes += (k.length + v.length) * 2;
      }
    }
    const incomingBytes = (stringKey.length + stringVal.length) * 2;

    if (currentBytes + incomingBytes > this._quotaBytes) {
      const err = new Error("QuotaExceededError: The quota has been exceeded.");
      err.name = "QuotaExceededError";
      throw err;
    }

    this._data.set(stringKey, stringVal);
  }

  removeItem(key) {
    this._data.delete(String(key));
  }

  clear() {
    this._data.clear();
  }
}

// Kiểm tra hành vi ép kiểu ngầm định của W3C Storage
const rawStorage = new MockStorage();
rawStorage.setItem("isActive", false);
rawStorage.setItem("count", 42);

// BẪY KINH ĐIỂN: Lấy ra luôn là chuỗi ký tự
assert.equal(typeof rawStorage.getItem("isActive"), "string");
assert.equal(rawStorage.getItem("isActive"), "false");
// "false" là truthy!
assert.equal(Boolean(rawStorage.getItem("isActive")), true);

// -------------------------------------------------------------
// 2. Production SmartStorage Wrapper
// -------------------------------------------------------------
class SmartStorage {
  constructor(engine) {
    this.engine = engine;
  }

  set(key, value, ttlMs = null) {
    try {
      const envelope = {
        data: value,
        expiry: typeof ttlMs === "number" ? Date.now() + ttlMs : null,
      };
      this.engine.setItem(key, JSON.stringify(envelope));
      return true;
    } catch (err) {
      if (err.name === "QuotaExceededError") {
        console.warn(`[SmartStorage] Dung lượng đã vượt quá hạn mức cho key: ${key}`);
      }
      return false;
    }
  }

  get(key, defaultValue = null) {
    try {
      const raw = this.engine.getItem(key);
      if (raw === null) return defaultValue;

      const envelope = JSON.parse(raw);
      if (envelope.expiry !== null && Date.now() > envelope.expiry) {
        // Đã quá hạn TTL -> Tự động giải phóng
        this.engine.removeItem(key);
        return defaultValue;
      }
      return envelope.data;
    } catch {
      // Fallback nếu JSON bị corrupt
      return defaultValue;
    }
  }

  remove(key) {
    this.engine.removeItem(key);
  }

  has(key) {
    return this.get(key) !== null;
  }
}

// Kiểm tra SmartStorage
const store = new SmartStorage(rawStorage);

// Lưu trữ kiểu dữ liệu phức tạp
store.set("app_config", { theme: "dark", notifications: true, zoom: 1.2 });
const loadedConfig = store.get("app_config");

assert.deepEqual(loadedConfig, { theme: "dark", notifications: true, zoom: 1.2 });
assert.equal(typeof loadedConfig.notifications, "boolean");
assert.equal(loadedConfig.notifications, true);

// Kiểm tra TTL hết hạn
store.set("temp_token", "SECRET_XYZ", 50); // Hết hạn sau 50ms
assert.equal(store.get("temp_token"), "SECRET_XYZ");

// Chờ 60ms để token hết hạn
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

wait(70).then(() => {
  assert.equal(store.get("temp_token"), null);
  assert.equal(store.has("temp_token"), false);

  // -------------------------------------------------------------
  // 3. Giả Lập QuotaExceededError Xử Lý An Toàn
  // -------------------------------------------------------------
  const miniStorage = new MockStorage(100); // Hạn mức chỉ 100 bytes
  const tinyStore = new SmartStorage(miniStorage);

  const bigPayload = "A".repeat(200); // 200 ký tự UTF-16 = 400 bytes > 100 bytes
  const success = tinyStore.set("huge_key", bigPayload);

  // Không bị sập chương trình, trả về false an toàn
  assert.equal(success, false);
  assert.equal(tinyStore.get("huge_key"), null);

  console.log("-> 100% tests cho Web Storage Simulator đã pass thành công!");
});
