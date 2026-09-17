/**
 * JavaScript Strings, Methods & Tagged Templates Demo
 * Thực nghiệm tính bất biến, Emoji surrogate pairs, slice vs substring, và Tagged Template XSS Sanitizer.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: TÍNH BẤT BIẾN CỦA STRING ===");
const original = "Hello";
// Thử thay đổi ký tự đầu tiên trong strict mode:
assert.throws(
  () => {
    original[0] = "J";
  },
  TypeError,
  "Trong strict mode, gán ký tự chuỗi ném TypeError do tính chất read-only!"
);
console.log("Chuỗi gốc không bị thay đổi:", original);
assert.strictEqual(original, "Hello", "Chuỗi nguyên thủy là bất biến!");

// Phương thức không làm đổi chuỗi gốc:
const upper = original.toUpperCase();
assert.strictEqual(original, "Hello");
assert.strictEqual(upper, "HELLO");
console.log("-> Kiểm chứng String Immutability: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: MÃ HÓA UTF-16 & SURROGATE PAIRS (EMOJI) ===");
const rocket = "🚀";
console.log("rocket.length                :", rocket.length);           // 2 (UTF-16 Code Units)
console.log("[...rocket].length           :", [...rocket].length);      // 1 (Code Points thực tế)
console.log("Array.from(rocket).length    :", Array.from(rocket).length); // 1

assert.strictEqual(rocket.length, 2);
assert.strictEqual([...rocket].length, 1);
assert.strictEqual(Array.from(rocket).length, 1);
console.log("-> Kiểm chứng Surrogate Pairs: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: PHÂN BIỆT SLICE VS SUBSTRING VS STR.AT() ===");
const sample = "JavaScript";

// Chỉ số âm:
assert.strictEqual(sample.slice(-6), "Script"); // Lấy 6 ký tự cuối
assert.strictEqual(sample.substring(-6), "JavaScript"); // Coi -6 là 0, lấy từ 0 đến hết!

// Tự động hoán đổi tham số khi start > end trong substring:
assert.strictEqual(sample.substring(4, 0), "Java"); // Tự đổi thành substring(0, 4)
assert.strictEqual(sample.slice(4, 0), ""); // slice trả về rỗng vì start > end

// str.at() lấy ký tự cuối:
assert.strictEqual(sample.at(-1), "t");
assert.strictEqual(sample.at(0), "J");
console.log("sample.slice(-6)    :", sample.slice(-6));
console.log("sample.substring(-6):", sample.substring(-6));
console.log("sample.at(-1)       :", sample.at(-1));
console.log("-> Kiểm chứng slice vs substring: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: REPLACE VS REPLACEALL ===");
const ip = "192.168.1.1";
const singleReplaced = ip.replace(".", "-");
const allReplaced = ip.replaceAll(".", "-");

console.log("ip.replace('.', '-')   :", singleReplaced); // "192-168.1.1"
console.log("ip.replaceAll('.', '-'):", allReplaced);    // "192-168-1-1"
assert.strictEqual(singleReplaced, "192-168.1.1");
assert.strictEqual(allReplaced, "192-168-1-1");
console.log("-> Kiểm chứng replace vs replaceAll: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: TAGGED TEMPLATE LITERAL - XSS SANITIZER ===");
// Hàm Tagged Template tự động escape HTML entities để ngăn XSS:
function safeHtml(strings, ...values) {
  function escape(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  return strings.reduce((acc, curr, index) => {
    const val = index < values.length ? escape(values[index]) : "";
    return `${acc}${curr}${val}`;
  }, "");
}

const maliciousInput = "<script>alert('pwned')</script>";
const userName = "Alice";

const renderedHtml = safeHtml`<div class="profile"><h3>Xin chào ${userName}</h3><p>${maliciousInput}</p></div>`;
console.log("Rendered HTML:\n", renderedHtml);

assert.ok(!renderedHtml.includes("<script>"), "Phải được escape mã độc!");
assert.ok(renderedHtml.includes("&lt;script&gt;alert(&#039;pwned&#039;)&lt;/script&gt;"));
console.log("-> Kiểm chứng Tagged Template Sanitizer: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra xử lý chuỗi đã vượt qua thành công! ");
console.log("==========================================");
