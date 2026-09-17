/**
 * 02-reserved-words-demo.js
 * Chạy độc lập: node 02-reserved-words-demo.js
 * Kiểm chứng kiến trúc Từ khóa Dự trữ & Tên Định danh trong JavaScript:
 * 1. Tập hợp từ khóa cấm (Reserved Words)
 * 2. Từ khóa theo ngữ cảnh (Contextual Keywords: await, yield, of, using)
 * 3. Hạn chế trong Chế độ Nghiêm ngặt (Strict Mode: eval, arguments, let, static)
 * 4. Sử dụng từ khóa làm thuộc tính Object (Object Property Names hợp lệ)
 * 5. Bộ kiểm tra quy tắc đặt tên định danh hợp lệ (Identifier Validation Engine)
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 02: RESERVED WORDS & IDENTIFIERS ===");

// -------------------------------------------------------------
// 1. OBJECT PROPERTY NAMES CHO PHÉP TỪ KHÓA DỰ TRỮ (ES5+)
// -------------------------------------------------------------
// Trong ES3 cũ, đặt key là từ khóa sẽ lỗi. Từ ES5+, Property Name có thể là bất kỳ chuỗi nào,
// kể cả các từ khóa như 'class', 'delete', 'default', 'return':
const enterpriseConfig = {
  class: "PrimaryTheme",
  delete: false,
  default: 100,
  return: true,
};

assert.equal(enterpriseConfig.class, "PrimaryTheme");
assert.equal(enterpriseConfig.delete, false);
assert.equal(enterpriseConfig.default, 100);
assert.equal(enterpriseConfig["return"], true);

// -------------------------------------------------------------
// 2. TỪ KHÓA NGỮ CẢNH (CONTEXTUAL KEYWORDS)
// -------------------------------------------------------------
// Một số từ chỉ là từ khóa trong một số ngữ cảnh nhất định:
// 'of' trong for..of:
const list = ["a", "b"];
let of = "test_identifier"; // 'of' hoàn toàn có thể dùng làm tên biến!
assert.equal(of, "test_identifier");

for (const item of list) {
  // 'of' ở đây là contextual keyword
  assert.equal(typeof item, "string");
}

// 'await' là reserved keyword trong ES Module hoặc Async Function:
async function testAsyncContext() {
  const p = Promise.resolve("done");
  const res = await p; // 'await' là từ khóa
  return res;
}
const asyncRes = await testAsyncContext();
assert.equal(asyncRes, "done");

// -------------------------------------------------------------
// 3. THUẬT TOÁN KIỂM TRA TÊN ĐỊNH DANH HỢP LỆ (IDENTIFIER VALIDATION)
// -------------------------------------------------------------
const RESERVED_KEYWORDS = new Set([
  "break", "case", "catch", "class", "const", "continue", "debugger", "default",
  "delete", "do", "else", "export", "extends", "finally", "for", "function",
  "if", "import", "in", "instanceof", "new", "return", "super", "switch",
  "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield",
  "enum", "null", "true", "false",
]);

const STRICT_MODE_RESERVED = new Set([
  "implements", "interface", "let", "package", "private", "protected", "public", "static", "yield"
]);

function isValidIdentifier(name, isStrictMode = true) {
  if (!name || typeof name !== "string") return false;

  // Không được là từ khóa dự trữ
  if (RESERVED_KEYWORDS.has(name)) return false;
  if (isStrictMode && STRICT_MODE_RESERVED.has(name)) return false;
  if (isStrictMode && (name === "eval" || name === "arguments")) return false;

  // Quy tắc ký tự: Bắt đầu bằng chữ cái, $, _ (không bắt đầu bằng số)
  // Các ký tự tiếp theo có thể chứa số
  const identifierRegex = /^[$_\p{ID_Start}][$_\p{ID_Continue}]*$/u;
  return identifierRegex.test(name);
}

// Kiểm thử các định danh hợp lệ
assert.equal(isValidIdentifier("userName"), true);
assert.equal(isValidIdentifier("$amount"), true);
assert.equal(isValidIdentifier("_privateKey"), true);
assert.equal(isValidIdentifier("tên_biến_tiếng_việt"), true, "Hỗ trợ Unicode Identifier");

// Kiểm thử các định danh không hợp lệ
assert.equal(isValidIdentifier("1stNumber"), false, "Không được bắt đầu bằng số");
assert.equal(isValidIdentifier("user-name"), false, "Không được chứa dấu gạch ngang");
assert.equal(isValidIdentifier("class"), false, "Từ khóa cấm: class");
assert.equal(isValidIdentifier("delete"), false, "Từ khóa cấm: delete");
assert.equal(isValidIdentifier("static", true), false, "Từ khóa strict mode: static");
assert.equal(isValidIdentifier("eval", true), false, "Không được đặt tên biến là eval trong strict mode");

// -------------------------------------------------------------
// 4. HIỆN TƯỢNG SHADOWING BIẾN TOÀN CỤC NGUY HIỂM
// -------------------------------------------------------------
// 'undefined' trong JavaScript thực chất là một thuộc tính của global object,
// không phải từ khóa reserved tuyệt đối (dù trong strict mode hiện đại không gán đè được window.undefined):
function testShadowing() {
  const undefined = "đã bị đè!"; // Cực kỳ nguy hiểm nếu code cũ dùng `x === undefined`
  assert.equal(undefined, "đã bị đè!");
}
testShadowing();

// Giải pháp phòng thủ: Luôn kiểm tra bằng `typeof x === 'undefined'` hoặc `void 0`
assert.equal(void 0, undefined);

console.log("-> 100% tests cho Reserved Words & Identifiers đã pass thành công!");
