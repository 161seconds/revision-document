/**
 * JavaScript Custom Error Objects & Hierarchy Demo
 * Thực nghiệm cấu trúc của Error object, phân cấp lớp lỗi tùy biến,
 * kiểm chứng instanceof, làm sạch stack trace, và xử lý bẫy JSON.stringify({}).
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: CẤU TRÚC THUỘC TÍNH NGUYÊN BẢN CỦA ERROR ===");
const baseErr = new Error("Thông điệp lỗi mẫu");

assert.strictEqual(baseErr.name, "Error");
assert.strictEqual(baseErr.message, "Thông điệp lỗi mẫu");
assert.strictEqual(typeof baseErr.stack, "string");
assert.strictEqual(baseErr.stack.includes("Error: Thông điệp lỗi mẫu"), true);

console.log("Error Name:", baseErr.name);
console.log("Error Message:", baseErr.message);
console.log("-> Kiểm chứng thuộc tính cơ bản của Error: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: CẠM BẪY JSON.STRINGIFY() TRẢ VỀ CHUỖI RỖNG {} ===");
// Bẫy: name và message là Non-enumerable nên JSON.stringify bỏ qua:
const serializedRaw = JSON.stringify(baseErr);
assert.strictEqual(serializedRaw, "{}");
console.log("JSON.stringify(baseErr) bị rỗng hoàn toàn:", serializedRaw);

// Kiểm chứng Property Descriptor:
const messageDescriptor = Object.getOwnPropertyDescriptor(baseErr, "message");
// @ts-ignore
assert.strictEqual(messageDescriptor.enumerable, false);
console.log("-> Kiểm chứng cạm bẫy enumerable: false: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: XÂY DỰNG PHÂN CẤP LỖI NGHIỆP VỤ (ENTERPRISE HIERARCHY) ===");

class ApplicationError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();

    // V8 API loại bỏ constructor khỏi dấu vết stack:
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Khắc phục triệt để bẫy JSON.stringify():
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp
    };
  }
}

class HttpError extends ApplicationError {
  constructor(statusCode, message, options = {}) {
    super(message, options);
    this.statusCode = statusCode;
    this.isOperational = true;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      isOperational: this.isOperational
    };
  }
}

class NotFoundError extends HttpError {
  constructor(resourceName, id) {
    super(404, `Không tìm thấy tài nguyên '${resourceName}' với ID: ${id}`);
    this.resourceName = resourceName;
    this.resourceId = id;
  }
}

class ValidationError extends HttpError {
  constructor(message, validationErrors = []) {
    super(400, message);
    this.validationErrors = validationErrors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      validationErrors: this.validationErrors
    };
  }
}

// 1. Kiểm chứng NotFoundError:
const notFound = new NotFoundError("Product", "SKU-999");
assert.strictEqual(notFound instanceof Error, true);
assert.strictEqual(notFound instanceof ApplicationError, true);
assert.strictEqual(notFound instanceof HttpError, true);
assert.strictEqual(notFound instanceof NotFoundError, true);
assert.strictEqual(notFound.statusCode, 404);
assert.strictEqual(notFound.name, "NotFoundError");

// 2. Kiểm chứng Serialization có toJSON():
const parsedJson = JSON.parse(JSON.stringify(notFound));
assert.strictEqual(parsedJson.name, "NotFoundError");
assert.strictEqual(parsedJson.statusCode, 404);
assert.strictEqual(parsedJson.isOperational, true);
assert.strictEqual(typeof parsedJson.timestamp, "string");
console.log("JSON đã tuần tự hóa hoàn hảo:", parsedJson);

// 3. Kiểm chứng ValidationError:
const validation = new ValidationError("Dữ liệu gửi lên không hợp lệ!", [
  { field: "email", reason: "Email sai định dạng" },
  { field: "age", reason: "Tuổi phải >= 18" }
]);

assert.strictEqual(validation.statusCode, 400);
assert.strictEqual(validation.validationErrors.length, 2);
console.log("-> Phân cấp lỗi nghiệp vụ & toJSON(): Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Custom Errors đã vượt qua thành công! ");
console.log("==========================================");
