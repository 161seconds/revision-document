/**
 * 03-async-await-demo.js
 * Chạy độc lập: node 03-async-await-demo.js
 * Kiểm chứng toàn diện async/await & Kỹ thuật xử lý lỗi:
 * 1. async luôn bọc kết quả trả về trong một Promise
 * 2. Tuần tự (Sequential) vs Song song (Parallel) Execution
 * 3. Mô phỏng Bản chất Generator + Promise Runner (Co-routine Engine)
 * 4. Bắt lỗi toàn diện với try..catch..finally
 * 5. Top-level await trong ES Module
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 03: ASYNC / AWAIT & ERROR HANDLING ===");

// -------------------------------------------------------------
// 1. ASYNC FUNCTION LUÔN TRẢ VỀ PROMISE
// -------------------------------------------------------------
async function returnPrimitive() {
  return 123;
}

const p = returnPrimitive();
assert.equal(p instanceof Promise, true, "Hàm async luôn trả về đối tượng Promise");
assert.equal(await p, 123);

// -------------------------------------------------------------
// 2. TUẦN TỰ (SEQUENTIAL) VS SONG SONG (PARALLEL)
// -------------------------------------------------------------
const waitTask = (ms, name) =>
  new Promise((res) => setTimeout(() => res(name), ms));

// A. Tuần tự (Bẫy hiệu năng: for..of await tuần tự mất 80ms)
const startSeq = Date.now();
const res1 = await waitTask(40, "Task1");
const res2 = await waitTask(40, "Task2");
const seqDuration = Date.now() - startSeq;
assert.deepEqual([res1, res2], ["Task1", "Task2"]);
assert.equal(seqDuration >= 70, true, "Tuần tự mất ít nhất 70ms");

// B. Song song (Tối ưu: Chạy đồng thời chỉ mất ~40ms)
const startPar = Date.now();
const [par1, par2] = await Promise.all([waitTask(40, "Task1"), waitTask(40, "Task2")]);
const parDuration = Date.now() - startPar;
assert.deepEqual([par1, par2], ["Task1", "Task2"]);
assert.equal(parDuration < 65, true, "Song song chạy gộp thời gian chỉ mất < 65ms");

// -------------------------------------------------------------
// 3. MENTAL MODEL: BẢN CHẤT ASYNC/AWAIT LÀ GENERATOR + PROMISE RUNNER
// -------------------------------------------------------------
// Trước khi ES2017 chuẩn hóa async/await, các thư viện (như co.js) dùng Generator:
function runAsyncCoroutine(generatorFunction) {
  return new Promise((resolve, reject) => {
    const gen = generatorFunction();

    function step(nextFn) {
      let result;
      try {
        result = nextFn();
      } catch (err) {
        return reject(err);
      }

      if (result.done) {
        return resolve(result.value);
      }

      // Khi chưa done, bọc yield value trong Promise rồi đệ quy gọi next()
      Promise.resolve(result.value).then(
        (val) => step(() => gen.next(val)),
        (err) => step(() => gen.throw(err))
      );
    }

    step(() => gen.next());
  });
}

// Chạy hàm giả lập async/await bằng function* và yield:
const coroutineResult = await runAsyncCoroutine(function* () {
  const stepA = yield waitTask(10, "Yielded A");
  const stepB = yield waitTask(10, `${stepA} -> Yielded B`);
  return stepB;
});

assert.equal(coroutineResult, "Yielded A -> Yielded B");

// -------------------------------------------------------------
// 4. BẮT LỖI VỚI TRY..CATCH..FINALLY
// -------------------------------------------------------------
let finallyRan = false;
let caughtError = null;

async function riskyAsync() {
  try {
    await waitTask(5, "Init");
    throw new Error("Sự cố cơ sở dữ liệu");
  } catch (err) {
    caughtError = err;
  } finally {
    finallyRan = true;
  }
}

await riskyAsync();
assert.equal(caughtError.message, "Sự cố cơ sở dữ liệu");
assert.equal(finallyRan, true, "finally luôn được kích hoạt");

console.log("-> 100% tests cho Async / Await & Error Handling đã pass thành công!");
