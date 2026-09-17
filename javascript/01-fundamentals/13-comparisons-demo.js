/**
 * JavaScript Comparisons, Equality & Coercion Demo
 * Thực nghiệm các dị biệt đẳng thức (== vs ===), so sánh chuỗi từ điển, null/undefined, và Object.is().
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: BỘ BA DỊ BIỆT KINH ĐIỂN CỦA NULL & SỐ 0 ===");
// Một trong những câu hỏi phỏng vấn kinh điển nhất của JavaScript:
const nullGtZero = null > 0;   // false (Number(null) -> 0; 0 > 0 là false)
const nullEqZero = null == 0;  // false (Theo spec ECMA-262: null chỉ bằng null/undefined khi dùng ==)
const nullGteZero = null >= 0; // true  (ToNumeric ép null -> 0; 0 >= 0 là true)

console.log("null > 0  :", nullGtZero);
console.log("null == 0 :", nullEqZero);
console.log("null >= 0 :", nullGteZero);

assert.strictEqual(nullGtZero, false);
assert.strictEqual(nullEqZero, false);
assert.strictEqual(nullGteZero, true);
console.log("-> Kiểm chứng Dị biệt null & 0: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: SO SÁNH CHUỖI THEO THỨ TỰ TỪ ĐIỂN (LEXICOGRAPHICAL) ===");
// Cả hai toán hạng là string => So sánh theo mã Unicode ký tự đầu tiên
const strComp1 = "2" > "12";  // true! Vì charCode("2") = 50 > charCode("1") = 49
const strComp2 = "25" < "3";  // true! Vì "2" (50) < "3" (51)

console.log('"2" > "12"  :', strComp1);
console.log('"25" < "3"  :', strComp2);
assert.strictEqual(strComp1, true);
assert.strictEqual(strComp2, true);

// Khi một trong 2 là number => Ép kiểu sang số học:
assert.strictEqual("2" > 12, false);
assert.strictEqual(Number("25") < Number("3"), false);
console.log("-> Kiểm chứng Lexicographical String Comparison: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: DỊ BIỆT CỦA NAN & CÁCH KIỂM TRA CHUẨN ===");
assert.strictEqual(NaN === NaN, false);
assert.strictEqual(NaN == NaN, false);

// Bẫy isNaN vs Number.isNaN
assert.strictEqual(isNaN("hello"), true);           // Ép "hello" -> NaN rồi kiểm tra
assert.strictEqual(Number.isNaN("hello"), false);    // Kiểm tra nghiêm ngặt kiểu number trước
assert.strictEqual(Number.isNaN(NaN), true);

console.log("isNaN('hello'):", isNaN("hello"), "(Bẫy do tự ép kiểu)");
console.log("Number.isNaN('hello'):", Number.isNaN("hello"), "(Chuẩn ES6 an toàn)");
console.log("-> Kiểm chứng NaN Comparison: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: ĐẲNG THỨC TUYỆT ĐỐI (OBJECT.IS VS STRICT EQUALITY) ===");
// Object.is xử lý đúng 2 trường hợp mà === xử lý sai:
assert.strictEqual(+0 === -0, true);
assert.strictEqual(Object.is(+0, -0), false); // Nhận diện được hướng dấu của số 0!

assert.strictEqual(NaN === NaN, false);
assert.strictEqual(Object.is(NaN, NaN), true); // Nhận diện được NaN!

console.log("+0 === -0               :", +0 === -0);
console.log("Object.is(+0, -0)        :", Object.is(+0, -0));
console.log("Object.is(NaN, NaN)      :", Object.is(NaN, NaN));
console.log("-> Kiểm chứng Object.is(): Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: BẪY COERCION VỚI MẢNG & BOOLEAN TRONG == ===");
// ToPrimitive và ToNumber
assert.strictEqual([] == false, true);    // [] -> "" -> 0; false -> 0 => 0 == 0
assert.strictEqual([0] == false, true);   // [0] -> "0" -> 0; false -> 0 => 0 == 0
assert.strictEqual([1] == true, true);    // [1] -> "1" -> 1; true -> 1 => 1 == 1
assert.strictEqual([1, 2] == "1,2", true); // [1, 2].toString() -> "1,2"

// Reference equality (so sánh địa chỉ ô nhớ)
assert.strictEqual({} === {}, false);
assert.strictEqual([] === [], false);
const refA = {};
const refB = refA;
assert.strictEqual(refA === refB, true);

console.log("[] == false    :", [] == false);
console.log("[0] == false   :", [0] == false);
console.log("[1, 2] == '1,2':", [1, 2] == "1,2");
console.log("-> Kiểm chứng Array Coercion & Reference Equality: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra so sánh đã vượt qua thành công! ");
console.log("==========================================");
