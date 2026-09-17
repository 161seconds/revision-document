/**
 * JavaScript Common Mistakes & Anti-Patterns Demo
 * Thực nghiệm sai số IEEE 754, Number.EPSILON, cạm bẫy mảng Named Index,
 * và phân biệt ranh giới null vs undefined.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: SAI SỐ SỐ THỰC DẤU PHẨY ĐỘNG (IEEE 754) & NUMBER.EPSILON ===");
const sumFloat = 0.1 + 0.2;

assert.notStrictEqual(sumFloat, 0.3); // 0.30000000000000004
assert.strictEqual(sumFloat, 0.30000000000000004);
console.log("0.1 + 0.2 trong bộ nhớ máy tính thực sự bằng:", sumFloat);

// Giải pháp an toàn với Number.EPSILON:
function safeFloatEqual(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}

assert.strictEqual(safeFloatEqual(0.1 + 0.2, 0.3), true);
console.log("-> Kiểm chứng so sánh số thực an toàn với Number.EPSILON: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: CẠM BẪY MẢNG DÙNG CHỈ MỤC ĐẶT TÊN (NAMED INDEX TRAP) ===");
const badArray = [];
badArray["name"] = "Alice";
badArray["age"] = 30;

// Độ dài của mảng vẫn là 0!
assert.strictEqual(badArray.length, 0);

// Các hàm duyệt mảng hoàn toàn bỏ qua các thuộc tính này:
let loopCount = 0;
badArray.forEach(() => loopCount++);
assert.strictEqual(loopCount, 0); // Không hề lặp qua phần tử nào!

console.log("badArray.length khi gán chuỗi:", badArray.length);
console.log("Số phần tử duyệt qua bằng forEach:", loopCount);
console.log("-> Kiểm chứng cạm bẫy Named Index trong Array: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: PHÂN BIỆT NULL VS UNDEFINED ===");
assert.strictEqual(typeof undefined, "undefined");
assert.strictEqual(typeof null, "object"); // Lỗi lịch sử từ năm 1995

// So sánh lỏng vs chặt chẽ:
// @ts-ignore
assert.strictEqual(undefined == null, true);
assert.strictEqual(undefined === null, false);

// Khác biệt khi ép kiểu số:
assert.strictEqual(Number(null), 0);
assert.strictEqual(Number.isNaN(Number(undefined)), true); // undefined ra NaN!

console.log("Number(null) =", Number(null));
console.log("Number(undefined) =", Number(undefined));
console.log("-> Kiểm chứng phân biệt null vs undefined: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: CỘNG GHÉP CHUỖI (+) VS PHÉP TRỪ SỐ HỌC (-) ===");
assert.strictEqual(10 + "5", "105"); // Chuỗi
assert.strictEqual(10 - "5", 5);     // Số
assert.strictEqual(10 * "5", 50);    // Số
assert.strictEqual("10" - 0, 10);    // Ép chuỗi thành số

console.log("10 + '5' =", 10 + "5");
console.log("10 - '5' =", 10 - "5");
console.log("-> Kiểm chứng ép kiểu ngầm toán tử: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Common Mistakes đã vượt qua thành công! ");
console.log("==========================================");
