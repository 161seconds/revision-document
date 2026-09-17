/**
 * practice.js - Module 11: Meta-Programming & ES Next Test Suite
 * Chạy độc lập: node practice.js
 * Bộ kiểm tra toàn diện 5 thử thách tích hợp:
 * 1. Deep Reactive State Management Engine (Proxy & Reflect)
 * 2. Strict Runtime Schema Validator (Proxy Type Enforcement)
 * 3. Range Iterator Protocol Engine (Symbol.iterator)
 * 4. Custom Entity Coercion & Tagging (Symbol.toPrimitive & Symbol.toStringTag)
 * 5. Auto-Persisting State Synchronization Engine (Proxy + Web Storage Mock)
 */

const assert = require("node:assert/strict");

console.log("=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 11 - META-PROGRAMMING & ES NEXT ===");

// -------------------------------------------------------------
// THỬ THÁCH 1: DEEP REACTIVE STATE MANAGEMENT ENGINE
// -------------------------------------------------------------
console.log("-> Thử thách 1: Deep Reactive State Engine...");

function createDeepReactive(target, onChange) {
  const handler = {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);
      if (val !== null && typeof val === "object") {
        return createDeepReactive(val, onChange);
      }
      return val;
    },
    set(target, prop, value, receiver) {
      if (prop === "__proto__" || prop === "constructor" || prop === "prototype") {
        throw new TypeError("Prototype pollution attempt blocked");
      }
      const oldVal = target[prop];
      if (oldVal !== value) {
        const success = Reflect.set(target, prop, value, receiver);
        if (success) {
          onChange(prop, oldVal, value);
        }
        return success;
      }
      return Reflect.set(target, prop, value, receiver);
    },
  };

  return new Proxy(target, handler);
}

const changeLog = [];
const state = createDeepReactive(
  {
    user: {
      profile: {
        name: "Alice",
        level: 1,
      },
    },
    status: "idle",
  },
  (prop, oldVal, newVal) => {
    changeLog.push({ prop, oldVal, newVal });
  }
);

// Thay đổi cấp 1
state.status = "active";
assert.equal(changeLog.length, 1);
assert.deepEqual(changeLog[0], { prop: "status", oldVal: "idle", newVal: "active" });

// Thay đổi sâu cấp 3 (Deep reactivity)
state.user.profile.level = 2;
assert.equal(changeLog.length, 2);
assert.deepEqual(changeLog[1], { prop: "level", oldVal: 1, newVal: 2 });

// Chặn Prototype Pollution
assert.throws(() => {
  state["__proto__"] = { hacked: true };
}, /Prototype pollution attempt blocked/);

