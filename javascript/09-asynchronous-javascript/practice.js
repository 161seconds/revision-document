/**
 * practice.js - Module 09: Asynchronous JavaScript Test Suite
 * Chạy độc lập: node practice.js
 * Bộ kiểm tra toàn diện 5 thử thách tích hợp:
 * 1. Microtask & Macrotask Event Loop Ordering Simulator
 * 2. Polyfill Promise.all với cơ chế Fail-Fast
 * 3. Polyfill Promise.allSettled với cấu trúc Status Snapshot
 * 4. Exponential Backoff Retry Pipeline cho tác vụ bất đồng bộ
 * 5. AbortSignal Lifecycle & Autocomplete Race Condition Guard
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 09 - ASYNCHRONOUS JAVASCRIPT ===");

// -------------------------------------------------------------
// THỬ THÁCH 1: EVENT LOOP EXECUTION ORDER RECORDER
// -------------------------------------------------------------
console.log("-> Thử thách 1: Event Loop Ordering...");

async function testEventLoopOrder() {
  const steps = [];
  steps.push("SYNC_1");

  setTimeout(() => steps.push("MACRO_1"), 0);

  Promise.resolve()
    .then(() => steps.push("MICRO_1"))
    .then(() => steps.push("MICRO_2"));

  queueMicrotask(() => steps.push("MICRO_QUEUE"));

  steps.push("SYNC_2");

  // Chờ cho toàn bộ queues hoàn tất
  await new Promise((r) => setTimeout(r, 10));

  return steps;
}

const recordedSteps = await testEventLoopOrder();
assert.deepEqual(recordedSteps, [
  "SYNC_1",
  "SYNC_2",
  "MICRO_1",
  "MICRO_QUEUE",
  "MICRO_2",
  "MACRO_1",
]);

console.log("   ✓ Thử thách 1 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 2: POLYFILL PROMISE.ALL VỚI FAIL-FAST
// -------------------------------------------------------------
console.log("-> Thử thách 2: Custom Promise.all...");

function myPromiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const list = Array.from(iterable);
    if (list.length === 0) return resolve([]);

    const results = new Array(list.length);
    let resolvedCount = 0;

    list.forEach((item, index) => {
      Promise.resolve(item).then(
        (val) => {
          results[index] = val;
          resolvedCount++;
          if (resolvedCount === list.length) {
            resolve(results);
          }
        },
        (err) => {
          reject(err);
        }
      );
    });
  });
}

const allPass = await myPromiseAll([
  Promise.resolve(10),
  20,
  new Promise((r) => setTimeout(() => r(30), 10)),
]);
assert.deepEqual(allPass, [10, 20, 30]);

await assert.rejects(
  async () => await myPromiseAll([Promise.resolve("OK"), Promise.reject("BOOM")]),
  (err) => err === "BOOM",
  "myPromiseAll phải fail fast khi có lỗi"
);

console.log("   ✓ Thử thách 2 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 3: POLYFILL PROMISE.ALLSETTLED
// -------------------------------------------------------------
console.log("-> Thử thách 3: Custom Promise.allSettled...");

function myPromiseAllSettled(iterable) {
  return new Promise((resolve) => {
    const list = Array.from(iterable);
    if (list.length === 0) return resolve([]);

    const results = new Array(list.length);
    let settledCount = 0;

    list.forEach((item, index) => {
      Promise.resolve(item).then(
        (value) => {
          results[index] = { status: "fulfilled", value };
          settledCount++;
          if (settledCount === list.length) resolve(results);
        },
        (reason) => {
          results[index] = { status: "rejected", reason };
          settledCount++;
          if (settledCount === list.length) resolve(results);
        }
      );
    });
  });
}

const settledResults = await myPromiseAllSettled([
  Promise.resolve("Data A"),
  Promise.reject("Error B"),
  "Constant C",
]);

assert.deepEqual(settledResults, [
  { status: "fulfilled", value: "Data A" },
  { status: "rejected", reason: "Error B" },
  { status: "fulfilled", value: "Constant C" },
]);

console.log("   ✓ Thử thách 3 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 4: EXPONENTIAL BACKOFF RETRY PIPELINE
// -------------------------------------------------------------
console.log("-> Thử thách 4: Async Retry Pipeline...");

async function retryAsyncOperation(fn, maxRetries = 3, baseDelayMs = 10) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      attempt++;
      return await fn(attempt);
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      const waitTime = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, waitTime));
    }
  }
}

let trialCount = 0;
const successfulOnThirdTry = await retryAsyncOperation(async (currentAttempt) => {
  trialCount++;
  if (currentAttempt < 3) throw new Error("Chưa thành công");
  return "Kết nối ổn định!";
}, 4, 5);

assert.equal(successfulOnThirdTry, "Kết nối ổn định!");
assert.equal(trialCount, 3);

console.log("   ✓ Thử thách 4 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 5: ABORTSIGNAL & RACE CONDITION GUARD
// -------------------------------------------------------------
console.log("-> Thử thách 5: AbortSignal & Race Condition Guard...");

class AsyncQueryCoordinator {
  constructor() {
    this.activeController = null;
    this.latestCommittedData = null;
  }

  async runQuery(queryText, latencyMs) {
    if (this.activeController) {
      this.activeController.abort();
    }

    this.activeController = new AbortController();
    const { signal } = this.activeController;

    try {
      const data = await new Promise((resolve, reject) => {
        const t = setTimeout(() => resolve(`Result: ${queryText}`), latencyMs);
        signal.addEventListener("abort", () => {
          clearTimeout(t);
          reject(new DOMException("Aborted", "AbortError"));
        });
      });

      this.latestCommittedData = data;
      return data;
    } catch (err) {
      if (err.name === "AbortError") return null;
      throw err;
    }
  }
}

const coordinator = new AsyncQueryCoordinator();

// Request 1 gửi trước nhưng chạy chậm (80ms)
const q1 = coordinator.runQuery("slow_query", 80);
// Request 2 gửi sau 10ms nhưng chạy nhanh (20ms)
await new Promise((r) => setTimeout(r, 10));
const q2 = coordinator.runQuery("fast_query", 20);

await Promise.all([q1, q2]);

// Dữ liệu cuối cùng được cam kết bắt buộc phải là fast_query
assert.equal(coordinator.latestCommittedData, "Result: fast_query");

console.log("   ✓ Thử thách 5 hoàn thành xuất sắc!");

console.log("\n=======================================================");
console.log("-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 09 ĐÃ VƯỢT QUA 100%!");
console.log("=======================================================");
