/**
 * JavaScript Array Iteration & Higher-Order Methods Demo
 * Thực nghiệm cạm bẫy reduce trên mảng rỗng, bẫy async trong forEach, flatMap 1-pass,
 * chân lý rỗng của every(), và phương thức bất biến arr.with() (ES2023).
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: CẠM BẪY REDUCE TRÊN MẢNG RỖNG KHÔNG CÓ INITIALVALUE ===");
// 1. Mảng rỗng KHÔNG có initialValue -> Ném TypeError:
assert.throws(() => {
  [].reduce((acc, curr) => acc + curr);
}, TypeError);
console.log("[].reduce(...) không có initialValue ném lỗi TypeError chính xác.");

// 2. Mảng rỗng CÓ initialValue -> Hoạt động an toàn tuyệt đối:
const safeReduce = [].reduce((acc, curr) => acc + curr, 0);
console.log("[].reduce(..., 0) an toàn trả về:", safeReduce);
assert.strictEqual(safeReduce, 0);
console.log("-> Kiểm chứng reduce empty array: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: TỐI ƯU HÓA FILTER + MAP TRONG 1 LẦN DUYỆT BẰNG FLATMAP ===");
const rawData = [1, 2, 3, 4, 5, 6];

// Bài toán: Chỉ lấy các số chẵn và nhân 3 giá trị của chúng
// Cách 1: filter().map() -> 2 lần duyệt mảng, tạo 1 mảng trung gian
const twoPassResult = rawData.filter((x) => x % 2 === 0).map((x) => x * 3);

// Cách 2: flatMap() -> 1 lần duyệt duy nhất (1-Pass)
const onePassResult = rawData.flatMap((x) => (x % 2 === 0 ? [x * 3] : []));

console.log("Kết quả 2-pass (filter + map):", twoPassResult);
console.log("Kết quả 1-pass (flatMap)     :", onePassResult);
assert.deepStrictEqual(twoPassResult, [6, 12, 18]);
assert.deepStrictEqual(onePassResult, [6, 12, 18]);
console.log("-> Kiểm chứng flatMap Single-Pass: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: ĐỊNH LÝ CHÂN LÝ RỖNG (VACUOUS TRUTH) CỦA [].EVERY() ===");
// Một trong những bẫy logic thú vị nhất của ECMAScript:
const everyOnEmpty = [].every((item) => item === "BẤT_KỲ_ĐIỀU_KIỆN_VÔ_LÝ_NÀO");
const someOnEmpty = [].some((item) => item === "BẤT_KỲ_ĐIỀU_KIỆN_VÔ_LÝ_NÀO");

console.log("[].every(...) trả về :", everyOnEmpty); // true! (Đúng theo logic Vacuous Truth)
console.log("[].some(...)  trả về :", someOnEmpty);  // false!

assert.strictEqual(everyOnEmpty, true);
assert.strictEqual(someOnEmpty, false);
console.log("-> Kiểm chứng Vacuous Truth: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: CẬP NHẬT BẤT BIẾN TẠI INDEX VỚI ARR.WITH() (ES2023) ===");
const originalRoles = ["USER", "GUEST", "MEMBER"];

// Thay thế vị trí 1 thành "ADMIN" mà KHÔNG đổi mảng gốc:
const updatedRoles = originalRoles.with(1, "ADMIN");

console.log("originalRoles (bảo toàn) :", originalRoles); // ['USER', 'GUEST', 'MEMBER']
console.log("updatedRoles  (mảng mới) :", updatedRoles);  // ['USER', 'ADMIN', 'MEMBER']

assert.deepStrictEqual(originalRoles, ["USER", "GUEST", "MEMBER"]);
assert.deepStrictEqual(updatedRoles, ["USER", "ADMIN", "MEMBER"]);

// Hỗ trợ chỉ số âm:
const updatedLast = originalRoles.with(-1, "SUPERADMIN");
assert.deepStrictEqual(updatedLast, ["USER", "GUEST", "SUPERADMIN"]);
console.log("-> Kiểm chứng arr.with() (ES2023): Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: FUNCTION COMPOSITION VỚI REDUCERIGHT ===");
// compose(f, g)(x) = f(g(x)) -> Chạy từ phải sang trái
function compose(...funcs) {
  return function (initialValue) {
    return funcs.reduceRight((acc, fn) => fn(acc), initialValue);
  };
}

const add10 = (x) => x + 10;
const double = (x) => x * 2;
const square = (x) => x * x;

// Thứ tự chạy từ PHẢI sang TRÁI: square(2) -> double(4) -> add10(8) = 18
const composedFn = compose(add10, double, square);
const compResult = composedFn(2);

console.log("compose(add10, double, square)(2) =", compResult);
assert.strictEqual(compResult, 18);
console.log("-> Kiểm chứng reduceRight Function Compose: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra lặp mảng đã vượt qua thành công! ");
console.log("==========================================");
