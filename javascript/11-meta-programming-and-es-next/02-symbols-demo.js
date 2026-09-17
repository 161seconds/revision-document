/**
 * 02-symbols-demo.js
 * Minh họa toàn diện Symbol, Global Registry & Well-Known Symbols
 * Chạy trực tiếp: node javascript/11-meta-programming-and-es-next/02-symbols-demo.js
 */

const assert = require("node:assert/strict");

console.log("=== BẮT ĐẦU KIỂM TRA 02: SYMBOL & WELL-KNOWN SYMBOLS ===");

// -------------------------------------------------------------
// 1. Tính Độc Bản & Global Registry
// -------------------------------------------------------------
const local1 = Symbol("token");
const local2 = Symbol("token");

// Dù cùng mô tả, hai Symbol cục bộ độc lập tuyệt đối trong bộ nhớ
assert.equal(local1 === local2, false);
assert.equal(local1.description, "token");

// Global Symbol Registry
const global1 = Symbol.for("app.session_id");
const global2 = Symbol.for("app.session_id");

// Chia sẻ chung tham chiếu qua Global Registry
assert.equal(global1 === global2, true);
assert.equal(Symbol.keyFor(global1), "app.session_id");
assert.equal(Symbol.keyFor(local1), undefined); // Local symbol không có trong registry

// Ép kiểu tường minh vs ngầm định
assert.equal(String(local1), "Symbol(token)");
assert.throws(() => {
  const bad = "" + local1; // Cấm ép kiểu chuỗi ngầm định
}, TypeError);

// -------------------------------------------------------------
// 2. Ẩn Thuộc Tính Đối Tượng & Reflect.ownKeys
// -------------------------------------------------------------
const internalSecret = Symbol("secret_key");
const user = {
  id: 1,
  name: "Hoang",
  [internalSecret]: "CONFIDENTIAL_PAYLOAD_99",
};

// Object.keys và for...in bỏ qua Symbol keys
assert.deepEqual(Object.keys(user), ["id", "name"]);
assert.equal(JSON.stringify(user), JSON.stringify({ id: 1, name: "Hoang" }));

// Chỉ có thể lấy bằng phương thức chuyên dụng
const symKeys = Object.getOwnPropertySymbols(user);
assert.equal(symKeys.length, 1);
assert.equal(symKeys[0], internalSecret);
assert.equal(user[symKeys[0]], "CONFIDENTIAL_PAYLOAD_99");

// Reflect.ownKeys lấy cả String keys lẫn Symbol keys
assert.deepEqual(Reflect.ownKeys(user), ["id", "name", internalSecret]);

// -------------------------------------------------------------
// 3. Well-Known Symbol: Symbol.toPrimitive
// -------------------------------------------------------------
const wallet = {
  balance: 1500,
  currency: "VND",
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.balance;
    if (hint === "string") return `${this.balance.toLocaleString()} ${this.currency}`;
    return this.balance; // "default" hint (ví dụ: toán tử cộng)
  },
};

// Test hint "number"
assert.equal(+wallet, 1500);
assert.equal(wallet > 1000, true);

// Test hint "string"
assert.equal(`${wallet}`, "1,500 VND");

// Test hint "default"
assert.equal(wallet + 500, 2000);

// -------------------------------------------------------------
// 4. Well-Known Symbol: Symbol.toStringTag
// -------------------------------------------------------------
class EnterpriseDatabaseConnector {
  get [Symbol.toStringTag]() {
    return "EnterpriseDatabaseConnector";
  }
}

const db = new EnterpriseDatabaseConnector();
assert.equal(Object.prototype.toString.call(db), "[object EnterpriseDatabaseConnector]");

// -------------------------------------------------------------
// 5. Well-Known Symbol: Symbol.hasInstance
// -------------------------------------------------------------
// Giả lập Interface kiểm tra cấu trúc (Duck Typing)
const Payable = {
  [Symbol.hasInstance](instance) {
    return (
      instance != null &&
      typeof instance === "object" &&
      typeof instance.processPayment === "function" &&
      typeof instance.amount === "number"
    );
  },
};

const validInvoice = {
  amount: 250,
  processPayment() {
    return true;
  },
};

const invalidInvoice = {
  amount: 100,
};

assert.equal(validInvoice instanceof Payable, true);
assert.equal(invalidInvoice instanceof Payable, false);
assert.equal(null instanceof Payable, false);

// -------------------------------------------------------------
// 6. Well-Known Symbol: Symbol.isConcatSpreadable
// -------------------------------------------------------------
const numericList = [1, 2, 3];
const nonSpreadList = [4, 5];
nonSpreadList[Symbol.isConcatSpreadable] = false;

const combined = numericList.concat(nonSpreadList);
// nonSpreadList không bị bung phẳng ra mà giữ nguyên mảng con
assert.equal(combined.length, 4);
assert.equal(combined[3], nonSpreadList);
assert.deepEqual(combined.slice(0, 3), [1, 2, 3]);

console.log("-> 100% tests cho Symbol & Well-Known Symbols đã pass thành công!");
