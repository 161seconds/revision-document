/**
 * JavaScript Built-in Errors & Stack Unwinding Demo
 * Thực nghiệm kích hoạt, phân loại và bắt các kiểu lỗi chuẩn ECMAScript.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: REFERENCEERROR (BIẾN CHƯA KHAI BÁO & TDZ) ===");
// 1. Truy cập biến chưa khai báo:
assert.throws(() => {
  // @ts-ignore
  const val = nonExistentVariableXYZ;
}, ReferenceError);

// 2. Vùng chết tạm thời (TDZ):
assert.throws(() => {
  new Function(`
    console.log(myLet);
    let myLet = 10;
  `)();
}, ReferenceError);

console.log("-> Kiểm chứng ReferenceError & TDZ: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: TYPEERROR (SAI KIỂU DỮ LIỆU & NON-FUNCTION) ===");
// 1. Gọi giá trị không phải hàm:
assert.throws(() => {
  const number = 42;
  // @ts-ignore
  number();
}, TypeError);

// 2. Thao tác trên null/undefined:
assert.throws(() => {
  const nullObj = null;
  // @ts-ignore
  nullObj.toString();
}, TypeError);

// 3. Gán thuộc tính trên frozen object (Strict Mode):
assert.throws(() => {
  const frozen = Object.freeze({ name: "Alice" });
  // @ts-ignore
  frozen.name = "Bob";
}, TypeError);

console.log("-> Kiểm chứng TypeError: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: RANGEERROR (VƯỢT GIỚI HẠN & KÍCH THƯỚC MẢNG ÂM) ===");
// 1. Độ dài mảng không hợp lệ:
assert.throws(() => {
  new Array(-5);
}, RangeError);

// 2. Độ chính xác số học vượt ngưỡng (1-100):
assert.throws(() => {
  const num = 12.34;
  num.toPrecision(500);
}, RangeError);

// 3. Tràn Call Stack (Stack Overflow):
function triggerStackOverflow() {
  triggerStackOverflow();
}

assert.throws(() => {
  triggerStackOverflow();
}, RangeError);

console.log("-> Kiểm chứng RangeError & Stack Overflow: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: SYNTAXERROR (PARSING RUNTIME VỚI JSON & EVAL) ===");
// 1. JSON parse chuỗi sai chuẩn cú pháp:
assert.throws(() => {
  JSON.parse("{ badJson: true }"); // Thiếu ngoặc kép cho key
}, SyntaxError);

// 2. new Function chuỗi mã sai cú pháp:
assert.throws(() => {
  new Function("var a = ;");
}, SyntaxError);

console.log("-> Kiểm chứng SyntaxError: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: URIERROR (GIẢI MÃ URI SAI CHUẨN) ===");
assert.throws(() => {
  decodeURIComponent("%"); // Chuỗi mã hóa phần trăm không hợp lệ
}, URIError);

assert.throws(() => {
  decodeURI("%E0%A4%A"); // Thiếu byte UTF-8 hợp lệ
}, URIError);

console.log("-> Kiểm chứng URIError: Hoàn toàn chính xác!\n");

console.log("=== DEMO 6: AGGREGATEERROR (TẬP HỢP NHIỀU LỖI ES2021) ===");
const err1 = new TypeError("Lỗi kiểu dữ liệu");
const err2 = new RangeError("Lỗi phạm vi giá trị");
const aggError = new AggregateError([err1, err2], "Giao dịch đồng thời thất bại!");

assert.strictEqual(aggError instanceof Error, true);
assert.strictEqual(aggError instanceof AggregateError, true);
assert.strictEqual(aggError.errors.length, 2);
assert.strictEqual(aggError.errors[0] instanceof TypeError, true);
assert.strictEqual(aggError.errors[1] instanceof RangeError, true);
assert.strictEqual(aggError.message, "Giao dịch đồng thời thất bại!");

console.log("-> Kiểm chứng AggregateError: Hoàn toàn chính xác!\n");

console.log("=== DEMO 7: CƠ CHẾ THÁO CUỘN NGĂN XẾP (CALL STACK UNWINDING) ===");
let unwoundFrames = 0;

function frameLevel3() {
  unwoundFrames++;
  throw new Error("Lỗi phát sinh từ đáy ngăn xếp!");
}

function frameLevel2() {
  unwoundFrames++;
  frameLevel3();
}

function frameLevel1() {
  unwoundFrames++;
  frameLevel2();
}

try {
  frameLevel1();
} catch (e) {
  assert.strictEqual(e.message, "Lỗi phát sinh từ đáy ngăn xếp!");
  assert.strictEqual(unwoundFrames, 3);
  console.log("Bắt lỗi thành công sau khi tháo cuộn 3 tầng ngăn xếp.");
}

console.log("-> Kiểm chứng Call Stack Unwinding: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra JS Errors đã vượt qua thành công! ");
console.log("==========================================");
