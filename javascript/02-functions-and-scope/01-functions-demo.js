/**
 * JavaScript Function Declarations vs Expressions Demo
 * Thực nghiệm cơ chế Hoisting, NFE, IIFE Module Pattern, và Block Scoped Functions.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: HOISTING CỦA FUNCTION DECLARATION ===");
// Gọi hàm TRƯỚC dòng khai báo:
const result = declaredFunction();
console.log("Kết quả gọi declaredFunction() trước dòng khai báo:", result);
assert.strictEqual(result, "HOISTED_SUCCESSFULLY");

function declaredFunction() {
  return "HOISTED_SUCCESSFULLY";
}
console.log("-> Kiểm chứng Declaration Hoisting: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: TEMPORAL DEAD ZONE VỚI FUNCTION EXPRESSION ===");
// Không thể gọi trước khi gán vào const/let:
assert.throws(() => {
  // @ts-ignore
  return expressionFunction();
  // eslint-disable-next-line no-use-before-define
  const expressionFunction = function () {
    return "FAIL";
  };
}, ReferenceError);
console.log("Gọi Function Expression trong TDZ ném lỗi ReferenceError đúng chuẩn.");
console.log("-> Kiểm chứng Function Expression TDZ: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: NAMED FUNCTION EXPRESSION (NFE) ===");
const factorial = function calcFact(n) {
  if (n <= 1) return 1;
  // calcFact chỉ khả dụng BÊN TRONG thân hàm:
  return n * calcFact(n - 1);
};

console.log("factorial(5) =", factorial(5));
assert.strictEqual(factorial(5), 120);

// Kiểm tra: calcFact không rò rỉ ra ngoài phạm vi hàm
assert.throws(() => {
  // @ts-ignore
  return calcFact(5);
}, ReferenceError);
console.log("-> Kiểm chứng NFE Internal Recursion & Scope: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: IIFE (MODULE PATTERN & DATA PRIVACY) ===");
const counterModule = (function () {
  let privateCount = 0; // Biến private nằm trong closure

  return {
    increment() {
      privateCount++;
      return privateCount;
    },
    getCount() {
      return privateCount;
    }
  };
})();

assert.strictEqual(counterModule.getCount(), 0);
assert.strictEqual(counterModule.increment(), 1);
assert.strictEqual(counterModule.increment(), 2);
// Không thể truy cập biến privateCount từ bên ngoài:
assert.strictEqual(counterModule.privateCount, undefined);
console.log("counterModule.getCount() sau 2 lần tăng:", counterModule.getCount());
console.log("counterModule.privateCount              :", counterModule.privateCount);
console.log("-> Kiểm chứng IIFE Module Pattern: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: BLOCK SCOPED FUNCTION TRONG STRICT MODE ===");
{
  function blockScopedFn() {
    return "Inside Block";
  }
  assert.strictEqual(blockScopedFn(), "Inside Block");
}

// Bên ngoài khối {}, hàm không tồn tại trong Strict Mode:
assert.throws(() => {
  // @ts-ignore
  return blockScopedFn();
}, ReferenceError);
console.log("-> Kiểm chứng Block-Scoped Function trong Strict Mode: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra hàm cơ bản đã vượt qua thành công! ");
console.log("==========================================");
