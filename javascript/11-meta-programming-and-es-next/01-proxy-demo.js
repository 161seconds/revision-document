/**
 * 01-proxy-demo.js
 * Chạy độc lập: node 01-proxy-demo.js
 * Kiểm chứng toàn diện Siêu lập trình với Proxy & Reflect:
 * 1. Proxy Traps: get, set (Reactivity & Data Validation)
 * 2. Traps: has ('in' operator) & deleteProperty
 * 3. Function Proxy với apply trap (Performance Profiler)
 * 4. Đối xứng hoàn hảo giữa Proxy Traps và Reflect API
 * 5. Proxy có thể thu hồi (Revocable Proxy: Proxy.revocable)
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 01: PROXY & REFLECT ===");

// -------------------------------------------------------------
// 1. REACTIVITY & VALIDATION BẰNG PROXY (GET & SET TRAPS)
// -------------------------------------------------------------
// Mô hình Reactive State tương tự Vue 3 Reactivity Engine:
function createReactiveStore(initialState, onUpdate) {
  return new Proxy(initialState, {
    get(target, prop, receiver) {
      // Dùng Reflect.get để bảo toàn ngữ cảnh receiver khi có getter
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      // Validate: Tuổi không được âm
      if (prop === "age" && (typeof value !== "number" || value < 0)) {
        throw new TypeError("Tuổi phải là số nguyên dương");
      }
      const oldValue = target[prop];
      const success = Reflect.set(target, prop, value, receiver);
      if (success && oldValue !== value) {
        onUpdate(prop, value, oldValue);
      }
      return success;
    },
  });
}

const updateLog = [];
const state = createReactiveStore({ name: "Alice", age: 25 }, (prop, next, prev) => {
  updateLog.push({ prop, next, prev });
});

assert.equal(state.name, "Alice");
state.age = 26;
assert.equal(state.age, 26);
assert.deepEqual(updateLog[0], { prop: "age", next: 26, prev: 25 });

// Kiểm tra chặn dữ liệu rác
assert.throws(
  () => (state.age = -5),
  TypeError,
  "Tuổi phải là số nguyên dương"
);

// -------------------------------------------------------------
// 2. HAS TRAP ('IN' OPERATOR) & ẨN THUỘC TÍNH BẢO MẬT
// -------------------------------------------------------------
const userSecretData = {
  id: 101,
  username: "admin",
  _passwordHash: "sha256$hidden",
};

const secureProxy = new Proxy(userSecretData, {
  has(target, prop) {
    // Ẩn tất cả các thuộc tính bắt đầu bằng dấu gạch dưới khỏi toán tử 'in'
    if (typeof prop === "string" && prop.startsWith("_")) {
      return false;
    }
    return Reflect.has(target, prop);
  },
  deleteProperty(target, prop) {
    if (prop === "id") {
      throw new Error("Không được phép xóa trường id bắt buộc");
    }
    return Reflect.deleteProperty(target, prop);
  },
});

assert.equal("username" in secureProxy, true);
assert.equal("_passwordHash" in secureProxy, false, "Thuộc tính riêng tư bị ẩn khỏi 'in'");

assert.throws(
  () => delete secureProxy.id,
  /Không được phép xóa trường id bắt buộc/
);

// -------------------------------------------------------------
// 3. FUNCTION PROXY (APPLY TRAP ĐO LƯỜNG HIỆU NĂNG)
// -------------------------------------------------------------
function heavyCalculation(base, exponent) {
  return Math.pow(base, exponent);
}

let executionCount = 0;
const profiledCalc = new Proxy(heavyCalculation, {
  apply(target, thisArg, args) {
    executionCount++;
    // Thực thi hàm gốc qua Reflect.apply
    return Reflect.apply(target, thisArg, args);
  },
});

assert.equal(profiledCalc(2, 8), 256);
assert.equal(profiledCalc(3, 3), 27);
assert.equal(executionCount, 2);

// -------------------------------------------------------------
// 4. PROXY CÓ THỂ THU HỒI (REVOCABLE PROXY)
// -------------------------------------------------------------
// Cho phép bên thứ ba truy cập tạm thời, sau đó vô hiệu hóa hoàn toàn
const secretDoc = { content: "Dữ liệu mật hạn chế thời gian" };
const { proxy: tempProxy, revoke } = Proxy.revocable(secretDoc, {});

assert.equal(tempProxy.content, "Dữ liệu mật hạn chế thời gian");

// Thu hồi quyền truy cập
revoke();

// Mọi thao tác truy xuất sau khi revoke đều văng TypeError:
assert.throws(
  () => tempProxy.content,
  TypeError,
  "Cannot perform 'get' on a proxy that has been revoked"
);

console.log("-> 100% tests cho Proxy & Reflect đã pass thành công!");
