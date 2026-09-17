/**
 * 03-operators-demo.js
 * Chạy độc lập: node 03-operators-demo.js
 * Kiểm chứng toàn diện Toán tử & Biểu thức trong JavaScript:
 * 1. Toán tử Bitwise (Ép kiểu về 32-bit Integer, phép bù bit ~, dịch bit không dấu >>>)
 * 2. Ngắn mạch (Short-circuiting): || vs ?? (Falsy vs Nullish)
 * 3. Toán tử gán logic hiện đại (&&=, ||=, ??=)
 * 4. Toán tử dấu phẩy (Comma Operator ,)
 * 5. Toán tử quan hệ (in, instanceof) & Quy tắc BigInt
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 03: OPERATORS & EXPRESSIONS ===");

// -------------------------------------------------------------
// 1. TOÁN TỬ BITWISE & ÉP KIỂU 32-BIT INTEGER (ToInt32)
// -------------------------------------------------------------
// JavaScript lưu số dạng IEEE 754 64-bit float.
// Khi thực hiện toán tử Bitwise (&, |, ^, ~, <<, >>), V8 ép số về 32-bit signed integer.
// - Dịch bit không dấu >>> ép về 32-bit unsigned integer (ToUint32):
assert.equal(-1 >>> 0, 4294967295, "-1 chuyển sang 32-bit unsigned là 2^32 - 1");

// Kỹ thuật phép bù bit (Bitwise NOT ~): ~x tương đương -(x + 1)
// ~(-1) = 0 (falsy) -> dùng kiểm tra indexOf / includes kinh điển:
assert.equal(~(-1), 0);
assert.equal(~0, -1);
assert.equal(~1, -2);

// Cắt phần thập phân nhanh bằng hai dấu ngã (Double Bitwise NOT ~~):
assert.equal(~~4.9, 4);
assert.equal(~~(-4.9), -4); // Khác với Math.floor(-4.9) là -5! Math.trunc() tương đương

// -------------------------------------------------------------
// 2. NGẮN MẠCH: || VS ?? (FALSY VS NULLISH)
// -------------------------------------------------------------
// - || (OR): Trả về vế phải nếu vế trái là FALSY (false, 0, "", null, undefined, NaN)
// - ?? (Nullish Coalescing): CHỈ trả về vế phải nếu vế trái là NULL hoặc UNDEFINED!

const configZero = { port: 0, timeout: null, debug: false, name: "" };

// Cạm bẫy với || khi giá trị hợp lệ là 0 hoặc chuỗi rỗng:
assert.equal(configZero.port || 8080, 8080, "|| coi 0 là falsy nên gán đè 8080 (Bẫy!)");
assert.equal(configZero.debug || true, true, "|| coi false là falsy nên gán đè true (Bẫy!)");

// Giải pháp chuẩn mực với ??:
assert.equal(configZero.port ?? 8080, 0, "?? giữ nguyên giá trị 0");
assert.equal(configZero.debug ?? true, false, "?? giữ nguyên giá trị false");
assert.equal(configZero.name ?? "default_app", "", "?? giữ nguyên chuỗi rỗng");
assert.equal(configZero.timeout ?? 5000, 5000, "?? chỉ fallback khi là null hoặc undefined");

// -------------------------------------------------------------
// 3. TOÁN TỬ GÁN LOGIC HIỆN ĐẠI (&&=, ||=, ??=)
// -------------------------------------------------------------
let userSettings = { theme: null, retries: 0, apiKey: "secret_123" };

// ??= (Assign if Nullish): Chỉ gán nếu biến đang là null hoặc undefined
userSettings.theme ??= "dark";
userSettings.retries ??= 3; // retries là 0 (không nullish) -> KHÔNG gán đè!
assert.equal(userSettings.theme, "dark");
assert.equal(userSettings.retries, 0);

// ||= (Assign if Falsy):
userSettings.retries ||= 5; // retries là 0 (falsy) -> bị gán đè thành 5
assert.equal(userSettings.retries, 5);

// &&= (Assign if Truthy): Chỉ gán nếu đang truthy
userSettings.apiKey &&= "masked_secret";
assert.equal(userSettings.apiKey, "masked_secret");

// -------------------------------------------------------------
// 4. TOÁN TỬ DẤU PHẨY (COMMA OPERATOR ,)
// -------------------------------------------------------------
// Đánh giá tất cả các biểu thức từ trái qua phải và TRẢ VỀ GIÁ TRỊ CỦA BIỂU THỨC CUỐI CÙNG:
let a = 1;
const commaResult = (a++, a + 10, a * 2);
// a++ -> a thành 2
// a + 10 -> 12 (bị bỏ qua)
// a * 2 -> 4 (trả về giá trị này)
assert.equal(commaResult, 4);
assert.equal(a, 2);

// -------------------------------------------------------------
// 5. TOÁN TỬ QUAN HỆ (IN, INSTANCEOF) & BIGINT
// -------------------------------------------------------------
// Toán tử 'in' kiểm tra thuộc tính trong object VÀ CẢ TRONG PROTOTYPE CHAIN:
const emptyObj = {};
assert.equal("toString" in emptyObj, true, "'in' tìm thấy cả thuộc tính trong Object.prototype");
assert.equal(Object.hasOwn(emptyObj, "toString"), false, "hasOwn chỉ kiểm tra thuộc tính riêng");

// Toán tử instanceof kiểm tra Prototype Chain:
class Animal {}
class Dog extends Animal {}
const d = new Dog();
assert.equal(d instanceof Dog, true);
assert.equal(d instanceof Animal, true);
assert.equal(d instanceof Object, true);

// BigInt tuyệt đối không thể tính toán trực tiếp với Number (Bắt buộc ép kiểu):
const big = 100n;
const num = 50;
assert.throws(
  () => big + num,
  TypeError,
  "Cannot mix BigInt and other types"
);
assert.equal(big + BigInt(num), 150n);

console.log("-> 100% tests cho Operators & Expressions đã pass thành công!");
