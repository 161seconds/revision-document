/**
 * 03-this-demo.js
 * Chạy độc lập: node 03-this-demo.js
 * Kiểm chứng toàn diện Bản chất con trỏ this & call / apply / bind:
 * 1. Bốn quy tắc ràng buộc this (Default, Implicit, Explicit, new)
 * 2. Mất ngữ cảnh this (Losing this context) khi truyền callback & Cách sửa
 * 3. So sánh call vs apply vs bind (Hard Binding & Currying)
 * 4. Tự viết hàm mô phỏng toán tử new (The 4 steps of new)
 * 5. Arrow Function: Lexical this bất biến trước call/apply/bind
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 03: THIS BINDING & CALL/APPLY/BIND ===");

// -------------------------------------------------------------
// 1. BỐN QUY TẮC RÀNG BUỘC THIS
// -------------------------------------------------------------
// A. Default Binding trong ES Module / Strict mode: this là undefined
function showDefaultThis() {
  return this;
}
assert.equal(showDefaultThis(), undefined, "Trong strict mode, default this là undefined");

// B. Implicit Binding: Đối tượng đứng trước dấu chấm
const userProfile = {
  name: "Bob",
  getName() {
    return this.name;
  },
};
assert.equal(userProfile.getName(), "Bob");

// Bẫy mất this khi gán sang biến độc lập:
const detachedFn = userProfile.getName;
assert.throws(
  () => detachedFn(),
  TypeError,
  "Cannot read properties of undefined (reading 'name')"
);

// C. Explicit Binding: call, apply, bind
const contextA = { name: "Alice" };
assert.equal(detachedFn.call(contextA), "Alice");
assert.equal(detachedFn.apply(contextA), "Alice");

const boundToAlice = detachedFn.bind(contextA);
assert.equal(boundToAlice(), "Alice");

// D. new Binding: Tạo object mới và gán this vào nó
function Person(name) {
  this.name = name;
}
const p = new Person("Charlie");
assert.equal(p.name, "Charlie");

// -------------------------------------------------------------
// 2. TỰ VIẾT HÀM MÔ PHỎNG TOÁN TỬ NEW (4 BƯỚC CỦA NEW)
// -------------------------------------------------------------
function simulateNew(Constructor, ...args) {
  // Bước 1: Tạo một đối tượng rỗng mới
  // Bước 2: Thiết lập [[Prototype]] của object trỏ tới Constructor.prototype
  const newObj = Object.create(Constructor.prototype);

  // Bước 3: Thực thi hàm Constructor với con trỏ this trỏ tới newObj
  const result = Constructor.apply(newObj, args);

  // Bước 4: Nếu Constructor trả về một Object khác, dùng object đó; ngược lại trả về newObj
  if (result !== null && (typeof result === "object" || typeof result === "function")) {
    return result;
  }
  return newObj;
}

const simulatedPerson = simulateNew(Person, "David");
assert.equal(simulatedPerson instanceof Person, true);
assert.equal(simulatedPerson.name, "David");

// Trường hợp constructor cố tình return object khác:
function OverridingConstructor() {
  this.hidden = 1;
  return { custom: "override" };
}
const overridden = simulateNew(OverridingConstructor);
assert.deepEqual(overridden, { custom: "override" });

// -------------------------------------------------------------
// 3. ARROW FUNCTION: LEXICAL THIS BẤT BIẾN
// -------------------------------------------------------------
const lexicalScopeObj = {
  title: "Scope Container",
  createArrowFn() {
    // Arrow function kế thừa this tại thời điểm định nghĩa
    return () => this.title;
  },
};

const arrowFn = lexicalScopeObj.createArrowFn();
assert.equal(arrowFn(), "Scope Container");

// Cố tình bind/call/apply sang context khác -> HOÀN TOÀN BỊ VÔ HIỆU HÓA!
const fakeContext = { title: "Hacker Context" };
assert.equal(arrowFn.call(fakeContext), "Scope Container", "Arrow function không bị call đổi this");
assert.equal(arrowFn.apply(fakeContext), "Scope Container", "Arrow function không bị apply đổi this");

const reboundArrow = arrowFn.bind(fakeContext);
assert.equal(reboundArrow(), "Scope Container", "Arrow function không bị bind đổi this");

console.log("-> 100% tests cho this Binding & call/apply/bind đã pass thành công!");
