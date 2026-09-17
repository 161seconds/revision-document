/**
 * JavaScript Loops, Iteration & Control Flow Demo
 * Thực nghiệm for...in vs for...of, do...while, Labeled Statements, và cạm bẫy mutate mảng.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: WHILE VS DO...WHILE ===");
let whileCount = 0;
while (false) {
  whileCount++;
}

let doWhileCount = 0;
do {
  doWhileCount++;
} while (false);

console.log("whileCount (điều kiện false)   :", whileCount);   // 0
console.log("doWhileCount (điều kiện false):", doWhileCount); // 1
assert.strictEqual(whileCount, 0);
assert.strictEqual(doWhileCount, 1);
console.log("-> Kiểm chứng do...while luôn chạy tối thiểu 1 lần: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: CẠM BẪY FOR...IN VS CHUẨN MỰC FOR...OF TRÊN MẢNG ===");
const list = ["apple", "banana"];
list.customTag = "fruit_list"; // Gán thuộc tính tuỳ biến vào mảng

const forInKeys = [];
for (const key in list) {
  forInKeys.push(key);
}

const forOfValues = [];
for (const val of list) {
  forOfValues.push(val);
}

console.log("for...in duyệt ra các keys   :", forInKeys);   // ['0', '1', 'customTag']
console.log("for...of duyệt ra các values :", forOfValues); // ['apple', 'banana']

assert.ok(forInKeys.includes("customTag"), "for...in duyệt luôn cả thuộc tính mở rộng!");
assert.strictEqual(typeof forInKeys[0], "string", "Key trong for...in luôn là string!");
assert.deepStrictEqual(forOfValues, ["apple", "banana"], "for...of chỉ duyệt đúng các phần tử iterable!");
console.log("-> Kiểm chứng for...in vs for...of: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: THOÁT VÒNG LẶP LỒNG BẰNG LABELED STATEMENT ===");
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

let targetRow = -1;
let targetCol = -1;
let stepsTaken = 0;

outerLoop: for (let r = 0; r < matrix.length; r++) {
  for (let c = 0; c < matrix[r].length; c++) {
    stepsTaken++;
    if (matrix[r][c] === 5) {
      targetRow = r;
      targetCol = c;
      break outerLoop; // Thoát ngay lập tức cả outerLoop mà không cần duyệt tiếp!
    }
  }
}

console.log(`Tìm thấy số 5 tại hàng ${targetRow}, cột ${targetCol} sau ${stepsTaken} bước lặp.`);
assert.strictEqual(targetRow, 1);
assert.strictEqual(targetCol, 1);
assert.strictEqual(stepsTaken, 5); // Dừng ngay ở vị trí số 5, không duyệt tiếp 6, 7, 8, 9
console.log("-> Kiểm chứng Labeled Break: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: CẠM BẪY MUTATE MẢNG KHI ĐANG DUYỆT & GIẢI PHÁP ===");
// Bài toán: Xóa tất cả các số 2 ra khỏi mảng
const faultyArray = [1, 2, 2, 3];
for (let i = 0; i < faultyArray.length; i++) {
  if (faultyArray[i] === 2) {
    faultyArray.splice(i, 1);
  }
}
console.log("Duyệt xuôi và splice lỗi:", faultyArray); // [1, 2, 3] -> BỊ SÓT MỘT SỐ 2 VÌ MẢNG CO LẠI!
assert.notDeepStrictEqual(faultyArray, [1, 3], "Duyệt xuôi splice bị nhảy cóc chỉ số!");

// Giải pháp chuẩn: Duyệt ngược từ cuối mảng về đầu:
const correctArray = [1, 2, 2, 3];
for (let i = correctArray.length - 1; i >= 0; i--) {
  if (correctArray[i] === 2) {
    correctArray.splice(i, 1);
  }
}
console.log("Duyệt ngược và splice đúng :", correctArray); // [1, 3]
assert.deepStrictEqual(correctArray, [1, 3]);
console.log("-> Kiểm chứng Mutating Array Trap & Backward Loop: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra vòng lặp đã vượt qua thành công! ");
console.log("==========================================");
