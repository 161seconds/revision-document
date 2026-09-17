/**
 * 06-variables-strict-mode-demo.js
 * Minh họa các quy tắc khai báo biến, tính chất của const/let và tác dụng của "use strict"
 * Chạy bằng: node 06-variables-strict-mode-demo.js
 */

"use strict"; // Kích hoạt Strict Mode để bảo vệ toàn bộ file

const assert = require("assert");

console.log("=== 1. KHAI BÁO NHIỀU BIẾN TRÊN 1 DÒNG HỢP LỆ ===");
let firstName = "John",
    lastName = "Doe",
    age = 30;

assert.strictEqual(firstName, "John");
assert.strictEqual(lastName, "Doe");
assert.strictEqual(age, 30);
console.log(`Họ và tên: ${firstName} ${lastName}, Tuổi: ${age}`);

console.log("\n=== 2. BIẾN CHƯA KHỞI TẠO CÓ GIÁ TRỊ UNDEFINED ===");
let unassignedVar;
assert.strictEqual(unassignedVar, undefined);
console.log("unassignedVar tự động nhận giá trị:", unassignedVar);

console.log("\n=== 3. CONST BẢO VỆ ĐỊA CHỈ Ô NHỚ, KHÔNG KHÓA DỮ LIỆU BÊN TRONG ===");
const list = [1, 2, 3];
list.push(4); // OK: Thay đổi mảng
assert.strictEqual(list.length, 4);

assert.throws(
  () => {
    // @ts-ignore
    list = [5, 6]; // Gán lại toàn bộ mảng bị cấm!
  },
  /^TypeError: Assignment to constant variable.$/,
  "Không thể gán lại biến const"
);
console.log("Mảng const sau khi thêm phần tử:", list);

console.log("\n=== 4. STRICT MODE CHẶN RÒ RỈ BIẾN TOÀN CỤC NGẦM ===");
function testGlobalLeak() {
  assert.throws(
    () => {
      // Cố tình gán biến mà không dùng let/const/var trong strict mode
      // @ts-ignore
      leakedVariable = 999;
    },
    /^ReferenceError: leakedVariable is not defined$/,
    "Strict Mode chặn đứng rò rỉ biến ngầm"
  );
}
testGlobalLeak();
console.log("Strict Mode đã ném ReferenceError chính xác khi gán biến chưa khai báo!");

console.log("\n✅ Đã kiểm chứng toàn bộ quy tắc khai báo biến thành công!");
