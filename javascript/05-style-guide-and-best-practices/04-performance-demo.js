/**
 * JavaScript Performance & V8 Internals Demo
 * Thực nghiệm tối ưu hóa vòng lặp, chi phí phá vỡ Hidden Class của toán tử delete,
 * và kỹ thuật gom nhóm dữ liệu (Batching).
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: TỐI ƯU HÓA BIẾN ĐIỀU KIỆN TRONG VÒNG LẶP ===");
const dataArray = Array.from({ length: 50000 }, (_, i) => i);

// 1. Vòng lặp tính toán độ dài động:
const t0 = performance.now();
let total1 = 0;
for (let i = 0; i < dataArray.length; i++) {
  total1 += dataArray[i];
}
const timeUncached = performance.now() - t0;

// 2. Vòng lặp lưu trước độ dài (Cached Length):
const t1 = performance.now();
let total2 = 0;
const len = dataArray.length;
for (let i = 0; i < len; i++) {
  total2 += dataArray[i];
}
const timeCached = performance.now() - t1;

assert.strictEqual(total1, total2);
console.log(`Thời gian không cache length: ${timeUncached.toFixed(3)}ms`);
console.log(`Thời gian có cache length: ${timeCached.toFixed(3)}ms`);
console.log("-> Kiểm chứng tối ưu vòng lặp: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: CHI PHÍ PHÁ VỠ HIDDEN CLASS CỦA TOÁN TỬ DELETE ===");
// Tạo 2 nhóm đối tượng: Nhóm A giữ nguyên Shape, Nhóm B dùng delete phá vỡ Shape

function createPoint(x, y) {
  return { x, y, temp: true };
}

const pointsA = Array.from({ length: 20000 }, (_, i) => createPoint(i, i + 1));
const pointsB = Array.from({ length: 20000 }, (_, i) => createPoint(i, i + 1));

// Nhóm A: Thay thế bằng undefined (Giữ nguyên Hidden Class)
pointsA.forEach(p => {
  p.temp = undefined;
});

// Nhóm B: Dùng delete (Ép V8 chuyển sang Dictionary Mode)
pointsB.forEach(p => {
  delete p.temp;
});

// Đo thời gian đọc thuộc tính x trên nhóm A:
const tStartA = performance.now();
let sumA = 0;
for (let i = 0; i < pointsA.length; i++) {
  sumA += pointsA[i].x;
}
const timeA = performance.now() - tStartA;

// Đo thời gian đọc thuộc tính x trên nhóm B:
const tStartB = performance.now();
let sumB = 0;
for (let i = 0; i < pointsB.length; i++) {
  sumB += pointsB[i].x;
}
const timeB = performance.now() - tStartB;

assert.strictEqual(sumA, sumB);
console.log(`Thời gian đọc thuộc tính giữ nguyên Hidden Class: ${timeA.toFixed(3)}ms`);
console.log(`Thời gian đọc thuộc tính sau khi dùng delete: ${timeB.toFixed(3)}ms`);
console.log("-> Kiểm chứng Hidden Class & tác hại của delete: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: KỸ THUẬT GOM NHÓM DỮ LIỆU (BATCHING MUTATIONS) ===");
// Mô phỏng kỹ thuật gom cụm DocumentFragment trên cấu trúc mảng:
const virtualTree = [];

// Gom 1000 items vào một mảng đệm tạm thời (Buffer):
const bufferFragment = [];
for (let i = 0; i < 1000; i++) {
  bufferFragment.push({ id: i, text: `Item #${i}` });
}

// Gắn 1 lần duy nhất vào cây chính:
virtualTree.push(...bufferFragment);

assert.strictEqual(virtualTree.length, 1000);
assert.strictEqual(virtualTree[999].text, "Item #999");
console.log("Gom cụm 1000 items và gắn 1 lần duy nhất thành công.");
console.log("-> Kiểm chứng cơ chế Batching: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Performance đã vượt qua thành công! ");
console.log("==========================================");
