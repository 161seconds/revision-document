/**
 * JavaScript Array Reference & Master Demo
 * Thực nghiệm duyệt Iterators (entries, keys, values), bộ tứ bất biến ES2023
 * (toSorted, toReversed, toSpliced, with), và copyWithin.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: DUYỆT ITERATORS VỚI ENTRIES(), KEYS(), VALUES() ===");
const fruits = ["Apple", "Banana", "Cherry"];

// 1. entries(): Trả về iterator chứa [index, value]
const entriesResult = [];
for (const [index, fruit] of fruits.entries()) {
  entriesResult.push(`${index}:${fruit}`);
}
console.log("fruits.entries():", entriesResult);
assert.deepStrictEqual(entriesResult, ["0:Apple", "1:Banana", "2:Cherry"]);

// 2. keys(): Trả về iterator chứa các index số học
const keysResult = [];
for (const key of fruits.keys()) {
  keysResult.push(key);
}
console.log("fruits.keys()   :", keysResult);
assert.deepStrictEqual(keysResult, [0, 1, 2]);

// 3. values(): Tương đương duyệt for...of trực tiếp
const valuesResult = [];
for (const val of fruits.values()) {
  valuesResult.push(val);
}
assert.deepStrictEqual(valuesResult, ["Apple", "Banana", "Cherry"]);
console.log("-> Kiểm chứng Array Iterators: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: BỘ TỨ BẤT BIẾN ES2023 (CHANGE-BY-COPY QUAD) ===");
const numbers = [30, 10, 40, 20];

// 1. toSorted:
const sorted = numbers.toSorted((a, b) => a - b);
assert.deepStrictEqual(sorted, [10, 20, 30, 40]);
assert.deepStrictEqual(numbers, [30, 10, 40, 20], "Mảng gốc numbers không đổi!");

// 2. toReversed:
const reversed = numbers.toReversed();
assert.deepStrictEqual(reversed, [20, 40, 10, 30]);
assert.deepStrictEqual(numbers, [30, 10, 40, 20]);

// 3. toSpliced:
const spliced = numbers.toSpliced(1, 2, 99); // Xóa 10, 40; chèn 99
assert.deepStrictEqual(spliced, [30, 99, 20]);
assert.deepStrictEqual(numbers, [30, 10, 40, 20]);

// 4. with:
const replaced = numbers.with(0, 999);
assert.deepStrictEqual(replaced, [999, 10, 40, 20]);
assert.deepStrictEqual(numbers, [30, 10, 40, 20]);

console.log("numbers gốc              :", numbers);
console.log("toSorted((a, b) => a - b):", sorted);
console.log("toReversed()             :", reversed);
console.log("toSpliced(1, 2, 99)      :", spliced);
console.log("with(0, 999)             :", replaced);
console.log("-> Kiểm chứng Bộ tứ ES2023 Change-by-Copy: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: SAO CHÉP BỘ NHỚ NỘI BỘ VỚI COPYWITHIN() ===");
// copyWithin(target, start, end): Sao chép dải [start, end) đè vào vị trí target
const sequence = [1, 2, 3, 4, 5];

// Sao chép phần tử từ index 3 đến hết ([4, 5]) đè vào từ index 0:
sequence.copyWithin(0, 3);
console.log("[1, 2, 3, 4, 5].copyWithin(0, 3) =>", sequence);

assert.strictEqual(sequence.length, 5, "copyWithin không làm thay đổi length!");
assert.deepStrictEqual(sequence, [4, 5, 3, 4, 5]);
console.log("-> Kiểm chứng copyWithin(): Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: STATIC METHODS TỔNG HỢP ===");
assert.strictEqual(Array.isArray([]), true);
assert.strictEqual(Array.isArray("string"), false);

const createdByOf = Array.of(1, 2, 3);
assert.deepStrictEqual(createdByOf, [1, 2, 3]);

const mappedFrom = Array.from("ABC", char => char.charCodeAt(0));
console.log("Array.from('ABC', charCode):", mappedFrom);
assert.deepStrictEqual(mappedFrom, [65, 66, 67]);
console.log("-> Kiểm chứng Static Array Methods: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Array Reference đã vượt qua thành công! ");
console.log("==========================================");
