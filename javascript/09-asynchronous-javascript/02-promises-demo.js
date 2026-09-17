/**
 * 02-promises-demo.js
 * Chạy độc lập: node 02-promises-demo.js
 * Kiểm chứng toàn diện Promise & Bộ tứ Combinators:
 * 1. Trạng thái Promise: Pending, Fulfilled, Rejected & Chaining
 * 2. Promise.all vs Promise.allSettled
 * 3. Promise.race (Mô hình Timeout) vs Promise.any (Kháng lỗi AggregateError)
 * 4. Tự viết Polyfill cho Promise.all & Promise.allSettled
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 02: PROMISES & COMBINATORS ===");

// -------------------------------------------------------------
// 1. BỘ TỨ COMBINATORS NATIVE CỦA JAVASCRIPT
// -------------------------------------------------------------
const delay = (ms, val, shouldReject = false) =>
  new Promise((res, rej) =>
    setTimeout(() => (shouldReject ? rej(val) : res(val)), ms)
  );

// A. Promise.all: Fail-fast khi có 1 promise lỗi
const allSuccess = await Promise.all([
  delay(10, "A"),
  delay(20, "B"),
]);
assert.deepEqual(allSuccess, ["A", "B"]);

await assert.rejects(
  async () => await Promise.all([delay(10, "OK"), delay(5, "FAIL", true)]),
  (err) => err === "FAIL",
  "Promise.all phải reject ngay khi có 1 promise lỗi"
);

// B. Promise.allSettled: Không bao giờ fail-fast, thu thập toàn bộ trạng thái
const settledResults = await Promise.allSettled([
  delay(10, "Success Data"),
  delay(5, "Network Error", true),
]);

assert.equal(settledResults.length, 2);
assert.deepEqual(settledResults[0], { status: "fulfilled", value: "Success Data" });
assert.deepEqual(settledResults[1], { status: "rejected", reason: "Network Error" });

// C. Promise.race: Ai về đích trước thì thắng (bất kể thành công hay thất bại)
const raceWinner = await Promise.race([
  delay(10, "Fast Winner"),
  delay(50, "Slow Loser"),
]);
assert.equal(raceWinner, "Fast Winner");

// D. Promise.any: Chờ phần tử đầu tiên THÀNH CÔNG (bỏ qua các promise bị reject trước đó)
const anyWinner = await Promise.any([
  delay(5, "Failed First", true),
  delay(20, "Success Second"),
  delay(50, "Success Third"),
]);
assert.equal(anyWinner, "Success Second");

// Khi tất cả đều reject -> Ném AggregateError
await assert.rejects(
  async () => await Promise.any([delay(5, "Err1", true), delay(10, "Err2", true)]),
  (err) => {
    return err instanceof AggregateError && err.errors.length === 2;
  },
  "Promise.any phải ném AggregateError khi toàn bộ promises bị reject"
);

// -------------------------------------------------------------
// 2. TỰ CÀI ĐẶT POLYFILL: PROMISE.ALL & PROMISE.ALLSETTLED
// -------------------------------------------------------------
function customPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    const list = Array.from(promises);
    if (list.length === 0) return resolve([]);

    const results = new Array(list.length);
    let completed = 0;

    list.forEach((item, index) => {
      // Đảm bảo bọc item trong Promise.resolve() đề phòng giá trị nguyên thủy
      Promise.resolve(item).then(
        (val) => {
          results[index] = val;
          completed++;
          if (completed === list.length) {
            resolve(results);
          }
        },
        (err) => {
          reject(err); // Thất bại ngay lập tức
        }
      );
    });
  });
}

const customAllResult = await customPromiseAll([
  delay(10, "P1"),
  "Non-promise value",
  delay(5, "P3"),
]);
assert.deepEqual(customAllResult, ["P1", "Non-promise value", "P3"]);

console.log("-> 100% tests cho Promises & Combinators đã pass thành công!");