console.log("   ✓ Thử thách 1 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 2: STRICT RUNTIME SCHEMA VALIDATOR
// -------------------------------------------------------------
console.log("-> Thử thách 2: Strict Runtime Schema Validator...");

function createStrictSchema(schemaDefinition) {
  return function (initialData = {}) {
    const data = {};

    // Khởi tạo các trường hợp lệ
    for (const [key, type] of Object.entries(schemaDefinition)) {
      if (key in initialData) {
        if (typeof initialData[key] !== type) {
          throw new TypeError(`Invalid initial type for field '${key}': expected ${type}`);
        }
        data[key] = initialData[key];
      }
    }

    return new Proxy(data, {
      set(target, prop, val, receiver) {
        if (!(prop in schemaDefinition)) {
          throw new ReferenceError(`Property '${String(prop)}' is not defined in schema`);
        }
        const expectedType = schemaDefinition[prop];
        if (typeof val !== expectedType) {
          throw new TypeError(
            `Invalid type for property '${String(prop)}': expected ${expectedType}, received ${typeof val}`
          );
        }
        return Reflect.set(target, prop, val, receiver);
      },
      get(target, prop, receiver) {
        if (typeof prop === "string" && !(prop in schemaDefinition)) {
          throw new ReferenceError(`Property '${prop}' does not exist in schema`);
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  };
}

const UserSchema = createStrictSchema({
  id: "number",
  username: "string",
  isAdmin: "boolean",
});

const validUser = UserSchema({ id: 1, username: "dev_hoang", isAdmin: false });
assert.equal(validUser.username, "dev_hoang");

// Cập nhật hợp lệ
validUser.isAdmin = true;
assert.equal(validUser.isAdmin, true);

// Gán sai kiểu dữ liệu
assert.throws(() => {
  validUser.id = "100"; // Phải là number
}, TypeError);

// Truy cập hoặc gán trường không tồn tại
assert.throws(() => {
  validUser.unauthorizedField = "hack";
}, ReferenceError);

assert.throws(() => {
  const dummy = validUser.nonExistent;
}, ReferenceError);

console.log("   ✓ Thử thách 2 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 3: RANGE ITERATOR PROTOCOL ENGINE
// -------------------------------------------------------------
console.log("-> Thử thách 3: Range Iterator Protocol Engine...");

function createRange(start, end, step = 1) {
  if (step === 0) throw new Error("Step cannot be zero");

  return {
    start,
    end,
    step,
    [Symbol.iterator]() {
      let current = this.start;
      const { end, step } = this;
      const isAscending = step > 0;

      return {
        next() {
          if ((isAscending && current <= end) || (!isAscending && current >= end)) {
            const value = current;
            current += step;
            return { value, done: false };
          }
          return { value: undefined, done: true };
        },
      };
    },
  };
}

const rangeAsc = createRange(1, 5, 2); // 1, 3, 5
assert.deepEqual([...rangeAsc], [1, 3, 5]);

const rangeDesc = createRange(10, 6, -2); // 10, 8, 6
assert.deepEqual(Array.from(rangeDesc), [10, 8, 6]);

let sum = 0;
for (const n of createRange(1, 4)) {
  sum += n;
}
assert.equal(sum, 1 + 2 + 3 + 4);

console.log("   ✓ Thử thách 3 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 4: CUSTOM ENTITY COERCION & BRAND TAGGING
// -------------------------------------------------------------
console.log("-> Thử thách 4: Custom Entity Coercion & Brand Tagging...");

class DomainEntity {
  constructor(id, name, score) {
    this.id = id;
    this.name = name;
    this.score = score;
  }

  get [Symbol.toStringTag]() {
    return `DomainEntity_${this.name}`;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "number") {
      return this.score;
    }
    if (hint === "string") {
      return `[Entity: ${this.name} (#${this.id})]`;
    }
    // "default" hint
    return this.score;
  }
}

const hero = new DomainEntity(404, "Thor", 950);

// Kiểm tra Brand Tagging qua Object.prototype.toString
assert.equal(Object.prototype.toString.call(hero), "[object DomainEntity_Thor]");

// Kiểm tra hint: "number"
assert.equal(+hero, 950);
assert.equal(hero > 900, true);

// Kiểm tra hint: "string"
assert.equal(`${hero}`, "[Entity: Thor (#404)]");

// Kiểm tra hint: "default"
assert.equal(hero + 50, 1000);

console.log("   ✓ Thử thách 4 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 5: AUTO-PERSISTING STATE SYNCHRONIZATION ENGINE
// -------------------------------------------------------------
console.log("-> Thử thách 5: Auto-Persisting State Engine...");

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(k) {
    return this.map.get(k) ?? null;
  }
  setItem(k, v) {
    this.map.set(k, String(v));
  }
  removeItem(k) {
    this.map.delete(k);
  }
}

function createPersistentStore(storage, storageKey, initialValue) {
  // Đọc dữ liệu đã lưu nếu có
  let baseData = initialValue;
  const existing = storage.getItem(storageKey);
  if (existing !== null) {
    try {
      baseData = JSON.parse(existing);
    } catch {
      baseData = initialValue;
    }
  } else {
    storage.setItem(storageKey, JSON.stringify(baseData));
  }

  return new Proxy(baseData, {
    set(target, prop, val, receiver) {
      const success = Reflect.set(target, prop, val, receiver);
      if (success) {
        storage.setItem(storageKey, JSON.stringify(target));
      }
      return success;
    },
    deleteProperty(target, prop) {
      const success = Reflect.deleteProperty(target, prop);
      if (success) {
        storage.setItem(storageKey, JSON.stringify(target));
      }
      return success;
    },
  });
}

const storageEngine = new MemoryStorage();
const appState = createPersistentStore(storageEngine, "USER_SETTINGS", {
  theme: "light",
  volume: 80,
});

assert.equal(appState.theme, "light");
assert.equal(storageEngine.getItem("USER_SETTINGS"), JSON.stringify({ theme: "light", volume: 80 }));

// Đột biến trạng thái -> Tự động đồng bộ vào Storage
appState.theme = "dark";
appState.volume = 100;
assert.equal(storageEngine.getItem("USER_SETTINGS"), JSON.stringify({ theme: "dark", volume: 100 }));

// Khởi tạo instance mới cùng key -> Khôi phục chính xác trạng thái đã lưu
const reloadedState = createPersistentStore(storageEngine, "USER_SETTINGS", {
  theme: "light",
  volume: 50,
});
assert.equal(reloadedState.theme, "dark");
assert.equal(reloadedState.volume, 100);

console.log("   ✓ Thử thách 5 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// TỔNG KẾT
// -------------------------------------------------------------
console.log("\n=======================================================");
console.log("-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 11 ĐÃ VƯỢT QUA 100%!");
console.log("=======================================================");
