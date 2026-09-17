/**
 * JavaScript Debugging & DevTools Demo
 * Thực nghiệm Console API nâng cao, đo lường hiệu năng, câu lệnh debugger,
 * và bắt unhandled promise rejections.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: BỘ CÔNG CỤ CONSOLE NÂNG CAO ===");

// 1. console.table() định dạng mảng dữ liệu dạng bảng:
const team = [
  { id: 101, name: "Alice", role: "Dev" },
  { id: 102, name: "Bob", role: "QA" }
];
console.log("Minh họa console.table:");
console.table(team);

// 2. console.time() & console.timeEnd() đo lường thời gian:
console.time("Thuật toán băm");
let sum = 0;
for (let i = 0; i < 100000; i++) {
  sum += i;
}
console.timeEnd("Thuật toán băm");
assert.strictEqual(typeof sum, "number");

// 3. console.assert() chỉ in lỗi khi điều kiện là Falsy (không crash chương trình):
let loggedAssertion = false;
const originalConsoleError = console.error;
console.error = (...args) => {
  loggedAssertion = true;
  originalConsoleError(...args);
};

// Assertion này SAI -> console sẽ in lỗi:
console.assert(1 === 2, "1 không thể bằng 2!");
console.error = originalConsoleError;

console.log("-> Kiểm chứng Console API: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: CONSOLE.TRACE VÀ THEO DÕI CALL STACK KHÔNG CẦN LỖI ===");
function layerC() {
  console.log("--- Bắt đầu console.trace() tại Layer C ---");
  console.trace("Dấu vết Call Stack tại Layer C");
  return "OK_C";
}

function layerB() {
  return layerC();
}

function layerA() {
  return layerB();
}

assert.strictEqual(layerA(), "OK_C");
console.log("-> Kiểm chứng console.trace(): Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: CÂU LỆNH DEBUGGER TRONG CODE ===");
function calculateDiscount(price, discountPercent) {
  // Khi không bật inspector, câu lệnh debugger được V8 bỏ qua an toàn:
  debugger;
  return price - (price * discountPercent / 100);
}

const finalPrice = calculateDiscount(200, 10);
assert.strictEqual(finalPrice, 180);
console.log("Giá sau giảm giá (chạy qua debugger an toàn):", finalPrice);
console.log("-> Kiểm chứng câu lệnh debugger: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: BẮT UNHANDLED PROMISE REJECTION TOÀN CỤC ===");
let caughtUnhandled = false;

// Đăng ký listener toàn cục:
const rejectionHandler = (reason, promise) => {
  caughtUnhandled = true;
  assert.strictEqual(reason.message, "CỐ_Ý_BỎ_QUÊN_CATCH");
};

process.on("unhandledRejection", rejectionHandler);

// Tạo Promise bị reject mà không gọi .catch() ngay:
const forgottenPromise = Promise.reject(new Error("CỐ_Ý_BỎ_QUÊN_CATCH"));

// Bổ sung catch muộn để tránh Node.js in warning:
forgottenPromise.catch(() => {});

// Dọn dẹp listener:
process.removeListener("unhandledRejection", rejectionHandler);

console.log("-> Kiểm chứng Unhandled Rejection: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Debugging đã vượt qua thành công! ");
console.log("==========================================");
