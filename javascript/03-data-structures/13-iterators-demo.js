/**
 * 13-iterators-demo.js
 * Chạy độc lập: node 13-iterators-demo.js
 * Kiểm chứng toàn diện Giao thức Lặp (Iteration Protocols) & Hàm Sinh (Generators):
 * 1. Cài đặt Giao thức Iterable ([Symbol.iterator]) cho Custom Object
 * 2. Generator Function (function* và từ khóa yield)
 * 3. Giao tiếp 2 chiều với Generator (Two-Way Communication qua next(value))
 * 4. Ủy thác Generator (Generator Delegation bằng yield*)
 * 5. Chuỗi vô hạn (Infinite Sequence) & Dọn dẹp tài nguyên (try..finally với return())
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 13: ITERATORS & GENERATORS ===");

// -------------------------------------------------------------
// 1. GIAO THỨC ITERABLE VÀ ITERATOR (CUSTOM RANGE OBJECT)
// -------------------------------------------------------------
// Plain Object không có [Symbol.iterator] nên không thể dùng for..of.
// Chúng ta tự cài đặt giao thức:
const numberRange = {
  from: 1,
  to: 4,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;

    // Trả về một Iterator Object cài đặt phương thức next()
    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  },
};

// 1. Kiểm tra lặp bằng for..of
const collected = [];
for (const num of numberRange) {
  collected.push(num);
}
assert.deepEqual(collected, [1, 2, 3, 4]);

// 2. Toán tử Spread [...] dựa trên giao thức Iterable
assert.deepEqual([...numberRange], [1, 2, 3, 4]);

// -------------------------------------------------------------
// 2. GENERATOR FUNCTION (HÀM SINH DÃY SỐ FIBONACCI)
// -------------------------------------------------------------
// Hàm function* tự động trả về một Generator Object (vừa là Iterator vừa là Iterable):
function* fibonacciGenerator(limit) {
  let [prev, curr] = [0, 1];
  for (let i = 0; i < limit; i++) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

const fibGen = fibonacciGenerator(5);
assert.deepEqual(fibGen.next(), { value: 1, done: false });
assert.deepEqual(fibGen.next(), { value: 1, done: false });
assert.deepEqual(fibGen.next(), { value: 2, done: false });
assert.deepEqual(fibGen.next(), { value: 3, done: false });
assert.deepEqual(fibGen.next(), { value: 5, done: false });
assert.deepEqual(fibGen.next(), { value: undefined, done: true });

// -------------------------------------------------------------
// 3. GIAO TIẾP 2 CHIỀU (TWO-WAY COMMUNICATION VỚI NEXT(VAL))
// -------------------------------------------------------------
// yield không chỉ phát ra giá trị mà còn nhận giá trị được truyền vào từ lần next() kế tiếp!
function* conversationGenerator() {
  const answer1 = yield "1 + 1 bằng mấy?";
  const answer2 = yield `Bạn đã trả lời ${answer1}. Vậy 2 * 2 bằng mấy?`;
  return `Hoàn thành! Bạn đã trả lời câu 2 là: ${answer2}`;
}

const convo = conversationGenerator();
const q1 = convo.next(); // Bắt đầu generator
assert.equal(q1.value, "1 + 1 bằng mấy?");

const q2 = convo.next("2"); // Truyền "2" vào answer1
assert.equal(q2.value, "Bạn đã trả lời 2. Vậy 2 * 2 bằng mấy?");

const q3 = convo.next("4"); // Truyền "4" vào answer2
assert.equal(q3.value, "Hoàn thành! Bạn đã trả lời câu 2 là: 4");
assert.equal(q3.done, true);

// -------------------------------------------------------------
// 4. ỦY THÁC GENERATOR (YIELD*)
// -------------------------------------------------------------
function* subTask() {
  yield "Step 2.1";
  yield "Step 2.2";
}

function* mainWorkflow() {
  yield "Step 1";
  yield* subTask(); // Ủy thác duyệt toàn bộ phần tử của subTask
  yield "Step 3";
}

const workflowSteps = [...mainWorkflow()];
assert.deepEqual(workflowSteps, ["Step 1", "Step 2.1", "Step 2.2", "Step 3"]);

// -------------------------------------------------------------
// 5. CHUỖI VÔ HẠN & DỌN DẸP TRY..FINALLY VỚI RETURN()
// -------------------------------------------------------------
let cleanupExecuted = false;

function* infiniteIdGenerator() {
  let id = 1;
  try {
    while (true) {
      yield id++;
    }
  } finally {
    // Khối này luôn được kích hoạt khi generator kết thúc sớm qua break hoặc .return()
    cleanupExecuted = true;
  }
}

const idGen = infiniteIdGenerator();
assert.equal(idGen.next().value, 1);
assert.equal(idGen.next().value, 2);
assert.equal(idGen.next().value, 3);
assert.equal(cleanupExecuted, false);

// Gọi return() để ép đóng generator sớm
const earlyExit = idGen.return("forced_stop");
assert.equal(earlyExit.value, "forced_stop");
assert.equal(earlyExit.done, true);
assert.equal(cleanupExecuted, true, "try..finally đã dọn dẹp tài nguyên an toàn");

console.log("-> 100% tests cho Iterators & Generators đã pass thành công!");
