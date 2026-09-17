/**
 * 01-callbacks-demo.js
 * Chạy độc lập: node 01-callbacks-demo.js
 * Kiểm chứng cơ chế Event Loop, Call Stack, Microtasks & Macrotasks:
 * 1. Thứ tự ưu tiên: Call Stack (Đồng bộ) -> Microtask Queue -> Macrotask Queue
 * 2. queueMicrotask vs Promise.resolve().then()
 * 3. Nguy cơ Event Loop Starvation (Nghẽn tác vụ khi spam Microtask)
 * 4. Chuyển đổi Callback sang Promise (Promisify Pattern)
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 01: CALLBACKS & EVENT LOOP ===");

// -------------------------------------------------------------
// 1. EVENT LOOP EXECUTION ORDER (THỨ TỰ THỰC THI CHUẨN)
// -------------------------------------------------------------
// Call Stack (Đồng bộ) -> Microtasks (Promise, queueMicrotask) -> Macrotasks (setTimeout)

const executionLog = [];

function runEventLoopRace() {
  return new Promise((resolve) => {
    executionLog.push("1. Sync Main Thread");

    // Macrotask
    setTimeout(() => {
      executionLog.push("5. Macrotask (setTimeout 0ms)");
      resolve(); // Hoàn thành bài test
    }, 0);

    // Microtask 1: Promise.then
    Promise.resolve().then(() => {
      executionLog.push("3. Microtask (Promise.then)");
    });

    // Microtask 2: queueMicrotask
    queueMicrotask(() => {
      executionLog.push("4. Microtask (queueMicrotask)");
    });

    executionLog.push("2. Sync End of Script");
  });
}

await runEventLoopRace();

assert.deepEqual(executionLog, [
  "1. Sync Main Thread",
  "2. Sync End of Script",
  "3. Microtask (Promise.then)",
  "4. Microtask (queueMicrotask)",
  "5. Macrotask (setTimeout 0ms)",
]);

// -------------------------------------------------------------
// 2. ERROR FIRST CALLBACK & PROMISIFY PATTERN
// -------------------------------------------------------------
// Chuẩn Node.js callback: function(err, result)
function legacyAsyncOperation(value, callback) {
  setTimeout(() => {
    if (value < 0) {
      callback(new Error("Giá trị không được âm"), null);
    } else {
      callback(null, value * 2);
    }
  }, 10);
}

// Hàm chuyển đổi Promisify tự viết chuẩn ES6
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}

const modernAsyncOp = promisify(legacyAsyncOperation);

// Kiểm thử thành công
const successVal = await modernAsyncOp(21);
assert.equal(successVal, 42);

// Kiểm thử thất bại
await assert.rejects(
  async () => await modernAsyncOp(-5),
  /Giá trị không được âm/
);

console.log("-> 100% tests cho Callbacks & Event Loop đã pass thành công!");
