/**
 * 09-data-types-anomalies-demo.js
 * Kiểm chứng 8 kiểu dữ liệu, các cạm bẫy của typeof, và hàm kiểm tra kiểu chuẩn xác 100%
 * Chạy bằng: node 09-data-types-anomalies-demo.js
 */

const assert = require("assert");

console.log("=== 1. KIỂM TRA 8 KIỂU DỮ LIỆU BẰNG TYPEOF ===");
assert.strictEqual(typeof "Hello", "string");
assert.strictEqual(typeof 42, "number");
assert.strictEqual(typeof 9007199254740991n, "bigint");
assert.strictEqual(typeof true, "boolean");
assert.strictEqual(typeof undefined, "undefined");
assert.strictEqual(typeof Symbol("id"), "symbol");
assert.strictEqual(typeof { a: 1 }, "object");
assert.strictEqual(typeof function() {}, "function");
console.log("✅ Toàn bộ 8 kiểu dữ liệu phản hồi đúng chuẩn của JS Engine!");

console.log("\n=== 2. CÁC DỊ BIỆT KINH ĐIỂN CỦA TYPEOF ===");
// 1. typeof null là 'object' (Lỗi lịch sử)
assert.strictEqual(typeof null, "object");
console.log("Dị biệt 1: typeof null === 'object' (Lỗi lịch sử từ năm 1995)");

// 2. typeof NaN là 'number'
assert.strictEqual(typeof NaN, "number");
assert.strictEqual(NaN === NaN, false); // NaN không bằng chính nó!
assert.strictEqual(Number.isNaN(NaN), true); // Cách check đúng duy nhất
console.log("Dị biệt 2: typeof NaN === 'number' và NaN !== NaN");

// 3. typeof Array là 'object'
assert.strictEqual(typeof [1, 2, 3], "object");
assert.strictEqual(Array.isArray([1, 2, 3]), true);
console.log("Dị biệt 3: typeof [1, 2, 3] === 'object' (Cần dùng Array.isArray)");

console.log("\n=== 3. SAI SỐ DẤU PHẨY ĐỘNG IEEE 754 ===");
const sum = 0.1 + 0.2;
console.log("0.1 + 0.2 thực tế bằng:", sum);
assert.notStrictEqual(sum, 0.3); // Không bằng 0.3!

// Cách so sánh an toàn bằng Number.EPSILON:
const isAlmostEqual = Math.abs(sum - 0.3) < Number.EPSILON;
assert.strictEqual(isAlmostEqual, true);
console.log("✅ Đã so sánh số thực an toàn bằng Number.EPSILON!");

console.log("\n=== 4. HÀM KIỂM TRA KIỂU CHÍNH XÁC 100% (ROBUST TYPE CHECKER) ===");
function getExactType(val) {
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
}

assert.strictEqual(getExactType(null), "null");
assert.strictEqual(getExactType(undefined), "undefined");
assert.strictEqual(getExactType([1, 2]), "array");
assert.strictEqual(getExactType(new Date()), "date");
assert.strictEqual(getExactType(/regex/), "regexp");
assert.strictEqual(getExactType(new Map()), "map");
assert.strictEqual(getExactType(new Set()), "set");

console.log("Kết quả getExactType(null):", getExactType(null));
console.log("Kết quả getExactType([1, 2]):", getExactType([1, 2]));
console.log("Kết quả getExactType(new Date()):", getExactType(new Date()));
console.log("\n🎉 Đã hoàn thành kiểm chứng toàn diện 8 kiểu dữ liệu trong JavaScript!");
