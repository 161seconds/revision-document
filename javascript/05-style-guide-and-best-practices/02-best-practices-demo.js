/**
 * JavaScript Best Practices & Clean Code Demo
 * Thực nghiệm cạm bẫy đối tượng bao bọc nguyên thủy,
 * so sánh lỏng vs chặt chẽ, đóng gói phạm vi IIFE, và cấm lệnh with.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: CẠM BẪY ĐỐI TƯỢNG BAO BỌC NGUYÊN THỦY (OBJECT WRAPPERS) ===");

// 1. new Boolean(false) là một Object -> luôn luôn là Truthy!
const wrapperFalse = new Boolean(false);
const primitiveFalse = false;

assert.strictEqual(typeof wrapperFalse, "object");
assert.strictEqual(typeof primitiveFalse, "boolean");

// Kiểm tra truthy trong if:
let enteredWrapperIf = false;
if (wrapperFalse) {
  enteredWrapperIf = true; // VẪN CHẠY VÀO ĐÂY!
}
assert.strictEqual(enteredWrapperIf, true);

let enteredPrimitiveIf = false;
if (primitiveFalse) {
  enteredPrimitiveIf = true;
}
assert.strictEqual(enteredPrimitiveIf, false);
console.log("new Boolean(false) bị xem là Truthy vì là đối tượng:", enteredWrapperIf);

// 2. new String() không thể so sánh bằng ===:
const str1 = new String("hello");
const str2 = new String("hello");
assert.strictEqual(str1 === str2, false); // 2 ô nhớ Heap khác nhau!
assert.strictEqual("hello" === "hello", true); // Literal so sánh theo giá trị!

console.log("-> Kiểm chứng cấm dùng Object Wrappers: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: SO SÁNH CHẶT CHẼ (===) VS CẠM BẪY ÉP KIỂU LỎNG (==) ===");
// Các cạm bẫy khó hiểu của toán tử so sánh lỏng ==:
// @ts-ignore
assert.strictEqual("" == 0, true);
// @ts-ignore
assert.strictEqual(0 == "0", true);
// @ts-ignore
assert.strictEqual(false == "0", true);
// @ts-ignore
assert.strictEqual(false == "", true);

// Sử dụng === triệt tiêu toàn bộ rủi ro ép kiểu ngầm:
// @ts-ignore
assert.strictEqual("" === 0, false);
// @ts-ignore
assert.strictEqual(0 === "0", false);
// @ts-ignore
assert.strictEqual(false === "0", false);
// @ts-ignore
assert.strictEqual(false === "", false);

console.log("-> Kiểm chứng toán tử so sánh nghiêm ngặt ===: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: ĐÓNG GÓI PHẠM VI BẰNG IIFE TRÁNH Ô NHIỄM GLOBAL ===");
const resultFromModule = (() => {
  const privateApiKey = "SECRET_TOKEN_XYZ";
  const internalPort = 8080;

  return {
    isConfigured: true,
    port: internalPort
  };
})();

assert.strictEqual(resultFromModule.isConfigured, true);
assert.strictEqual(resultFromModule.port, 8080);
// @ts-ignore
assert.strictEqual(typeof privateApiKey, "undefined"); // Không rò rỉ ra ngoài!

console.log("-> Kiểm chứng đóng gói IIFE: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: STRICT MODE CẤM HOÀN TOÀN CÂU LỆNH WITH ===");
assert.throws(() => {
  new Function(`
    "use strict";
    var obj = { x: 1 };
    with (obj) {
      console.log(x);
    }
  `)();
}, SyntaxError);

console.log("Sử dụng 'with' trong Strict Mode ném SyntaxError đúng chuẩn.");
console.log("-> Kiểm chứng cấm câu lệnh with: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Best Practices đã vượt qua thành công! ");
console.log("==========================================");
