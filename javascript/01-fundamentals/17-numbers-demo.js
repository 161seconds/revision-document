/**
 * JavaScript Numbers, Bitwise & BigInt Demo
 * Thực nghiệm sai số IEEE 754, Number.EPSILON, 32-bit bitwise truncate, và BigInt JSON serialization.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: SAI SỐ FLOATING POINT & NUMBER.EPSILON ===");
const sum = 0.1 + 0.2;
console.log("0.1 + 0.2 =", sum);
assert.notStrictEqual(sum, 0.3); // Sai số 0.30000000000000004

// So sánh an toàn dùng Number.EPSILON:
function areFloatsEqual(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}

assert.ok(areFloatsEqual(sum, 0.3));
console.log("So sánh an toàn với Number.EPSILON:", areFloatsEqual(sum, 0.3));
console.log("-> Kiểm chứng IEEE 754 & EPSILON: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: CẠM BẪY NUMBER.MIN_VALUE ===");
console.log("Number.MIN_VALUE:", Number.MIN_VALUE);
// Bẫy phỏng vấn kinh điển: MIN_VALUE > 0 trả về true!
assert.strictEqual(Number.MIN_VALUE > 0, true);
assert.strictEqual(-Number.MAX_VALUE < 0, true); // Đây mới là số âm nhỏ nhất
console.log("Number.MIN_VALUE > 0 :", Number.MIN_VALUE > 0);
console.log("-> Kiểm chứng MIN_VALUE: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: PARSEINT VS PARSEFLOAT VS NUMBER() ===");
assert.strictEqual(parseInt("100px", 10), 100);
assert.strictEqual(parseFloat("3.14rem"), 3.14);
assert.ok(Number.isNaN(Number("100px")));

// Khác biệt khi xử lý chuỗi rỗng "":
assert.ok(Number.isNaN(parseInt("", 10)));
assert.strictEqual(Number(""), 0); // Number("") trả về 0!
console.log("parseInt('100px', 10):", parseInt("100px", 10));
console.log("Number('100px')      :", Number("100px"));
console.log("Number('')           :", Number(""));
console.log("-> Kiểm chứng Parsing Numbers: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: THAO TÁC BITWISE 32-BIT & CƠ CHẾ CẮT SỐ NGUYÊN ===");
// Ép số thực thành số nguyên 32-bit nhanh (Fast Truncate):
const floatNum = 42.89;
assert.strictEqual(floatNum | 0, 42);
assert.strictEqual(~~floatNum, 42);

// Giới hạn 32-bit của Bitwise (2^31 bị tràn sang số âm):
const overflow32 = (2 ** 31) | 0;
console.log("(2 ** 31) | 0 =", overflow32); // -2147483648
assert.strictEqual(overflow32, -2147483648);
console.log("-> Kiểm chứng 32-bit Bitwise Truncate: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: BIGINT & GIẢI PHÁP SERIALIZE JSON ===");
const bigIntNum = 9007199254740995n; // Vượt quá MAX_SAFE_INTEGER

// 1. Phép chia BigInt không có phần thập phân:
assert.strictEqual(5n / 2n, 2n);

// 2. Không thể tính toán trực tiếp giữa BigInt và Number:
assert.throws(() => {
  return bigIntNum + 10;
}, TypeError);

// 3. Xử lý lỗi serialize JSON của BigInt:
const payload = {
  orderId: 12345678901234567890n,
  title: "Đơn hàng sách"
};

// Mặc định JSON.stringify sẽ ném TypeError:
assert.throws(() => {
  JSON.stringify(payload);
}, TypeError);

// Cách giải quyết 1: Dùng replacer function
const jsonString = JSON.stringify(payload, (key, value) =>
  typeof value === "bigint" ? value.toString() : value
);

console.log("JSON đã serialize an toàn:", jsonString);
assert.ok(jsonString.includes('"orderId":"12345678901234567890"'));
console.log("-> Kiểm chứng BigInt & JSON Serialization: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra số học nâng cao đã vượt qua thành công! ");
console.log("==========================================");
