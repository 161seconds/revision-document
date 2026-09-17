/**
 * practice.js - Bài tập thực hành Fundamentals
 * Chạy file này bằng lệnh: node practice.js
 */

const assert = require("assert");

console.log("=== BẮT ĐẦU KIỂM TRA BÀI TẬP ===");

// ------------------------------------------------------------
// BÀI TẬP 1: Viết hàm kiểm tra xem một giá trị có phải kiểu Object thực sự hay không
// (Lưu ý: Không được nhầm null hoặc Array là plain Object)
// ------------------------------------------------------------
function isPlainObject(val) {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

// Test cases bài 1
assert.strictEqual(isPlainObject({ a: 1 }), true, "Fail: Plain object phải trả về true");
assert.strictEqual(isPlainObject(null), false, "Fail: null không phải là object hợp lệ");
assert.strictEqual(isPlainObject([1, 2, 3]), false, "Fail: Array không phải plain object");
assert.strictEqual(isPlainObject("hello"), false, "Fail: String không phải object");
console.log("✅ Bài 1 passed: Kiểm tra Plain Object chính xác!");

// ------------------------------------------------------------
// BÀI TẬP 2: Hoán đổi giá trị 2 biến số mà không dùng biến tạm (dùng Destructuring)
// ------------------------------------------------------------
let x = 100;
let y = 200;

// Thực hiện hoán đổi 1 dòng:
[x, y] = [y, x];

assert.strictEqual(x, 200, "Fail: x phải là 200");
assert.strictEqual(y, 100, "Fail: y phải là 100");
console.log("✅ Bài 2 passed: Swap giá trị bằng Destructuring thành công!");

// ------------------------------------------------------------
// BÀI TẬP 3: Sao chép sâu an toàn (Deep Copy)
// ------------------------------------------------------------
function deepCopy(obj) {
  return structuredClone(obj);
}

const original = { user: { profile: { id: 42 } } };
const copy = deepCopy(original);
copy.user.profile.id = 999;

assert.strictEqual(original.user.profile.id, 42, "Fail: Dữ liệu gốc không được thay đổi!");
console.log("✅ Bài 3 passed: Deep Clone thành công!");

// ------------------------------------------------------------
// BÀI TẬP 4: Thuật toán modulo chuẩn cho mảng vòng (Circular Buffer)
// Tránh lỗi index âm khi lùi chỉ số qua 0
// ------------------------------------------------------------
function safeCircularIndex(index, length) {
  return ((index % length) + length) % length;
}

assert.strictEqual(safeCircularIndex(-1, 5), 4, "Fail: Chỉ số lùi từ 0 trong mảng 5 phần tử phải là 4");
assert.strictEqual(safeCircularIndex(5, 5), 0, "Fail: Chỉ số tiến vượt ngưỡng phải quay về 0");
console.log("✅ Bài 4 passed: Modulo mảng vòng an toàn!");

console.log("\n🎉 CHÚC MỪNG! BẠN ĐÃ VƯỢT QUA TOÀN BỘ BÀI TẬP 01-FUNDAMENTALS!");

