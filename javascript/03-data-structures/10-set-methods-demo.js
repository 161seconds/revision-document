/**
 * JavaScript Set Methods & Iteration Demo
 * Thực nghiệm toàn bộ phương thức Set, bí ẩn chữ ký forEach,
 * cơ chế Living Iterators (đột biến lúc duyệt), và chuẩn Set-like objects trong ES2024.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: METHOD CHAINING CỦA ADD() VÀ GIÁ TRỊ TRẢ VỀ CỦA DELETE/CLEAR ===");
const set = new Set();

// 1. add() trả về chính instance -> hỗ trợ Method Chaining:
const returnedInstance = set.add("A").add("B").add("C");
assert.strictEqual(returnedInstance, set);
assert.strictEqual(set.size, 3);

// 2. delete() trả về boolean:
assert.strictEqual(set.delete("B"), true);   // Tìm thấy và xóa thành công
assert.strictEqual(set.delete("UNKNOWN"), false); // Không tồn tại
assert.strictEqual(set.size, 2);

// 3. clear() xóa toàn bộ và trả về undefined:
const clearResult = set.clear();
assert.strictEqual(clearResult, undefined);
assert.strictEqual(set.size, 0);

console.log("-> Kiểm chứng Chaining & Giá trị trả về: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: GIẢI MÃ CHỮ KÝ FOREACH & BỘ BA ITERATOR METHODS ===");
const fruits = new Set(["apple", "banana", "cherry"]);

// 1. forEach cung cấp val1 === val2 ở 2 tham số đầu:
const pairs = [];
fruits.forEach((value, key, ownerSet) => {
  assert.strictEqual(value, key); // LUÔN LUÔN BẰNG NHAU!
  assert.strictEqual(ownerSet, fruits);
  pairs.push([key, value]);
});
assert.deepStrictEqual(pairs, [
  ["apple", "apple"],
  ["banana", "banana"],
  ["cherry", "cherry"]
]);

// 2. keys() và values() là các iterator giống hệt nhau:
const keysIter = fruits.keys();
const valuesIter = fruits.values();
assert.deepStrictEqual([...keysIter], ["apple", "banana", "cherry"]);
assert.deepStrictEqual([...valuesIter], ["apple", "banana", "cherry"]);

// 3. entries() trả về các cặp [value, value]:
assert.deepStrictEqual([...fruits.entries()], [
  ["apple", "apple"],
  ["banana", "banana"],
  ["cherry", "cherry"]
]);

// 4. [Symbol.iterator] mặc định chính là values():
assert.strictEqual(Set.prototype[Symbol.iterator], Set.prototype.values);

console.log("-> Kiểm chứng forEach val === key và Iterators: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: CƠ CHẾ LIVING ITERATORS (ĐỘT BIẾN KHI DUYỆT) ===");

// 1. Thêm phần tử mới trong khi duyệt -> Con trỏ tiếp tục ghé thăm phần tử mới:
const queue = new Set([1, 2]);
const visited = [];

for (const item of queue) {
  visited.push(item);
  if (item === 2) {
    queue.add(3); // Thêm phần tử vào cuối
  }
}

// 3 đã được thêm sau và VẪN ĐƯỢC DUYỆT QUA:
assert.deepStrictEqual(visited, [1, 2, 3]);
assert.strictEqual(queue.size, 3);
console.log("Thêm phần tử lúc duyệt: Living Iterator đã duyệt cả phần tử mới chèn:", visited);

// 2. Xóa phần tử trước khi con trỏ đi tới -> Phần tử đó bị bỏ qua:
const elements = new Set(["a", "b", "c", "d"]);
const processed = [];

for (const el of elements) {
  processed.push(el);
  if (el === "a") {
    elements.delete("c"); // Xóa "c" trước khi con trỏ tới "c"
  }
}

// "c" bị xóa trước khi duyệt nên không xuất hiện trong processed:
assert.deepStrictEqual(processed, ["a", "b", "d"]);
console.log("Xóa phần tử lúc duyệt: 'c' đã bị bỏ qua an toàn:", processed);
console.log("-> Kiểm chứng Living Iterators của V8: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: CHUẨN SET-LIKE OBJECTS TRONG CÁC PHƯƠNG THỨC ES2024 ===");
// Tạo một Set-like object tùy biến (không phải instance của Set):
const customSetLike = {
  size: 2,
  has(val) {
    return val === "apple" || val === "durian";
  },
  keys() {
    return ["apple", "durian"][Symbol.iterator]();
  }
};

const mySet = new Set(["apple", "banana", "cherry"]);

// Giao mySet với đối tượng Set-like (ES2024 Set.prototype.intersection):
const intersection = mySet.intersection(customSetLike);
assert.deepStrictEqual([...intersection], ["apple"]);

// Hiệu mySet với đối tượng Set-like:
const difference = mySet.difference(customSetLike);
assert.deepStrictEqual([...difference], ["banana", "cherry"]);

console.log("Giao giữa Set và Set-like Object:", [...intersection]);
console.log("Hiệu giữa Set và Set-like Object:", [...difference]);
console.log("-> Kiểm chứng Set-like Object Protocol: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Set Methods đã vượt qua thành công! ");
console.log("==========================================");
