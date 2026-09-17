/**
 * Bài Tập Thực Hành Module 04: Xử Lý Lỗi & Gỡ Lỗi (Error Handling & Debugging)
 * Bộ kiểm tra tự động đánh giá năng lực xử lý ngoại lệ, phòng thủ lỗi im lặng,
 * và kỹ thuật Error Cause Chaining chuẩn Enterprise.
 */

"use strict";

const assert = require("assert");

console.log("=== BẮT ĐẦU KIỂM TRA BÀI TẬP 04-ERROR-HANDLING-AND-DEBUGGING ===\n");

// ------------------------------------------------------------
// BÀI TẬP 1: Safe JSON Parser (Phòng thủ lỗi cú pháp)
// Không làm sập chương trình khi chuỗi JSON sai, trả về fallback an toàn
// ------------------------------------------------------------
function safeJsonParse(jsonString, fallbackValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallbackValue;
  }
}

assert.deepStrictEqual(safeJsonParse('{"ok": true}'), { ok: true });
assert.strictEqual(safeJsonParse('{ corrupt }', "DEFAULT"), "DEFAULT");
assert.strictEqual(safeJsonParse("", null), null);
console.log("✅ Bài 1 passed: Hàm safeJsonParse() phòng thủ cú pháp thành công!");

// ------------------------------------------------------------
// BÀI TẬP 2: Chuẩn Hóa Ngoại Lệ (Error Normalizer)
// Chuyển đổi mọi giá trị bị ném ra (Error, string, null, number) thành đối tượng Error chuẩn có stack trace
// ------------------------------------------------------------
function normalizeError(thrownValue) {
  if (thrownValue instanceof Error) {
    return thrownValue;
  }
  if (typeof thrownValue === "string") {
    return new Error(thrownValue);
  }
  if (thrownValue && typeof thrownValue === "object" && "message" in thrownValue) {
    // @ts-ignore
    return new Error(String(thrownValue.message));
  }
  return new Error(`Ngoại lệ không xác định: ${String(thrownValue)}`);
}

const errFromObj = normalizeError(new TypeError("Lỗi kiểu"));
assert.strictEqual(errFromObj instanceof TypeError, true);

const errFromString = normalizeError("Lỗi kết nối server");
assert.strictEqual(errFromString instanceof Error, true);
assert.strictEqual(errFromString.message, "Lỗi kết nối server");
assert.strictEqual(typeof errFromString.stack, "string");

const errFromPrimitive = normalizeError(404);
assert.strictEqual(errFromPrimitive.message, "Ngoại lệ không xác định: 404");
console.log("✅ Bài 2 passed: Chuẩn hóa ngoại lệ normalizeError() thành công!");

// ------------------------------------------------------------
// BÀI TẬP 3: Cơ Chế Thử Lại (Retry Mechanism Có Giới Hạn)
// Thực hiện lại tác vụ thất bại tối đa N lần trước khi bọc lỗi và ném ra ngoài
// ------------------------------------------------------------
function executeWithRetry(operation, maxAttempts) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return operation(attempt);
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`Thao tác thất bại sau ${maxAttempts} lần thử lại!`, {
    cause: lastError
  });
}

// 1. Thử thành công ở lần thứ 3:
let attemptsCount = 0;
const successResult = executeWithRetry((attempt) => {
  attemptsCount++;
  if (attempt < 3) {
    throw new Error(`Thất bại lần ${attempt}`);
  }
  return "SUCCESS_DATA";
}, 5);

assert.strictEqual(successResult, "SUCCESS_DATA");
assert.strictEqual(attemptsCount, 3);

// 2. Thử thất bại toàn bộ -> ném lỗi bọc cause:
assert.throws(() => {
  executeWithRetry(() => {
    throw new Error("Lỗi mạng cố hữu");
  }, 3);
}, (err) => {
  assert.strictEqual(err.message, "Thao tác thất bại sau 3 lần thử lại!");
  // @ts-ignore
  assert.strictEqual(err.cause.message, "Lỗi mạng cố hữu");
  return true;
});

console.log("✅ Bài 3 passed: Cơ chế thử lại executeWithRetry() thành công!");

// ------------------------------------------------------------
// BÀI TẬP 4: Bảo Vệ Dữ Liệu Số & Chặn Đứng NaN (Safe Math Calculator)
// Tính toán số học phòng thủ, không để lọt NaN hay Infinity
// ------------------------------------------------------------
function safeDivide(numerator, denominator, fallback = 0) {
  const num = Number(numerator);
  const den = Number(denominator);

  if (Number.isNaN(num) || Number.isNaN(den) || den === 0) {
    return fallback;
  }
  const result = num / den;
  return Number.isFinite(result) ? result : fallback;
}

assert.strictEqual(safeDivide(10, 2), 5);
assert.strictEqual(safeDivide(10, 0, -1), -1); // Không cho phép ra Infinity
assert.strictEqual(safeDivide("abc", 5, 0), 0); // Không cho phép ra NaN
assert.strictEqual(safeDivide(null, 5, 0), 0);
console.log("✅ Bài 4 passed: Phép chia phòng thủ safeDivide() triệt tiêu NaN & Infinity!");

// ------------------------------------------------------------
// BÀI TẬP 5: Bộ Phân Loại Lỗi HTTP Nghiệp Vụ
// Tự động phân loại mã trạng thái HTTP dựa trên loại lỗi
// ------------------------------------------------------------
class DomainValidationError extends Error {}
class ResourceNotFoundError extends Error {}
class SecurityForbiddenError extends Error {}

function mapErrorToHttpStatus(err) {
  if (err instanceof DomainValidationError) return 400;
  if (err instanceof SecurityForbiddenError) return 403;
  if (err instanceof ResourceNotFoundError) return 404;
  return 500;
}

assert.strictEqual(mapErrorToHttpStatus(new DomainValidationError()), 400);
assert.strictEqual(mapErrorToHttpStatus(new SecurityForbiddenError()), 403);
assert.strictEqual(mapErrorToHttpStatus(new ResourceNotFoundError()), 404);
assert.strictEqual(mapErrorToHttpStatus(new TypeError()), 500);
console.log("✅ Bài 5 passed: Phân loại lỗi mapErrorToHttpStatus() thành công!");

console.log("\n🎉 CHÚC MỪNG! BẠN ĐÃ VƯỢT QUA TOÀN BỘ BÀI TẬP 04-ERROR-HANDLING-AND-DEBUGGING!");
