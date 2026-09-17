/**
 * 03-syntax-rules-demo.js
 * Minh họa các quy tắc cú pháp cơ bản và kiểm chứng bẫy ASI
 * Chạy bằng: node 03-syntax-rules-demo.js
 */

const assert = require("assert");

console.log("=== 1. TÍNH PHÂN BIỆT HOA - THƯỜNG (CASE SENSITIVITY) ===");
let lastName = "Nguyễn";
let lastname = "Trần";

assert.notStrictEqual(lastName, lastname);
console.log("lastName:", lastName);
console.log("lastname:", lastname);
console.log("✅ Case sensitivity: Hai định danh hoàn toàn tách biệt!");

console.log("\n=== 2. BIẾU THỨC (EXPRESSION) VS CÂU LỆNH (STATEMENT) ===");
// Biểu thức trả về giá trị, có thể truyền thẳng làm đối số
function printValue(val) {
  console.log("Giá trị biểu thức nhận được:", val);
}

// (10 * 5 + 2) là 1 expression
printValue(10 * 5 + 2);

// Ternary operator là 1 expression
const isMember = true;
const fee = isMember ? 50 : 100;
console.log("Phí tính bằng ternary expression:", fee);

console.log("\n=== 3. CẠM BẪY ASI (AUTOMATIC SEMICOLON INSERTION) ===");

// Hàm viết SAI: ngắt dòng ngay sau return
function getWrongObject() {
  return
  {
    status: "ok"
  };
}

// Hàm viết ĐÚNG: mở ngoặc { ngay trên dòng return
function getCorrectObject() {
  return {
    status: "ok"
  };
}

const wrongResult = getWrongObject();
const correctResult = getCorrectObject();

console.log("Kết quả hàm ngắt dòng sau return:", wrongResult); // undefined!
console.log("Kết quả hàm mở ngoặc cùng dòng:", correctResult); // { status: 'ok' }

assert.strictEqual(wrongResult, undefined, "Bẫy ASI: return ngắt dòng phải trả về undefined!");
assert.deepStrictEqual(correctResult, { status: "ok" }, "Mở ngoặc đúng dòng trả về object chuẩn!");
console.log("✅ Đã kiểm chứng chính xác cơ chế và cạm bẫy ASI của JavaScript!");
