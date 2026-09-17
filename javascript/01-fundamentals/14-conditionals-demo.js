/**
 * JavaScript Conditionals, Switch & Branching Demo
 * Thực nghiệm Truthy/Falsy, Strict matching trong switch, bẫy block scope, và Object Lookup Table.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: KIỂM CHỨNG 8 GIÁ TRỊ FALSY & CÁC TRƯỜNG HỢP BẪY TRUTHY ===");
// 8 giá trị duy nhất ép kiểu sang false trong ToBoolean:
const falsyList = [false, 0, -0, 0n, "", null, undefined, NaN];
for (const val of falsyList) {
  assert.strictEqual(Boolean(val), false, `Giá trị phải là falsy: ${String(val)}`);
}
console.log("8 giá trị falsy chuẩn đã được xác nhận.");

// Các bẫy Truthy phổ biến:
assert.strictEqual(Boolean([]), true, "Mảng rỗng [] phải là Truthy");
assert.strictEqual(Boolean({}), true, "Object rỗng {} phải là Truthy");
assert.strictEqual(Boolean("0"), true, "Chuỗi '0' phải là Truthy");
assert.strictEqual(Boolean("false"), true, "Chuỗi 'false' phải là Truthy");
console.log("-> Kiểm chứng Truthy/Falsy: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: SWITCH DÙNG STRICT EQUALITY (===) ===");
function evaluateCode(code) {
  switch (code) {
    case 200:
      return "OK_NUMBER";
    case "200":
      return "OK_STRING";
    default:
      return "UNKNOWN";
  }
}

// Truyền vào chuỗi "200" sẽ không bao giờ khớp với case 200:
assert.strictEqual(evaluateCode(200), "OK_NUMBER");
assert.strictEqual(evaluateCode("200"), "OK_STRING");
console.log("evaluateCode(200)  :", evaluateCode(200));
console.log("evaluateCode('200'):", evaluateCode("200"));
console.log("-> Kiểm chứng Strict Equality trong Switch: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: BLOCK SCOPE TRONG THÂN CASE {} ===");
function handleAction(action, payload) {
  switch (action) {
    case "CREATE": {
      // Nhờ có {}, biến info chỉ tồn tại trong block này
      const info = `Created item with ID: ${payload.id}`;
      return info;
    }
    case "UPDATE": {
      // Không bị lỗi Identifier 'info' already declared!
      const info = `Updated item with ID: ${payload.id}`;
      return info;
    }
    default: {
      const info = "No-op";
      return info;
    }
  }
}

assert.strictEqual(handleAction("CREATE", { id: 101 }), "Created item with ID: 101");
assert.strictEqual(handleAction("UPDATE", { id: 101 }), "Updated item with ID: 101");
console.log("-> Kiểm chứng Block Scope trong Switch Case: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: CƠ CHẾ GOM NHÁNH BẰNG FALLTHROUGH CỐ Ý ===");
function getDayType(day) {
  switch (day) {
    case "Monday":
    case "Tuesday":
    case "Wednesday":
    case "Thursday":
    case "Friday":
      return "Weekday";
    case "Saturday":
    case "Sunday":
      return "Weekend";
    default:
      return "Invalid";
  }
}

assert.strictEqual(getDayType("Monday"), "Weekday");
assert.strictEqual(getDayType("Friday"), "Weekday");
assert.strictEqual(getDayType("Sunday"), "Weekend");
console.log("-> Kiểm chứng Intentional Fallthrough: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: MẪU THIẾT KẾ THAY THẾ SWITCH BẰNG LOOKUP TABLE ===");
// Thay vì viết switch dài dòng, sử dụng Object/Map Lookup Table (Clean Code & O(1)):
const HTTP_STATUS_HANDLERS = {
  200: () => "Thành công",
  400: () => "Yêu cầu không hợp lệ",
  401: () => "Chưa xác thực",
  403: () => "Bị cấm truy cập",
  404: () => "Không tìm thấy tài nguyên",
  500: () => "Lỗi máy chủ nội bộ",
};

function getStatusMessage(statusCode) {
  const handler = HTTP_STATUS_HANDLERS[statusCode];
  return handler ? handler() : "Mã trạng thái không rõ";
}

assert.strictEqual(getStatusMessage(200), "Thành công");
assert.strictEqual(getStatusMessage(404), "Không tìm thấy tài nguyên");
assert.strictEqual(getStatusMessage(999), "Mã trạng thái không rõ");
console.log("getStatusMessage(200):", getStatusMessage(200));
console.log("getStatusMessage(404):", getStatusMessage(404));
console.log("-> Kiểm chứng Lookup Table Pattern: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra rẽ nhánh đã vượt qua thành công! ");
console.log("==========================================");
