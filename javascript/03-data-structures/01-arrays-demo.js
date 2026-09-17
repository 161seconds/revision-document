/**
 * JavaScript Arrays Fundamentals Demo
 * Thực nghiệm Packed vs Holey Elements, cạm bẫy toán tử delete, kiểm chứng lỗ rỗng (Holes), và thao tác length.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: NHẬN DIỆN MẢNG (ARRAY.ISARRAY VS TYPEOF) ===");
const sampleArray = [1, 2, 3];
console.log("typeof sampleArray       :", typeof sampleArray);       // "object" (Không an toàn)
console.log("Array.isArray(sampleArray):", Array.isArray(sampleArray)); // true (Chuẩn xác)

assert.strictEqual(typeof sampleArray, "object");
assert.strictEqual(Array.isArray(sampleArray), true);
assert.strictEqual(Array.isArray({}), false);
console.log("-> Kiểm chứng Type Identification: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: CẠM BẪY TOÁN TỬ DELETE TRÊN MẢNG ===");
const colors = ["red", "green", "blue"];
console.log("Mảng ban đầu (length = 3):", colors);

// Dùng delete để xoá phần tử index 1 ("green"):
delete colors[1];

console.log("Mảng sau khi gọi 'delete colors[1]':", colors);
console.log("colors.length sau khi delete      :", colors.length); // VẪN LÀ 3!
console.log("colors[1]                          :", colors[1]);      // undefined
console.log("Kiểm tra '1 in colors'             :", 1 in colors);    // false (Lỗ hổng Hole!)

assert.strictEqual(colors.length, 3, "delete KHÔNG làm giảm length!");
assert.strictEqual(colors[1], undefined);
assert.strictEqual(1 in colors, false, "Thuộc tính index 1 không còn tồn tại!");

// Cách xóa chuẩn mực bằng splice:
const validList = ["red", "green", "blue"];
validList.splice(1, 1); // Xóa 1 phần tử tại vị trí 1
assert.strictEqual(validList.length, 2);
assert.deepStrictEqual(validList, ["red", "blue"]);
console.log("validList sau khi gọi splice(1, 1):", validList);
console.log("-> Kiểm chứng delete vs splice: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: LỖ HỔNG (HOLES) VS GIÁ TRỊ UNDEFINED XÁC ĐỊNH ===");
const holeyArray = new Array(1); // Mảng có 1 slot rỗng
const definedArray = [undefined]; // Mảng có 1 phần tử chứa undefined

console.log("holeyArray[0]   :", holeyArray[0]);   // undefined
console.log("definedArray[0] :", definedArray[0]); // undefined

// Nhưng khi dùng toán tử 'in' để kiểm tra sự tồn tại của key trong Object:
assert.strictEqual(0 in holeyArray, false, "Slot rỗng không có key trong object!");
assert.strictEqual(0 in definedArray, true, "Key 0 có tồn tại với giá trị undefined!");
console.log("0 in holeyArray  :", 0 in holeyArray);
console.log("0 in definedArray:", 0 in definedArray);
console.log("-> Kiểm chứng Holey vs Defined Array: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: KHỞI TẠO BẰNG ARRAY.OF() VÀ ARRAY.FROM() ===");
// Bẫy cú pháp của new Array:
const weird1 = new Array(3);    // [ <3 empty items> ]
const weird2 = new Array(3, 4); // [ 3, 4 ]
assert.strictEqual(weird1.length, 3);
assert.strictEqual(0 in weird1, false);
assert.deepStrictEqual(weird2, [3, 4]);

// Chuẩn ES6 nhất quán: Array.of()
const safeArr = Array.of(3);
assert.deepStrictEqual(safeArr, [3]);
assert.strictEqual(safeArr.length, 1);

// Khởi tạo mảng có giá trị tính toán bằng Array.from():
const generated = Array.from({ length: 4 }, (_, index) => index * 10);
console.log("Array.from({ length: 4 }, ...):", generated);
assert.deepStrictEqual(generated, [0, 10, 20, 30]);
console.log("-> Kiểm chứng Array.of & Array.from: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: CẮT NGẮN & DỌN MẢNG BẰNG THUỘC TÍNH LENGTH ===");
const buffer = [10, 20, 30, 40, 50];
const bufferAlias = buffer; // Tham chiếu thứ hai

// 1. Cắt ngắn mảng (Truncate):
buffer.length = 3;
assert.deepStrictEqual(buffer, [10, 20, 30]);
console.log("buffer sau khi gán length = 3:", buffer);

// 2. Dọn sạch mảng in-place (Clear Array):
buffer.length = 0;
assert.deepStrictEqual(buffer, []);
assert.deepStrictEqual(bufferAlias, [], "Mọi biến tham chiếu đều thấy mảng rỗng!");
console.log("buffer sau khi gán length = 0:", buffer);
console.log("bufferAlias                  :", bufferAlias);
console.log("-> Kiểm chứng Thao tác length: Hoàn toàn chính xác!\n");

console.log("=== DEMO 6: CHỈ SỐ ÂM HIỆN ĐẠI VỚI ARR.AT() (ES2022) ===");
const items = ["first", "middle", "last"];
assert.strictEqual(items.at(-1), "last");
assert.strictEqual(items.at(-2), "middle");
assert.strictEqual(items.at(0), "first");
console.log("items.at(-1):", items.at(-1));
console.log("items.at(-2):", items.at(-2));
console.log("-> Kiểm chứng arr.at(): Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra mảng cơ bản đã vượt qua thành công! ");
console.log("==========================================");
