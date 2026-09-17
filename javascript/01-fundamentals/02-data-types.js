/**
 * 02-data-types.js
 * Phân biệt Primitive (Tham trị) vs Reference (Tham chiếu) & Deep Clone
 */

console.log("=== 1. PRIMITIVE: PASS-BY-VALUE (Sao chép giá trị) ===");
let a = 10;
let b = a; // b nhận bản sao độc lập của 10
b = 20;
console.log("a:", a); // 10 (không đổi)
console.log("b:", b); // 20

console.log("\n=== 2. REFERENCE: PASS-BY-REFERENCE (Sao chép địa chỉ ô nhớ) ===");
const originalObj = { name: "Antigravity", details: { version: "2.0" } };
const shallowRef = originalObj;
shallowRef.name = "Codex";

console.log("originalObj.name:", originalObj.name); // 'Codex' (bị đổi theo vì cùng trỏ 1 ô nhớ)

console.log("\n=== 3. SHALLOW COPY VS DEEP CLONE ===");
// Spread operator chỉ copy nông cấp 1 (shallow)
const spreadCopy = { ...originalObj };
spreadCopy.details.version = "3.0";
console.log("originalObj.details.version:", originalObj.details.version); // '3.0' (vẫn bị ảnh hưởng)

// Native Deep Clone bằng structuredClone() (Chuẩn hiện đại ES2022)
const deepCloned = structuredClone(originalObj);
deepCloned.details.version = "4.0-independent";
console.log("Sau khi đổi deepCloned:");
console.log("originalObj version:", originalObj.details.version); // '3.0' (an toàn 100%)
console.log("deepCloned version:", deepCloned.details.version);   // '4.0-independent'
