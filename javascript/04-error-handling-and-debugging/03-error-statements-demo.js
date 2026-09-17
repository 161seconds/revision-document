/**
 * JavaScript Error Statements & Error Chaining Demo
 * Thực nghiệm luồng điều khiển try-catch-finally, cạm bẫy finally return,
 * Optional Catch Binding ES2019, và Error Cause Chaining ES2022.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: THỨ TỰ THỰC THI CHUẨN CỦA TRY - CATCH - FINALLY ===");
const executionLog = [];

function runFlow(triggerError) {
  try {
    executionLog.push("1: TRY_START");
    if (triggerError) {
      throw new Error("LỖI_CỐ_Ý");
    }
    executionLog.push("2: TRY_END");
  } catch (err) {
    executionLog.push("3: CATCH");
  } finally {
    executionLog.push("4: FINALLY");
  }
}

// 1. Trường hợp không lỗi:
runFlow(false);
assert.deepStrictEqual(executionLog, ["1: TRY_START", "2: TRY_END", "4: FINALLY"]);

// 2. Trường hợp có lỗi:
executionLog.length = 0;
runFlow(true);
assert.deepStrictEqual(executionLog, ["1: TRY_START", "3: CATCH", "4: FINALLY"]);

console.log("-> Thứ tự thực thi: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: CẠM BẪY FINALLY GHI ĐÈ RETURN CỦA TRY ===");
function dangerReturn() {
  try {
    return "RESULT_A";
  } finally {
    // Return trong finally ghi đè hoàn toàn giá trị của try!
    return "OVERRIDDEN_B";
  }
}

assert.strictEqual(dangerReturn(), "OVERRIDDEN_B");
console.log("Kết quả bị finally ghi đè:", dangerReturn());
console.log("-> Kiểm chứng bẫy finally override return: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: OPTIONAL CATCH BINDING (ES2019) ===");
let parseSucceeded = false;

try {
  JSON.parse("{ bad-syntax }");
} catch {
  // Không cần khai báo (err) trong ES2019!
  parseSucceeded = false;
}

assert.strictEqual(parseSucceeded, false);
console.log("-> Kiểm chứng Optional Catch Binding ES2019: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: KỸ THUẬT NÉM LẠI LỖI CÓ CHỌN LỌC (RETHROWING PATTERN) ===");
class CustomBusinessError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "CustomBusinessError";
  }
}

function handleErrors(errToThrow) {
  try {
    throw errToThrow;
  } catch (e) {
    if (e instanceof CustomBusinessError) {
      return "ĐÃ_XỬ_LÝ_NGHIỆP_VỤ";
    }
    // Lỗi không xác định: Bắt buộc ném lại!
    throw e;
  }
}

// 1. Lỗi đã biết -> Xử lý êm thấm:
assert.strictEqual(handleErrors(new CustomBusinessError("Lỗi logic")), "ĐÃ_XỬ_LÝ_NGHIỆP_VỤ");

// 2. Lỗi hệ thống -> Ném ra ngoài:
assert.throws(() => {
  handleErrors(new TypeError("Lỗi kiểu hệ thống!"));
}, TypeError);

console.log("-> Kiểm chứng kỹ thuật Rethrowing: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: CHUỖI NGUYÊN NHÂN LỖI ERROR CAUSE CHAINING (ES2022) ===");
function queryDatabase() {
  throw new Error("Connection timed out at 192.168.1.100:5432");
}

function getUserData(userId) {
  try {
    queryDatabase();
  } catch (lowLevelError) {
    // Gói lỗi cấp thấp vào bên trong lỗi cấp cao qua thuộc tính { cause }:
    throw new Error(`Không thể tìm nạp dữ liệu của người dùng ID ${userId}`, {
      cause: lowLevelError
    });
  }
}

try {
  getUserData(999);
} catch (highLevelError) {
  assert.strictEqual(highLevelError.message, "Không thể tìm nạp dữ liệu của người dùng ID 999");
  // @ts-ignore
  assert.strictEqual(highLevelError.cause instanceof Error, true);
  // @ts-ignore
  assert.strictEqual(highLevelError.cause.message, "Connection timed out at 192.168.1.100:5432");
  console.log("Thông điệp lỗi tầng cao:", highLevelError.message);
  // @ts-ignore
  console.log("Nguyên nhân gốc rễ (Root Cause):", highLevelError.cause.message);
}

console.log("-> Kiểm chứng Error Cause Chaining ES2022: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Error Statements đã vượt qua thành công! ");
console.log("==========================================");
