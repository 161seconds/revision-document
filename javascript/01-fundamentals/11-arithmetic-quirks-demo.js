/**
 * JavaScript Arithmetic & Numerical Quirks Demo
 * Thực nghiệm các cơ chế số học, chia cho 0, unary casting, modulo số âm, và BigInt.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: PHÉP CHIA CHO 0 (DIVISION BY ZERO) ===");
// JS không crash / ném Exception khi chia cho 0
const posDivZero = 42 / 0;
const negDivZero = -42 / 0;
const zeroDivZero = 0 / 0;

console.log("42 / 0:", posDivZero);        // Infinity
console.log("-42 / 0:", negDivZero);      // -Infinity
console.log("0 / 0:", zeroDivZero);        // NaN

assert.strictEqual(posDivZero, Infinity);
assert.strictEqual(negDivZero, -Infinity);
assert.ok(Number.isNaN(zeroDivZero));
assert.strictEqual(1 / Infinity, 0);
console.log("-> Kiểm chứng chia cho 0: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: TOÁN TỬ MỘT NGÔI (UNARY + / -) ===");
// Cách ép kiểu sang number ngắn gọn và tối ưu nhất
assert.strictEqual(+"123", 123);
assert.strictEqual(+true, 1);
assert.strictEqual(+false, 0);
assert.strictEqual(+null, 0);
assert.strictEqual(+"", 0);
assert.ok(Number.isNaN(+"not-a-number"));

// Unary negation (-) đổi dấu và tự ép kiểu
assert.strictEqual(-"-50", 50);
console.log("Unary +\"42\":", +"42", typeof +"42");
console.log("Unary +true:", +true);
console.log("Unary +null:", +null);
console.log("-> Kiểm chứng Unary Casting: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: PHẦN DƯ (%) VÀ SỐ ÂM (REMAINDER VS MODULO) ===");
// Phép % trong JS là Remainder: Dấu luôn phụ thuộc vào toán hạng bên trái
const rem1 = -7 % 3; // -1
const rem2 = 7 % -3; // 1

console.log("-7 % 3 =", rem1, "(Lấy dấu của -7)");
console.log("7 % -3 =", rem2, "(Lấy dấu của 7)");
assert.strictEqual(rem1, -1);
assert.strictEqual(rem2, 1);

// Cạm bẫy Circular Array / Ring Buffer
const items = ["A", "B", "C", "D"]; // length = 4
let currentIndex = 0;

// Khi lùi từ vị trí 0:
const naivePrevIndex = (currentIndex - 1) % items.length; // -1 % 4 = -1
console.log("Cách tính ngây thơ (0 - 1) % 4 =", naivePrevIndex, "=> items[-1] là:", items[naivePrevIndex]);
assert.strictEqual(items[naivePrevIndex], undefined); // Bẫy kinh điển!

// Công thức Modulo chuẩn trong toán học:
function mathMod(n, m) {
  return ((n % m) + m) % m;
}

const safePrevIndex = mathMod(currentIndex - 1, items.length); // (( -1 % 4 ) + 4 ) % 4 = 3
console.log("Cách tính an toàn mathMod(0 - 1, 4) =", safePrevIndex, "=> items[3] là:", items[safePrevIndex]);
assert.strictEqual(items[safePrevIndex], "D");
console.log("-> Kiểm chứng Remainder & Math Modulo: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: VƯỢT NGƯỠNG AN TOÀN & GIẢI PHÁP BIGINT ===");
const maxSafe = Number.MAX_SAFE_INTEGER; // 9007199254740991 (2^53 - 1)
console.log("Number.MAX_SAFE_INTEGER:", maxSafe);

// Vượt ngưỡng gây mất độ chính xác (Precision Loss):
const overflow1 = maxSafe + 1;
const overflow2 = maxSafe + 2;
console.log("maxSafe + 1:", overflow1);
console.log("maxSafe + 2:", overflow2);
console.log("overflow1 === overflow2 ?", overflow1 === overflow2); // true!
assert.strictEqual(overflow1 === overflow2, true);

// Giải pháp: Dùng BigInt
const bigSafe = BigInt(maxSafe);
const bigOverflow1 = bigSafe + 1n;
const bigOverflow2 = bigSafe + 2n;
console.log("BigInt(maxSafe) + 1n:", bigOverflow1.toString());
console.log("BigInt(maxSafe) + 2n:", bigOverflow2.toString());
assert.notStrictEqual(bigOverflow1, bigOverflow2);
assert.strictEqual(bigOverflow2 - bigOverflow1, 1n);
console.log("-> Kiểm chứng Safe Integer & BigInt: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: TOÁN TỬ LŨY THỪA (EXPONENTIATION **) ===");
assert.strictEqual(2 ** 3, 8);
assert.strictEqual(Math.pow(2, 3), 8);

// Cú pháp đặc biệt: -2 ** 2 là lỗi cú pháp (SyntaxError: Unary operator used immediately before exponentiation expression)
// Bắt buộc phải có ngoặc:
const powNegative = (-2) ** 2; // 4
const powNegated = -(2 ** 2);  // -4
assert.strictEqual(powNegative, 4);
assert.strictEqual(powNegated, -4);
console.log("(-2) ** 2 =", powNegative);
console.log("-(2 ** 2) =", powNegated);

console.log("\n==========================================");
console.log(" Tất cả các kiểm tra số học đã vượt qua thành công! ");
console.log("==========================================");
