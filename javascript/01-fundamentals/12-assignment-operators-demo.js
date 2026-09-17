/**
 * JavaScript Assignment Operators & Short-Circuit Assignment Demo
 * Thực nghiệm các toán tử gán, tính kết hợp phải-sang-trái, và ES2021 Logical Assignment.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: CHUỖI GÁN & TÍNH KẾT HỢP PHẢI-SANG-TRÁI ===");
let a, b, c;
a = b = c = 100;

console.log("a =", a, "| b =", b, "| c =", c);
assert.strictEqual(a, 100);
assert.strictEqual(b, 100);
assert.strictEqual(c, 100);
console.log("-> Kiểm chứng Chained Assignment: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: TOÁN TỬ GÁN KẾT HỢP SỐ HỌC ===");
let num = 10;
num += 5;  // 15
num *= 2;  // 30
num -= 10; // 20
num /= 4;  // 5
num %= 3;  // 2
num **= 3; // 8 (2^3)

console.log("Kết quả sau chuỗi phép toán số học:", num);
assert.strictEqual(num, 8);

// Cạm bẫy nối chuỗi với +=
let text = "Score: ";
text += 100;
console.log("text += 100 =>", text, "(kiểu:", typeof text, ")");
assert.strictEqual(text, "Score: 100");
console.log("-> Kiểm chứng Arithmetic Assignment: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: TOÁN TỬ GÁN LOGIC (ES2021) - CẠM BẪY ||= VS ??= ===");
const config = {
  timeout: 0,       // 0 giây (hợp lệ - không timeout)
  enabled: false,   // Tắt (hợp lệ)
  prefix: "",       // Tiền tố rỗng (hợp lệ)
  title: null,      // Chưa có tiêu đề
  theme: undefined, // Chưa có theme
};

// Sử dụng ||= (Gặp bẫy vì 0, false, "" đều là Falsy)
let timeoutOr = config.timeout;
timeoutOr ||= 3000; // BỊ ĐÈ!

let enabledOr = config.enabled;
enabledOr ||= true; // BỊ ĐÈ!

let prefixOr = config.prefix;
prefixOr ||= "app_"; // BỊ ĐÈ!

console.log("Kết quả ||= đối với 0, false, \"\":");
console.log("timeoutOr:", timeoutOr, "| enabledOr:", enabledOr, "| prefixOr:", prefixOr);
assert.strictEqual(timeoutOr, 3000);
assert.strictEqual(enabledOr, true);
assert.strictEqual(prefixOr, "app_");

// Sử dụng ??= (An toàn tuyệt đối cho default configs)
let timeoutNullish = config.timeout;
timeoutNullish ??= 3000; // Giữ nguyên 0!

let enabledNullish = config.enabled;
enabledNullish ??= true; // Giữ nguyên false!

let prefixNullish = config.prefix;
prefixNullish ??= "app_"; // Giữ nguyên ""!

let titleNullish = config.title;
titleNullish ??= "Default Title"; // Được gán vì là null!

let themeNullish = config.theme;
themeNullish ??= "dark"; // Được gán vì là undefined!

console.log("\nKết quả ??= (Nullish Coalescing Assignment):");
console.log("timeout:", timeoutNullish, "| enabled:", enabledNullish, "| prefix:", `"${prefixNullish}"`);
console.log("title:", titleNullish, "| theme:", themeNullish);

assert.strictEqual(timeoutNullish, 0);
assert.strictEqual(enabledNullish, false);
assert.strictEqual(prefixNullish, "");
assert.strictEqual(titleNullish, "Default Title");
assert.strictEqual(themeNullish, "dark");
console.log("-> Kiểm chứng bẫy ||= vs ??=: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: TOÁN TỬ GÁN LOGICAL AND (&&=) ===");
let activeUser = { id: 1, name: "Antigravity" };
let guestUser = null;

// &&= chỉ gán nếu toán hạng trái là Truthy
activeUser &&= activeUser.name;
guestUser &&= guestUser.name;

console.log("activeUser sau &&=:", activeUser);
console.log("guestUser sau &&=:", guestUser);
assert.strictEqual(activeUser, "Antigravity");
assert.strictEqual(guestUser, null);
console.log("-> Kiểm chứng &&=: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: CƠ CHẾ UNDER-THE-HOOD: SHORT-CIRCUIT TRÁNH GỌI SETTER ===");
let setterCallCount = 0;

const reactiveObj = {
  _val: "Initial Data",
  get val() {
    return this._val;
  },
  set val(newVal) {
    setterCallCount++;
    console.log(`[Setter Triggered] Lần thứ ${setterCallCount}: Gán giá trị mới '${newVal}'`);
    this._val = newVal;
  }
};

console.log("--- Thí nghiệm 1: Gán theo kiểu cũ (obj.val = obj.val ?? 'Fallback') ---");
setterCallCount = 0;
reactiveObj.val = reactiveObj.val ?? "Fallback";
console.log("Số lần setter bị kích hoạt:", setterCallCount);
assert.strictEqual(setterCallCount, 1, "Cách cũ LUÔN gọi setter dù giá trị không null/undefined!");

console.log("\n--- Thí nghiệm 2: Gán theo chuẩn ES2021 (obj.val ??= 'Fallback') ---");
setterCallCount = 0;
reactiveObj.val ??= "Fallback";
console.log("Số lần setter bị kích hoạt:", setterCallCount);
assert.strictEqual(setterCallCount, 0, "Toán tử ??= ngắn mạch thành công, KHÔNG gọi setter!");
console.log("-> Kiểm chứng Short-circuit Setter Avoidance: Hoàn toàn chính xác!\n");

console.log("=== DEMO 6: TOÁN TỬ GÁN BITWISE ===");
let flags = 0b0001; // 1
flags |= 0b0010;    // Bitwise OR: bật cờ thứ 2 => 0b0011 (3)
assert.strictEqual(flags, 3);

flags &= 0b0010;    // Bitwise AND: lọc chỉ giữ cờ thứ 2 => 0b0010 (2)
assert.strictEqual(flags, 2);

flags ^= 0b0011;    // Bitwise XOR: đảo cờ => 0b0001 (1)
assert.strictEqual(flags, 1);

flags <<= 2;        // Shift left: 1 * 4 => 4
assert.strictEqual(flags, 4);
console.log("Kết quả thao tác bitwise compound:", flags);
console.log("-> Kiểm chứng Bitwise Assignment: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra toán tử gán đã vượt qua thành công! ");
console.log("==========================================");
