/**
 * practice.js - Bài tập thực hành Chuyên sâu Functions & Scope
 * Chạy file này bằng lệnh: node practice.js
 */

"use strict";

const assert = require("assert");

console.log("=== BẮT ĐẦU KIỂM TRA BÀI TẬP 02-FUNCTIONS-AND-SCOPE ===");

// ------------------------------------------------------------
// BÀI TẬP 1: Viết hàm higher-order `once(fn)`
// Đảm bảo hàm chỉ thực thi logic 1 lần duy nhất, các lần sau trả về kết quả lần đầu
// ------------------------------------------------------------
function once(fn) {
  let hasRun = false;
  let cachedResult;

  return function (...args) {
    if (!hasRun) {
      hasRun = true;
      cachedResult = fn.apply(this, args);
    }
    return cachedResult;
  };
}

let runCount = 0;
const initializeDB = once((host) => {
  runCount++;
  return `Connected to ${host}`;
});

assert.strictEqual(initializeDB("localhost:5432"), "Connected to localhost:5432");
assert.strictEqual(initializeDB("remote:5432"), "Connected to localhost:5432"); // Lần 2 trả kết quả cache
assert.strictEqual(runCount, 1, "Fail: Hàm chỉ được phép chạy đúng 1 lần!");
console.log("✅ Bài 1 passed: Hàm once() hoạt động hoàn hảo!");

// ------------------------------------------------------------
// BÀI TẬP 2: Viết hàm Currying tự động cho hàm 2 tham số
// ------------------------------------------------------------
function curry2(fn) {
  return function curried(a, b) {
    if (arguments.length >= 2) {
      return fn(a, b);
    }
    return function (nextB) {
      return fn(a, nextB);
    };
  };
}

const add = (a, b) => a + b;
const curriedAdd = curry2(add);

assert.strictEqual(curriedAdd(3, 7), 10);
assert.strictEqual(curriedAdd(3)(7), 10);
console.log("✅ Bài 2 passed: Auto Curry 2 tham số thành công!");

// ------------------------------------------------------------
// BÀI TẬP 3: Đóng gói Safe Counter bằng Closure
// ------------------------------------------------------------
function createSafeCounter(initialValue = 0) {
  let count = initialValue;

  return {
    inc() {
      count++;
      return count;
    },
    dec() {
      count--;
      return count;
    },
    get() {
      return count;
    },
    reset() {
      count = initialValue;
      return count;
    }
  };
}

const counter = createSafeCounter(10);
assert.strictEqual(counter.get(), 10);
assert.strictEqual(counter.inc(), 11);
assert.strictEqual(counter.dec(), 10);
assert.strictEqual(counter.reset(), 10);
// @ts-ignore
assert.strictEqual(counter.count, undefined, "Fail: Biến count không được phép lộ ra ngoài!");
console.log("✅ Bài 3 passed: Safe Counter Closure hoàn toàn bảo mật!");

// ------------------------------------------------------------
// BÀI TẬP 4: Viết hàm `pipe(...fns)` thực thi theo pipeline từ trái sang phải
// ------------------------------------------------------------
function pipe(...fns) {
  return function (initialValue) {
    return fns.reduce((acc, fn) => fn(acc), initialValue);
  };
}

const add5 = x => x + 5;
const multiply2 = x => x * 2;
const square = x => x * x;

const pipeline = pipe(add5, multiply2, square);
// ( (2 + 5) * 2 )^2 = 14^2 = 196
assert.strictEqual(pipeline(2), 196);
console.log("✅ Bài 4 passed: Function Pipeline Compose thành công!");

console.log("\n🎉 CHÚC MỪNG! BẠN ĐÃ VƯỢT QUA TOÀN BỘ BÀI TẬP 02-FUNCTIONS-AND-SCOPE!");
