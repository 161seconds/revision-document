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

// ------------------------------------------------------------
// BÀI TẬP 7: Sắp xếp theo nhiều tiêu chí (Multi-Criteria Sorting)
// Kết hợp nhiều hàm so sánh ưu tiên từ trái sang phải
// ------------------------------------------------------------
function multiSort(arr, ...comparators) {
  return arr.toSorted((a, b) => {
    for (const cmp of comparators) {
      const result = cmp(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}

const employees = [
  { dept: "IT", salary: 2000, name: "Charlie" },
  { dept: "HR", salary: 1500, name: "Alice" },
  { dept: "IT", salary: 2500, name: "Bob" },
  { dept: "IT", salary: 2000, name: "Adam" }
];

// Ưu tiên 1: Theo phòng ban (A-Z)
// Ưu tiên 2: Theo lương giảm dần
// Ưu tiên 3: Theo tên (A-Z)
const sortedEmployees = multiSort(
  employees,
  (a, b) => a.dept.localeCompare(b.dept),
  (a, b) => b.salary - a.salary,
  (a, b) => a.name.localeCompare(b.name)
);

assert.strictEqual(sortedEmployees[0].dept, "HR"); // HR đứng đầu
assert.strictEqual(sortedEmployees[1].name, "Bob"); // IT lương 2500
assert.strictEqual(sortedEmployees[2].name, "Adam"); // IT lương 2000 tên Adam
assert.strictEqual(sortedEmployees[3].name, "Charlie"); // IT lương 2000 tên Charlie
console.log("✅ Bài 7 passed: Sắp xếp đa tiêu chí Multi-Sort thành công!");

// ------------------------------------------------------------
// BÀI TẬP 8: Gom nhóm mảng theo tiêu chí (Array Grouping)
// Tự cài đặt thuật toán tương tự Object.groupBy() bằng reduce
// ------------------------------------------------------------
function customGroupBy(arr, keySelector) {
  return arr.reduce((acc, item) => {
    const key = keySelector(item);
    acc[key] ??= [];
    acc[key].push(item);
    return acc;
  }, {});
}

const inventory = [
  { name: "asparagus", type: "vegetables" },
  { name: "bananas",   type: "fruit" },
  { name: "goat",      type: "meat" },
  { name: "cherries",  type: "fruit" },
  { name: "fish",      type: "meat" }
];

const grouped = customGroupBy(inventory, item => item.type);
assert.strictEqual(grouped.vegetables.length, 1);
assert.strictEqual(grouped.fruit.length, 2);
assert.strictEqual(grouped.meat.length, 2);
assert.deepStrictEqual(grouped.fruit.map(f => f.name), ["bananas", "cherries"]);
console.log("✅ Bài 8 passed: Gom nhóm mảng customGroupBy() thành công!");

// ------------------------------------------------------------
// BÀI TẬP 9: Giao đa tập hợp tối ưu & Hiệu đối xứng (Set Operations)
// Tìm các phần tử chung xuất hiện trong TẤT CẢ các mảng đầu vào với O(n)
// ------------------------------------------------------------
function multiIntersection(...arrays) {
  if (arrays.length === 0) return [];
  // Bắt đầu bằng tập hợp các phần tử duy nhất của mảng đầu tiên:
  let currentSet = new Set(arrays[0]);

  for (let i = 1; i < arrays.length; i++) {
    const targetSet = new Set(arrays[i]);
    // Sử dụng phép giao intersection ES2024 hoặc lọc O(1) has:
    currentSet = currentSet.intersection(targetSet);
  }

  return [...currentSet];
}

const list1 = [1, 2, 2, 3, 4, 5];
const list2 = [2, 3, 5, 6];
const list3 = [3, 5, 7, 8, 2];

const commonElements = multiIntersection(list1, list2, list3);
assert.deepStrictEqual(commonElements.sort(), [2, 3, 5]);

// Kiểm tra với trường hợp không có phần tử chung:
assert.deepStrictEqual(multiIntersection([1, 2], [3, 4]), []);
console.log("✅ Bài 9 passed: Giao đa tập hợp multiIntersection() thành công!");

// ------------------------------------------------------------
// BÀI TẬP 10: Tần suất từ bằng Map (Map Frequency Counter)
// Đếm số lần xuất hiện của từ với O(N), không bị dính prototype pollution
// ------------------------------------------------------------
function wordFrequencyCounter(text) {
  const words = text.toLowerCase().match(/\b[a-z0-9_]+\b/g) || [];
  const map = new Map();
  for (const word of words) {
    map.set(word, (map.get(word) || 0) + 1);
  }
  return map;
}

const freqMap = wordFrequencyCounter("JS is great. JS is fast. Is JS great?");
assert.strictEqual(freqMap.get("js"), 3);
assert.strictEqual(freqMap.get("is"), 3);
assert.strictEqual(freqMap.get("great"), 2);
assert.strictEqual(freqMap.get("fast"), 1);
console.log("✅ Bài 10 passed: Đếm tần suất từ bằng Map thành công!");

// ------------------------------------------------------------
// BÀI TẬP 11: Pipeline lười biếng với Generator (Lazy Pipeline)
// Lấy N số chẵn bình phương đầu tiên từ một chuỗi vô hạn
// ------------------------------------------------------------
function* naturalNumbers() {
  let n = 1;
  while (true) {
    yield n++;
  }
}

function* takeEvenSquares(sourceIterable, count) {
  let taken = 0;
  for (const num of sourceIterable) {
    if (num % 2 === 0) {
      yield num * num;
      taken++;
      if (taken >= count) break;
    }
  }
}

const lazyResults = [...takeEvenSquares(naturalNumbers(), 4)];
// Các số chẵn đầu tiên: 2, 4, 6, 8 -> Bình phương: 4, 16, 36, 64
assert.deepStrictEqual(lazyResults, [4, 16, 36, 64]);
console.log("✅ Bài 11 passed: Lazy Stream Pipeline bằng Generator thành công!");

// ------------------------------------------------------------
// BÀI TẬP 12: Phân tích URL Query String bằng Regex Named Groups
// ------------------------------------------------------------
function parseQueryString(queryString) {
  const params = {};
  const regex = /(?:[?&])(?<key>[^=&#]+)=(?<val>[^&#]*)/g;
  let match;
  while ((match = regex.exec(queryString)) !== null) {
    const { key, val } = match.groups;
    params[decodeURIComponent(key)] = decodeURIComponent(val);
  }
  return params;
}

const parsedParams = parseQueryString("?category=tech&id=42&tag=javascript");
assert.deepStrictEqual(parsedParams, {
  category: "tech",
  id: "42",
  tag: "javascript",
});
console.log("✅ Bài 12 passed: Phân tích URL Query bằng RegExp Named Groups thành công!");

console.log("\n🎉 CHÚC MỪNG! BẠN ĐÃ VƯỢT QUA TOÀN BỘ 12 BÀI TẬP 03-DATA-STRUCTURES!");
