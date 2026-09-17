/**
 * practice.js - Module 08: Language Reference & Syntax Test Suite
 * Chạy độc lập: node practice.js
 * Bộ kiểm tra toàn diện 5 thử thách tích hợp:
 * 1. Completion Record & Labeled Loop Optimization
 * 2. ECMAScript Identifier & Unicode Scanner Engine
 * 3. Bitwise 32-bit Integer Truncation & Bit Hacks
 * 4. Short-Circuiting & Logical Assignment Matrix
 * 5. Precedence, Associativity & Evaluation Order
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 08 - LANGUAGE REFERENCE ===");

// -------------------------------------------------------------
// THỬ THÁCH 1: COMPLETION RECORDS & LABELED LOOPS
// -------------------------------------------------------------
console.log("-> Thử thách 1: Completion Records & Labeled Loops...");

// A. Completion Value của khối lệnh
const blockValue = eval("let a = 5; let b = 10; a + b;");
assert.equal(blockValue, 15, "Completion value của khối là 15");

// B. Labeled Break đa tầng
let steps = 0;
outer: for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    steps++;
    if (i === 2 && j === 2) {
      break outer; // Dừng ngay khi đạt (2, 2)
    }
  }
}
// i=0 chạy 5 lần, i=1 chạy 5 lần, i=2 chạy 3 lần (j=0, 1, 2) -> Tổng: 13
assert.equal(steps, 13, "Labeled statement break chuẩn xác 13 bước thay vì 25");

console.log("   ✓ Thử thách 1 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 2: IDENTIFIER & UNICODE VALIDATION ENGINE
// -------------------------------------------------------------
console.log("-> Thử thách 2: Identifier & Unicode Validation Engine...");

const STRICT_RESERVED = new Set([
  "break", "case", "catch", "class", "const", "continue", "debugger", "default",
  "delete", "do", "else", "export", "extends", "finally", "for", "function",
  "if", "import", "in", "instanceof", "new", "return", "super", "switch",
  "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield",
  "enum", "implements", "interface", "let", "package", "private", "protected",
  "public", "static", "eval", "arguments",
]);

function isValidJSName(name) {
  if (!name || typeof name !== "string") return false;
  if (STRICT_RESERVED.has(name)) return false;
  const regex = /^[$_\p{ID_Start}][$_\p{ID_Continue}]*$/u;
  return regex.test(name);
}

assert.equal(isValidJSName("_secretId"), true);
assert.equal(isValidJSName("$price"), true);
assert.equal(isValidJSName("đơn_giá"), true);
assert.equal(isValidJSName("9items"), false);
assert.equal(isValidJSName("class"), false);
assert.equal(isValidJSName("eval"), false);

console.log("   ✓ Thử thách 2 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 3: BITWISE 32-BIT INTEGER CONVERSION
// -------------------------------------------------------------
console.log("-> Thử thách 3: Bitwise 32-bit Integer Conversion...");

// A. Dịch bit không dấu >>> 0 chuẩn hóa thành Uint32
function toUint32(n) {
  return n >>> 0;
}
assert.equal(toUint32(-1), 4294967295);
assert.equal(toUint32(NaN), 0);
assert.equal(toUint32(null), 0);

// B. Phép đảo bit ~ và ~~
assert.equal(~(-1), 0);
assert.equal(~5, -6);
assert.equal(~~(123.456), 123);
assert.equal(~~(-123.456), -123);

console.log("   ✓ Thử thách 3 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 4: LOGICAL SHORT-CIRCUITING & ASSIGNMENTS
// -------------------------------------------------------------
console.log("-> Thử thách 4: Short-Circuiting & Logical Assignments...");

const testState = {
  activeCount: 0,
  userName: "",
  serverHost: null,
  tags: undefined,
};

// Sử dụng ??= (Nullish assignment)
testState.activeCount ??= 10; // activeCount là 0 (không nullish) -> giữ 0
testState.userName ??= "Anonymous"; // userName là "" (không nullish) -> giữ ""
testState.serverHost ??= "localhost"; // serverHost là null -> gán "localhost"
testState.tags ??= []; // tags là undefined -> gán []

assert.equal(testState.activeCount, 0);
assert.equal(testState.userName, "");
assert.equal(testState.serverHost, "localhost");
assert.deepEqual(testState.tags, []);

// So sánh với ||= (Falsy assignment)
testState.userName ||= "Guest"; // "" là falsy -> bị gán đè thành "Guest"
assert.equal(testState.userName, "Guest");

console.log("   ✓ Thử thách 4 hoàn thành xuất sắc!");

// -------------------------------------------------------------
// THỬ THÁCH 5: PRECEDENCE, ASSOCIATIVITY & SYNTAX DEFENSE
// -------------------------------------------------------------
console.log("-> Thử thách 5: Precedence & Associativity...");

// A. Right-to-Left của lũy thừa
// 2 ** 2 ** 3 = 2 ** (2 ** 3) = 2 ** 8 = 256
assert.equal(2 ** 2 ** 3, 256);

// B. SyntaxError khi trộn ?? và || không ngoặc
let syntaxThrew = false;
try {
  eval("1 || 2 ?? 3");
} catch (e) {
  if (e instanceof SyntaxError) syntaxThrew = true;
}
assert.equal(syntaxThrew, true, "Trộn ?? và || bắt buộc phải văng SyntaxError");

// C. Thứ tự đánh giá con luôn từ trái qua phải
const order = [];
function record(step, val) {
  order.push(step);
  return val;
}

const mathResult = record("First", 10) + record("Second", 5) * record("Third", 2);
assert.equal(mathResult, 20); // 10 + (5 * 2) = 20
assert.deepEqual(order, ["First", "Second", "Third"], "Thực thi tuần tự trái qua phải");

console.log("   ✓ Thử thách 5 hoàn thành xuất sắc!");

console.log("\n=======================================================");
console.log("-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 08 ĐÃ VƯỢT QUA 100%!");
console.log("=======================================================");
