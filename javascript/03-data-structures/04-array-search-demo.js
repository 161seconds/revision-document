/**
 * JavaScript Array Search & Predicates Demo
 * Thực nghiệm indexOf (===) vs includes (SameValueZero), bẫy tìm kiếm Object theo tham chiếu,
 * bẫy điều kiện indexOf, và tìm kiếm ngược ES2023 findLast / findLastIndex.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: INDEXOF (===) VS INCLUDES (SAMEVALUEZERO) VỚI NAN ===");
const listWithNaN = [10, NaN, 20];

// indexOf dùng === nên không bao giờ tìm thấy NaN:
const indexOfNaN = listWithNaN.indexOf(NaN);
console.log("[10, NaN, 20].indexOf(NaN)  :", indexOfNaN); // -1 (Thất bại!)
assert.strictEqual(indexOfNaN, -1);

// includes dùng thuật toán SameValueZero nên tìm thấy NaN:
const includesNaN = listWithNaN.includes(NaN);
console.log("[10, NaN, 20].includes(NaN) :", includesNaN); // true (Thành công!)
assert.strictEqual(includesNaN, true);

// SameValueZero coi +0 và -0 là bằng nhau:
assert.strictEqual([+0].includes(-0), true);
console.log("-> Kiểm chứng indexOf vs includes: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: CẠM BẪY TÌM KIẾM OBJECT THEO THAM CHIẾU ===");
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];

// 1. Dùng includes với literal object mới -> Thất bại vì khác địa chỉ Heap:
const hasAlice = users.includes({ id: 1, name: "Alice" });
console.log("users.includes({ id: 1, ... }):", hasAlice); // false!
assert.strictEqual(hasAlice, false);

// 2. Dùng find() với Predicate Function -> Thành công rực rỡ:
const foundUser = users.find((u) => u.id === 1);
console.log("users.find(u => u.id === 1)    :", foundUser);
assert.deepStrictEqual(foundUser, { id: 1, name: "Alice" });

const foundIndex = users.findIndex((u) => u.id === 2);
console.log("users.findIndex(u => u.id === 2):", foundIndex); // 1
assert.strictEqual(foundIndex, 1);
console.log("-> Kiểm chứng Tìm kiếm Object: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: CẠM BẪY KIỂM TRA ĐIỀU KIỆN TRUTHY/FALSY CỦA INDEXOF ===");
const items = ["alpha", "beta"];

// Bẫy 1: Phần tử ở vị trí 0 trả về 0 -> Bị coi là Falsy trong if!
const alphaIndex = items.indexOf("alpha");
assert.strictEqual(alphaIndex, 0);
assert.strictEqual(Boolean(alphaIndex), false, "Index 0 là Falsy!");

// Bẫy 2: Phần tử không tìm thấy trả về -1 -> Bị coi là Truthy trong if!
const missingIndex = items.indexOf("gamma");
assert.strictEqual(missingIndex, -1);
assert.strictEqual(Boolean(missingIndex), true, "Index -1 là Truthy!");

console.log("Boolean(items.indexOf('alpha')) :", Boolean(alphaIndex), "(Bẫy: Có phần tử nhưng falsy)");
console.log("Boolean(items.indexOf('gamma')) :", Boolean(missingIndex), "(Bẫy: Không có phần tử nhưng truthy)");
console.log("-> Kiểm chứng Bẫy điều kiện indexOf: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: TÌM KIẾM NGƯỢC TỪ ĐUÔI VỚI FINDLAST & FINDLASTINDEX (ES2023) ===");
const transactions = [
  { id: 101, type: "PAYMENT", amount: 50 },
  { id: 102, type: "REFUND",  amount: 20 },
  { id: 103, type: "PAYMENT", amount: 150 }, // Giao dịch PAYMENT cuối cùng
  { id: 104, type: "FEE",     amount: 5 }
];

// Tìm giao dịch PAYMENT cuối cùng:
const lastPayment = transactions.findLast((tx) => tx.type === "PAYMENT");
const lastPaymentIndex = transactions.findLastIndex((tx) => tx.type === "PAYMENT");

console.log("findLast PAYMENT      :", lastPayment);
console.log("findLastIndex PAYMENT :", lastPaymentIndex);

assert.strictEqual(lastPayment.id, 103);
assert.strictEqual(lastPayment.amount, 150);
assert.strictEqual(lastPaymentIndex, 2);

// Kiểm chứng: Mảng transactions gốc không hề bị thay đổi hay đảo ngược:
assert.strictEqual(transactions[0].id, 101);
assert.strictEqual(transactions.length, 4);
console.log("-> Kiểm chứng ES2023 findLast / findLastIndex: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: TÍNH NĂNG DUYỆT QUA EMPTY SLOTS CỦA FIND() ===");
// Khác với map() hay forEach() bỏ qua empty slots, find() DUYỆT QUA CẢ EMPTY SLOTS:
let visitCount = 0;
const sparseArray = new Array(3);

const foundInSparse = sparseArray.find((val) => {
  visitCount++;
  return val === "SPECIFIC_ITEM_NOT_HERE"; // Không bao giờ khớp -> Buộc duyệt qua tất cả các slot
});

console.log("Số lần find() duyệt qua slot rỗng của new Array(3):", visitCount); // 3!
assert.strictEqual(visitCount, 3, "find() đã ghé thăm tất cả 3 empty slots!");
assert.strictEqual(foundInSparse, undefined);
console.log("-> Kiểm chứng find() trên Empty Slots: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra tìm kiếm mảng đã vượt qua thành công! ");
console.log("==========================================");
