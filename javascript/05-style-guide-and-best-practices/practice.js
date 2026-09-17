/**
 * Bài Tập Thực Hành Module 05: Chuẩn Mực Viết Mã, Sai Lầm Thường Gặp & Tối Ưu Hiệu Năng
 * Bộ kiểm tra tự động đánh giá năng lực viết Clean Code, xử lý sai số số thực,
 * và kỹ thuật tối ưu hóa bộ nhớ/CPU.
 */

"use strict";

const assert = require("assert");

console.log("=== BẮT ĐẦU KIỂM TRA BÀI TẬP 05-STYLE-GUIDE-AND-BEST-PRACTICES ===\n");

// ------------------------------------------------------------
// BÀI TẬP 1: So Sánh Số Thực An Toàn (Safe Float Equal)
// Sử dụng Number.EPSILON để triệt tiêu sai số dấu phẩy động IEEE 754
// ------------------------------------------------------------
function areFloatsEqual(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}

assert.strictEqual(areFloatsEqual(0.1 + 0.2, 0.3), true);
assert.strictEqual(areFloatsEqual(0.1 * 3, 0.3), true);
assert.strictEqual(areFloatsEqual(0.1 + 0.2, 0.30001), false);
console.log("✅ Bài 1 passed: Hàm areFloatsEqual() xử lý chuẩn xác sai số IEEE 754!");

// ------------------------------------------------------------
// BÀI TẬP 2: Xóa Thuộc Tính Bất Biến (Immutable Property Omit)
// Loại bỏ thuộc tính khỏi đối tượng mà KHÔNG dùng toán tử delete (tránh phá vỡ Hidden Class)
// ------------------------------------------------------------
function omitProperties(obj, ...keysToOmit) {
  const omitSet = new Set(keysToOmit);
  const result = {};

  for (const key of Object.keys(obj)) {
    if (!omitSet.has(key)) {
      result[key] = obj[key];
    }
  }

  return result;
}

const originalUser = { id: 101, username: "namdev", passwordHash: "secret123", salt: "xyz" };
const safeUser = omitProperties(originalUser, "passwordHash", "salt");

assert.deepStrictEqual(safeUser, { id: 101, username: "namdev" });
assert.strictEqual("passwordHash" in originalUser, true); // Không làm biến đổi object gốc!
console.log("✅ Bài 2 passed: Hàm omitProperties() loại bỏ thuộc tính an toàn không dùng delete!");

// ------------------------------------------------------------
// BÀI TẬP 3: Memoization Tối Ưu Hiệu Năng (Pure Function Caching)
// Tự cài đặt hàm ghi nhớ kết quả tính toán đắt đỏ để tái sử dụng O(1)
// ------------------------------------------------------------
function memoize(fn) {
  const cache = new Map();

  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const computed = fn.apply(this, args);
    cache.set(key, computed);
    return computed;
  };
}

let computeCount = 0;
const expensiveSquare = memoize((n) => {
  computeCount++;
  return n * n;
});

assert.strictEqual(expensiveSquare(5), 25);
assert.strictEqual(expensiveSquare(5), 25); // Lấy từ cache!
assert.strictEqual(expensiveSquare(5), 25); // Lấy từ cache!
assert.strictEqual(computeCount, 1);        // Chỉ tính toán đúng 1 lần duy nhất!

assert.strictEqual(expensiveSquare(6), 36);
assert.strictEqual(computeCount, 2);
console.log("✅ Bài 3 passed: Hàm memoize() tăng tốc độ tính toán thành công!");

// ------------------------------------------------------------
// BÀI TẬP 4: Ép Kiểu Số Học Phòng Thủ (Defensive Number Coercion)
// Chuyển đổi mọi dữ liệu đầu vào thành số hữu hạn hợp lệ, triệt tiêu NaN & Infinity
// ------------------------------------------------------------
function safeToNumber(val, fallback = 0) {
  if (val === null || typeof val === "boolean") {
    return fallback;
  }
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
}

assert.strictEqual(safeToNumber("123.45"), 123.45);
assert.strictEqual(safeToNumber("bad_input", 99), 99);
assert.strictEqual(safeToNumber(1 / 0, -1), -1); // Triệt tiêu Infinity
assert.strictEqual(safeToNumber(null, 10), 10);
assert.strictEqual(safeToNumber(false, 5), 5);
console.log("✅ Bài 4 passed: Hàm safeToNumber() phòng thủ ép kiểu số học thành công!");

// ------------------------------------------------------------
// BÀI TẬP 5: Gom Nhóm Tác Vụ Theo Lô (Batch Chunk Processor)
// Chia nhỏ khối lượng công việc lớn thành các mảng con kích thước cố định
// ------------------------------------------------------------
function chunkArray(array, chunkSize) {
  if (chunkSize <= 0) return [];
  const result = [];
  const len = array.length;

  for (let i = 0; i < len; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }

  return result;
}

const tasks = [1, 2, 3, 4, 5, 6, 7, 8];
const batches = chunkArray(tasks, 3);
assert.deepStrictEqual(batches, [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8]
]);
console.log("✅ Bài 5 passed: Hàm chunkArray() chia lô xử lý thành công!");

console.log("\n🎉 CHÚC MỪNG! BẠN ĐÃ VƯỢT QUA TOÀN BỘ BÀI TẬP 05-STYLE-GUIDE-AND-BEST-PRACTICES!");
