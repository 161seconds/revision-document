/**
 * practice.js - Module 10: OOP & Prototypes Test Suite
 * Chạy độc lập: node practice.js
 * Bộ kiểm tra toàn diện 5 thử thách tích hợp:
 * 1. Prototype Chain Traversal & Property Lookup Engine
 * 2. Prototype Pollution Defense & Clean Dictionary Factory
 * 3. ES6 Class Inheritance with Private Fields & Static Initializers
 * 4. Custom Simulation of the 'new' Operator (The 4 Steps of new)
 * 5. Explicit This Binding & Function Borrowing Engine
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 10 - OOP & PROTOTYPES ===");

// -------------------------------------------------------------
// THỬ THÁCH 1: PROTOTYPE CHAIN TRAVERSAL ENGINE
// -------------------------------------------------------------
console.log("-> Thử thách 1: Prototype Chain Traversal...");

function getPrototypeChain(obj) {
  const chain = [];
  let current = obj;
  while (current !== null) {
    const proto = Object.getPrototypeOf(current);
    if (proto) {
      chain.push(proto.constructor ? proto.constructor.name : "Object (Null Proto)");
    }
    current = proto;
  }
  return chain;
}

class BaseEntity {}
class UserEntity extends BaseEntity {}
class AdminEntity extends UserEntity {}

const admin = new AdminEntity();
const chain = getPrototypeChain(admin);

assert.deepEqual(chain, ["AdminEntity", "UserEntity", "BaseEntity", "Object"]);
console.log("   ✓ Thử thách 1 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 2: PROTOTYPE POLLUTION DEFENSE FACTORY
// -------------------------------------------------------------
console.log("-> Thử thách 2: Prototype Pollution Defense...");

function createSecureMap() {
  return Object.create(null);
}

const secureStore = createSecureMap();
assert.equal(Object.getPrototypeOf(secureStore), null);

// Thử chèn payload độc hại
const maliciousInput = JSON.parse('{"__proto__": {"hacked": true}, "role": "USER"}');
for (const [k, v] of Object.entries(maliciousInput)) {
  if (k !== "__proto__") {
    secureStore[k] = v;
  }
}

assert.equal(secureStore.role, "USER");
assert.equal(({}).hacked, undefined, "Object.prototype toàn cục không bị ô nhiễm!");
assert.equal(Object.hasOwn(secureStore, "role"), true);

console.log("   ✓ Thử thách 2 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 3: ES6 CLASS INHERITANCE & PRIVATE ENCAPSULATION
// -------------------------------------------------------------
console.log("-> Thử thách 3: Class Inheritance & Private Fields...");

class Account {
  #balance;
  static #totalAccounts = 0;

  constructor(initialDeposit) {
    this.#balance = initialDeposit;
    Account.#totalAccounts++;
  }

  static get totalCreated() {
    return Account.#totalAccounts;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error("Số tiền không hợp lệ");
    this.#balance += amount;
    return this.#balance;
  }

  get balance() {
    return this.#balance;
  }
}

class PremiumAccount extends Account {
  #cashbackRate;

  constructor(initialDeposit, cashbackRate = 0.05) {
    super(initialDeposit);
    this.#cashbackRate = cashbackRate;
  }

  depositWithCashback(amount) {
    const bonus = amount * this.#cashbackRate;
    return this.deposit(amount + bonus);
  }
}

const acc1 = new Account(100);
const acc2 = new PremiumAccount(200, 0.1);

assert.equal(acc2.balance, 200);
acc2.depositWithCashback(100); // 100 + 10 = 110
assert.equal(acc2.balance, 310);
assert.equal(Account.totalCreated, 2);

// Kiểm tra private field không lộ
assert.equal(acc2["#balance"], undefined);
assert.equal(acc2["#cashbackRate"], undefined);

console.log("   ✓ Thử thách 3 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 4: CUSTOM IMPLEMENTATION OF 'NEW' OPERATOR
// -------------------------------------------------------------
console.log("-> Thử thách 4: Custom 'new' Operator Simulation...");

function customNew(Constructor, ...args) {
  // 1 & 2: Cấp phát đối tượng và liên kết prototype
  const instance = Object.create(Constructor.prototype);

  // 3: Chạy constructor với this = instance
  const returnedValue = Constructor.apply(instance, args);

  // 4: Xử lý giá trị trả về
  if (returnedValue !== null && (typeof returnedValue === "object" || typeof returnedValue === "function")) {
    return returnedValue;
  }
  return instance;
}

function Product(name, price) {
  this.name = name;
  this.price = price;
}
Product.prototype.getDiscountPrice = function (percent) {
  return this.price * (1 - percent);
};

const laptop = customNew(Product, "MacBook Pro", 2000);
assert.equal(laptop instanceof Product, true);
assert.equal(laptop.name, "MacBook Pro");
assert.equal(laptop.getDiscountPrice(0.1), 1800);

console.log("   ✓ Thử thách 4 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 5: EXPLICIT THIS BINDING & CURRYING
// -------------------------------------------------------------
console.log("-> Thử thách 5: Explicit This Binding & Currying...");

function calculateTaxes(taxRate, shippingFee) {
  return this.basePrice + this.basePrice * taxRate + shippingFee;
}

const cartItem = { basePrice: 100 };

// call
const totalCall = calculateTaxes.call(cartItem, 0.1, 15); // 100 * 1.1 + 15 = 125
assert.equal(totalCall, 125);

// apply
const totalApply = calculateTaxes.apply(cartItem, [0.1, 15]);
assert.equal(totalApply, 125);

// bind + Currying (gán sẵn taxRate 0.1)
const calculateVATTaxes = calculateTaxes.bind(cartItem, 0.1);
assert.equal(calculateVATTaxes(20), 130); // 100 * 1.1 + 20 = 130

console.log("   ✓ Thử thách 5 hoàn thành xuất sắc!");

console.log("\n=======================================================");
console.log("-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 10 ĐÃ VƯỢT QUA 100%!");
console.log("=======================================================");
