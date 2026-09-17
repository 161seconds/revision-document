/**
 * JavaScript Error & Debugging Master Reference Demo
 * Thực nghiệm Pipeline xử lý lỗi hoàn chỉnh: Parse -> Validate -> Process -> Error Cause Wrapping -> Response.
 */

"use strict";

const assert = require("assert");

// 1. Phân cấp lỗi nghiệp vụ:
class ApiError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message, options);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

class RequestValidationError extends ApiError {
  constructor(fields) {
    super(400, "Dữ liệu yêu cầu không hợp lệ!");
    this.fields = fields;
  }
}

class InternalServiceError extends ApiError {
  constructor(message, cause) {
    super(500, message, { cause });
  }
}

// 2. Hàm xử lý nghiệp vụ mẫu:
function processUserRegistration(rawJson) {
  let payload;
  // Bước 1: Parse JSON
  try {
    payload = JSON.parse(rawJson);
  } catch (err) {
    throw new RequestValidationError(["JSON payload sai định dạng"]);
  }

  // Bước 2: Validate dữ liệu
  const invalidFields = [];
  if (!payload.email || !payload.email.includes("@")) {
    invalidFields.push("email không hợp lệ");
  }
  if (!payload.age || payload.age < 18) {
    invalidFields.push("age phải từ 18 trở lên");
  }

  if (invalidFields.length > 0) {
    throw new RequestValidationError(invalidFields);
  }

  // Bước 3: Mô phỏng lưu DB lỗi
  try {
    if (payload.email === "crash@db.com") {
      throw new Error("Postgres connection lost (ECONNREFUSED)");
    }
    return { id: "USER_SUCCESS", email: payload.email };
  } catch (dbErr) {
    // Bọc lỗi gốc vào lỗi tầng cao bằng cause:
    throw new InternalServiceError("Không thể lưu tài khoản vào cơ sở dữ liệu", dbErr);
  }
}

// 3. Controller wrapper kiểm soát ngoại lệ tập trung:
function apiController(requestBody) {
  try {
    const result = processUserRegistration(requestBody);
    return { success: true, status: 200, data: result };
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        success: false,
        status: err.statusCode,
        error: err.message,
        details: err.fields ?? null,
        // @ts-ignore
        rootCause: err.cause ? err.cause.message : null
      };
    }
    // Bug hệ thống chưa dự liệu:
    return { success: false, status: 500, error: "Lỗi hệ thống không xác định!" };
  }
}

console.log("=== KIỂM CHỨNG KỊCH BẢN 1: THÀNH CÔNG (STATUS 200) ===");
const res1 = apiController(JSON.stringify({ email: "nam@test.com", age: 25 }));
assert.strictEqual(res1.status, 200);
assert.strictEqual(res1.success, true);
assert.strictEqual(res1.data.email, "nam@test.com");
console.log("-> Kịch bản 200 OK: Hoàn toàn chính xác!\n");

console.log("=== KIỂM CHỨNG KỊCH BẢN 2: LỖI CÚ PHÁP JSON (STATUS 400) ===");
const res2 = apiController("{ bad-json ");
assert.strictEqual(res2.status, 400);
assert.strictEqual(res2.success, false);
assert.deepStrictEqual(res2.details, ["JSON payload sai định dạng"]);
console.log("-> Kịch bản 400 Bad JSON: Hoàn toàn chính xác!\n");

console.log("=== KIỂM CHỨNG KỊCH BẢN 3: VALIDATION THẤT BẠI (STATUS 400) ===");
const res3 = apiController(JSON.stringify({ email: "invalid-mail", age: 15 }));
assert.strictEqual(res3.status, 400);
assert.strictEqual(res3.details.length, 2);
console.log("-> Kịch bản 400 Validation: Hoàn toàn chính xác!\n");

console.log("=== KIỂM CHỨNG KỊCH BẢN 4: LỖI DB VỚI ERROR CAUSE (STATUS 500) ===");
const res4 = apiController(JSON.stringify({ email: "crash@db.com", age: 20 }));
assert.strictEqual(res4.status, 500);
assert.strictEqual(res4.error, "Không thể lưu tài khoản vào cơ sở dữ liệu");
assert.strictEqual(res4.rootCause, "Postgres connection lost (ECONNREFUSED)");
console.log("-> Kịch bản 500 có Root Cause: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Error Reference đã vượt qua thành công! ");
console.log("==========================================");
