/**
 * JavaScript const Arrays & Immutability Demo
 * Thực nghiệm tính bất biến của tham chiếu const, cạm bẫy mutate, Block Scope Shadowing,
 * Object.freeze nông, và hàm deepFreeze đệ quy an toàn.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: THAM CHIẾU CONST BẤT BIẾN VS NỘI DUNG MUTABLE ===");
const numbers = [1, 2, 3];

// 1. Thao tác thay đổi nội dung mảng HOÀN TOÀN HỢP LỆ:
numbers.push(4);
numbers[0] = 99;
numbers.length = 2; // [99, 2]

console.log("numbers sau khi mutate nội dung:", numbers);
assert.deepStrictEqual(numbers, [99, 2]);

// 2. Gán lại biến sang ô nhớ khác BỊ CẤM TUYỆT ĐỐI (Ném TypeError):
assert.throws(() => {
  // @ts-ignore
  numbers = [10, 20];
}, TypeError);
console.log("Gán lại biến const numbers = [...] ném TypeError đúng chuẩn.");
console.log("-> Kiểm chứng const Binding: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: BLOCK SCOPE & VARIABLE SHADOWING VỚI CONST ===");
const globalArray = ["Global_1", "Global_2"];

{
  // Che bóng (Shadowing) trong scope con độc lập:
  const globalArray = ["Inner_A", "Inner_B"];
  assert.deepStrictEqual(globalArray, ["Inner_A", "Inner_B"]);
  console.log("globalArray trong block con:", globalArray);
}

// Bên ngoài block con, mảng gốc được bảo toàn nguyên vẹn:
assert.deepStrictEqual(globalArray, ["Global_1", "Global_2"]);
console.log("globalArray ngoài block cha:", globalArray);
console.log("-> Kiểm chứng Block Scope Shadowing: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: ĐÓNG BĂNG NÔNG VỚI OBJECT.FREEZE() ===");
const frozenArray = Object.freeze(["red", "green", "blue"]);

// 1. Thử sửa phần tử trong Strict Mode -> Ném TypeError:
assert.throws(() => {
  frozenArray[0] = "yellow";
}, TypeError);

// 2. Thử gọi push trên frozen array -> Ném TypeError:
assert.throws(() => {
  frozenArray.push("purple");
}, TypeError);

// 3. Thử đổi length -> Ném TypeError:
assert.throws(() => {
  frozenArray.length = 0;
}, TypeError);

console.log("frozenArray được bảo vệ cấp 1 (Không thể push, sửa, đổi length).");
console.log("-> Kiểm chứng Object.freeze() nông: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: CẠM BẪY SHALLOW FREEZE & GIẢI PHÁP DEEPFREEZE() ===");
// Bẫy: Object lồng bên trong mảng Object.freeze() vẫn bị sửa:
const shallowList = Object.freeze([
  { id: 1, name: "Alice" }
]);

shallowList[0].name = "HACKED_NAME"; // VẪN CHẠY ĐƯỢC!
assert.strictEqual(shallowList[0].name, "HACKED_NAME");
console.log("shallowList[0].name bị sửa thành công (Hạn chế của freeze nông):", shallowList[0].name);

// Giải pháp: Hàm deepFreeze đệ quy toàn bộ cấu trúc:
function deepFreeze(obj) {
  // Lấy tất cả thuộc tính của object:
  const propNames = Object.getOwnPropertyNames(obj);

  // Đóng băng đệ quy các thuộc tính con nếu là object:
  for (const name of propNames) {
    const value = obj[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }

  return Object.freeze(obj);
}

const safeList = deepFreeze([
  { id: 2, profile: { theme: "dark" } }
]);

// Giờ đây, mọi cấp độ lồng nhau đều được bảo vệ nghiêm ngặt:
assert.throws(() => {
  safeList[0].profile.theme = "light";
}, TypeError);

assert.strictEqual(safeList[0].profile.theme, "dark");
console.log("safeList[0].profile.theme được bảo toàn vĩnh viễn:", safeList[0].profile.theme);
console.log("-> Kiểm chứng deepFreeze đệ quy: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: KIỂM TRA BẮT BUỘC KHỞI TẠO & TÁI KHAI BÁO CÙNG SCOPE ===");
// 1. const bắt buộc khởi tạo -> ném SyntaxError nếu thiếu:
assert.throws(() => {
  new Function("const brokenArray;");
}, SyntaxError);
console.log("Khai báo const không khởi tạo ném SyntaxError đúng chuẩn.");

// 2. Tái khai báo const trong cùng scope -> ném SyntaxError:
assert.throws(() => {
  new Function("const list = [1]; const list = [2];");
}, SyntaxError);
console.log("Tái khai báo const trong cùng scope ném SyntaxError đúng chuẩn.");
console.log("-> Kiểm chứng cú pháp ES6 const Array: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra const Array đã vượt qua thành công! ");
console.log("==========================================");
