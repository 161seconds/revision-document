/**
 * JavaScript Silent Errors & Defensive Coding Demo
 * Thực nghiệm các lỗi im lặng, sự lan truyền của NaN, phép chia cho 0,
 * và kỹ thuật phòng thủ bằng Strict Mode, Number.isNaN, Optional Chaining.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: PHÉP CHIA CHO 0 & GIÁ TRỊ VÔ CỰC (INFINITY) ===");
const posInfinity = 10 / 0;
const negInfinity = -10 / 0;

assert.strictEqual(posInfinity, Infinity);
assert.strictEqual(negInfinity, -Infinity);
assert.strictEqual(typeof posInfinity, "number");
assert.strictEqual(Number.isFinite(posInfinity), false);

console.log("10 / 0 âm thầm tạo:", posInfinity);
console.log("-> Kiểm chứng chia cho 0 không ném lỗi: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: SỰ LAN TRUYỀN CỦA NAN (NAN CONTAMINATION) ===");
const corruptInput = "not_a_number";
const parsed = Number(corruptInput); // NaN

// NaN lây lan qua mọi phép tính tiếp theo:
const calculation1 = parsed + 100;
const calculation2 = calculation1 * 2;
assert.strictEqual(Number.isNaN(calculation2), true);

// Cạm bẫy so sánh NaN:
// @ts-ignore
assert.strictEqual(parsed === NaN, false); // NaN KHÔNG BẰNG CHÍNH NÓ!
assert.strictEqual(Number.isNaN(parsed), true); // Cách kiểm tra đúng duy nhất!

console.log("Giá trị ô nhiễm lan truyền:", calculation2);
console.log("-> Kiểm chứng sự lan truyền của NaN: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: PHÉP GÁN TRONG CÂU LỆNH ĐIỀU KIỆN (ASSIGNMENT IN IF) ===");
let statusFlag = false;

function buggyConditionCheck() {
  // Lỗi cố ý: Dùng dấu = thay vì ===
  // @ts-ignore
  if (statusFlag = true) {
    return "CHẠY_DO_PHÉP_GÁN";
  }
  return "KHÔNG_CHẠY";
}

// Hàm trả về "CHẠY_DO_PHÉP_GÁN" và biến statusFlag bị biến đổi ngoài ý muốn:
assert.strictEqual(buggyConditionCheck(), "CHẠY_DO_PHÉP_GÁN");
assert.strictEqual(statusFlag, true); // Biến gốc bị ghi đè!
console.log("statusFlag sau khi bị gán nhầm trong if:", statusFlag);
console.log("-> Kiểm chứng bẫy phép gán trong if: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: TRUY CẬP THUỘC TÍNH UNDEFINED VÀ OPTIONAL CHAINING ===");
const user = { id: 1 };

// Đọc thuộc tính không tồn tại trả về undefined im lặng:
// @ts-ignore
assert.strictEqual(user.address, undefined);

// Đọc cấp sâu hơn ném TypeError nếu không dùng Optional Chaining:
assert.throws(() => {
  // @ts-ignore
  const city = user.address.city;
}, TypeError);

// Phòng thủ bằng Optional Chaining (?.):
// @ts-ignore
const safeCity = user.address?.city;
assert.strictEqual(safeCity, undefined); // Không hề crash ứng dụng!

console.log("-> Kiểm chứng an toàn với Optional Chaining: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: STRICT MODE BIẾN LỖI IM LẶNG THÀNH TYPEERROR ===");
// Trong môi trường "use strict", thao tác gán lên object đóng băng ném TypeError:
const config = Object.freeze({ apiUrl: "https://api.example.com" });

assert.throws(() => {
  // @ts-ignore
  config.apiUrl = "https://hacked.com";
}, TypeError);

// Trong Sloppy Mode (mô phỏng bằng Function không strict), lệnh gán bị lờ đi im lặng:
const sloppyAssignResult = new Function(`
  var obj = Object.freeze({ x: 1 });
  obj.x = 2; // Bị lờ đi âm thầm, không ném lỗi!
  return obj.x;
`)();

assert.strictEqual(sloppyAssignResult, 1); // Vẫn là 1, nhưng không có thông báo lỗi nào!
console.log("Sloppy Mode âm thầm lờ lệnh gán (x vẫn bằng 1):", sloppyAssignResult);
console.log("-> Kiểm chứng Strict Mode chặn đứng lỗi im lặng: Hoàn toàn chính xác!\n");

console.log("=== DEMO 6: LẬP TRÌNH PHÒNG THỦ VỚI NULLISH COALESCING (??) ===");
function getProductStock(count) {
  // Sai lầm: count || 10 (Nếu count = 0 thì 0 là falsy -> nhận 10 sai sót!)
  // Đúng chuẩn: Dùng Nullish Coalescing ?? (chỉ bắt null/undefined):
  return count ?? 10;
}

assert.strictEqual(getProductStock(0), 0); // Bảo toàn đúng số lượng 0
assert.strictEqual(getProductStock(null), 10);
assert.strictEqual(getProductStock(undefined), 10);
console.log("-> Kiểm chứng Nullish Coalescing bảo toàn giá trị 0: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Silent Errors đã vượt qua thành công! ");
console.log("==========================================");
