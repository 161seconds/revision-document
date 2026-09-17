/**
 * JavaScript Parameters, Arguments & Rest Demo
 * Thực nghiệm Default Parameters, Parameter TDZ, Rest vs arguments, và Safe Destructuring.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: THAM SỐ MẶC ĐỊNH VỚI UNDEFINED VS NULL VS 0 ===");
function connect(port = 8080) {
  return port;
}

assert.strictEqual(connect(), 8080);           // Không truyền -> Dùng default
assert.strictEqual(connect(undefined), 8080);  // undefined -> Kích hoạt default
assert.strictEqual(connect(null), null);       // null KHÔNG kích hoạt default!
assert.strictEqual(connect(0), 0);             // 0 KHÔNG kích hoạt default!
console.log("connect()         :", connect());
console.log("connect(undefined):", connect(undefined));
console.log("connect(null)     :", connect(null));
console.log("connect(0)        :", connect(0));
console.log("-> Kiểm chứng Default Parameters: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: TEMPORAL DEAD ZONE TRONG PARAMETER SCOPE ===");
// Tham số trước phụ thuộc tham số sau gây lỗi TDZ:
function faultyParams(a = b, b = 10) {
  return a + b;
}

assert.throws(() => {
  faultyParams();
}, ReferenceError);
console.log("faultyParams() ném ReferenceError do biến 'b' trong TDZ.");

// Tham số sau dùng giá trị tham số trước hoạt động hoàn hảo:
function validParams(w = 10, h = w * 2) {
  return { w, h };
}
const box = validParams(5);
assert.strictEqual(box.w, 5);
assert.strictEqual(box.h, 10);
console.log("validParams(5):", box);
console.log("-> Kiểm chứng Parameter Scope & TDZ: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: REST PARAMETERS (...REST) VS ĐỐI TƯỢNG ARGUMENTS ===");
function compareArgs(first, ...rest) {
  console.log("Array.isArray(rest)     :", Array.isArray(rest)); // true
  // eslint-disable-next-line prefer-rest-params
  console.log("Array.isArray(arguments):", Array.isArray(arguments)); // false

  assert.strictEqual(Array.isArray(rest), true);
  // eslint-disable-next-line prefer-rest-params
  assert.strictEqual(Array.isArray(arguments), false);

  // rest là mảng thực thụ, hỗ trợ map/reduce:
  const sumRest = rest.reduce((acc, curr) => acc + curr, 0);
  return { first, sumRest };
}

const calc = compareArgs("header", 1, 2, 3, 4);
assert.strictEqual(calc.first, "header");
assert.strictEqual(calc.sumRest, 10);
console.log("calc:", calc);
console.log("-> Kiểm chứng Rest Parameters: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: KỸ THUẬT SAFE PARAMETER DESTRUCTURING ===");
// Hàm nhận options object với fallback an toàn '= {}'
function configureServer({ host = "localhost", port = 3000, ssl = false } = {}) {
  return { host, port, ssl };
}

// Gọi không truyền tham số nào vẫn chạy mượt mà, không crash TypeError:
const defaultConf = configureServer();
assert.deepStrictEqual(defaultConf, { host: "localhost", port: 3000, ssl: false });

const customConf = configureServer({ port: 8080 });
assert.deepStrictEqual(customConf, { host: "localhost", port: 8080, ssl: false });
console.log("defaultConf:", defaultConf);
console.log("customConf :", customConf);
console.log("-> Kiểm chứng Safe Destructuring Fallback: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: PASS-BY-VALUE VS PASS-BY-SHARING (REFERENCE MUTATION) ===");
function modifyVariables(num, obj) {
  num = 999;           // Gán lại biến nguyên thủy (không ảnh hưởng ngoài)
  obj.mutated = true;  // Mutate thuộc tính của object (ẢNH HƯỞNG dữ liệu ngoài!)
}

let outerNum = 42;
const outerObj = { mutated: false };

modifyVariables(outerNum, outerObj);

assert.strictEqual(outerNum, 42, "Biến số nguyên thủy được bảo toàn!");
assert.strictEqual(outerObj.mutated, true, "Object bên ngoài bị thay đổi thuộc tính!");
console.log("outerNum sau khi truyền vào hàm:", outerNum);
console.log("outerObj sau khi truyền vào hàm:", outerObj);
console.log("-> Kiểm chứng Pass-by-Sharing: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra tham số & đối số đã vượt qua thành công! ");
console.log("==========================================");
