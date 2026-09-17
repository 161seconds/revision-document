/**
 * 04-precedence-demo.js
 * Chạy độc lập: node 04-precedence-demo.js
 * Kiểm chứng toàn diện Thứ tự Ưu tiên (Precedence) & Chiều Kết hợp (Associativity):
 * 1. Chiều kết hợp từ phải qua trái (Right-to-Left Associativity) của lũy thừa **
 * 2. Phép gán chuỗi liên hoàn (Chained Assignment: Right-to-Left)
 * 3. Bẫy cú pháp: Cấm trộn lẫn ?? với &&/|| mà không có ngoặc đơn (SyntaxError)
 * 4. Bẫy cú pháp: Cấm toán tử âm đơn vị đi kèm lũy thừa -2 ** 2 (SyntaxError)
 * 5. Phân biệt Thứ tự thực thi (Order of Evaluation) vs Thứ tự ưu tiên (Precedence)
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 04: OPERATOR PRECEDENCE & ASSOCIATIVITY ===");

// -------------------------------------------------------------
// 1. CHIỀU KẾT HỢP TỪ PHẢI QUA TRÁI (RIGHT-TO-LEFT ASSOCIATIVITY)
// -------------------------------------------------------------
// Hầu hết toán tử (+, -, *, /) kết hợp từ TRÁI qua PHẢI:
assert.equal(100 / 10 / 2, 5, "(100 / 10) / 2 = 5");

// Toán tử lũy thừa ** kết hợp từ PHẢI qua TRÁI:
// 2 ** 3 ** 2 = 2 ** (3 ** 2) = 2 ** 9 = 512
// (KHÔNG PHẢI (2 ** 3) ** 2 = 8 ** 2 = 64!)
const expResult = 2 ** 3 ** 2;
assert.equal(expResult, 512, "Lũy thừa thực hiện từ phải qua trái");

// -------------------------------------------------------------
// 2. PHÉP GÁN CHUỖI LIÊN HOÀN (CHAINED ASSIGNMENT)
// -------------------------------------------------------------
// Toán tử gán = kết hợp từ PHẢI qua TRÁI:
let x, y, z;
x = y = z = 42; // z = 42 -> y = 42 -> x = 42
assert.equal(x, 42);
assert.equal(y, 42);
assert.equal(z, 42);

// -------------------------------------------------------------
// 3. BẪY CÚ PHÁP: CẤM TRỘN ?? VỚI && HOẶC || (SYNTAXERROR)
// -------------------------------------------------------------
// Vì sự nhập nhằng về ngữ nghĩa, ECMAScript nghiêm cấm viết:
// "a && b ?? c" hoặc "a || b ?? c"
// Trình biên dịch bắt buộc lập trình viên phải thêm ngoặc đơn () tường minh!

assert.throws(
  () => {
    // eval để kiểm tra SyntaxError trong giai đoạn parse
    eval("const val = true || false ?? 'fallback';");
  },
  SyntaxError,
  "Trộn lẫn ?? và || không ngoặc ném SyntaxError"
);

// Khi có ngoặc đơn tường minh:
const validCoalescing = (true || false) ?? "fallback";
assert.equal(validCoalescing, true);

// -------------------------------------------------------------
// 4. BẪY CÚ PHÁP: TOÁN TỬ ÂM ĐƠN VỊ VỚI LŨY THỪA (-x ** y)
// -------------------------------------------------------------
// "-2 ** 2" là lỗi cú pháp trong JavaScript để tránh tranh cãi toán học:
// (-2)^2 = 4 hay -(2^2) = -4?
assert.throws(
  () => {
    eval("const val = -2 ** 2;");
  },
  SyntaxError,
  "-2 ** 2 ném SyntaxError"
);

// Bắt buộc viết rõ ý định bằng dấu ngoặc đơn:
assert.equal((-2) ** 2, 4, "(-2) ** 2 = 4");
assert.equal(-(2 ** 2), -4, "-(2 ** 2) = -4");

// -------------------------------------------------------------
// 5. THỨ TỰ THỰC THI (EVALUATION ORDER) VS THỨ TỰ ƯU TIÊN (PRECEDENCE)
// -------------------------------------------------------------
// Quy tắc ECMAScript: Các biểu thức con LUÔN LUÔN được đánh giá từ TRÁI QUA PHẢI,
// ngay cả khi toán tử có độ ưu tiên cao hơn nằm ở vế phải!

const callOrder = [];
function logCall(id, value) {
  callOrder.push(id);
  return value;
}

// Biểu thức: logCall("A", 2) + logCall("B", 3) * logCall("C", 4)
// Phép nhân * có độ ưu tiên cao hơn phép cộng +,
// NHƯNG thứ tự gọi hàm đánh giá vẫn là A -> B -> C!
const computed = logCall("A", 2) + logCall("B", 3) * logCall("C", 4);

assert.equal(computed, 14, "2 + (3 * 4) = 14");
assert.deepEqual(callOrder, ["A", "B", "C"], "Biểu thức con luôn đánh giá từ trái qua phải");

console.log("-> 100% tests cho Operator Precedence & Associativity đã pass thành công!");
