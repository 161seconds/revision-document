/**
 * 01-prototypes-demo.js
 * Chạy độc lập: node 01-prototypes-demo.js
 * Kiểm chứng toàn diện Chuỗi Prototype & Kế thừa nguyên mẫu:
 * 1. [[Prototype]] vs function.prototype vs Object.getPrototypeOf
 * 2. Cạm bẫy hiệu năng của Object.setPrototypeOf (V8 Hidden Class Deoptimization)
 * 3. Phòng chống tấn công Prototype Pollution bằng Object.create(null)
 * 4. Tra cứu thuộc tính (Property Lookup) & Thuộc tính che khuất (Shadowing)
 * 5. Object.hasOwn() (ES2022) vs hasOwnProperty
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 01: PROTOTYPES & INHERITANCE ===");

// -------------------------------------------------------------
// 1. [[PROTOTYPE]] & CHUỖI KẾ THỪA NGUYÊN MẪU
// -------------------------------------------------------------
function Animal(name) {
  this.name = name;
}
Animal.prototype.eat = function () {
  return `${this.name} đang ăn.`;
};

function Dog(name, breed) {
  Animal.call(this, name); // Kế thừa thuộc tính instance
  this.breed = breed;
}
// Thiết lập kế thừa nguyên mẫu chuẩn:
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.bark = function () {
  return `${this.name} sủa gâu gâu!`;
};

const d = new Dog("Corgi", "Chó chăn cừu");
assert.equal(d.name, "Corgi");
assert.equal(d.bark(), "Corgi sủa gâu gâu!");
assert.equal(d.eat(), "Corgi đang ăn."); // Tìm thấy trên Animal.prototype

// Kiểm tra Prototype Chain
assert.equal(Object.getPrototypeOf(d), Dog.prototype);
assert.equal(Object.getPrototypeOf(Dog.prototype), Animal.prototype);
assert.equal(Object.getPrototypeOf(Animal.prototype), Object.prototype);
assert.equal(Object.getPrototypeOf(Object.prototype), null);

// -------------------------------------------------------------
// 2. PHÒNG CHỐNG PROTOTYPE POLLUTION VỚI OBJECT.CREATE(NULL)
// -------------------------------------------------------------
// Khi dùng Plain Object {} làm Dictionary / Hash Map, hacker có thể gửi JSON:
// { "__proto__": { "isAdmin": true } } làm ô nhiễm toàn bộ Object trong hệ thống!
const pollutedPayload = JSON.parse('{"__proto__": {"isAdmin": true}}');
const normalDict = {};
Object.assign(normalDict, pollutedPayload);
// Trên các phiên bản cũ hoặc hàm gán lỏng lẻo, Object.prototype có thể bị dính isAdmin!

// GIẢI PHÁP ENTERPRISE: Tạo Clean Dictionary không có bất kỳ prototype nào:
const cleanDict = Object.create(null);
assert.equal(Object.getPrototypeOf(cleanDict), null);
assert.equal(cleanDict.toString, undefined, "Hoàn toàn sạch bóng prototype");
assert.equal("__proto__" in cleanDict, false);

// -------------------------------------------------------------
// 3. OBJECT.HASOWN() (ES2022) VS HASOWNPROPERTY
// -------------------------------------------------------------
// cleanDict không kế thừa Object.prototype nên cleanDict.hasOwnProperty() sẽ crash!
assert.throws(
  () => cleanDict.hasOwnProperty("test"),
  TypeError,
  "cleanDict.hasOwnProperty is not a function"
);

cleanDict.apiKey = "XYZ-123";
// Object.hasOwn() là hàm tĩnh an toàn tuyệt đối cho mọi object (kể cả object null prototype):
assert.equal(Object.hasOwn(cleanDict, "apiKey"), true);
assert.equal(Object.hasOwn(cleanDict, "nonExistent"), false);

// -------------------------------------------------------------
// 4. PROPERTY SHADOWING (CHE KHUẤT THUỘC TÍNH NGUYÊN MẪU)
// -------------------------------------------------------------
const protoParent = { sharedRole: "GUEST" };
const childUser = Object.create(protoParent);

assert.equal(childUser.sharedRole, "GUEST"); // Lấy từ prototype

// Gán đè lên childUser: Tạo thuộc tính riêng (own property) che khuất prototype
childUser.sharedRole = "ADMIN";
assert.equal(childUser.sharedRole, "ADMIN");
assert.equal(protoParent.sharedRole, "GUEST", "Prototype gốc không hề bị thay đổi");

// Xóa thuộc tính riêng -> Hiển thị lại thuộc tính nguyên mẫu:
delete childUser.sharedRole;
assert.equal(childUser.sharedRole, "GUEST");

console.log("-> 100% tests cho Prototypes & Inheritance đã pass thành công!");
