/**
 * JavaScript Execution Context, Scope Chain & Closures Demo
 * Thực nghiệm Lexical Scope, Closure Data Encapsulation, Currying, Memoization Cache, và Loop Binding.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: LEXICAL SCOPING (XÁC ĐỊNH BỞI VỊ TRÍ KHAI BÁO) ===");
const globalText = "GLOBAL";

function outerScope() {
  const outerText = "OUTER";

  function innerScope() {
    // Lần theo Scope Chain: inner -> outer -> global
    return `${outerText}_${globalText}`;
  }

  return innerScope;
}

const myClosure = outerScope();
// Gọi myClosure từ phạm vi toàn cục, nhưng nó vẫn giữ trọn Lexical Scope cha!
const scopeResult = myClosure();
console.log("Kết quả gọi closure:", scopeResult);
assert.strictEqual(scopeResult, "OUTER_GLOBAL");
console.log("-> Kiểm chứng Lexical Scoping: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: ĐÓNG GÓI DỮ LIỆU RIÊNG TƯ (DATA PRIVACY BẰNG CLOSURE) ===");
function createBankAccount(initialBalance) {
  let balance = initialBalance; // Biến private trên Memory Heap!

  return {
    deposit(amount) {
      if (amount <= 0) throw new Error("Số tiền gửi phải > 0");
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new Error("Số dư không đủ");
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    }
  };
}

const account = createBankAccount(1000);
assert.strictEqual(account.getBalance(), 1000);
assert.strictEqual(account.deposit(500), 1500);
assert.strictEqual(account.withdraw(300), 1200);

// Tuyệt đối không thể truy cập trực tiếp vào biến balance:
// @ts-ignore
assert.strictEqual(account.balance, undefined);
console.log("account.getBalance():", account.getBalance());
console.log("account.balance    :", account.balance, "(Ẩn hoàn toàn!)");
console.log("-> Kiểm chứng Closure Data Privacy: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: FUNCTION CURRYING / PARTIAL APPLICATION ===");
const multiply = (factor) => (number) => number * factor;

const triple = multiply(3);
const tenTimes = multiply(10);

assert.strictEqual(triple(4), 12);
assert.strictEqual(triple(5), 15);
assert.strictEqual(tenTimes(4), 40);
console.log("triple(4)  :", triple(4));
console.log("tenTimes(4):", tenTimes(4));
console.log("-> Kiểm chứng Function Currying: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: MEMOIZATION (CACHE KẾT QUẢ BẰNG CLOSURE) ===");
function createFibonacciWithCache() {
  const cache = new Map(); // Lưu trữ vĩnh viễn trong closure
  let executionCount = 0;

  function fib(n) {
    if (n <= 1) return n;
    if (cache.has(n)) {
      return cache.get(n);
    }
    executionCount++;
    const result = fib(n - 1) + fib(n - 2);
    cache.set(n, result);
    return result;
  }

  return {
    calc: fib,
    getExecutionCount: () => executionCount
  };
}

const fibService = createFibonacciWithCache();
const fib20FirstTime = fibService.calc(20);
const firstExecCount = fibService.getExecutionCount();

// Gọi lại lần 2 lấy ngay từ cache:
const fib20SecondTime = fibService.calc(20);
const secondExecCount = fibService.getExecutionCount();

assert.strictEqual(fib20FirstTime, 6765);
assert.strictEqual(fib20SecondTime, 6765);
assert.strictEqual(firstExecCount, secondExecCount, "Lần gọi thứ 2 dùng 100% cache, không tính lại!");
console.log("fib(20) =", fib20FirstTime, "| Số phép tính thực thi:", firstExecCount);
console.log("Gọi lại lần 2 số phép tính tăng thêm:", secondExecCount - firstExecCount);
console.log("-> Kiểm chứng Closure Memoization: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: KIỂM CHỨNG LOOP CLOSURE BINDING ===");
// Mô phỏng loop với let tạo từng scope độc lập:
const callbacksLet = [];
for (let i = 0; i < 3; i++) {
  callbacksLet.push(() => i);
}

assert.strictEqual(callbacksLet[0](), 0);
assert.strictEqual(callbacksLet[1](), 1);
assert.strictEqual(callbacksLet[2](), 2);
console.log("callbacksLet: [", callbacksLet[0](), callbacksLet[1](), callbacksLet[2](), "]");
console.log("-> Kiểm chứng Loop Scope Closure: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Scope & Closure đã vượt qua thành công! ");
console.log("==========================================");
