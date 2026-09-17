/**
 * 07-let-loop-closure-demo.js
 * Minh họa TDZ, Variable Shadowing và cơ chế Loop Scope Binding của let
 * Chạy bằng: node 07-let-loop-closure-demo.js
 */

const assert = require("assert");

console.log("=== 1. KIỂM CHỨNG TEMPORAL DEAD ZONE (TDZ) ===");
assert.throws(
  () => {
    // @ts-ignore
    console.log(tdzVariable);
    let tdzVariable = "Được gán giá trị";
  },
  /^ReferenceError: Cannot access 'tdzVariable' before initialization$/,
  "let phải ném lỗi ReferenceError khi truy cập trong TDZ"
);
console.log("✅ TDZ ném ReferenceError chính xác khi truy cập trước dòng khai báo!");

console.log("\n=== 2. KIỂM CHỨNG VARIABLE SHADOWING (BIẾN CHE KHUẤT) ===");
let score = 100;
{
  let score = 200; // Shadowing biến score bên ngoài
  assert.strictEqual(score, 200);
  console.log("Score trong khối con:", score);
}
assert.strictEqual(score, 100);
console.log("Score ngoài khối cha (vẫn an toàn):", score);
console.log("✅ Variable Shadowing hoạt động hoàn hảo!");

console.log("\n=== 3. SO SÁNH CLOSURE TRONG VÒNG LẶP: VAR VS LET ===");

// 1. Dùng var: Mọi hàm lưu cùng 1 tham chiếu ô nhớ i
const varResults = [];
for (var i = 0; i < 3; i++) {
  varResults.push(() => i);
}

// 2. Dùng let: Mỗi vòng lặp tạo ra 1 binding mới độc lập cho j
const letResults = [];
for (let j = 0; j < 3; j++) {
  letResults.push(() => j);
}

// Kiểm tra kết quả thực thi sau khi vòng lặp đã kết thúc:
const varOutputs = varResults.map(fn => fn());
const letOutputs = letResults.map(fn => fn());

console.log("Kết quả mảng hàm dùng VAR:", varOutputs); // [3, 3, 3]
console.log("Kết quả mảng hàm dùng LET:", letOutputs); // [0, 1, 2]

assert.deepStrictEqual(varOutputs, [3, 3, 3], "var dùng chung 1 ô nhớ nên kết quả là [3, 3, 3]");
assert.deepStrictEqual(letOutputs, [0, 1, 2], "let tạo new scope binding mỗi lần lặp nên kết quả là [0, 1, 2]");

console.log("\n🎉 Đã chứng minh chính xác cơ chế Per-Iteration Scope Binding của let!");
