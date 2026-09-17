/**
 * practice.js - Bài tập thực hành Chuyên sâu Data Structures (Arrays & Objects)
 * Chạy file này bằng lệnh: node practice.js
 */

"use strict";

const assert = require("assert");

console.log("=== BẮT ĐẦU KIỂM TRA BÀI TẬP 03-DATA-STRUCTURES ===");

// ------------------------------------------------------------
// BÀI TẬP 1: Viết hàm `compact(arr)`
// Lọc bỏ tất cả các phần tử Falsy và xử lý an toàn các lỗ rỗng (Holes)
// ------------------------------------------------------------
function compact(arr) {
  const result = [];
  for (const item of arr) {
    if (item) {
      result.push(item);
    }
  }
  return result;
}

const messy = [0, 1, false, 2, "", 3, null, undefined, NaN, 4];
// Thêm 1 hole vào mảng:
messy[20] = 5;

const cleaned = compact(messy);
assert.deepStrictEqual(cleaned, [1, 2, 3, 4, 5]);
console.log("✅ Bài 1 passed: Hàm compact() lọc falsy & holes thành công!");

// ------------------------------------------------------------
// BÀI TẬP 2: Viết hàm `chunk(arr, size)`
// Chia một mảng lớn thành các mảng con có độ dài tối đa là `size`
// ------------------------------------------------------------
function chunk(arr, size) {
  if (size <= 0) return [];
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

const numbers = [1, 2, 3, 4, 5, 6, 7];
assert.deepStrictEqual(chunk(numbers, 3), [
  [1, 2, 3],
  [4, 5, 6],
  [7]
]);
assert.deepStrictEqual(chunk(numbers, 2), [
  [1, 2],
  [3, 4],
  [5, 6],
  [7]
]);
console.log("✅ Bài 2 passed: Hàm chunk() chia mảng chính xác!");

// ------------------------------------------------------------
// BÀI TẬP 3: Viết hàm `flatten(arr, depth)`
// Tự triển khai thuật toán làm phẳng mảng đa chiều đệ quy
// ------------------------------------------------------------
function flatten(arr, depth = 1) {
  if (depth <= 0) return arr.slice();
  return arr.reduce((acc, item) => {
    if (Array.isArray(item)) {
      acc.push(...flatten(item, depth - 1));
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}

const nested = [1, [2, [3, [4]], 5]];
assert.deepStrictEqual(flatten(nested, 1), [1, 2, [3, [4]], 5]);
assert.deepStrictEqual(flatten(nested, 2), [1, 2, 3, [4], 5]);
assert.deepStrictEqual(flatten(nested, Infinity), [1, 2, 3, 4, 5]);
console.log("✅ Bài 3 passed: Hàm flatten() đệ quy làm phẳng mảng hoàn hảo!");

// ------------------------------------------------------------
// BÀI TẬP 4: Viết hàm `unique(arr)`
// Loại bỏ tất cả các phần tử trùng lặp trong O(n) bằng Set
// ------------------------------------------------------------
function unique(arr) {
  return Array.from(new Set(arr));
}

const duplicates = [1, 2, 2, 3, 4, 4, 5, 1];
assert.deepStrictEqual(unique(duplicates), [1, 2, 3, 4, 5]);
console.log("✅ Bài 4 passed: Hàm unique() khử trùng lặp O(n) thành công!");
// ------------------------------------------------------------
// BÀI TẬP 5: Thao tác cập nhật mảng bất biến (Immutable Array Operations)
// Chèn phần tử vào vị trí bất kỳ mà không làm thay đổi mảng gốc
// ------------------------------------------------------------
function insertImmutable(arr, index, ...items) {
  if (typeof arr.toSpliced === "function") {
    return arr.toSpliced(index, 0, ...items);
  }
  return [...arr.slice(0, index), ...items, ...arr.slice(index)];
}

const baseArray = ["a", "b", "e"];
const inserted = insertImmutable(baseArray, 2, "c", "d");

assert.deepStrictEqual(baseArray, ["a", "b", "e"], "Mảng gốc không được phép thay đổi!");
assert.deepStrictEqual(inserted, ["a", "b", "c", "d", "e"]);
console.log("✅ Bài 5 passed: Chèn phần tử bất biến thành công!");

// ------------------------------------------------------------
// BÀI TẬP 6: Tìm kiếm đối tượng theo đường dẫn lồng nhau (Nested Property Search)
// ------------------------------------------------------------
function findByNestedPath(arr, path, targetValue) {
  const keys = path.split(".");
  return arr.find(item => {
    let current = item;
    for (const key of keys) {
      if (current == null) return false;
      current = current[key];
    }
    return Object.is(current, targetValue);
  });
}

const userList = [
  { user: { profile: { id: 101, name: "Alice" } } },
  { user: { profile: { id: 102, name: "Bob" } } },
  { user: null }
];

const found = findByNestedPath(userList, "user.profile.id", 102);
assert.deepStrictEqual(found, userList[1]);
assert.strictEqual(findByNestedPath(userList, "user.profile.id", 999), undefined);
console.log("✅ Bài 6 passed: Tìm kiếm theo Nested Property chính xác!");

console.log("\n🎉 CHÚC MỪNG! BẠN ĐÃ VƯỢT QUA TOÀN BỘ BÀI TẬP 03-DATA-STRUCTURES!");


