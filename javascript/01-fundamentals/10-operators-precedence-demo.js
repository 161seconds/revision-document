/**
 * 10-operators-precedence-demo.js
 * Minh họa hoạt động của các toán tử, thứ tự ưu tiên, short-circuit và toán tử logic mới
 * Chạy bằng: node 10-operators-precedence-demo.js
 */

const assert = require("assert");

console.log("=== 1. PREFIX (++x) VS POSTFIX (x++) ===");
let x = 5;
const postfix = x++; // Trả về 5 trước, rồi x mới thành 6
assert.strictEqual(postfix, 5);
assert.strictEqual(x, 6);

let y = 5;
const prefix = ++y; // y tăng lên 6 trước, rồi mới trả về 6
assert.strictEqual(prefix, 6);
assert.strictEqual(y, 6);
console.log("✅ Prefix và Postfix tăng giảm chính xác!");

console.log("\n=== 2. CẠM BẪY NỐI CHUỖI VS PHÉP TÍNH SỐ HỌC ===");
assert.strictEqual(10 + 20 + "px", "30px");
assert.strictEqual("px" + 10 + 20, "px1020");
assert.strictEqual("10" - 2, 8);
assert.strictEqual("10" * "2", 20);
console.log("✅ Đã kiểm chứng quy tắc ép kiểu ngầm với + và -/*");

console.log("\n=== 3. SHORT-CIRCUIT: TOÁN HẠNG NÀO QUYẾT ĐỊNH KẾT QUẢ? ===");
// A && B trả về toán hạng quyết định
assert.strictEqual(null && "Hello", null);
assert.strictEqual("Admin" && "Active", "Active");

// A || B trả về toán hạng Truthy đầu tiên
assert.strictEqual("Hello" || "World", "Hello");
assert.strictEqual("" || "Default", "Default");
console.log("✅ Short-circuit evaluation hoạt động đúng thiết kế!");

console.log("\n=== 4. PHÂN BIỆT SỐNG CÒN: NULLISH COALESCING (??) VS OR (||) ===");
const config = {
  timeout: 0,
  port: null
};

// Với ||: 0 bị coi là Falsy -> Bị ghi đè sai lệch!
const timeoutWithOR = config.timeout || 30;
assert.strictEqual(timeoutWithOR, 30);

// Với ??: 0 là giá trị hợp lệ -> Giữ nguyên chính xác!
const timeoutWithNullish = config.timeout ?? 30;
assert.strictEqual(timeoutWithNullish, 0);

// port là null -> Cả hai đều gán giá trị mặc định
const port = config.port ?? 8080;
assert.strictEqual(port, 8080);
console.log("✅ ?? bảo vệ giá trị 0 và chuỗi rỗng thành công!");

console.log("\n=== 5. TOÁN TỬ GÁN LOGIC HIỆN ĐẠI (??=, ||=) ===");
const user = { name: "Alice", count: 0 };
user.name ??= "Guest"; // name đã có -> không đổi
user.count ??= 10;     // count là 0 (không phải nullish) -> không đổi
user.role ??= "User";  // role là undefined -> gán 'User'

assert.strictEqual(user.name, "Alice");
assert.strictEqual(user.count, 0);
assert.strictEqual(user.role, "User");
console.log("user sau khi dùng ??=:", user);

console.log("\n=== 6. CHIỀU KẾT HỢP PHẢI-SANG-TRÁI CỦA LŨY THỪA (**) ===");
// 2 ** 2 ** 3 = 2 ** (2 ** 3) = 2 ** 8 = 256
const expResult = 2 ** 2 ** 3;
assert.strictEqual(expResult, 256);
console.log("2 ** 2 ** 3 =", expResult);

console.log("\n🎉 Đã kiểm chứng toàn diện toàn bộ toán tử trong JavaScript!");
