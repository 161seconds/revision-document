/**
 * JavaScript Array Methods Demo
 * Thực nghiệm giá trị trả về của push/pop/shift/unshift, so sánh splice vs toSpliced (ES2023),
 * làm phẳng mảng với flat(Infinity), và dọn holes bằng flat().
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: GIÁ TRỊ TRẢ VỀ CỦA PUSH / POP / UNSHIFT / SHIFT ===");
const list = [10, 20];

// 1. push trả về length mới:
const pushResult = list.push(30);
console.log("list.push(30) trả về:", pushResult, "| list hiện tại:", list);
assert.strictEqual(pushResult, 3); // Độ dài mới!
assert.deepStrictEqual(list, [10, 20, 30]);

// 2. pop trả về phần tử bị xóa:
const popResult = list.pop();
console.log("list.pop()    trả về:", popResult, "| list hiện tại:", list);
assert.strictEqual(popResult, 30); // Phần tử bị gỡ!
assert.deepStrictEqual(list, [10, 20]);

// 3. unshift trả về length mới:
const unshiftResult = list.unshift(5);
console.log("list.unshift(5) trả về:", unshiftResult, "| list hiện tại:", list);
assert.strictEqual(unshiftResult, 3);
assert.deepStrictEqual(list, [5, 10, 20]);

// 4. shift trả về phần tử đầu bị xóa:
const shiftResult = list.shift();
console.log("list.shift()    trả về:", shiftResult, "| list hiện tại:", list);
assert.strictEqual(shiftResult, 5);
assert.deepStrictEqual(list, [10, 20]);
console.log("-> Kiểm chứng Return Values: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: MUTATING SPLICE() VS IMMUTABLE TOSPLICED() (ES2023) ===");
const originalList = ["A", "B", "C", "D"];

// Cách cũ: splice làm thay đổi mảng gốc:
const clonedForSplice = [...originalList];
const removedItems = clonedForSplice.splice(1, 2, "X", "Y"); // Xóa "B", "C", chèn "X", "Y"

console.log("clonedForSplice (bị mutate):", clonedForSplice); // ['A', 'X', 'Y', 'D']
console.log("removedItems (trả về mảng) :", removedItems);    // ['B', 'C']
assert.deepStrictEqual(clonedForSplice, ["A", "X", "Y", "D"]);
assert.deepStrictEqual(removedItems, ["B", "C"]);

// Chuẩn hiện đại ES2023: toSpliced giữ nguyên mảng gốc:
const immutableResult = originalList.toSpliced(1, 2, "X", "Y");
console.log("originalList (bảo toàn)    :", originalList);    // ['A', 'B', 'C', 'D']
console.log("immutableResult (mảng mới) :", immutableResult); // ['A', 'X', 'Y', 'D']
assert.deepStrictEqual(originalList, ["A", "B", "C", "D"], "originalList không bị thay đổi!");
assert.deepStrictEqual(immutableResult, ["A", "X", "Y", "D"]);
console.log("-> Kiểm chứng splice vs toSpliced: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: SAO CHÉP MẢNG CON VỚI SLICE() ===");
const fruits = ["Apple", "Banana", "Orange", "Mango"];

// slice(1, 3) lấy từ index 1 đến trước index 3:
const subFruits = fruits.slice(1, 3);
assert.deepStrictEqual(subFruits, ["Banana", "Orange"]);

// slice(-2) lấy 2 phần tử cuối cùng:
const lastTwo = fruits.slice(-2);
assert.deepStrictEqual(lastTwo, ["Orange", "Mango"]);
assert.strictEqual(fruits.length, 4, "fruits không bị thay đổi bởi slice!");
console.log("fruits.slice(1, 3):", subFruits);
console.log("fruits.slice(-2)  :", lastTwo);
console.log("-> Kiểm chứng slice(): Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: LÀM PHẲNG MẢNG ĐA CẤP ĐỘ BẰNG FLAT() ===");
const deeplyNested = [1, [2, [3, [4, 5]]]];

// Mặc định flat() chỉ làm phẳng 1 cấp:
const flatLevel1 = deeplyNested.flat();
assert.deepStrictEqual(flatLevel1, [1, 2, [3, [4, 5]]]);

// flat(Infinity) làm phẳng triệt để mọi cấp lồng nhau:
const flatAll = deeplyNested.flat(Infinity);
assert.deepStrictEqual(flatAll, [1, 2, 3, 4, 5]);
console.log("deeplyNested.flat()        :", flatLevel1);
console.log("deeplyNested.flat(Infinity):", flatAll);

// flat() tự động loại bỏ các lỗ rỗng (Empty Slots / Holes):
const holey = [10, , , 40]; // Mảng thưa có 2 holes
const noHoles = holey.flat();
console.log("Mảng có holes ban đầu :", holey, "(length:", holey.length, ")");
console.log("Mảng sau khi gọi flat():", noHoles, "(length:", noHoles.length, ")");
assert.strictEqual(holey.length, 4);
assert.strictEqual(noHoles.length, 2);
assert.deepStrictEqual(noHoles, [10, 40]);
console.log("-> Kiểm chứng flat & Hole Removal: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: CHUYỂN MẢNG THÀNH CHUỖI (JOIN VS TOSTRING) ===");
const words = ["JavaScript", "Is", "Awesome"];
const joined = words.join(" -> ");
const stringified = words.toString();

console.log("words.join(' -> '):", joined);
console.log("words.toString()  :", stringified);
assert.strictEqual(joined, "JavaScript -> Is -> Awesome");
assert.strictEqual(stringified, "JavaScript,Is,Awesome");
console.log("-> Kiểm chứng join() & toString(): Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra phương thức mảng đã vượt qua thành công! ");
console.log("==========================================");
