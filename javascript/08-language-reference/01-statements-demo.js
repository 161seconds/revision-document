/**
 * 01-statements-demo.js
 * Chạy độc lập: node 01-statements-demo.js
 * Kiểm chứng bản chất Statements vs Expressions trong JavaScript:
 * 1. Biểu thức (Expression) vs Câu lệnh (Statement)
 * 2. Giá trị hoàn tất của câu lệnh (Completion Value)
 * 3. Labeled Statements (Nhãn vòng lặp đa tầng)
 * 4. Phạm vi khối lệnh (Block Scope & Shadowing)
 * 5. Cơ chế tự động chèn dấu chấm phẩy (ASI - Automatic Semicolon Insertion)
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 01: STATEMENTS & DECLARATIONS ===");

// -------------------------------------------------------------
// 1. EXPRESSION VS STATEMENT
// -------------------------------------------------------------
// - Biểu thức (Expression): Luôn đánh giá ra một giá trị (Value). Có thể gán vào biến.
// - Câu lệnh (Statement): Thực hiện một hành động (Action/Instruction). Không thể gán vào biến!

const exprResult = 5 + 10 * 2; // "5 + 10 * 2" là expression -> 25
assert.equal(exprResult, 25);

// "let x = 10;" là statement.
// Cú pháp: "const a = (let x = 10);" -> SyntaxError!

// Function Declaration (Statement) vs Function Expression (Expression)
// Function Expression có thể tự kích hoạt ngay (IIFE) hoặc gán vào biến:
const inlineAdd = function (a, b) {
  return a + b;
};
assert.equal(inlineAdd(3, 4), 7);

// -------------------------------------------------------------
// 2. GIÁ TRỊ HOÀN TẤT CỦA CÂU LỆNH (COMPLETION RECORD)
// -------------------------------------------------------------
// Theo đặc tả ECMAScript, mọi Statement đều trả về một Completion Record:
// { [[Type]]: normal | break | continue | return | throw, [[Value]]: empty | value, [[Target]]: empty | string }
// eval() phản ánh chính xác [[Value]] của câu lệnh cuối cùng:

const evalStmtVal = eval("var a = 10; if (true) { 42; }");
assert.equal(evalStmtVal, 42, "Completion value của khối if là 42");

const evalLoopVal = eval("var sum = 0; for (var i = 1; i <= 3; i++) { sum += i; }");
assert.equal(evalLoopVal, 6, "Completion value của vòng lặp for");

// -------------------------------------------------------------
// 3. LABELED STATEMENTS (NHÃN VÒNG LẶP ĐA TẦNG)
// -------------------------------------------------------------
// Dùng nhãn (label:) để break hoặc continue trực tiếp vòng lặp cha từ bên trong vòng lặp con:
function findMatrixTarget(matrix, target) {
  let foundCoord = null;
  let iterations = 0;

  outerLoop: for (let r = 0; r < matrix.length; r++) {
    innerLoop: for (let c = 0; c < matrix[r].length; c++) {
      iterations++;
      if (matrix[r][c] === target) {
        foundCoord = { r, c };
        break outerLoop; // Thoát ngay lập tức khỏi cả 2 vòng lặp!
      }
    }
  }

  return { foundCoord, iterations };
}

const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

// Tìm số 5: outerLoop dừng ngay tại r=1, c=1 (sau 5 iterations thay vì duyệt hết 9)
const searchRes = findMatrixTarget(matrix, 5);
assert.deepEqual(searchRes.foundCoord, { r: 1, c: 1 });
assert.equal(searchRes.iterations, 5, "Nhãn break outerLoop đã thoát sớm chuẩn xác");

// -------------------------------------------------------------
// 4. BLOCK SCOPE & SHADOWING
// -------------------------------------------------------------
let globalScopeVar = "OUTER";
{
  // Block statement tạo Lexical Scope mới cho let/const
  let globalScopeVar = "INNER"; // Shadowing
  assert.equal(globalScopeVar, "INNER");
}
assert.equal(globalScopeVar, "OUTER", "Biến ngoài không bị biến trong đè");

// -------------------------------------------------------------
// 5. CƠ CHẾ ASI (AUTOMATIC SEMICOLON INSERTION) TRAP
// -------------------------------------------------------------
function testAsiReturn() {
  return; // ASI tự động chèn dấu chấm phẩy ở đây!
  {
    status: "ok";
  }
}

function testCorrectReturn() {
  return {
    status: "ok",
  };
}

assert.equal(testAsiReturn(), undefined, "return xuống dòng trả về undefined do ASI");
assert.deepEqual(testCorrectReturn(), { status: "ok" });

console.log("-> 100% tests cho Statements & Declarations đã pass thành công!");
