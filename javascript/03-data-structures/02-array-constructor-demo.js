/**
 * JavaScript Array Constructor & Type Checking Demo
 * Thực nghiệm hành vi phân nhánh new Array, RangeError, bẫy map trên empty slots,
 * bẫy tham chiếu .fill({}), và mô phỏng Cross-Realm bằng Node.js vm.
 */

"use strict";

const assert = require("assert");
const vm = require("vm"); // Thư viện lõi Node.js để tạo Context/Realm độc lập

console.log("=== DEMO 1: HÀNH VI PHÂN NHÁNH CỦA HÀM TẠO ARRAY(...) ===");
const byNumber = new Array(3);
const byString = new Array("3");
const byMultiple = new Array(1, 2, 3);

console.log("new Array(3)      :", byNumber, "(length:", byNumber.length, ")");
console.log("new Array('3')    :", byString, "(length:", byString.length, ")");
console.log("new Array(1, 2, 3):", byMultiple, "(length:", byMultiple.length, ")");

assert.strictEqual(byNumber.length, 3);
assert.strictEqual(0 in byNumber, false, "Slot của new Array(3) là rỗng!");

assert.deepStrictEqual(byString, ["3"]);
assert.deepStrictEqual(byMultiple, [1, 2, 3]);

// Lỗi RangeError khi truyền số không hợp lệ:
assert.throws(() => new Array(-5), RangeError);
assert.throws(() => new Array(3.14), RangeError);
console.log("-> Kiểm chứng Branching Behavior & RangeError: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: CẠM BẪY MAP() BỎ QUA EMPTY SLOTS ===");
let callbackExecutions = 0;

const holeyResult = new Array(3).map(() => {
  callbackExecutions++;
  return 42;
});

console.log("Số lần callback được gọi trên new Array(3):", callbackExecutions); // 0!
console.log("Kết quả holeyResult                       :", holeyResult);        // [ <3 empty items> ]
assert.strictEqual(callbackExecutions, 0, "Callback hoàn toàn không được gọi trên empty slots!");
assert.strictEqual(0 in holeyResult, false);

// Khắc phục bằng Array.from:
callbackExecutions = 0;
const filledResult = Array.from({ length: 3 }, () => {
  callbackExecutions++;
  return 42;
});
console.log("Số lần callback được gọi với Array.from   :", callbackExecutions); // 3!
console.log("Kết quả filledResult                      :", filledResult);        // [42, 42, 42]
assert.strictEqual(callbackExecutions, 3);
assert.deepStrictEqual(filledResult, [42, 42, 42]);
console.log("-> Kiểm chứng map() trên Empty Slots: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: CẠM BẪY CHIA SẺ THAM CHIẾU VỚI .FILL({}) ===");
const sharedList = new Array(3).fill({});
sharedList[0].data = "CRITICAL_BUG";

console.log("sharedList[0].data:", sharedList[0].data);
console.log("sharedList[1].data:", sharedList[1].data, "(BỊ SỬA LÂY!)");
assert.strictEqual(sharedList[1].data, "CRITICAL_BUG", "Mọi phần tử cùng trỏ chung một Object!");

// Cách khởi tạo chuẩn: Mỗi phần tử là một Object mới độc lập
const independentList = Array.from({ length: 3 }, () => ({}));
independentList[0].data = "SAFE_DATA";
assert.strictEqual(independentList[0].data, "SAFE_DATA");
assert.strictEqual(independentList[1].data, undefined, "Các phần tử hoàn toàn độc lập!");
console.log("-> Kiểm chứng .fill({}) Reference Trap: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: MÔ PHỎNG CROSS-REALM / IFRAME BẰNG NODE.JS VM ===");
// Tạo một Execution Context (Realm) hoàn toàn độc lập với context hiện tại:
const foreignContext = vm.createContext({});
const foreignArray = vm.runInContext("[]", foreignContext);

console.log("foreignArray sinh ra từ Realm khác.");
console.log("foreignArray instanceof Array   :", foreignArray instanceof Array); // false!
console.log("foreignArray.constructor === Array:", foreignArray.constructor === Array); // false!
console.log("Array.isArray(foreignArray)       :", Array.isArray(foreignArray)); // true!

// instanceof và constructor thất bại vì prototype chain trỏ tới Array của foreign Realm:
assert.strictEqual(foreignArray instanceof Array, false);
assert.strictEqual(foreignArray.constructor === Array, false);

// Nhưng Array.isArray() hoạt động hoàn hảo:
assert.strictEqual(Array.isArray(foreignArray), true);
console.log("-> Kiểm chứng Cross-Realm Array.isArray(): Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Array Constructor đã vượt qua thành công! ");
console.log("==========================================");
